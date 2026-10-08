import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  LayoutDashboard,
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
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Settings
} from 'lucide-react';

export type AgentTabType =
  | 'overview'
  | 'my-clients'
  | 'applications'
  | 'workplaces'
  | 'work'
  | 'tasks'
  | 'submissions'
  | 'earnings'
  | 'payment-status'
  | 'messages'
  | 'support'
  | 'documents'
  | 'notifications'
  | 'reports'
  | 'activity'
  | 'profile';

interface Props {
  activeTab: AgentTabType;
  onSelectTab: (tab: AgentTabType) => void;
  badges?: {
    clientsAttention?: number;
    tasksAwaitingReview?: number;
    pendingSubmissions?: number;
    openTickets?: number;
    unreadMessages?: number;
    notifications?: number;
    assignedClients?: number;
  };
}

export const ModernAgentCommandRail: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  badges = {},
}) => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navGroups = [
    {
      group: 'OVERVIEW',
      items: [
        {
          id: 'overview' as const,
          label: 'Dashboard',
          icon: LayoutDashboard,
          badge: null,
          description: 'Live alerts, queue stats & metrics',
        },
      ],
    },
    {
      group: 'CLIENT MANAGEMENT',
      items: [
        {
          id: 'my-clients' as const,
          label: 'My Clients',
          icon: Users,
          badge: badges.assignedClients || null,
          badgeColor: 'bg-emerald-400 text-slate-950 font-bold',
          description: 'Assigned clients directory & daily operations',
        },
        {
          id: 'applications' as const,
          label: 'Client Applications',
          icon: UserPlus,
          badge: badges.clientsAttention || null,
          badgeColor: 'bg-amber-400 text-slate-950 font-bold',
          description: 'Onboarding review, verification & KYC',
        },
        {
          id: 'workplaces' as const,
          label: 'Client Workplaces',
          icon: Building,
          badge: null,
          description: 'Activation status, shifts & monitoring',
        },
      ],
    },
    {
      group: 'WORK & TASKS',
      items: [
        {
          id: 'work' as const,
          label: 'Work & Projects',
          icon: Briefcase,
          badge: null,
          description: 'Assign work, set deadlines & instructions',
        },
        {
          id: 'tasks' as const,
          label: 'Tasks',
          icon: CheckSquare,
          badge: badges.tasksAwaitingReview || null,
          badgeColor: 'bg-indigo-400 text-slate-950 font-bold',
          description: 'Task lifecycle & client task tracking',
        },
        {
          id: 'submissions' as const,
          label: 'Submissions',
          icon: UploadCloud,
          badge: badges.pendingSubmissions || null,
          badgeColor: 'bg-purple-400 text-white font-bold',
          description: 'Review deliverables, approve & request corrections',
        },
      ],
    },
    {
      group: 'FINANCE & EARNINGS',
      items: [
        {
          id: 'earnings' as const,
          label: 'Earnings',
          icon: Wallet,
          badge: null,
          description: 'Client monthly pay & agent earnings',
        },
        {
          id: 'payment-status' as const,
          label: 'Payment Status',
          icon: CreditCard,
          badge: null,
          description: 'Monthly payroll statements & M-Pesa tracking',
        },
      ],
    },
    {
      group: 'COMMUNICATIONS',
      items: [
        {
          id: 'messages' as const,
          label: 'Messages',
          icon: MessageSquare,
          badge: badges.unreadMessages || null,
          badgeColor: 'bg-sky-400 text-slate-950 font-bold',
          description: 'Direct client communication & threads',
        },
        {
          id: 'support' as const,
          label: 'Client Support',
          icon: Headphones,
          badge: badges.openTickets || null,
          badgeColor: 'bg-rose-400 text-slate-950 font-bold',
          description: 'Support tickets & admin escalation',
        },
        {
          id: 'documents' as const,
          label: 'Client Documents',
          icon: FolderOpen,
          badge: null,
          description: 'Verify, request and manage documents',
        },
        {
          id: 'notifications' as const,
          label: 'Notifications',
          icon: Bell,
          badge: badges.notifications || null,
          badgeColor: 'bg-amber-400 text-slate-950 font-bold',
          description: 'Real-time operational alerts',
        },
      ],
    },
    {
      group: 'INTELLIGENCE & AUDIT',
      items: [
        {
          id: 'reports' as const,
          label: 'My Reports',
          icon: BarChart3,
          badge: null,
          description: 'Client work & performance reports',
        },
        {
          id: 'activity' as const,
          label: 'My Activity / Audit',
          icon: Activity,
          badge: null,
          description: 'Immutable record of agent actions',
        },
        {
          id: 'profile' as const,
          label: 'Profile & Settings',
          icon: UserCheck,
          badge: null,
          description: 'Personal info, M-Pesa phone & security',
        },
      ],
    },
  ];

  return (
    <aside
      className={`relative shrink-0 transition-all duration-300 ease-in-out border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-2xl z-20 flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64 lg:w-72'
      }`}
    >
      {/* Top Header Rail info */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-emerald-950/50 shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="truncate">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Workplace Command Rail</span>
              </div>
              <div className="text-sm font-extrabold text-white tracking-tight truncate">
                Agent Workplace
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-emerald-950/50">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/80 text-slate-400 hover:text-white transition-all shrink-0 ${
            isCollapsed ? 'mx-auto mt-2' : ''
          }`}
          title={isCollapsed ? 'Expand Command Rail' : 'Collapse Command Rail'}
          aria-label={isCollapsed ? 'Expand Command Rail' : 'Collapse Command Rail'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 custom-scrollbar">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pt-2 pb-1 text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
                {group.group}
              </div>
            )}

            {group.items.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center transition-all rounded-xl relative ${
                      isCollapsed
                        ? 'justify-center p-3'
                        : 'justify-between px-3 py-2'
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-950/20 font-semibold'
                        : 'text-slate-400 hover:bg-slate-900/80 hover:text-white border border-transparent'
                    }`}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-400 rounded-r-full shadow-sm shadow-emerald-400"></span>
                    )}

                    <div className="flex items-center gap-3 truncate">
                      <IconComponent
                        className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="text-xs tracking-tight truncate">{item.label}</span>
                      )}
                    </div>

                    {!isCollapsed && item.badge && item.badge > 0 && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          item.badgeColor || 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Popover tooltip when collapsed */}
                    {isCollapsed && (
                      <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col bg-slate-900 border border-slate-700/80 text-white rounded-xl py-2 px-3 shadow-2xl z-50 whitespace-nowrap min-w-[150px]">
                        <span className="text-xs font-bold text-white flex items-center justify-between gap-2">
                          <span>{item.label}</span>
                          {item.badge && item.badge > 0 && (
                            <span className="text-[9px] font-mono bg-emerald-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                          {item.description}
                        </span>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* User profile footer */}
      {!isCollapsed && user && (
        <div className="p-3 m-3 bg-slate-900/70 border border-slate-800 rounded-2xl flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="truncate text-left">
              <div className="text-xs font-bold text-white truncate">{user.name}</div>
              <div className="text-[10px] font-mono text-emerald-400 truncate">
                {user.balance?.toLocaleString()} KES
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('profile')}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            title="Profile & Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </aside>
  );
};
