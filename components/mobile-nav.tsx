'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Navigation, Shield, AlertTriangle, Lock, PhoneCall } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-navy-700 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            pathname === '/dashboard' ? 'text-indigo-400' : 'text-navy-400 hover:text-navy-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          Dashboard
        </Link>

        <Link
          href="/safety-map"
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            pathname === '/safety-map' ? 'text-indigo-400' : 'text-navy-400 hover:text-navy-200'
          }`}
        >
          <Navigation className="w-5 h-5 mb-0.5" />
          Safety Map
        </Link>

        {/* Prominent Center SOS */}
        <Link
          href="/emergency"
          className="relative -top-4 w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 to-rose-500 border-4 border-navy-950 flex flex-col items-center justify-center text-white shadow-xl shadow-rose-600/40 sos-active-pulse group"
        >
          <AlertTriangle className="w-6 h-6 animate-pulse" />
          <span className="text-[9px] font-black tracking-tighter uppercase -mt-0.5">SOS</span>
        </Link>

        <Link
          href="/journey"
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            pathname === '/journey' ? 'text-indigo-400' : 'text-navy-400 hover:text-navy-200'
          }`}
        >
          <Shield className="w-5 h-5 mb-0.5" />
          Journey
        </Link>

        <Link
          href="/evidence"
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            pathname === '/evidence' ? 'text-indigo-400' : 'text-navy-400 hover:text-navy-200'
          }`}
        >
          <Lock className="w-5 h-5 mb-0.5" />
          Vault
        </Link>
      </div>
    </div>
  );
}
