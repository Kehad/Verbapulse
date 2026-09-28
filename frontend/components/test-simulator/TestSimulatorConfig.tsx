'use client';

import React from 'react';
import { Sparkles, Sliders, Zap, CheckCircle2, Target, Brain } from 'lucide-react';
import { PRESET_DOMAINS } from './types';

interface TestSimulatorConfigProps {
  domain: string;
  setDomain: (domain: string) => void;
  questionCount: number;
  setQuestionCount: (count: number) => void;
  difficultyLevel: string;
  setDifficultyLevel: (level: string) => void;
  adaptiveMode: boolean;
  setAdaptiveMode: (adaptive: boolean) => void;
  timePerQuestion: number;
  setTimePerQuestion: (seconds: number) => void;
  loading: boolean;
  onGenerateQuestions: () => void;
}

export const TestSimulatorConfig: React.FC<TestSimulatorConfigProps> = ({
  domain,
  setDomain,
  questionCount,
  setQuestionCount,
  difficultyLevel,
  setDifficultyLevel,
  adaptiveMode,
  setAdaptiveMode,
  timePerQuestion,
  setTimePerQuestion,
  loading,
  onGenerateQuestions,
}) => {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl flex flex-col gap-8 transition-all text-slate-100">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-blue-500/20">
            <Sliders className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Configure Practice Session</h2>
            <p className="text-xs text-slate-400 font-medium">Select your target subject, question count, time limit, and adaptive difficulty.</p>
          </div>
        </div>
       
      </div>

      {/* Preset Domains Selector */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-400" />
          Select a Topic or Type Your Own
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {PRESET_DOMAINS.map((p, idx) => {
            const isSelected = domain === p.domain;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setDomain(p.domain)}
                className={`p-4 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-slate-950 border-blue-500 text-white ring-1 ring-blue-500/40 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                    {p.label}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{p.domain}</span>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-fadeIn" />
                )}
              </button>
            );
          })}
        </div>

        <div className="relative mt-1">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full p-4 pl-4 pr-10 rounded-2xl bg-slate-950/90 border border-slate-800 focus:border-blue-500 text-sm text-white font-semibold outline-none transition-all"
            placeholder="Or type custom topic (e.g. System Design & Concurrency)"
          />
        </div>
      </div>

      {/* Grid Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2 border-t border-slate-800">
        {/* Question Count */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Question Count</label>
          <select
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 focus:border-blue-500 text-sm font-semibold text-white outline-none transition-all cursor-pointer"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Question' : 'Questions'}
              </option>
            ))}
          </select>
        </div>

        {/* Baseline Difficulty Tier */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Starting Difficulty</label>
          <select
            value={difficultyLevel}
            onChange={(e) => setDifficultyLevel(e.target.value)}
            className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 focus:border-blue-500 text-sm font-semibold text-white outline-none transition-all cursor-pointer"
          >
            <option value="junior">Junior / Beginner</option>
            <option value="Mid-Level">Mid-Level Core</option>
            <option value="Senior">Senior / Expert</option>
          </select>
        </div>

        {/* Time Limit Per Question */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Time Per Question</label>
          <select
            value={timePerQuestion}
            onChange={(e) => setTimePerQuestion(Number(e.target.value))}
            className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 focus:border-blue-500 text-sm font-semibold text-white outline-none transition-all cursor-pointer"
          >
            <option value={30}>30 Seconds (Fast Speedrun)</option>
            <option value={45}>45 Seconds</option>
            <option value={60}>60 Seconds (1 Min)</option>
            <option value={90}>90 Seconds (1.5 Mins)</option>
            <option value={120}>120 Seconds (2 Mins)</option>
            <option value={0}>No Limit (Untimed)</option>
          </select>
        </div>

        {/* Adaptive Mode Toggle */}
        <div className="flex flex-col gap-2 justify-end">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Smart AI Scaling</label>
          <div className="relative group">
            <button
              type="button"
              onClick={() => setAdaptiveMode(!adaptiveMode)}
              className={`w-full p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                adaptiveMode
                  ? 'bg-slate-950 border-blue-500/50 text-blue-300 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Zap className={`w-4 h-4 ${adaptiveMode ? 'text-blue-400 fill-blue-400' : 'text-slate-500'}`} />
                Adaptive AI
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase ${
                adaptiveMode ? 'bg-blue-500 text-white font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                {adaptiveMode ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Action CTA Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onGenerateQuestions}
          disabled={loading || !domain.trim()}
          className="w-full relative group overflow-hidden py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm tracking-wide transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating Practice Questions...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 fill-white animate-bounce" />
              <span>Generate Practice Questions</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
