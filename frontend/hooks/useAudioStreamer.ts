import { useState, useEffect, useRef, useCallback } from 'react';
import { getWsUrl } from '@/lib/config';

export type SignalType = 'GREEN' | 'AMBER' | 'RED';

export interface EvaluationEntry {
  timestamp: number;
  signal: SignalType;
  nudge: string;
  reasoning: string;
  pivot?: string;
  latencyMs: number;
  spokenText?: string;
  fillerWordsCount?: number;
  fillerWordsBreakdown?: Record<string, number>;
  technicalKeywords?: string[];
  technicalKeywordCount?: number;
  examinerSentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  isDodging?: boolean;
  aiFollowups?: string[];
}

export interface UseAudioStreamerProps {
  groundTruth: string;
  targetQuestion: string;
  backendWsUrl?: string;
}

export function useAudioStreamer({
  groundTruth,
  targetQuestion,
  backendWsUrl = getWsUrl('/ws/copilot')
}: UseAudioStreamerProps) {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isAudioMonitoring, setIsAudioMonitoring] = useState<boolean>(true);
  const [sessionTime, setSessionTime] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [partialTranscript, setPartialTranscript] = useState<string>('');
  const [currentSignal, setCurrentSignal] = useState<SignalType>('GREEN');
  const [currentNudge, setCurrentNudge] = useState<string>(
    'AssemblyAI Realtime STT active. State your core response clearly.'
  );
  const [suggestedPivot, setSuggestedPivot] = useState<string>('Methodology');
  const [latencyMs, setLatencyMs] = useState<number>(140);
  const [sttEngine, setSttEngine] = useState<string>('AssemblyAI Realtime STT');
  const [evalHistory, setEvalHistory] = useState<EvaluationEntry[]>([]);

  // New Live Metric States
  const [fillerWordsCount, setFillerWordsCount] = useState<number>(0);
  const [technicalKeywords, setTechnicalKeywords] = useState<string[]>([]);
  const [examinerSentiment, setExaminerSentiment] = useState<'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'>('NEUTRAL');
  const [isDodging, setIsDodging] = useState<boolean>(false);
  const [aiFollowups, setAiFollowups] = useState<string[]>([
    'Could you quantify the performance or financial impact under peak load?',
    'What specific fallback mechanism exists if primary assumptions fail?'
  ]);

  // Live Examiner Speech Synthesis state
  const [isExaminerSpeaking, setIsExaminerSpeaking] = useState<boolean>(false);
  const [activeExaminerQuestion, setActiveExaminerQuestion] = useState<string>('');

  const speakExaminerQuestion = useCallback((questionText: string) => {
    if (!questionText) return;
    setActiveExaminerQuestion(questionText);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(questionText);
      utterance.rate = 1.0;
      utterance.pitch = 0.95;
      utterance.onstart = () => setIsExaminerSpeaking(true);
      utterance.onend = () => setIsExaminerSpeaking(false);
      utterance.onerror = () => setIsExaminerSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Web Audio & WebSocket References
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const monitoringGainRef = useRef<GainNode | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  const sessionTimeRef = useRef(0);
  sessionTimeRef.current = sessionTime;
  const transcriptRef = useRef('');
  transcriptRef.current = transcript;
  const isStreamingRef = useRef(false);
  isStreamingRef.current = isStreaming;
  const isPausedRef = useRef(false);
  isPausedRef.current = isPaused;

  // Toggle mic audio feedback / monitoring (hearing your own audio)
  const toggleAudioMonitoring = useCallback(() => {
    setIsAudioMonitoring((prev) => {
      const next = !prev;
      if (monitoringGainRef.current) {
        monitoringGainRef.current.gain.value = next ? 0.8 : 0.0;
      }
      return next;
    });
  }, []);

  // Process incoming evaluation payload from FastAPI backend & AssemblyAI
  const handleBackendEvaluation = useCallback((data: any) => {
    if (data.type === 'setup_ack') {
      if (data.stt_engine) setSttEngine(data.stt_engine);
    } else if (data.type === 'evaluation') {
      const signal: SignalType = data.signal || 'GREEN';
      const nudge: string = data.nudge || 'Maintain clear architectural focus.';
      const reasoning: string = data.reasoning || '';
      const pivot: string = data.suggested_pivot || '';
      const lat: number = data.latency_ms || 150;
      const fillers: number = data.filler_words_count || 0;
      const techKw: string[] = data.technical_keywords || [];
      const sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = data.examiner_sentiment || 'NEUTRAL';
      const dodging: boolean = !!data.is_dodging;
      const followups: string[] = data.ai_followups || [];

      if (data.transcript) {
        setTranscript((prev) => {
          if (prev.includes(data.transcript)) return prev;
          return prev + ' ' + data.transcript;
        });
      }

      setCurrentSignal(signal);
      setCurrentNudge(nudge);
      if (pivot) setSuggestedPivot(pivot);
      setLatencyMs(lat);
      setFillerWordsCount(fillers);
      setTechnicalKeywords(techKw);
      setExaminerSentiment(sentiment);
      setIsDodging(dodging);
      if (followups.length > 0) setAiFollowups(followups);

      setEvalHistory((prev) => [
        ...prev,
        {
          timestamp: sessionTimeRef.current,
          signal,
          nudge,
          reasoning,
          pivot,
          latencyMs: lat,
          spokenText: data.transcript || transcriptRef.current.slice(-100),
          fillerWordsCount: fillers,
          fillerWordsBreakdown: data.filler_words_breakdown || {},
          technicalKeywords: techKw,
          technicalKeywordCount: data.technical_keyword_count || techKw.length,
          examinerSentiment: sentiment,
          isDodging: dodging,
          aiFollowups: followups
        }
      ]);
    }
  }, []);

  // Web Speech API client-side backup for instant visual transcription
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalStr = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalStr += trans + ' ';
          } else {
            interim += trans;
          }
        }

        if (finalStr) {
          setTranscript((prev) => {
            const next = prev + finalStr;
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: 'transcript',
                  text: next,
                  timestamp: sessionTimeRef.current
                })
              );
            }
            return next;
          });
        }
        setPartialTranscript(interim);
      };

      recognition.onerror = () => {};
      recognition.onend = () => {
        if (isStreamingRef.current && !isPausedRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (_) {}
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Speech recognition setup error:', err);
    }
  }, [isStreaming, isPaused]);

  // Start Session
  const startSession = useCallback(async () => {
    try {
      setSessionTime(0);
      setTranscript('');
      setPartialTranscript('');
      setEvalHistory([]);
      setCurrentSignal('GREEN');
      setCurrentNudge('AssemblyAI Realtime STT active. State your core thesis methodology clearly.');

      // 1. Setup AudioContext & MediaStream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: { ideal: 16000 },
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      // 2. Setup Audio Monitoring (Allow user to hear their own audio)
      const sourceNode = audioCtx.createMediaStreamSource(stream);
      const monitorGain = audioCtx.createGain();
      monitorGain.gain.value = isAudioMonitoring ? 0.8 : 0.0;
      sourceNode.connect(monitorGain);
      monitorGain.connect(audioCtx.destination);
      monitoringGainRef.current = monitorGain;

      // 3. Add AudioWorklet 16kHz PCM downsampler
      await audioCtx.audioWorklet.addModule('/audio-processor.js');

      const workletNode = new AudioWorkletNode(audioCtx, 'audio-processor');
      workletNodeRef.current = workletNode;

      // 4. Connect Telemetry & Audio Streaming WebSocket
      try {
        const ws = new WebSocket(backendWsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          ws.send(
            JSON.stringify({
              type: 'setup',
              ground_truth: groundTruth,
              target_question: targetQuestion
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleBackendEvaluation(data);
          } catch (e) {
            console.error('WebSocket parse error:', e);
          }
        };

        ws.onerror = (e) => {
          console.warn('WebSocket connection warning:', e);
        };
      } catch (err) {
        console.warn('WebSocket connection error:', err);
      }

      // Handle raw 16kHz PCM ArrayBuffer binary frames from AudioWorklet
      workletNode.port.onmessage = (event) => {
        const pcmBuffer = event.data;
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !isPausedRef.current) {
          wsRef.current.send(pcmBuffer);
        }
      };

      // Audio volume / RMS visualizer calculation
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      sourceNode.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!mediaStreamRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);
        if (isStreaming) {
          requestAnimationFrame(updateVolume);
        }
      };

      sourceNode.connect(workletNode);

      // 5. Client speech recognition backup
      initSpeechRecognition();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (_) {}
      }

      // 6. Session timer
      setIsStreaming(true);
      setIsPaused(false);
      requestAnimationFrame(updateVolume);

      timerIntervalRef.current = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Audio streamer initialization error:', err);
      alert('Microphone permission or audio setup error. Please check browser permissions.');
    }
  }, [backendWsUrl, groundTruth, targetQuestion, handleBackendEvaluation, initSpeechRecognition, isStreaming, isPaused, isAudioMonitoring]);

  // Stop Session
  const stopSession = useCallback(() => {
    setIsStreaming(false);
    setIsPaused(false);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }

    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    if (monitoringGainRef.current) {
      monitoringGainRef.current.disconnect();
      monitoringGainRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setAudioLevel(0);
  }, []);

  // Toggle Pause
  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return {
    isStreaming,
    isPaused,
    isAudioMonitoring,
    sessionTime,
    audioLevel,
    transcript,
    partialTranscript,
    currentSignal,
    currentNudge,
    suggestedPivot,
    latencyMs,
    sttEngine,
    evalHistory,
    fillerWordsCount,
    technicalKeywords,
    examinerSentiment,
    isDodging,
    aiFollowups,
    isExaminerSpeaking,
    activeExaminerQuestion,
    speakExaminerQuestion,
    startSession,
    stopSession,
    togglePause,
    toggleAudioMonitoring
  };
}

