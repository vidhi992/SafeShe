import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { MobileNav } from '@/components/mobile-nav';
import { DemoBanner } from '@/components/demo-banner';
import { getCurrentUser } from '@/lib/services/auth';
import { db } from '@/lib/db';
import { MapContainer } from '@/components/map/map-container';
import { DEFAULT_MAP_CENTER } from '@/lib/maps/locations';
import {
  ShieldCheck,
  Navigation,
  AlertTriangle,
  Lock,
  Users,
  Clock,
  MapPin,
  ChevronRight,
  PhoneCall,
  Activity,
  Plus,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const userId = user?.id || '';
  const activeJourney = await db.journey.findFirst({
    where: { userId, status: { in: ['ACTIVE', 'ANOMALY_DETECTED'] } },
    include: { locations: { orderBy: { timestamp: 'desc' }, take: 1 } },
  });

  const emergencyContacts = await db.emergencyContact.findMany({
    where: { userId },
    orderBy: { priority: 'asc' },
  });
  const trustedContactsCount = emergencyContacts.length;
  const evidenceCount = await db.evidence.count({ where: { userId } });
  const recentReports = await db.safetyReport.findMany({
    where: { status: 'APPROVED' },
    take: 3,
    orderBy: { createdAt: 'desc' },
  });

  const emergencyResources = await db.emergencyResource.findMany({ take: 5 });

  // Map markers centered around Bhopal
  const mapMarkers = [
    {
      id: 'user-pos',
      lat: activeJourney?.startLat || DEFAULT_MAP_CENTER[0],
      lng: activeJourney?.startLng || DEFAULT_MAP_CENTER[1],
      title: `${user?.name || 'User'} Position`,
      type: 'USER_LOCATION' as const,
    },
    ...recentReports.map((r) => ({
      id: r.id,
      lat: r.lat,
      lng: r.lng,
      title: r.category,
      description: r.description,
      address: r.locationName,
      type: 'UNSAFE_REPORT' as const,
    })),
    ...emergencyResources.map((res) => ({
      id: res.id,
      lat: res.lat,
      lng: res.lng,
      title: res.name,
      category: res.category,
      address: res.address,
      phone: res.phone,
      type: 'EMERGENCY_RESOURCE' as const,
    })),
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col pb-24 md:pb-8">
      <DemoBanner />
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Top Header & Safety Status Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-navy-700/80">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome back, {user?.name || 'Sophia'}
            </h1>
            <p className="text-xs sm:text-sm text-navy-300">
              SafeShe AI prevention and OpenStreetMap monitoring engine is active in Bhopal.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <ShieldCheck className="w-6 h-6" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">Safety Status</div>
              <div className="text-sm font-extrabold text-white">"You're currently safe."</div>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/journey"
            className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-xl shadow-indigo-600/25 transition group flex flex-col justify-between h-32 border border-indigo-400/30"
          >
            <div className="flex items-center justify-between">
              <Navigation className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <ChevronRight className="w-4 h-4 text-indigo-200" />
            </div>
            <div>
              <div className="text-base font-bold">START SAFE JOURNEY</div>
              <div className="text-[11px] text-indigo-200 mt-0.5">Live anomaly monitoring</div>
            </div>
          </Link>

          <Link
            href="/emergency"
            className="p-5 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-xl shadow-rose-600/30 transition group flex flex-col justify-between h-32 border border-rose-400/30 sos-active-pulse"
          >
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
              <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded">HOLD 3S</span>
            </div>
            <div>
              <div className="text-base font-bold">EMERGENCY SOS</div>
              <div className="text-[11px] text-rose-100 mt-0.5">Silent / Voice / Hold</div>
            </div>
          </Link>

          <Link
            href="/report"
            className="p-5 rounded-2xl bg-navy-800/90 hover:bg-navy-700/90 text-white border border-navy-700 transition group flex flex-col justify-between h-32"
          >
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <Plus className="w-4 h-4 text-navy-400" />
            </div>
            <div>
              <div className="text-base font-bold">REPORT UNSAFE AREA</div>
              <div className="text-[11px] text-navy-300 mt-0.5">Crowdsourced heatmaps</div>
            </div>
          </Link>

          <Link
            href="/safety-map"
            className="p-5 rounded-2xl bg-navy-800/90 hover:bg-navy-700/90 text-white border border-navy-700 transition group flex flex-col justify-between h-32"
          >
            <div className="flex items-center justify-between">
              <Activity className="w-6 h-6 text-indigo-400" />
              <ChevronRight className="w-4 h-4 text-navy-400" />
            </div>
            <div>
              <div className="text-base font-bold">OPEN SAFETY MAP</div>
              <div className="text-[11px] text-navy-300 mt-0.5">Route safety indicators</div>
            </div>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Journey Widget */}
            <div className="glass-card p-6 rounded-2xl border border-navy-700/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
                  <h3 className="text-lg font-bold text-white">Active Journey Monitor</h3>
                </div>
                <Link href="/journey" className="text-xs text-indigo-400 hover:underline font-semibold">
                  Manage Trip
                </Link>
              </div>

              {activeJourney ? (
                <div className="p-4 rounded-xl bg-navy-900/90 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-navy-300">
                      Destination: <span className="font-bold text-white">{activeJourney.destinationName}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase border border-indigo-500/30">
                      {activeJourney.status}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-navy-900/40 border border-navy-800 text-center space-y-3">
                  <p className="text-xs text-navy-400">No active journey currently running.</p>
                  <Link
                    href="/journey"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm"
                  >
                    Start New Safe Journey
                  </Link>
                </div>
              )}
            </div>

            {/* Map Preview Card */}
            <div className="glass-card p-6 rounded-2xl border border-navy-700/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-400" /> Live Safety Heatmap Preview (Bhopal)
                </h3>
                <Link href="/safety-map" className="text-xs text-indigo-400 hover:underline font-semibold">
                  Full Screen Map
                </Link>
              </div>

              <div className="h-80 w-full rounded-xl overflow-hidden border border-navy-800">
                <MapContainer center={DEFAULT_MAP_CENTER} zoom={13} markers={mapMarkers} showHeatmap={true} />
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Trusted Contacts Widget */}
            <div className="glass-card p-6 rounded-2xl border border-navy-700/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" /> Emergency Contacts ({emergencyContacts.length})
                </h3>
                <Link href="/trusted-contacts" className="text-xs text-indigo-400 hover:underline font-semibold">
                  Manage
                </Link>
              </div>

              <div className="space-y-2 text-xs">
                {emergencyContacts.length === 0 ? (
                  <div className="p-4 rounded-xl bg-navy-900/40 border border-navy-800 text-center text-navy-400">
                    No emergency contacts configured yet.
                  </div>
                ) : (
                  emergencyContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-3 rounded-xl bg-navy-900/70 border border-navy-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-white">{contact.name}</div>
                        <div className="text-[10px] text-navy-400">
                          {contact.relationship} • Priority {contact.priority}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          contact.isVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {contact.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Nearby Emergency Resources Widget */}
            <div className="glass-card p-6 rounded-2xl border border-navy-700/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-rose-400" /> Nearby Bhopal Emergency Cells
                </h3>
                <Link href="/resources" className="text-xs text-indigo-400 hover:underline font-semibold">
                  All
                </Link>
              </div>

              <div className="space-y-2 text-xs">
                {emergencyResources.slice(0, 3).map((res) => (
                  <div key={res.id} className="p-3 rounded-xl bg-navy-900/70 border border-navy-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white truncate max-w-[160px]">{res.name}</div>
                      <div className="text-[10px] text-navy-400">{res.category} • 24x7</div>
                    </div>
                    <a
                      href={`tel:${res.phone}`}
                      className="px-2.5 py-1 rounded-lg bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold hover:bg-rose-600 text-[11px]"
                    >
                      {res.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </main>

      <MobileNav />
    </div>
  );
}
