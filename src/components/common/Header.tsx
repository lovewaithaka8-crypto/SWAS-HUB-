import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Bell,
  ShieldCheck,
  UserCircle,
  LogOut,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  Search,
  Command
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    user,
    logout,
    currentView,
    setCurrentView,
    unreadNotifsCount,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setIsPaymentModalOpen,
  } = useAuth();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand Logo / Wordmark */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              if (user?.role === 'ADMIN') setCurrentView('admin-overview');
              else if (user?.role === 'AGENT') setCurrentView('agent-dashboard');
              else if (user?.role === 'CLIENT') setCurrentView('client-dashboard');
              else setCurrentView('landing');
            }}
            className="flex items-center gap-3 group focus:outline-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
              S
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              Swashub
            </span>
          </button>

          {/* Floating Command Search Bar when logged in */}
          {user && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 hover:border-slate-700 transition-colors cursor-pointer shadow-inner">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 text-[11px]">Search jobs, workers, wallets...</span>
              <kbd className="ml-4 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 border border-slate-700 text-slate-400">
                ⌘K
              </kbd>
            </div>
          )}
        </div>

        {/* Center / Right: Main Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-slate-300">
          {!user ? (
            <>
              <button
                onClick={() => setCurrentView('landing')}
                className={`hover:text-white transition-colors ${currentView === 'landing' ? 'text-emerald-400 font-semibold' : ''}`}
              >
                Platform
              </button>
              <button
                onClick={() => {
                  setCurrentView('landing');
                  setTimeout(() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }}
                className="hover:text-white transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => {
                  setCurrentView('landing');
                  setTimeout(() => {
                    document.getElementById('workplaces')?.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }}
                className="hover:text-white transition-colors"
              >
                Workplaces
              </button>
              <button
                onClick={() => {
                  setCurrentView('landing');
                  setTimeout(() => {
                    document.getElementById('fee-transparency')?.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }}
                className="hover:text-white transition-colors"
              >
                Accreditation
              </button>
              <button
                onClick={() => {
                  setCurrentView('landing');
                  setTimeout(() => {
                    document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }}
                className="hover:text-white transition-colors"
              >
                FAQ
              </button>
            </>
          ) : user.role === 'ADMIN' ? (
            <>
              <button
                onClick={() => setCurrentView('admin-overview')}
                className={`hover:text-white transition-colors ${currentView === 'admin-overview' ? 'text-emerald-400 font-semibold' : ''}`}
              >
                Command Center
              </button>
              <button
                onClick={() => setCurrentView('admin-jobs')}
                className={`hover:text-white transition-colors ${currentView === 'admin-jobs' ? 'text-emerald-400 font-semibold' : ''}`}
              >
                Tasks & Jobs
              </button>
              <button
                onClick={() => setCurrentView('admin-agents')}
                className={`hover:text-white transition-colors ${currentView === 'admin-agents' ? 'text-emerald-400 font-semibold' : ''}`}
              >
                Workers & Clients
              </button>
              <button
                onClick={() => setCurrentView('admin-payments')}
                className={`hover:text-white transition-colors ${currentView === 'admin-payments' ? 'text-emerald-400 font-semibold' : ''}`}
              >
                Financials
              </button>
              <button
                onClick={() => setCurrentView('admin-settings')}
                className={`hover:text-white transition-colors ${currentView === 'admin-settings' ? 'text-emerald-400 font-semibold' : ''}`}
              >
                Operations & Security
              </button>
            </>
          ) : user.role === 'AGENT' ? (
            <>
              <button
                onClick={() => setCurrentView('agent-dashboard')}
                className={`hover:text-white transition-colors ${currentView === 'agent-dashboard' ? 'text-emerald-400 font-semibold' : ''}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('agent-clients')}
                className={`hover:text-white transition-colors ${currentView === 'agent-clients' ? 'text-emerald-400 font-semibold' : ''}`}
              >
                My Clients
              </button>
              <button
                onClick={() => setCurrentView('agent-jobs')}
                className={`hover:text-white transition-colors ${currentView === 'agent-jobs' ? 'text-emerald-400 font-semibold' : ''}`}
              >
                Work & Tasks
              </button>
              <button
                onClick={() => setCurrentView('agent-earnings')}
                className={`hover:text-white transition-colors ${currentView === 'agent-earnings' ? 'text-emerald-400 font-semibold' : ''}`}
              >
                Earnings
              </button>
              <button
                onClick={() => setCurrentView('agent-support')}
                className={`hover:text-white transition-colors ${currentView === 'agent-support' ? 'text-emerald-400 font-semibold' : ''}`}
              >
                Client Support
              </button>
              <button
                onClick={() => setCurrentView('agent-profile')}
                className={`hover:text-white transition-colors ${currentView === 'agent-profile' ? 'text-emerald-400 font-semibold' : ''}`}
              >
                Profile
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="text-amber-400 font-medium hover:text-amber-300 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> Complete Accreditation (5,000 KES)
            </button>
          )}
        </nav>

        {/* Right: Actions, Notifications, Auth Buttons */}
        <div className="flex items-center gap-4">
          {/* Notifications Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400"></span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 text-xs text-slate-200">
                  <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-white">Notifications ({unreadNotifsCount})</span>
                    {unreadNotifsCount > 0 && (
                      <button
                        onClick={() => markAllNotificationsAsRead()}
                        className="text-emerald-400 hover:underline text-[11px]"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-500">No notifications yet</div>
                    ) : (
                      notifications.slice(0, 6).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            if (notif.linkUrl) {
                              if (user.role === 'ADMIN' && notif.linkUrl.includes('job')) setCurrentView('admin-jobs');
                              else if (user.role === 'ADMIN' && notif.linkUrl.includes('payment')) setCurrentView('admin-payments');
                              else if (user.role === 'AGENT' && notif.linkUrl.includes('job')) setCurrentView('agent-jobs');
                              else if (user.role === 'AGENT' && notif.linkUrl.includes('earnings')) setCurrentView('agent-earnings');
                            }
                            setShowNotifMenu(false);
                          }}
                          className={`p-3.5 cursor-pointer hover:bg-slate-800/80 transition-colors ${
                            !notif.read ? 'bg-emerald-950/30' : ''
                          }`}
                        >
                          <div className="font-medium text-white">{notif.title}</div>
                          <div className="text-slate-400 mt-0.5 line-clamp-2 text-[11px]">{notif.message}</div>
                          <div className="text-[10px] text-slate-500 mt-1 font-mono">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Auth Controls */}
          {!user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('login')}
                className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setCurrentView('register')}
                className="px-4 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1.5"
              >
                <span>Join as Agent</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl">
                <UserCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-slate-200">{user.name.split(' ')[0]}</span>
                {user.role === 'AGENT' && (
                  <span className="text-xs font-mono font-semibold text-emerald-400">
                    {user.balance.toLocaleString()} KES
                  </span>
                )}
                {user.role === 'CLIENT' && (
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                    MONTHLY CLIENT
                  </span>
                )}
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-900 transition-colors"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 border-b border-slate-800 p-4 space-y-3 text-xs">
          {!user ? (
            <>
              <button
                onClick={() => {
                  setCurrentView('landing');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-slate-300 hover:text-white"
              >
                Platform Overview
              </button>
              <button
                onClick={() => {
                  setCurrentView('register');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-emerald-400 font-semibold"
              >
                Apply for Accreditation
              </button>
              <button
                onClick={() => {
                  setCurrentView('login');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-slate-300 hover:text-white"
              >
                Sign In
              </button>
            </>
          ) : user.role === 'ADMIN' ? (
            <>
              <button
                onClick={() => {
                  setCurrentView('admin-overview');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-white font-medium"
              >
                Command Center Dashboard
              </button>
              <button
                onClick={() => {
                  setCurrentView('admin-jobs');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-slate-300 hover:text-white"
              >
                Tasks & Jobs
              </button>
              <button
                onClick={() => {
                  setCurrentView('admin-payments');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-slate-300 hover:text-white"
              >
                Payments & Payouts
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setCurrentView('agent-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-white font-medium"
              >
                Agent Dashboard
              </button>
              <button
                onClick={() => {
                  setCurrentView('agent-jobs');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-slate-300 hover:text-white"
              >
                My Projects
              </button>
              <button
                onClick={() => {
                  setCurrentView('agent-earnings');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-slate-300 hover:text-white"
              >
                Earnings & M-Pesa
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
