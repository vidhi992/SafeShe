import { Navbar } from '@/components/navbar';
import { MobileNav } from '@/components/mobile-nav';
import { DemoBanner } from '@/components/demo-banner';
import { getCurrentUser } from '@/lib/services/auth';
import { db } from '@/lib/db';
import { ShieldCheck, Users, AlertTriangle, Shield, Activity, Check, X, FileText } from 'lucide-react';

export default async function AdminDashboardPage() {
  const currentUser = await getCurrentUser();

  // Server authorization check
  const isAdmin = currentUser?.role === 'ADMIN';

  // Fetch Admin Stats
  const userCount = await db.user.count();
  const reportCount = await db.safetyReport.count();
  const helperCount = await db.helper.count();
  const emergencyCount = await db.emergencyEvent.count();

  const reports = await db.safetyReport.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const helpers = await db.helper.findMany({
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col pb-24 md:pb-8">
      <DemoBanner />
      <Navbar user={currentUser} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              Platform Administration & Moderation Console
            </div>
            <h1 className="text-3xl font-extrabold text-white">Admin Dashboard</h1>
            <p className="text-xs sm:text-sm text-navy-300">
              Verify volunteer responders, moderate crowdsourced safety reports, and monitor system analytics.
            </p>
          </div>

          {!isAdmin && (
            <div className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              Notice: Viewing in Demo Mode (Switch role to Admin via top banner for full controls)
            </div>
          )}
        </div>

        {/* Analytics Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-card border border-navy-700/80">
            <div className="text-xs text-navy-400 font-medium">Registered Platform Users</div>
            <div className="text-3xl font-black text-white mt-2 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-400" /> {userCount}
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-navy-700/80">
            <div className="text-xs text-navy-400 font-medium">Safety Reports Submitted</div>
            <div className="text-3xl font-black text-white mt-2 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-400" /> {reportCount}
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-navy-700/80">
            <div className="text-xs text-navy-400 font-medium">Verified Helpers</div>
            <div className="text-3xl font-black text-white mt-2 flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-400" /> {helperCount}
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-navy-700/80">
            <div className="text-xs text-navy-400 font-medium">Emergency Events Logged</div>
            <div className="text-3xl font-black text-white mt-2 flex items-center gap-2">
              <Activity className="w-6 h-6 text-rose-400" /> {emergencyCount}
            </div>
          </div>
        </div>

        {/* Admin Section Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Volunteer Helpers Verification List */}
          <div className="glass-card p-6 rounded-2xl border border-navy-700/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" /> Volunteer Helper Approvals
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {helpers.map((h) => (
                <div key={h.id} className="p-4 rounded-xl bg-navy-900/80 border border-navy-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-sm">{h.user.name}</div>
                    <div className="text-[11px] text-navy-300">{h.organization} • {h.area}</div>
                    <div className="text-[10px] text-navy-400">{h.user.email}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {h.isVerified ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                        Verified Helper
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        Pending Admin Review
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crowdsourced Safety Reports Moderation */}
          <div className="glass-card p-6 rounded-2xl border border-navy-700/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> Moderation Feed
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {reports.map((rep) => (
                <div key={rep.id} className="p-4 rounded-xl bg-navy-900/80 border border-navy-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{rep.category}</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">
                      {rep.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-navy-300">{rep.description}</p>
                  <div className="text-[10px] text-navy-400 flex items-center justify-between pt-1">
                    <span>Location: {rep.locationName}</span>
                    <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      <MobileNav />
    </div>
  );
}
