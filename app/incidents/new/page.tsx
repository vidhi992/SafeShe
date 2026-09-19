'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { MobileNav } from '@/components/mobile-nav';
import { DemoBanner } from '@/components/demo-banner';
import { Sparkles, Mic, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Edit3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewIncidentPage() {
  const router = useRouter();
  const [narrativeText, setNarrativeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedReport, setParsedReport] = useState<any | null>(null);

  async function handleAnalyzeNarrative(e: React.FormEvent) {
    e.preventDefault();
    if (!narrativeText || narrativeText.trim().length < 10) return;

    setLoading(true);
    try {
      const res = await fetch('/api/incidents/ai-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ narrativeText }),
      });

      const data = await res.json();
      if (data.report) {
        setParsedReport(data.report);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col pb-24 md:pb-8">
      <DemoBanner />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        
        {/* Header */}
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            AI NLP Structured Report Generator
          </div>
          <h1 className="text-3xl font-extrabold text-white">AI Incident Assistant</h1>
          <p className="text-xs sm:text-sm text-navy-300">
            Tell us what happened in your own words. SafeShe AI converts your narrative into a structured legal-grade timeline.
          </p>
        </div>

        {/* Narrative Box */}
        <div className="glass-card p-6 rounded-2xl border border-navy-700/80 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" /> "Tell me what happened."
          </h3>

          <form onSubmit={handleAnalyzeNarrative} className="space-y-4 text-xs">
            <textarea
              required
              rows={5}
              value={narrativeText}
              onChange={(e) => setNarrativeText(e.target.value)}
              placeholder="e.g., Yesterday at around 9:15 PM, I was walking home from Oak Street metro station when a person in a dark jacket began following me closely..."
              className="w-full bg-navy-900 border border-navy-700 rounded-xl p-4 text-white placeholder-navy-500 text-sm leading-relaxed"
            />

            <button
              type="submit"
              disabled={loading || narrativeText.trim().length < 10}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Analyzing Narrative with AI...' : 'Convert to Structured Report'}
            </button>
          </form>
        </div>

        {/* AI Disclaimer Banner Requirement */}
        {parsedReport && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold">IMPORTANT: AI-generated information should be reviewed and corrected before saving.</span>
          </div>
        )}

        {/* Structured Report Edit Review Form */}
        {parsedReport && (
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-indigo-500/50 space-y-6 text-xs">
            <div className="flex items-center justify-between border-b border-navy-700 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" /> Structured Incident Summary
              </h3>
              <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase text-[10px]">
                Draft Form
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-navy-200 mb-1">Incident Category</label>
                <input
                  type="text"
                  value={parsedReport.incidentType}
                  onChange={(e) => setParsedReport({ ...parsedReport, incidentType: e.target.value })}
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3.5 py-2 text-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-navy-200 mb-1">Approximate Time</label>
                <input
                  type="text"
                  value={parsedReport.timeApprox}
                  onChange={(e) => setParsedReport({ ...parsedReport, timeApprox: e.target.value })}
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3.5 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-navy-200 mb-1">Location / Landmark</label>
                <input
                  type="text"
                  value={parsedReport.locationName}
                  onChange={(e) => setParsedReport({ ...parsedReport, locationName: e.target.value })}
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3.5 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-navy-200 mb-1">People / Suspects Involved</label>
                <input
                  type="text"
                  value={parsedReport.peopleInvolved}
                  onChange={(e) => setParsedReport({ ...parsedReport, peopleInvolved: e.target.value })}
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3.5 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-navy-200 mb-1">Sequence of Events</label>
              <textarea
                rows={4}
                value={parsedReport.sequenceOfEvents}
                onChange={(e) => setParsedReport({ ...parsedReport, sequenceOfEvents: e.target.value })}
                className="w-full bg-navy-900 border border-navy-700 rounded-xl p-3 text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-navy-200 mb-1">Immediate Action Taken</label>
              <input
                type="text"
                value={parsedReport.immediateActionTaken}
                onChange={(e) => setParsedReport({ ...parsedReport, immediateActionTaken: e.target.value })}
                className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3.5 py-2 text-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Verified Incident Record
              </button>
            </div>
          </div>
        )}

      </main>

      <MobileNav />
    </div>
  );
}
