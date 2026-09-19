'use client';

import { useState } from 'react';
import { ShieldAlert, UserCheck, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DemoBanner() {
  const router = useRouter();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<string>('USER');

  async function handleDemoSwitch(role: 'USER' | 'VERIFIED_HELPER' | 'ADMIN') {
    setLoadingRole(role);
    try {
      const res = await fetch('/api/auth/demo-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        setActiveRole(role);
        router.refresh();
        if (role === 'ADMIN') {
          router.push('/admin');
        } else if (role === 'VERIFIED_HELPER') {
          router.push('/helpers');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRole(null);
    }
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/20 via-navy-800 to-indigo-900/40 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            DEMO MODE
          </span>
          <span className="hidden md:inline text-navy-200">
            Simulated Emergency Calls, Real-time Location, & AI Engine Active
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-navy-300 mr-1 hidden lg:inline">Quick Switch Role:</span>
          
          <button
            onClick={() => handleDemoSwitch('USER')}
            disabled={loadingRole !== null}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 font-medium ${
              activeRole === 'USER'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-navy-800/80 text-navy-200 hover:bg-navy-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            User
          </button>

          <button
            onClick={() => handleDemoSwitch('VERIFIED_HELPER')}
            disabled={loadingRole !== null}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 font-medium ${
              activeRole === 'VERIFIED_HELPER'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-navy-800/80 text-navy-200 hover:bg-navy-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Helper
          </button>

          <button
            onClick={() => handleDemoSwitch('ADMIN')}
            disabled={loadingRole !== null}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 font-medium ${
              activeRole === 'ADMIN'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-navy-800/80 text-navy-200 hover:bg-navy-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Admin
          </button>
        </div>
      </div>
    </div>
  );
}
