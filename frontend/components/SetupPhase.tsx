'use client';

import React, { useState } from 'react';
import { Sparkles, Mic, FileText, HelpCircle, ArrowRight, Play, CheckCircle2, Sliders } from 'lucide-react';

interface SetupPhaseProps {
  groundTruth: string;
  targetQuestion: string;
  onGroundTruthChange: (val: string) => void;
  onTargetQuestionChange: (val: string) => void;
  onStartSession: () => void;
}

const PERSONAS = [
  {
    id: 'thesis',
    label: '🎓 Thesis Defense',
    title: 'Research & Academic Defense',
    question: 'Why did you choose lock-free ring buffers over standard locks for event processing?',
    groundTruth: 'Thesis Abstract: Our event storage system uses lock-free buffers to reduce thread waiting times. Benchmarks show 4.2x higher throughput and under 15ms latency at 100k events/sec.'
  },
  {
    id: 'job',
    label: '💼 Job Interview',
    title: 'System Design & Tech Interview',
    question: 'How does your system maintain low latency during heavy traffic spikes?',
    groundTruth: 'Interview Context: Senior Software Engineer candidate. System design features microservices with Redis rate-limiting, asynchronous gRPC, and WebSocket streaming.'
  },
  {
    id: 'pitch',
    label: '🚀 Startup Pitch',
    title: 'Investor & Pitch Deck',
    question: 'What makes your product defensible against major competitors entering this space?',
    groundTruth: 'Startup Deck: VerbaPulse offers real-time voice coaching with sub-300ms latency. $50B market across universities, coding bootcamps, and workplace training.'
  },
  {
    id: 'corporate',
    label: '🏢 Presentation',
    title: 'Executive & Project Presentation',
    question: 'What is the estimated cost savings and timeline for migrating our database?',
    groundTruth: 'Project Plan: Migrating to cloud infrastructure saves $1.2M annually, with zero planned downtime using a dual-write pipeline.'
  }
];

export const SetupPhase: React.FC<SetupPhaseProps> = ({
  groundTruth,
  targetQuestion,
  onGroundTruthChange,
  onTargetQuestionChange,
  onStartSession
}) => {
  const [micTested, setMicTested] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string>('thesis');

  const handleTestMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicTested(true);
    } catch (e) {
      alert('Microphone access blocked or disconnected. Please enable microphone permissions in your browser.');
    }
  };

  const handleSelectPersona = (p: typeof PERSONAS[0]) => {
    setSelectedPersona(p.id);
    onGroundTruthChange(p.groundTruth);
    onTargetQuestionChange(p.question);
  };

  return (
    <div className="w-full max-w-4xl flex flex-col gap-8 animate-fadeIn text-slate-100">
      {/* Header Banner */}
      <div className="text-center flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mx-auto shadow-xs">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Step 1: Configure Your Practice Session</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Prepare Your Defense Topic
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Select a ready scenario below or enter your target question and reference context. VerbaPulse will evaluate your spoken answer in real time.
        </p>
      </div>

      {/* Persona Presets Grid */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          Select a Practice Scenario:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPersona(p)}
              className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all duration-200 cursor-pointer ${
                selectedPersona === p.id
                  ? 'bg-slate-900 border-blue-500 ring-1 ring-blue-500/50 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <span className="text-xs font-extrabold flex items-center justify-between">
                <span className="text-white">{p.label}</span>
                {selectedPersona === p.id && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
              </span>
              <span className="text-xs text-slate-400 line-clamp-2 leading-snug">{p.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Inputs Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col gap-6 backdrop-blur-xl">
        {/* Target Question */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            Target Question / Prompt You Need To Answer
          </label>
          <textarea
            value={targetQuestion}
            onChange={(e) => onTargetQuestionChange(e.target.value)}
            rows={2}
            className="w-full p-4 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:bg-slate-950 text-sm text-white placeholder-slate-500 outline-none transition-all resize-none font-sans"
            placeholder="e.g. Why did you choose lock-free ring buffers over standard locks?"
          />
        </div>

        {/* Ground Truth Context */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Background Context & Reference Notes (Ground Truth)
          </label>
          <textarea
            value={groundTruth}
            onChange={(e) => onGroundTruthChange(e.target.value)}
            rows={4}
            className="w-full p-4 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:bg-slate-950 text-sm text-white placeholder-slate-500 outline-none transition-all resize-none font-sans"
            placeholder="Paste abstract, presentation bullet points, system specs, or reference facts..."
          />
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <button
            onClick={handleTestMic}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              micTested
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Mic className={`w-4 h-4 ${micTested ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>{micTested ? 'Microphone Ready ✓' : 'Test Microphone'}</span>
          </button>

          <button
            onClick={onStartSession}
            disabled={!targetQuestion.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Live Copilot Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
