'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { MobileNav } from '@/components/mobile-nav';
import { DemoBanner } from '@/components/demo-banner';
import {
  Users,
  UserPlus,
  Phone,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  X,
  PhoneCall,
  Power,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  Info,
} from 'lucide-react';

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  isVerified: boolean;
  isEnabled: boolean;
  priority: number;
  otpCode?: string | null;
}

export default function TrustedContactsPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Mother');
  const [phonePrefix, setPhonePrefix] = useState('+91');
  const [rawPhone, setRawPhone] = useState('');
  const [priority, setPriority] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // OTP Verification Modal state
  const [activeOtpContact, setActiveOtpContact] = useState<EmergencyContact | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [demoOtpCode, setDemoOtpCode] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    try {
      const res = await fetch('/api/emergency-contacts');
      const data = await res.json();
      if (data.contacts) {
        setContacts(data.contacts);
        setPriority(data.contacts.length + 1);
      }
    } catch (e) {
      console.error('Fetch emergency contacts failed:', e);
    }
  }

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || !rawPhone) {
      setErrorMsg('Please enter both name and phone number.');
      return;
    }

    const fullPhone = rawPhone.startsWith('+')
      ? rawPhone
      : `${phonePrefix}${rawPhone.replace(/\D/g, '')}`;

    setLoading(true);
    try {
      const res = await fetch('/api/emergency-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          relationship,
          phoneNumber: fullPhone,
          priority,
        }),
      });

      const data = await res.json();

      if (res.ok && data.contact) {
        setName('');
        setRawPhone('');
        fetchContacts();
        setSuccessMsg(`Added ${data.contact.name}. Verification code sent to ${data.contact.phoneNumber}`);
        
        // Trigger OTP Modal automatically for immediate verification
        setActiveOtpContact(data.contact);
        setEnteredOtp('');
        setOtpError('');
        if (data.demoOtpNote) {
          const matchedOtp = data.demoOtpNote.match(/\d{6}/);
          if (matchedOtp) setDemoOtpCode(matchedOtp[0]);
        }
      } else {
        setErrorMsg(data.error || 'Failed to add emergency contact');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!activeOtpContact || !enteredOtp) return;

    setOtpLoading(true);
    setOtpError('');

    try {
      const res = await fetch('/api/emergency-contacts/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: activeOtpContact.id,
          otpCode: enteredOtp,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(`✓ Phone number for ${activeOtpContact.name} verified successfully!`);
        setActiveOtpContact(null);
        setEnteredOtp('');
        setDemoOtpCode(null);
        fetchContacts();
      } else {
        setOtpError(data.error || 'Invalid verification OTP code.');
      }
    } catch (e: any) {
      setOtpError('Failed to verify OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleToggleEnabled(contact: EmergencyContact) {
    try {
      const res = await fetch(`/api/emergency-contacts/${contact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !contact.isEnabled }),
      });

      if (res.ok) fetchContacts();
    } catch (e) {
      console.error('Toggle contact failed:', e);
    }
  }

  async function handleDelete(contactId: string, contactName: string) {
    if (!confirm(`Are you sure you want to remove ${contactName} from your emergency contacts?`)) return;

    try {
      const res = await fetch(`/api/emergency-contacts/${contactId}`, {
        method: 'DELETE',
      });

      if (res.ok) fetchContacts();
    } catch (e) {
      console.error('Delete contact failed:', e);
    }
  }

  function openVerificationModal(contact: EmergencyContact) {
    setActiveOtpContact(contact);
    setEnteredOtp('');
    setOtpError('');
    setDemoOtpCode(contact.otpCode || null);
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col pb-24 md:pb-8">
      <DemoBanner />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase">
            <PhoneCall className="w-3.5 h-3.5 text-indigo-400" />
            Emergency Contacts & Guardian Calling
          </div>
          <h1 className="text-3xl font-extrabold text-white">Emergency Contacts</h1>
          <p className="text-xs sm:text-sm text-navy-300">
            People who should be contacted during an SOS. When you trigger SOS, SafeShe will automatically initiate real voice phone calls to your verified guardians.
          </p>
        </div>

        {/* Global Feedback Notifications */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Add Emergency Contact Form Card */}
        <div className="glass-card p-6 rounded-2xl border border-navy-700/80 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-400" /> Add Emergency Contact
          </h2>

          <form onSubmit={handleAddContact} className="grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-navy-200 mb-1">Parent / Guardian Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Priya Sharma"
                className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3.5 py-2.5 text-white placeholder-navy-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-navy-200 mb-1">Relationship</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Guardian">Guardian</option>
                <option value="Brother/Sister">Brother / Sister</option>
                <option value="Spouse">Spouse / Partner</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-navy-200 mb-1">Phone Number (E.164 Format)</label>
              <div className="flex gap-2">
                <select
                  value={phonePrefix}
                  onChange={(e) => setPhonePrefix(e.target.value)}
                  className="bg-navy-900 border border-navy-700 rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:outline-none"
                >
                  <option value="+91">🇮🇳 +91 (IN)</option>
                  <option value="+1">🇺🇸 +1 (US)</option>
                  <option value="+44">🇬🇧 +44 (UK)</option>
                  <option value="+971">🇦🇪 +971 (UAE)</option>
                </select>
                <input
                  type="tel"
                  required
                  value={rawPhone}
                  onChange={(e) => setRawPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-navy-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-navy-200 mb-1">Calling Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value))}
                className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={1}>Priority 1 (Called First)</option>
                <option value={2}>Priority 2 (Called Second)</option>
                <option value={3}>Priority 3 (Called Third)</option>
                <option value={4}>Priority 4</option>
                <option value={5}>Priority 5</option>
              </select>
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                {loading ? 'Adding Contact...' : 'Send Verification Code & Save Contact'}
              </button>
            </div>
          </form>
        </div>

        {/* Saved Emergency Contacts List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-300 uppercase tracking-wider">
              Configured Emergency Guardians ({contacts.length})
            </h3>
            <span className="text-xs text-navy-400">Allowed: minimum 3 recommended</span>
          </div>

          {contacts.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl border border-navy-800 text-center space-y-2">
              <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
              <h4 className="text-white font-bold">No Emergency Contacts Configured</h4>
              <p className="text-xs text-navy-300 max-w-md mx-auto">
                Add your parents or trusted guardians above so SafeShe can automatically place phone calls to them if an SOS emergency occurs.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact, index) => (
                <div
                  key={contact.id}
                  className={`glass-card p-5 rounded-2xl border transition ${
                    contact.isEnabled ? 'border-navy-700/80' : 'border-navy-800 opacity-60'
                  } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                        Priority {contact.priority}
                      </span>
                      <span className="font-bold text-white text-base">{contact.name}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-navy-800 border border-navy-700 text-navy-200 text-xs font-semibold">
                        {contact.relationship}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-mono text-navy-200 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-indigo-400" /> {contact.phoneNumber}
                      </span>

                      {/* Verification Status Badge */}
                      {contact.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => openVerificationModal(contact)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold hover:bg-amber-500/30 transition animate-pulse"
                        >
                          <KeyRound className="w-3 h-3" /> Verify via OTP
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Enable/Disable Toggle */}
                    <button
                      onClick={() => handleToggleEnabled(contact)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                        contact.isEnabled
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-navy-800 border-navy-700 text-navy-400 hover:bg-navy-700'
                      }`}
                      title={contact.isEnabled ? 'Guardian Calling Enabled' : 'Guardian Calling Disabled'}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {contact.isEnabled ? 'Enabled' : 'Disabled'}
                    </button>

                    {/* Delete Contact Button */}
                    <button
                      onClick={() => handleDelete(contact.id, contact.name)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                      title="Delete Contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SOS Guardian Calling Information Box */}
        <div className="glass-card p-6 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 space-y-3">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SOS Guardian Calling Configured
          </div>
          <p className="text-xs text-navy-200 leading-relaxed">
            During an SOS emergency activation, SafeShe will automatically call your verified contacts in priority order using our telephony gateway. 
            Automated voice guidance will notify them immediately and provide a secure, access-controlled emergency location portal.
          </p>
        </div>

        {/* Clear Privacy Explanation */}
        <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 text-navy-300 text-xs flex items-center gap-3">
          <Info className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>
            <strong className="text-white">Privacy Guarantee:</strong> Your emergency contacts are private and are strictly used for emergency communication during active SOS alerts.
          </span>
        </div>

      </main>

      {/* OTP Verification Modal */}
      {activeOtpContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-indigo-500/40 bg-navy-900 text-left space-y-4 shadow-2xl relative">
            <button
              onClick={() => setActiveOtpContact(null)}
              className="absolute top-4 right-4 text-navy-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase">
                <KeyRound className="w-3 h-3 text-indigo-400" /> Phone Verification
              </div>
              <h3 className="text-lg font-bold text-white">Enter Verification Code</h3>
              <p className="text-xs text-navy-300">
                Verify phone number for <strong className="text-white">{activeOtpContact.name}</strong> ({activeOtpContact.phoneNumber}).
              </p>
            </div>

            {demoOtpCode && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                [DEMO MODE] Verification OTP code: <strong>{demoOtpCode}</strong>
              </div>
            )}

            {otpError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                {otpError}
              </div>
            )}

            <div className="space-y-2">
              <label className="block font-semibold text-xs text-navy-200">6-Digit Verification Code</label>
              <input
                type="text"
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveOtpContact(null)}
                className="w-1/2 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-200 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={otpLoading || enteredOtp.length !== 6}
                className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {otpLoading ? 'Verifying...' : 'Verify Number'}
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
}
