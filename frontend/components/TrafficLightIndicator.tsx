'use client';

import React, { useRef, useEffect } from 'react';
import { SignalType } from '@/hooks/useAudioStreamer';
import {
  Mic,
  Pause,
  Play,
  Square,
  Activity,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Radio,
  Volume2,
  VolumeX,
  Tag,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

interface TrafficLightIndicatorProps {
  currentSignal: SignalType;
  currentNudge: string;
  suggestedPivot?: string;
  latencyMs: number;
  sessionTime: number;
  audioLevel: number;
  transcript: string;
  partialTranscript: string;
  sttEngine?: string;
  isStreaming: boolean;
  isPaused: boolean;
  isAudioMonitoring?: boolean;
  fillerWordsCount?: number;
  technicalKeywords?: string[];
  examinerSentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  isDodging?: boolean;
  aiFollowups?: string[];
  onPauseToggle: () => void;
  onStopSession: () => void;
  onToggleAudioMonitoring?: () => void;
}

export const TrafficLightIndicator: React.FC<TrafficLightIndicatorProps> = ({
  currentSignal,
  currentNudge,
  suggestedPivot,
  latencyMs,
  sessionTime,
  audioLevel,
  transcript,
  partialTranscript,
  sttEngine = 'AssemblyAI Voice STT',
  isStreaming,
  isPaused,
  isAudioMonitoring = false,
  fillerWordsCount = 0,
  technicalKeywords = [],
  examinerSentiment = 'NEUTRAL',
  isDodging = false,
  aiFollowups = [],
  onPauseToggle,
  onStopSession,
  onToggleAudioMonitoring
}) => {
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, partialTranscript]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const getSignalConfig = () => {
    switch (currentSignal) {
      case 'GREEN':
        return {
          bg: 'bg-emerald-950/50',
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          badgeText: 'text-emerald-300',
          glow: 'animate-pulse-mint',
          badge: '🟢 MINT SIGNAL • ACCURATE & ON TRACK',
          icon: CheckCircle2
        };
      case 'AMBER':
        return {
          bg: 'bg-blue-950/50',
          border: 'border-blue-500/40',
          text: 'text-blue-400',
          badgeText: 'text-blue-300',
          glow: 'animate-pulse-sapphire',
          badge: '🔵 SAPPHIRE SIGNAL • ADD METRICS OR PIVOT',
          icon: AlertTriangle
        };
      case 'RED':
      default:
        return {
          bg: 'bg-rose-950/50',
          border: 'border-rose-500/40',
          text: 'text-rose-400',
          badgeText: 'text-rose-300',
          glow: 'animate-pulse-coral',
          badge: '🔴 CORAL SIGNAL • OFF TOPIC / UNANSWERED',
          icon: AlertCircle
        };
    }
  };

  const config = getSignalConfig();
  const IconComponent = config.icon;

  return (
    <div className="w-full max-w-5xl flex flex-col gap-6 animate-fadeIn text-slate-100">
      {/* Top Telemetry Header Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-md backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-mono text-blue-400 font-semibold">
            <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>{sttEngine}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatTime(sessionTime)}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>{latencyMs}ms speed</span>
          </div>
        </div>

        {/* Audio Meter & Audio Monitor Toggle */}
        <div className="flex items-center gap-4">
          {onToggleAudioMonitoring && (
            <button
              onClick={onToggleAudioMonitoring}
              className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                isAudioMonitoring
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isAudioMonitoring ? 'Mute Self Audio Monitor' : 'Unmute Self Audio Monitor'}
            >
              {isAudioMonitoring ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}

          {/* Audio Visualizer Level Bar */}
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-blue-400" />
            <div className="w-24 sm:w-32 h-2.5 bg-slate-950 rounded-full border border-slate-800 overflow-hidden p-0.5">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-75"
                style={{ width: `${audioLevel}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Status & Coaching Nudge Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border ${config.bg} ${config.border} ${config.glow} shadow-2xl flex flex-col gap-6 transition-all duration-300 relative overflow-hidden backdrop-blur-xl`}>
        {/* Signal Badge & Status Pill Grid */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl bg-slate-950 border ${config.border} shadow-inner`}>
              <IconComponent className={`w-6 h-6 ${config.text}`} />
            </div>
            <div className="flex flex-col">
              <span className={`text-xs font-black uppercase tracking-widest ${config.badgeText}`}>
                {config.badge}
              </span>
              {suggestedPivot && (
                <span className="text-xs text-slate-300 font-medium mt-0.5">
                  Suggested Focus: <span className="text-white underline font-bold">{suggestedPivot}</span>
                </span>
              )}
            </div>
          </div>

          {/* Real-time Telemetry Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {isDodging && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold animate-bounce">
                <ShieldAlert className="w-4 h-4" />
                <span>Question Dodging Detected</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono">
              <span>Examiner Tone:</span>
              <span className={`font-bold ${
                examinerSentiment === 'POSITIVE' ? 'text-emerald-400' : examinerSentiment === 'NEGATIVE' ? 'text-rose-400' : 'text-blue-400'
              }`}>
                {examinerSentiment}
              </span>
            </div>

            {fillerWordsCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-rose-300 text-xs font-mono font-semibold">
                <span>{fillerWordsCount} Filler Words ('um'/'uh')</span>
              </div>
            )}
          </div>
        </div>

        {/* Live AI Coaching Nudge Banner */}
        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400">
            💡 VerbaPulse Live Coaching Advice
          </span>
          <p className="text-base sm:text-xl font-bold text-white leading-relaxed">
            {currentNudge}
          </p>
        </div>

        {/* Technical Keywords Detected */}
        {technicalKeywords.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-blue-400" />
              Key Terms Spoken:
            </span>
            {technicalKeywords.map((kw, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono font-semibold">
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Live Transcript Box */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col gap-3 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Live Speech Telemetry Transcript
          </span>
          {isStreaming && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Streaming Active
            </span>
          )}
        </div>

        <div className="h-44 overflow-y-auto p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-sm leading-relaxed text-slate-200 font-sans space-y-2">
          {transcript ? (
            <p className="whitespace-pre-wrap">{transcript}</p>
          ) : (
            <p className="text-slate-500 italic">Speak clearly into your microphone. Your transcript will stream live.</p>
          )}
          {partialTranscript && (
            <p className="text-blue-400 italic animate-pulse">{partialTranscript}</p>
          )}
          <div ref={transcriptEndRef} />
        </div>
      </div>

      {/* Anticipated Examiner Follow-Up Questions */}
      {aiFollowups.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col gap-3 backdrop-blur-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            Anticipated Examiner Follow-Up Questions
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {aiFollowups.map((question, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                  Q{i + 1}
                </span>
                <span>{question}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Action Buttons */}
      <div className="flex items-center justify-center gap-4 py-2">
        <button
          onClick={onPauseToggle}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
        >
          {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-blue-400" />}
          <span>{isPaused ? 'Resume Session' : 'Pause Telemetry'}</span>
        </button>

        <button
          onClick={onStopSession}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
        >
          <Square className="w-4 h-4 fill-white" />
          <span>Finish Session & View Report</span>
        </button>
      </div>
    </div>
  );
};
