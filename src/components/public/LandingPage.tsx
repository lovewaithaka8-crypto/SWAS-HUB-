import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
  Wallet,
  Smartphone,
  Award,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Star,
  Zap,
  HelpCircle,
  Lock,
  Layers,
  Sparkles,
  Check
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentView, settings } = useAuth();
  const [weeklyHours, setWeeklyHours] = useState<number>(20);
  const [selectedWorkplaceRate, setSelectedWorkplaceRate] = useState<number>(750); // KES per hour

  const estimatedMonthly = weeklyHours * 4 * selectedWorkplaceRate;
  const registrationFee = settings?.registrationFee || 5000;

  return (
    <div className="relative overflow-hidden text-slate-100 min-h-screen">
      {/* Background Soft Lighting Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full"></div>
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-sky-500/8 blur-[150px] rounded-full"></div>
        <div className="absolute top-2/3 -left-40 w-[600px] h-[600px] bg-indigo-500/6 blur-[150px] rounded-full"></div>
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Small Label Kicker */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-xs font-medium mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Swashub Accreditation Portal · East Africa</span>
          </div>

          {/* Large Bold Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.08] text-balance">
            Verified Projects. Guaranteed Escrow. Direct M-Pesa Payouts.
          </h1>

          {/* Short Supporting Paragraph */}
          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Swashub connects vetted Kenyan digital talent with enterprise project work.
            Pay a one-time accreditation fee, receive assigned tasks with pre-funded escrow,
            and withdraw directly to Safaricom M-Pesa.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setCurrentView('register')}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-2xl transition-all shadow-xl shadow-emerald-500/20 hover:scale-[1.02] flex items-center gap-2"
            >
              <span>Apply for Accreditation ({registrationFee.toLocaleString()} KES)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-7 py-4 bg-slate-900/90 hover:bg-slate-800 text-white font-semibold text-sm rounded-2xl border border-slate-700/80 transition-all hover:scale-[1.02]"
            >
              Explore Workflow
            </button>
          </div>

          {/* Metrics bar */}
          <div className="mt-14 max-w-3xl mx-auto grid grid-cols-3 gap-6 pt-10 border-t border-slate-800/80 text-center font-mono">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">2,400+</div>
              <div className="text-xs text-slate-400 font-sans mt-1">Projects Delivered</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">18.4M KES</div>
              <div className="text-xs text-slate-400 font-sans mt-1">Disbursed via M-Pesa</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">&lt; 2 hrs</div>
              <div className="text-xs text-slate-400 font-sans mt-1">Payout Release SLA</div>
            </div>
          </div>

          {/* HERO VISUAL: Integrated SaaS Interface Preview */}
          <div className="mt-16 max-w-5xl mx-auto relative">
            <div className="rounded-3xl border border-slate-700/60 bg-slate-900/80 p-3 sm:p-5 shadow-2xl backdrop-blur-xl">
              {/* Window Bar */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                  <span className="ml-2 font-sans text-slate-300 font-medium">app.swashub.ke · Agent Workplace</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Safaricom Paybill 880100 Escrow Active</span>
                </div>
              </div>

              {/* Mock Dashboard Area with Hero Workspace Image */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-left">
                {/* Visual Image Banner */}
                <div className="md:col-span-7 relative rounded-2xl overflow-hidden border border-slate-700/50 min-h-[260px] bg-slate-950">
                  <img
                    src="/src/assets/images/hero_swashub_workspace_1791395160174.jpg"
                    alt="Swashub Modern Workplace"
                    className="w-full h-full object-cover opacity-85"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-5">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                      Verified Kenya Project Hub
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      Curated B2B Project Queues
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Direct task assignment with no proposal bidding or unpaid trial tasks.
                    </p>
                  </div>
                </div>

                {/* Live Stats & Job Queue Card */}
                <div className="md:col-span-5 flex flex-col justify-between gap-3 bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider">Active Agent Balance</div>
                    <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-0.5">
                      14,500 KES
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Disbursable to +254 712 345678</div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Incoming Task Assignment</div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs">
                      <div className="font-semibold text-white truncate">B2B SaaS Case Studies (Batch 2)</div>
                      <div className="flex justify-between text-[11px] text-emerald-400 font-mono mt-1">
                        <span>Fixed Pay: 18,000 KES</span>
                        <span>Due: 4 days</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentView('register')}
                    className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Claim Verified Project Queue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES & BENEFITS */}
      <section className="py-24 relative border-t border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Core Platform Advantages
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 leading-tight">
              Designed For High-Performance Digital Workers in Kenya
            </h2>
            <p className="text-slate-400 mt-3 text-sm leading-relaxed">
              Swashub replaces random freelancing chaos with guaranteed payment escrow, direct task distribution,
              and fast local payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">100% Guaranteed Escrow</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clients must pre-fund complete project payments before any task is posted. When your deliverables
                are verified, your KES funds release automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-950/80 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Zero Bidding Wars</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You never waste hours writing proposals, buying credits, or competing against low-cost bots.
                Operations administrators assign vetted projects straight to your queue.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-950/80 text-teal-400 border border-teal-500/20 flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Direct Safaricom M-Pesa</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant withdrawal directly to your Safaricom or Airtel Money line with minimum withdrawal
                threshold of 1,000 KES. Fast, transparent, local settlement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT: CURATED WORKPLACES */}
      <section id="workplaces" className="py-24 relative border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Functional Workplaces
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Curated Departments Tailored To Your Specialized Skillset
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Agents are accredited into dedicated departments. Each department features standardized templates,
                clear delivery criteria, and guaranteed compensation rates.
              </p>

              <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-900">
                <img
                  src="/src/assets/images/category_digital_work_1791395172041.jpg"
                  alt="Specialized Workstation"
                  className="w-full h-48 object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-sm">Data Entry & Analysis</h4>
                  <span className="text-xs font-mono font-bold text-emerald-400">10,000 - 15,000 KES</span>
                </div>
                <p className="text-xs text-slate-400">
                  Tabular CSV normalization, barcode verification, spreadsheet cleaning, and catalog audits.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-sm">Content Writing & SEO</h4>
                  <span className="text-xs font-mono font-bold text-emerald-400">12,000 - 22,000 KES</span>
                </div>
                <p className="text-xs text-slate-400">
                  B2B SaaS case studies, long-form SEO articles, whitepapers, and enterprise technical copy.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-sm">Customer Support Ops</h4>
                  <span className="text-xs font-mono font-bold text-emerald-400">8,000 - 14,000 KES</span>
                </div>
                <p className="text-xs text-slate-400">
                  Email ticketing triage, live chat resolution, master FAQ handbook synthesis, and SLA audits.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-sm">Graphic Design & Creative</h4>
                  <span className="text-xs font-mono font-bold text-emerald-400">15,000 - 25,000 KES</span>
                </div>
                <p className="text-xs text-slate-400">
                  Brand assets, mobile UI review decks, social media campaign kits, and vector Figma graphics.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-sm">Virtual Assistance</h4>
                  <span className="text-xs font-mono font-bold text-emerald-400">9,000 - 18,000 KES</span>
                </div>
                <p className="text-xs text-slate-400">
                  Executive calendar coordination, invoice reconciliation, research synthesis, and email processing.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-sm">Audio Transcription</h4>
                  <span className="text-xs font-mono font-bold text-emerald-400">10,000 - 16,000 KES</span>
                </div>
                <p className="text-xs text-slate-400">
                  Medical & research interviews, Swahili-English translations, and timestamped SRT subtitles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 relative border-t border-slate-800/80 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Standard Operating Procedure
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 leading-tight">
              The 4-Step Swashub Execution Lifecycle
            </h2>
            <p className="text-slate-400 mt-3 text-sm leading-relaxed">
              Every step is protected by verified escrow and operational QA checks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="text-xs font-mono font-bold text-emerald-400">STEP 01</div>
              <h3 className="text-base font-bold text-white">Register & Accredit</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Create your account and complete the one-time {registrationFee.toLocaleString()} KES accreditation fee
                via Flutterwave (M-Pesa, Card, Airtel, Bank). Instant activation.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="text-xs font-mono font-bold text-emerald-400">STEP 02</div>
              <h3 className="text-base font-bold text-white">Accept Assigned Jobs</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Operations administrators dispatch project contracts to your private workplace dashboard with fixed KES
                pay, clear briefs, and milestone deadlines.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="text-xs font-mono font-bold text-emerald-400">STEP 03</div>
              <h3 className="text-base font-bold text-white">Deliver Evidence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Work through milestones, upload deliverable files or spreadsheet links, and submit. Admin performs
                QA verification within 24 hours.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="text-xs font-mono font-bold text-emerald-400">STEP 04</div>
              <h3 className="text-base font-bold text-white">M-Pesa Payout</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upon approval, earnings credit directly to your available balance. Request withdrawal anytime to your
                Safaricom phone with rapid 2-hour settlement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. POTENTIAL EARNINGS CALCULATOR */}
      <section className="py-24 relative border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Interactive Revenue Projection
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Estimate Your Monthly Payouts
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Based on historical project disbursements across accredited Kenyan agents.
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-6">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-300">Target Weekly Hours:</span>
                  <span className="font-bold font-mono text-emerald-400">{weeklyHours} hrs/week</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="5"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                  <span>Part-time (5h)</span>
                  <span>Average (20h)</span>
                  <span>Full-time (40h)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-2">Primary Project Category:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedWorkplaceRate(650)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-center transition-colors ${
                      selectedWorkplaceRate === 650
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    Data Entry
                  </button>
                  <button
                    onClick={() => setSelectedWorkplaceRate(850)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-center transition-colors ${
                      selectedWorkplaceRate === 850
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    SEO Writing
                  </button>
                  <button
                    onClick={() => setSelectedWorkplaceRate(1000)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-center transition-colors ${
                      selectedWorkplaceRate === 1000
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    Design & UX
                  </button>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-slate-950/90 border border-slate-800 rounded-2xl p-6 text-center">
              <div className="text-xs text-slate-400">Estimated Monthly Revenue:</div>
              <div className="text-4xl font-extrabold font-mono text-emerald-400 my-2">
                {estimatedMonthly.toLocaleString()} KES
              </div>
              <div className="text-[11px] text-slate-500 mb-5">
                ~{(estimatedMonthly / 4).toLocaleString()} KES paid weekly directly to M-Pesa
              </div>
              <button
                onClick={() => setCurrentView('register')}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/10"
              >
                Claim Your Agent Seat
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHY PAID ACCREDITATION */}
      <section id="fee-transparency" className="py-24 relative border-t border-slate-800/80 bg-slate-900/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Accreditation Transparency
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-2">
              Why Does Swashub Require a {registrationFee.toLocaleString()} KES Fee?
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              A transparent model designed to protect talent earnings and eliminate low-effort spam.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Filters Automated Bots & Secures Queue Quality</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Public freelance platforms are overrun with thousands of bot proposals that devalue wages.
                  Our accreditation fee ensures only committed Kenyan professionals participate in active queues.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-sky-950 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Guarantees 100% Client Escrow Funding</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Enterprise clients work exclusively with accredited pools because they trust deliverable quality.
                  Clients fund all project budgets into our bank escrow upfront before tasks are dispatched.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-950 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Direct Project Assignment by Operations</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  No unpaid sample writing or speculative proposals. Once accredited, the Operations Coordinator assigns
                  work directly to your workplace queue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. AGENT PROOF & TESTIMONIALS */}
      <section className="py-24 relative border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Agent Proof
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-2">Verified Agent Feedback</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "I was initially hesitant about the 5,000 KES fee. Within 4 days of M-Pesa confirmation, the Admin assigned
                  me an 18,000 KES SaaS case study job. When my final outline was approved, the payout reached my phone in
                  under 2 hours. Swashub is legitimate."
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-800">
                <img
                  src="/src/assets/images/agent_avatar_sarah_1791395183231.jpg"
                  alt="Sarah Mwangi"
                  className="w-10 h-10 rounded-full object-cover border border-emerald-500/40"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="text-xs font-bold text-white">Sarah Mwangi</div>
                  <div className="text-[11px] text-slate-400">Nairobi · Content Writing & SEO Copy</div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "I specialize in Excel normalization and product feeds. Unlike Upwork where you waste connects and get
                  ignored, Swashub admins deliver structured CSV tasks with clean guidelines and guaranteed pay. I make
                  over 35,000 KES monthly."
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-800">
                <img
                  src="/src/assets/images/agent_avatar_brian_1791395193037.jpg"
                  alt="Brian Kiprono"
                  className="w-10 h-10 rounded-full object-cover border border-emerald-500/40"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="text-xs font-bold text-white">Brian Kiprono</div>
                  <div className="text-[11px] text-slate-400">Eldoret · Data Entry & Spreadsheet QA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section id="faq" className="py-24 relative border-t border-slate-800/80 bg-slate-900/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-2">Answers to Common Inquiries</h2>
          </div>

          <div className="space-y-4">
            <details className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 group">
              <summary className="font-bold text-white text-xs sm:text-sm cursor-pointer list-none flex justify-between items-center">
                <span>How quickly after paying do I receive my first project?</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800 leading-relaxed">
                Immediately after your Flutterwave payment confirms, our system verifies your account as an active
                Agent and auto-assigns an initial onboarding project to your workplace queue.
              </p>
            </details>

            <details className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 group">
              <summary className="font-bold text-white text-xs sm:text-sm cursor-pointer list-none flex justify-between items-center">
                <span>What payment methods are supported for the accreditation fee?</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800 leading-relaxed">
                All transactions are processed via Flutterwave checkout, supporting Safaricom M-Pesa STK push,
                Airtel Money, Visa & Mastercard, direct Bank Transfer (KCB / Equity), and PayPal.
              </p>
            </details>

            <details className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 group">
              <summary className="font-bold text-white text-xs sm:text-sm cursor-pointer list-none flex justify-between items-center">
                <span>How do withdrawals work once deliverables are approved?</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800 leading-relaxed">
                When an Admin reviews and approves your submission, the payout amount is instantly credited to your
                available balance. You can click "Request Withdrawal", enter your M-Pesa number, and the funds will be
                dispatched via Flutterwave M-Pesa transfer within 2 hours. Minimum withdrawal is 1,000 KES.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* 9. RADIANT CALL TO ACTION */}
      <section className="py-24 relative border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-emerald-500/10 blur-[80px]"></div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight relative">
              Ready to Join Swashub Talent Operations?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-3 max-w-xl mx-auto relative">
              Register your profile today, pay via M-Pesa STK push, and receive your first project assignment.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4 relative">
              <button
                onClick={() => setCurrentView('register')}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-2xl transition-all shadow-xl shadow-emerald-500/20"
              >
                Join as Accredited Agent ({registrationFee.toLocaleString()} KES)
              </button>
              <button
                onClick={() => setCurrentView('login')}
                className="px-6 py-4 bg-slate-800/90 hover:bg-slate-700 text-white font-medium text-xs sm:text-sm rounded-2xl border border-slate-700"
              >
                Sign In to Existing Account
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
