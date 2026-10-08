import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiRequest } from '../../lib/api.ts';
import {
  User,
  ShieldCheck,
  Smartphone,
  Mail,
  Award,
  CheckCircle2,
  TrendingUp,
  FileCheck,
  Star,
  Loader2,
  Sparkles
} from 'lucide-react';

export const AgentProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [phone, setPhone] = useState(user?.phone || '');
  const [mpesaNumber, setMpesaNumber] = useState(user?.mpesaNumber || user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await apiRequest('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          phone,
          mpesaNumber,
          bio,
        }),
      });
      await refreshUser();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Agent Accreditation Profile</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your verified credentials, Safaricom M-Pesa payout target, and operational scorecard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Accreditation Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl p-6 rounded-3xl border border-slate-800/90 text-center space-y-4 shadow-xl">
          <div className="relative w-24 h-24 mx-auto">
            <img
              src={user.avatarUrl || '/src/assets/images/agent_avatar_sarah_1791395183231.jpg'}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-emerald-400 shadow-lg shadow-emerald-950/60"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-400 text-slate-950 p-1.5 rounded-full shadow-md" title="Accredited Agent">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">{user.name}</h2>
            <div className="text-xs text-emerald-400 font-semibold mt-0.5">
              Accredited Swashub Agent
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              ID: {user.id.toUpperCase()}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-left text-xs space-y-2.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60 text-[11px]">{user.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Accredited Since:</span>
              <span className="text-slate-200 font-mono">
                {new Date(user.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Escrow Security:</span>
              <span className="text-emerald-400 font-medium">100% Insured</span>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Edit & Performance Score */}
        <div className="md:col-span-2 space-y-6">
          {/* Performance Summary */}
          <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
              Performance & Quality Metrics
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                <div className="text-xl font-extrabold font-mono text-emerald-400">99.2%</div>
                <div className="text-[11px] text-slate-400 mt-1">QA Approval Rate</div>
              </div>
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                <div className="text-xl font-extrabold font-mono text-white">100%</div>
                <div className="text-[11px] text-slate-400 mt-1">On-Time Milestones</div>
              </div>
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                <div className="text-xl font-extrabold font-mono text-sky-400">Level 2</div>
                <div className="text-[11px] text-slate-400 mt-1">Senior Accredited</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-slate-900/80 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-5">
              Payout Details & Personal Info
            </h3>

            {saveSuccess && (
              <div className="mb-5 p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Profile details successfully updated!</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email (Primary Account)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full text-xs px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Safaricom M-Pesa Number for Withdrawals
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={mpesaNumber}
                    onChange={(e) => setMpesaNumber(e.target.value)}
                    placeholder="+254 712 345678"
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  All approved earnings requests will be dispatched automatically to this phone.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Professional Bio & Specialties</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your domain skills, years of experience, and tool competencies..."
                  className="w-full text-xs p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/15 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Profile Changes</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
