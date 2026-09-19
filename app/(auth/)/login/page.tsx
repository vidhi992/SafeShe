'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, UserCheck, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { DemoBanner } from '@/components/demo-banner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function loginAsDemo(role: 'USER' | 'VERIFIED_HELPER' | 'ADMIN') {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/demo-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        router.push(role === 'ADMIN' ? '/admin' : role === 'VERIFIED_HELPER' ? '/helpers' : '/dashboard');
        router.refresh();
      }
    } catch (e) {
      setError('Demo login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col justify-between">
      <DemoBanner />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 group mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">SafeShe</span>
            </Link>
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-xs text-navy-300">Sign in to manage your journeys, trusted contacts & security vault.</p>
          </div>

          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-navy-700/80 shadow-2xl space-y-6">
            
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-200 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-navy-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@safeshe.org"
                    className="w-full bg-navy-900/90 border border-navy-700 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-navy-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-200 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-navy-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-navy-900/90 border border-navy-700 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-navy-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div className="relative border-t border-navy-800 pt-5">
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-navy-900 px-3 text-[10px] uppercase font-bold text-navy-400">
                Or Quick Demo Login
              </span>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => loginAsDemo('USER')}
                  className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-700 text-xs font-medium text-indigo-300 flex flex-col items-center gap-1 transition"
                >
                  <UserCheck className="w-4 h-4" />
                  User
                </button>
                <button
                  type="button"
                  onClick={() => loginAsDemo('VERIFIED_HELPER')}
                  className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-700 text-xs font-medium text-emerald-300 flex flex-col items-center gap-1 transition"
                >
                  <Shield className="w-4 h-4" />
                  Helper
                </button>
                <button
                  type="button"
                  onClick={() => loginAsDemo('ADMIN')}
                  className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-700 text-xs font-medium text-rose-300 flex flex-col items-center gap-1 transition"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Admin
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-navy-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-indigo-400 hover:underline font-semibold">
                Create Account
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
