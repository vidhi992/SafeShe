'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { MobileNav } from '@/components/mobile-nav';
import { DemoBanner } from '@/components/demo-banner';
import { AlertTriangle, MapPin, Camera, ShieldCheck, CheckCircle2, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ReportUnsafePage() {
  const router = useRouter();
  const [category, setCategory] = useState('Harassment');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const categories = [
    'Harassment',
    'Stalking',
    'Poor lighting',
    'Isolated area',
    'Unsafe public transport',
    'Suspicious activity',
    'Broken infrastructure',
    'Other',
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          locationName,
          description,
          isAnonymous,
          imageUrl: imageUrl || null,
          lat: 37.7765,
          lng: -122.422,
        }),
      });

      if (res.ok) {
        setSuccessMsg('Safety report submitted successfully! Added to community risk heatmap.');
        setTimeout(() => router.push('/safety-map'), 1500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col pb-24 md:pb-8">
      <DemoBanner />
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Crowdsourced Safety Heatmap
          </div>
          <h1 className="text-3xl font-extrabold text-white">Report Unsafe Area</h1>
          <p className="text-xs sm:text-sm text-navy-300">
            Help protect other women by flagging unlit streets, harassment spots, or broken infrastructure.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-navy-700/80 space-y-6">
          
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            
            {/* Category Grid */}
            <div>
              <label className="block font-bold text-white mb-2">Select Issue Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-3 rounded-xl border text-center transition font-semibold ${
                      category === cat
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                        : 'bg-navy-900/80 border-navy-700 text-navy-300 hover:bg-navy-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Input */}
            <div>
              <label className="block font-bold text-navy-200 mb-1">Incident Location / Landmark</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-navy-400" />
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Oak Street Underpass Exit 3"
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl px-4 py-2.5 pl-10 text-white placeholder-navy-500"
                />
              </div>
            </div>

            {/* Description Input */}
            <div>
              <label className="block font-bold text-navy-200 mb-1">Detailed Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred, lighting conditions, or specific safety concerns..."
                className="w-full bg-navy-900 border border-navy-700 rounded-xl p-3.5 text-white placeholder-navy-500"
              />
            </div>

            {/* Photo URL / Upload Simulator */}
            <div>
              <label className="block font-bold text-navy-200 mb-1 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-400" /> Optional Image Proof (URL)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3.5 py-2.5 text-white placeholder-navy-500"
              />
            </div>

            {/* Anonymous Toggle */}
            <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="font-bold text-white">Report Anonymously</div>
                  <div className="text-[10px] text-navy-400">Your name and profile will be hidden from public view.</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {loading ? 'Submitting Report...' : 'Publish Safety Report'}
            </button>

          </form>

        </div>

      </main>

      <MobileNav />
    </div>
  );
}
