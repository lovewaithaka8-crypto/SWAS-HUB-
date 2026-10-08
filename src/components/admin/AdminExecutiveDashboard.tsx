import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.ts';
import { Job, Transaction, Dispute, SupportTicket, FraudAlert } from '../../types/index.ts';
import {
  TrendingUp,
  Users,
  Briefcase,
  Wallet,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Plus,
  Send,
  Smartphone,
  Eye,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface Props {
  onNavigateTab: (tab: string) => void;
  onOpenCreateJob: () => void;
  onOpenCreateWorker: () => void;
}

export const AdminExecutiveDashboard: React.FC<Props> = ({
  onNavigateTab,
  onOpenCreateJob,
  onOpenCreateWorker,
}) => {
  const [metrics, setMetrics] = useState({
    totalWorkers: 0,
    totalClients: 0,
    activeJobs: 0,
    completedJobs: 0,
    pendingApprovals: 0,
    pendingWithdrawals: 0,
    platformRevenue: 0,
    workerEarnings: 0,
    openDisputes: 0,
    openTickets: 0,
    fraudAlerts: 0,
  });

  const [pendingReviewJobs, setPendingReviewJobs] = useState<Job[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Transaction[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [agentsRes, clientsRes, jobsRes, txsRes, dispRes, ticketsRes, fraudRes] =
          await Promise.all([
            apiRequest('/api/agents'),
            apiRequest('/api/clients').catch(() => ({ clients: [] })),
            apiRequest('/api/jobs'),
            apiRequest('/api/transactions'),
            apiRequest('/api/disputes').catch(() => ({ disputes: [] })),
            apiRequest('/api/support-tickets').catch(() => ({ tickets: [] })),
            apiRequest('/api/fraud-alerts').catch(() => ({ alerts: [] })),
          ]);

        const workers = (agentsRes.agents || []).filter((a: any) => a.role === 'AGENT');
        const clients = clientsRes.clients || [];
        const allJobs: Job[] = jobsRes.jobs || [];
        const allTxs: Transaction[] = txsRes.transactions || [];
        const allDisputes: Dispute[] = dispRes.disputes || [];
        const allTickets: SupportTicket[] = ticketsRes.tickets || [];
        const allFraud: FraudAlert[] = fraudRes.alerts || [];

        const pReviews = allJobs.filter((j) => j.status === 'SUBMITTED');
        const pWithdrawals = allTxs.filter((t) => t.type === 'WITHDRAWAL' && t.status === 'PENDING');
        const regTxs = allTxs.filter((t) => t.type === 'REGISTRATION_FEE' && t.status === 'SUCCESSFUL');
        const earnTxs = allTxs.filter((t) => t.type === 'EARNING' && t.status === 'SUCCESSFUL');

        const revenue = regTxs.reduce((acc, t) => acc + t.amount, 0);
        const earnings = earnTxs.reduce((acc, t) => acc + t.amount, 0);

        setMetrics({
          totalWorkers: workers.length,
          totalClients: clients.length,
          activeJobs: allJobs.filter((j) => j.status === 'IN_PROGRESS' || j.status === 'ASSIGNED').length,
          completedJobs: allJobs.filter((j) => j.status === 'APPROVED' || j.status === 'PAID').length,
          pendingApprovals: pReviews.length,
          pendingWithdrawals: pWithdrawals.length,
          platformRevenue: revenue,
          workerEarnings: earnings,
          openDisputes: allDisputes.filter((d) => d.status === 'OPEN' || d.status === 'INVESTIGATING').length,
          openTickets: allTickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length,
          fraudAlerts: allFraud.filter((f) => f.status === 'ACTIVE').length,
        });

        setPendingReviewJobs(pReviews);
        setPendingWithdrawals(pWithdrawals);
        setDisputes(allDisputes);
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Bar with Title and Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Executive Command Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time live operations telemetry across workers, client escrow, task execution, and payouts.
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenCreateJob}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
          <button
            onClick={onOpenCreateWorker}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Add Worker</span>
          </button>
          <button
            onClick={() => onNavigateTab('finance')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Process Payouts</span>
          </button>
          <button
            onClick={() => onNavigateTab('disputes')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Disputes ({metrics.openDisputes})</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Workers */}
        <div
          onClick={() => onNavigateTab('workers')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Accredited Agents</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">{metrics.totalWorkers}</div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1">Verified Pool</div>
        </div>

        {/* Active Jobs */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Active Projects</span>
            <Briefcase className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-sky-400">{metrics.activeJobs}</div>
          <div className="text-[10px] text-slate-400 mt-1">{metrics.completedJobs} completed</div>
        </div>

        {/* Pending Reviews */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Pending QA Reviews</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-purple-400">{metrics.pendingApprovals}</div>
          <div className="text-[10px] text-purple-300 mt-1">Awaiting approval</div>
        </div>

        {/* Pending Withdrawals */}
        <div
          onClick={() => onNavigateTab('finance')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>M-Pesa Queue</span>
            <Smartphone className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-400">{metrics.pendingWithdrawals}</div>
          <div className="text-[10px] text-amber-300 mt-1">Awaiting disbursement</div>
        </div>

        {/* Platform Revenue */}
        <div
          onClick={() => onNavigateTab('finance')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Accreditation Revenue</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">
            {metrics.platformRevenue.toLocaleString()} <span className="text-xs">KES</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">5,000 KES fee ledger</div>
        </div>

        {/* Worker Earnings */}
        <div
          onClick={() => onNavigateTab('finance')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Worker Disbursed</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-teal-300">
            {metrics.workerEarnings.toLocaleString()} <span className="text-xs">KES</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Approved project pay</div>
        </div>
      </div>

      {/* Real-time Alerts Banner if any */}
      {(metrics.pendingWithdrawals > 0 || metrics.pendingApprovals > 0 || metrics.openDisputes > 0 || metrics.fraudAlerts > 0) && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold text-white">Live Platform Action Items:</span>
            <span>
              {metrics.pendingApprovals} deliverables to review · {metrics.pendingWithdrawals} payouts in queue · {metrics.openDisputes} active dispute(s)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {metrics.pendingApprovals > 0 && (
              <button
                onClick={() => onNavigateTab('tasks')}
                className="px-2.5 py-1 bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 rounded-lg font-semibold"
              >
                Review Deliverables
              </button>
            )}
            {metrics.pendingWithdrawals > 0 && (
              <button
                onClick={() => onNavigateTab('finance')}
                className="px-2.5 py-1 bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-500/40 rounded-lg font-semibold"
              >
                Disburse M-Pesa
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Dual Panels: Deliverables Pending Review & M-Pesa Payout Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deliverables Pending Review */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white">
                Deliverables Awaiting Review ({pendingReviewJobs.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Manage all tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingReviewJobs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No task deliverables currently in review.
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingReviewJobs.slice(0, 4).map((job) => (
                <div
                  key={job.id}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate">
                    <div className="font-semibold text-white truncate">{job.title}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5 font-mono">
                      {job.categoryName} ·{' '}
                      <span className="font-bold text-emerald-400">
                        {job.paymentAmount.toLocaleString()} KES
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('tasks')}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold text-xs transition-colors shrink-0 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review Work</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* M-Pesa Payout Queue */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">
                M-Pesa Payout Queue ({pendingWithdrawals.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('finance')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Financial command</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingWithdrawals.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              All worker withdrawal requests are settled.
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingWithdrawals.slice(0, 4).map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">{tx.userName}</div>
                    <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                      {tx.notes} ·{' '}
                      <span className="font-bold text-emerald-400">{tx.amount.toLocaleString()} KES</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('finance')}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs transition-colors shrink-0"
                  >
                    Disburse M-Pesa
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
