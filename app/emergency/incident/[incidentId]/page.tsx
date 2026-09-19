import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ShieldCheck, MapPin, AlertTriangle, Clock, PhoneCall, Globe } from 'lucide-react';
import Link from 'next/link';

interface IncidentPageProps {
  params: {
    incidentId: string;
  };
}

export default async function EmergencyIncidentPage({ params }: IncidentPageProps) {
  const { incidentId } = params;

  const event = await db.emergencyEvent.findUnique({
    where: { id: incidentId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
      emergencyCalls: {
        orderBy: { createdAt: 'desc' },
      },
      incidentTimeline: {
        orderBy: { timestamp: 'asc' },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const googleMapsUrl = `https://maps.google.com/?q=${event.lat},${event.lng}`;

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Alert Card */}
        <div className="bg-gradient-to-r from-rose-950 via-navy-900 to-navy-950 border-2 border-rose-500/80 p-6 rounded-2xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-rose-900/60 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-black uppercase text-rose-400 tracking-wider">
                ACTIVE SOS EMERGENCY INCIDENT
              </span>
            </div>
            <span className="text-xs font-mono text-navy-400">
              ID: {event.id.slice(0, 8)}...
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Emergency SOS Alert: {event.user.name}
            </h1>
            <p className="text-xs text-navy-300 mt-1">
              Triggered at {new Date(event.createdAt).toLocaleTimeString()} on {new Date(event.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-rose-300">
              <AlertTriangle className="w-4 h-4" /> Official Guardian Emergency Page
            </div>
            <p className="text-[11px] leading-relaxed text-navy-200">
              This is a secure access-controlled incident portal generated for the user's guardians and emergency responders.
            </p>
          </div>
        </div>

        {/* Location Box */}
        <div className="bg-navy-900/90 border border-navy-800 p-5 rounded-2xl shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-400" /> User Emergency Coordinates
          </h3>

          <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 text-xs space-y-1 font-mono">
            <div className="text-white font-bold">
              Latitude: {event.lat.toFixed(5)}° N, Longitude: {event.lng.toFixed(5)}° E
            </div>
            <div className="text-navy-400 text-[11px]">
              Location Spot: {event.locationName || 'GPS Coordinates Logged'}
            </div>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
          >
            <Globe className="w-4 h-4" /> Open Live GPS Location in Google Maps
          </a>
        </div>

        {/* Emergency Call Log */}
        {event.emergencyCalls.length > 0 && (
          <div className="bg-navy-900/90 border border-navy-800 p-5 rounded-2xl shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-indigo-400" /> Guardian Emergency Call Attempts
            </h3>

            <div className="space-y-2 text-xs">
              {event.emergencyCalls.map((call) => (
                <div
                  key={call.id}
                  className="p-3 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white">{call.contactName} ({call.contactPhone})</div>
                    <div className="text-[10px] text-navy-400">
                      Provider: {call.provider} • Initiated: {new Date(call.initiatedAt).toLocaleTimeString()}
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                    call.status === 'ANSWERED' || call.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : call.status === 'INITIATED' || call.status === 'RINGING' || call.status === 'QUEUED'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    {call.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
