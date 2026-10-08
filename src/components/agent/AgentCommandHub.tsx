import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiRequest } from '../../lib/api.ts';
import {
  Client,
  Job,
  SupportTicket,
  Notification,
  MonthlyPayrollRecord,
  ClientDocument,
  ClientWorkSession,
  Message,
  AuditTrailEntry
} from '../../types/index.ts';
import {
  Users,
  UserPlus,
  Building,
  Briefcase,
  CheckSquare,
  UploadCloud,
  Wallet,
  CreditCard,
  MessageSquare,
  Headphones,
  FolderOpen,
  Bell,
  BarChart3,
  Activity,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Search,
  Filter,
  Plus,
  Shield,
  ShieldAlert,
  Send,
  Eye,
  FileText,
  RotateCcw,
  Smartphone,
  Lock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileCheck,
  X,
  Loader2,
  FileUp,
  Info
} from 'lucide-react';
import { AgentTabType } from '../common/ModernAgentCommandRail.tsx';

interface Props {
  activeTab: AgentTabType;
  onNavigateTab: (tab: AgentTabType) => void;
  onPreviewClientWorkplace: (clientId: string) => void;
  onUpdateBadgeCount?: () => void;
}

export const AgentCommandHub: React.FC<Props> = ({
  activeTab,
  onNavigateTab,
  onPreviewClientWorkplace,
  onUpdateBadgeCount,
}) => {
  const { user } = useAuth();

  // Core Data
  const [clients, setClients] = useState<Client[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<MonthlyPayrollRecord[]>([]);
  const [sessions, setSessions] = useState<ClientWorkSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedClientDetail, setSelectedClientDetail] = useState<Client | null>(null);

  // Modals & Forms
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [activationTargetClient, setActivationTargetClient] = useState<Client | null>(null);

  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspendTargetClient, setSuspendTargetClient] = useState<Client | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPayout, setTaskPayout] = useState('4500');
  const [taskDeadline, setTaskDeadline] = useState('2026-10-31');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [taskAssignedClientId, setTaskAssignedClientId] = useState('');

  const [isReviewSubmissionModalOpen, setIsReviewSubmissionModalOpen] = useState(false);
  const [reviewJobTarget, setReviewJobTarget] = useState<Job | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'APPROVE' | 'REJECT' | 'CORRECTION_REQUIRED'>('APPROVE');
  const [reviewNotes, setReviewNotes] = useState('');

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageTargetClient, setMessageTargetClient] = useState<Client | null>(null);
  const [messageContent, setMessageContent] = useState('');

  const [isRequestDocModalOpen, setIsRequestDocModalOpen] = useState(false);
  const [docRequestTitle, setDocRequestTitle] = useState('');
  const [docRequestCategory, setDocRequestCategory] = useState<'ID_CARD' | 'TAX_PIN' | 'WORK_AGREEMENT' | 'CERTIFICATE'>('ID_CARD');

  // Support ticket reply state
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  const loadAllAgentData = async () => {
    try {
      setLoading(true);
      const [
        clientsRes,
        jobsRes,
        ticketsRes,
        notifsRes,
        payrollRes,
        sessionsRes,
        messagesRes,
        auditRes
      ] = await Promise.all([
        apiRequest<{ clients: Client[] }>('/api/clients'),
        apiRequest<{ jobs: Job[] }>('/api/jobs'),
        apiRequest<{ tickets: SupportTicket[] }>('/api/support-tickets'),
        apiRequest<{ notifications: Notification[] }>('/api/notifications'),
        apiRequest<{ payroll: MonthlyPayrollRecord[] }>('/api/payroll'),
        apiRequest<{ sessions: ClientWorkSession[] }>('/api/work-sessions'),
        apiRequest<{ messages: Message[] }>('/api/messages'),
        apiRequest<{ logs: any[] }>('/api/activity-logs').catch(() => ({ logs: [] })),
      ]);

      setClients(clientsRes.clients || []);
      setJobs(jobsRes.jobs || []);
      setTickets(ticketsRes.tickets || []);
      setNotifications(notifsRes.notifications || []);
      setPayrollRecords(payrollRes.payroll || []);
      setSessions(sessionsRes.sessions || []);
      setMessages(messagesRes.messages || []);
      setAuditLogs(auditRes.logs || []);
    } catch (err) {
      console.error('Error fetching agent hub data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAgentData();
  }, []);

  // Filter clients assigned to this agent (or supervisor role)
  const isSupervisorFor = (c: Client) =>
    c.supervisorAgentId === user?.id ||
    (c.supervisorAgentName && user?.name && c.supervisorAgentName.toLowerCase().includes(user.name.toLowerCase()));

  const myAssignedClients = clients.filter(isSupervisorFor);

  // Derived attention lists
  const activeClients = myAssignedClients.filter((c) => c.status === 'ACTIVE' && c.workplaceActivated);
  const newClients = myAssignedClients.filter((c) => c.status === 'NEW');
  const awaitingVerificationClients = myAssignedClients.filter(
    (c) => c.status === 'UNDER_REVIEW' || c.status === 'PENDING' || !c.workplaceActivated
  );
  const requiringAttentionClients = myAssignedClients.filter((c) => c.status === 'REQUIRES_ATTENTION');
  const suspendedClients = myAssignedClients.filter((c) => c.status === 'SUSPENDED');

  // Tasks & Submissions
  const myAssignedClientIds = new Set(myAssignedClients.map((c) => c.id));
  const clientJobs = jobs.filter(
    (j) =>
      (j.assignedClientId && myAssignedClientIds.has(j.assignedClientId)) ||
      (j.assignedAgentId === user?.id) ||
      (j.assignedAgentIds && j.assignedAgentIds.includes(user?.id || ''))
  );

  const tasksAwaitingReview = clientJobs.filter((j) => j.status === 'SUBMITTED' || j.status === 'UNDER_REVIEW');
  const overdueTasks = clientJobs.filter((j) => {
    if (j.status === 'COMPLETED' || j.status === 'APPROVED' || j.status === 'PAID') return false;
    return new Date(j.deadline).getTime() < Date.now();
  });
  const openTickets = tickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED');

  // Real Workplace Activation Action (Function 4)
  const handleConfirmWorkplaceActivation = async () => {
    if (!activationTargetClient) return;
    try {
      setActionLoading(true);
      await apiRequest(`/api/clients/${activationTargetClient.id}/activate`, {
        method: 'POST',
      });
      await loadAllAgentData();
      setIsActivationModalOpen(false);
      setActivationTargetClient(null);
      if (onUpdateBadgeCount) onUpdateBadgeCount();
    } catch (err: any) {
      alert(err.message || 'Activation failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Suspension & Reactivation Actions (Function 16)
  const handleConfirmSuspension = async () => {
    if (!suspendTargetClient) return;
    try {
      setActionLoading(true);
      await apiRequest(`/api/clients/${suspendTargetClient.id}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ reason: suspendReason || 'Operational supervisory hold' }),
      });
      await loadAllAgentData();
      setIsSuspendModalOpen(false);
      setSuspendTargetClient(null);
      setSuspendReason('');
    } catch (err: any) {
      alert(err.message || 'Failed to suspend workplace');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateWorkplace = async (clientId: string) => {
    try {
      setActionLoading(true);
      await apiRequest(`/api/clients/${clientId}/activate`, { method: 'POST' });
      await loadAllAgentData();
    } catch (err: any) {
      alert(err.message || 'Reactivation failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Create Work / Task (Function 6 & 7)
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskAssignedClientId) {
      alert('Please select a client and task title');
      return;
    }
    const targetClt = clients.find((c) => c.id === taskAssignedClientId);
    try {
      setActionLoading(true);
      await apiRequest('/api/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title: taskTitle.trim(),
          description: taskDesc.trim() || 'Assigned client operational task.',
          paymentAmount: Number(taskPayout) || 4500,
          deadline: taskDeadline,
          priority: taskPriority,
          categoryId: targetClt?.department ? 'cat-customer-support' : 'cat-customer-support',
          assignedClientId: targetClt?.id,
          assignedClient: targetClt?.name,
          assignedAgentId: user?.id,
          assignedAgentName: user?.name,
          milestones: [
            { title: 'Milestone 1: Preliminary Setup & Draft Output', status: 'PENDING' },
            { title: 'Milestone 2: Final Verification & Evidence Upload', status: 'PENDING' },
          ],
        }),
      });
      setIsCreateTaskModalOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      await loadAllAgentData();
    } catch (err: any) {
      alert(err.message || 'Failed to create work');
    } finally {
      setActionLoading(false);
    }
  };

  // Review Submission (Function 8)
  const handleReviewSubmission = async () => {
    if (!reviewJobTarget) return;
    try {
      setActionLoading(true);
      await apiRequest(`/api/jobs/${reviewJobTarget.id}/review`, {
        method: 'POST',
        body: JSON.stringify({
          decision: reviewDecision,
          reviewNotes: reviewNotes.trim() || (reviewDecision === 'APPROVE' ? 'Approved by Supervisor' : 'Revision needed'),
          agentId: user?.id,
        }),
      });
      setIsReviewSubmissionModalOpen(false);
      setReviewJobTarget(null);
      setReviewNotes('');
      await loadAllAgentData();
    } catch (err: any) {
      alert(err.message || 'Failed to review submission');
    } finally {
      setActionLoading(false);
    }
  };

  // Messaging (Function 10)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageTargetClient || !messageContent.trim()) return;
    try {
      setActionLoading(true);
      await apiRequest('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          receiverId: messageTargetClient.id,
          content: messageContent.trim(),
        }),
      });
      setMessageContent('');
      setIsMessageModalOpen(false);
      await loadAllAgentData();
      alert(`Message successfully delivered to ${messageTargetClient.name}!`);
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setActionLoading(false);
    }
  };

  // Support Reply (Function 9)
  const handleReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !ticketReplyText.trim()) return;
    try {
      setActionLoading(true);
      await apiRequest(`/api/support-tickets/${activeTicket.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message: ticketReplyText.trim() }),
      });
      setTicketReplyText('');
      await loadAllAgentData();
      const updated = tickets.find((t) => t.id === activeTicket.id);
      if (updated) setActiveTicket(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to reply ticket');
    } finally {
      setActionLoading(false);
    }
  };

  // Document verification toggle (Function 11)
  const handleVerifyDocument = async (clientId: string, docId: string, status: 'VERIFIED' | 'REJECTED') => {
    const clt = clients.find((c) => c.id === clientId);
    if (!clt || !clt.documents) return;
    const updatedDocs = clt.documents.map((d) =>
      d.id === docId
        ? {
            ...d,
            status,
            verifiedAt: new Date().toISOString(),
            verifiedBy: user?.name,
          }
        : d
    );
    try {
      setActionLoading(true);
      await apiRequest(`/api/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify({ documents: updatedDocs }),
      });
      await loadAllAgentData();
    } catch (err: any) {
      alert(err.message || 'Failed to update document verification');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper search filter
  const filterClientList = (list: Client[]) => {
    return list.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.department && c.department.toLowerCase().includes(q));
      if (!matchesSearch) return false;
      if (statusFilter === 'ALL') return true;
      return c.status === statusFilter;
    });
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          SECTION 1: DASHBOARD OVERVIEW (With functional clickable cards)
         ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Welcome Agent Banner */}
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Agent Command Operations
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 font-mono">
                  <Shield className="w-3.5 h-3.5" /> PRIMARY CLIENT OPERATOR
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                You manage the complete day-to-day journey of your assigned clients: onboarding verification, workplace activation, work delegation, deliverable QA, and client support.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/10 transition-transform hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>Assign Client Task</span>
              </button>
              <button
                onClick={() => onNavigateTab('applications')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors"
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Onboarding Queue ({newClients.length})</span>
              </button>
            </div>
          </div>

          {/* Interactive Live Metrics Grid (Every card is clickable) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Live Supervisory Intelligence (Click any card to open)
              </h3>
              <span className="text-[11px] text-slate-500">Auto-synced across platform</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {/* 1. My Assigned Clients */}
              <button
                onClick={() => onNavigateTab('my-clients')}
                className="bg-slate-900/80 hover:bg-slate-850 p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>My Assigned</span>
                  <Users className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-white mt-2">
                  {myAssignedClients.length}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-emerald-400">
                  <span>Open directory</span> <ChevronRight className="w-3 h-3" />
                </div>
              </button>

              {/* 2. Active Clients */}
              <button
                onClick={() => {
                  setStatusFilter('ACTIVE');
                  onNavigateTab('my-clients');
                }}
                className="bg-slate-900/80 hover:bg-slate-850 p-4 rounded-2xl border border-emerald-900/40 hover:border-emerald-500/50 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Active Clients</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-2">
                  {activeClients.length}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-emerald-400">
                  <span>Working shifts</span> <ChevronRight className="w-3 h-3" />
                </div>
              </button>

              {/* 3. New Clients */}
              <button
                onClick={() => onNavigateTab('applications')}
                className="bg-slate-900/80 hover:bg-slate-850 p-4 rounded-2xl border border-sky-900/40 hover:border-sky-500/50 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>New Clients</span>
                  <UserPlus className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-sky-400 mt-2">
                  {newClients.length}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-sky-400">
                  <span>Start onboarding</span> <ChevronRight className="w-3 h-3" />
                </div>
              </button>

              {/* 4. Clients Awaiting Verification */}
              <button
                onClick={() => onNavigateTab('applications')}
                className="bg-slate-900/80 hover:bg-slate-850 p-4 rounded-2xl border border-amber-900/40 hover:border-amber-500/50 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Awaiting Verification</span>
                  <Clock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-amber-400 mt-2">
                  {awaitingVerificationClients.length}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-amber-400">
                  <span>Review KYC docs</span> <ChevronRight className="w-3 h-3" />
                </div>
              </button>

              {/* 5. Clients Requiring Attention */}
              <button
                onClick={() => {
                  setStatusFilter('REQUIRES_ATTENTION');
                  onNavigateTab('my-clients');
                }}
                className="bg-slate-900/80 hover:bg-slate-850 p-4 rounded-2xl border border-rose-900/40 hover:border-rose-500/50 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Requires Attention</span>
                  <AlertCircle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-rose-400 mt-2">
                  {requiringAttentionClients.length}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-rose-400">
                  <span>Resolve issues</span> <ChevronRight className="w-3 h-3" />
                </div>
              </button>

              {/* 6. Active Workplaces */}
              <button
                onClick={() => onNavigateTab('workplaces')}
                className="bg-slate-900/80 hover:bg-slate-850 p-4 rounded-2xl border border-slate-800 hover:border-teal-500/50 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Active Workplaces</span>
                  <Building className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-teal-400 mt-2">
                  {activeClients.length}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-teal-400">
                  <span>Monitor shifts</span> <ChevronRight className="w-3 h-3" />
                </div>
              </button>

              {/* 7. Suspended Clients */}
              <button
                onClick={() => {
                  setStatusFilter('SUSPENDED');
                  onNavigateTab('my-clients');
                }}
                className="bg-slate-900/80 hover:bg-slate-850 p-4 rounded-2xl border border-slate-800 hover:border-rose-500/50 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Suspended Clients</span>
                  <Lock className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-slate-300 mt-2">
                  {suspendedClients.length}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-white">
                  <span>Check reasons</span> <ChevronRight className="w-3 h-3" />
                </div>
              </button>

              {/* 8. Tasks Assigned to Clients */}
              <button
                onClick={() => onNavigateTab('tasks')}
                className="bg-slate-900/80 hover:bg-slate-850 p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Client Tasks</span>
                  <Briefcase className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-indigo-400 mt-2">
                  {clientJobs.length}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-indigo-400">
                  <span>Task queue</span> <ChevronRight className="w-3 h-3" />
                </div>
              </button>

              {/* 9. Tasks Awaiting Review */}
              <button
                onClick={() => onNavigateTab('submissions')}
                className="bg-slate-900/80 hover:bg-slate-850 p-4 rounded-2xl border border-purple-900/40 hover:border-purple-500/50 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Awaiting Review</span>
                  <UploadCloud className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-purple-400 mt-2">
                  {tasksAwaitingReview.length}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-purple-400">
                  <span>Review deliverables</span> <ChevronRight className="w-3 h-3" />
                </div>
              </button>

              {/* 10. Overdue Tasks */}
              <button
                onClick={() => onNavigateTab('tasks')}
                className="bg-slate-900/80 hover:bg-slate-850 p-4 rounded-2xl border border-slate-800 hover:border-rose-500/50 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Overdue Tasks</span>
                  <AlertTriangle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-rose-400 mt-2">
                  {overdueTasks.length}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-rose-400">
                  <span>Follow up</span> <ChevronRight className="w-3 h-3" />
                </div>
              </button>
            </div>
          </div>

          {/* Action Priority Quick Feeds */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Urgent Submissions Awaiting Agent Review */}
            <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-purple-400" />
                  <h4 className="font-extrabold text-white text-sm">
                    Pending Client Submissions ({tasksAwaitingReview.length})
                  </h4>
                </div>
                <button
                  onClick={() => onNavigateTab('submissions')}
                  className="text-xs text-purple-400 hover:underline flex items-center gap-1"
                >
                  <span>View all</span> <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {tasksAwaitingReview.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/40 rounded-2xl border border-slate-850">
                  No deliverables waiting for your evaluation right now.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {tasksAwaitingReview.slice(0, 3).map((j) => (
                    <div
                      key={j.id}
                      className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{j.title}</div>
                        <div className="text-[11px] text-slate-400">
                          Client: <strong className="text-slate-300">{j.assignedClient || 'Jane Wanjiku'}</strong> · Payout:{' '}
                          <span className="font-mono text-emerald-400 font-bold">{j.paymentAmount.toLocaleString()} KES</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setReviewJobTarget(j);
                          setIsReviewSubmissionModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-white rounded-xl font-bold text-xs"
                      >
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Support Tickets Needing Agent Response */}
            <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-extrabold text-white text-sm">
                    Open Support & Help Inquiries ({openTickets.length})
                  </h4>
                </div>
                <button
                  onClick={() => onNavigateTab('support')}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>View all</span> <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {openTickets.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/40 rounded-2xl border border-slate-850">
                  All support inquiries resolved. Good job!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {openTickets.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{t.subject}</div>
                        <div className="text-[11px] text-slate-400">
                          From: {t.userName} ({t.userRole}) · Priority:{' '}
                          <span className="font-mono text-amber-400">{t.priority}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTicket(t);
                          onNavigateTab('support');
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold text-xs border border-slate-700"
                      >
                        Respond
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: MY CLIENTS DIRECTORY (Search, Filter, Sort, Profile, Actions)
         ========================================================================= */}
      {activeTab === 'my-clients' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                My Assigned Clients
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Complete operational roster under your management. Total: {myAssignedClients.length} clients
              </p>
            </div>

            <button
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign Work</span>
            </button>
          </div>

          {/* Search, Filter bar */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3" /> Status:
              </span>
              {[
                { id: 'ALL', label: 'All' },
                { id: 'NEW', label: 'New' },
                { id: 'PENDING', label: 'Pending' },
                { id: 'UNDER_REVIEW', label: 'Under Review' },
                { id: 'ACTIVE', label: 'Active' },
                { id: 'REQUIRES_ATTENTION', label: 'Attention' },
                { id: 'SUSPENDED', label: 'Suspended' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                    statusFilter === filter.id
                      ? 'bg-slate-800 text-white font-bold border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Client Table / Grid */}
          {filterClientList(myAssignedClients).length === 0 ? (
            <div className="p-16 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
              <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <div className="font-bold text-white text-sm">No clients found matching filter</div>
              <p className="text-xs text-slate-500 mt-1">Try resetting filters or search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterClientList(myAssignedClients).map((client) => {
                const assignedJobCount = jobs.filter((j) => j.assignedClientId === client.id).length;
                const activeShift = sessions.find((s) => s.clientId === client.id && s.status === 'IN_PROGRESS');

                return (
                  <div
                    key={client.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-sm">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{client.name}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[170px]">{client.email}</div>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                            client.status === 'ACTIVE'
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                              : client.status === 'REQUIRES_ATTENTION'
                              ? 'bg-rose-950/60 text-rose-400 border-rose-500/30'
                              : client.status === 'SUSPENDED'
                              ? 'bg-slate-950 text-slate-400 border-slate-800'
                              : 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {client.status}
                        </span>
                      </div>

                      {/* Client stats */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Department:</span>
                          <span className="text-white font-medium">{client.department || 'Operations'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Monthly Compensation:</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {(client.monthlySalary || 35000).toLocaleString()} KES
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Assigned Tasks:</span>
                          <span className="text-white font-semibold">{assignedJobCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Workplace Shift:</span>
                          {activeShift ? (
                            <span className="text-emerald-400 font-bold font-mono text-[11px] flex items-center gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live Clocked-In
                            </span>
                          ) : (
                            <span className="text-slate-500 font-mono text-[11px]">Off-shift</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Operational Actions */}
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          onClick={() => setSelectedClientDetail(client)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Profile</span>
                        </button>
                        <button
                          onClick={() => onPreviewClientWorkplace(client.id)}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold flex items-center justify-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Workplace</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setMessageTargetClient(client);
                            setIsMessageModalOpen(true);
                          }}
                          className="flex-1 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 border border-slate-800"
                        >
                          <MessageSquare className="w-3 h-3 text-sky-400" />
                          <span>Message</span>
                        </button>

                        {!client.workplaceActivated || client.status !== 'ACTIVE' ? (
                          <button
                            onClick={() => {
                              setActivationTargetClient(client);
                              setIsActivationModalOpen(true);
                            }}
                            className="flex-1 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Activate</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSuspendTargetClient(client);
                              setIsSuspendModalOpen(true);
                            }}
                            className="flex-1 py-1.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 border border-rose-900/40"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            <span>Suspend</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SECTION 3 & 4: CLIENT ONBOARDING & WORKPLACE ACTIVATION
         ========================================================================= */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Client Onboarding & Verification
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Workflow: New Client → Review Details → Check KYC Documents → Verification → Approval → Workplace Activation
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {myAssignedClients.filter((c) => !c.workplaceActivated || c.status === 'NEW' || c.status === 'UNDER_REVIEW').length === 0 ? (
              <div className="p-16 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
                <div className="font-bold text-white text-sm">All assigned client onboarding completed!</div>
                <p className="text-xs text-slate-500 mt-1">No pending verification applications awaiting your review.</p>
              </div>
            ) : (
              myAssignedClients
                .filter((c) => !c.workplaceActivated || c.status === 'NEW' || c.status === 'UNDER_REVIEW')
                .map((client) => (
                  <div
                    key={client.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-base">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">{client.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/30">
                              {client.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            {client.email} · Phone: {client.phone} · Applied: {new Date(client.joinedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Workplace Activation Button */}
                      <button
                        onClick={() => {
                          setActivationTargetClient(client);
                          setIsActivationModalOpen(true);
                        }}
                        className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/10 transition-transform hover:scale-[1.02]"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ACTIVATE WORKPLACE</span>
                      </button>
                    </div>

                    {/* Verification documents checklist */}
                    <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-850 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                        <span>Submitted Verification Documents</span>
                        <span className="text-[11px] text-slate-500">Agent Verification Required</span>
                      </div>

                      {(!client.documents || client.documents.length === 0) ? (
                        <div className="text-xs text-slate-500">No documents submitted yet. Agent can request missing ID/PIN.</div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {client.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="truncate">
                                <div className="font-semibold text-white truncate">{doc.name}</div>
                                <div className="text-[10px] text-slate-500">{doc.category}</div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {doc.status === 'VERIFIED' ? (
                                  <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 bg-emerald-950 rounded border border-emerald-500/30 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                  </span>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleVerifyDocument(client.id, doc.id, 'VERIFIED')}
                                      className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold"
                                    >
                                      Verify
                                    </button>
                                    <button
                                      onClick={() => handleVerifyDocument(client.id, doc.id, 'REJECTED')}
                                      className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded text-[10px] font-bold"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 5 & 15: CLIENT WORKPLACES MONITORING
         ========================================================================= */}
      {activeTab === 'workplaces' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Client Workplaces Command
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Monitor live shift attendance, active work timers, last logins, and launch client workplaces
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myAssignedClients.map((client) => {
              const activeSession = sessions.find((s) => s.clientId === client.id && s.status === 'IN_PROGRESS');

              return (
                <div
                  key={client.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-extrabold text-white text-base flex items-center gap-2">
                        <span>{client.name}</span>
                        {client.workplaceActivated ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                            WORKPLACE ACTIVE
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/30">
                            PENDING ACTIVATION
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {client.department || 'Support Desk'} · Salary: {(client.monthlySalary || 35000).toLocaleString()} KES/mo
                      </div>
                    </div>

                    <button
                      onClick={() => onPreviewClientWorkplace(client.id)}
                      className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Launch Workplace</span>
                    </button>
                  </div>

                  {/* Workplace Telemetry */}
                  <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-slate-500 text-[10px]">Workplace State</div>
                      <div className="text-white font-semibold mt-0.5">
                        {activeSession ? (
                          <span className="text-emerald-400 font-bold font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Clocked-In
                          </span>
                        ) : (
                          <span className="text-slate-400">Idle / Off-Shift</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500 text-[10px]">Last Active Time</div>
                      <div className="text-slate-300 font-mono text-[11px] mt-0.5">
                        {client.lastActiveAt ? new Date(client.lastActiveAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500 text-[10px]">Last Login</div>
                      <div className="text-slate-300 font-mono text-[11px] mt-0.5">
                        {client.lastLoginAt ? new Date(client.lastLoginAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recently'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 6 & 7: WORK & TASKS MANAGEMENT
         ========================================================================= */}
      {(activeTab === 'work' || activeTab === 'tasks') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Work & Task Management
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Lifecycle: Created → Assigned → Accepted → In Progress → Submitted → Reviewed → Approved → Completed
              </p>
            </div>

            <button
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create & Assign Work</span>
            </button>
          </div>

          {/* Task list */}
          {clientJobs.length === 0 ? (
            <div className="p-16 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
              <Briefcase className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <div className="font-bold text-white text-sm">No tasks currently assigned to your clients</div>
              <p className="text-xs text-slate-500 mt-1">Click "Create & Assign Work" to allocate tasks.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clientJobs.map((j) => (
                <div
                  key={j.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{j.title}</span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                          j.priority === 'URGENT'
                            ? 'bg-rose-950 text-rose-400 border-rose-500/30'
                            : j.priority === 'HIGH'
                            ? 'bg-amber-950 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {j.priority || 'MEDIUM'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Assigned to: <strong className="text-slate-300">{j.assignedClient || 'Client'}</strong> · Deadline:{' '}
                      <span className="font-mono text-slate-300">{new Date(j.deadline).toLocaleDateString()}</span> · Value:{' '}
                      <span className="font-mono text-emerald-400 font-bold">{j.paymentAmount.toLocaleString()} KES</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-full border font-bold ${
                        j.status === 'APPROVED' || j.status === 'COMPLETED'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                          : j.status === 'SUBMITTED'
                          ? 'bg-purple-950/60 text-purple-400 border-purple-500/30'
                          : j.status === 'CORRECTION_REQUIRED' || j.status === 'UNDER_REVIEW'
                          ? 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {j.status}
                    </span>

                    {j.status === 'SUBMITTED' && (
                      <button
                        onClick={() => {
                          setReviewJobTarget(j);
                          setIsReviewSubmissionModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-white rounded-xl text-xs font-bold"
                      >
                        Review Work
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SECTION 8: CLIENT SUBMISSION REVIEW
         ========================================================================= */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Client Deliverable Submissions
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Review outputs, verify milestone evidence, and either Approve, Reject, or Request Corrections
            </p>
          </div>

          {tasksAwaitingReview.length === 0 ? (
            <div className="p-16 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
              <div className="font-bold text-white text-sm">No pending submissions awaiting review</div>
              <p className="text-xs text-slate-500 mt-1">All submitted deliverables have been evaluated.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasksAwaitingReview.map((j) => (
                <div
                  key={j.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-base font-extrabold text-white">{j.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Submitted by: <strong className="text-white">{j.assignedClient || 'Client'}</strong> · Compensation:{' '}
                        <span className="font-mono text-emerald-400 font-bold">{j.paymentAmount.toLocaleString()} KES</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setReviewJobTarget(j);
                          setReviewDecision('APPROVE');
                          setIsReviewSubmissionModalOpen(true);
                        }}
                        className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl font-bold text-xs"
                      >
                        Approve Work
                      </button>
                      <button
                        onClick={() => {
                          setReviewJobTarget(j);
                          setReviewDecision('CORRECTION_REQUIRED');
                          setIsReviewSubmissionModalOpen(true);
                        }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs"
                      >
                        Request Correction
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl text-xs space-y-2">
                    <div className="text-slate-400 font-semibold">Deliverable Notes & Attachments:</div>
                    <p className="text-slate-200">
                      {j.agentSubmission?.notes || j.description || 'Milestone deliverables and evidence uploaded.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SECTION 9: CLIENT SUPPORT
         ========================================================================= */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Client Support & Ticket Desk
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Workflow: Client → Agent Response → Resolution. (Or Agent → Escalate → Admin)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ticket List */}
            <div className="space-y-3 lg:col-span-1">
              {tickets.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
                  No support tickets on record.
                </div>
              ) : (
                tickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTicket(t)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all ${
                      activeTicket?.id === t.id
                        ? 'bg-slate-850 border-emerald-500/50 shadow-lg'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs truncate max-w-[170px]">{t.subject}</span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                          t.status === 'RESOLVED'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-950 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      From: {t.userName} · Category: {t.category}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Active Ticket Thread */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between min-h-[400px]">
              {activeTicket ? (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="font-bold text-white text-sm">{activeTicket.subject}</h4>
                        <div className="text-xs text-slate-400">
                          {activeTicket.userName} ({activeTicket.userRole}) · Category: {activeTicket.category}
                        </div>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 uppercase font-bold">
                        {activeTicket.status}
                      </span>
                    </div>

                    {/* Messages */}
                    <div className="py-4 space-y-3 max-h-[250px] overflow-y-auto">
                      {activeTicket.messages?.map((m, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                            m.senderRole === 'AGENT' || m.senderRole === 'ADMIN'
                              ? 'ml-auto bg-emerald-500/10 border border-emerald-500/20 text-slate-200'
                              : 'mr-auto bg-slate-950 border border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="text-[10px] text-slate-500 font-mono mb-1">
                            {m.senderName} ({m.senderRole}) · {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div>{m.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reply form */}
                  <form onSubmit={handleReplyTicket} className="pt-3 border-t border-slate-800 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type supervisor response..."
                      value={ticketReplyText}
                      onChange={(e) => setTicketReplyText(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                    />
                    <button
                      type="submit"
                      disabled={actionLoading || !ticketReplyText.trim()}
                      className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="m-auto text-center text-slate-500 text-xs">
                  Select a support ticket from the list to read messages and respond.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 10: CLIENT MESSAGING CENTER
         ========================================================================= */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Client Communication Center
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Direct work instructions, missing info requests, and status notifications
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 md:col-span-1">
              <div className="text-xs font-bold text-slate-400 mb-2">My Clients</div>
              {myAssignedClients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setMessageTargetClient(c);
                    setIsMessageModalOpen(true);
                  }}
                  className="w-full p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-left text-xs flex items-center justify-between"
                >
                  <span className="font-bold text-white">{c.name}</span>
                  <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                </button>
              ))}
            </div>

            <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h4 className="font-bold text-white text-sm">Recent Thread Communications</h4>
              {messages.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/40 rounded-2xl border border-slate-800">
                  No conversation logs available. Click any client to initiate a message.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>
                          {m.senderName} ({m.senderRole})
                        </span>
                        <span>{new Date(m.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-200">{m.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 11: CLIENT DOCUMENTS MANAGEMENT
         ========================================================================= */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Client Documents Desk
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                View, verify, reject, and request compliance documents (ID, KRA PIN, Bank Auth, Contracts)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {myAssignedClients.map((client) => (
              <div
                key={client.id}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm">{client.name} Documents</div>
                  <span className="text-xs font-mono text-slate-400">{client.email}</span>
                </div>

                {(!client.documents || client.documents.length === 0) ? (
                  <div className="text-xs text-slate-500 p-4 bg-slate-950/50 rounded-xl">
                    No documents uploaded by this client yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {client.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="truncate">
                          <div className="font-semibold text-white truncate">{doc.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {doc.category} · Status: <span className="text-emerald-400">{doc.status}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {doc.status !== 'VERIFIED' ? (
                            <button
                              onClick={() => handleVerifyDocument(client.id, doc.id, 'VERIFIED')}
                              className="px-2.5 py-1 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded text-[10px] font-bold"
                            >
                              Verify
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-bold">✓ Verified</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 12 & 13: EARNINGS & PAYMENT STATUS
         ========================================================================= */}
      {(activeTab === 'earnings' || activeTab === 'payment-status') && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Client Earnings & Monthly Compensation
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Oversight of client monthly payroll records, disbursements, and M-Pesa receipts
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-extrabold text-white text-sm">October 2026 Monthly Client Statements</h3>

            {payrollRecords.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">No payroll records generated yet.</div>
            ) : (
              <div className="space-y-3">
                {payrollRecords.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{p.clientName}</div>
                      <div className="text-slate-400 text-xs">
                        Department: {p.department} · Net Salary:{' '}
                        <span className="font-mono text-emerald-400 font-bold">
                          {p.netPayment.toLocaleString()} KES
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-mono px-2.5 py-1 rounded-full border font-bold ${
                          p.status === 'PAID'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-950 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {p.status}
                      </span>
                      <div className="text-[11px] text-slate-400 font-mono">Ref: {p.transactionReference}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 17: NOTIFICATIONS
         ========================================================================= */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Agent Notifications & System Alerts
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time updates regarding new client assignments, submissions, and tasks
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{n.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-300">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 18, 19, 20: REPORTS, PERFORMANCE & AUDIT ACTIVITY
         ========================================================================= */}
      {(activeTab === 'reports' || activeTab === 'activity') && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {activeTab === 'reports' ? 'My Performance & Client Reports' : 'Agent Activity & Audit Trail'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Immutable operational records tracking every action performed by Agent #{user?.id}
            </p>
          </div>

          {/* Performance scorecard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
              <div className="text-slate-400 text-xs">Clients Managed</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">{myAssignedClients.length}</div>
            </div>
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
              <div className="text-slate-400 text-xs">Workplaces Activated</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{activeClients.length}</div>
            </div>
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
              <div className="text-slate-400 text-xs">Tasks Handled</div>
              <div className="text-2xl font-bold font-mono text-sky-400 mt-1">{clientJobs.length}</div>
            </div>
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
              <div className="text-slate-400 text-xs">Tickets Resolved</div>
              <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
                {tickets.filter((t) => t.status === 'RESOLVED').length}
              </div>
            </div>
          </div>

          {/* Activity timeline */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h4 className="font-bold text-white text-sm">Supervisor Activity Logs</h4>
            <div className="space-y-2">
              {auditLogs.slice(0, 10).map((log, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950/70 border border-slate-850 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-emerald-400 font-mono text-[11px]">{log.action}: </span>
                    <span className="text-slate-300">{log.details}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 21: PROFILE & SETTINGS
         ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-white">Agent Profile & Security</h2>
            <p className="text-xs text-slate-400 mt-1">
              Personal contact details, Safaricom M-Pesa payout target, and permissions overview.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.name}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Email Address</label>
              <input
                type="text"
                disabled
                value={user?.email}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Assigned Department</label>
              <input
                type="text"
                disabled
                value="Customer Support & Operations Supervisory Lead"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-semibold"
              />
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="font-bold text-white">Role Restrictions Notice:</div>
              <p>
                Agent permissions and client reassignments are strictly managed by Platform Administrators. Agents cannot modify their own permissions or override administrative locks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS & DRAWERS
         ========================================================================= */}

      {/* 1. REAL WORKPLACE ACTIVATION MODAL (Function 4) */}
      {isActivationModalOpen && activationTargetClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Activate Client Workplace</span>
              </h3>
              <button
                onClick={() => setIsActivationModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3 text-slate-300">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px]">
                <div>Client ID: #{activationTargetClient.id}</div>
                <div>Name: {activationTargetClient.name}</div>
                <div>Department: {activationTargetClient.department || 'Support'}</div>
                <div>Monthly Pay: {(activationTargetClient.monthlySalary || 35000).toLocaleString()} KES</div>
              </div>

              <p className="text-slate-400">
                Clicking Confirm will verify Agent permission, set workplace status to <strong className="text-emerald-400">ACTIVE</strong>, record your Agent ID (#{user?.id}), create an immutable audit log, and notify both Client and Admin.
              </p>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                onClick={() => setIsActivationModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWorkplaceActivation}
                disabled={actionLoading}
                className="px-5 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl font-bold flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Workplace Activation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUSPEND WORKPLACE MODAL (Function 16) */}
      {isSuspendModalOpen && suspendTargetClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>Suspend Client Workplace</span>
              </h3>
              <button
                onClick={() => setIsSuspendModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3 text-slate-300">
              <p>
                Suspending <strong className="text-white">{suspendTargetClient.name}</strong> will restrict their workplace shift clock-in and task submissions.
              </p>
              <div>
                <label className="block text-slate-400 mb-1">Reason for Suspension</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Failed required identity verification or attendance review"
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                onClick={() => setIsSuspendModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSuspension}
                disabled={actionLoading}
                className="px-5 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Suspend Workplace</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ASSIGN CLIENT TASK MODAL (Function 6 & 7) */}
      {isCreateTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <span>Assign Client Task / Project</span>
              </h3>
              <button
                onClick={() => setIsCreateTaskModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Client</label>
                <select
                  required
                  value={taskAssignedClientId}
                  onChange={(e) => setTaskAssignedClientId(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="">-- Choose Assigned Client --</option>
                  {myAssignedClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.department || 'Operations'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Customer Support Ticket Escalation Triage Batch #4"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Explicit operational requirements and milestone deliverables..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Payout (KES)</label>
                  <input
                    type="number"
                    value={taskPayout}
                    onChange={(e) => setTaskPayout(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Deadline</label>
                  <input
                    type="date"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl font-bold flex items-center gap-1.5"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Assign Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. REVIEW SUBMISSION MODAL (Function 8) */}
      {isReviewSubmissionModalOpen && reviewJobTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-purple-400" />
                <span>Review Submission — {reviewJobTarget.title}</span>
              </h3>
              <button
                onClick={() => setIsReviewSubmissionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3 text-slate-300">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div>Client: {reviewJobTarget.assignedClient || 'Client'}</div>
                <div>Amount: {reviewJobTarget.paymentAmount.toLocaleString()} KES</div>
                <div>Deadline: {new Date(reviewJobTarget.deadline).toLocaleDateString()}</div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Evaluation Decision</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewDecision('APPROVE')}
                    className={`py-2 px-3 rounded-xl font-bold text-center border transition-all ${
                      reviewDecision === 'APPROVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    ✓ Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewDecision('CORRECTION_REQUIRED')}
                    className={`py-2 px-3 rounded-xl font-bold text-center border transition-all ${
                      reviewDecision === 'CORRECTION_REQUIRED'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    ⚠ Correction
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewDecision('REJECT')}
                    className={`py-2 px-3 rounded-xl font-bold text-center border transition-all ${
                      reviewDecision === 'REJECT'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Supervisor Feedback</label>
                <textarea
                  rows={3}
                  placeholder={
                    reviewDecision === 'CORRECTION_REQUIRED'
                      ? 'Specify exactly what information is incomplete or requires modification...'
                      : 'Provide comments or congratulations for the client...'
                  }
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                onClick={() => setIsReviewSubmissionModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmission}
                disabled={actionLoading}
                className="px-5 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Submit Evaluation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. DIRECT CLIENT MESSAGE MODAL (Function 10) */}
      {isMessageModalOpen && messageTargetClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-400" />
                <span>Message {messageTargetClient.name}</span>
              </h3>
              <button
                onClick={() => setIsMessageModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-3 text-xs">
              <p className="text-slate-400">
                Message will be delivered to {messageTargetClient.name}'s workplace notification thread and archived in their supervisory timeline.
              </p>
              <textarea
                rows={4}
                required
                placeholder="Type your message, work instructions, or missing information request..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500/50"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMessageModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. CLIENT PROFILE DRAWER */}
      {selectedClientDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] p-6 shadow-2xl space-y-4 overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-base">
                  {selectedClientDetail.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{selectedClientDetail.name}</h3>
                  <div className="text-xs text-slate-400">{selectedClientDetail.email}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedClientDetail(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                  <div className="text-slate-500 text-[10px]">Workplace Status</div>
                  <div className="font-bold text-white mt-0.5">{selectedClientDetail.status}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                  <div className="text-slate-500 text-[10px]">Monthly Salary</div>
                  <div className="font-bold text-emerald-400 font-mono mt-0.5">
                    {(selectedClientDetail.monthlySalary || 35000).toLocaleString()} KES
                  </div>
                </div>
              </div>

              {/* Activity Timeline (Function 14) */}
              <div className="space-y-2">
                <div className="font-bold text-white text-xs uppercase tracking-wider">
                  Client Activity Timeline
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 font-mono text-[11px] text-slate-300">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <span>✓ Workplace Status:</span>
                    <span>{selectedClientDetail.workplaceActivated ? 'Activated' : 'Pending'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span>✓ Assigned Supervisor:</span>
                    <span>{selectedClientDetail.supervisorAgentName || user?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span>✓ Onboarding Application:</span>
                    <span>{new Date(selectedClientDetail.joinedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2 text-xs">
              <button
                onClick={() => {
                  onPreviewClientWorkplace(selectedClientDetail.id);
                  setSelectedClientDetail(null);
                }}
                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl font-bold flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Launch Client Workplace</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
