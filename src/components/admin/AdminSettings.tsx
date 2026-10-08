import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.ts';
import { PlatformSettings, ActivityLog } from '../../types/index.ts';
import {
  Settings,
  Bell,
  Activity,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign,
  Shield,
  Key,
  Sparkles
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings form
  const [regFee, setRegFee] = useState('5000');
  const [currency, setCurrency] = useState('KES');
  const [platformName, setPlatformName] = useState('Swashub');
  const [supportEmail, setSupportEmail] = useState('support@swashub.com');
  const [supportPhone, setSupportPhone] = useState('+254 700 800900');
  const [autoAssign, setAutoAssign] = useState(true);
  const [flwPublicKey, setFlwPublicKey] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Announcement form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  const fetchSettingsAndLogs = async () => {
    try {
      const [settingsRes, logsRes] = await Promise.all([
        apiRequest<{ settings: PlatformSettings }>('/api/settings'),
        apiRequest<{ logs: ActivityLog[] }>('/api/activity-logs'),
      ]);
      const s = settingsRes.settings;
      setSettings(s);
      setRegFee(String(s.registrationFee));
      setCurrency(s.currency);
      setPlatformName(s.platformName);
      setSupportEmail(s.supportEmail);
      setSupportPhone(s.supportPhone);
      setAutoAssign(s.autoAssignNewAgents);
      setFlwPublicKey(s.flutterwavePublicKey);
      setLogs(logsRes.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndLogs();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSaved(false);
    try {
      await apiRequest('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({
          registrationFee: Number(regFee),
          currency,
          platformName,
          supportEmail,
          supportPhone,
          autoAssignNewAgents: autoAssign,
          flutterwavePublicKey: flwPublicKey,
        }),
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
      fetchSettingsAndLogs();
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    setIsSendingAnnouncement(true);
    setAnnouncementSuccess(false);
    try {
      await apiRequest('/api/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify({
          title: broadcastTitle,
          message: broadcastMessage,
        }),
      });
      setAnnouncementSuccess(true);
      setBroadcastTitle('');
      setBroadcastMessage('');
      setTimeout(() => setAnnouncementSuccess(false), 3000);
      fetchSettingsAndLogs();
    } catch (err: any) {
      alert(err.message || 'Failed to broadcast announcement');
    } finally {
      setIsSendingAnnouncement(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Platform Configuration & Audits</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Adjust accreditation fees, manage Flutterwave keys, broadcast urgent notifications, and review system audit logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Platform & Fee Settings */}
        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 p-6 sm:p-8 space-y-5 shadow-2xl">
          <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Platform Parameters</h2>
          </div>

          {settingsSaved && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Platform settings updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Agent Accreditation Fee ({currency})
                </label>
                <input
                  type="number"
                  required
                  value={regFee}
                  onChange={(e) => setRegFee(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1">Default: 5,000 KES</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Currency Code</label>
                <input
                  type="text"
                  required
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Platform Brand Name</label>
                <input
                  type="text"
                  required
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Operations Phone</label>
                <input
                  type="text"
                  required
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Support Email</label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Flutterwave Public Key
              </label>
              <input
                type="text"
                value={flwPublicKey}
                onChange={(e) => setFlwPublicKey(e.target.value)}
                className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="autoAssignCheck"
                checked={autoAssign}
                onChange={(e) => setAutoAssign(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
              <label htmlFor="autoAssignCheck" className="text-xs text-slate-300 cursor-pointer">
                Automatically assign welcome project to newly accredited agents
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSavingSettings ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Platform Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Broadcast Announcements */}
        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 p-6 sm:p-8 space-y-5 shadow-2xl">
          <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Broadcast Announcement to Agents</h2>
          </div>

          {announcementSuccess && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Announcement dispatched to all agent notification centers!</span>
            </div>
          )}

          <form onSubmit={handleBroadcastAnnouncement} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Announcement Title</label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. New High-Volume B2B Content Projects Available"
                className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Message Body</label>
              <textarea
                rows={5}
                required
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Write message to active agents across all workplaces..."
                className="w-full text-xs p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={isSendingAnnouncement}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSendingAnnouncement ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>Send Broadcast to All Active Agents</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Activity Logs Audit Trail */}
      <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Platform Security & Operations Audit Trail</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Latest 50 events</span>
        </div>

        <div className="divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">No activity logs recorded.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-800/30 transition-colors flex items-start justify-between text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-white">{log.action}</div>
                  <div className="text-slate-400">{log.details}</div>
                </div>
                <div className="text-right text-[11px] text-slate-400 font-mono shrink-0 ml-4">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
