'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, UserCheck, Shield, ShieldAlert } from 'lucide-react';

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || email.trim() === '') {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid email or password.');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('Connection error. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoSwitch(role: 'USER' | 'VERIFIED_HELPER' | 'ADMIN') {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/demo-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        router.push(role === 'ADMIN' ? '/admin' : role === 'VERIFIED_HELPER' ? '/helpers' : callbackUrl);
        router.refresh();
      }
    } catch (e) {
      setError('Demo authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-navy-200 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-3 text-navy-400 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@safeshe.org"
              className="w-full bg-navy-900 border border-navy-700 rounded-xl px-4 py-2.5 pl-10 text-white placeholder-navy-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-semibold text-navy-200">Password</label>
            <Link href="/forgot-password" className="text-[11px] text-indigo-400 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3 text-navy-400 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-navy-900 border border-navy-700 rounded-xl px-4 py-2.5 pl-10 pr-10 text-white placeholder-navy-500 focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-navy-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 mt-2"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="relative border-t border-navy-800 pt-4">
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-navy-950 px-3 text-[10px] uppercase font-bold text-navy-400">
          Or Quick Demo Login
        </span>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <button
            type="button"
            onClick={() => handleDemoSwitch('USER')}
            disabled={loading}
            className="p-2 rounded-xl bg-navy-900 hover:bg-navy-800 border border-navy-700 text-xs font-semibold text-indigo-300 flex flex-col items-center gap-1 transition"
          >
            <UserCheck className="w-4 h-4" /> User
          </button>
          <button
            type="button"
            onClick={() => handleDemoSwitch('VERIFIED_HELPER')}
            disabled={loading}
            className="p-2 rounded-xl bg-navy-900 hover:bg-navy-800 border border-navy-700 text-xs font-semibold text-emerald-300 flex flex-col items-center gap-1 transition"
          >
            <Shield className="w-4 h-4" /> Helper
          </button>
          <button
            type="button"
            onClick={() => handleDemoSwitch('ADMIN')}
            disabled={loading}
            className="p-2 rounded-xl bg-navy-900 hover:bg-navy-800 border border-navy-700 text-xs font-semibold text-rose-300 flex flex-col items-center gap-1 transition"
          >
            <ShieldAlert className="w-4 h-4" /> Admin
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-navy-400 pt-2">
        Don't have an account?{' '}
        <Link href="/signup" className="text-indigo-400 hover:underline font-semibold">
          Create an account
        </Link>
      </p>
    </div>
  );
}
