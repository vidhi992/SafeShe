'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, User, Phone, Globe, Bell, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyLanguage, setEmergencyLanguage] = useState('en');
  const [notificationPref, setNotificationPref] = useState('ALL');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          emergencyLanguage,
          notificationPref,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        router.push(role === 'VERIFIED_HELPER' ? '/helpers' : '/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">SafeShe</span>
          </Link>
          <h2 className="text-2xl font-bold text-white">Create SafeShe Account</h2>
          <p className="text-xs text-navy-300">Join the AI-powered safety platform protecting women 24/7.</p>
        </div>

        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-navy-700/80 shadow-2xl space-y-5">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-navy-200 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-navy-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sophia Sharma"
                  className="w-full bg-navy-900/90 border border-navy-700 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-navy-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-navy-200 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-navy-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sophia@example.com"
                    className="w-full bg-navy-900/90 border border-navy-700 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-navy-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-200 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-navy-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-navy-900/90 border border-navy-700 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-navy-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-200 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-navy-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-navy-900/90 border border-navy-700 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-navy-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-navy-200 mb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" /> Emergency Language
                </label>
                <select
                  value={emergencyLanguage}
                  onChange={(e) => setEmergencyLanguage(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="en">English (US/UK)</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="es">Spanish (Español)</option>
                  <option value="fr">French (Français)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-200 mb-1 flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5 text-indigo-400" /> Notifications
                </label>
                <select
                  value={notificationPref}
                  onChange={(e) => setNotificationPref(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All (SMS + Email + App)</option>
                  <option value="SMS_ONLY">SMS Alerts Only</option>
                  <option value="EMAIL_ONLY">Email Alerts Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-200 mb-1">Account Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className={`p-3 rounded-xl border text-left text-xs transition ${
                    role === 'USER'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                      : 'bg-navy-900/60 border-navy-700 text-navy-300'
                  }`}
                >
                  <div className="font-semibold text-white">Regular User</div>
                  <div className="text-[10px] text-navy-300 mt-0.5">Journeys, SOS & Vault</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('VERIFIED_HELPER')}
                  className={`p-3 rounded-xl border text-left text-xs transition ${
                    role === 'VERIFIED_HELPER'
                      ? 'bg-emerald-600/20 border-emerald-500 text-white font-bold'
                      : 'bg-navy-900/60 border-navy-700 text-navy-300'
                  }`}
                >
                  <div className="font-semibold text-white">Volunteer Helper</div>
                  <div className="text-[10px] text-navy-300 mt-0.5">Assist nearby requests</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <p className="text-center text-xs text-navy-400">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 hover:underline font-semibold">
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
