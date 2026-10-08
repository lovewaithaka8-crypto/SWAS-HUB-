import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.ts';
import { AuditTrailEntry } from '../../types/index.ts';
import {
  Shield,
  Activity,
  Search,
  Filter,
  User,
  Briefcase,
  Building,
  Clock,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Sparkles,
  RefreshCw,
  X,
  Layers,
  ChevronRight,
  Smartphone
} from 'lucide-react';

const INITIAL_AUDIT_TRAIL: AuditTrailEntry[] = [
  {
    id: 'adt-10522',
    agentId: 'usr-agent-brian',
    agentName: 'Brian Otieno',
    agentRole: 'Finance Agent (AG-0051)',
    action: 'Edited payment amount',
    itemType: 'JOB',
    itemId: '#10522',
    itemName: 'Fintech API Integration & Settlement Testing',
    fieldChanged: 'Payment Amount',
    previousValue: 'KES 12,000',
    newValue: 'KES 14,500',
    reason: 'Approved scope expansion for automated webhook testing',
    date: '07 Oct 2026',
    time: '20:52:10',
    department: 'Finance & Escrow',
    ipAddress: '102.215.78.14',
    deviceInfo: 'Chrome on MacOS (Nairobi Office)',
  },
  {
    id: 'adt-10485',
    agentId: 'usr-agent-esther',
    agentName: 'Esther Njoki',
    agentRole: 'Senior Operations Agent (AG-0042)',
    action: 'Changed job status',
    itemType: 'JOB',
    itemId: '#10485',
    itemName: 'Customer Support Escalation Triage Tier-2',
    fieldChanged: 'Job Status',
    previousValue: 'Pending',
    newValue: 'Active',
    reason: 'Client workplace SLA confirmation received',
    date: '07 Oct 2026',
    time: '20:45:21',
    department: 'Customer Support',
    ipAddress: '197.232.88.90',
    deviceInfo: 'Firefox on Windows 11 (Westlands Hub)',
  },
  {
    id: 'adt-10102',
    agentId: 'usr-agent-john',
    agentName: 'John Mwangi',
    agentRole: 'Operations Agent (AG-0018)',
    action: 'Updated client profile',
    itemType: 'CLIENT',
    itemId: 'Client #C102',
    itemName: 'Jane Wanjiku (Customer Support Workplace)',
    fieldChanged: 'Contract Status',
    previousValue: 'Pending Review',
    newValue: 'Active / Renewed',
    reason: 'Q4 monthly contract terms verified and stamped',
    date: '07 Oct 2026',
    time: '20:30:14',
    department: 'Customer Support',
    ipAddress: '105.163.45.12',
    deviceInfo: 'Safari on macOS (Upperhill Station)',
  },
  {
    id: 'adt-10484',
    agentId: 'usr-agent-mary',
    agentName: 'Mary Wanjiku',
    agentRole: 'QA & Review Agent (AG-0033)',
    action: 'Approved client submission',
    itemType: 'TASK',
    itemId: '#10484',
    itemName: 'Safaricom B2B Deliverable QA Audit',
    fieldChanged: 'Submission QA',
    previousValue: 'Submitted',
    newValue: 'Approved',
    reason: 'All 2,400 SKU records sanitized without formatting discrepancies',
    date: '07 Oct 2026',
    time: '20:22:05',
    department: 'Content & QA',
    ipAddress: '102.135.91.4',
    deviceInfo: 'Chrome on Linux (Kilimani)',
  },
  {
    id: 'adt-10483',
    agentId: 'usr-agent-brian',
    agentName: 'Brian Otieno',
    agentRole: 'Operations Agent (AG-0051)',
    action: 'Edited task deadline',
    itemType: 'TASK',
    itemId: '#10483',
    itemName: 'E-Commerce Product Catalog Normalization',
    fieldChanged: 'Deadline Date',
    previousValue: '08 Oct 2026',
    newValue: '12 Oct 2026',
    reason: 'Vendor provided 400 additional catalog images to process',
    date: '07 Oct 2026',
    time: '20:15:40',
    department: 'Data Operations',
    ipAddress: '102.215.78.14',
    deviceInfo: 'Chrome on MacOS (Nairobi Office)',
  },
  {
    id: 'adt-10482',
    agentId: 'usr-agent-esther',
    agentName: 'Esther Njoki',
    agentRole: 'Senior Operations Agent (AG-0042)',
    action: 'Assigned task to worker',
    itemType: 'JOB',
    itemId: '#10482',
    itemName: 'Twiga Foods Supply Chain Inventory Verification',
    fieldChanged: 'Worker Assignment',
    previousValue: 'Unassigned (Queue)',
    newValue: 'Worker #W204 (David Kamau)',
    reason: 'Matched top Tier-1 inventory accreditation skill badge',
    date: '07 Oct 2026',
    time: '20:10:02',
    department: 'Customer Support',
    ipAddress: '197.232.88.90',
    deviceInfo: 'Firefox on Windows 11 (Westlands Hub)',
  },
  {
    id: 'adt-10901',
    agentId: 'usr-agent-david',
    agentName: 'David Kamau',
    agentRole: 'Risk & Compliance Agent (AG-0027)',
    action: 'Rejected withdrawal request',
    itemType: 'WITHDRAWAL',
    itemId: '#W-901',
    itemName: 'Agent Withdrawal to M-Pesa +254 700 112233',
    fieldChanged: 'Withdrawal Status',
    previousValue: 'Pending',
    newValue: 'Rejected & Refunded',
    reason: 'Phone number mismatch with registered national ID credentials',
    date: '07 Oct 2026',
    time: '19:48:33',
    department: 'Finance & Risk',
    ipAddress: '41.203.220.8',
    deviceInfo: 'Edge on Windows 11 (Mombasa Hub)',
  },
];

export const AdminAuditTrail: React.FC = () => {
  const [entries, setEntries] = useState<AuditTrailEntry[]>(INITIAL_AUDIT_TRAIL);
  const [selectedEntry, setSelectedEntry] = useState<AuditTrailEntry | null>(null);

  // Filters
  const [selectedAgent, setSelectedAgent] = useState('ALL');
  const [selectedItemType, setSelectedItemType] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = entries.filter((e) => {
    if (selectedAgent !== 'ALL' && e.agentName !== selectedAgent) return false;
    if (selectedItemType !== 'ALL' && e.itemType !== selectedItemType) return false;
    if (selectedDept !== 'ALL' && e.department !== selectedDept) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        e.agentName.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.itemId.toLowerCase().includes(q) ||
        e.itemName.toLowerCase().includes(q) ||
        (e.fieldChanged && e.fieldChanged.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const uniqueAgents = Array.from(new Set(entries.map((e) => e.agentName)));
  const uniqueDepts = Array.from(new Set(entries.map((e) => e.department)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>AGENT ACCOUNTABILITY & GOVERNANCE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
            Complete Operations Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Every agent and staff action is permanently recorded with exact timestamps, before/after diffs, and session telemetry.
          </p>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-2xl text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-slate-300 font-semibold">Live Audit Recording Active</span>
        </div>
      </div>

      {/* Admin Real-Time Agent Activity Ticker / Notifications */}
      <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Bell className="w-4 h-4 text-emerald-400" />
            <span>Recent Agent Activity Stream (Admin Monitored)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Auto-synced</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div
            onClick={() => setSelectedEntry(entries[5])}
            className="p-3 bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-2xl cursor-pointer transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <strong className="text-emerald-400">Esther Njoki</strong>
              <span className="text-[10px] font-mono text-slate-500">20:10 EAT</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Assigned Job <span className="font-mono text-sky-400">#10482</span> to Worker #W204.
            </p>
          </div>

          <div
            onClick={() => setSelectedEntry(entries[1])}
            className="p-3 bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-2xl cursor-pointer transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <strong className="text-sky-400">John Mwangi</strong>
              <span className="text-[10px] font-mono text-slate-500">20:30 EAT</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Changed Job <span className="font-mono text-sky-400">#10501</span> from <span className="text-amber-400">Pending</span> → <span className="text-emerald-400">In Progress</span>.
            </p>
          </div>

          <div
            onClick={() => setSelectedEntry(entries[0])}
            className="p-3 bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-2xl cursor-pointer transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <strong className="text-purple-400">Brian Otieno</strong>
              <span className="text-[10px] font-mono text-slate-500">20:52 EAT</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Edited payment amount on Job <span className="font-mono text-sky-400">#10522</span> to KES 14,500.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Search */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agent, item #, action..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden"
            />
          </div>

          {/* Filter by Agent */}
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-medium focus:outline-hidden"
          >
            <option value="ALL">All Agents</option>
            {uniqueAgents.map((ag) => (
              <option key={ag} value={ag}>
                Agent: {ag}
              </option>
            ))}
          </select>

          {/* Filter by Item Type */}
          <select
            value={selectedItemType}
            onChange={(e) => setSelectedItemType(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-medium focus:outline-hidden"
          >
            <option value="ALL">All Item Types</option>
            <option value="JOB">Jobs</option>
            <option value="CLIENT">Clients</option>
            <option value="TASK">Tasks</option>
            <option value="WITHDRAWAL">Withdrawals</option>
          </select>

          {/* Filter by Department */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-medium focus:outline-hidden"
          >
            <option value="ALL">All Departments</option>
            {uniqueDepts.map((d) => (
              <option key={d} value={d}>
                Dept: {d}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <strong>{filteredEntries.length}</strong> audited events
        </div>
      </div>

      {/* Dedicated Audit Trail Table */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono text-[10px] uppercase">
              <tr>
                <th className="px-5 py-3.5">Time & Date</th>
                <th className="px-5 py-3.5">Agent & Role</th>
                <th className="px-5 py-3.5">Action Executed</th>
                <th className="px-5 py-3.5">Item Affected</th>
                <th className="px-5 py-3.5">Change (Before → After)</th>
                <th className="px-5 py-3.5 text-right">Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredEntries.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-mono font-bold text-white text-xs">{row.time}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{row.date}</div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-bold text-white text-sm">{row.agentName}</div>
                    <div className="text-[11px] text-slate-400">{row.agentRole}</div>
                    <span className="text-[10px] text-sky-400 font-mono">{row.department}</span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-semibold text-white">{row.action}</span>
                    {row.reason && (
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{row.reason}</div>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-mono font-bold text-sky-400">{row.itemId}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">{row.itemName}</div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {row.previousValue || 'None'}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {row.newValue}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setSelectedEntry(row)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Inspect Diff</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== BEFORE & AFTER INSPECTION MODAL ==================== */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-100 space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>AUDIT TRAIL INSPECTOR</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selectedEntry.itemId}: {selectedEntry.itemName}
                </h3>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Structured Before & After Card matching user spec */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs space-y-3.5">
              <div className="text-slate-400">
                <strong className="text-white">Changed by:</strong>
                <div className="text-emerald-400 font-bold text-sm mt-0.5">{selectedEntry.agentName}</div>
                <div className="text-[11px] text-slate-500">{selectedEntry.agentRole}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Before:</span>
                  <div className="text-rose-400 font-bold text-sm">
                    {selectedEntry.fieldChanged} = {selectedEntry.previousValue || 'None'}
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-500/30 space-y-1">
                  <span className="text-emerald-400 uppercase text-[10px] font-bold">After:</span>
                  <div className="text-emerald-400 font-bold text-sm">
                    {selectedEntry.fieldChanged} = {selectedEntry.newValue}
                  </div>
                </div>
              </div>

              {selectedEntry.reason && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 font-bold">Reason provided:</span>
                  <p className="text-slate-200 mt-1 font-sans text-xs">{selectedEntry.reason}</p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div>
                  <span className="text-slate-500">Timestamp: </span>
                  <span className="text-white">{selectedEntry.date} {selectedEntry.time}</span>
                </div>
                <div>
                  <span className="text-slate-500">Department: </span>
                  <span className="text-white">{selectedEntry.department}</span>
                </div>
                <div>
                  <span className="text-slate-500">IP Address: </span>
                  <span className="text-white">{selectedEntry.ipAddress || '197.232.88.90'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Session Device: </span>
                  <span className="text-white">{selectedEntry.deviceInfo || 'Chrome on MacOS'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
