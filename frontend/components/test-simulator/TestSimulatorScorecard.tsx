'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, MessageSquare, RefreshCw } from 'lucide-react';
import { EvaluationResult, QuestionItem } from './types';

interface TestSimulatorScorecardProps {
  domain: string;
  evaluations: EvaluationResult[];
  questions: QuestionItem[];
  cumulativeReport: any;
  onResetSession: () => void;
}

export const TestSimulatorScorecard: React.FC<TestSimulatorScorecardProps> = ({
  domain,
  evaluations,
  questions,
  cumulativeReport,
  onResetSession,
}) => {
  return (
    <div className="flex flex-col gap-8 animate-fadeIn text-slate-100">
      {/* Celebration Header Card */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-3 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider w-fit mx-auto md:mx-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Practice Session Complete</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Readiness Score: <span className="text-emerald-400">{cumulativeReport?.readiness_percentage || 85}%</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
            Subject Domain: <span className="text-white font-semibold">{domain}</span> ({evaluations.length} Questions Completed)
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1 bg-slate-950 border border-slate-800 p-6 rounded-2xl font-mono shadow-inner">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Overall Score</span>
            <div className="text-5xl font-black text-emerald-400">
              {cumulativeReport?.overall_score || 82}<span className="text-2xl text-slate-500">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cumulative Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col gap-4">
          <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
            Cumulative Strengths
          </span>
          <ul className="space-y-2.5">
            {(cumulativeReport?.cumulative_strengths || ['Clear terminology', 'Structured reasoning']).map(
              (s: string, i: number) => (
                <li key={i} className="text-xs text-slate-300 font-medium flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                  <span>{s}</span>
                </li>
              )
            )}
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col gap-4">
          <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-400" />
            Areas to Focus On Next
          </span>
          <ul className="space-y-2.5">
            {(cumulativeReport?.persistent_weaknesses || ['Include more specific data & metrics']).map(
              (w: string, i: number) => (
                <li key={i} className="text-xs text-slate-300 font-medium flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0" />
                  <span>{w}</span>
                </li>
              )
            )}
          </ul>
        </div>
      </div>

      {/* Question & Candidate Response History */}
      {evaluations.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col gap-5">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2 border-b border-slate-800 pb-4">
            <MessageSquare className="w-4 h-4 text-teal-400" />
            Answer History Summary
          </span>
          <div className="flex flex-col gap-4">
            {evaluations.map((ev, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-white">
                    Q{idx + 1}: {questions[idx]?.question_text || `Question ${idx + 1}`}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Score: {ev.overall_score}/100
                  </span>
                </div>
                <p className="text-xs text-slate-300 italic">
                  "{ev.transcript || 'Answer recorded'}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restart Practice Session Button */}
      <div className="flex justify-center py-4">
        <button
          onClick={onResetSession}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-sm transition-all shadow-xl cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 fill-slate-950" />
          <span>Start New Practice Session</span>
        </button>
      </div>
    </div>
  );
};
