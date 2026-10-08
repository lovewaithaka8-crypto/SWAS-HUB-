import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Briefcase,
  Wallet,
  Settings,
  Users,
  CreditCard,
  FolderKanban,
  Headphones,
  Plus,
  Bell,
  Sparkles,
  UserCircle
} from 'lucide-react';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  role: 'ADMIN' | 'AGENT';
  badges?: {
    jobs?: number;
    clients?: number;
    payments?: number;
    support?: number;
  };
}

export const ModernCommandDock: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  role,
  badges = {},
}) => {
  const { currentView, setCurrentView } = useAuth();

  const adminItems = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard, badge: null },
    { id: 'jobs', label: 'Jobs', icon: Briefcase, badge: badges.jobs },
    { id: 'agents', label: 'People', icon: Users, badge: null },
    { id: 'categories', label: 'Workplaces', icon: FolderKanban, badge: null },
    { id: 'payments', label: 'Wallet', icon: CreditCard, badge: badges.payments },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  const agentItems = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard, badge: null },
    { id: 'my-clients', label: 'Clients', icon: Users, badge: badges.clients },
    { id: 'work', label: 'Work', icon: Briefcase, badge: badges.jobs },
    { id: 'submissions', label: 'Reviews', icon: FolderKanban, badge: null },
    { id: 'earnings', label: 'Wallet', icon: Wallet, badge: null },
    { id: 'support', label: 'Support', icon: Headphones, badge: badges.support },
    { id: 'profile', label: 'Profile', icon: UserCircle, badge: null },
  ];

  const items = role === 'ADMIN' ? adminItems : agentItems;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[92vw] pointer-events-auto">
      {/* Dock container: floating glass with smooth backdrop and borders */}
      <nav
        aria-label="Command Dock"
        className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-slate-950/80 backdrop-blur-2xl border border-slate-750/70 shadow-2xl shadow-black/80 ring-1 ring-white/10"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`group relative flex flex-col items-center justify-center px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-100'
                  }`}
                />
                {/* Active glow dot */}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
                )}
                {/* Notification badge */}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-400 text-slate-950 text-[9px] font-mono font-bold px-1 rounded-full leading-tight">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] tracking-tight mt-1 transition-colors ${
                  isActive ? 'font-bold text-emerald-400' : 'font-medium text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
