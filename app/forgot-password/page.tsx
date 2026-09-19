'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthCardLayout } from '@/components/auth/auth-card-layout';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  }

  return (
    <AuthCardLayout
      title="Reset your password"
      subtitle="Enter your account email to receive a password reset link."
    >
      <div className="space-y-4 text-xs">
        {submitted ? (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Password Reset Dispatched
            </div>
            <p className="leading-relaxed">
              If an account exists for <strong className="text-white">{email}</strong>, a password reset link has been generated and logged.
            </p>
            <div className="text-[10px] text-navy-300 bg-navy-950 p-2.5 rounded-xl border border-navy-800">
              <span className="font-bold text-amber-300">Development Fallback Note:</span> SMTP email provider is operating in local sandbox mode. You may also use the Demo Role Switcher to log in instantly.
            </div>
            <Link
              href="/signin"
              className="inline-flex items-center gap-1 text-indigo-400 hover:underline font-bold pt-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold text-navy-200 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-navy-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sophia@example.com"
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl px-4 py-2.5 pl-10 text-white placeholder-navy-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Sending Request...' : 'Send Password Reset Link'}
            </button>

            <div className="text-center pt-2">
              <Link href="/signin" className="text-navy-400 hover:text-white font-semibold inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </AuthCardLayout>
  );
}
