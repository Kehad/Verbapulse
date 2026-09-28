'use client';

import React, { useState, useEffect } from 'react';
import { useAudioStreamer } from '@/hooks/useAudioStreamer';
import { LandingPage } from '@/components/LandingPage';
import { SetupPhase } from '@/components/SetupPhase';
import { TrafficLightIndicator } from '@/components/TrafficLightIndicator';
import { DebriefPhase } from '@/components/DebriefPhase';
import { TestSimulatorPhase } from '@/components/TestSimulatorPhase';
import { Shield, Radio, BookOpen, FileText, ExternalLink, Sparkles } from 'lucide-react';

type AppMode = 'LANDING' | 'LIVE_COPILOT' | 'TEST_SIMULATOR';
type AppPhase = 'SETUP' | 'LIVE_SESSION' | 'DEBRIEF';

export default function Home() {
  const [mode, setMode] = useState<AppMode>('LANDING');
  const [phase, setPhase] = useState<AppPhase>('SETUP');
  const [backendHealth, setBackendHealth] = useState<boolean | null>(null);

  const [groundTruth, setGroundTruth] = useState<string>(
    'Thesis Abstract: Our event storage system uses lock-free buffers to reduce thread waiting times. Benchmarks show 4.2x higher throughput and under 15ms latency at 100k events/sec.'
  );
  const [targetQuestion, setTargetQuestion] = useState<string>(
    'Why did you choose lock-free ring buffers over standard locks for event processing?'
  );

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  const backendWsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/copilot';

  const streamer = useAudioStreamer({
    groundTruth,
    targetQuestion,
    backendWsUrl,
  });

  // Health check ping to backend
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch(`${backendUrl}/health`);
        if (res.ok) {
          setBackendHealth(true);
        } else {
          setBackendHealth(false);
        }
      } catch (e) {
        setBackendHealth(false);
      }
    }
    checkHealth();
  }, [backendUrl]);

  const handleStartSession = async () => {
    setPhase('LIVE_SESSION');
    await streamer.startSession();
  };

  const handleStopSession = () => {
    streamer.stopSession();
    setPhase('DEBRIEF');
  };

  const handleRestart = () => {
    streamer.stopSession();
    setPhase('SETUP');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white relative overflow-hidden">
      {/* Neon Sapphire & Mint Ambient Backdrop */}
      {/* Top Navbar */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode('LANDING')}
            className="flex items-center gap-3 group text-left cursor-pointer"
          >
            <Shield className="w-8 h-8 text-blue-500 shrink-0" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  VerbaPulse
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono font-bold">
                  v2.0 Telemetry
                </span>
                {backendHealth !== null && (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono">
                    <span className={`w-2 h-2 rounded-full ${backendHealth ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                    <span className={backendHealth ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                      {backendHealth ? 'API Online' : 'Offline'}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
                Real-Time Voice Telemetry & Defense Copilot
              </span>
            </div>
          </button>
        </div>

        {/* Mode Switcher Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setMode('LANDING')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'LANDING'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setMode('LIVE_COPILOT')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'LIVE_COPILOT'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              <span>Live Copilot</span>
            </button>

            <button
              onClick={() => setMode('TEST_SIMULATOR')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'TEST_SIMULATOR'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Practice Simulator</span>
            </button>
          </div>

          <a
            href={`${backendUrl}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-blue-300 text-xs font-semibold transition-all group"
            title="Open FastAPI Swagger Interactive Documentation"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
            <span>API Docs</span>
            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400" />
          </a>
        </div>
      </header>

      {/* Main App Canvas */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10 flex flex-col items-center justify-center">
        {mode === 'LANDING' && (
          <LandingPage onSelectMode={(m) => setMode(m)} />
        )}

        {mode === 'TEST_SIMULATOR' && (
          <TestSimulatorPhase />
        )}

        {mode === 'LIVE_COPILOT' && (
          <>
            {phase === 'SETUP' && (
              <SetupPhase
                groundTruth={groundTruth}
                targetQuestion={targetQuestion}
                onGroundTruthChange={setGroundTruth}
                onTargetQuestionChange={setTargetQuestion}
                onStartSession={handleStartSession}
              />
            )}

            {phase === 'LIVE_SESSION' && (
              <TrafficLightIndicator
                currentSignal={streamer.currentSignal}
                currentNudge={streamer.currentNudge}
                suggestedPivot={streamer.suggestedPivot}
                latencyMs={streamer.latencyMs}
                sessionTime={streamer.sessionTime}
                audioLevel={streamer.audioLevel}
                transcript={streamer.transcript}
                partialTranscript={streamer.partialTranscript}
                sttEngine={streamer.sttEngine}
                isStreaming={streamer.isStreaming}
                isPaused={streamer.isPaused}
                isAudioMonitoring={streamer.isAudioMonitoring}
                fillerWordsCount={streamer.fillerWordsCount}
                technicalKeywords={streamer.technicalKeywords}
                examinerSentiment={streamer.examinerSentiment}
                isDodging={streamer.isDodging}
                aiFollowups={streamer.aiFollowups}
                onPauseToggle={streamer.togglePause}
                onStopSession={handleStopSession}
                onToggleAudioMonitoring={streamer.toggleAudioMonitoring}
              />
            )}

            {phase === 'DEBRIEF' && (
              <DebriefPhase
                groundTruth={groundTruth}
                targetQuestion={targetQuestion}
                transcript={streamer.transcript}
                evalHistory={streamer.evalHistory}
                onRestart={handleRestart}
              />
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-400 font-sans flex items-center justify-between">
        <span>VerbaPulse &copy; 2026 Voice Telemetry Copilot (AssemblyAI STT + Gemini LLM)</span>
        <span className="hidden sm:inline-block text-blue-400 font-semibold">AssemblyAI Hackathon Edition v2.0</span>
      </footer>
    </main>
  );
}
