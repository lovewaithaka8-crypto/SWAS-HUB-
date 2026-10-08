import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.ts';
import { Client, MonthlyContract, ClientWorkSession, User } from '../../types/index.ts';
import {
  Building,
  UserCheck,
  UserPlus,
  Shield,
  ShieldAlert,
  Edit2,
  FileText,
  Clock,
  Calendar,
  CreditCard,
  Briefcase,
  Search,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Loader2,
  X,
  Plus
} from 'lucide-react';

interface Props {
  onPreviewClientWorkplace: (clientId: string) => void;
}

export const AdminMonthlyClients: React.FC<Props> = ({ onPreviewClientWorkplace }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<MonthlyContract[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  // Selected client detail drawer / modal
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientContracts, setClientContracts] = useState<MonthlyContract[]>([]);
  const [clientSessions, setClientSessions] = useState<ClientWorkSession[]>([]);

  // Assign agent modal
  const [isAssignAgentOpen, setIsAssignAgentOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  // Create contract modal
  const [isCreateContractOpen, setIsCreateContractOpen] = useState(false);
  const [contractSalary, setContractSalary] = useState('35000');
  const [contractDept, setContractDept] = useState('Customer Support');
  const [contractHours, setContractHours] = useState('40 hrs/week (Mon-Fri 09:00 - 17:00 EAT)');
  const [contractDays, setContractDays] = useState('Monday - Friday');
  const [contractStartDate, setContractStartDate] = useState('2026-10-01');
  const [contractEndDate, setContractEndDate] = useState('2027-09-30');
  const [contractPaymentDate, setContractPaymentDate] = useState('2026-10-31');
  const [contractSupervisorId, setContractSupervisorId] = useState('');
  const [contractBonus, setContractBonus] = useState('3500');
  const [contractNotes, setContractNotes] = useState('Standard Tier-1 Monthly Contract.');
  const [isSubmittingContract, setIsSubmittingContract] = useState(false);

  // Create client organization modal
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('+254');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientDept, setNewClientDept] = useState('Customer Support');
  const [newClientSalary, setNewClientSalary] = useState('35000');
  const [newClientSupervisor, setNewClientSupervisor] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsRes, contractsRes, agentsRes] = await Promise.all([
        apiRequest<{ clients: Client[] }>('/api/clients'),
        apiRequest<{ contracts: MonthlyContract[] }>('/api/contracts'),
        apiRequest<{ agents: User[] }>('/api/agents'),
      ]);
      setClients(clientsRes.clients || []);
      setContracts(contractsRes.contracts || []);
      const allAgents = (agentsRes.agents || []).filter((a) => a.role === 'AGENT');
      setAgents(allAgents);
      if (allAgents.length > 0 && !contractSupervisorId) {
        setContractSupervisorId(allAgents[0].id);
        setNewClientSupervisor(allAgents[0].id);
      }
    } catch (err) {
      console.error('Failed to load clients and contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenClientDrawer = async (clt: Client) => {
    setSelectedClient(clt);
    try {
      const [ctrRes, sessRes] = await Promise.all([
        apiRequest<{ contracts: MonthlyContract[] }>(`/api/contracts?clientId=${clt.id}`),
        apiRequest<{ sessions: ClientWorkSession[] }>(`/api/work-sessions?clientId=${clt.id}`),
      ]);
      setClientContracts(ctrRes.contracts || []);
      setClientSessions(sessRes.sessions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActivation = async (clt: Client) => {
    try {
      if (clt.status === 'ACTIVE') {
        const reason = prompt('Enter reason for suspending client workplace:', 'Administrative review');
        if (!reason) return;
        await apiRequest(`/api/clients/${clt.id}/suspend`, {
          method: 'POST',
          body: JSON.stringify({ reason }),
        });
      } else {
        await apiRequest(`/api/clients/${clt.id}/activate`, {
          method: 'POST',
        });
      }
      await fetchData();
      if (selectedClient?.id === clt.id) {
        const updated = await apiRequest<{ client: Client }>(`/api/clients/${clt.id}`);
        setSelectedClient(updated.client);
      }
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleAssignSupervisor = async () => {
    if (!selectedClient || !selectedAgentId) return;
    const targetAgent = agents.find((a) => a.id === selectedAgentId);
    if (!targetAgent) return;
    try {
      await apiRequest(`/api/clients/${selectedClient.id}/assign-agent`, {
        method: 'POST',
        body: JSON.stringify({
          agentId: targetAgent.id,
          agentName: targetAgent.name,
        }),
      });
      setIsAssignAgentOpen(false);
      await fetchData();
      const updated = await apiRequest<{ client: Client }>(`/api/clients/${selectedClient.id}`);
      setSelectedClient(updated.client);
    } catch (err: any) {
      alert(err.message || 'Failed to assign supervisor');
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setIsSubmittingContract(true);
    const supervisor = agents.find((a) => a.id === contractSupervisorId) || agents[0];
    try {
      await apiRequest('/api/contracts', {
        method: 'POST',
        body: JSON.stringify({
          clientId: selectedClient.id,
          clientName: selectedClient.name,
          clientEmail: selectedClient.email,
          department: contractDept,
          monthlySalary: Number(contractSalary),
          currency: 'KES',
          status: 'ACTIVE',
          startDate: contractStartDate,
          endDate: contractEndDate,
          nextPaymentDate: contractPaymentDate,
          paymentCycle: 'MONTHLY',
          workingHours: contractHours,
          workingDays: contractDays,
          responsibilities: [
            'Manage customer support and queue escalations within 15-minute SLA',
            'Submit verified weekly shift activity logs',
            'Coordinate quality sign-offs with supervisor',
          ],
          supervisorAgentId: supervisor?.id || 'usr-agent-esther',
          supervisorAgentName: supervisor?.name || 'Esther Njoki',
          bonuses: Number(contractBonus),
          deductions: 0,
          internalNotes: contractNotes,
        }),
      });
      setIsCreateContractOpen(false);
      await fetchData();
      handleOpenClientDrawer(selectedClient);
    } catch (err: any) {
      alert(err.message || 'Contract creation failed');
    } finally {
      setIsSubmittingContract(false);
    }
  };

  const handleCreateNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sup = agents.find((a) => a.id === newClientSupervisor);
      const res = await apiRequest<{ client: Client }>('/api/clients', {
        method: 'POST',
        body: JSON.stringify({
          name: newClientName,
          email: newClientEmail,
          phone: newClientPhone,
          company: newClientCompany || `${newClientName} Workplace`,
          department: newClientDept,
          monthlySalary: Number(newClientSalary),
          supervisorAgentId: sup?.id || 'usr-agent-esther',
          supervisorAgentName: sup?.name || 'Esther Njoki',
          status: 'ACTIVE',
          workplaceActivated: true,
          contractStatus: 'ACTIVE',
          contractStartDate: '2026-10-01',
          contractEndDate: '2027-09-30',
          nextPaymentDate: '2026-10-31',
          workingHours: '40 hrs/week (Mon-Fri 09:00 - 17:00 EAT)',
          workingDays: 'Monday - Friday',
          responsibilities: [
            'Manage high-priority support ticket queues',
            'Deliver weekly verified activity logs',
          ],
        }),
      });

      // Also create contract
      if (res.client) {
        await apiRequest('/api/contracts', {
          method: 'POST',
          body: JSON.stringify({
            clientId: res.client.id,
            clientName: res.client.name,
            clientEmail: res.client.email,
            department: newClientDept,
            monthlySalary: Number(newClientSalary),
            currency: 'KES',
            status: 'ACTIVE',
            startDate: '2026-10-01',
            endDate: '2027-09-30',
            nextPaymentDate: '2026-10-31',
            paymentCycle: 'MONTHLY',
            workingHours: '40 hrs/week (Mon-Fri 09:00 - 17:00 EAT)',
            workingDays: 'Monday - Friday',
            responsibilities: [
              'Execute assigned department deliverables and ticket SLA queues',
              'Submit verified shift logs to supervisor',
            ],
            supervisorAgentId: sup?.id || 'usr-agent-esther',
            supervisorAgentName: sup?.name || 'Esther Njoki',
            bonuses: 3500,
            deductions: 0,
            internalNotes: 'Initial monthly employment contract.',
          }),
        });
      }

      setIsCreateClientOpen(false);
      setNewClientName('');
      setNewClientEmail('');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Creation failed');
    }
  };

  const filteredClients = clients
    .filter((c) => {
      if (statusFilter === 'ACTIVE') return c.status === 'ACTIVE';
      if (statusFilter === 'SUSPENDED') return c.status === 'SUSPENDED';
      return true;
    })
    .filter(
      (c) =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.department?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" />
            <span>CLIENT & CONTRACT COMMAND</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
            Client Workplace & Monthly Contract Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervise client monthly retainers, assign operations supervisors, review work sessions, and inspect live client workplaces.
          </p>
        </div>

        <button
          onClick={() => setIsCreateClientOpen(true)}
          className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Monthly Client Workplace</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client, email, department..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === 'ALL' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({clients.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === 'ACTIVE' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('SUSPENDED')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === 'SUSPENDED' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Suspended
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <strong>{filteredClients.length}</strong> clients
        </div>
      </div>

      {/* Clients Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((clt) => (
          <div
            key={clt.id}
            className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 p-6 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={clt.avatarUrl || '/src/assets/images/agent_avatar_sarah_1791395183231.jpg'}
                    alt={clt.name}
                    className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-500/20"
                  />
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors">
                      {clt.name}
                    </h3>
                    <div className="text-[11px] text-slate-400">{clt.department || 'Operations'}</div>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                  clt.status === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {clt.status}
                </span>
              </div>

              {/* Compensation and Supervisor details */}
              <div className="mt-4 p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Monthly Contract Pay:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    KES {(clt.monthlySalary || 35000).toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Next Payment:</span>
                  <span className="font-mono text-slate-200">{clt.nextPaymentDate || '31 Oct 2026'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Supervisor:</span>
                  <span className="font-semibold text-sky-400">{clt.supervisorAgentName || 'Esther Njoki'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800/80">
              <button
                onClick={() => onPreviewClientWorkplace(clt.id)}
                className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-xl text-xs border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5"
                title="Preview client portal exactly as they see it"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Workplace</span>
              </button>

              <button
                onClick={() => handleOpenClientDrawer(clt)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors"
                title="Inspect client contract & logs"
              >
                <span>Manage</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== MANAGE CLIENT MODAL / DRAWER ==================== */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <img
                  src={selectedClient.avatarUrl || '/src/assets/images/agent_avatar_sarah_1791395183231.jpg'}
                  alt={selectedClient.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/30"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{selectedClient.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      selectedClient.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {selectedClient.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedClient.department} • Contact: {selectedClient.phone} • {selectedClient.email}
                  </p>
                </div>
              </div>

              <button onClick={() => setSelectedClient(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => onPreviewClientWorkplace(selectedClient.id)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Full Client Workplace</span>
              </button>

              <button
                onClick={() => setIsAssignAgentOpen(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4 text-sky-400" />
                <span>Reassign Supervisor Lead</span>
              </button>

              <button
                onClick={() => setIsCreateContractOpen(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Create / Renew Contract</span>
              </button>

              <button
                onClick={() => handleToggleActivation(selectedClient)}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 ${
                  selectedClient.status === 'ACTIVE'
                    ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                }`}
              >
                {selectedClient.status === 'ACTIVE' ? (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    <span>Suspend Client Workplace</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Reactivate Workplace</span>
                  </>
                )}
              </button>
            </div>

            {/* Contract & Financial Summary */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="font-bold text-white text-sm">Monthly Employment Contract Terms</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">
                  KES {(selectedClient.monthlySalary || 35000).toLocaleString()} / Month
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-500">Supervising Manager:</span>
                  <div className="font-bold text-white mt-0.5">{selectedClient.supervisorAgentName || 'Esther Njoki'}</div>
                </div>
                <div>
                  <span className="text-slate-500">Working Hours:</span>
                  <div className="font-medium text-slate-300 mt-0.5">{selectedClient.workingHours || '40 hrs/week'}</div>
                </div>
                <div>
                  <span className="text-slate-500">Next Payout:</span>
                  <div className="font-mono text-slate-300 mt-0.5">{selectedClient.nextPaymentDate || '31 Oct 2026'}</div>
                </div>
              </div>

              <div>
                <span className="text-slate-500">Responsibilities:</span>
                <ul className="mt-1 list-disc list-inside space-y-1 text-slate-300">
                  {(selectedClient.responsibilities || ['Customer Support triage', 'Resolution SLAs']).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recent Work Activity Sessions */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-white text-sm">Recent Work Shift Activity ({clientSessions.length})</h4>
              </div>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60 max-h-48 overflow-y-auto">
                {clientSessions.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No shift sessions logged yet.</div>
                ) : (
                  clientSessions.map((sess) => (
                    <div key={sess.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-900/40">
                      <div>
                        <div className="font-bold text-white">{sess.taskDescription}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {sess.date} • {sess.durationMinutes} mins logged
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        sess.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {sess.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ASSIGN SUPERVISOR MODAL ==================== */}
      {isAssignAgentOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Assign Supervisor for {selectedClient.name}</h3>
              <button onClick={() => setIsAssignAgentOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              The assigned agent supervisor will monitor shifts, review deliverables, verify attendance, and receive direct escalation notifications.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Select Accredited Agent Supervisor</label>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-hidden"
              >
                <option value="">-- Choose Agent Lead --</option>
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} ({ag.rolePreset || 'Agent Lead'} • {ag.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <button
                onClick={handleAssignSupervisor}
                disabled={!selectedAgentId}
                className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>Save Supervisor Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CREATE / RENEW CONTRACT MODAL ==================== */}
      {isCreateContractOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-100 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                Create / Renew Monthly Contract: {selectedClient.name}
              </h3>
              <button onClick={() => setIsCreateContractOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Monthly Salary (KES)</label>
                  <input
                    type="number"
                    required
                    value={contractSalary}
                    onChange={(e) => setContractSalary(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={contractDept}
                    onChange={(e) => setContractDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={contractStartDate}
                    onChange={(e) => setContractStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={contractEndDate}
                    onChange={(e) => setContractEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Supervisor Agent</label>
                <select
                  value={contractSupervisorId}
                  onChange={(e) => setContractSupervisorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Working Hours Schedule</label>
                <input
                  type="text"
                  required
                  value={contractHours}
                  onChange={(e) => setContractHours(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingContract}
                  className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmittingContract ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Contract Terms</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== CREATE NEW CLIENT WORKPLACE MODAL ==================== */}
      {isCreateClientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-100 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Add New Monthly Client Workplace</h3>
              <button onClick={() => setIsCreateClientOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewClient} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Jane Wanjiku"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="jane.wanjiku@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">M-Pesa / Phone</label>
                  <input
                    type="text"
                    required
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+254 728 554433"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={newClientDept}
                    onChange={(e) => setNewClientDept(e.target.value)}
                    placeholder="Customer Support"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Monthly Salary (KES)</label>
                  <input
                    type="number"
                    required
                    value={newClientSalary}
                    onChange={(e) => setNewClientSalary(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Supervising Operations Agent</label>
                <select
                  value={newClientSupervisor}
                  onChange={(e) => setNewClientSupervisor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <span>Activate Client Workplace & Contract</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
