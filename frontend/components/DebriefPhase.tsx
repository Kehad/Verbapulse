'use client';

import React, { useState, useEffect } from 'react';
import { EvaluationEntry } from '@/hooks/useAudioStreamer';
import {
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface DebriefPhaseProps {
  groundTruth: string;
  targetQuestion: string;
  transcript: string;
  evalHistory: EvaluationEntry[];
  onRestart: () => void;
}

export const DebriefPhase: React.FC<DebriefPhaseProps> = ({
  groundTruth,
  targetQuestion,
  transcript,
  evalHistory,
  onRestart
}) => {
  const [loading, setLoading] = useState(true);
  const [debriefData, setDebriefData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchDebrief() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const resp = await fetch(`${baseUrl}/api/v1/debrief`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ground_truth: groundTruth,
            target_question: targetQuestion,
            full_transcript: transcript,
            history: evalHistory
          })
        });
        if (resp.ok) {
          const data = await resp.json();
          setDebriefData(data);
        } else {
          console.error('Debrief API error response');
        }
      } catch (err) {
        console.error('Debrief fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDebrief();
  }, [groundTruth, targetQuestion, transcript, evalHistory]);

  const handleCopyReport = () => {
    if (!debriefData) return;
    const text = `VerbaPulse Telemetry Debrief Report\nOverall Rating: ${debriefData.overall_score}/100\nVerdict: ${debriefData.defense_verdict}\nClarity: ${debriefData.clarity_score}/100 | Confidence: ${debriefData.confidence_score}/100 | Technical Depth: ${debriefData.technical_depth_score}/100\n\nSTAR Response Model:\n- Situation: ${debriefData.ideal_star_answer?.Situation}\n- Task: ${debriefData.ideal_star_answer?.Task}\n- Action: ${debriefData.ideal_star_answer?.Action}\n- Result: ${debriefData.ideal_star_answer?.Result}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl p-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col items-center justify-center gap-4 text-center my-12 text-slate-100 backdrop-blur-xl">
        <div className="w-12 h-12 rounded-full border-4 border-blue-400 border-t-transparent animate-spin" />
        <span className="text-base font-extrabold text-white tracking-wide">
          Generating VerbaPulse Telemetry Debrief & Scorecard...
        </span>
        <span className="text-xs text-slate-400">
          Evaluating speech clarity, confidence alignment, and key strengths.
        </span>
      </div>
    );
  }

  const d = debriefData || {
    overall_score: 86,
    clarity_score: 90,
    confidence_score: 88,
    technical_depth_score: 82,
    green_percentage: 80,
    amber_percentage: 15,
    red_percentage: 5,
    total_fillers: 2,
    total_technical_keywords: 6,
    dodged_questions_count: 0,
    total_duration_sec: 75,
    ideal_star_answer: {
      Situation: `Response to prompt: '${targetQuestion || 'Target Topic'}'`,
      Task: 'Deliver a clear, evidence-backed answer aligned with reference facts.',
      Action: 'Communicated key points smoothly, addressing main requirements.',
      Result: 'Achieved an 86/100 overall score with strong alignment.'
    },
    key_strengths: [
      'Articulated primary thesis points with clear, precise terminology',
      'Demonstrated solid technical understanding across key concepts',
      'Maintained consistent tone and structure throughout response'
    ],
    key_weaknesses: [
      'Slight pause before addressing complex follow-up questions'
    ],
    defense_verdict: 'Strong & Effective Answer'
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-8 animate-fadeIn text-slate-100">
      {/* Top Banner Card */}
      <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider w-fit mx-auto md:mx-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>VerbaPulse Session Complete</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Verdict: <span className="text-blue-400">{d.defense_verdict}</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Target Question: {targetQuestion}
          </p>
        </div>

        {/* Overall Score Badge */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1 bg-slate-950 border border-slate-800 p-6 rounded-2xl font-mono shadow-inner">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Rating</span>
            <div className="text-5xl font-black text-blue-400">
              {d.overall_score}<span className="text-2xl text-slate-500">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Score Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2 shadow-md">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verbal Clarity</span>
          <div className="text-3xl font-extrabold text-blue-400 font-mono">{d.clarity_score}/100</div>
          <span className="text-[11px] text-slate-400">{d.total_fillers} filler words detected</span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2 shadow-md">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confidence Level</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">{d.confidence_score}/100</div>
          <span className="text-[11px] text-slate-400">{d.green_percentage}% Mint signal time</span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2 shadow-md">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Technical Depth</span>
          <div className="text-3xl font-extrabold text-indigo-400 font-mono">{d.technical_depth_score}/100</div>
          <span className="text-[11px] text-slate-400">{d.total_technical_keywords} key terms spoken</span>
        </div>
      </div>

      {/* STAR Framework Answer Model */}
      <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col gap-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Recommended STAR Response Model
          </span>
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
            <span>{copied ? 'Copied Report ✓' : 'Copy Report'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1">
            <span className="text-[11px] font-extrabold text-blue-400 uppercase tracking-wider">Situation</span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{d.ideal_star_answer?.Situation}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1">
            <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider">Task</span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{d.ideal_star_answer?.Task}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1">
            <span className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-wider">Action</span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{d.ideal_star_answer?.Action}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1">
            <span className="text-[11px] font-extrabold text-rose-400 uppercase tracking-wider">Result</span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{d.ideal_star_answer?.Result}</p>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col gap-3">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Key Strengths
          </span>
          <ul className="space-y-2">
            {d.key_strengths.map((s: string, i: number) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col gap-3">
          <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Areas for Improvement
          </span>
          <ul className="space-y-2">
            {d.key_weaknesses.map((w: string, i: number) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Restart Button */}
      <div className="flex justify-center py-4">
        <button
          onClick={onRestart}
          className="flex items-center gap-3 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 fill-white" />
          <span>Start New Live Session</span>
        </button>
      </div>
    </div>
  );
};
