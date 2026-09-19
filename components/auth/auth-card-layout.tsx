import Link from 'next/link';
import { Shield, Sparkles } from 'lucide-react';
import { DemoBanner } from '@/components/demo-banner';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthCardLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col justify-between">
      <DemoBanner />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl glass-card rounded-3xl border border-navy-700/80 shadow-2xl overflow-hidden grid lg:grid-cols-12 min-h-[550px]">
          
          {/* Left Column: Branding Hero Section (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950 via-navy-900 to-indigo-900/60 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-navy-800 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-white tracking-tight">SafeShe</span>
                  <span className="block text-[10px] text-indigo-400 font-bold uppercase tracking-widest -mt-1">
                    AI Prevention Platform
                  </span>
                </div>
              </Link>

              <div className="space-y-3 pt-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  3-Layer Safety Architecture
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                  Safety shouldn't begin{' '}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-rose-300">
                    after something happens.
                  </span>
                </h2>

                <p className="text-xs text-navy-200 leading-relaxed font-normal">
                  Real-time location intelligence, AI risk maps, silent emergency escalation, and encrypted legal evidence vault.
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-8 border-t border-navy-800/80 text-[11px] text-navy-400">
              Trusted 24/7 Women Safety System &copy; {new Date().getFullYear()} SafeShe.
            </div>
          </div>

          {/* Right Column: Form Container (7 Cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-6 bg-navy-950/80">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              <p className="text-xs text-navy-300">{subtitle}</p>
            </div>

            {children}
          </div>

        </div>
      </div>
    </div>
  );
}
