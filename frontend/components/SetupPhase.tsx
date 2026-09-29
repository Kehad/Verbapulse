'use client';

import React, { useState } from 'react';
import { Sparkles, Mic, FileText, HelpCircle, ArrowRight, Play, CheckCircle2, Sliders } from 'lucide-react';

export interface ExaminerPersona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  description: string;
}

export const EXAMINER_PERSONAS: ExaminerPersona[] = [
  {
    id: 'prof_vance',
    name: 'Prof. Vance',
    role: 'Strict Academic Chair',
    avatar: '👨‍🏫',
    description: 'Demands mathematical proof, precise terminology, and latency benchmarks.'
  },
  {
    id: 'dr_maya',
    name: 'Dr. Maya',
    role: 'Principal System Architect',
    avatar: '👩‍💻',
    description: 'Focuses on lock-free concurrency, edge-case failures, and horizontal scaling.'
  },
  {
    id: 'alex_investor',
    name: 'Alex',
    role: 'Venture Capital Partner',
    avatar: '💼',
    description: 'Challenges ROI, execution speed, defensibility, and market differentiation.'
  },
  {
    id: 'sarah_lead',
    name: 'Sarah',
    role: 'Senior Tech Lead',
    avatar: '🕵️‍♀️',
    description: 'Evaluates code design patterns, modularity, error recovery, and maintainability.'
  }
];

interface SetupPhaseProps {
  groundTruth: string;
  targetQuestion: string;
  selectedExaminer?: string;
  onGroundTruthChange: (val: string) => void;
  onTargetQuestionChange: (val: string) => void;
  onSelectExaminer?: (examinerId: string) => void;
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
  selectedExaminer = 'prof_vance',
  onGroundTruthChange,
  onTargetQuestionChange,
  onSelectExaminer,
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
    <div className="w-full max-w-4xl flex flex-col gap-8 animate-fadeIn text-white">
      {/* Header Banner */}
      <div className="text-center flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-white text-xs font-semibold mx-auto">
          <Sparkles className="w-4 h-4 text-white" />
          <span>Voice Session Setup</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Talk to AI Voice Companion
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Speak into your microphone. The AI will listen to your voice and respond back out loud.
        </p>
      </div>

      {/* AI Mock Examiner Selection Grid */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white" />
          Select AI Voice Persona:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EXAMINER_PERSONAS.map((ex) => (
            <button
              key={ex.id}
              onClick={() => onSelectExaminer && onSelectExaminer(ex.id)}
              className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all duration-200 cursor-pointer ${
                selectedExaminer === ex.id
                  ? 'bg-neutral-900 border-white text-white shadow-md'
                  : 'bg-black border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{ex.avatar}</span>
                {selectedExaminer === ex.id && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">{ex.name}</span>
                <span className="text-[10px] text-neutral-400 font-mono">{ex.role}</span>
              </div>
              <span className="text-[11px] text-neutral-400 line-clamp-2 leading-tight">{ex.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Persona Presets Grid */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-white" />
          Select Sample Topic:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPersona(p)}
              className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all duration-200 cursor-pointer ${
                selectedPersona === p.id
                  ? 'bg-neutral-900 border-white text-white shadow-md'
                  : 'bg-black border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white'
              }`}
            >
              <span className="text-xs font-bold flex items-center justify-between">
                <span className="text-white">{p.label}</span>
                {selectedPersona === p.id && <CheckCircle2 className="w-4 h-4 text-white" />}
              </span>
              <span className="text-xs text-neutral-400 line-clamp-2 leading-snug">{p.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Inputs Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-black border border-neutral-800 shadow-2xl flex flex-col gap-6">
        {/* Target Question */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-white" />
            Your Question or Topic
          </label>
          <textarea
            value={targetQuestion}
            onChange={(e) => onTargetQuestionChange(e.target.value)}
            rows={2}
            className="w-full p-4 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white text-sm text-white placeholder-neutral-500 outline-none transition-all resize-none font-sans"
            placeholder="e.g. What is the performance impact of your system?"
          />
        </div>

        {/* Ground Truth Context */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-white" />
            Notes or Details (Optional)
          </label>
          <textarea
            value={groundTruth}
            onChange={(e) => onGroundTruthChange(e.target.value)}
            rows={4}
            className="w-full p-4 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white text-sm text-white placeholder-neutral-500 outline-none transition-all resize-none font-sans"
            placeholder="Paste any context or reference notes you want the AI to know about..."
          />
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-800">
          <button
            onClick={handleTestMic}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              micTested
                ? 'bg-neutral-900 border-neutral-700 text-white'
                : 'bg-black border-neutral-800 hover:bg-neutral-900 text-neutral-300'
            }`}
          >
            <Mic className="w-4 h-4 text-white" />
            <span>{micTested ? 'Microphone Ready ✓' : 'Test Microphone'}</span>
          </button>

          <button
            onClick={onStartSession}
            disabled={!targetQuestion.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black text-black" />
            <span>Start Voice Conversation</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
};
