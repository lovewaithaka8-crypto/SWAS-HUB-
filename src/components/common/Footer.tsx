import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { ShieldCheck, Lock, ArrowUpRight, Smartphone, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView } = useAuth();

  return (
    <footer className="relative bg-[#060910] border-t border-slate-800/80 pt-16 pb-12 text-xs text-slate-400 overflow-hidden">
      {/* Subtle radial glow in footer background */}
      <div className="pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-emerald-500/5 blur-[120px] rounded-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Column 1: Brand & Overview */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3 text-white font-extrabold text-lg tracking-tight">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-emerald-950/60">
                S
              </div>
              <span className="text-xl">Swashub</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The premier accredited digital workforce platform in Kenya. Connecting vetted local talent
              with pre-funded enterprise projects, milestone escrow protection, and automated Safaricom M-Pesa disbursements.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Flutterwave Escrow</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>M-Pesa STK Instant</span>
              </div>
            </div>
          </div>

          {/* Column 2: Platform Navigation */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => setCurrentView('landing')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Overview & Philosophy
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('landing');
                    setTimeout(() => {
                      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  How Swashub Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('landing');
                    setTimeout(() => {
                      document.getElementById('workplaces')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Specialized Workplaces
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('landing');
                    setTimeout(() => {
                      document.getElementById('fee-transparency')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Accreditation Transparency
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('landing');
                    setTimeout(() => {
                      document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Workplaces */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider">Workplaces</h4>
            <ul className="space-y-2.5 text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Data Entry & Analysis</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Content Writing & SEO</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Customer Support Ops</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Graphic & UI Design</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Audio Transcription</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Office */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider">Operations Desk</h4>
            <div className="space-y-2 text-slate-400 leading-relaxed">
              <p>
                Delta Corner Towers, Westlands<br />
                Nairobi, Kenya
              </p>
              <p className="pt-1 text-slate-300">
                Desk: <span className="font-mono text-emerald-400">+254 700 800900</span>
              </p>
              <p className="text-slate-300">
                Email: <span className="text-slate-200">operations@swashub.com</span>
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setCurrentView('register')}
                  className="inline-flex items-center gap-1 text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
                >
                  <span>Apply as Agent</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Swashub Operations Ltd. All rights reserved. Registered under Kenya Companies Act.
          </div>
          <div className="flex items-center gap-5">
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-slate-300 cursor-pointer">Agent Code of Conduct</span>
            <span>·</span>
            <span className="hover:text-slate-300 cursor-pointer">Privacy Notice</span>
            <span>·</span>
            <span className="hover:text-slate-300 cursor-pointer">Escrow Security Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
