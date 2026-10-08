import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.ts';
import { Category, FraudAlert, ActivityLog } from '../../types/index.ts';
import {
  Shield,
  ShieldAlert,
  Server,
  Download,
  RotateCcw,
  Key,
  FolderKanban,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  Layers,
  Lock,
  Loader2
} from 'lucide-react';

export const AdminOperationsSecurity: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SECURITY' | 'DEPARTMENTS' | 'HEALTH' | 'BACKUP'>('SECURITY');
  const [categories, setCategories] = useState<Category[]>([]);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [testModeEnabled, setTestModeEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [catsRes, alertsRes, logsRes, healthRes] = await Promise.all([
        apiRequest<{ categories: Category[] }>('/api/categories'),
        apiRequest<{ alerts: FraudAlert[] }>('/api/fraud-alerts').catch(() => ({ alerts: [] })),
        apiRequest<{ logs: ActivityLog[] }>('/api/activity-logs'),
        apiRequest('/api/system/health').catch(() => ({ health: null })),
      ]);
      setCategories(catsRes.categories || []);
      setAlerts(alertsRes.alerts || []);
      setLogs(logsRes.logs || []);
      setSystemHealth(healthRes.health);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDismissAlert = async (id: string) => {
    try {
      await apiRequest(`/api/fraud-alerts/${id}/dismiss`, { method: 'POST' });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Dismiss failed');
    }
  };

  const handleExportBackup = async () => {
    try {
      const res = await apiRequest('/api/system/export');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `swashub-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Export failed');
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm('Warning: This will reset the database back to clean demo seed data. Proceed?')) return;
    try {
      await apiRequest('/api/seed/reset', { method: 'POST' });
      alert('Database successfully reset to pristine demo state!');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Reset failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Operations, Security & System Health</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor fraud alerts, manage staff RBAC roles, audit system health, and control data backups.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'SECURITY'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Fraud & Roles</span>
          </button>
          <button
            onClick={() => setActiveTab('DEPARTMENTS')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'DEPARTMENTS'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5 text-sky-400" />
            <span>Departments</span>
          </button>
          <button
            onClick={() => setActiveTab('HEALTH')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'HEALTH'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>System Health</span>
          </button>
          <button
            onClick={() => setActiveTab('BACKUP')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'BACKUP'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Backup & Audit</span>
          </button>
        </div>
      </div>

      {/* 1. FRAUD & ROLES */}
      {activeTab === 'SECURITY' && (
        <div className="space-y-6">
          {/* Fraud Alerts Card */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-sm text-white">Fraud & Risk Monitoring Center</h3>
              </div>
              <span className="text-xs font-mono text-rose-400 font-bold">{alerts.length} Flagged Events</span>
            </div>

            {alerts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No active fraud alerts detected.</div>
            ) : (
              <div className="space-y-3">
                {alerts.map((al) => (
                  <div
                    key={al.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-rose-500/30 flex items-start justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{al.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 font-bold">
                          {al.severity}
                        </span>
                      </div>
                      <p className="text-slate-300 mt-1">{al.description}</p>
                      <div className="text-[11px] text-slate-500 font-mono mt-1">Target Account: {al.targetName}</div>
                    </div>
                    {al.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleDismissAlert(al.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs transition-colors shrink-0"
                      >
                        Dismiss Alert
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Internal Staff Roles */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-sm text-white pb-3 border-b border-slate-800">
              Internal Administrative Staff Permissions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-bold text-white">Super Admin</div>
                <div className="text-slate-400">Full system master access across all data and financial escrow.</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-bold text-emerald-400">Operations Admin</div>
                <div className="text-slate-400">Task creation, deliverable QA reviews, and agent accreditation.</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-bold text-sky-400">Finance Admin</div>
                <div className="text-slate-400">M-Pesa payout authorizations, refunds, and Flutterwave ledger audits.</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-bold text-purple-400">Support Admin</div>
                <div className="text-slate-400">Customer ticket resolutions, client inquiries, and dispute investigations.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DEPARTMENTS */}
      {activeTab === 'DEPARTMENTS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base">{c.name}</h3>
              <p className="text-xs text-slate-400">{c.description}</p>
              <div className="pt-2 flex justify-between text-xs font-mono text-slate-500 border-t border-slate-800">
                <span>{c.agentCount || 0} Accredited Agents</span>
                <span>{c.jobCount || 0} Projects</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. SYSTEM HEALTH */}
      {activeTab === 'HEALTH' && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white">System Infrastructure & Integration Health</h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">STATUS: OPERATIONAL</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">Database Engine:</span>
              <span className="font-bold text-white">JSON File Persistence</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">Payment Gateway:</span>
              <span className="font-bold text-emerald-400">Flutterwave Online</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">M-Pesa Disbursal:</span>
              <span className="font-bold text-emerald-400">Paybill 880100 Active</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">Uptime:</span>
              <span className="font-bold text-white">{systemHealth?.uptimeSeconds || 360} seconds</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. BACKUP & AUDIT */}
      {activeTab === 'BACKUP' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-white">Download Database Backup JSON</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Full snapshot of users, project contracts, escrow payments, and activity ledger.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportBackup}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON Backup</span>
              </button>
              <button
                onClick={handleResetDatabase}
                className="px-4 py-2 border border-rose-500/40 text-rose-400 hover:bg-rose-950 font-semibold text-xs rounded-xl transition-colors"
              >
                Reset to Demo
              </button>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-sm text-white pb-3 border-b border-slate-800">
              Chronological Security & Operations Audit Trail
            </h3>
            <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{log.action}</div>
                    <div className="text-slate-400 mt-0.5">{log.details}</div>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono shrink-0 ml-4">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
