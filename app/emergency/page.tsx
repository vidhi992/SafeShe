'use client';

import { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/navbar';
import { MobileNav } from '@/components/mobile-nav';
import { DemoBanner } from '@/components/demo-banner';
import {
  AlertTriangle,
  Mic,
  VolumeX,
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  MapPin,
  Radio,
  Sparkles,
  PhoneOff,
  PhoneForwarded,
  XCircle,
  AlertCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface EmergencyCallStatus {
  id: string;
  emergencyContactId: string;
  contactName: string;
  contactPhone: string;
  status: 'QUEUED' | 'INITIATED' | 'RINGING' | 'ANSWERED' | 'COMPLETED' | 'FAILED' | 'NO_ANSWER' | 'BUSY';
  provider: string;
  failureReason?: string;
  createdAt: string;
}

export default function EmergencyPage() {
  const [sosActivated, setSosActivated] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Active Emergency State
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [emergencyCalls, setEmergencyCalls] = useState<EmergencyCallStatus[]>([]);
  const [isTwilioConfigured, setIsTwilioConfigured] = useState<boolean>(true);
  const [locationAvailable, setLocationAvailable] = useState<boolean>(true);
  const [locationName, setLocationName] = useState<string>('Detecting location...');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Voice SOS state
  const [voiceActive, setVoiceActive] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [detectedPhrase, setDetectedPhrase] = useState('');
  const [emergencyLog, setEmergencyLog] = useState<string[]>([]);

  // Check Web Speech API support & Get Location on Mount
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSpeechSupported(true);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationAvailable(true);
          setLocationName(`Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`);
        },
        (err) => {
          console.warn('Geolocation permission denied or unavailable:', err);
          setLocationAvailable(false);
          setLocationName('User location currently unavailable');
        }
      );
    } else {
      setLocationAvailable(false);
      setLocationName('User location currently unavailable');
    }
  }, []);

  // Poll live call statuses if an emergency event is active
  useEffect(() => {
    if (!activeEventId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/emergency?eventId=${activeEventId}`);
        const data = await res.json();

        if (res.ok && data.emergencyCalls) {
          setEmergencyCalls(data.emergencyCalls);
        }
      } catch (err) {
        console.error('Polling call status error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeEventId]);

  // Keyboard shortcut handler for Silent SOS (Alt+Shift+S)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.altKey && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        triggerEmergency('SILENT_SOS', 'Triggered via Silent Keyboard Shortcut (Alt+Shift+S)');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hold Button Mouse Down / Touch Start Handlers
  function startHold() {
    if (sosActivated) return;
    setHoldProgress(0);
    holdIntervalRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 100) {
          clearInterval(holdIntervalRef.current as NodeJS.Timeout);
          triggerEmergency('MANUAL_SOS', 'Activated via 3-Second Hold SOS Button');
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  }

  function stopHold() {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
    }
    if (holdProgress < 100 && !sosActivated) {
      setHoldProgress(0);
    }
  }

  async function triggerEmergency(type: 'MANUAL_SOS' | 'SILENT_SOS' | 'VOICE_SOS', note: string) {
    setSosActivated(true);
    const timeStr = new Date().toLocaleTimeString();
    
    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          lat: userCoords?.lat || 20.5937,
          lng: userCoords?.lng || 78.9629,
          locationName,
          triggerNote: note,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setActiveEventId(data.emergencyEvent?.id || null);
        setEmergencyCalls(data.emergencyCalls || []);
        setIsTwilioConfigured(data.isTwilioConfigured);

        const logs = [
          `[${timeStr}] SOS Emergency Event Activated (ID: ${data.emergencyEvent?.id || 'EV-ACTIVE'})`,
          `[${timeStr}] Location captured: ${locationName}`,
        ];

        if (data.emergencyCalls && data.emergencyCalls.length > 0) {
          logs.push(`[${timeStr}] Initiating real emergency phone calls to ${data.emergencyCalls.length} verified guardians`);
        } else {
          logs.push(`[${timeStr}] ⚠ No verified emergency contacts configured for this account.`);
        }

        if (!data.isTwilioConfigured) {
          logs.push(`[${timeStr}] DEMO MODE — Telephony provider not configured. Call simulation recorded.`);
        }

        setEmergencyLog(logs);
      }
    } catch (e) {
      console.error('Trigger emergency error:', e);
    }
  }

  // Toggle Web Speech Recognition
  function toggleVoiceRecognition() {
    if (!speechSupported) return;

    if (voiceActive) {
      setVoiceActive(false);
    } else {
      setVoiceActive(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript.toLowerCase();
          setDetectedPhrase(transcript);
          if (transcript.includes('help') || transcript.includes('emergency') || transcript.includes('bachao') || transcript.includes('madad')) {
            triggerEmergency('VOICE_SOS', `Voice phrase detected: "${transcript}"`);
            recognition.stop();
            setVoiceActive(false);
            break;
          }
        }
      };

      recognition.onerror = () => setVoiceActive(false);
      recognition.start();
    }
  }

  function renderCallStatusBadge(status: string) {
    switch (status) {
      case 'QUEUED':
      case 'INITIATED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold animate-pulse">
            <PhoneCall className="w-3.5 h-3.5" /> Call Request Sent
          </span>
        );
      case 'RINGING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold animate-pulse">
            <PhoneForwarded className="w-3.5 h-3.5" /> ☎ Calling / Ringing...
          </span>
        );
      case 'ANSWERED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ✓ Answered
          </span>
        );
      case 'NO_ANSWER':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-xs font-bold">
            <PhoneOff className="w-3.5 h-3.5 text-orange-400" /> ⚠ No Answer
          </span>
        );
      case 'BUSY':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-xs font-bold">
            <AlertCircle className="w-3.5 h-3.5 text-yellow-400" /> Line Busy
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold">
            <XCircle className="w-3.5 h-3.5 text-rose-400" /> Call Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-navy-800 text-navy-300 text-xs font-semibold">
            {status}
          </span>
        );
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col pb-24 md:pb-8">
      <DemoBanner />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8 text-center">
        
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            Emergency Escalation & Guardian Calling
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Emergency SOS Control</h1>
          <p className="text-xs sm:text-sm text-navy-300">
            Activate emergency alerts via Hold-3s, Silent shortcut, or Voice phrase recognition.
          </p>
        </div>

        {/* Telephony Status Notice Banner */}
        {!isTwilioConfigured && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>DEMO MODE:</strong> Telephony provider (Twilio) is not configured on this environment. Calls are logged in simulation mode.
            </span>
          </div>
        )}

        {/* Main 3-Second Hold SOS Action */}
        <div className="py-6 flex flex-col items-center justify-center space-y-4">
          
          <button
            onMouseDown={startHold}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={startHold}
            onTouchEnd={stopHold}
            className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center transition-transform active:scale-95 shadow-2xl ${
              sosActivated
                ? 'bg-rose-600 text-white shadow-rose-600/60 sos-active-pulse border-4 border-white'
                : 'bg-gradient-to-tr from-rose-700 via-rose-600 to-rose-500 text-white shadow-rose-600/40 border-4 border-rose-400/40'
            }`}
          >
            {/* Progress Radial Ring Indicator */}
            <div
              className="absolute inset-0 rounded-full border-8 border-white/60 pointer-events-none transition-all duration-150"
              style={{
                clipPath: `inset(0 ${100 - holdProgress}% 0 0)`,
              }}
            />

            <AlertTriangle className="w-14 h-14 sm:w-16 sm:h-16 mb-1 animate-pulse" />
            <span className="text-xl sm:text-2xl font-black uppercase tracking-wider">
              {sosActivated ? 'SOS ACTIVATED' : 'HOLD 3 SECONDS'}
            </span>
            <span className="text-[10px] text-rose-200 uppercase font-semibold mt-1">
              {sosActivated ? 'Guardian Calling Active' : 'Press & Hold to Trigger'}
            </span>
          </button>

          <p className="text-xs text-navy-300">
            {holdProgress > 0 && holdProgress < 100
              ? `Holding... ${Math.round(holdProgress)}%`
              : sosActivated
              ? 'Emergency escalation in progress. Calling verified guardians now.'
              : 'Press and hold button for 3 seconds to initiate emergency escalation.'}
          </p>
        </div>

        {/* LIVE SOS GUARDIAN CALLING STATUS BOARD */}
        {sosActivated && (
          <div className="glass-card p-6 rounded-2xl border border-rose-500/50 bg-navy-900/90 text-left space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center gap-2 text-rose-400">
                  <PhoneCall className="w-5 h-5 animate-bounce" /> Emergency Contacts Calling Status
                </h3>
                <p className="text-xs text-navy-300 mt-0.5">
                  Initiating phone calls to verified parents/guardians. Call statuses update live.
                </p>
              </div>

              {activeEventId && (
                <Link
                  href={`/emergency/incident/${activeEventId}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition"
                >
                  Incident Portal <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {emergencyCalls.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>No verified emergency contacts found.</strong> SafeShe is logging your location, but cannot place phone calls until emergency contacts are added and verified in your account.
                </span>
              </div>
            ) : (
              <div className="grid gap-3">
                {emergencyCalls.map((call) => (
                  <div
                    key={call.id}
                    className="p-4 rounded-xl bg-navy-950 border border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>{call.contactName}</span>
                        <span className="font-mono text-xs text-navy-400">({call.contactPhone})</span>
                      </div>
                      {call.failureReason && (
                        <p className="text-[11px] text-rose-400 font-mono">{call.failureReason}</p>
                      )}
                    </div>

                    <div className="shrink-0">{renderCallStatusBadge(call.status)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Alternate Emergency Modes (Silent & Voice SOS) */}
        <div className="grid md:grid-cols-2 gap-6 text-left">
          
          {/* Silent SOS Card */}
          <div className="glass-card p-6 rounded-2xl border border-navy-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <VolumeX className="w-5 h-5 text-indigo-400" /> Silent SOS Trigger
              </h3>
              <span className="px-2 py-0.5 rounded bg-navy-800 text-[10px] font-mono text-indigo-300">Alt+Shift+S</span>
            </div>
            <p className="text-xs text-navy-300 leading-relaxed">
              Triggers emergency event silently without sound or screen flash. Keyboard shortcut <strong className="text-white">Alt+Shift+S</strong> active.
            </p>
            <button
              onClick={() => triggerEmergency('SILENT_SOS', 'Triggered via Silent SOS Button')}
              className="w-full py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-700 text-white text-xs font-semibold transition"
            >
              Trigger Silent Alert Now
            </button>
          </div>

          {/* Voice SOS Card */}
          <div className="glass-card p-6 rounded-2xl border border-navy-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Mic className="w-5 h-5 text-emerald-400" /> Voice Phrase SOS
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${voiceActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-navy-800 text-navy-400'}`}>
                {voiceActive ? 'LISTENING...' : 'OFF'}
              </span>
            </div>
            <p className="text-xs text-navy-300 leading-relaxed">
              Listens locally for phrases: <strong className="text-white">"Help", "Emergency", "Bachao", "Madad"</strong>.
            </p>

            {speechSupported ? (
              <button
                onClick={toggleVoiceRecognition}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 ${
                  voiceActive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Mic className="w-4 h-4" />
                {voiceActive ? 'Disable Voice Listener' : 'Enable Voice SOS Listener'}
              </button>
            ) : (
              <div className="text-[11px] text-amber-400">
                Web Speech API not supported in current browser engine.
              </div>
            )}

            {detectedPhrase && (
              <div className="text-[10px] font-mono text-navy-300">
                Speech detected: "{detectedPhrase}"
              </div>
            )}
          </div>

        </div>

        {/* Live Escalation Event Log */}
        {emergencyLog.length > 0 && (
          <div className="glass-card p-6 rounded-2xl border border-rose-500/40 text-left space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 text-rose-400">
              <CheckCircle2 className="w-4 h-4" /> Live Emergency Escalation Timeline
            </h3>
            <div className="space-y-1.5 font-mono text-xs text-navy-200 bg-navy-950 p-4 rounded-xl border border-navy-800">
              {emergencyLog.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400">✔</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <MobileNav />
    </div>
  );
}
