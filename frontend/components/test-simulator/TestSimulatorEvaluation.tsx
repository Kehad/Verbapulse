'use client';

import React from 'react';
import {
  Award,
  TrendingUp,
  Square,
  Volume2,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { EvaluationResult } from './types';

interface TestSimulatorEvaluationProps {
  currentEval: EvaluationResult;
  currentIndex: number;
  totalQuestions: number;
  adaptiveNotice: string;
  answerMode: 'RECORD' | 'TEXT';
  textAnswer: string;
  transcript: string;
  isPlayingAudio: boolean;
  loading: boolean;
  onTogglePlayAudio: () => void;
  onNextQuestion: () => void;
}

export const TestSimulatorEvaluation: React.FC<TestSimulatorEvaluationProps> = ({
  currentEval,
  currentIndex,
  totalQuestions,
  adaptiveNotice,
  answerMode,
  textAnswer,
  transcript,
  isPlayingAudio,
  loading,
  onTogglePlayAudio,
  onNextQuestion,
}) => {
  return (
    <div className="flex flex-col gap-6 animate-fadeIn text-slate-100">
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl flex flex-col gap-6">
        {/* Score & Rating Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-inner">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Award className="w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                Evaluation Result • Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {currentEval.accuracy_rating}
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-4xl sm:text-5xl font-black text-emerald-400">{currentEval.overall_score}</span>
            <span className="text-lg text-slate-500 font-bold">/100</span>
          </div>
        </div>

        {/* Adaptive Notice */}
        {adaptiveNotice && (
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold flex items-center gap-3">
            <TrendingUp className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{adaptiveNotice}</span>
          </div>
        )}

        {/* Spoken AI Audio Feedback */}
        {currentEval.audio_base64 && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-teal-500/30 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Audio Feedback Response
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-extrabold uppercase">
                ElevenLabs TTS
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={onTogglePlayAudio}
                  className="w-14 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg transition-all hover:scale-105 cursor-pointer shrink-0"
                >
                  {isPlayingAudio ? (
                    <Square className="w-6 h-6 fill-slate-950" />
                  ) : (
                    <Volume2 className="w-7 h-7 text-slate-950" />
                  )}
                </button>
                <div className="flex flex-col gap-1">
                  <span className="text-base font-bold text-white">
                    {isPlayingAudio ? '🔊 Playing Audio Feedback...' : '▶ Listen to Spoken AI Feedback'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transcript & Details */}
        <div className="flex flex-col gap-5 pt-4 border-t border-slate-800">
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
              Your Answer Transcript
            </span>
            <p className="text-sm font-sans text-slate-300 leading-relaxed bg-slate-900 p-4 rounded-xl border border-slate-800 italic">
              "{currentEval.transcript || textAnswer || transcript || 'No answer captured.'}"
            </p>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Key Strengths
              </span>
              <ul className="space-y-2">
                {currentEval.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-slate-300 font-medium flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Areas for Improvement
              </span>
              <ul className="space-y-2">
                {currentEval.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-slate-300 font-medium flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Coaching Advice */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-teal-500/30 flex flex-col gap-2">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Coaching Tip
            </span>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">{currentEval.actionable_improvements}</p>
          </div>

          {/* Model Answer Reference */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Ideal Model Answer
            </span>
            <p className="text-xs font-mono text-slate-300 leading-relaxed bg-slate-900 p-4 rounded-xl border border-slate-800">
              {currentEval.ideal_response_summary}
            </p>
          </div>
        </div>

        {/* Next Question CTA */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onNextQuestion}
            disabled={loading}
            className="flex items-center gap-3 px-9 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-emerald-500/20 cursor-pointer"
          >
            <span>
              {currentIndex + 1 < totalQuestions
                ? 'Proceed to Next Question'
                : 'Finish & View Scorecard'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
