import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiRequest } from '../../lib/api.ts';
import { Job, Transaction, Client, MonthlyPayrollRecord } from '../../types/index.ts';
import { AdminAgents } from './AdminAgents.tsx';
import { AdminCategories } from './AdminCategories.tsx';
import { AdminJobs } from './AdminJobs.tsx';
import { AdminPayments } from './AdminPayments.tsx';
import { AdminSettings } from './AdminSettings.tsx';
import { AdminMonthlyClients } from './AdminMonthlyClients.tsx';
import { AdminMonthlyPayroll } from './AdminMonthlyPayroll.tsx';
import { AdminAuditTrail } from './AdminAuditTrail.tsx';
import { ClientWorkplace } from '../client/ClientWorkplace.tsx';
import { ModernAdminCommandRail } from '../common/ModernAdminCommandRail.tsx';
import { ModernCommandDock } from '../common/ModernCommandDock.tsx';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderKanban,
  CreditCard,
  Settings,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ChevronRight,
  TrendingUp,
  Eye,
  Sparkles,
  Building,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  Activity,
  FileText
} from 'lucide-react';

export const AdminCommandCenter: React.FC = () => {
  const { user, currentView, setCurrentView } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'jobs' | 'clients' | 'agents' | 'categories' | 'payroll' | 'payments' | 'audit' | 'settings'
  >('overview');

  // Admin Client Workplace preview state
  const [previewClientId, setPreviewClientId] = useState<string | null>(null);

  const [metrics, setMetrics] = useState({
    totalClients: 0,
    activeClients: 0,
    totalAgents: 0,
    activeJobs: 0,
    jobsAwaitingApproval: 0,
    jobsInProgress: 0,
    completedJobs: 0,
    monthlyClientPayroll: 0,
    pendingClientPayments: 0,
    pendingWithdrawals: 0,
    totalRevenue: 0,
    disputesCount: 0,
    openTicketsCount: 0,
    fraudAlertsCount: 0,
  });

  const [pendingReviewJobs, setPendingReviewJobs] = useState<Job[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Transaction[]>([]);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync with currentView
  useEffect(() => {
    if (currentView === 'admin-agents') setActiveTab('agents');
    else if (currentView === 'admin-categories') setActiveTab('categories');
    else if (currentView === 'admin-jobs') setActiveTab('jobs');
    else if (currentView === 'admin-clients') setActiveTab('clients');
    else if (currentView === 'admin-payroll') setActiveTab('payroll');
    else if (currentView === 'admin-audit') setActiveTab('audit');
    else if (currentView === 'admin-payments') setActiveTab('payments');
    else if (currentView === 'admin-settings') setActiveTab('settings');
    else if (currentView === 'admin-overview') setActiveTab('overview');
  }, [currentView]);

  const fetchOverviewMetrics = async () => {
    try {
      const [agentsRes, jobsRes, txsRes, clientsRes, payrollRes, dispRes, tixRes, fraudRes] = await Promise.all([
        apiRequest<{ agents: any[] }>('/api/agents'),
        apiRequest<{ jobs: Job[] }>('/api/jobs'),
        apiRequest<{ transactions: Transaction[] }>('/api/transactions'),
        apiRequest<{ clients: Client[] }>('/api/clients').catch(() => ({ clients: [] })),
        apiRequest<{ payroll: MonthlyPayrollRecord[] }>('/api/payroll?month=October 2026').catch(() => ({ payroll: [] })),
        apiRequest<{ disputes: any[] }>('/api/disputes').catch(() => ({ disputes: [] })),
        apiRequest<{ tickets: any[] }>('/api/support-tickets').catch(() => ({ tickets: [] })),
        apiRequest<{ alerts: any[] }>('/api/fraud-alerts').catch(() => ({ alerts: [] })),
      ]);

      const allAgents = agentsRes.agents || [];
      const allJobs = jobsRes.jobs || [];
      const allTxs = txsRes.transactions || [];
      const allClients = clientsRes.clients || [];
      const allPayroll = payrollRes.payroll || [];

      const pReviews = allJobs.filter((j) => j.status === 'SUBMITTED');
      const inProgressJobs = allJobs.filter((j) => j.status === 'IN_PROGRESS' || j.status === 'ASSIGNED');
      const doneJobs = allJobs.filter((j) => j.status === 'COMPLETED');
      const pWithdrawals = allTxs.filter((t) => t.type === 'WITHDRAWAL' && t.status === 'PENDING');
      const regTxs = allTxs.filter((t) => t.type === 'REGISTRATION_FEE' && t.status === 'SUCCESSFUL');
      const totalRevenue = regTxs.reduce((sum, t) => sum + t.amount, 0);

      const totalPayrollSum = allPayroll.reduce((sum, p) => sum + (p.netPayment || 0), 0);
      const pendingPayrollCount = allPayroll.filter((p) => p.status === 'DRAFT' || p.status === 'REVIEWED').length;

      setMetrics({
        totalClients: allClients.length,
        activeClients: allClients.filter((c) => c.status === 'ACTIVE').length,
        totalAgents: allAgents.filter((a) => a.role === 'AGENT').length,
        activeJobs: inProgressJobs.length,
        jobsAwaitingApproval: pReviews.length,
        jobsInProgress: inProgressJobs.length,
        completedJobs: doneJobs.length,
        monthlyClientPayroll: totalPayrollSum,
        pendingClientPayments: pendingPayrollCount,
        pendingWithdrawals: pWithdrawals.length,
        totalRevenue,
        disputesCount: (dispRes.disputes || []).filter((d) => d.status === 'OPEN').length,
        openTicketsCount: (tixRes.tickets || []).filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
        fraudAlertsCount: (fraudRes.alerts || []).filter((a) => a.status === 'TRIGGERED').length,
      });

      setPendingReviewJobs(pReviews);
      setPendingWithdrawals(pWithdrawals);
      setRecentClients(allClients.slice(0, 4));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewMetrics();
  }, [activeTab]);

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="p-12 text-center text-xs text-rose-400 bg-rose-950/30 rounded-3xl max-w-md mx-auto my-12 border border-rose-800/50 backdrop-blur-xl">
        <AlertCircle className="w-8 h-8 mx-auto mb-3 text-rose-400" />
        <h3 className="font-bold text-sm text-white">Access Denied</h3>
        <p className="mt-1 text-slate-400">
          This Command Center is strictly reserved for Swashub platform administrators.
        </p>
      </div>
    );
  }

  // If Admin is inspecting a client workplace in preview mode
  if (previewClientId) {
    return (
      <ClientWorkplace
        previewClientId={previewClientId}
        onExitPreview={() => setPreviewClientId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Background radial lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[400px] bg-emerald-500/6 blur-[160px] rounded-full"></div>
        <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[350px] bg-sky-500/5 blur-[150px] rounded-full"></div>
      </div>

      {/* Modern Compact Glass Command Rail */}
      <ModernAdminCommandRail
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab as any);
          if (tab === 'overview') setCurrentView('admin-overview');
          else if (tab === 'jobs') setCurrentView('admin-jobs');
          else if (tab === 'clients') setCurrentView('admin-clients');
          else if (tab === 'payroll') setCurrentView('admin-payroll');
          else if (tab === 'audit') setCurrentView('admin-audit');
          else if (tab === 'agents') setCurrentView('admin-agents');
          else if (tab === 'categories') setCurrentView('admin-categories');
          else if (tab === 'payments') setCurrentView('admin-payments');
          else if (tab === 'settings') setCurrentView('admin-settings');
        }}
        pendingReviewsCount={metrics.jobsAwaitingApproval}
        pendingPayoutsCount={metrics.pendingWithdrawals}
      />

      {/* Main Administrative Viewport */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto z-10 pb-24 md:pb-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>EXECUTIVE OPERATIONS COMMAND</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
                Operations Command Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Supervising monthly client retainers, active agent queues, Safaricom M-Pesa payroll, and audit accountability.
              </p>
            </div>

            {/* Comprehensive Dashboard KPI Grid matching user specification */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div
                onClick={() => setActiveTab('clients')}
                className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/80 hover:border-sky-500/40 cursor-pointer transition-all space-y-1"
              >
                <div className="text-xs text-slate-400 flex justify-between items-center">
                  <span>Total Clients</span>
                  <Building className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-extrabold font-mono text-white">{metrics.totalClients}</div>
                <div className="text-[11px] text-sky-400 font-semibold">{metrics.activeClients} active workplaces</div>
              </div>

              <div
                onClick={() => setActiveTab('agents')}
                className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition-all space-y-1"
              >
                <div className="text-xs text-slate-400 flex justify-between items-center">
                  <span>Accredited Agents</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-extrabold font-mono text-white">{metrics.totalAgents}</div>
                <div className="text-[11px] text-emerald-400 font-semibold">Active talent workforce</div>
              </div>

              <div
                onClick={() => setActiveTab('payroll')}
                className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition-all space-y-1"
              >
                <div className="text-xs text-slate-400 flex justify-between items-center">
                  <span>Client Payroll (Oct)</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-extrabold font-mono text-emerald-400">
                  KES {metrics.monthlyClientPayroll.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400">
                  {metrics.pendingClientPayments} pending approvals
                </div>
              </div>

              <div
                onClick={() => setActiveTab('jobs')}
                className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/80 hover:border-blue-500/40 cursor-pointer transition-all space-y-1"
              >
                <div className="text-xs text-slate-400 flex justify-between items-center">
                  <span>Active Jobs</span>
                  <Briefcase className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-extrabold font-mono text-blue-400">{metrics.activeJobs}</div>
                <div className="text-[11px] text-slate-500">{metrics.completedJobs} completed to date</div>
              </div>

              <div
                onClick={() => setActiveTab('jobs')}
                className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/80 hover:border-purple-500/40 cursor-pointer transition-all space-y-1"
              >
                <div className="text-xs text-slate-400 flex justify-between items-center">
                  <span>Awaiting Approval</span>
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-extrabold font-mono text-purple-400">{metrics.jobsAwaitingApproval}</div>
                <div className="text-[11px] text-slate-500">QA review queue</div>
              </div>

              <div
                onClick={() => setActiveTab('payments')}
                className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/80 hover:border-amber-500/40 cursor-pointer transition-all space-y-1"
              >
                <div className="text-xs text-slate-400 flex justify-between items-center">
                  <span>Pending Withdrawals</span>
                  <Smartphone className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-extrabold font-mono text-amber-400">{metrics.pendingWithdrawals}</div>
                <div className="text-[11px] text-slate-500">Agent M-Pesa payouts</div>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/80 space-y-1">
                <div className="text-xs text-slate-400 flex justify-between items-center">
                  <span>Platform Revenue</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-extrabold font-mono text-emerald-400">
                  KES {metrics.totalRevenue.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500">Accreditation receipts</div>
              </div>

              <div
                onClick={() => setActiveTab('audit')}
                className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/80 hover:border-rose-500/40 cursor-pointer transition-all space-y-1"
              >
                <div className="text-xs text-slate-400 flex justify-between items-center">
                  <span>System Alerts / Risk</span>
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-extrabold font-mono text-rose-400">{metrics.fraudAlertsCount}</div>
                <div className="text-[11px] text-slate-500">Disputes: {metrics.disputesCount} • Tickets: {metrics.openTicketsCount}</div>
              </div>
            </div>

            {/* Quick Access to Monthly Client Workplaces */}
            <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 p-6 sm:p-8 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <Building className="w-5 h-5 text-sky-400" />
                  <h2 className="text-base font-bold text-white">
                    Monthly Client Workplaces & Contracts ({metrics.totalClients})
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('clients')}
                  className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Manage all clients</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentClients.map((clt) => (
                  <div
                    key={clt.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm truncate">{clt.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400">
                          {clt.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{clt.department || 'Operations'}</div>
                      <div className="text-xs font-mono font-bold text-emerald-400 mt-2">
                        KES {(clt.monthlySalary || 35000).toLocaleString()}/month
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Supervisor: <strong className="text-slate-200">{clt.supervisorAgentName || 'Esther Njoki'}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => setPreviewClientId(clt.id)}
                      className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl font-bold text-xs border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Workplace</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Panels: Reviews & Withdrawals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Deliverables Pending Review */}
              <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 p-6 sm:p-8 space-y-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <h2 className="text-base font-bold text-white">
                      Deliverables Awaiting Review ({pendingReviewJobs.length})
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="text-xs text-emerald-400 font-semibold hover:underline"
                  >
                    View all projects
                  </button>
                </div>

                {pendingReviewJobs.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No deliverables pending review right now.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingReviewJobs.slice(0, 4).map((job) => (
                      <div
                        key={job.id}
                        className="p-4 rounded-2xl border border-purple-900/40 bg-purple-950/20 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="truncate">
                          <div className="font-bold text-white truncate text-sm">{job.title}</div>
                          <div className="text-slate-400 text-[11px] mt-0.5">
                            {job.categoryName} ·{' '}
                            <span className="font-mono text-emerald-400 font-bold">
                              {job.paymentAmount.toLocaleString()} KES
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('jobs')}
                          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review Work</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* M-Pesa Withdrawals Queue */}
              <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 p-6 sm:p-8 space-y-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-base font-bold text-white">
                      M-Pesa Payout Queue ({pendingWithdrawals.length})
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="text-xs text-emerald-400 font-semibold hover:underline"
                  >
                    View payments ledger
                  </button>
                </div>

                {pendingWithdrawals.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    All withdrawal requests are fully processed.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingWithdrawals.slice(0, 4).map((tx) => (
                      <div
                        key={tx.id}
                        className="p-4 rounded-2xl border border-amber-900/40 bg-amber-950/20 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-white text-sm">{tx.userName}</div>
                          <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                            {tx.notes} ·{' '}
                            <span className="font-bold text-emerald-400">{tx.amount.toLocaleString()} KES</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('payments')}
                          className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl font-bold text-xs transition-all shrink-0 shadow-md shadow-emerald-500/10"
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
        )}

        {activeTab === 'jobs' && <AdminJobs />}
        {activeTab === 'clients' && (
          <AdminMonthlyClients onPreviewClientWorkplace={(id) => setPreviewClientId(id)} />
        )}
        {activeTab === 'payroll' && <AdminMonthlyPayroll />}
        {activeTab === 'audit' && <AdminAuditTrail />}
        {activeTab === 'agents' && <AdminAgents />}
        {activeTab === 'categories' && <AdminCategories />}
        {activeTab === 'payments' && <AdminPayments />}
        {activeTab === 'settings' && <AdminSettings />}
      </main>

      {/* Floating Modern Command Dock */}
      <ModernCommandDock
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab as any);
          if (tab === 'overview') setCurrentView('admin-overview');
          else if (tab === 'jobs') setCurrentView('admin-jobs');
          else if (tab === 'clients') setCurrentView('admin-clients');
          else if (tab === 'payroll') setCurrentView('admin-payroll');
          else if (tab === 'audit') setCurrentView('admin-audit');
          else if (tab === 'agents') setCurrentView('admin-agents');
          else if (tab === 'categories') setCurrentView('admin-categories');
          else if (tab === 'payments') setCurrentView('admin-payments');
          else if (tab === 'settings') setCurrentView('admin-settings');
        }}
        role="ADMIN"
        badges={{
          jobs: metrics.jobsAwaitingApproval > 0 ? metrics.jobsAwaitingApproval : undefined,
          payments: metrics.pendingWithdrawals > 0 ? metrics.pendingWithdrawals : undefined,
        }}
      />
    </div>
  );
};

