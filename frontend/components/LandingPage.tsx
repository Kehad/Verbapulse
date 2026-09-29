'use client';

import React from 'react';
import {
  Shield,
  Zap,
  Radio,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Activity,
  Award,
  ArrowRight,
  Brain,
  Sliders,
  Target
} from 'lucide-react';

interface LandingPageProps {
  onSelectMode: (mode: 'VOICE_STUDIO' | 'TEST_SIMULATOR') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectMode }) => {
  return (
    <div className="w-full flex flex-col gap-16 py-6 animate-fadeIn text-slate-100">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center text-center gap-6 max-w-4xl mx-auto pt-6 pb-10">

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-xs">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Real-Time Voice AI Agent & Conversational Studio</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white">
          Speak With AI Naturally.{' '}
          <span className="text-cyan-400">
            Real-Time Voice Studio.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed font-normal">
          <strong className="text-white font-bold">VerbaPulse</strong> provides instant, full-duplex conversational voice AI—talk to an intelligent agent with your mic and listen to real-time responses out loud.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full sm:w-auto">
          <button
            onClick={() => onSelectMode('VOICE_STUDIO')}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 group cursor-pointer"
          >
            <Radio className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            <span>Launch Voice AI Studio</span>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onSelectMode('TEST_SIMULATOR')}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white font-bold text-sm shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 group cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Practice Interview Simulator</span>
          </button>
        </div>

        {/* Quick Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>Sub-300ms Speech Latency</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>AssemblyAI Speech Recognition</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-rose-400" />
            <span>Live Coral Drift Warnings</span>
          </div>
        </div>
      </section>

      {/* Interactive Telemetry HUD Preview Showcase */}
      <section className="relative max-w-5xl mx-auto w-full">
        <div className="p-1 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl backdrop-blur-xl">
          <div className="bg-slate-950/90 rounded-[22px] p-6 sm:p-8 border border-slate-800/80 flex flex-col gap-6">

            {/* Mock Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  VerbaPulse Telemetry HUD • Active Session
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <span>138ms Latency</span>
              </div>
            </div>

            {/* Signal Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-emerald-400 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                    Mint Status
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">On Track</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  "Your explanation matches baseline reference data with high accuracy."
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-blue-400 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400" />
                    Sapphire Nudge
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300">Coaching</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  "Highlight latency reduction benchmarks to reinforce technical depth."
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-rose-400 flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5 text-rose-400" />
                    Coral Warning
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300">Filler Alert</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  "3 filler words ('um') detected. Pause briefly before your next sentence."
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="max-w-6xl mx-auto w-full flex flex-col gap-8">
        <div className="text-center flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Engineered for Success</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Why Professionals Choose VerbaPulse</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Real-time speech intelligence designed to help you communicate clearly and answer questions with complete authority.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4 hover:border-blue-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Radio className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-base text-white">Live Visual Telemetry</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive real-time signal feedback as you speak into your microphone.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4 hover:border-emerald-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-base text-white">Speech Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tracks filler words ('um', 'uh'), topic drift, examiner tone, and key terminology.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4 hover:border-indigo-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Sliders className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-base text-white">Adaptive AI Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generates questions that adjust difficulty from Junior to Senior tier based on answer accuracy.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4 hover:border-rose-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-base text-white">STAR Scorecards</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Detailed post-session reports with confidence ratings and recommended answer models.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-4xl mx-auto w-full text-center p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Ready to Master Your Verbal Defense?</h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto">
            Choose a mode below to start practicing immediately with VerbaPulse real-time AI voice feedback.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => onSelectMode('VOICE_STUDIO')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-sm transition-all cursor-pointer shadow-lg shadow-cyan-500/25"
          >
            Launch Voice Studio
          </button>
          <button
            onClick={() => onSelectMode('TEST_SIMULATOR')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all border border-slate-700 cursor-pointer"
          >
            Practice Simulator
          </button>
        </div>
      </section>
    </div>
  );
};
