
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  MessageCircle, 
  X, 
  Send,
  Bot,
  User,
  Mic,
  Square,
  Play
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import ReactMarkdown from 'react-markdown';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "Hi! I'm your civic assistant powered by AI. I can help you with information about civic issues, events, and community engagement. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedLanguage, setRecordedLanguage] = useState<string | null>(null);
  const [recordingStart, setRecordingStart] = useState<number | null>(null);
  const [recordingElapsedMs, setRecordingElapsedMs] = useState<number>(0);
  const [recordingTimerId, setRecordingTimerId] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [voicePreview, setVoicePreview] = useState<{ blob: Blob; url: string; durationSec: number } | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<number | null>(null);

  // Lightweight voice message UI like WhatsApp
  const VoiceMessage: React.FC<{ id: number; src: string; align: 'user' | 'bot'; knownDurationSec?: number }>
    = ({ id, src, align, knownDurationSec }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [current, setCurrent] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
      const audio = new Audio(src);
      audio.preload = 'metadata';
      audioRef.current = audio;
      const updateDuration = () => {
        let d = audio.duration;
        if (!isFinite(d) || isNaN(d)) {
          try {
            if (audio.seekable && audio.seekable.length > 0) {
              d = audio.seekable.end(audio.seekable.length - 1);
            }
          } catch (error) {
            console.warn('Error getting audio duration:', error);
          }
        }
        if (!isFinite(d) || isNaN(d) || d < 0) d = 0;
        setDuration(d);
      };
      const onLoaded = () => updateDuration();
      const onDurationChange = () => updateDuration();
      const onTime = () => setCurrent(audio.currentTime || 0);
      const onEnd = () => { setIsPlaying(false); setCurrent(0); };
      audio.addEventListener('loadedmetadata', onLoaded);
      audio.addEventListener('durationchange', onDurationChange);
      audio.addEventListener('timeupdate', onTime);
      audio.addEventListener('ended', onEnd);
      audio.addEventListener('pause', () => setIsPlaying(false));
      return () => {
        try { audio.pause(); } catch (error) {
          console.warn('Error pausing audio:', error);
        }
        audio.removeEventListener('loadedmetadata', onLoaded);
        audio.removeEventListener('durationchange', onDurationChange);
        audio.removeEventListener('timeupdate', onTime);
        audio.removeEventListener('ended', onEnd);
      };
    }, [src]);

    const togglePlay = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.paused) {
        setPlayingMessageId(id);
        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        audio.pause();
        setIsPlaying(false);
        setPlayingMessageId(null);
      }
    };

    const effectiveDuration = (duration && isFinite(duration) && !isNaN(duration) && duration > 0)
      ? duration
      : (knownDurationSec || 0);
    const pct = effectiveDuration && isFinite(effectiveDuration) && !isNaN(effectiveDuration)
      ? Math.min(100, Math.max(0, (current / duration) * 100))
      : 0;
    const fmt = (t: number) => {
      if (!isFinite(t) || isNaN(t) || t < 0) t = 0;
      const m = Math.floor(t / 60).toString();
      const s = Math.floor(t % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };

    return (
      <div className={`w-full max-w-[260px] flex items-center gap-3 rounded-full px-3 py-2 ${align === 'user' ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
        <Button size="icon" variant={align === 'user' ? 'secondary' : 'outline'} className="rounded-full"
          onClick={togglePlay} disabled={playingMessageId !== null && playingMessageId !== id}>
          {isPlaying && playingMessageId === id ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <div className="flex-1">
          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
            <div className="h-1.5 bg-teal-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-[10px] text-slate-600 dark:text-slate-300 mt-1">{fmt(current)} / {fmt(effectiveDuration || 0)}</div>
        </div>
      </div>
    );
  };
  const [user, setUser] = useState(null);
  const [chatWidth, setChatWidth] = useState(450); // px, initial width (increased from 320)
  const [chatHeight, setChatHeight] = useState(550); // px, initial height (increased from 384)
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeDirection, setResizeDirection] = useState(null);

  // Get current user on component mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const startResize = (e, direction) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: chatWidth,
      height: chatHeight,
    });
  };

  useEffect(() => {
    if (!isResizing || !resizeDirection) return;
    const handleMouseMove = (e) => {
      let newWidth = chatWidth;
      let newHeight = chatHeight;
      if (resizeDirection.includes('right')) {
        newWidth = Math.max(350, resizeStart.width + (e.clientX - resizeStart.x));
      }
      if (resizeDirection.includes('left')) {
        newWidth = Math.max(350, resizeStart.width - (e.clientX - resizeStart.x));
      }
      if (resizeDirection.includes('bottom')) {
        newHeight = Math.max(400, resizeStart.height + (e.clientY - resizeStart.y));
      }
      if (resizeDirection.includes('top')) {
        newHeight = Math.max(400, resizeStart.height - (e.clientY - resizeStart.y));
      }
      setChatWidth(newWidth);
      setChatHeight(newHeight);
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection, resizeStart, chatWidth, chatHeight]);

  const predefinedSuggestions = [
    "What are today's active events?",
    "Show me issues in Kochi North.",
    "Where can I redeem points?",
    "How do I report a pothole?",
    "What are the most severe issues in my area?",
    "Tell me about recent civic reports"
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Call backend API with Gemini AI
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          userId: user?.id || null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const botResponse = {
        id: messages.length + 2,
        type: "bot",
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error calling chatbot API:', error);
      
      // Use fallback response when backend is not available
      const fallbackResponse = {
        id: messages.length + 2,
        type: "bot",
        content: getFallbackResponse(inputValue),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const resolveSpeechBaseUrl = () => {
    const explicit = (import.meta as any).env.VITE_SPEECH_URL as string | undefined;
    if (explicit) return explicit;
    const backend = (import.meta as any).env.VITE_BACKEND_URL as string | undefined;
    if (!backend) {
      try {
        const loc = window.location;
        return `${loc.protocol}//${loc.hostname}:5001`;
      } catch {
        return 'http://localhost:5001';
      }
    }
    try {
      const u = new URL(backend);
      // If backend is on port 4000, default speech to 5001 on same host
      const port = u.port || (u.protocol === 'https:' ? '443' : '80');
      if (port === '4000') return `${u.protocol}//${u.hostname}:5001`;
      return backend; // assume same base if custom
    } catch {
      try {
        const loc = window.location;
        return `${loc.protocol}//${loc.hostname}:5001`;
      } catch {
        return 'http://localhost:5001';
      }
    }
  };
  const speechBaseUrl = resolveSpeechBaseUrl();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setCurrentStream(stream);
      const candidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        ''
      ];
      const chosen = candidates.find(t => t && MediaRecorder.isTypeSupported ? MediaRecorder.isTypeSupported(t) : true) || '';
      const options = chosen ? { mimeType: chosen } : undefined as any;
      const mr = new MediaRecorder(stream, options);
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      mr.onstop = async () => {
        setIsRecording(false);
        // clear timer
        if (recordingTimerId) {
          window.clearInterval(recordingTimerId);
          setRecordingTimerId(null);
        }
        try {
          // Prefer webm extension to help server-side detection
          const mime = chosen || 'audio/webm';
          const blob = new Blob(chunks, { type: mime });
          const audioUrl = URL.createObjectURL(blob);
          // Probe duration using a temporary audio element
          const tempAudio = document.createElement('audio');
          tempAudio.preload = 'metadata';
          tempAudio.src = audioUrl;
          const durationSec = await new Promise<number>((resolve) => {
            const done = () => {
              let d = tempAudio.duration;
              if (!isFinite(d) || isNaN(d)) {
                try {
                  if (tempAudio.seekable && tempAudio.seekable.length > 0) {
                    d = tempAudio.seekable.end(tempAudio.seekable.length - 1);
                  }
                } catch (error) {
                  console.warn('Error getting temp audio duration:', error);
                }
              }
              resolve(isFinite(d) && !isNaN(d) ? d : 0);
            };
            tempAudio.onloadedmetadata = done;
            tempAudio.onerror = () => resolve(0);
            // Fallback: resolve after 500ms
            setTimeout(done, 500);
          });
          // Hold for preview; send after user confirms
          setVoicePreview({ blob, url: audioUrl, durationSec });
        } catch (err) {
          console.error('Recording process error:', err);
        } finally {
          setIsTyping(false);
        }
      };
      // Start and request periodic data to simulate WhatsApp live capture
      mr.start(250);
      setMediaRecorder(mr);
      setIsRecording(true);
      const startTs = Date.now();
      setRecordingStart(startTs);
      const tid = window.setInterval(() => {
        setRecordingElapsedMs(Date.now() - startTs);
      }, 200);
      setRecordingTimerId(tid as unknown as number);
    } catch (e) {
      console.error('Microphone access failed:', e);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      }
      if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop());
        setCurrentStream(null);
      }
      if (recordingTimerId) {
        window.clearInterval(recordingTimerId);
        setRecordingTimerId(null);
      }
    } catch (e) {
      console.error('Stop recording error:', e);
    }
  };

  const cancelVoicePreview = () => {
    try {
      if (voicePreview?.url) URL.revokeObjectURL(voicePreview.url);
    } catch (error) {
      console.warn('Error revoking object URL:', error);
    }
    setVoicePreview(null);
    setRecordedLanguage(null);
  };

  const sendVoicePreview = async () => {
    if (!voicePreview) return;
    try {
      setIsTyping(true);
      // Convert to base64 for STT
      const reader = new FileReader();
      const blob = voicePreview.blob;
      const base64: string = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // 1) STT: get transcript and language
      const sttRes = await fetch(`${speechBaseUrl}/api/speech/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'voice', audio_base64: base64 })
      });
      if (!sttRes.ok) throw new Error('STT failed');
      const stt = await sttRes.json();
      const transcript = (stt && (stt.text || stt.transcript)) as string;
      if (!transcript || transcript.length === 0) throw new Error('No transcript from STT');
      const lang = (stt && (stt.language_code as string)) || 'en-IN';
      setRecordedLanguage(lang);

      // Show user voice message bubble (audio-only like WhatsApp)
      const userMessage = {
        id: messages.length + 1,
        type: 'user',
        content: '',
        timestamp: new Date(),
        audioUrl: voicePreview.url,
        isVoice: true
      } as any;
      setMessages(prev => [...prev, userMessage]);

      // 2) Chatbot response
      const backendBase = (import.meta as any).env.VITE_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:4000`;
      const chatRes = await fetch(`${backendBase}/api/chatbot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: transcript, userId: user?.id || null })
      });
      if (!chatRes.ok) throw new Error('Chatbot failed');
      const chatData = await chatRes.json();
      const aiText = (chatData && chatData.response) as string;
      if (!aiText || aiText.length === 0) throw new Error('Empty chatbot response');

      // 3) TTS in detected language using speech service (also returns translated text)
      const ttsRes = await fetch(`${speechBaseUrl}/api/speech/output`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response_text: aiText, target_language: lang, input_type: 'voice' })
      });
      if (!ttsRes.ok) throw new Error('TTS failed');
      const tts = await ttsRes.json();
      const audioBase64 = tts.audio_base64 as string | null;
      const displayed = (tts.text_response as string) || aiText;

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: displayed,
        timestamp: new Date(),
        audioBase64
      } as any;
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Voice send error:', err);
      // Show a minimal error bot message so user gets feedback
      const errorMessage = {
        id: messages.length + 1,
        type: 'bot',
        content: 'Sorry, your voice message could not be processed. Please try again.',
        timestamp: new Date()
      } as any;
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      // clear preview after sending
      setVoicePreview(null);
    }
  };

  const handlePlayAudio = (messageId: number, audioBase64?: string | null) => {
    if (!audioBase64) return;
    try {
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      setPlayingMessageId(messageId);
      audio.onended = () => setPlayingMessageId(null);
      audio.onpause = () => setPlayingMessageId(null);
      audio.onerror = () => setPlayingMessageId(null);
      audio.play().catch(() => setPlayingMessageId(null));
    } catch {
      setPlayingMessageId(null);
    }
  };

  // Fallback response function (kept for reference)
  const getFallbackResponse = (userInput: string) => {
    const input = userInput.toLowerCase();
    
    if (input.includes("event") || input.includes("activity")) {
      return "Today you have 2 volunteer events: Beach Cleanup at Marina Beach (9 AM) and Tree Planting at Central Park (2 PM). Would you like to register for any of these?";
    } else if (input.includes("kochi") || input.includes("location")) {
      return "In Kochi North, there are currently 12 active issues: 5 potholes, 3 streetlight problems, 2 garbage collection issues, and 2 water supply concerns. Would you like to see the map view?";
    } else if (input.includes("points") || input.includes("redeem")) {
      return "You have 1,247 CIVI points! You can redeem them for metro cards (200 points), restaurant vouchers (400 points), or utility bill discounts (250 points). Check the Redeem Points page for more options.";
    } else if (input.includes("pothole") || input.includes("report")) {
      return "To report a pothole: 1) Take a photo, 2) Click 'Report Issue' on the home page, 3) Our AI will automatically detect the category and severity. You'll earn 25 CIVI points for each verified report!";
    } else if (input.includes("hello") || input.includes("hi")) {
      return "Hello! I'm here to help you navigate Civixity. You can ask me about reporting issues, finding events, redeeming points, or anything else related to civic engagement.";
    } else {
      return "I understand you're asking about civic matters. I can help you with reporting issues, finding volunteer events, redeeming CIVI points, or checking the status of reports in your area. What specific information do you need?";
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card
          className="fixed bottom-6 right-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-4 duration-300"
          style={{ width: chatWidth, height: chatHeight, minWidth: 350, minHeight: 400 }}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium">Civic Assistant</div>
                <div className="text-xs opacity-90">Online</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  message.type === 'user'
                    ? 'bg-teal-500 dark:bg-cyan-500 text-white'
                    : 'bg-yellow-100 dark:bg-yellow-900/50 text-slate-900 dark:text-slate-100 border border-yellow-200 dark:border-yellow-800'
                }`}>
                  <div className="flex items-start space-x-2">
                    {message.type === 'bot' && (
                      <Bot className="h-4 w-4 mt-0.5 text-slate-600 dark:text-slate-400" />
                    )}
                    <div className="flex-1">
                      {(message as any).isVoice ? (
                        <div className="mt-1">
                          <VoiceMessage id={message.id} src={(message as any).audioUrl} align={message.type === 'user' ? 'user' : 'bot'} />
                        </div>
                      ) : (
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      )}
                      {message.type === 'user' && (message as any).audioUrl && !(message as any).isVoice && (
                        <div className="mt-2">
                          <VoiceMessage id={message.id} src={(message as any).audioUrl} align={'user'} />
                        </div>
                      )}
                      {message.type === 'bot' && (message as any).audioBase64 && (
                        <div className="mt-2">
                          <VoiceMessage id={message.id} src={`data:audio/mp3;base64,${(message as any).audioBase64}`} align={'bot'} />
                        </div>
                      )}
                      <div className={`text-xs mt-1 ${
                        message.type === 'user' 
                          ? 'text-teal-100' 
                          : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-yellow-100 dark:bg-yellow-900/50 text-slate-900 dark:text-slate-100 border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          

          {/* Chat Input */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-4">
            {voicePreview && (
              <div className="mb-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-full px-3 py-2">
                    <VoiceMessage id={-1} src={voicePreview.url} align={'user'} knownDurationSec={voicePreview.durationSec} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={cancelVoicePreview} className="rounded-full px-3">Discard</Button>
                    <Button size="sm" onClick={sendVoicePreview} disabled={isTyping} className="rounded-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 px-3">
                      <Send className="h-4 w-4 mr-1" /> Send
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="flex space-x-2 items-center">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about your city..."
                className="flex-1 bg-white dark:bg-slate-700 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <div className="flex items-center space-x-2">
                {isRecording && (
                  <div className="text-xs text-red-600 dark:text-red-400 select-none min-w-[48px] text-right">
                    {new Date(recordingElapsedMs).toISOString().substring(14, 19)}
                  </div>
                )}
                <Button
                  size="icon"
                  variant={isRecording ? 'destructive' : 'secondary'}
                  onClick={() => (isRecording ? stopRecording() : startRecording())}
                  disabled={isTyping}
                  title={isRecording ? 'Stop recording' : 'Record voice'}
                  aria-pressed={isRecording}
                >
                  {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {/* Resize handles for all edges and corners */}
          {/* Corners */}
          <div onMouseDown={e => startResize(e, 'top-left')} style={{position:'absolute',top:0,left:0,width:16,height:16,cursor:'nwse-resize',zIndex:10}} />
          <div onMouseDown={e => startResize(e, 'top-right')} style={{position:'absolute',top:0,right:0,width:16,height:16,cursor:'nesw-resize',zIndex:10}} />
          <div onMouseDown={e => startResize(e, 'bottom-left')} style={{position:'absolute',bottom:0,left:0,width:16,height:16,cursor:'nesw-resize',zIndex:10}} />
          <div onMouseDown={e => startResize(e, 'bottom-right')} style={{position:'absolute',bottom:0,right:0,width:16,height:16,cursor:'nwse-resize',zIndex:10}} />
          {/* Edges */}
          <div onMouseDown={e => startResize(e, 'top')} style={{position:'absolute',top:0,left:16,right:16,height:8,cursor:'ns-resize',zIndex:10}} />
          <div onMouseDown={e => startResize(e, 'bottom')} style={{position:'absolute',bottom:0,left:16,right:16,height:8,cursor:'ns-resize',zIndex:10}} />
          <div onMouseDown={e => startResize(e, 'left')} style={{position:'absolute',top:16,bottom:16,left:0,width:8,cursor:'ew-resize',zIndex:10}} />
          <div onMouseDown={e => startResize(e, 'right')} style={{position:'absolute',top:16,bottom:16,right:0,width:8,cursor:'ew-resize',zIndex:10}} />
        </Card>
      )}
    </>
  );
};

export default ChatBot;
