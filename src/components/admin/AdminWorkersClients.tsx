import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.ts';
import { User, Category, Client } from '../../types/index.ts';
import {
  Users,
  Building,
  UserPlus,
  Search,
  Shield,
  ShieldAlert,
  Smartphone,
  Mail,
  Award,
  CheckCircle2,
  XCircle,
  MoreVertical,
  X,
  Loader2,
  Key,
  Star,
  AlertTriangle
} from 'lucide-react';

interface Props {
  initialCreateOpen?: boolean;
}

export const AdminWorkersClients: React.FC<Props> = ({ initialCreateOpen = false }) => {
  const [viewTab, setViewTab] = useState<'WORKERS' | 'CLIENTS' | 'LEVELS'>('WORKERS');
  const [agents, setAgents] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Create Worker Modal
  const [isCreateWorkerOpen, setIsCreateWorkerOpen] = useState(initialCreateOpen);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+254');
  const [newPassword, setNewPassword] = useState('Swashub2026!');
  const [newCategory, setNewCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create Client Modal
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientPhone, setClientPhone] = useState('+254');

  const fetchData = async () => {
    try {
      const [agentsRes, clientsRes, catsRes] = await Promise.all([
        apiRequest<{ agents: any[] }>('/api/agents'),
        apiRequest<{ clients: Client[] }>('/api/clients').catch(() => ({ clients: [] })),
        apiRequest<{ categories: Category[] }>('/api/categories'),
      ]);
      setAgents(agentsRes.agents || []);
      setClients(clientsRes.clients || []);
      setCategories(catsRes.categories || []);
      if (catsRes.categories?.length > 0 && !newCategory) {
        setNewCategory(catsRes.categories[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleWorkerStatus = async (agentId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await apiRequest(`/api/agents/${agentId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest('/api/agents', {
        method: 'POST',
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          phone: newPhone,
          password: newPassword,
          categoryId: newCategory,
        }),
      });
      setIsCreateWorkerOpen(false);
      setNewName('');
      setNewEmail('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Worker creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest('/api/clients', {
        method: 'POST',
        body: JSON.stringify({
          name: clientName,
          email: clientEmail,
          company: clientCompany,
          phone: clientPhone,
          status: 'ACTIVE',
        }),
      });
      setIsCreateClientOpen(false);
      setClientName('');
      setClientEmail('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Client creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredWorkers = agents.filter(
    (a) =>
      a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.phone?.includes(searchQuery)
  );

  const filteredClients = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Worker & Client Directory</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage worker rankings, accreditation tiers, suspensions, client spending accounts, and verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {viewTab === 'WORKERS' ? (
            <button
              onClick={() => setIsCreateWorkerOpen(true)}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Accredit Worker</span>
            </button>
          ) : (
            <button
              onClick={() => setIsCreateClientOpen(true)}
              className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Building className="w-4 h-4" />
              <span>Add Client Organization</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium">
          <button
            onClick={() => setViewTab('WORKERS')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              viewTab === 'WORKERS'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Workers / Agents ({agents.length})</span>
          </button>
          <button
            onClick={() => setViewTab('CLIENTS')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              viewTab === 'CLIENTS'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-sky-400" />
            <span>Clients ({clients.length})</span>
          </button>
          <button
            onClick={() => setViewTab('LEVELS')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              viewTab === 'LEVELS'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Worker Levels & Rewards</span>
          </button>
        </div>

        {/* Search */}
        {viewTab !== 'LEVELS' && (
          <div className="relative w-64 hidden sm:block">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden"
            />
          </div>
        )}
      </div>

      {/* 1. WORKERS TABLE */}
      {viewTab === 'WORKERS' && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-medium uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Worker / Agent</th>
                  <th className="px-6 py-3.5">Contact & M-Pesa</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Completion Rate</th>
                  <th className="px-6 py-3.5">Balance</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={worker.avatarUrl || '/src/assets/images/agent_avatar_sarah_1791395183231.jpg'}
                          alt={worker.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-bold text-white">{worker.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{worker.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-slate-300">{worker.email}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{worker.mpesaNumber || worker.phone}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-medium text-[11px]">
                        {worker.categoryName || 'General'}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono">
                      <span className="font-bold text-emerald-400">{worker.completedJobs || 0}</span>
                      <span className="text-slate-500"> / {worker.totalAssignedJobs || 0} delivered</span>
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                      {(worker.balance || 0).toLocaleString()} KES
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`text-[11px] font-semibold ${
                          worker.status === 'ACTIVE'
                            ? 'text-emerald-400'
                            : worker.status === 'SUSPENDED'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {worker.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleWorkerStatus(worker.id, worker.status)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                          worker.status === 'ACTIVE'
                            ? 'bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-800/40'
                            : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/40'
                        }`}
                      >
                        {worker.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. CLIENTS TABLE */}
      {viewTab === 'CLIENTS' && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-medium uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Client Organization</th>
                  <th className="px-6 py-3.5">Contact Details</th>
                  <th className="px-6 py-3.5">Projects Posted</th>
                  <th className="px-6 py-3.5">Total Spent (Escrow)</th>
                  <th className="px-6 py-3.5">Account Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredClients.map((clt) => (
                  <tr key={clt.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{clt.name}</div>
                      <div className="text-[11px] text-slate-400">{clt.company}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-slate-300">{clt.email}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{clt.phone}</div>
                    </td>

                    <td className="px-6 py-4 font-mono">
                      <span className="font-bold text-sky-400">{clt.jobsPostedCount}</span>
                      <span className="text-slate-500"> posted ({clt.completedJobsCount} finished)</span>
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                      {(clt.totalSpent || 0).toLocaleString()} KES
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-[11px] font-semibold text-emerald-400">
                        {clt.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold">
                        View Client Desk
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. WORKER LEVELS & REWARDS */}
      {viewTab === 'LEVELS' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="text-xs font-mono font-bold text-slate-400">LEVEL 1</div>
            <h3 className="font-bold text-white text-base">Beginner</h3>
            <p className="text-xs text-slate-400">Newly accredited agents awaiting first 5 task completions.</p>
            <div className="pt-2 text-[11px] text-slate-500 font-mono border-t border-slate-800">
              Min. 0 jobs · Standard queue
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="text-xs font-mono font-bold text-emerald-400">LEVEL 2</div>
            <h3 className="font-bold text-white text-base">Verified</h3>
            <p className="text-xs text-slate-400">5+ completed jobs with &gt; 90% quality approval.</p>
            <div className="pt-2 text-[11px] text-emerald-400 font-mono border-t border-slate-800">
              Eligible for 15,000 KES contracts
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="text-xs font-mono font-bold text-sky-400">LEVEL 3</div>
            <h3 className="font-bold text-white text-base">Skilled</h3>
            <p className="text-xs text-slate-400">20+ completed jobs with &gt; 95% on-time milestone delivery.</p>
            <div className="pt-2 text-[11px] text-sky-400 font-mono border-t border-slate-800">
              Priority queue auto-assignment
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="text-xs font-mono font-bold text-purple-400">LEVEL 4</div>
            <h3 className="font-bold text-white text-base">Expert</h3>
            <p className="text-xs text-slate-400">50+ completed jobs, zero dispute escalations.</p>
            <div className="pt-2 text-[11px] text-purple-400 font-mono border-t border-slate-800">
              Unlocked multi-department access
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-3">
            <div className="text-xs font-mono font-bold text-amber-400">LEVEL 5</div>
            <h3 className="font-bold text-white text-base">Elite Lead</h3>
            <p className="text-xs text-slate-400">Top 5% of platform talent. High-ticket enterprise assignments.</p>
            <div className="pt-2 text-[11px] text-amber-400 font-mono border-t border-slate-800">
              VIP Escrow release & 5% bonus
            </div>
          </div>
        </div>
      )}

      {/* Create Worker Modal */}
      {isCreateWorkerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-base text-white">Accredit Agent Directly</h3>
              <button onClick={() => setIsCreateWorkerOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorker} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Kelvin Kimani"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="kelvin@gmail.com"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Safaricom M-Pesa Phone</label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+254 712 345678"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-2xl shadow-lg transition-all"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <span>Accredit Agent Account</span>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Client Modal */}
      {isCreateClientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-base text-white">Add Client Organization</h3>
              <button onClick={() => setIsCreateClientOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Representative Name</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Mary Wambui"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Organization</label>
                <input
                  type="text"
                  required
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  placeholder="KCB Digital Payments Lab"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="payments@kcb.co.ke"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Direct Phone</label>
                <input
                  type="text"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+254 700 123456"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-2xl shadow-lg transition-all"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <span>Create Client Account</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
