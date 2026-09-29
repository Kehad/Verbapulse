import asyncio
import base64
import json
import os
import time
import math
import struct
from typing import Optional
from dotenv import load_dotenv
from fastapi import WebSocket, WebSocketDisconnect

from app.core.config import settings
from app.services.assemblyai_tts import generate_llm_reply, generate_fallback_pcm, pcm_to_wav, generate_voice_agent_audio
from app.services.test_simulator import call_llm
from app.services.assemblyai_stt import LiveTranscriptionSession

load_dotenv()

ASSEMBLYAI_API_KEY = getattr(settings, "assemblyai_api_key", None) or os.getenv("ASSEMBLYAI_API_KEY", "")


def calculate_pcm16_rms(pcm_bytes: bytes) -> float:
    """Calculates Normalized Root Mean Square (RMS) volume level (0.0 to 100.0) from raw PCM16 mono bytes."""
    if not pcm_bytes or len(pcm_bytes) < 2:
        return 0.0
    count = len(pcm_bytes) // 2
    try:
        shorts = struct.unpack(f"<{count}h", pcm_bytes[: count * 2])
        sum_squares = sum(s * s for s in shorts)
        rms = math.sqrt(sum_squares / count)
        # Scale to 0 - 100 range
        return min(100.0, (rms / 32768.0) * 400.0)
    except Exception:
        return 0.0


async def voice_conversation_endpoint(websocket: WebSocket) -> None:
    """
    Low-latency full-duplex WebSocket endpoint for two-way conversational voice AI:
    1. Connect: Client establishes persistent WebSocket connection (`/ws/voice-conversation`).
    2. Speak: Client streams 16kHz mono PCM16 mic chunks -> Backend tracks input amplitude and accumulates transcript.
    3. Turn-Taking: VAD detects silence (>500ms threshold) or client sends `vad_turn_end` -> triggers `thinking` & LLM generation.
    4. Listen: Audio chunks stream back over WebSocket continuously with synthetic voice (`speaking`).
    5. Interrupt (Barge-In): If user speaks during AI playback or sends `interrupt`, playback cancels immediately & session resets to `listening`.
    """
    await websocket.accept()

    # Session State Variables
    session_id = websocket.query_params.get("session_id", f"voice_{int(time.time())}")
    status = "listening"  # listening | thinking | speaking | interrupted
    
    stt_session: Optional[LiveTranscriptionSession] = None
    stt_initializing = False
    user_transcript_buffer = []
    current_ai_task: Optional[asyncio.Task] = None
    interrupt_event = asyncio.Event()

    # Audio energy / VAD tracking
    last_speech_time = time.time()
    last_audio_frame_time = time.time()
    has_spoken_in_turn = False
    vad_silence_threshold_ms = 500.0  # 500ms silence threshold

    # Confirm session startup
    await websocket.send_json({
        "type": "session_started",
        "session_id": session_id,
        "status": status,
        "stt_engine": "AssemblyAI Realtime STT",
        "vad_silence_threshold_ms": vad_silence_threshold_ms
    })

    async def cancel_current_synthesis():
        nonlocal current_ai_task, status
        interrupt_event.set()
        if current_ai_task and not current_ai_task.done():
            current_ai_task.cancel()
            try:
                await current_ai_task
            except (asyncio.CancelledError, Exception):
                pass
        current_ai_task = None
        status = "listening"
        await websocket.send_json({
            "type": "interrupted_ack",
            "message": "AI voice synthesis cancelled by user barge-in."
        })
        await websocket.send_json({
            "type": "status_change",
            "status": "listening"
        })

    async def generate_and_stream_ai_response(prompt_text: str):
        nonlocal status, current_ai_task
        interrupt_event.clear()
        
        status = "thinking"
        await websocket.send_json({
            "type": "status_change",
            "status": "thinking"
        })

        start_time = time.time()
        
        # System instructions for concise, conversational voice turns
        sys_prompt = (
            "You are VivaGuard Voice Copilot, an attentive, intelligent voice assistant. "
            "Respond naturally, warmly, and concisely in 1 to 2 short conversational sentences. "
            "Do NOT output markdown formatting, bullet points, or special code syntax."
        )

        try:
            # 1. LLM Generation
            ai_reply = await generate_llm_reply(prompt_text, system_prompt=sys_prompt)
            if interrupt_event.is_set():
                return

            if not ai_reply or not ai_reply.strip():
                ai_reply = "I heard you clearly. How else can I assist you with VivaGuard system security today?"

            ai_text = ai_reply.strip()
            llm_latency_ms = int((time.time() - start_time) * 1000)

            # Broadcast AI text transcript to client
            await websocket.send_json({
                "type": "transcript_ai",
                "text": ai_text,
                "is_final": True,
                "latency_ms": llm_latency_ms
            })

            # 2. Audio Synthesis & Streaming
            status = "speaking"
            await websocket.send_json({
                "type": "status_change",
                "status": "speaking"
            })

            # Generate high-quality voice audio frames (ElevenLabs / Voice Agent)
            sample_rate = 24000
            audio_bytes, duration_sec, audio_fmt = await generate_voice_agent_audio(ai_text, sample_rate=sample_rate)
            audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

            await websocket.send_json({
                "type": "audio_chunk",
                "audio_b64": audio_b64,
                "chunk_index": 0,
                "total_chunks": 1,
                "sample_rate": sample_rate,
                "text": ai_text
            })

            if not interrupt_event.is_set():
                await websocket.send_json({
                    "type": "audio_stream_complete",
                    "duration_sec": duration_sec
                })

            elapsed = time.time() - start_time
            remaining_duration = duration_sec - elapsed
            if remaining_duration > 0 and not interrupt_event.is_set():
                await asyncio.sleep(remaining_duration + 0.2)  # Extra 200ms buffer

        except asyncio.CancelledError:
            print("[VoiceAI] AI response generation task cancelled.")
        except Exception as err:
            print(f"[VoiceAI Error] {err}")
            await websocket.send_json({
                "type": "error",
                "message": f"AI response generation error: {str(err)}"
            })
        finally:
            if not interrupt_event.is_set():
                status = "listening"
                await websocket.send_json({
                    "type": "status_change",
                    "status": "listening"
                })

    try:
        while True:
            msg = await websocket.receive()

            if msg.get("type") == "websocket.disconnect":
                break

            # Handle Binary PCM audio chunks from client microphone
            if "bytes" in msg and msg["bytes"]:
                pcm_data = msg["bytes"]
                rms_volume = calculate_pcm16_rms(pcm_data)
                now = time.time()

                # Echo audio amplitude back to client for real-time visual feedback
                await websocket.send_json({
                    "type": "audio_amplitude",
                    "level": round(rms_volume, 1)
                })

                # Check if user is interrupting AI speaking state
                if status == "speaking" and rms_volume > 25.0:
                    print(f"[Barge-In] User voice detected (RMS {rms_volume:.1f}) while AI is speaking! Interrupting...")
                    await cancel_current_synthesis()
                    
                if status == "listening":
                    if stt_session is None and not stt_initializing:
                        stt_initializing = True
                        try:
                            new_session = LiveTranscriptionSession(sample_rate=16000)
                            await asyncio.to_thread(new_session.start)
                            stt_session = new_session
                        except Exception as e:
                            print(f"[VoiceAI] Failed to start AssemblyAI STT: {e}")
                        finally:
                            stt_initializing = False
                    
                    if stt_session is not None:
                        try:
                            stt_session.feed(pcm_data)
                        except Exception as e:
                            pass

            # Handle Text / Control JSON frames
            elif "text" in msg and msg["text"]:
                raw_text = msg["text"]
                try:
                    payload = json.loads(raw_text)
                    p_type = payload.get("type")

                    if p_type == "interrupt" or p_type == "barge_in":
                        print("[VoiceAI] Received explicit user interrupt signal.")
                        await cancel_current_synthesis()

                    elif p_type == "vad_turn_end" or p_type == "silence_detected":
                        # Client-side VAD silence trigger (> 500 ms)
                        if status == "speaking":
                            await cancel_current_synthesis()

                        accumulated_text = ""
                        if stt_session is not None:
                            # Grab whatever we have instantly to avoid blocking 10 seconds on disconnect
                            accumulated_text = " ".join(stt_session._final_turns).strip()
                            if not accumulated_text:
                                accumulated_text = stt_session._latest_partial.strip()
                                
                            # Fire and forget the disconnect so it doesn't block websocket loop
                            def _bg_close(sess):
                                try:
                                    sess.finish()
                                except Exception:
                                    pass
                            asyncio.create_task(asyncio.to_thread(_bg_close, stt_session))
                            stt_session = None

                        if accumulated_text:
                            await websocket.send_json({
                                "type": "transcript_user",
                                "text": accumulated_text,
                                "is_final": True
                            })

                        text_prompt = accumulated_text or payload.get("transcript") or " ".join(user_transcript_buffer).strip()
                        if not text_prompt:
                            text_prompt = "Hello VivaGuard AI, can you hear me?"

                        user_transcript_buffer.clear()

                        if current_ai_task and not current_ai_task.done():
                            current_ai_task.cancel()

                        current_ai_task = asyncio.create_task(
                            generate_and_stream_ai_response(text_prompt)
                        )

                    elif p_type == "user_transcript" or p_type == "transcript":
                        txt = payload.get("text", "").strip()
                        if txt:
                            user_transcript_buffer.append(txt)
                            await websocket.send_json({
                                "type": "transcript_user",
                                "text": txt,
                                "is_final": payload.get("is_final", True)
                            })

                    elif p_type == "text_prompt":
                        # Direct text message turn
                        txt = payload.get("text", "").strip()
                        if txt:
                            if status == "speaking":
                                await cancel_current_synthesis()
                            current_ai_task = asyncio.create_task(
                                generate_and_stream_ai_response(txt)
                            )

                except json.JSONDecodeError:
                    # Raw string text prompt fallback
                    if raw_text.strip():
                        if status == "speaking":
                            await cancel_current_synthesis()
                        current_ai_task = asyncio.create_task(
                            generate_and_stream_ai_response(raw_text.strip())
                        )

    except WebSocketDisconnect:
        print("[VoiceAI] Client disconnected from voice conversation session.")
    except Exception as e:
        print(f"[VoiceAI Unexpected Error] {e}")
    finally:
        if current_ai_task and not current_ai_task.done():
            current_ai_task.cancel()
        if stt_session is not None:
            def _bg_close(sess):
                try:
                    sess.finish()
                except Exception:
                    pass
            asyncio.create_task(asyncio.to_thread(_bg_close, stt_session))
