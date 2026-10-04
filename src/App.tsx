/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  Clock, 
  Timer as TimerIcon, 
  BookOpen, 
  Sliders, 
  Flashlight, 
  Volume2, 
  VolumeX, 
  Settings, 
  RefreshCw, 
  Radio, 
  MessageSquare,
  Compass,
  AlertCircle
} from 'lucide-react';
import { MobileFrame } from './components/MobileFrame';
import { AudioOrb } from './components/AudioOrb';
import { RemindersDrawer } from './components/RemindersDrawer';
import { TimersView } from './components/TimersView';
import { NotesView } from './components/NotesView';
import { DeviceControlsModal } from './components/DeviceControlsModal';
import { KnowledgeCard } from './components/KnowledgeCard';
import { Message, Reminder, TimerItem, NoteItem, DeviceSettings, ToolAction } from './types';
import { sounds, mayaAudioPlayer } from './utils/audioUtils';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'voice' | 'chat' | 'reminders' | 'timers' | 'notes'>('voice');
  
  // Voice & Assistant states
  const [assistantState, setAssistantState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Aoede' | 'Zephyr'>('Kore');
  const [handsFreeMode, setHandsFreeMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Input states
  const [textInput, setTextInput] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');

  // Device settings
  const [deviceSettings, setDeviceSettings] = useState<DeviceSettings>({
    flashlight: false,
    silentMode: false,
    batterySaver: false,
    doNotDisturb: false,
    brightness: 90,
    volume: 85,
    batteryLevel: 88,
  });
  const [showDeviceModal, setShowDeviceModal] = useState(false);

  // Data states (seeded with realistic Chandan assistant items)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'maya',
      text: "Hello Chandan! 👋 I'm Maya, your personal AI assistant. I'm ready to help you with reminders, deep knowledge searches, timers, daily notes, or device tasks. Tap the mic to talk with me in audio!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'voice',
    },
  ]);

  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: 'rem-1',
      title: 'Review system design & AI project milestones',
      time: 'Today 5:00 PM',
      category: 'Work',
      priority: 'high',
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rem-2',
      title: 'Hydration break & 15m evening walk',
      time: 'Today 7:30 PM',
      category: 'Health',
      priority: 'medium',
      completed: false,
      createdAt: new Date().toISOString(),
    },
  ]);

  const [timers, setTimers] = useState<TimerItem[]>([
    {
      id: 'timer-1',
      label: 'Deep Work Sprint',
      totalSeconds: 1500,
      remainingSeconds: 1500,
      isRunning: false,
    },
  ]);

  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: 'note-1',
      title: 'Voice Assistant Architecture',
      content: 'Maya provides audio-to-audio conversational processing using Gemini models with female English voice synthesis, local tool execution, and responsive mobile UI.',
      tag: 'Tech',
      createdAt: new Date().toISOString(),
    },
  ]);

  // Audio Recording references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const speechRecognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, assistantState]);

  // Real-time Countdown timer tick
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimers((prev) =>
        prev.map((t) => {
          if (!t.isRunning) return t;
          if (t.remainingSeconds <= 1) {
            sounds.playAlarmChime();
            return { ...t, remainingSeconds: 0, isRunning: false };
          }
          return { ...t, remainingSeconds: t.remainingSeconds - 1 };
        })
      );
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  // Web Speech recognition for live preview (optional enhancement)
  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            interim += event.results[i][0].transcript;
          }
          if (interim) {
            setLiveTranscript(interim);
          }
        };

        speechRecognitionRef.current = recognition;
      } catch (e) {
        console.warn('SpeechRecognition unavailable:', e);
      }
    }
  }, []);

  // Execute tools triggered by Maya
  const handleExecuteActions = (actions: ToolAction[]) => {
    for (const action of actions) {
      const { tool, args } = action;
      if (tool === 'set_reminder') {
        const newRem: Reminder = {
          id: 'rem-' + Date.now() + Math.random(),
          title: args.title || 'Reminder for Chandan',
          time: args.time || 'Later today',
          category: (args.category as any) || 'Personal',
          priority: (args.priority as any) || 'medium',
          completed: false,
          createdAt: new Date().toISOString(),
        };
        setReminders((prev) => [newRem, ...prev]);
      } else if (tool === 'set_timer_or_alarm') {
        const duration = args.durationSeconds || 300;
        const newTimer: TimerItem = {
          id: 't-' + Date.now(),
          label: args.label || (args.actionType === 'alarm' ? 'Morning Alarm' : 'Quick Timer'),
          totalSeconds: duration,
          remainingSeconds: duration,
          isRunning: true,
          isAlarm: args.actionType === 'alarm',
          alarmTime: args.alarmTime,
        };
        setTimers((prev) => [newTimer, ...prev]);
      } else if (tool === 'save_quick_note') {
        const newNote: NoteItem = {
          id: 'note-' + Date.now(),
          title: args.title || 'Voice Note',
          content: args.content || '',
          tag: args.tag || 'Personal',
          createdAt: new Date().toISOString(),
        };
        setNotes((prev) => [newNote, ...prev]);
      } else if (tool === 'device_control') {
        if (args.feature === 'flashlight') {
          setDeviceSettings((s) => ({ ...s, flashlight: args.value === 'on' || args.value === 'true' }));
        } else if (args.feature === 'silent_mode') {
          setDeviceSettings((s) => ({ ...s, silentMode: args.value === 'on' || args.value === 'true' }));
        } else if (args.feature === 'battery_saver') {
          setDeviceSettings((s) => ({ ...s, batterySaver: args.value === 'on' || args.value === 'true' }));
        } else if (args.feature === 'brightness') {
          const num = parseInt(args.value, 10);
          if (!isNaN(num)) setDeviceSettings((s) => ({ ...s, brightness: Math.min(100, Math.max(10, num)) }));
        }
      }
    }
  };

  // Send interaction to backend (Text or Audio)
  const sendToMaya = async (payload: { audio?: string; mimeType?: string; text?: string }) => {
    setAssistantState('thinking');
    setErrorMessage(null);

    // Add user message to transcript
    const userMsgId = 'msg-' + Date.now();
    const userText = payload.text || liveTranscript || '🎤 Spoken query to Maya';
    
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'chandan',
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: payload.audio ? 'voice' : 'text',
      },
    ]);

    setLiveTranscript('');

    try {
      // Build lightweight chat history for context
      const historyContext = messages.slice(-5).map((m) => ({
        role: m.sender === 'chandan' ? ('user' as const) : ('model' as const),
        text: m.text,
      }));

      const res = await fetch('/api/assistant/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio: payload.audio,
          mimeType: payload.mimeType,
          text: payload.text,
          history: historyContext,
          voiceName: selectedVoice,
          clientContext: {
            currentTime: new Date().toLocaleString(),
            remindersCount: reminders.filter((r) => !r.completed).length,
            activeTimers: timers.filter((t) => t.isRunning).length,
            flashlight: deviceSettings.flashlight,
            silent: deviceSettings.silentMode,
            battery: deviceSettings.batteryLevel,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      const mayaText = data.text || "I'm right here with you Chandan!";

      // Handle any tool executions returned
      if (data.actions && Array.isArray(data.actions)) {
        handleExecuteActions(data.actions);
      }

      // Add Maya's response to messages
      const mayaMsgId = 'maya-' + Date.now();
      setMessages((prev) => [
        ...prev,
        {
          id: mayaMsgId,
          sender: 'maya',
          text: mayaText,
          audioBase64: data.audio,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          toolActions: data.actions,
          type: 'voice',
        },
      ]);

      // Play female audio response
      if (!deviceSettings.silentMode) {
        setAssistantState('speaking');
        setIsSpeaking(true);

        const onFinishedSpeaking = () => {
          setIsSpeaking(false);
          setAssistantState('idle');
          // If hands-free mode is on, we can prompt or listen again
          if (handsFreeMode) {
            setTimeout(() => {
              startRecording();
            }, 800);
          }
        };

        if (data.audio) {
          // Play high-quality Gemini TTS WAV audio
          await mayaAudioPlayer.playBase64Wav(data.audio, onFinishedSpeaking);
        } else {
          // Fallback to warm Web Speech female voice
          mayaAudioPlayer.speakWithWebSpeech(mayaText, onFinishedSpeaking);
        }
      } else {
        setAssistantState('idle');
      }
    } catch (err: any) {
      console.error('Failed to communicate with Maya:', err);
      setErrorMessage(err.message || 'Could not reach Maya. Please check connection.');
      setAssistantState('idle');
    }
  };

  // Start Voice Recording
  const startRecording = async () => {
    sounds.playListenStart();
    setErrorMessage(null);
    setLiveTranscript('');
    mayaAudioPlayer.stop();
    setIsSpeaking(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Determine mimeType
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        sounds.playListenEnd();
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        stream.getTracks().forEach((track) => track.stop());

        if (audioBlob.size > 500) {
          // Convert Blob to Base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64Data = (reader.result as string).split(',')[1];
            sendToMaya({
              audio: base64Data,
              mimeType: mimeType.split(';')[0],
            });
          };
        } else {
          setAssistantState('idle');
        }
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setAssistantState('listening');

      // Speech recognition preview if available
      try {
        if (speechRecognitionRef.current) {
          speechRecognitionRef.current.start();
        }
      } catch {}

      // Recording timer
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access denied or error:', err);
      setErrorMessage('Microphone access needed for audio-to-audio. Tap to enable permissions or type below!');
      setAssistantState('idle');
      setIsRecording(false);
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    try {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    } catch {}

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Handle Text Submission
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || assistantState === 'thinking') return;
    const text = textInput.trim();
    setTextInput('');
    sendToMaya({ text });
  };

  // Replay a message audio
  const handleReplayAudio = (msg: Message) => {
    if (msg.audioBase64) {
      sounds.playTap();
      setIsSpeaking(true);
      setAssistantState('speaking');
      mayaAudioPlayer.playBase64Wav(msg.audioBase64, () => {
        setIsSpeaking(false);
        setAssistantState('idle');
      });
    } else {
      mayaAudioPlayer.speakWithWebSpeech(msg.text, () => {
        setIsSpeaking(false);
        setAssistantState('idle');
      });
    }
  };

  // Quick prompt chip clicked
  const handleChipClick = (prompt: string) => {
    sendToMaya({ text: prompt });
  };

  return (
    <MobileFrame activeScreenTitle="Maya AI">
      {/* Screen Brightness Overlay simulation */}
      <div 
        className="pointer-events-none fixed inset-0 z-40 transition-opacity"
        style={{
          backgroundColor: '#000000',
          opacity: Math.max(0, (100 - deviceSettings.brightness) * 0.007),
        }}
      />

      {/* Screen Flashlight simulation */}
      {deviceSettings.flashlight && (
        <div className="absolute inset-0 bg-amber-50 z-50 flex flex-col items-center justify-center p-6 text-slate-900 animate-in fade-in duration-200">
          <Flashlight className="w-20 h-20 text-amber-500 animate-bounce mb-4" />
          <h2 className="text-2xl font-black tracking-tight">Flashlight Active</h2>
          <p className="text-sm text-slate-600 mt-1 text-center max-w-xs">
            Illuminating Chandan's surroundings.
          </p>
          <button
            onClick={() => setDeviceSettings((s) => ({ ...s, flashlight: false }))}
            className="mt-8 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-xl active:scale-95 transition-all"
          >
            Turn Off Flashlight
          </button>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="p-3.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 p-0.5 shadow-md shadow-purple-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-300" />
              </div>
            </div>
            {isSpeaking && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white tracking-wide">Maya</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                Chandan's AI
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Voice: {selectedVoice} (English Female)</span>
            </div>
          </div>
        </div>

        {/* Top Header Right Controls */}
        <div className="flex items-center gap-1">
          {/* Hands-free mode toggle */}
          <button
            onClick={() => setHandsFreeMode(!handsFreeMode)}
            className={`p-2 rounded-xl border text-xs transition-all ${
              handsFreeMode
                ? 'bg-purple-600/30 border-purple-400 text-purple-200'
                : 'bg-slate-800/60 border-white/10 text-slate-400 hover:text-white'
            }`}
            title={handsFreeMode ? 'Hands-Free Loop Active' : 'Enable Hands-Free Continuous Mode'}
          >
            <Radio className={`w-4 h-4 ${handsFreeMode ? 'animate-pulse text-purple-300' : ''}`} />
          </button>

          {/* Device Controls Toggle */}
          <button
            onClick={() => setShowDeviceModal(true)}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors"
            title="Device Controls"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="mx-3 mt-2 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between z-30">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 font-bold px-1.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* TAB 1: VOICE / ORB VIEW */}
        {activeTab === 'voice' && (
          <div className="flex-1 flex flex-col items-center justify-between p-4 overflow-y-auto">
            {/* Greeting & Status */}
            <div className="w-full text-center pt-2">
              <p className="text-xs uppercase tracking-widest text-purple-400 font-bold">
                {assistantState === 'listening'
                  ? `Maya is listening to Chandan... (${recordingSeconds}s)`
                  : assistantState === 'thinking'
                  ? 'Maya is processing & preparing answer...'
                  : assistantState === 'speaking'
                  ? 'Maya is speaking...'
                  : 'Ready for Chandan'}
              </p>
              <h1 className="text-xl font-extrabold text-white mt-0.5">
                {assistantState === 'listening' ? 'Speak naturally...' : 'How can I assist you, Chandan?'}
              </h1>

              {/* Live transcript preview while recording */}
              {isRecording && liveTranscript && (
                <div className="mt-2 mx-auto max-w-xs px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-200 text-xs italic">
                  "{liveTranscript}"
                </div>
              )}
            </div>

            {/* Central Holographic Audio Orb */}
            <div className="my-auto flex flex-col items-center justify-center">
              <AudioOrb
                state={assistantState}
                isSpeaking={isSpeaking}
                size={230}
                onClick={() => {
                  if (isRecording) {
                    stopRecording();
                  } else {
                    startRecording();
                  }
                }}
              />

              <div className="mt-2 text-center">
                <button
                  onClick={() => {
                    if (isRecording) {
                      stopRecording();
                    } else {
                      startRecording();
                    }
                  }}
                  className={`px-5 py-2.5 rounded-full font-bold text-xs tracking-wide shadow-xl transition-all flex items-center gap-2 ${
                    isRecording
                      ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30 hover:bg-rose-600'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-95 shadow-purple-500/30'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>Tap to Stop & Send</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Tap Orb or Button to Talk</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Latest answer preview card on voice screen */}
            {messages.length > 0 && messages[messages.length - 1].sender === 'maya' && (
              <div className="w-full max-w-sm mb-2 p-3.5 rounded-2xl bg-slate-800/80 border border-white/10 backdrop-blur-md text-left shadow-lg">
                <div className="flex items-center justify-between text-xs text-purple-300 font-semibold mb-1">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Maya:
                  </span>
                  <button
                    onClick={() => handleReplayAudio(messages[messages.length - 1])}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    title="Replay Voice"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">
                  {messages[messages.length - 1].text}
                </p>

                {/* Show any tool cards associated */}
                {messages[messages.length - 1].toolActions?.map((act, i) => (
                  <KnowledgeCard key={i} action={act} />
                ))}
              </div>
            )}

            {/* Quick voice suggestion chips */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Quick Voice Prompts:</span>
                <span className="text-purple-300">Tap to Ask</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  'Remind me to check server logs at 6 PM',
                  'Explain quantum computing simply',
                  'Set a 5 minute timer',
                  'Turn on flashlight',
                  'Check weather in Tokyo',
                  'What is 18% tip on $145?',
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleChipClick(chip)}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-purple-600/30 border border-white/10 hover:border-purple-400 text-slate-200 whitespace-nowrap active:scale-95 transition-all shadow-sm"
                  >
                    "{chip}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHAT TRANSCRIPT VIEW */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900/60">
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3.5"
            >
              {messages.map((msg) => {
                const isChandan = msg.sender === 'chandan';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isChandan ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 shadow-md ${
                        isChandan
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-xs'
                          : 'bg-slate-800 border border-white/10 text-slate-100 rounded-bl-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] text-white/70 mb-1">
                        <span className="font-semibold">{isChandan ? 'Chandan' : 'Maya'}</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                      {/* Tool action card */}
                      {msg.toolActions?.map((act, idx) => (
                        <KnowledgeCard key={idx} action={act} />
                      ))}

                      {/* Audio replay button for Maya */}
                      {!isChandan && (
                        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                          <span className="text-purple-300 flex items-center gap-1">
                            <Volume2 className="w-3 h-3" /> Voice Ready
                          </span>
                          <button
                            onClick={() => handleReplayAudio(msg)}
                            className="text-[11px] font-semibold text-purple-200 hover:text-white px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-400/30"
                          >
                            Play Voice
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {assistantState === 'thinking' && (
                <div className="flex items-start gap-2">
                  <div className="p-3 rounded-2xl bg-slate-800 border border-white/10 text-xs text-purple-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
                    <span>Maya is thinking & executing tasks...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick text input box */}
            <form
              onSubmit={handleTextSubmit}
              className="p-3 border-t border-white/10 bg-slate-900/90 backdrop-blur-md flex items-center gap-2"
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Message Maya or ask anything..."
                className="flex-1 bg-slate-800 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />

              <button
                type="button"
                onClick={() => {
                  if (isRecording) {
                    stopRecording();
                  } else {
                    startRecording();
                  }
                }}
                className={`p-2.5 rounded-2xl border transition-all ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse border-rose-400'
                    : 'bg-slate-800 text-slate-300 hover:text-white border-white/10'
                }`}
                title="Voice Input"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={!textInput.trim() || assistantState === 'thinking'}
                className="p-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: REMINDERS VIEW */}
        {activeTab === 'reminders' && (
          <RemindersDrawer
            reminders={reminders}
            onToggleComplete={(id) => {
              sounds.playTap();
              setReminders((prev) =>
                prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
              );
            }}
            onDelete={(id) => {
              sounds.playTap();
              setReminders((prev) => prev.filter((r) => r.id !== id));
            }}
            onAdd={(newRem) => {
              sounds.playTap();
              setReminders((prev) => [
                {
                  ...newRem,
                  id: 'rem-' + Date.now(),
                  completed: false,
                  createdAt: new Date().toISOString(),
                },
                ...prev,
              ]);
            }}
          />
        )}

        {/* TAB 4: TIMERS VIEW */}
        {activeTab === 'timers' && (
          <TimersView
            timers={timers}
            onToggleTimer={(id) => {
              sounds.playTap();
              setTimers((prev) =>
                prev.map((t) => (t.id === id ? { ...t, isRunning: !t.isRunning } : t))
              );
            }}
            onResetTimer={(id) => {
              sounds.playTap();
              setTimers((prev) =>
                prev.map((t) => (t.id === id ? { ...t, remainingSeconds: t.totalSeconds, isRunning: false } : t))
              );
            }}
            onDeleteTimer={(id) => {
              sounds.playTap();
              setTimers((prev) => prev.filter((t) => t.id !== id));
            }}
            onAddTimer={(label, seconds, isAlarm, alarmTime) => {
              sounds.playTap();
              setTimers((prev) => [
                {
                  id: 't-' + Date.now(),
                  label,
                  totalSeconds: seconds,
                  remainingSeconds: seconds,
                  isRunning: true,
                  isAlarm,
                  alarmTime,
                },
                ...prev,
              ]);
            }}
          />
        )}

        {/* TAB 5: NOTES VIEW */}
        {activeTab === 'notes' && (
          <NotesView
            notes={notes}
            onAddNote={(newNote) => {
              sounds.playTap();
              setNotes((prev) => [
                {
                  ...newNote,
                  id: 'note-' + Date.now(),
                  createdAt: new Date().toISOString(),
                },
                ...prev,
              ]);
            }}
            onDeleteNote={(id) => {
              sounds.playTap();
              setNotes((prev) => prev.filter((n) => n.id !== id));
            }}
          />
        )}
      </main>

      {/* Bottom Navigation Tabs */}
      <nav className="p-2 bg-slate-950/90 backdrop-blur-md border-t border-white/10 flex items-center justify-around z-20">
        <button
          onClick={() => setActiveTab('voice')}
          className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
            activeTab === 'voice'
              ? 'text-purple-400 bg-purple-500/15'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Mic className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Maya Voice</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
            activeTab === 'chat'
              ? 'text-purple-400 bg-purple-500/15'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Transcript</span>
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
            activeTab === 'reminders'
              ? 'text-purple-400 bg-purple-500/15'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Reminders</span>
          {reminders.filter((r) => !r.completed).length > 0 && (
            <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-purple-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('timers')}
          className={`relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
            activeTab === 'timers'
              ? 'text-purple-400 bg-purple-500/15'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TimerIcon className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Timers</span>
          {timers.some((t) => t.isRunning) && (
            <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-pink-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
            activeTab === 'notes'
              ? 'text-purple-400 bg-purple-500/15'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Notes</span>
        </button>
      </nav>

      {/* Device Settings Modal */}
      {showDeviceModal && (
        <DeviceControlsModal
          settings={deviceSettings}
          onUpdate={setDeviceSettings}
          onClose={() => setShowDeviceModal(false)}
        />
      )}
    </MobileFrame>
  );
}
