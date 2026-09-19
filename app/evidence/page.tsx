'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { MobileNav } from '@/components/mobile-nav';
import { DemoBanner } from '@/components/demo-banner';
import { Lock, Upload, FileText, Image as ImageIcon, Video, Mic, ShieldCheck, Download, Trash2, Key, CheckCircle2, AlertCircle } from 'lucide-react';

interface EvidenceItem {
  id: string;
  title: string;
  description?: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  cryptoHash: string;
  createdAt: string;
}

export default function EvidenceVaultPage() {
  const [evidences, setEvidences] = useState<EvidenceItem[]>([]);
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewItem, setPreviewItem] = useState<EvidenceItem | null>(null);

  useEffect(() => {
    fetchEvidences();
  }, []);

  async function fetchEvidences() {
    try {
      const res = await fetch('/api/evidence');
      const data = await res.json();
      if (data.evidences) setEvidences(data.evidences);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title || selectedFile.name);

      const res = await fetch('/api/evidence', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Upload failed');
      } else {
        setTitle('');
        setSelectedFile(null);
        fetchEvidences();
      }
    } catch (e) {
      setErrorMsg('Upload error. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function getFileIcon(type: string) {
    if (type.includes('image')) return <ImageIcon className="w-5 h-5 text-indigo-400" />;
    if (type.includes('video')) return <Video className="w-5 h-5 text-rose-400" />;
    if (type.includes('audio')) return <Mic className="w-5 h-5 text-emerald-400" />;
    return <FileText className="w-5 h-5 text-amber-400" />;
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col pb-24 md:pb-8">
      <DemoBanner />
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase mb-2">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              SHA-256 Cryptographic Hash Verification
            </div>
            <h1 className="text-3xl font-extrabold text-white">Secure Evidence Vault</h1>
            <p className="text-xs sm:text-sm text-navy-300 mt-1">
              Encrypted digital vault for storing tamper-proof photos, audio clips, and incident records.
            </p>
          </div>
        </div>

        {/* Upload Form Box */}
        <div className="glass-card p-6 rounded-2xl border border-navy-700/80 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-indigo-400" /> Upload New Evidence Record
          </h3>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpload} className="grid sm:grid-cols-12 gap-4 text-xs">
            <div className="sm:col-span-5">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Evidence Record Label (e.g. Photo outside Metro)"
                className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3.5 py-2.5 text-white placeholder-navy-500"
              />
            </div>

            <div className="sm:col-span-5">
              <input
                type="file"
                required
                accept="image/*,video/*,audio/*,.pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3 py-2 text-white text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={uploading}
                className="w-full h-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {uploading ? 'Encrypting...' : 'Upload & Hash'}
              </button>
            </div>
          </form>
        </div>

        {/* Vault Grid */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-navy-300 uppercase tracking-wider">
            Stored Evidence Records ({evidences.length})
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evidences.map((item) => (
              <div
                key={item.id}
                className="glass-card p-5 rounded-2xl border border-navy-700/80 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getFileIcon(item.fileType)}
                      <span className="font-bold text-white text-sm truncate max-w-[150px]">{item.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-navy-400">{formatBytes(item.fileSize)}</span>
                  </div>

                  <p className="text-[11px] text-navy-300 line-clamp-2">
                    {item.description || 'Verified evidence file.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-navy-800 space-y-2 text-[10px]">
                  <div>
                    <span className="text-navy-400 block font-semibold">SHA-256 Cryptographic Hash:</span>
                    <span className="font-mono text-indigo-300 truncate block bg-navy-950 px-2 py-1 rounded">
                      {item.cryptoHash}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-navy-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="text-xs font-bold text-indigo-400 hover:underline"
                    >
                      View & Verify
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Verification Modal */}
        {previewItem && (
          <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-card max-w-lg w-full p-6 rounded-2xl border border-indigo-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" /> Evidence Legal Record
                </h3>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="text-navy-400 hover:text-white font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-navy-900 border border-navy-800">
                  <div className="text-navy-400">File Name: <strong className="text-white">{previewItem.title}</strong></div>
                  <div className="text-navy-400 mt-1">MIME Type: <strong className="text-indigo-300">{previewItem.fileType}</strong></div>
                  <div className="text-navy-400 mt-1">Uploaded: <strong className="text-white">{new Date(previewItem.createdAt).toLocaleString()}</strong></div>
                </div>

                <div>
                  <label className="block text-navy-400 font-bold mb-1">Cryptographic Integrity Hash Stamp (SHA-256)</label>
                  <div className="p-2.5 rounded-xl bg-navy-950 font-mono text-[11px] text-emerald-400 border border-emerald-500/30 break-all">
                    {previewItem.cryptoHash}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <a
                    href={previewItem.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-center transition"
                  >
                    Open Private File Link
                  </a>
                  <button
                    onClick={() => setPreviewItem(null)}
                    className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      <MobileNav />
    </div>
  );
}
