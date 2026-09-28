'use client';

import React from 'react';
import { Mic, Square, FileText, Send, Sparkles, HelpCircle, CheckCircle2, Volume2, Clock } from 'lucide-react';
import { QuestionItem } from './types';

interface TestSimulatorAnsweringProps {
  currentQ: QuestionItem;
  currentIndex: number;
  totalQuestions: number;
  difficultyLevel: string;
  answerMode: 'RECORD' | 'TEXT';
  setAnswerMode: (mode: 'RECORD' | 'TEXT') => void;
  textAnswer: string;
  setTextAnswer: (text: string) => void;
  isRecording: boolean;
  recordTimer: number;
  transcript: string;
  audioBlob: Blob | null;
  loading: boolean;
  timePerQuestion?: number;
  timeRemaining?: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onEvaluateAnswer: () => void;
}

export const TestSimulatorAnswering: React.FC<TestSimulatorAnsweringProps> = ({
  currentQ,
  currentIndex,
  totalQuestions,
  difficultyLevel,
  answerMode,
  setAnswerMode,
  textAnswer,
  setTextAnswer,
  isRecording,
  recordTimer,
  transcript,
  audioBlob,
  loading,
  timePerQuestion = 60,
  timeRemaining = 60,
  onStartRecording,
  onStopRecording,
  onEvaluateAnswer,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl flex flex-col gap-6 transition-all text-slate-100">
      {/* Question Header Status */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {timePerQuestion > 0 ? (
            <div
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-mono font-black transition-all ${
                timeRemaining <= 10
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                  : 'bg-blue-500/20 border-blue-500/40 text-blue-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Time Left: {formatTime(timeRemaining)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-400 text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Untimed</span>
            </div>
          )}

          <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-mono text-emerald-300 uppercase font-extrabold">
            {currentQ.difficulty || difficultyLevel} Level
          </span>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-slate-950 border border-slate-800 text-white shadow-inner flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-blue-400">
              VerbaPulse Practice Prompt
            </span>
            <h2 className="text-lg sm:text-xl font-bold leading-relaxed tracking-tight text-white">
              {currentQ.question_text}
            </h2>
          </div>
        </div>

        {/* Checkpoint Criteria */}
        {currentQ.evaluation_criteria && currentQ.evaluation_criteria.length > 0 && (
          <div className="mt-2 pt-4 border-t border-slate-800 flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Expected Checkpoints:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {currentQ.evaluation_criteria.map((c, i) => (
                <div key={i} className="text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setAnswerMode('RECORD')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
              answerMode === 'RECORD'
                ? 'bg-blue-600 text-white font-extrabold shadow-md'
                : 'text-slate-400 hover:text-white font-bold'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>🎙️ Speak Answer (Recommended)</span>
          </button>

          <button
            type="button"
            onClick={() => setAnswerMode('TEXT')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
              answerMode === 'TEXT'
                ? 'bg-slate-800 text-white font-extrabold border border-slate-700'
                : 'text-slate-400 hover:text-white font-medium'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>✍️ Type Answer</span>
          </button>
        </div>
      </div>

      {/* Input Recording vs Text Input Area */}
      {answerMode === 'RECORD' ? (
        <div className="flex flex-col gap-5 p-8 rounded-2xl bg-slate-950 border border-slate-800 items-center justify-center text-center relative overflow-hidden">
          <div className="relative flex items-center justify-center">
            {isRecording && (
              <>
                <div className="absolute w-28 h-28 rounded-full bg-rose-500/20 animate-ping" />
                <div className="absolute w-24 h-24 rounded-full bg-rose-500/30 animate-pulse" />
              </>
            )}

            {!isRecording ? (
              <button
                type="button"
                onClick={onStartRecording}
                className="w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-xl shadow-blue-500/30 transition-all hover:scale-105 cursor-pointer relative z-10"
                title="Click to start recording"
              >
                <Mic className="w-9 h-9" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onStopRecording}
                className="w-20 h-20 rounded-full bg-rose-500 hover:bg-rose-400 text-white flex items-center justify-center shadow-xl shadow-rose-500/40 animate-pulse cursor-pointer relative z-10"
                title="Click to stop recording"
              >
                <Square className="w-7 h-7 fill-white" />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1 items-center">
            <span className="text-xs font-mono font-bold text-slate-200">
              {isRecording
                ? `🎙️ Recording Spoken Response (${recordTimer}s)`
                : audioBlob
                ? '✓ Audio captured & ready for evaluation'
                : 'Click mic orb to speak your answer'}
            </span>
          </div>

          {transcript && (
            <div className="w-full mt-2 text-left bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col gap-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                Transcript Preview:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed italic font-sans">
                "{transcript}"
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            rows={6}
            className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-blue-500 text-sm text-white outline-none font-sans leading-relaxed transition-all"
            placeholder="Type your answer here..."
          />
        </div>
      )}

      {/* Submit Grade Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onEvaluateAnswer}
          disabled={
            loading ||
            (answerMode === 'RECORD' && !audioBlob && !transcript.trim()) ||
            (answerMode === 'TEXT' && !textAnswer.trim())
          }
          className="flex items-center gap-3 px-9 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Evaluating Answer...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 fill-white" />
              <span>Submit & Grade Answer</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
