'use client';

import { useState, useRef, useEffect } from 'react';
import { QuestionItem, EvaluationResult } from '@/components/test-simulator/types';

export function useTestSimulator() {
  // Step State: 1 = Config, 2 = Question Answering, 3 = Question Grade, 4 = Final Scorecard
  const [step, setStep] = useState<number>(1);
  const [domain, setDomain] = useState<string>('Embedded Systems Thesis Defense');
  const [questionCount, setQuestionCount] = useState<number>(2);
  const [difficultyLevel, setDifficultyLevel] = useState<string>('junior');
  const [adaptiveMode, setAdaptiveMode] = useState<boolean>(true);
  const [adaptiveNotice, setAdaptiveNotice] = useState<string>('');

  // Questions & Navigation State
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Response input mode: 'RECORD' (Microphone) or 'TEXT' (Text Area)
  const [answerMode, setAnswerMode] = useState<'RECORD' | 'TEXT'>('RECORD');
  const [textAnswer, setTextAnswer] = useState<string>('');

  // Audio Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordTimer, setRecordTimer] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // Spoken AI Feedback Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [currentEval, setCurrentEval] = useState<EvaluationResult | null>(null);
  const [cumulativeReport, setCumulativeReport] = useState<any>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Per-Question Timer State (Time limit per question in seconds: e.g. 60)
  const [timePerQuestion, setTimePerQuestion] = useState<number>(60);
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoEvaluatedRef = useRef<boolean>(false);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  // Per-Question Countdown Timer Effect
  useEffect(() => {
    if (step === 2 && timePerQuestion > 0) {
      setTimeRemaining(timePerQuestion);
      hasAutoEvaluatedRef.current = false;

      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
      }

      questionTimerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (questionTimerRef.current) clearInterval(questionTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
      }
    }

    return () => {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
      }
    };
  }, [step, currentIndex, timePerQuestion]);

  // Auto-submit / evaluate answer when timer expires
  useEffect(() => {
    if (step === 2 && timePerQuestion > 0 && timeRemaining === 0 && !hasAutoEvaluatedRef.current && !loading) {
      hasAutoEvaluatedRef.current = true;
      if (isRecording) {
        handleStopRecording();
      }
      const autoSubTimeout = setTimeout(() => {
        handleEvaluateAnswer();
      }, 700);
      return () => clearTimeout(autoSubTimeout);
    }
  }, [timeRemaining, step, timePerQuestion, loading, isRecording]);

  // Auto-play ElevenLabs spoken feedback audio when step 3 opens
  useEffect(() => {
    if (step === 3 && currentEval?.audio_base64) {
      try {
        const audioUrl = currentEval.audio_base64.startsWith('data:')
          ? currentEval.audio_base64
          : `data:audio/mp3;base64,${currentEval.audio_base64}`;
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => setIsPlayingAudio(false);
        audio.onpause = () => setIsPlayingAudio(false);
        audio.onplay = () => setIsPlayingAudio(true);

        audio.play().catch((err) => {
          console.warn('Auto-play prevented by browser policy (click play to listen):', err);
        });
        setIsPlayingAudio(true);
      } catch (e) {
        console.error('Audio playback error:', e);
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [step, currentEval]);

  // Initialize Speech Recognition fallback
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let fullStr = '';
          for (let i = 0; i < event.results.length; i++) {
            fullStr += event.results[i][0].transcript + ' ';
          }
          setTranscript(fullStr.trim());
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.error('Speech recognition error in test simulator:', e);
      }
    }
  }, []);

  const handleStartRecording = async () => {
    setTranscript('');
    setAudioBlob(null);
    audioChunksRef.current = [];
    setRecordTimer(0);
    setIsRecording(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (_) { }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
    } catch (e) {
      console.warn('MediaRecorder setup error:', e);
    }

    timerRef.current = setInterval(() => {
      setRecordTimer((prev) => prev + 1);
    }, 1000);
  };

  const handleStopRecording = (): Promise<Blob | null> => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) { }
    }

    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = () => {
          const mimeType = recorder.mimeType || 'audio/webm';
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          setAudioBlob(blob);
          if (recorder.stream) {
            recorder.stream.getTracks().forEach((track) => track.stop());
          }
          resolve(blob);
        };
        try {
          recorder.stop();
        } catch (e) {
          console.warn('Error stopping MediaRecorder:', e);
          const fallbackBlob = audioChunksRef.current.length > 0 ? new Blob(audioChunksRef.current, { type: 'audio/webm' }) : null;
          resolve(fallbackBlob);
        }
      } else {
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioBlob(blob);
          resolve(blob);
        } else {
          resolve(audioBlob);
        }
      }
    });
  };

  // Step 1: Generate Questions
  const handleGenerateQuestions = async () => {
    setLoading(true);
    setAdaptiveNotice('');
    try {
      const resp = await fetch(`${baseUrl}/api/v1/test-interview/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          question_count: questionCount,
          difficulty_level: difficultyLevel,
          adaptive_mode: adaptiveMode,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setQuestions(data.questions || []);
        setCurrentIndex(0);
        setStep(2);
      } else {
        alert('Failed to generate test interview questions. Ensure backend server is running.');
      }
    } catch (err) {
      console.error('Error generating questions:', err);
      alert('Backend connection error. Please check your server setup.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit & Grade Current Answer via 3-Endpoint Pipeline
  const handleEvaluateAnswer = async () => {
    if (questions.length === 0) return;
    const currentQ = questions[currentIndex];
    setLoading(true);

    try {
      let candidateTranscript = textAnswer.trim();

      // Ensure recording is stopped and audio blob is resolved before transcription
      let activeAudioBlob: Blob | null = audioBlob;
      if (isRecording) {
        activeAudioBlob = await handleStopRecording();
      } else if (!activeAudioBlob && audioChunksRef.current.length > 0) {
        activeAudioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
        setAudioBlob(activeAudioBlob);
      }

      // --- ENDPOINT 1: AssemblyAI Speech-to-Text ---
      if (answerMode === 'RECORD' && activeAudioBlob && activeAudioBlob.size > 0) {
        try {
          const formData = new FormData();
          const mimeType = activeAudioBlob.type || 'audio/webm';
          const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : mimeType.includes('wav') ? 'wav' : 'webm';
          formData.append('audio_file', activeAudioBlob, `answer.${ext}`);

          const sttResp = await fetch(`${baseUrl}/api/v1/speech-to-text`, {
            method: 'POST',
            body: formData,
          });

          if (sttResp.ok) {
            const sttData = await sttResp.json();
            if (sttData.transcript && sttData.transcript.trim()) {
              candidateTranscript = sttData.transcript.trim();
              setTranscript(candidateTranscript);
            }
          } else {
            const errText = await sttResp.text();
            console.warn('AssemblyAI Speech-to-Text endpoint returned error:', sttResp.status, errText);
          }
        } catch (sttErr) {
          console.warn('AssemblyAI speech-to-text conversion error:', sttErr);
        }
      }

      if (!candidateTranscript) {
        candidateTranscript = transcript || 'No candidate response captured.';
      }

      // --- ENDPOINT 2: LLM Response (Gemini Evaluation Engine) ---
      const llmResp = await fetch(`${baseUrl}/api/v1/llm-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: currentQ.question_id,
          question_text: currentQ.question_text,
          evaluation_criteria: currentQ.evaluation_criteria || [],
          transcript: candidateTranscript,
          difficulty_level: difficultyLevel,
          adaptive_mode: adaptiveMode,
        }),
      });

      if (!llmResp.ok) {
        const errDetail = await llmResp.text();
        alert(`Failed to evaluate answer via LLM response endpoint: ${errDetail}`);
        return;
      }

      const evalResult: EvaluationResult = await llmResp.json();
      console.log(evalResult, 'evalresult');

      // --- ENDPOINT 3: Text-to-Audio (ElevenLabs TTS) ---
      try {
        const responseTextForTTS = `${evalResult.actionable_improvements || ''} ${evalResult.ideal_response_summary || ''}`.trim();

        if (responseTextForTTS) {
          const ttsResp = await fetch(`${baseUrl}/api/v1/elevenlabs/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: responseTextForTTS,
              voice_id: 'JBFqnCBsd6RMkjVDRZzb',
              model_id: 'eleven_v3',
              return_json: true,
            }),
          });

          if (ttsResp.ok) {
            const ttsData = await ttsResp.json();
            if (ttsData.audio_base64) {
              evalResult.audio_base64 = ttsData.audio_base64;
            }
          } else {
            console.warn('ElevenLabs TTS endpoint returned non-OK status; proceeding with text evaluation.');
          }
        }
      } catch (ttsErr) {
        console.warn('ElevenLabs text-to-audio conversion error:', ttsErr);
      }

      setCurrentEval(evalResult);
      setEvaluations((prev) => [...prev, evalResult]);

      // Adaptive Difficulty Progression Notice
      if (adaptiveMode && (evalResult as any).next_recommended_difficulty) {
        const nextDiff = (evalResult as any).next_recommended_difficulty;
        if (nextDiff !== difficultyLevel) {
          setAdaptiveNotice(
            `Adaptive Difficulty Level Updated: Tier shifted from ${difficultyLevel} to ${nextDiff} based on your performance score of ${evalResult.overall_score}/100.`
          );
          setDifficultyLevel(nextDiff);
        }
      }
      setStep(3);
    } catch (err) {
      console.error('Error in 3-endpoint pipeline:', err);
      alert('Backend grading connection error. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Next Question or View Scorecard
  const handleNextQuestion = async () => {
    setAdaptiveNotice('');
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setTranscript('');
      setTextAnswer('');
      setAudioBlob(null);
      setStep(2);
    } else {
      // Final question answered - Generate Cumulative Scorecard
      setLoading(true);
      try {
        const resp = await fetch(`${baseUrl}/api/v1/test-interview/cumulative-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain,
            format: 'Technical Deep Dive',
            evaluations: evaluations,
          }),
        });
        if (resp.ok) {
          const report = await resp.json();
          setCumulativeReport(report);
          setStep(4);
        } else {
          setStep(4);
        }
      } catch (err) {
        console.error('Cumulative report error:', err);
        setStep(4);
      } finally {
        setLoading(false);
      }
    }
  };

  const togglePlayAudio = () => {
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const resetSession = () => {
    setStep(1);
    setEvaluations([]);
    setCurrentEval(null);
    setCumulativeReport(null);
  };

  const currentQ = questions[currentIndex];

  return {
    step,
    domain,
    setDomain,
    questionCount,
    setQuestionCount,
    difficultyLevel,
    setDifficultyLevel,
    adaptiveMode,
    setAdaptiveMode,
    adaptiveNotice,
    timePerQuestion,
    setTimePerQuestion,
    timeRemaining,
    questions,
    currentIndex,
    currentQ,
    loading,
    answerMode,
    setAnswerMode,
    textAnswer,
    setTextAnswer,
    isRecording,
    recordTimer,
    transcript,
    audioBlob,
    isPlayingAudio,
    evaluations,
    currentEval,
    cumulativeReport,
    handleStartRecording,
    handleStopRecording,
    handleGenerateQuestions,
    handleEvaluateAnswer,
    handleNextQuestion,
    togglePlayAudio,
    resetSession,
  };
}
