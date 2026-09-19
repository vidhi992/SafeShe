'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Navigation, AlertTriangle, FileText, Lock, PhoneCall, LogOut, User, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/safety-map', label: 'Safety Map', icon: Navigation },
    { href: '/journey', label: 'Safe Journey', icon: Shield },
    { href: '/evidence', label: 'Evidence Vault', icon: Lock },
    { href: '/report', label: 'Report Unsafe', icon: AlertTriangle },
    { href: '/resources', label: 'Emergency Help', icon: PhoneCall },
  ];

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/signin');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-navy-900 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-navy-100 to-indigo-200">
                SafeShe
              </span>
              <span className="block text-[10px] text-indigo-400 font-medium tracking-wider uppercase -mt-1">
                AI Prevention Platform
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-inner'
                      : 'text-navy-300 hover:text-white hover:bg-navy-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action & User Controls */}
          <div className="flex items-center gap-3">
            {/* Quick SOS Trigger Button */}
            <Link
              href="/emergency"
              className="px-3.5 py-2 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs sm:text-sm font-bold tracking-wide transition shadow-lg shadow-rose-600/30 flex items-center gap-1.5 border border-rose-500/50 sos-active-pulse"
            >
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              <span>SOS</span>
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-navy-800/80 border border-navy-700 hover:bg-navy-700 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.name ? user.name[0] : 'U'}
                  </div>
                  <div className="hidden sm:block text-left text-xs">
                    <div className="font-semibold text-white leading-tight truncate max-w-[100px]">{user.name}</div>
                    <div className="text-[10px] text-indigo-400 uppercase font-medium">{user.role}</div>
                  </div>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl glass-card shadow-2xl py-2 border border-navy-700 z-50">
                    <div className="px-4 py-2 border-b border-navy-700/60">
                      <p className="text-xs text-navy-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold text-indigo-300 bg-indigo-500/20 rounded border border-indigo-500/30">
                        Role: {user.role}
                      </span>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-navy-200 hover:bg-navy-800 hover:text-white"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-rose-300 hover:bg-navy-800"
                      >
                        <ShieldCheck className="w-4 h-4" /> Admin Console
                      </Link>
                    )}

                    {user.role === 'VERIFIED_HELPER' && (
                      <Link
                        href="/helpers"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-300 hover:bg-navy-800"
                      >
                        <Shield className="w-4 h-4" /> Helper Portal
                      </Link>
                    )}

                    <Link
                      href="/privacy"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-navy-200 hover:bg-navy-800 hover:text-white"
                    >
                      <Lock className="w-4 h-4" /> Privacy Center
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-navy-800 text-left border-t border-navy-700/60 mt-1"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/signin"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-navy-200 hover:text-white hover:bg-navy-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
