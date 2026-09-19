import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { MobileNav } from '@/components/mobile-nav';
import { DemoBanner } from '@/components/demo-banner';
import { getCurrentUser } from '@/lib/services/auth';
import {
  Shield,
  Navigation,
  AlertTriangle,
  Lock,
  Sparkles,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  ChevronRight,
  HelpCircle,
  Activity,
  Phone,
  ShieldAlert,
  Users,
} from 'lucide-react';

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col pb-20 md:pb-0">
      <DemoBanner />
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-navy-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-navy-950 to-navy-950 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              AI-Powered Prevention & Protection Engine
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Safety shouldn't begin{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-indigo-300 to-rose-300">
                after something happens.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-navy-200 leading-relaxed font-normal">
              SafeShe combines AI, real-time location intelligence and emergency response tools to help women stay safer before, during and after an incident.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/journey"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group"
              >
                <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Start Safe Journey
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/safety-map"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-navy-800/80 hover:bg-navy-700 text-white font-semibold text-base border border-navy-700 transition flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5 text-indigo-400" />
                Explore Safety Map
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-navy-800/80 mt-10">
              <div className="p-4 rounded-xl bg-navy-900/50 border border-navy-800">
                <div className="text-xs text-navy-400 font-medium">Risk Map Engine</div>
                <div className="text-xl font-bold text-indigo-300 mt-1">Multi-Factor AI</div>
              </div>
              <div className="p-4 rounded-xl bg-navy-900/50 border border-navy-800">
                <div className="text-xs text-navy-400 font-medium">Anomaly Detector</div>
                <div className="text-xl font-bold text-emerald-300 mt-1">Auto Deviation</div>
              </div>
              <div className="p-4 rounded-xl bg-navy-900/50 border border-navy-800">
                <div className="text-xs text-navy-400 font-medium">Evidence Vault</div>
                <div className="text-xl font-bold text-amber-300 mt-1">SHA-256 Verified</div>
              </div>
              <div className="p-4 rounded-xl bg-navy-900/50 border border-navy-800">
                <div className="text-xs text-navy-400 font-medium">Emergency Modes</div>
                <div className="text-xl font-bold text-rose-400 mt-1">Hold / Silent / Voice</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 1: How SafeShe Works */}
      <section className="py-16 bg-navy-900/40 border-b border-navy-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-white">How SafeShe Works</h2>
            <p className="text-navy-300 mt-2 text-sm sm:text-base">
              A comprehensive 360-degree security pipeline built around real-world prevention, proactive alerts, and legal-grade documentation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl glass-card relative border border-navy-700/60">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Navigation className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">1. Plan & Assess</h3>
              <p className="text-sm text-navy-300 leading-relaxed">
                Before stepping out, enter your destination. SafeShe evaluates environmental lighting, crowds, and historical reports to compare safer routes.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card relative border border-navy-700/60">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">2. Monitor & Protect</h3>
              <p className="text-sm text-navy-300 leading-relaxed">
                During travel, automatic anomaly detection tracks delays or route deviations. Voice phrases ("Help") or Silent triggers initiate trusted contact alerts instantly.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card relative border border-navy-700/60">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">3. Document & Support</h3>
              <p className="text-sm text-navy-300 leading-relaxed">
                After any situation, log tamper-proof media evidence into the Vault and utilize AI to generate structured chronological incident reports for legal resources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Before / During / After Matrix */}
      <section className="py-20 border-b border-navy-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Three Layers of Complete Safety</h2>
            <p className="text-navy-300 mt-3 text-base">
              Unlike traditional SOS buttons, SafeShe supports you continuously across all three phases.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* BEFORE */}
            <div className="rounded-2xl p-6 bg-gradient-to-b from-navy-900 to-navy-950 border border-indigo-500/30 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase mb-4">
                  Phase 1 — BEFORE
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Prevention & Intelligence</h3>
                <ul className="space-y-3 text-sm text-navy-200">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                    <span>AI Safety Risk Map & Environmental Scores</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                    <span>Safer Route Analysis (Route A vs B vs C)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                    <span>Unsafe Area Crowdsourced Reports & Heatmaps</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                    <span>Verified Volunteer Helpers Directory</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-navy-800">
                <Link href="/safety-map" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  Explore Safety Risk Map <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* DURING */}
            <div className="rounded-2xl p-6 bg-gradient-to-b from-navy-900 to-navy-950 border border-rose-500/30 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase mb-4">
                  Phase 2 — DURING
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Emergency Response</h3>
                <ul className="space-y-3 text-sm text-navy-200">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                    <span>Hold 3-Seconds High-Impact Emergency SOS</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                    <span>Silent SOS (Configurable hidden trigger)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                    <span>Voice-Triggered Speech Detection ("Help", "Bachao")</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                    <span>Real-time Tokenized Location Sharing</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                    <span>Route Deviation & Delay Anomaly Detection</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-navy-800">
                <Link href="/journey" className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1">
                  Start Safe Journey <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* AFTER */}
            <div className="rounded-2xl p-6 bg-gradient-to-b from-navy-900 to-navy-950 border border-amber-500/30 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase mb-4">
                  Phase 3 — AFTER
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Evidence & Support</h3>
                <ul className="space-y-3 text-sm text-navy-200">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span>Secure Encrypted Evidence Vault</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span>SHA-256 Cryptographic Integrity Hashing</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span>AI Incident Narrative Assistant & Form Generator</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span>Legal Aid, Helplines & Counselling Directory</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-navy-800">
                <Link href="/evidence" className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1">
                  Open Secure Vault <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-navy-900/30 border-b border-navy-800/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="text-navy-300 text-sm mt-2">Everything you need to know about SafeShe's platform.</p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-navy-900/70 border border-navy-800">
              <h4 className="font-bold text-white text-base">Does SafeShe claim a route is 100% safe?</h4>
              <p className="text-sm text-navy-300 mt-2 leading-relaxed">
                No. SafeShe uses wording such as "Estimated safety indicators" based on historical reports, lighting, and environmental data. No navigation engine can guarantee 100% safety, and SafeShe displays transparent explanations for why each score was generated.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-navy-900/70 border border-navy-800">
              <h4 className="font-bold text-white text-base">How does Voice SOS work safely?</h4>
              <p className="text-sm text-navy-300 mt-2 leading-relaxed">
                Voice SOS uses browser-supported speech recognition to listen locally for user-configured emergency trigger phrases ("Help", "Bachao", "Emergency"). Audio is not continuously recorded or uploaded to servers without explicit user trigger.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-navy-900/70 border border-navy-800">
              <h4 className="font-bold text-white text-base">How are files protected in the Evidence Vault?</h4>
              <p className="text-sm text-navy-300 mt-2 leading-relaxed">
                Every evidence upload generates a cryptographic SHA-256 hash stamp to verify legal integrity. Files are stored in private storage accessible only via authenticated temporary signed URLs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-navy-950 text-navy-400 text-xs border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-white text-sm">SafeShe</span> — Startup-Grade Women Safety Platform
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition">Privacy Center</Link>
            <Link href="/resources" className="hover:text-white transition">Helplines</Link>
            <Link href="/safety-map" className="hover:text-white transition">Safety Map</Link>
          </div>
          <div>&copy; {new Date().getFullYear()} SafeShe. Built for Hackathons & Real-World Impact.</div>
        </div>
      </footer>

      <MobileNav />
    </div>
  );
}
