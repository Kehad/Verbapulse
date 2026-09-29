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

import { EXAMINER_PERSONAS } from './SetupPhase';

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
  selectedExaminer?: string;
  isExaminerSpeaking?: boolean;
  activeExaminerQuestion?: string;
  onPauseToggle: () => void;
  onStopSession: () => void;
  onToggleAudioMonitoring?: () => void;
  speakExaminerQuestion?: (questionText: string) => void;
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
  selectedExaminer = 'prof_vance',
  isExaminerSpeaking = false,
  activeExaminerQuestion = '',
  onPauseToggle,
  onStopSession,
  onToggleAudioMonitoring,
  speakExaminerQuestion
}: TrafficLightIndicatorProps) => {
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const activeExaminer = EXAMINER_PERSONAS.find((ex) => ex.id === selectedExaminer) || EXAMINER_PERSONAS[0];

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
    <div className="w-full max-w-4xl flex flex-col gap-6 animate-fadeIn text-white">
      {/* Top Header Bar */}
      <div className="p-4 rounded-2xl bg-black border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-white font-medium">
            <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>AI Voice Companion Active</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>{formatTime(sessionTime)}</span>
          </div>
        </div>

        {/* Audio Meter & Audio Monitor Toggle */}
        <div className="flex items-center gap-4">
          {onToggleAudioMonitoring && (
            <button
              onClick={onToggleAudioMonitoring}
              className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                isAudioMonitoring
                  ? 'bg-neutral-900 border-white text-white'
                  : 'bg-black border-neutral-800 text-neutral-400 hover:text-white'
              }`}
              title={isAudioMonitoring ? 'Mute Audio' : 'Unmute Audio'}
            >
              {isAudioMonitoring ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
            </button>
          )}

          {/* Audio Visualizer Level Bar */}
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-white" />
            <div className="w-24 sm:w-32 h-2.5 bg-neutral-950 rounded-full border border-neutral-800 overflow-hidden p-0.5">
              <div
                className="h-full bg-white rounded-full transition-all duration-75"
                style={{ width: `${audioLevel}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Voice-to-Voice AI Companion Status Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-black border border-neutral-800 shadow-2xl flex flex-col gap-6">
        {/* Voice Status Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeExaminer.avatar}</span>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white">{activeExaminer.name}</span>
              <span className="text-xs text-neutral-400 font-medium">{activeExaminer.role}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isExaminerSpeaking ? (
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-white text-white text-xs font-semibold animate-pulse">
                <Volume2 className="w-4 h-4 text-white animate-bounce" />
                <span>AI is Speaking Out Loud...</span>
              </span>
            ) : audioLevel > 15 ? (
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-700 text-white text-xs font-semibold">
                <Mic className="w-4 h-4 text-white animate-pulse" />
                <span>You are Speaking...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-medium">
                <Radio className="w-3.5 h-3.5 text-white" />
                <span>AI is Listening to your Voice</span>
              </span>
            )}
          </div>
        </div>

        {/* Live AI Spoken Response Box */}
        <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-white" />
              AI Voice Response:
            </span>
            {speakExaminerQuestion && currentNudge && (
              <button
                type="button"
                onClick={() => speakExaminerQuestion(currentNudge)}
                className="px-3 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 text-white" />
                <span>Listen Out Loud</span>
              </button>
            )}
          </div>
          <p className="text-base sm:text-xl font-bold text-white leading-relaxed font-sans">
            "{currentNudge}"
          </p>
        </div>
      </div>

      {/* Live Voice Conversation Transcript */}
      <div className="p-6 rounded-3xl bg-black border border-neutral-800 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-white" />
            Voice Conversation Transcript
          </span>
          {isStreaming && (
            <span className="flex items-center gap-1.5 text-xs text-white font-medium">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              Live Speech Connected
            </span>
          )}
        </div>

        <div className="h-44 overflow-y-auto p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-sm leading-relaxed text-white font-sans space-y-2">
          {transcript ? (
            <p className="whitespace-pre-wrap">{transcript}</p>
          ) : (
            <p className="text-neutral-500 italic">Speak into your microphone. Your spoken words and the AI's spoken replies will appear here.</p>
          )}
          {partialTranscript && (
            <p className="text-neutral-300 italic animate-pulse">{partialTranscript}</p>
          )}
          <div ref={transcriptEndRef} />
        </div>
      </div>

      {/* Suggested Follow-Up Questions */}
      {aiFollowups.length > 0 && (
        <div className="p-6 rounded-3xl bg-black border border-neutral-800 shadow-xl flex flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-white" />
            Suggested Follow-Up Questions
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {aiFollowups.map((question, i) => (
              <div key={i} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 leading-relaxed flex flex-col justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-neutral-900 border border-neutral-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-white">{question}</span>
                </div>
                {speakExaminerQuestion && (
                  <button
                    type="button"
                    onClick={() => speakExaminerQuestion(question)}
                    className="self-end px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-white" />
                    <span>Have AI Speak Question Out Loud</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Action Buttons */}
      <div className="flex items-center justify-center gap-4 py-2">
        <button
          onClick={onPauseToggle}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-semibold text-xs transition-all cursor-pointer"
        >
          {isPaused ? <Play className="w-4 h-4 text-white" /> : <Pause className="w-4 h-4 text-white" />}
          <span>{isPaused ? 'Resume Voice' : 'Pause Voice'}</span>
        </button>

        <button
          onClick={onStopSession}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs transition-all shadow-md cursor-pointer"
        >
          <Square className="w-4 h-4 fill-black text-black" />
          <span>End Conversation & View Summary</span>
        </button>
      </div>
    </div>
  );
};
