'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { MobileNav } from '@/components/mobile-nav';
import { DemoBanner } from '@/components/demo-banner';
import { Shield, Radio, CheckCircle2, Phone, MapPin, AlertTriangle, Users } from 'lucide-react';

export default function HelperPortalPage() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [acceptedRequestId, setAcceptedRequestId] = useState<string | null>(null);

  const sampleRequests = [
    {
      id: 'req-1',
      user: 'Anonymous Woman in Transit',
      location: 'Central Metro Bus Bay 4',
      distanceKm: 0.4,
      timestamp: '5 mins ago',
      type: 'Safety Escort Request',
      notes: 'Requesting verified volunteer escort to walk 2 blocks to illuminated taxi stand.',
    },
    {
      id: 'req-2',
      user: 'Sophia S.',
      location: 'Oak Street Underpass',
      distanceKm: 0.8,
      timestamp: '12 mins ago',
      type: 'Stationary Check',
      notes: 'Delayed journey alert logged. Needs quick phone verification.',
    },
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col pb-24 md:pb-8">
      <DemoBanner />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase mb-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Verified Volunteer Responder Network
            </div>
            <h1 className="text-3xl font-extrabold text-white">Verified Helper Portal</h1>
            <p className="text-xs sm:text-sm text-navy-300">
              Manage your responder status and assist women in your local area through approved channels.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-navy-300">Duty Status:</span>
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                isAvailable
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-navy-800 border-navy-700 text-navy-400'
              }`}
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              {isAvailable ? 'ON DUTY (AVAILABLE)' : 'OFF DUTY'}
            </button>
          </div>
        </div>

        {/* Nearby Assistance Requests Feed */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-navy-300">
            Nearby Assistance Requests ({sampleRequests.length})
          </h3>

          <div className="space-y-4">
            {sampleRequests.map((req) => {
              const isAccepted = acceptedRequestId === req.id;

              return (
                <div
                  key={req.id}
                  className={`glass-card p-6 rounded-2xl border transition space-y-4 ${
                    isAccepted
                      ? 'border-emerald-500/60 bg-emerald-950/20'
                      : 'border-navy-700/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-800 pb-3">
                    <div>
                      <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase">
                        {req.type}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">{req.user}</h4>
                    </div>

                    <div className="text-right text-xs text-navy-300">
                      <div><strong className="text-white">{req.distanceKm} km</strong> away</div>
                      <div className="text-[10px] text-navy-400">{req.timestamp}</div>
                    </div>
                  </div>

                  <p className="text-xs text-navy-200">{req.notes}</p>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-navy-400">
                      <MapPin className="w-4 h-4 text-rose-400" />
                      <span>{req.location}</span>
                    </div>

                    {isAccepted ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Accepted — In Transit
                        </span>
                        <a
                          href="tel:+15552345678"
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call via Proxy
                        </a>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAcceptedRequestId(req.id)}
                        disabled={!isAvailable}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg transition disabled:opacity-40"
                      >
                        Accept Assistance Request
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      <MobileNav />
    </div>
  );
}
