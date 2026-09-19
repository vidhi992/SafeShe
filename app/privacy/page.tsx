'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { MobileNav } from '@/components/mobile-nav';
import { DemoBanner } from '@/components/demo-banner';
import { Lock, Shield, Eye, Trash2, Download, RefreshCw, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function PrivacyPage() {
  const [shareHelper, setShareHelper] = useState(true);
  const [voiceTrigger, setVoiceTrigger] = useState(true);
  const [anonymousReporting, setAnonymousReporting] = useState(true);
  const [retentionDays, setRetentionDays] = useState(365);
  const [msg, setMsg] = useState('');

  function handleSave() {
    setMsg('Privacy preferences updated successfully.');
    setTimeout(() => setMsg(''), 3000);
  }

  function handleExportData() {
    const sampleData = {
      user: 'Sophia Sharma',
      email: 'user@safeshe.org',
      journeysCount: 14,
      evidenceVaultCount: 3,
      trustedContactsCount: 3,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safeshe-privacy-export-${Date.now()}.json`;
    a.click();
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col pb-24 md:pb-8">
      <DemoBanner />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            Privacy First Architecture
          </div>
          <h1 className="text-3xl font-extrabold text-white">Privacy & Security Center</h1>
          <p className="text-xs sm:text-sm text-navy-300">
            Full user ownership over your data, location tracking, evidence vault, and active sharing links.
          </p>
        </div>

        {msg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        {/* Data Ownership Toggles */}
        <div className="glass-card p-6 rounded-2xl border border-navy-700/80 space-y-6 text-xs">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" /> Data Control Settings
          </h3>

          <div className="space-y-4">
            
            <div className="flex items-center justify-between p-4 rounded-xl bg-navy-900/60 border border-navy-800">
              <div>
                <div className="font-bold text-white text-sm">Location Sharing with Verified Helpers</div>
                <div className="text-[11px] text-navy-300">
                  Allow approved volunteer responders to view coarse proximity during active SOS.
                </div>
              </div>
              <input
                type="checkbox"
                checked={shareHelper}
                onChange={(e) => setShareHelper(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-navy-900/60 border border-navy-800">
              <div>
                <div className="font-bold text-white text-sm">Voice Trigger Local Speech Detection</div>
                <div className="text-[11px] text-navy-300">
                  Process voice emergency phrases ("Help", "Bachao") inside local browser memory.
                </div>
              </div>
              <input
                type="checkbox"
                checked={voiceTrigger}
                onChange={(e) => setVoiceTrigger(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-navy-900/60 border border-navy-800">
              <div>
                <div className="font-bold text-white text-sm">Anonymous Heatmap Submissions</div>
                <div className="text-[11px] text-navy-300">
                  Default unsafe area reports to anonymous status without attaching user ID.
                </div>
              </div>
              <input
                type="checkbox"
                checked={anonymousReporting}
                onChange={(e) => setAnonymousReporting(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </div>

            <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-sm">Data Retention Period</div>
                <div className="text-[11px] text-navy-300">Automatically delete old journey logs after set period.</div>
              </div>
              <select
                value={retentionDays}
                onChange={(e) => setRetentionDays(parseInt(e.target.value, 10))}
                className="bg-navy-950 border border-navy-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold"
              >
                <option value={30}>30 Days</option>
                <option value={90}>90 Days</option>
                <option value={365}>1 Year (365 Days)</option>
              </select>
            </div>

          </div>

          <button
            onClick={handleSave}
            className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
          >
            Save Settings
          </button>
        </div>

        {/* Data Actions: Export, Revoke, Delete */}
        <div className="glass-card p-6 rounded-2xl border border-navy-700/80 space-y-4 text-xs">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-400" /> Export & Privacy Actions
          </h3>

          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={handleExportData}
              className="p-4 rounded-xl bg-navy-900 hover:bg-navy-800 border border-navy-700 text-white font-bold text-left flex flex-col justify-between h-28 transition"
            >
              <Download className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="text-xs">Export Account Data</div>
                <div className="text-[10px] text-navy-400 font-normal">Download JSON copy</div>
              </div>
            </button>

            <button
              onClick={() => alert('All active temporary tracking links have been revoked.')}
              className="p-4 rounded-xl bg-navy-900 hover:bg-navy-800 border border-navy-700 text-white font-bold text-left flex flex-col justify-between h-28 transition"
            >
              <RefreshCw className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs">Revoke Sharing Links</div>
                <div className="text-[10px] text-navy-400 font-normal">Expire all public tokens</div>
              </div>
            </button>

            <button
              onClick={() => alert('Journey history cleared.')}
              className="p-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-left flex flex-col justify-between h-28 transition"
            >
              <Trash2 className="w-5 h-5 text-rose-400" />
              <div>
                <div className="text-xs">Delete Journey Logs</div>
                <div className="text-[10px] text-rose-200/70 font-normal">Permanent erase</div>
              </div>
            </button>
          </div>
        </div>

        {/* Privacy Policy Explanatory Accordion */}
        <div className="p-6 rounded-2xl bg-navy-900/40 border border-navy-800 text-xs space-y-3">
          <h4 className="font-bold text-white text-sm">SafeShe Privacy Commitment</h4>
          <ul className="space-y-2 text-navy-300 leading-relaxed list-disc pl-4">
            <li><strong>What is collected:</strong> Geolocation during active journey tracking, user profile info, and uploaded evidence files.</li>
            <li><strong>Why it is collected:</strong> Strictly to compute route safety indicators, anomaly deviation alerts, and legal vault records.</li>
            <li><strong>Who has access:</strong> Only your authenticated user account and trusted contacts specified explicitly by you. Exact live location is never exposed to unauthenticated public endpoints.</li>
          </ul>
        </div>

      </main>

      <MobileNav />
    </div>
  );
}
