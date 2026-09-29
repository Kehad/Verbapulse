'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { LandingPage } from '@/components/LandingPage';
import { TestSimulatorPhase } from '@/components/TestSimulatorPhase';
import { VoiceConversationInterface } from '@/components/VoiceConversationInterface';
import { Radio, BookOpen, FileText, ExternalLink, Sparkles } from 'lucide-react';
import logo from "@/public/logo.png";

type AppMode = 'LANDING' | 'VOICE_STUDIO' | 'TEST_SIMULATOR';

export default function Home() {
  const [mode, setMode] = useState<AppMode>('VOICE_STUDIO');
  const [backendHealth, setBackendHealth] = useState<boolean | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000' || 'https://verbalpulse-backend.onrender.com';

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

  return (
    <main className="min-h-screen bg-[#14171d] text-white flex flex-col font-sans relative overflow-hidden">
      {/* Top Navbar */}
      <header className="w-full border-b border-neutral-800 bg-[#14171d]/95 backdrop-blur-xl sticky top-0 z-50 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode('LANDING')}
            className="flex items-center gap-3 group text-left cursor-pointer"
          >
            <Image src={logo} alt="logo" width={50} height={50}/>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  VerbaPulse
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-slate-300 font-mono font-semibold">
                  Voice Agent Studio
                </span>
                {backendHealth !== null && (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px]">
                    <span className={`w-2 h-2 rounded-full ${backendHealth ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />
                    <span className="text-white font-medium">
                      {backendHealth ? 'Online' : 'Offline'}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[11px] text-neutral-400 tracking-wide font-medium">
                Talk to AI with your voice & listen to responses out loud
              </span>
            </div>
          </button>
        </div>

        {/* Mode Switcher Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setMode('LANDING')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'LANDING'
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setMode('VOICE_STUDIO')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mode === 'VOICE_STUDIO'
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Voice Studio</span>
            </button>

            <button
              onClick={() => setMode('TEST_SIMULATOR')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mode === 'TEST_SIMULATOR'
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-white" />
              <span>Practice Interview</span>
            </button>
          </div>

          <a
            href={`${backendUrl}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-medium transition-all"
            title="API Documentation"
          >
            <FileText className="w-3.5 h-3.5 text-white" />
            <span>API Docs</span>
            <ExternalLink className="w-3 h-3 text-neutral-500" />
          </a>
        </div>
      </header>

      {/* Main App Canvas */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10 flex flex-col items-center justify-center">
        {mode === 'LANDING' && (
          <LandingPage onSelectMode={() => setMode('VOICE_STUDIO')} />
        )}

        {mode === 'VOICE_STUDIO' && (
          <VoiceConversationInterface />
        )}

        {mode === 'TEST_SIMULATOR' && (
          <TestSimulatorPhase />
        )}
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-800 bg-[#14171d] py-4 px-6 text-center text-xs text-neutral-400 font-sans flex items-center justify-between">
        <span>VerbaPulse &copy; 2026 AI Voice Agent Studio (AssemblyAI STT + Gemini LLM)</span>
        <span className="hidden sm:inline-block text-cyan-400 font-semibold">AssemblyAI Voice Agent Edition v2.0</span>
      </footer>
    </main>
  );
}
