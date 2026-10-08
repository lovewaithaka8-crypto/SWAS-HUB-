/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Header } from './components/common/Header.tsx';
import { Footer } from './components/common/Footer.tsx';
import { LandingPage } from './components/public/LandingPage.tsx';
import { LoginPage, RegisterPage } from './components/public/AuthModals.tsx';
import { AgentWorkplace } from './components/agent/AgentWorkplace.tsx';
import { AdminCommandCenter } from './components/admin/AdminCommandCenter.tsx';
import { ClientWorkplace } from './components/client/ClientWorkplace.tsx';
import { FlutterwaveModal } from './components/payments/FlutterwaveModal.tsx';
import { ShieldAlert, ArrowRight, Smartphone, LogOut, CheckCircle2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { user, currentView, setCurrentView, logout, setIsPaymentModalOpen, settings } = useAuth();

  const registrationFee = settings?.registrationFee || 5000;
  const currency = settings?.currency || 'KES';

  // 1. Pending Payment State (User registered but hasn't completed Flutterwave accreditation fee)
  if (user && user.role === 'PENDING_PAYMENT') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Subtle radial glow in background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/10 blur-[140px] rounded-full"></div>
          <div className="absolute bottom-10 right-1/4 w-[400px] h-[300px] bg-emerald-500/8 blur-[120px] rounded-full"></div>
        </div>

        <div className="relative w-full max-w-lg bg-slate-900/80 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6 z-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30 shadow-lg shadow-amber-950/40">
            <Smartphone className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 bg-amber-950/50 px-3 py-1 rounded-full border border-amber-500/30">
              Accreditation Pending
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 tracking-tight">
              Activate Your Agent Seat
            </h2>
            <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              Welcome <strong className="text-white">{user.name}</strong>. Your profile has been received.
              To unlock the private Agent Workplace, receive direct project assignments, and enable M-Pesa payouts,
              authorize the one-time accreditation fee of <strong className="text-emerald-400 font-mono">{registrationFee.toLocaleString()} {currency}</strong> via Flutterwave.
            </p>
          </div>

          <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 text-left text-xs space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Applicant:</span>
              <span className="font-semibold text-white">{user.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Accreditation Fee:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {registrationFee.toLocaleString()} {currency}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Supported Rails:</span>
              <span className="text-slate-300 font-medium">M-Pesa, Airtel, Cards, Bank, PayPal</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex-1 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <span>Pay {registrationFee.toLocaleString()} {currency} via Flutterwave</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="px-5 py-3.5 border border-slate-800 hover:border-slate-700 bg-slate-950/60 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Admin User
  if (user && user.role === 'ADMIN') {
    return <AdminCommandCenter />;
  }

  // 3. Agent User (Strict role restriction: Agents only see their workplace)
  if (user && user.role === 'AGENT') {
    return <AgentWorkplace />;
  }

  // 4. Client User (Monthly Workplace & Payroll Management)
  if (user && user.role === 'CLIENT') {
    return <ClientWorkplace />;
  }

  // 5. Public / Guest Navigation
  if (currentView === 'login') {
    return <LoginPage />;
  }
  if (currentView === 'register') {
    return <RegisterPage />;
  }

  return <LandingPage />;
};

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 gweno-bg-mesh selection:bg-emerald-500 selection:text-slate-950 font-sans antialiased">
        <Header />
        <main className="flex-1">
          <MainContent />
        </main>
        <Footer />
        <FlutterwaveModal />
      </div>
    </AuthProvider>
  );
}
