import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiRequest } from '../../lib/api.ts';
import { Client, MonthlyContract, ClientWorkSession, Job, MonthlyPayrollRecord } from '../../types/index.ts';
import {
  Users,
  Building,
  UserCheck,
  Shield,
  FileText,
  Clock,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  ExternalLink,
  ChevronRight,
  Eye,
  Play,
  RotateCcw,
  Sparkles,
  Loader2,
  X,
  Plus,
  MessageSquare,
  DollarSign,
  TrendingUp,
  FileCheck,
  Smartphone,
  Calendar,
  AlertTriangle,
  FolderKanban
} from 'lucide-react';

interface Props {
  onPreviewClientWorkplace: (clientId: string) => void;
}

export const AgentClientsManager: React.FC<Props> = ({ onPreviewClientWorkplace }) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<MonthlyContract[]>([]);
  const [sessions, setSessions] = useState<ClientWorkSession[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [payrolls, setPayrolls] = useState<MonthlyPayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'SUSPENDED'>('ALL');
  const [viewScope, setViewScope] = useState<'MY_CLIENTS' | 'ALL_CLIENTS'>('MY_CLIENTS');

  // Selected client for detail view / drawer
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeClientTab, setActiveClientTab] = useState<'overview' | 'tasks' | 'sessions' | 'contracts' | 'payroll'>('overview');

  // Assign task / job to client modal
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPayout, setTaskPayout] = useState('5000');
  const [taskDeadline, setTaskDeadline] = useState('2026-10-31');

  // Internal note modal
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [internalNoteText, setInternalNoteText] = useState('');

  // Suspend modal
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientsRes, contractsRes, sessionsRes, jobsRes, payrollRes] = await Promise.all([
        apiRequest<{ clients: Client[] }>('/api/clients'),
        apiRequest<{ contracts: MonthlyContract[] }>('/api/contracts'),
        apiRequest<{ sessions: ClientWorkSession[] }>('/api/work-sessions'),
        apiRequest<{ jobs: Job[] }>('/api/jobs'),
        apiRequest<{ payroll: MonthlyPayrollRecord[] }>('/api/payroll'),
      ]);

      setClients(clientsRes.clients || []);
      setContracts(contractsRes.contracts || []);
      setSessions(sessionsRes.sessions || []);
      setJobs(jobsRes.jobs || []);
      setPayrolls(payrollRes.payroll || []);
    } catch (err) {
      console.error('Failed to load agent client data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter clients based on agent assignment and query
  const myClients = clients.filter(
    (c) => c.supervisorAgentId === user?.id || c.supervisorAgentName?.toLowerCase().includes((user?.name || '').toLowerCase())
  );

  const displayedClients = (viewScope === 'MY_CLIENTS' ? myClients : clients).filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.department && c.department.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return c.status === 'ACTIVE' && c.workplaceActivated;
    if (statusFilter === 'PENDING') return c.status === 'PENDING' || !c.workplaceActivated;
    if (statusFilter === 'SUSPENDED') return c.status === 'SUSPENDED';
    return true;
  });

  // Client operations
  const handleActivateWorkplace = async (clientId: string) => {
    try {
      setActionLoading(true);
      await apiRequest(`/api/clients/${clientId}/activate`, { method: 'POST' });
      await loadData();
      if (selectedClient?.id === clientId) {
        const updated = clients.find((c) => c.id === clientId);
        if (updated) setSelectedClient({ ...updated, status: 'ACTIVE', workplaceActivated: true });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to activate workplace');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendWorkplace = async () => {
    if (!selectedClient) return;
    try {
      setActionLoading(true);
      await apiRequest(`/api/clients/${selectedClient.id}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ reason: suspendReason || 'Agent review required' }),
      });
      setIsSuspendModalOpen(false);
      setSuspendReason('');
      await loadData();
      setSelectedClient((prev) => (prev ? { ...prev, status: 'SUSPENDED', workplaceActivated: false } : null));
    } catch (err: any) {
      alert(err.message || 'Failed to suspend workplace');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddInternalNote = async () => {
    if (!selectedClient || !internalNoteText.trim()) return;
    try {
      setActionLoading(true);
      const existingNotes = selectedClient.internalNotes || [];
      const updatedNotes = [
        ...existingNotes,
        `[${new Date().toLocaleDateString()} by ${user?.name}]: ${internalNoteText.trim()}`,
      ];

      await apiRequest(`/api/clients/${selectedClient.id}`, {
        method: 'PUT',
        body: JSON.stringify({ internalNotes: updatedNotes }),
      });

      setIsNoteModalOpen(false);
      setInternalNoteText('');
      await loadData();
      setSelectedClient((prev) => (prev ? { ...prev, internalNotes: updatedNotes } : null));
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateClientTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !taskTitle.trim()) return;

    try {
      setActionLoading(true);
      await apiRequest('/api/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title: taskTitle.trim(),
          description: taskDesc.trim() || 'Assigned client task by supervising agent.',
          paymentAmount: Number(taskPayout) || 5000,
          deadline: taskDeadline,
          categoryName: selectedClient.department || 'Client Operations',
          assignedClient: selectedClient.name,
          assignedClientId: selectedClient.id,
          assignedAgentId: user?.id,
          assignedAgentName: user?.name,
          milestones: [
            { id: `ms-1`, title: 'Milestone 1: Progress Check', status: 'PENDING' },
            { id: `ms-2`, title: 'Milestone 2: Final Verification & Delivery', status: 'PENDING' },
          ],
        }),
      });

      setIsAssignTaskModalOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign job');
    } finally {
      setActionLoading(false);
    }
  };

  // Client stats
  const activeCount = myClients.filter((c) => c.status === 'ACTIVE' && c.workplaceActivated).length;
  const pendingCount = myClients.filter((c) => c.status === 'PENDING' || !c.workplaceActivated).length;
  const totalPayrollManaged = myClients.reduce((sum, c) => sum + (c.monthlySalary || 35000), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Supervision Stats */}
      <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Client Management Center
            </span>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 font-mono">
              <Shield className="w-3.5 h-3.5" /> SUPERVISING AGENT
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            As an agent, you hold primary operational responsibility for your assigned clients: activate their workplaces, manage tasks and deliverables, verify attendance sessions, and monitor monthly payroll statements.
          </p>
        </div>

        {/* Supervision Metrics */}
        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
          <div className="bg-slate-950/60 border border-slate-800/90 rounded-2xl p-3.5 text-center min-w-[100px]">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">My Clients</div>
            <div className="text-xl font-extrabold text-white font-mono mt-1">{myClients.length}</div>
          </div>
          <div className="bg-slate-950/60 border border-emerald-900/30 rounded-2xl p-3.5 text-center min-w-[100px]">
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Active</div>
            <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">{activeCount}</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/90 rounded-2xl p-3.5 text-center min-w-[120px]">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Managed Pay</div>
            <div className="text-base font-extrabold text-sky-400 font-mono mt-1">
              {(totalPayrollManaged / 1000).toFixed(0)}k KES
            </div>
          </div>
        </div>
      </div>

      {/* Control bar: search, scope selector, filters */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl bg-slate-950/80 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setViewScope('MY_CLIENTS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                viewScope === 'MY_CLIENTS'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Assigned ({myClients.length})
            </button>
            <button
              onClick={() => setViewScope('ALL_CLIENTS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                viewScope === 'ALL_CLIENTS'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Clients ({clients.length})
            </button>
          </div>

          <div className="flex rounded-xl bg-slate-950/80 p-1 border border-slate-800 text-xs">
            {(['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-lg font-semibold text-[11px] transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search client, email, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Main Clients Grid / Table */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800/80">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-emerald-400 mb-3" />
          <p className="text-xs">Loading client workplace directory...</p>
        </div>
      ) : displayedClients.length === 0 ? (
        <div className="p-16 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800/80 space-y-3">
          <Building className="w-10 h-10 mx-auto text-slate-600" />
          <div className="font-bold text-white text-sm">No clients match this filter</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {viewScope === 'MY_CLIENTS'
              ? 'You do not have any clients directly assigned under your supervision matching this query. Switch to "All Clients" or contact Admin.'
              : 'Try clearing your search terms or changing your status filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedClients.map((client) => {
            const clientContract = contracts.find((c) => c.clientId === client.id && c.status === 'ACTIVE');
            const clientSessionList = sessions.filter((s) => s.clientId === client.id);
            const activeSession = clientSessionList.find((s) => s.status === 'RUNNING');
            const clientJobList = jobs.filter((j) => j.assignedClientId === client.id || j.assignedClient === client.name);
            const isAssignedToMe = client.supervisorAgentId === user?.id || client.supervisorAgentName?.toLowerCase().includes((user?.name || '').toLowerCase());

            return (
              <div
                key={client.id}
                className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800/90 hover:border-slate-700/80 p-5 space-y-4 transition-all duration-200 flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* Top card header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-base">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                          <span>{client.name}</span>
                          {isAssignedToMe && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              My Assignee
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{client.email}</div>
                      </div>
                    </div>

                    {/* Workplace status pill */}
                    <span
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-full border font-bold ${
                        client.status === 'ACTIVE' && client.workplaceActivated
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                          : client.status === 'SUSPENDED'
                          ? 'bg-rose-950/60 text-rose-400 border-rose-500/30'
                          : 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {client.status === 'ACTIVE' && client.workplaceActivated ? 'ACTIVE' : client.status}
                    </span>
                  </div>

                  {/* Contract & Department Information */}
                  <div className="mt-4 pt-4 border-t border-slate-800/70 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-500" /> Department:
                      </span>
                      <span className="text-white font-medium">{client.department || 'Customer Support'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-slate-500" /> Monthly Pay:
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {(client.monthlySalary || 35000).toLocaleString()} KES
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" /> Supervisor:
                      </span>
                      <span className="text-slate-300 font-medium truncate max-w-[140px]">
                        {client.supervisorAgentName || 'Unassigned'}
                      </span>
                    </div>

                    {/* Work Activity status */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-slate-500" /> Work State:
                      </span>
                      {activeSession ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono text-[11px] animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Clocked In
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">Idle / Off-shift</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setActiveClientTab('overview');
                      }}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-300" />
                      <span>Manage</span>
                    </button>
                    <button
                      onClick={() => onPreviewClientWorkplace(client.id)}
                      className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Workplace</span>
                    </button>
                  </div>

                  {/* Fast Workplace toggles for agent */}
                  {(!client.workplaceActivated || client.status !== 'ACTIVE') ? (
                    <button
                      onClick={() => handleActivateWorkplace(client.id)}
                      disabled={actionLoading}
                      className="w-full py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-500/10"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Activate Client Workplace</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setIsSuspendModalOpen(true);
                      }}
                      className="w-full py-1.5 bg-slate-950 text-rose-400 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900/40 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>Suspend Access</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Client Comprehensive Management Drawer / Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-lg">
                  {selectedClient.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-white">{selectedClient.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      {selectedClient.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedClient.email} · Phone: {selectedClient.phone || 'N/A'} · Dept: {selectedClient.department || 'Support'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPreviewClientWorkplace(selectedClient.id)}
                  className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch Live Workplace</span>
                </button>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation tabs inside drawer */}
            <div className="px-6 border-b border-slate-800 flex items-center gap-2 bg-slate-950/30 text-xs overflow-x-auto">
              {[
                { id: 'overview', label: 'Client Overview' },
                { id: 'tasks', label: `Assigned Tasks (${jobs.filter((j) => j.assignedClientId === selectedClient.id || j.assignedClient === selectedClient.name).length})` },
                { id: 'sessions', label: `Attendance / Shifts (${sessions.filter((s) => s.clientId === selectedClient.id).length})` },
                { id: 'contracts', label: 'Employment Contract' },
                { id: 'payroll', label: 'Payroll & Compensation' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveClientTab(tab.id as any)}
                  className={`py-3 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeClientTab === tab.id
                      ? 'border-emerald-400 text-emerald-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content area */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {activeClientTab === 'overview' && (
                <div className="space-y-6">
                  {/* Summary grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                      <div className="text-slate-400 text-[11px]">Monthly Salary</div>
                      <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                        {(selectedClient.monthlySalary || 35000).toLocaleString()} KES
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Fixed contract</div>
                    </div>

                    <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                      <div className="text-slate-400 text-[11px]">Workplace Status</div>
                      <div className="text-sm font-bold text-white mt-1">
                        {selectedClient.workplaceActivated ? 'Activated & Live' : 'Pending Activation'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Agent controlled</div>
                    </div>

                    <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                      <div className="text-slate-400 text-[11px]">Assigned Supervisor</div>
                      <div className="text-sm font-bold text-white mt-1 truncate">
                        {selectedClient.supervisorAgentName || 'None'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Direct oversight</div>
                    </div>

                    <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                      <div className="text-slate-400 text-[11px]">Next Payday</div>
                      <div className="text-sm font-bold text-white mt-1">
                        {selectedClient.nextPaymentDate || '31 Oct 2026'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Automated payroll</div>
                    </div>
                  </div>

                  {/* Quick Agent Actions Bar */}
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="font-bold text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>Operational Controls</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setIsAssignTaskModalOpen(true)}
                        className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Assign Project / Task</span>
                      </button>

                      <button
                        onClick={() => setIsNoteModalOpen(true)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>Add Internal Note</span>
                      </button>

                      {!selectedClient.workplaceActivated ? (
                        <button
                          onClick={() => handleActivateWorkplace(selectedClient.id)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Activate Workplace</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsSuspendModalOpen(true)}
                          className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 border border-rose-800/60 rounded-xl font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Suspend Access</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Internal Supervisor Notes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                        Agent Supervisor Notes & Timeline
                      </h4>
                      <button
                        onClick={() => setIsNoteModalOpen(true)}
                        className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <Plus className="w-3 h-3" /> Add Note
                      </button>
                    </div>

                    {(!selectedClient.internalNotes || selectedClient.internalNotes.length === 0) ? (
                      <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-slate-500 text-center">
                        No supervisor notes recorded for this client yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedClient.internalNotes.map((note, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-300 leading-relaxed font-mono text-[11px]"
                          >
                            {note}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tasks tab */}
              {activeClientTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">Client Assigned Tasks & Deliverables</h4>
                      <p className="text-slate-400 text-[11px]">
                        Review client milestone deliverables and approve completed outputs
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAssignTaskModalOpen(true)}
                      className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl font-bold flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Assign New Task</span>
                    </button>
                  </div>

                  {jobs.filter((j) => j.assignedClientId === selectedClient.id || j.assignedClient === selectedClient.name).length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800">
                      No jobs or tasks assigned to this client yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {jobs
                        .filter((j) => j.assignedClientId === selectedClient.id || j.assignedClient === selectedClient.name)
                        .map((j) => (
                          <div
                            key={j.id}
                            className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <div className="font-bold text-white text-sm">{j.title}</div>
                              <div className="text-slate-400 text-xs">
                                Category: {j.categoryName} · Deadline: {new Date(j.deadline).toLocaleDateString()}
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="font-mono font-bold text-emerald-400 text-sm">
                                {j.paymentAmount.toLocaleString()} KES
                              </span>
                              <div className="text-[10px] text-slate-400 capitalize">{j.status}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sessions tab */}
              {activeClientTab === 'sessions' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-white">Attendance Sessions & Work Activity</h4>
                    <p className="text-slate-400 text-[11px]">
                      Verified active working hours and supervision records
                    </p>
                  </div>

                  {sessions.filter((s) => s.clientId === selectedClient.id).length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800">
                      No logged work sessions for this client yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessions
                        .filter((s) => s.clientId === selectedClient.id)
                        .map((sess) => (
                          <div
                            key={sess.id}
                            className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between gap-4"
                          >
                            <div>
                              <div className="font-bold text-white flex items-center gap-2">
                                <span>{sess.taskDescription}</span>
                                {sess.status === 'RUNNING' && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                    Live
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-400 text-[11px] mt-0.5">
                                Started: {new Date(sess.startTime).toLocaleString()} · Duration: {sess.durationMinutes} mins
                              </div>
                            </div>

                            <div>
                              {sess.verifiedBySupervisor ? (
                                <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                                </span>
                              ) : (
                                <span className="text-slate-500 text-[11px]">Pending verification</span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Contract tab */}
              {activeClientTab === 'contracts' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-white">Active Employment Contract</h4>
                    <p className="text-slate-400 text-[11px]">
                      Full terms of service, working hours, and compensation structure
                    </p>
                  </div>

                  {(() => {
                    const c = contracts.find((cnt) => cnt.clientId === selectedClient.id);
                    if (!c) {
                      return (
                        <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800">
                          No active monthly contract record registered.
                        </div>
                      );
                    }
                    return (
                      <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-slate-400 text-[11px]">Monthly Salary</div>
                            <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                              {c.monthlySalary.toLocaleString()} KES
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-[11px]">Department</div>
                            <div className="text-base font-bold text-white mt-0.5">{c.department}</div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-[11px]">Supervisor</div>
                            <div className="text-base font-bold text-white mt-0.5">{c.supervisorAgentName}</div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-[11px]">Working Hours</div>
                            <div className="text-white font-medium mt-0.5">{c.workingHours}</div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-[11px]">Working Days</div>
                            <div className="text-white font-medium mt-0.5">{c.workingDays}</div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-[11px]">Contract Period</div>
                            <div className="text-white font-medium mt-0.5">
                              {c.startDate} to {c.endDate}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800/80">
                          <div className="text-slate-400 text-[11px] mb-1">Defined Responsibilities:</div>
                          <p className="text-slate-200 leading-relaxed font-mono text-[11px]">
                            {c.responsibilities}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Payroll tab */}
              {activeClientTab === 'payroll' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-white">Monthly Payroll Statement</h4>
                    <p className="text-slate-400 text-[11px]">
                      Client monthly disbursement history and payslips
                    </p>
                  </div>

                  {payrolls.filter((p) => p.clientId === selectedClient.id).length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800">
                      No payroll records generated for this client yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {payrolls
                        .filter((p) => p.clientId === selectedClient.id)
                        .map((p) => (
                          <div
                            key={p.id}
                            className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between gap-4"
                          >
                            <div>
                              <div className="font-bold text-white text-sm">{p.month} Payroll</div>
                              <div className="text-slate-400 text-xs">
                                Basic: {p.basicSalary.toLocaleString()} KES · Net:{' '}
                                <span className="font-mono text-emerald-400 font-bold">
                                  {p.netPayment.toLocaleString()} KES
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span
                                className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                                  p.status === 'PAID'
                                    ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                                    : p.status === 'APPROVED'
                                    ? 'bg-sky-950 text-sky-400 border-sky-500/30'
                                    : 'bg-amber-950 text-amber-400 border-amber-500/30'
                                }`}
                              >
                                {p.status}
                              </span>
                              <div className="text-[10px] text-slate-400 mt-1">Ref: {p.transactionReference}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {isAssignTaskModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <span>Assign Task to {selectedClient.name}</span>
              </h3>
              <button
                onClick={() => setIsAssignTaskModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClientTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Daily Customer Support Ticket Resolution Batch #4"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Instructions & Milestones</label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Provide explicit expectations and deliverables for the client to complete..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Task Value (KES)</label>
                  <input
                    type="number"
                    value={taskPayout}
                    onChange={(e) => setTaskPayout(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
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

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignTaskModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Assign Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Internal Note Modal */}
      {isNoteModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <span>Add Internal Supervisor Note</span>
              </h3>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <p className="text-slate-400">
                Notes are preserved in the client's supervisory timeline and are visible to other managing agents and platform admins.
              </p>
              <textarea
                rows={4}
                value={internalNoteText}
                onChange={(e) => setInternalNoteText(e.target.value)}
                placeholder="e.g. Client requested 1-day extension on quarterly report; approved by agent Esther."
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddInternalNote}
                disabled={actionLoading || !internalNoteText.trim()}
                className="px-5 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl font-bold flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Note</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {isSuspendModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>Suspend Client Workplace</span>
              </h3>
              <button
                onClick={() => setIsSuspendModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3 text-slate-300">
              <p>
                Suspending <strong className="text-white">{selectedClient.name}</strong> will temporarily restrict their ability to log work sessions and submit deliverable milestones until reactivated.
              </p>
              <div>
                <label className="block text-slate-400 mb-1">Reason for Suspension</label>
                <input
                  type="text"
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="e.g. Identity verification review or contractual hold"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setIsSuspendModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendWorkplace}
                disabled={actionLoading}
                className="px-5 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Suspension</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
