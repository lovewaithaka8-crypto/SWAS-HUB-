import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.ts';
import { User, Category } from '../../types/index.ts';
import {
  UserPlus,
  Search,
  Shield,
  ShieldAlert,
  Smartphone,
  Mail,
  Briefcase,
  CheckCircle2,
  XCircle,
  MoreVertical,
  X,
  Loader2,
  Key,
  ShieldCheck
} from 'lucide-react';

export const AdminAgents: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Create Agent Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+254');
  const [newPassword, setNewPassword] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAgentsAndCategories = async () => {
    try {
      const [agentsRes, catRes] = await Promise.all([
        apiRequest<{ agents: any[] }>('/api/agents'),
        apiRequest<{ categories: Category[] }>('/api/categories'),
      ]);
      setAgents(agentsRes.agents || []);
      setCategories(catRes.categories || []);
      if (catRes.categories?.length > 0) {
        setNewCategory(catRes.categories[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentsAndCategories();
  }, []);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
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
      setIsCreateModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('+254');
      setNewPassword('');
      await fetchAgentsAndCategories();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create agent account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (agentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await apiRequest(`/api/agents/${agentId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchAgentsAndCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to update agent status');
    }
  };

  const handleAssignCategory = async (agentId: string, categoryId: string) => {
    try {
      await apiRequest(`/api/agents/${agentId}/category`, {
        method: 'PATCH',
        body: JSON.stringify({ categoryId }),
      });
      await fetchAgentsAndCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to assign category');
    }
  };

  const filteredAgents = agents.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.phone && a.phone.includes(searchQuery));
    const matchesCategory = selectedCategory === 'ALL' || a.categoryId === selectedCategory;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header & Create Agent Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Accredited Agents Directory</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage worker status, category assignments, credentials, and performance tracking.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/15 flex items-center gap-2 transition-all self-start sm:self-auto hover:scale-[1.02]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision Agent Account</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-800/90 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents by name, email, phone..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-hidden"
          >
            <option value="ALL">All Workplace Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Agents</option>
            <option value="PENDING_PAYMENT">Pending Fee</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading accredited agent records...</div>
        ) : filteredAgents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No agents found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800/80 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Agent Profile</th>
                  <th className="px-6 py-4">Contact & M-Pesa</th>
                  <th className="px-6 py-4">Assigned Department</th>
                  <th className="px-6 py-4">Projects Ratio</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={agent.avatarUrl || '/src/assets/images/agent_avatar_sarah_1791395183231.jpg'}
                          alt={agent.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700 shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-bold text-white text-sm">{agent.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{agent.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-slate-200">{agent.email}</div>
                      <div className="text-slate-400 font-mono text-[11px] mt-0.5">{agent.mpesaNumber || agent.phone}</div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={agent.categoryId || ''}
                        onChange={(e) => handleAssignCategory(agent.id, e.target.value)}
                        className="text-xs py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-emerald-500"
                      >
                        <option value="">Unassigned</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-6 py-4 font-mono">
                      <span className="font-bold text-emerald-400">{agent.completedJobs || 0}</span>
                      <span className="text-slate-400"> / {agent.totalAssignedJobs || 0} done</span>
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-emerald-400 text-sm">
                      {(agent.balance || 0).toLocaleString()} KES
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          agent.status === 'ACTIVE'
                            ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
                            : agent.status === 'PENDING_PAYMENT'
                            ? 'text-amber-400 bg-amber-950/60 border-amber-800/60'
                            : 'text-rose-400 bg-rose-950/60 border-rose-800/60'
                        }`}
                      >
                        {agent.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {agent.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleToggleStatus(agent.id, agent.status)}
                          className="px-3 py-1.5 border border-rose-800/60 text-rose-400 hover:bg-rose-950/40 rounded-xl text-xs transition-colors"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(agent.id, agent.status)}
                          className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl font-bold text-xs transition-colors"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Provision Agent Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
            <div className="p-6 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">Provision New Agent Account</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Dennis Kiptoo"
                  className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="dennis@example.com"
                    className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone / M-Pesa</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+254 712 000000"
                    className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Set initial password"
                  className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Workplace Department</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-hidden"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-slate-400">
                Accounts provisioned manually by Operations are pre-activated with full Agent workplace privileges.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create & Activate Agent Account</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
