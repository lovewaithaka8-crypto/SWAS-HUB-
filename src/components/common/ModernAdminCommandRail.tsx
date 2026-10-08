import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building,
  CreditCard,
  Settings,
  ShieldAlert,
  Headphones,
  CheckCircle2,
  FolderKanban,
  FileText,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Smartphone,
  UserCheck,
  UserCircle,
  HelpCircle,
  Lock,
  Compass,
  ArrowRight,
  TrendingUp,
  Scale,
  Activity,
  Layers,
  Search
} from 'lucide-react';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingReviewsCount?: number;
  pendingPayoutsCount?: number;
  openTicketsCount?: number;
}

export const ModernAdminCommandRail: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  pendingReviewsCount = 0,
  pendingPayoutsCount = 0,
  openTicketsCount = 0,
}) => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedExpandedGroup, setCollapsedExpandedGroup] = useState<string | null>(null);

  // Group definitions matching modern command structure:
  // OPERATIONS, FINANCE, CONTROL, INTELLIGENCE, SYSTEM
  const sections = [
    {
      id: 'OPERATIONS',
      title: 'OPERATIONS & WORKPLACES',
      badge: null,
      items: [
        {
          id: 'overview',
          label: 'Dashboard',
          icon: LayoutDashboard,
          badge: null,
          description: 'Platform KPIs & active operations',
        },
        {
          id: 'jobs',
          label: 'Jobs & Tasks',
          icon: Briefcase,
          badge: pendingReviewsCount > 0 ? pendingReviewsCount : null,
          badgeColor: 'bg-purple-500 text-white',
          description: 'Task assignments, milestones & QA',
        },
        {
          id: 'clients',
          label: 'Clients & Contracts',
          icon: Building,
          badge: null,
          description: 'Monthly retainers, workplaces & contracts',
        },
        {
          id: 'agents',
          label: 'Workers & Agents',
          icon: Users,
          badge: null,
          description: 'Accredited talent directory & profiles',
        },
        {
          id: 'categories',
          label: 'Departments & Streams',
          icon: FolderKanban,
          badge: null,
          description: 'Specialty categories and work streams',
        },
      ],
    },
    {
      id: 'FINANCE',
      title: 'FINANCE & PAYROLL',
      badge: pendingPayoutsCount > 0 ? `${pendingPayoutsCount} PENDING` : null,
      items: [
        {
          id: 'payroll',
          label: 'Monthly Payroll',
          icon: DollarSign,
          badge: null,
          badgeColor: 'bg-emerald-400 text-slate-950 font-bold',
          description: 'Client monthly salaries, bonuses & payouts',
        },
        {
          id: 'payments',
          label: 'Payments & M-Pesa',
          icon: CreditCard,
          badge: pendingPayoutsCount > 0 ? pendingPayoutsCount : null,
          badgeColor: 'bg-amber-400 text-slate-950 font-bold',
          description: 'M-Pesa dispatches & Flutterwave fees',
        },
      ],
    },
    {
      id: 'SYSTEM',
      title: 'SYSTEM & GOVERNANCE',
      badge: null,
      items: [
        {
          id: 'audit',
          label: 'Audit Trail',
          icon: ShieldAlert,
          badge: null,
          description: 'Full agent tracking & before/after diffs',
        },
        {
          id: 'settings',
          label: 'Platform Settings',
          icon: Settings,
          badge: null,
          description: 'System config, fees & announcements',
        },
      ],
    },
  ];

  return (
    <aside
      className={`relative shrink-0 transition-all duration-300 ease-in-out border-r border-slate-800/80 bg-slate-950/70 backdrop-blur-2xl z-20 flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64 lg:w-72'
      }`}
    >
      {/* Top Header Rail info */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-3">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-emerald-950/50 shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="truncate">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Command Rail</span>
              </div>
              <div className="text-sm font-extrabold text-white tracking-tight truncate">
                Swashub Operations
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
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        {sections.map((section) => (
          <div key={section.id} className="space-y-1.5">
            {/* Section Header */}
            {!isCollapsed ? (
              <div className="flex items-center justify-between px-3 py-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  {section.title}
                </span>
                {section.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
                    {section.badge}
                  </span>
                )}
              </div>
            ) : (
              <div className="w-6 h-px bg-slate-800 mx-auto my-2" />
            )}

            {/* Section Items */}
            <div className="space-y-1">
              {section.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <div key={item.id} className="relative group">
                    <button
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center transition-all rounded-xl relative ${
                        isCollapsed
                          ? 'justify-center p-3'
                          : 'justify-between px-3.5 py-2.5'
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
                          className={`shrink-0 transition-transform group-hover:scale-110 ${
                            isCollapsed ? 'w-5 h-5' : 'w-4 h-4'
                          } ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`}
                        />
                        {!isCollapsed && (
                          <div className="truncate text-left">
                            <div className="text-xs tracking-tight truncate">{item.label}</div>
                            <div className="text-[10px] text-slate-500 font-normal truncate max-w-[150px]">
                              {item.description}
                            </div>
                          </div>
                        )}
                      </div>

                      {!isCollapsed && item.badge !== null && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono shrink-0 ${
                            item.badgeColor || 'bg-emerald-500 text-slate-950'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Dot badge on collapsed mode */}
                      {isCollapsed && item.badge !== null && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse border-2 border-slate-950"></span>
                      )}
                    </button>

                    {/* Collapsed Tooltip / Floating Popover */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
                        <div className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 shadow-2xl text-xs text-white whitespace-nowrap min-w-[150px]">
                          <div className="font-semibold flex items-center justify-between gap-2">
                            <span>{item.label}</span>
                            {item.badge !== null && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Rail Info / Status Card */}
      <div className="p-3 border-t border-slate-800/80">
        {!isCollapsed ? (
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Audit Sync Nominal</span>
              </span>
              <span className="font-mono text-[10px] text-slate-500">v2.6</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Admin: <span className="text-white font-medium">{user?.name?.split(' ')[0] || 'Brian'}</span>
            </div>
          </div>
        ) : (
          <div
            className="w-8 h-8 mx-auto rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400"
            title="System Nominal"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
        )}
      </div>
    </aside>
  );
};
