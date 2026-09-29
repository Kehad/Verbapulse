import { useState, useEffect, useRef, useCallback } from 'react';
import { getWsUrl } from '@/lib/config';

export type VoiceSessionStatus =
  | 'disconnected'
  | 'connecting'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'interrupted';

export interface TurnMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
  latencyMs?: number;
}

export interface UseVoiceConversationProps {
  backendWsUrl?: string;
  vadSilenceThresholdMs?: number;
}

export function useVoiceConversation({
  backendWsUrl = getWsUrl('/ws/voice-conversation'),
  vadSilenceThresholdMs = 500
}: UseVoiceConversationProps = {}) {
  const [status, setStatus] = useState<VoiceSessionStatus>('disconnected');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [aiAudioLevel, setAiAudioLevel] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [sessionTime, setSessionTime] = useState<number>(0);
  const [latencyMs, setLatencyMs] = useState<number>(115);
  const [vadSilenceMs, setVadSilenceMs] = useState<number>(0);

  const [userTranscript, setUserTranscript] = useState<string>('');
  const [aiTranscript, setAiTranscript] = useState<string>('');
  const [transcriptHistory, setTranscriptHistory] = useState<TurnMessage[]>([]);

  // Audio Context & WebSocket refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const vadIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const thinkingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Playback queue & Active audio nodes for Barge-In
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlaybackTimeRef = useRef<number>(0);
  const isPlayingAiAudioRef = useRef<boolean>(false);
  const pendingListeningRef = useRef<boolean>(false);

  // Speech recognition & VAD refs
  const recognitionRef = useRef<any>(null);
  const lastUserSpeechTimeRef = useRef<number>(Date.now());
  const isUserSpeakingInTurnRef = useRef<boolean>(false);
  const isMutedRef = useRef<boolean>(false);
  isMutedRef.current = isMuted;

  const statusRef = useRef<VoiceSessionStatus>('disconnected');
  statusRef.current = status;

  // Stop active synthetic audio playback immediately (Barge-In)
  const stopActiveAudioPlayback = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      activeSourcesRef.current.forEach((src) => {
        try {
          src.stop(0);
          src.disconnect();
        } catch (_) {}
      });
      activeSourcesRef.current = [];
      nextPlaybackTimeRef.current = 0;
      isPlayingAiAudioRef.current = false;
      pendingListeningRef.current = false;
      setAiAudioLevel(0);
    } catch (err) {
      console.warn('Playback stop error:', err);
    }
  }, []);

  // Trigger manual or automatic speech barge-in
  const triggerInterrupt = useCallback(() => {
    stopActiveAudioPlayback();

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'interrupt',
          reason: 'user_speech_barge_in'
        })
      );
    }

    setStatus('interrupted');
    setTimeout(() => {
      if (statusRef.current === 'interrupted') {
        setStatus('listening');
      }
    }, 400);
  }, [stopActiveAudioPlayback]);

  // Manually end voice turn (no automatic silence detection)
  const finishVoiceTurn = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && statusRef.current === 'listening') {
      isUserSpeakingInTurnRef.current = false;
      wsRef.current.send(
        JSON.stringify({
          type: 'vad_turn_end',
          silence_ms: 0
        })
      );
      setStatus('thinking');
    }
  }, []);

  // Send text message directly to backend
  const sendTextPrompt = useCallback((text: string) => {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();

    if (statusRef.current === 'speaking') {
      stopActiveAudioPlayback();
    }

    setTranscriptHistory((hist) => [
      ...hist,
      {
        id: `usr_${Date.now()}`,
        role: 'user',
        text: cleanText,
        timestamp: Date.now()
      }
    ]);

    setUserTranscript('');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'text_prompt',
          text: cleanText
        })
      );
      setStatus('thinking');
    }
  }, [stopActiveAudioPlayback]);

  // Decode and queue incoming synthetic audio chunk
  const playAudioChunk = useCallback(
    async (base64Wav: string) => {
      try {
        if (!audioContextRef.current) {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          audioContextRef.current = new AudioCtx();
        }

        const audioCtx = audioContextRef.current;
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        // Convert base64 to ArrayBuffer
        const binaryStr = atob(base64Wav);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        const audioBuffer = await audioCtx.decodeAudioData(bytes.buffer);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;

        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 1.8;

        source.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        const now = audioCtx.currentTime;
        const startTime = Math.max(now, nextPlaybackTimeRef.current);
        source.start(startTime);
        nextPlaybackTimeRef.current = startTime + audioBuffer.duration;

        activeSourcesRef.current.push(source);
        isPlayingAiAudioRef.current = true;

        // Visualizer level calculation during AI speech
        setAiAudioLevel(85);
        source.onended = () => {
          activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
          if (activeSourcesRef.current.length === 0) {
            isPlayingAiAudioRef.current = false;
            setAiAudioLevel(0);
            if (pendingListeningRef.current) {
              pendingListeningRef.current = false;
              setStatus('listening');
            }
          }
        };
      } catch (err) {
        console.error('Audio chunk decode/playback error:', err);
      }
    },
    []
  );

  // Initialize Speech Recognition fallback for transcript UI
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalStr = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalStr += trans + ' ';
          } else {
            interim += trans;
          }
        }

        if (finalStr.trim()) {
          const clean = finalStr.trim();
          setUserTranscript((prev) => (prev ? `${prev} ${clean}` : clean));
          lastUserSpeechTimeRef.current = Date.now();
          isUserSpeakingInTurnRef.current = true;

          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: 'user_transcript',
                text: clean,
                is_final: true
              })
            );
          }
        } else if (interim.trim()) {
          lastUserSpeechTimeRef.current = Date.now();
          isUserSpeakingInTurnRef.current = true;
        }
      };

      recognition.onerror = () => {};
      recognition.onend = () => {
        if (statusRef.current !== 'disconnected' && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (_) {}
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition init warning:', err);
    }
  }, []);

  // Start Full-Duplex Voice Conversation Session
  const startConversation = useCallback(async () => {
    try {
      setStatus('connecting');
      setSessionTime(0);
      setUserTranscript('');
      setAiTranscript('');
      setTranscriptHistory([]);
      setVadSilenceMs(0);

      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: { ideal: 16000 },
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      // 2. Setup Mic Volume Metering & Analyser (ALWAYS OUTSIDE worklet try block)
      const sourceNode = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      sourceNode.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateMicVolume = () => {
        if (!mediaStreamRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));

        if (!isMutedRef.current) {
          setAudioLevel(normalized);

          // User speech detection for VAD (only active during listening state)
          if (normalized > 18 && statusRef.current === 'listening') {
            lastUserSpeechTimeRef.current = Date.now();
            isUserSpeakingInTurnRef.current = true;
          }
        } else {
          setAudioLevel(0);
        }

        if (statusRef.current !== 'disconnected') {
          requestAnimationFrame(updateMicVolume);
        }
      };

      requestAnimationFrame(updateMicVolume);

      // 3. Audio Streaming (AudioWorklet with ScriptProcessor fallback)
      let audioNodeSuccess = false;
      try {
        await audioCtx.audioWorklet.addModule('/audio-processor.js');
        const workletNode = new AudioWorkletNode(audioCtx, 'audio-processor');
        workletNodeRef.current = workletNode;
        sourceNode.connect(workletNode);

        workletNode.port.onmessage = (event) => {
          const pcmBuffer = event.data;
          if (
            wsRef.current &&
            wsRef.current.readyState === WebSocket.OPEN &&
            !isMutedRef.current &&
            statusRef.current === 'listening'
          ) {
            wsRef.current.send(pcmBuffer);
          }
        };
        audioNodeSuccess = true;
      } catch (err) {
        console.warn('AudioWorklet module unavailable, using ScriptProcessor fallback:', err);
      }

      if (!audioNodeSuccess) {
        // ScriptProcessorNode Fallback (4096 buffer size)
        const scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
        workletNodeRef.current = scriptNode;
        sourceNode.connect(scriptNode);
        scriptNode.connect(audioCtx.destination);

        scriptNode.onaudioprocess = (audioProcessingEvent) => {
          if (
            !wsRef.current ||
            wsRef.current.readyState !== WebSocket.OPEN ||
            isMutedRef.current ||
            statusRef.current !== 'listening'
          ) {
            return;
          }

          const inputBuffer = audioProcessingEvent.inputBuffer;
          const inputData = inputBuffer.getChannelData(0);
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcm16[i] = s < 0 ? Math.round(s * 32768) : Math.round(s * 32767);
          }
          wsRef.current.send(pcm16.buffer);
        };
      }

      // 4. Connect to Backend WebSocket Endpoint
      const ws = new WebSocket(backendWsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('listening');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'status_change') {
            const nextStatus: VoiceSessionStatus = data.status;

            if (nextStatus === 'listening') {
              // Ensure synthetic voice output has finished playing loud before enabling recording again
              const isSpeakingAudio =
                activeSourcesRef.current.length > 0 ||
                isPlayingAiAudioRef.current ||
                (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking);

              if (isSpeakingAudio) {
                pendingListeningRef.current = true;
              } else {
                pendingListeningRef.current = false;
                setStatus('listening');
              }
            } else {
              pendingListeningRef.current = false;
              setStatus(nextStatus);
            }

            if (nextStatus === 'thinking') {
              // Set a safety reset timeout for thinking state (8s max)
              if (thinkingTimeoutRef.current) clearTimeout(thinkingTimeoutRef.current);
              thinkingTimeoutRef.current = setTimeout(() => {
                if (statusRef.current === 'thinking') {
                  setStatus('listening');
                }
              }, 8000);

              // Flush current user transcript into turn history
              setUserTranscript((prev) => {
                if (prev.trim()) {
                  const textToAdd = prev.trim();
                  setTranscriptHistory((hist) => {
                    const lastMsg = hist[hist.length - 1];
                    if (lastMsg && lastMsg.role === 'user' && lastMsg.text === textToAdd) {
                      return hist;
                    }
                    return [
                      ...hist,
                      {
                        id: `usr_${Date.now()}`,
                        role: 'user',
                        text: textToAdd,
                        timestamp: Date.now()
                      }
                    ];
                  });
                }
                return '';
              });
            } else if (nextStatus === 'speaking' || nextStatus === 'listening') {
              if (thinkingTimeoutRef.current) {
                clearTimeout(thinkingTimeoutRef.current);
                thinkingTimeoutRef.current = null;
              }
            }
          } else if (data.type === 'transcript_user') {
            if (data.text) {
              const userText = data.text.trim();
              setUserTranscript(userText);
              lastUserSpeechTimeRef.current = Date.now();
              isUserSpeakingInTurnRef.current = true;

              if (data.is_final) {
                setTranscriptHistory((hist) => {
                  const lastMsg = hist[hist.length - 1];
                  if (lastMsg && lastMsg.role === 'user' && lastMsg.text === userText) {
                    return hist;
                  }
                  return [
                    ...hist,
                    {
                      id: `usr_${Date.now()}`,
                      role: 'user',
                      text: userText,
                      timestamp: Date.now()
                    }
                  ];
                });
                setUserTranscript('');
              }
            }
          } else if (data.type === 'transcript_ai') {
            if (data.text) {
              const aiText = data.text;
              setAiTranscript(aiText);
              setLatencyMs(data.latency_ms || 120);

              setTranscriptHistory((hist) => [
                ...hist,
                {
                  id: `ai_${Date.now()}`,
                  role: 'ai',
                  text: aiText,
                  timestamp: Date.now(),
                  latencyMs: data.latency_ms || 120
                }
              ]);
            }
          } else if (data.type === 'audio_chunk') {
            if (data.audio_b64) {
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              playAudioChunk(data.audio_b64);
            }
          } else if (data.type === 'interrupted_ack') {
            stopActiveAudioPlayback();
            setStatus('listening');
          } else if (data.type === 'audio_amplitude') {
            if (data.level && !isMutedRef.current) {
              setAudioLevel((prev) => Math.max(prev, Math.round(data.level)));
            }
          }
        } catch (e) {
          console.error('WebSocket JSON parse error:', e);
        }
      };

      ws.onerror = (e) => {
        console.warn('Voice conversation WebSocket warning:', e);
      };

      ws.onclose = () => {
        if (statusRef.current !== 'disconnected') {
          setStatus('disconnected');
        }
      };

      // 5. Speech recognition disabled (Using AssemblyAI Backend Realtime STT)

      // 6. Timer interval
      timerIntervalRef.current = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Voice conversation session error:', err);
      setStatus('disconnected');
      alert('Microphone permissions are required for Voice Conversation.');
    }
  }, [
    backendWsUrl,
    vadSilenceThresholdMs,
    initSpeechRecognition,
    playAudioChunk,
    stopActiveAudioPlayback,
    triggerInterrupt
  ]);

  // Stop Full-Duplex Voice Conversation Session
  const stopConversation = useCallback(() => {
    setStatus('disconnected');

    stopActiveAudioPlayback();

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }

    if (thinkingTimeoutRef.current) {
      clearTimeout(thinkingTimeoutRef.current);
      thinkingTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }

    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setAudioLevel(0);
    setAiAudioLevel(0);
    setVadSilenceMs(0);
  }, [stopActiveAudioPlayback]);

  // Toggle Microphone Mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  useEffect(() => {
    return () => {
      stopConversation();
    };
  }, [stopConversation]);

  return {
    status,
    audioLevel,
    aiAudioLevel,
    isMuted,
    sessionTime,
    latencyMs,
    vadSilenceMs,
    userTranscript,
    aiTranscript,
    transcriptHistory,
    startConversation,
    stopConversation,
    triggerInterrupt,
    toggleMute,
    sendTextPrompt,
    finishVoiceTurn
  };
}
