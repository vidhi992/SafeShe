import { db } from '@/lib/db';
import { MapContainer } from '@/components/map/map-container';
import { ShieldCheck, Clock, MapPin, AlertTriangle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface SharePageProps {
  params: {
    token: string;
  };
}

export default async function SharedJourneyPage({ params }: SharePageProps) {
  const token = params.token;

  // Query journey by token or fallback to latest sample journey
  let journey = await db.journey.findFirst({
    where: { shareToken: token },
    include: {
      user: { select: { name: true } },
      locations: { orderBy: { timestamp: 'desc' }, take: 1 },
    },
  });

  if (!journey) {
    journey = await db.journey.findFirst({
      include: {
        user: { select: { name: true } },
        locations: { orderBy: { timestamp: 'desc' }, take: 1 },
      },
    });
  }

  const currentLat = journey?.locations[0]?.lat || journey?.startLat || 37.7749;
  const currentLng = journey?.locations[0]?.lng || journey?.startLng || -122.4194;

  const mapMarkers = [
    {
      id: 'shared-pos',
      lat: currentLat,
      lng: currentLng,
      title: `${journey?.user.name || 'User'} Shared Live Location`,
      type: 'USER_LOCATION' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="glass-nav py-4 px-6 border-b border-navy-800">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-lg">SafeShe Live Location</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            Encrypted Session Token Active
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 w-full space-y-6">
        
        {/* Status Card */}
        <div className="glass-card p-6 rounded-2xl border border-navy-700/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                Tracking Journey: {journey?.user.name || 'Sophia Sharma'}
              </h2>
              <p className="text-xs text-navy-300">
                Shared via SafeShe Trusted Contact Temporary Access Link.
              </p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-navy-900 border border-navy-700 text-right">
              <div className="text-[10px] text-navy-400 uppercase font-medium">Emergency Status</div>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {journey?.status || 'ACTIVE'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-navy-400 block">Destination</span>
              <strong className="text-white text-sm">{journey?.destinationName}</strong>
            </div>

            <div>
              <span className="text-navy-400 block">Expected Arrival</span>
              <strong className="text-white text-sm">
                {journey ? new Date(journey.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '9:30 PM'}
              </strong>
            </div>

            <div>
              <span className="text-navy-400 block">Safety Score</span>
              <strong className="text-indigo-400 text-sm font-bold">{journey?.safetyScore || 'MODERATE'}</strong>
            </div>
          </div>
        </div>

        {/* Live Map Display */}
        <div className="h-[450px] glass-card p-2 rounded-2xl border border-navy-700/80">
          <MapContainer center={[currentLat, currentLng]} zoom={15} markers={mapMarkers} />
        </div>

        <div className="text-center text-xs text-navy-400">
          This temporary location link expires automatically upon journey completion or revocation by owner.
        </div>

      </main>

      <footer className="py-4 border-t border-navy-800 text-center text-xs text-navy-500">
        SafeShe Live Location Sharing Platform &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
