'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Plus,
  CheckCircle2,
  XCircle,
  Building2,
  Phone,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
  Search,
  Filter,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { INDIA_STATES_AND_UTS } from '@/lib/maps/india-regions';

interface Resource {
  id: string;
  name: string;
  category: string;
  state: string;
  district: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  phone: string | null;
  website: string | null;
  description: string | null;
  services: string | null;
  availability: string | null;
  source: string | null;
  verified: boolean;
  lastVerifiedAt: string | null;
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'POLICE',
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    city: 'Bhopal',
    address: '',
    lat: '23.2599',
    lng: '77.4126',
    phone: '',
    website: '',
    description: '',
    services: '',
    availability: '24/7 Verified',
    source: 'Official Government Portal',
    verified: true,
  });

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/resources');
      const data = await res.json();
      if (data.resources) {
        setResources(data.resources);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleOpenAddModal = () => {
    setEditingResource(null);
    setFormData({
      name: '',
      category: 'POLICE',
      state: 'Madhya Pradesh',
      district: 'Bhopal',
      city: 'Bhopal',
      address: '',
      lat: '23.2599',
      lng: '77.4126',
      phone: '',
      website: '',
      description: '',
      services: '',
      availability: '24/7 Verified',
      source: 'Official State Government Website',
      verified: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (res: Resource) => {
    setEditingResource(res);
    setFormData({
      name: res.name,
      category: res.category,
      state: res.state,
      district: res.district || '',
      city: res.city || '',
      address: res.address || '',
      lat: String(res.lat),
      lng: String(res.lng),
      phone: res.phone || '',
      website: res.website || '',
      description: res.description || '',
      services: res.services || '',
      availability: res.availability || '24/7 Verified',
      source: res.source || 'Official Source',
      verified: res.verified,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingResource) {
        // Edit existing
        const res = await fetch(`/api/admin/resources/${editingResource.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setIsModalOpen(false);
          fetchResources();
        }
      } else {
        // Add new
        const res = await fetch('/api/admin/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setIsModalOpen(false);
          fetchResources();
        }
      }
    } catch (err) {
      console.error('Failed to save resource:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this emergency resource?')) return;
    try {
      const res = await fetch(`/api/admin/resources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setResources((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete resource:', err);
    }
  };

  const handleToggleVerify = async (resItem: Resource) => {
    try {
      const updatedVerified = !resItem.verified;
      const res = await fetch(`/api/admin/resources/${resItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verified: updatedVerified,
          source: resItem.source || 'Official Government Directory',
        }),
      });
      if (res.ok) {
        setResources((prev) =>
          prev.map((item) =>
            item.id === resItem.id ? { ...item, verified: updatedVerified } : item
          )
        );
      }
    } catch (err) {
      console.error('Toggle verify error:', err);
    }
  };

  const filtered = resources.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState === 'All' || item.state === selectedState;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesState && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/resources"
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-rose-500" />
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-rose-400">
                  Pan-India Emergency Directory Admin
                </h1>
              </div>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Manage nationwide verified police stations, Sakhi One Stop Centres, hospitals, and emergency helplines.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold shadow-lg shadow-rose-950 hover:from-rose-500 hover:to-pink-500 transition"
          >
            <Plus className="w-5 h-5" />
            Add New Resource
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by resource name, district, state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-rose-500"
            >
              <option value="All">🇮🇳 All States & UTs ({resources.length})</option>
              {INDIA_STATES_AND_UTS.map((reg) => (
                <option key={reg.state} value={reg.state}>
                  {reg.state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-rose-500"
            >
              <option value="All">All Categories</option>
              <option value="NATIONAL_EMERGENCY">National Emergency Helpline</option>
              <option value="POLICE">Police & Women Helpdesk</option>
              <option value="ONE_STOP_CENTRE">Sakhi One Stop Centre (OSC)</option>
              <option value="HOSPITAL">Hospital / Casualty</option>
              <option value="TRAUMA_CENTER">Trauma Centre</option>
              <option value="LEGAL_SUPPORT">Legal Support</option>
              <option value="WOMEN_SUPPORT">Women Support</option>
            </select>
          </div>
        </div>

        {/* Resource Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-rose-500" />
              Loading Pan-India resources database...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              No emergency resources found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Resource & Category</th>
                    <th className="px-5 py-3.5">Location</th>
                    <th className="px-5 py-3.5">Contact & Services</th>
                    <th className="px-5 py-3.5">Verification</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            {item.category.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-400">
                            {item.availability || '24/7 Active'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-slate-200 font-medium">{item.state}</div>
                        <div className="text-xs text-slate-400">
                          {item.district || item.city} • Lat: {item.lat.toFixed(3)}, Lng: {item.lng.toFixed(3)}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-xs mt-0.5">
                          {item.address}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-rose-400 font-mono text-xs">
                          <Phone className="w-3.5 h-3.5" />
                          {item.phone || 'N/A'}
                        </div>
                        {item.services && (
                          <div className="text-xs text-slate-400 mt-1 max-w-xs truncate">
                            {item.services}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggleVerify(item)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                            item.verified
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {item.verified ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Unverified
                            </>
                          )}
                        </button>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Source: {item.source || 'Govt Portal'}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Edit Resource"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                            title="Delete Resource"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingResource ? 'Edit Emergency Resource' : 'Add New Pan-India Resource'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Resource Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. AIIMS New Delhi / Sakhi OSC Indore"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm"
                  >
                    <option value="NATIONAL_EMERGENCY">National Emergency Helpline</option>
                    <option value="POLICE">Police & Women Desk</option>
                    <option value="ONE_STOP_CENTRE">Sakhi One Stop Centre (OSC)</option>
                    <option value="HOSPITAL">Hospital / Medical College</option>
                    <option value="TRAUMA_CENTER">Trauma Centre</option>
                    <option value="LEGAL_SUPPORT">Legal Support</option>
                    <option value="WOMEN_SUPPORT">Women Support NGO/Group</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">State / UT *</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm"
                  >
                    {INDIA_STATES_AND_UTS.map((reg) => (
                      <option key={reg.state} value={reg.state}>
                        {reg.state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g. Bhopal / Mumbai / Jaipur"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">City / Town</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Indore"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Full Physical Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Saket Nagar, Bhopal, MP 462020"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Latitude</label>
                  <input
                    type="text"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    placeholder="e.g. 23.2599"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Longitude</label>
                  <input
                    type="text"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    placeholder="e.g. 77.4126"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Phone Number (Verified)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 0755-2443800 or 112"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Source Attribution</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="e.g. Ministry of Women and Child Development / State Police Portal"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Services Provided</label>
                  <input
                    type="text"
                    value={formData.services}
                    onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                    placeholder="e.g. Police dispatch, Legal assistance, Temporary shelter"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Availability</label>
                  <input
                    type="text"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    placeholder="e.g. 24/7 Verified or Not specified"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="verifiedCheck"
                  checked={formData.verified}
                  onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600 bg-slate-950 border-slate-800 focus:ring-rose-500"
                />
                <label htmlFor="verifiedCheck" className="text-sm text-slate-300">
                  Mark as officially verified resource
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold text-sm shadow-md hover:from-rose-500 hover:to-pink-500"
                >
                  {editingResource ? 'Save Changes' : 'Create Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
