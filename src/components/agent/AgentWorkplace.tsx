import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiRequest } from '../../lib/api.ts';
import { Job, Client, SupportTicket, Notification } from '../../types/index.ts';
import { AgentCommandHub } from './AgentCommandHub.tsx';
import { ClientWorkplace } from '../client/ClientWorkplace.tsx';
import { ModernAgentCommandRail, AgentTabType } from '../common/ModernAgentCommandRail.tsx';
import { ModernCommandDock } from '../common/ModernCommandDock.tsx';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const AgentWorkplace: React.FC = () => {
  const { user, currentView, setCurrentView } = useAuth();
  const [activeTab, setActiveTab] = useState<AgentTabType>('overview');
  const [previewClientId, setPreviewClientId] = useState<string | null>(null);

  // Badges data
  const [assignedJobs, setAssignedJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadBadges = async () => {
    try {
      const [jobsRes, clientsRes, ticketsRes, notifsRes] = await Promise.all([
        apiRequest<{ jobs: Job[] }>('/api/jobs').catch(() => ({ jobs: [] })),
        apiRequest<{ clients: Client[] }>('/api/clients').catch(() => ({ clients: [] })),
        apiRequest<{ tickets: SupportTicket[] }>('/api/support-tickets').catch(() => ({ tickets: [] })),
        apiRequest<{ notifications: Notification[] }>('/api/notifications').catch(() => ({ notifications: [] })),
      ]);
      setAssignedJobs(jobsRes.jobs || []);
      setClients(clientsRes.clients || []);
      setTickets(ticketsRes.tickets || []);
      setNotifications(notifsRes.notifications || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBadges();
  }, []);

  // Sync with currentView if changed from header
  useEffect(() => {
    if (currentView === 'agent-jobs') setActiveTab('work');
    else if (currentView === 'agent-clients') setActiveTab('my-clients');
    else if (currentView === 'agent-earnings') setActiveTab('earnings');
    else if (currentView === 'agent-support') setActiveTab('support');
    else if (currentView === 'agent-profile') setActiveTab('profile');
    else if (currentView === 'agent-dashboard') setActiveTab('overview');
  }, [currentView]);

  if (!user || user.role !== 'AGENT') {
    return (
      <div className="p-12 text-center text-xs text-rose-400 bg-rose-950/30 rounded-3xl max-w-md mx-auto my-12 border border-rose-800/50 backdrop-blur-xl">
        <AlertCircle className="w-8 h-8 mx-auto mb-3 text-rose-400" />
        <h3 className="font-bold text-sm text-white">Agent Workplace Restricted</h3>
        <p className="mt-1 text-slate-400">
          This portal is reserved for accredited agents. Please complete your registration fee or sign in to your agent account.
        </p>
      </div>
    );
  }

  // Calculate live badge numbers
  const myClients = clients.filter(
    (c) =>
      c.supervisorAgentId === user.id ||
      (c.supervisorAgentName && c.supervisorAgentName.toLowerCase().includes(user.name.toLowerCase()))
  );
  const clientsNeedingAttention = myClients.filter(
    (c) => c.status === 'REQUIRES_ATTENTION' || c.status === 'NEW' || c.status === 'UNDER_REVIEW'
  );
  const tasksAwaitingReview = assignedJobs.filter(
    (j) => j.status === 'SUBMITTED' || j.status === 'UNDER_REVIEW'
  );
  const openTickets = tickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED');
  const unreadNotifs = notifications.filter((n) => !n.read);

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Background radial lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-1/4 w-[600px] h-[350px] bg-emerald-500/8 blur-[140px] rounded-full"></div>
        <div className="absolute top-1/2 left-10 w-[500px] h-[350px] bg-sky-500/6 blur-[150px] rounded-full"></div>
      </div>

      {/* Modern Compact Glass Command Rail for Agent */}
      <ModernAgentCommandRail
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setPreviewClientId(null);
          setActiveTab(tab);
          if (tab === 'overview') setCurrentView('agent-dashboard');
          else if (tab === 'my-clients') setCurrentView('agent-clients');
          else if (tab === 'work') setCurrentView('agent-jobs');
          else if (tab === 'earnings') setCurrentView('agent-earnings');
          else if (tab === 'support') setCurrentView('agent-support');
          else if (tab === 'profile') setCurrentView('agent-profile');
        }}
        badges={{
          assignedClients: myClients.length,
          clientsAttention: clientsNeedingAttention.length,
          tasksAwaitingReview: tasksAwaitingReview.length,
          pendingSubmissions: tasksAwaitingReview.length,
          openTickets: openTickets.length,
          notifications: unreadNotifs.length,
        }}
      />

      {/* Main Agent Workplace Viewport */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto z-10 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto">
          {previewClientId ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPreviewClientId(null)}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Agent Command Hub</span>
                  </button>
                  <div className="h-4 w-px bg-slate-800"></div>
                  <span className="text-xs font-mono text-emerald-400">
                    Live Client Inspection Mode
                  </span>
                </div>
              </div>
              <ClientWorkplace overrideClientId={previewClientId} />
            </div>
          ) : (
            <AgentCommandHub
              activeTab={activeTab}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
              }}
              onPreviewClientWorkplace={(id) => setPreviewClientId(id)}
              onUpdateBadgeCount={loadBadges}
            />
          )}
        </div>
      </main>

      {/* Floating Modern Command Dock */}
      <ModernCommandDock
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setPreviewClientId(null);
          setActiveTab(tab as any);
        }}
        role="AGENT"
        badges={{
          clients: myClients.length > 0 ? myClients.length : undefined,
          jobs: tasksAwaitingReview.length > 0 ? tasksAwaitingReview.length : undefined,
          support: openTickets.length > 0 ? openTickets.length : undefined,
        }}
      />
    </div>
  );
};
