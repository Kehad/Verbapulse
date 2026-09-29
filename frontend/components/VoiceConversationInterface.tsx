'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  useVoiceConversation,
  VoiceSessionStatus
} from '@/hooks/useVoiceConversation';
import {
  Mic,
  MicOff,
  Square,
  Zap,
  Activity,
  Volume2,
  Sparkles,
  User,
  Radio,
  Clock,
  Hand,
  Play,
  RotateCcw,
  Send
} from 'lucide-react';

export function VoiceConversationInterface() {
  const voice = useVoiceConversation();
  const [textInput, setTextInput] = useState<string>('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript feed to bottom as new speech turns arrive
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [voice.transcriptHistory, voice.userTranscript, voice.aiTranscript, voice.status]);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      voice.sendTextPrompt(textInput);
      setTextInput('');
    } else if (voice.status === 'listening') {
      voice.finishVoiceTurn();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: VoiceSessionStatus) => {
    switch (status) {
      case 'listening':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-pulse-mint">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Listening (Microphone Active)</span>
          </div>
        );
      case 'thinking':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-spin" />
            <span>Thinking (LLM Inference)</span>
          </div>
        );
      case 'speaking':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold animate-pulse-sapphire">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Speaking (Streaming Synthetic Voice)</span>
          </div>
        );
      case 'interrupted':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold animate-pulse-coral">
            <Hand className="w-3.5 h-3.5 text-rose-400" />
            <span>Interrupted (Barge-In Handled)</span>
          </div>
        );
      case 'connecting':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>Connecting Session...</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
            <span>Session Idle</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      {/* Header & Session Bar */}
      <div className="glass-card rounded-2xl p-5 border border-neutral-800 bg-neutral-950/80 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-white shrink-0">
            <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-white">
                VerbaPulse AI Voice Studio
              </h2>
              {getStatusBadge(voice.status)}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Low-latency full-duplex voice conversation powered by AssemblyAI & Gemini LLM
            </p>
          </div>
        </div>

        {/* Telemetry Pills */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Latency:</span>
            <span className="font-mono font-bold text-white">{voice.latencyMs}ms</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono font-bold text-white">
              {formatTime(voice.sessionTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Left Visualizer Orb + Right Live Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Orb & Voice Controls (5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-neutral-800 bg-neutral-950/80 backdrop-blur-2xl flex flex-col items-center justify-between min-h-[460px] shadow-2xl relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div
            className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
              voice.status === 'listening'
                ? 'bg-emerald-500/5 opacity-100'
                : voice.status === 'speaking'
                ? 'bg-cyan-500/5 opacity-100'
                : voice.status === 'thinking'
                ? 'bg-indigo-500/5 opacity-100'
                : 'opacity-0'
            }`}
          />

          <div className="w-full flex items-center justify-between relative z-10 text-xs text-neutral-400">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-400">
              Interactive Audio Portal
            </span>
            <span className="font-mono text-[11px] text-neutral-400">
              AssemblyAI Realtime STT
            </span>
          </div>

          {/* Central Animated Orb Visualizer */}
          <div className="relative my-8 flex items-center justify-center w-56 h-56 z-10">
            {/* Outer Pulsing Waves */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-300 border ${
                voice.status === 'listening'
                  ? 'border-emerald-500/40 bg-emerald-500/10 scale-110 animate-ping'
                  : voice.status === 'speaking'
                  ? 'border-cyan-500/40 bg-cyan-500/10 scale-110 animate-pulse'
                  : voice.status === 'thinking'
                  ? 'border-indigo-500/40 bg-indigo-500/10 scale-105 animate-spin'
                  : 'border-neutral-800 bg-neutral-900/30'
              }`}
            />

            {/* Middle Dynamic Wave Ring */}
            <div
              className={`absolute inset-3 rounded-full transition-all duration-200 border-2 ${
                voice.status === 'listening'
                  ? 'border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.4)]'
                  : voice.status === 'speaking'
                  ? 'border-cyan-400 shadow-[0_0_30px_rgba(56,189,248,0.4)]'
                  : voice.status === 'thinking'
                  ? 'border-indigo-400 shadow-[0_0_30px_rgba(129,140,248,0.3)]'
                  : 'border-neutral-700'
              }`}
              style={{
                transform: `scale(${
                  1 +
                  (voice.status === 'listening'
                    ? voice.audioLevel / 250
                    : voice.status === 'speaking'
                    ? voice.aiAudioLevel / 250
                    : 0)
                })`
              }}
            />

            {/* Inner Core Ball */}
            <div
              className={`w-36 h-36 rounded-full flex flex-col items-center justify-center text-center p-4 transition-all duration-300 z-10 shadow-2xl ${
                voice.status === 'listening'
                  ? 'bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-emerald-500/30'
                  : voice.status === 'speaking'
                  ? 'bg-gradient-to-br from-cyan-600 to-blue-800 text-white shadow-cyan-500/30'
                  : voice.status === 'thinking'
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-800 text-white shadow-indigo-500/30'
                  : voice.status === 'interrupted'
                  ? 'bg-gradient-to-br from-rose-600 to-red-800 text-white shadow-rose-500/30'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
              }`}
            >
              {voice.status === 'listening' && (
                <>
                  <Mic className="w-8 h-8 text-white animate-bounce mb-1" />
                  <span className="text-xs font-bold tracking-tight">Listening</span>
                  <span className="text-[10px] opacity-80 font-mono mt-0.5">
                    Vol: {voice.audioLevel}%
                  </span>
                </>
              )}

              {voice.status === 'speaking' && (
                <>
                  <Volume2 className="w-8 h-8 text-white animate-pulse mb-1" />
                  <span className="text-xs font-bold tracking-tight">Speaking</span>
                  <span className="text-[10px] opacity-80 font-mono mt-0.5">
                    Barge-in active
                  </span>
                </>
              )}

              {voice.status === 'thinking' && (
                <>
                  <Sparkles className="w-8 h-8 text-white animate-spin mb-1" />
                  <span className="text-xs font-bold tracking-tight">Thinking</span>
                  <span className="text-[10px] opacity-80 font-mono mt-0.5">
                    LLM Turn
                  </span>
                </>
              )}

              {voice.status === 'interrupted' && (
                <>
                  <Hand className="w-8 h-8 text-white animate-pulse mb-1" />
                  <span className="text-xs font-bold tracking-tight">Interrupted</span>
                  <span className="text-[10px] opacity-80 font-mono mt-0.5">
                    Resetting turn
                  </span>
                </>
              )}

              {voice.status === 'disconnected' && (
                <>
                  <Radio className="w-8 h-8 text-neutral-500 mb-1" />
                  <span className="text-xs font-semibold text-neutral-400">
                    Offline
                  </span>
                </>
              )}

              {voice.status === 'connecting' && (
                <>
                  <RotateCcw className="w-8 h-8 text-amber-400 animate-spin mb-1" />
                  <span className="text-xs font-semibold text-amber-300">
                    Connecting
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="w-full flex flex-col gap-3 relative z-10">
            {voice.status === 'disconnected' ? (
              <button
                onClick={voice.startConversation}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-black" />
                <span>Start Voice Conversation</span>
              </button>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
                {/* End Session Button */}
                <button
                  onClick={voice.stopConversation}
                  className="py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-red-400 hover:text-red-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  title="Disconnect full-duplex session"
                >
                  <Square className="w-4 h-4 fill-red-400" />
                  <span>End</span>
                </button>

                {/* Mute Mic Toggle */}
                <button
                  onClick={voice.toggleMute}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    voice.isMuted
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                  title="Toggle Microphone"
                >
                  {voice.isMuted ? (
                    <>
                      <MicOff className="w-4 h-4 text-amber-400" />
                      <span>Unmute</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-neutral-400" />
                      <span>Mute</span>
                    </>
                  )}
                </button>

                {/* Manual Barge-In Interrupt Button */}
                <button
                  onClick={voice.triggerInterrupt}
                  disabled={voice.status !== 'speaking'}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    voice.status === 'speaking'
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25 shadow-md shadow-rose-500/10'
                      : 'bg-neutral-900/50 border-neutral-800 text-neutral-600 opacity-50 cursor-not-allowed'
                  }`}
                  title="Interrupt synthetic voice playback immediately"
                >
                  <Hand className="w-4 h-4 text-rose-400" />
                  <span>Interrupt</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Real-Time Conversation Stream (7 cols) */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-neutral-800 bg-neutral-950/80 backdrop-blur-2xl flex flex-col justify-between min-h-[460px] shadow-2xl">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Live Conversation Stream
              </h3>
            </div>
            <span className="text-xs text-neutral-400">
              Manual Send
            </span>
          </div>

          {/* Scrolling Transcript Feed */}
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto max-h-[340px] pr-2 space-y-4 font-sans text-xs scroll-smooth mb-3"
          >
            {voice.transcriptHistory.length === 0 &&
              !voice.userTranscript &&
              !voice.aiTranscript && (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center text-neutral-400 gap-3">
                  <div className="p-4 rounded-full bg-neutral-900/60 border border-neutral-800">
                    <Radio className="w-8 h-8 text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-300">
                      No Spoken Turns Yet
                    </p>
                    <p className="text-xs text-neutral-400 max-w-sm mt-1">
                      Tap &quot;Start Voice Conversation&quot; and talk naturally into your microphone or type a message below.
                      Tap the Send button when you are done speaking to submit your voice.
                    </p>
                  </div>
                </div>
              )}

            {voice.transcriptHistory.map((msg) =>
              msg.role === 'user' ? (
                <div key={msg.id} className="flex gap-3 justify-end">
                  <div className="max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-tr-none shadow-md">
                    <div className="flex items-center justify-between gap-4 mb-1 text-[10px] text-neutral-400">
                      <span className="font-semibold text-emerald-400">You (AssemblyAI STT)</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                        Read-Only
                      </span>
                    </div>
                    <p className="select-text">{msg.text}</p>
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-neutral-300" />
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex gap-3 justify-start">
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed bg-cyan-950/20 border border-cyan-500/30 text-cyan-100 rounded-tl-none shadow-md">
                    <div className="flex items-center justify-between gap-4 mb-1 text-[10px] text-cyan-400 font-semibold">
                      <span>VivaGuard Voice Copilot</span>
                      {msg.latencyMs && (
                        <span className="font-mono text-cyan-400 text-[10px]">
                          {msg.latencyMs}ms
                        </span>
                      )}
                    </div>
                    <p className="select-text">{msg.text}</p>
                  </div>
                </div>
              )
            )}

            {/* In-Flight Active User Speech */}
            {voice.userTranscript && (
              <div className="flex gap-3 justify-end">
                <div className="max-w-[82%] p-3.5 rounded-2xl bg-neutral-900/80 border border-emerald-500/40 text-emerald-300 text-xs rounded-tr-none animate-pulse">
                  <div className="flex items-center justify-between gap-2 mb-1 text-[10px] text-emerald-400 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Mic className="w-3 h-3 text-emerald-400 animate-bounce" />
                      <span>AssemblyAI Converting Speech...</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-mono">
                      Read-Only
                    </span>
                  </div>
                  <p>{voice.userTranscript}</p>
                </div>
                <div className="w-7 h-7 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            )}

            {/* In-Flight Thinking Indicator */}
            {voice.status === 'thinking' && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-xl bg-indigo-500/10 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                </div>
                <div className="max-w-[82%] p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 text-indigo-200 text-xs rounded-tl-none animate-pulse">
                  <div className="flex items-center gap-2 text-[10px] text-indigo-400 font-semibold">
                    <span>AI is thinking & generating response...</span>
                  </div>
                </div>
              </div>
            )}

            {/* In-Flight Loud Speaking Indicator */}
            {voice.status === 'speaking' && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                </div>
                <div className="max-w-[82%] p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 text-cyan-200 text-xs rounded-tl-none animate-pulse">
                  <div className="flex items-center gap-2 text-[10px] text-cyan-400 font-semibold">
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
                    <span>Voice output speaking loud through speakers...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Voice Turn Controls */}
          <div className="w-full flex items-center justify-center pt-3 border-t border-neutral-800/80">
            {voice.status === 'listening' ? (
              <button
                onClick={voice.finishVoiceTurn}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send Spoken Voice Recording</span>
              </button>
            ) : (
              <div className="w-full py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 font-semibold text-center flex items-center justify-center gap-2 text-sm">
                {voice.status === 'thinking' ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>AI is thinking...</span>
                  </>
                ) : voice.status === 'speaking' ? (
                  <>
                    <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-cyan-300">Voice output is speaking loud... Please wait before recording again</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-neutral-500" />
                    <span>Please wait...</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
