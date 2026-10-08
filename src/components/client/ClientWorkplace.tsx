import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiRequest } from '../../lib/api.ts';
import { Client, MonthlyContract, MonthlyPayrollRecord, ClientWorkSession, Job } from '../../types/index.ts';
import {
  Briefcase,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  DollarSign,
  User,
  Shield,
  MessageSquare,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Building,
  Smartphone,
  ExternalLink,
  Send,
  Loader2,
  RefreshCw,
  Award,
  Layers,
  HelpCircle,
  X
} from 'lucide-react';

interface Props {
  previewClientId?: string; // If Admin is previewing a specific client workplace
  onExitPreview?: () => void;
}

export const ClientWorkplace: React.FC<Props> = ({ previewClientId, onExitPreview }) => {
  const { user } = useAuth();
  const effectiveClientId = previewClientId || (user?.role === 'CLIENT' ? 'clt-jane-wanjiku' : 'clt-jane-wanjiku');

  const [activeTab, setActiveTab] = useState<'overview' | 'payroll' | 'attendance' | 'deliverables' | 'supervisor'>('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [client, setClient] = useState<Client | null>(null);
  const [activeContract, setActiveContract] = useState<MonthlyContract | null>(null);
  const [payrollRecords, setPayrollRecords] = useState<MonthlyPayrollRecord[]>([]);
  const [currentPayroll, setCurrentPayroll] = useState<MonthlyPayrollRecord | null>(null);
  const [workSessions, setWorkSessions] = useState<ClientWorkSession[]>([]);
  const [assignedJobs, setAssignedJobs] = useState<Job[]>([]);

  // Active work session timer
  const [activeSession, setActiveSession] = useState<ClientWorkSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [taskDescription, setTaskDescription] = useState('Customer Support Ticket Resolution & SLA Monitoring');
  const [isStartingSession, setIsStartingSession] = useState(false);

  // Payslip modal state
  const [selectedPayslip, setSelectedPayslip] = useState<MonthlyPayrollRecord | null>(null);

  // Deliverable submission modal
  const [submittingJob, setSubmittingJob] = useState<Job | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Supervisor chat message
  const [chatMessage, setChatMessage] = useState('');
  const [messagesList, setMessagesList] = useState<Array<{ sender: string; time: string; text: string; isMe: boolean }>>([
    {
      sender: 'Esther Njoki (Supervisor)',
      time: '09:15 AM',
      text: 'Good morning Jane! Great turnaround on yesterday afternoon tickets. Let us make sure all Priority-1 escalations are resolved before 15:00 EAT today.',
      isMe: false,
    },
    {
      sender: 'Jane Wanjiku',
      time: '09:20 AM',
      text: 'Good morning Esther! Understood, I have already started on the 6 open P1 tickets and updated the internal status logs.',
      isMe: true,
    },
    {
      sender: 'Esther Njoki (Supervisor)',
      time: '11:30 AM',
      text: 'Your October CSAT rating is currently at 99.2%, which qualifies you for the 3,500 KES monthly performance bonus! Keep up the great work.',
      isMe: false,
    },
  ]);

  const fetchWorkplaceData = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<{
        workplace: {
          client: Client;
          activeContract: MonthlyContract | null;
          allContracts: MonthlyContract[];
          currentPayroll: MonthlyPayrollRecord | null;
          payrollRecords: MonthlyPayrollRecord[];
          workSessions: ClientWorkSession[];
          assignedJobs: Job[];
        };
      }>(`/api/client-workplace/${effectiveClientId}`);

      if (res.workplace) {
        setClient(res.workplace.client);
        setActiveContract(res.workplace.activeContract);
        setPayrollRecords(res.workplace.payrollRecords || []);
        setCurrentPayroll(res.workplace.currentPayroll);
        setWorkSessions(res.workplace.workSessions || []);
        setAssignedJobs(res.workplace.assignedJobs || []);

        // Check if there is an in-progress session
        const inProgress = (res.workplace.workSessions || []).find((s) => s.status === 'IN_PROGRESS');
        if (inProgress) {
          setActiveSession(inProgress);
          const startMs = new Date(inProgress.startTime).getTime();
          const nowMs = Date.now();
          setElapsedSeconds(Math.max(0, Math.floor((nowMs - startMs) / 1000)));
        }
      }
    } catch (err) {
      console.error('Failed to load client workplace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkplaceData();
  }, [effectiveClientId]);

  // Live timer tick
  useEffect(() => {
    let interval: any = null;
    if (activeSession) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartWorkSession = async () => {
    setIsStartingSession(true);
    try {
      const res = await apiRequest<{ session: ClientWorkSession }>('/api/work-sessions/start', {
        method: 'POST',
        body: JSON.stringify({
          clientId: effectiveClientId,
          taskDescription: taskDescription || 'Active Client Shift Deliverable Execution',
        }),
      });
      setActiveSession(res.session);
      setElapsedSeconds(0);
      await fetchWorkplaceData();
    } catch (err: any) {
      alert(err.message || 'Failed to start shift');
    } finally {
      setIsStartingSession(false);
    }
  };

  const handleStopWorkSession = async () => {
    if (!activeSession) return;
    try {
      const mins = Math.max(15, Math.round(elapsedSeconds / 60));
      await apiRequest(`/api/work-sessions/${activeSession.id}/stop`, {
        method: 'POST',
        body: JSON.stringify({
          durationMinutes: mins,
          notes: `Completed active session. Logged ${mins} minutes.`,
        }),
      });
      setActiveSession(null);
      setElapsedSeconds(0);
      await fetchWorkplaceData();
    } catch (err: any) {
      alert(err.message || 'Failed to stop shift');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessagesList((prev) => [
      ...prev,
      {
        sender: client?.name || 'Jane Wanjiku',
        time: timeStr,
        text: chatMessage.trim(),
        isMe: true,
      },
    ]);
    setChatMessage('');
  };

  const handleOpenSubmitDeliverable = (job: Job) => {
    setSubmittingJob(job);
    setSubmissionNotes('');
    setSubmissionLink('https://docs.google.com/spreadsheets/d/18xP_verified_support_log_2026');
    setSubmissionSuccess(false);
  };

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingJob) return;
    setIsSubmittingWork(true);
    try {
      await apiRequest('/api/submissions', {
        method: 'POST',
        body: JSON.stringify({
          jobId: submittingJob.id,
          deliverables: [
            {
              title: submittingJob.title,
              url: submissionLink,
              description: submissionNotes || 'Completed monthly client assignment deliverables.',
            },
          ],
          notes: submissionNotes,
        }),
      });
      setSubmissionSuccess(true);
      setTimeout(() => {
        setSubmittingJob(null);
        fetchWorkplaceData();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setIsSubmittingWork(false);
    }
  };

  if (loading && !client) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <div className="text-sm font-semibold text-white">Loading Monthly Client Workplace...</div>
        <p className="text-xs text-slate-400 max-w-sm">
          Fetching employment contract terms, October 2026 payroll statement, and active work session data.
        </p>
      </div>
    );
  }

  const clientName = client?.name || 'Jane Wanjiku';
  const monthlyPay = client?.monthlySalary || 35000;
  const supervisorName = client?.supervisorAgentName || activeContract?.supervisorAgentName || 'Esther Njoki';
  const department = client?.department || 'Customer Support';
  const mpesaNumber = client?.mpesaPayoutNumber || client?.phone || '+254 728 554433';

  // Calculate monthly stats
  const totalLoggedMinutes = workSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalLoggedHours = (totalLoggedMinutes / 60).toFixed(1);
  const verifiedSessionsCount = workSessions.filter((s) => s.status === 'VERIFIED' || s.verifiedBySupervisor).length;

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col relative pb-16">
      {/* Background radial lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[400px] bg-emerald-500/8 blur-[160px] rounded-full"></div>
        <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[350px] bg-sky-500/6 blur-[150px] rounded-full"></div>
      </div>

      {/* Admin Workplace Preview Banner if previewing */}
      {previewClientId && (
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-amber-300 z-30">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-bold">ADMIN PREVIEW MODE:</span>
            <span>Viewing Client Workplace for <strong>{clientName}</strong> ({department})</span>
          </div>
          {onExitPreview && (
            <button
              onClick={onExitPreview}
              className="px-3 py-1 bg-amber-500/30 hover:bg-amber-500/40 text-amber-200 rounded-lg font-bold text-[11px] transition-colors"
            >
              Exit Preview & Return to Admin
            </button>
          )}
        </div>
      )}

      {/* Modern Compact Header & Summary Banner */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-2xl px-6 py-4 z-20 sticky top-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={client?.avatarUrl || '/src/assets/images/agent_avatar_sarah_1791395183231.jpg'}
                alt={clientName}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30 border border-slate-700"
              />
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 ${
                activeSession ? 'bg-emerald-400 animate-pulse' : 'bg-sky-400'
              }`} title={activeSession ? 'Shift in progress' : 'Online'}></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">{clientName}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  MONTHLY WORKPLACE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                  {department}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Supervisor: <strong className="text-slate-200">{supervisorName}</strong></span>
                <span>•</span>
                <span>Fixed Monthly Pay: <strong className="text-emerald-400 font-mono">KES {monthlyPay.toLocaleString()}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Active Shift Widget */}
          <div className="flex items-center gap-3">
            {activeSession ? (
              <div className="flex items-center gap-3 px-4 py-2 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl backdrop-blur-xl">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase text-emerald-400">Shift In Progress</div>
                  <div className="text-sm font-mono font-extrabold text-white">{formatTimer(elapsedSeconds)}</div>
                </div>
                <button
                  onClick={handleStopWorkSession}
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 ml-2"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Clock Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartWorkSession}
                disabled={isStartingSession}
                className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 hover:scale-[1.02]"
              >
                {isStartingSession ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Clock In to Start Shift</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Modern Floating Glass Command Navigation Dock */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs font-medium backdrop-blur-xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Monthly Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('payroll')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'payroll'
                  ? 'bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Payroll & Payouts</span>
              {currentPayroll && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-slate-950/40 text-emerald-300">
                  {currentPayroll.status}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'attendance'
                  ? 'bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Attendance & Sessions ({workSessions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('deliverables')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'deliverables'
                  ? 'bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Assigned Deliverables ({assignedJobs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('supervisor')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'supervisor'
                  ? 'bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Supervisor Chat ({supervisorName.split(' ')[0]})</span>
            </button>
          </div>

          <button
            onClick={fetchWorkplaceData}
            className="p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/80 text-slate-400 hover:text-white transition-colors"
            title="Refresh Workplace State"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 z-10 space-y-6">
        {/* ==================== TAB 1: OVERVIEW ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/80 space-y-2">
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Monthly Salary</span>
                  <Award className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                  KES {monthlyPay.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Disbursed monthly via M-Pesa</span>
                </div>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/80 space-y-2">
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Next Payment Date</span>
                  <Calendar className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-sky-400">
                  {client?.nextPaymentDate || '31 Oct 2026'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Cycle: 01 Oct 2026 - 31 Oct 2026
                </div>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/80 space-y-2">
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Logged Shifts</span>
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-purple-400">
                  {totalLoggedHours} hrs
                </div>
                <div className="text-[11px] text-slate-500">
                  {verifiedSessionsCount} of {workSessions.length} shifts verified
                </div>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/80 space-y-2">
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Supervising Agent</span>
                  <User className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-lg font-bold text-white truncate">
                  {supervisorName}
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Assigned Operations Lead</span>
                </div>
              </div>
            </div>

            {/* Employment Contract Card & Working Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-base font-bold text-white">Active Employment Contract Terms</h2>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {activeContract?.status || 'ACTIVE'} CONTRACT
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1">
                    <span className="text-slate-400">Department:</span>
                    <div className="font-bold text-white text-sm">{department}</div>
                  </div>
                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1">
                    <span className="text-slate-400">Working Hours & Days:</span>
                    <div className="font-bold text-white text-sm">
                      {client?.workingHours || '40 hrs/week (Mon-Fri 09:00 - 17:00 EAT)'}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1">
                    <span className="text-slate-400">Contract Duration:</span>
                    <div className="font-mono font-semibold text-slate-300">
                      {client?.contractStartDate || '01 Oct 2026'} → {client?.contractEndDate || '30 Sep 2027'} (12 Months Renewable)
                    </div>
                  </div>
                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1">
                    <span className="text-slate-400">M-Pesa Disbursement Channel:</span>
                    <div className="font-mono font-bold text-emerald-400">
                      {mpesaNumber} (B2C Automatic)
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                    Key Contract Responsibilities & SLAs
                  </h3>
                  <div className="space-y-2">
                    {(client?.responsibilities || [
                      'Manage high-priority customer support ticketing queues',
                      'Resolve user escalation inquiries within 15-minute SLA',
                      'Submit weekly customer satisfaction logs to supervisor Esther Njoki',
                      'Update knowledge base documentation and FAQs'
                    ]).map((resp, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{resp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Monthly Salary Statement Quick Widget */}
              <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 p-6 space-y-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-white text-sm">October 2026 Payroll Summary</h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Basic Monthly Salary:</span>
                      <span className="font-mono font-bold text-white">KES {monthlyPay.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-400">
                      <span>CSAT Performance Bonus:</span>
                      <span className="font-mono font-bold text-emerald-400">+ KES {(currentPayroll?.bonus || 3500).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-400">
                      <span>Statutory / Admin Deductions:</span>
                      <span className="font-mono font-bold text-slate-500">- KES 0</span>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
                      <span className="text-white">Net Disbursement:</span>
                      <span className="font-mono text-emerald-400 text-base">
                        KES {((currentPayroll?.netPayment) || (monthlyPay + 3500)).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-xs space-y-1">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Approved for Settlement</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Reviewed and approved by Admin. Scheduled for dispatch to {mpesaNumber} on 31 October 2026.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (currentPayroll) setSelectedPayslip(currentPayroll);
                    else setActiveTab('payroll');
                  }}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 transition-colors mt-4"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>View Official Digital Payslip</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: PAYROLL & PAYOUTS ==================== */}
        {activeTab === 'payroll' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">Monthly Payroll & Statements</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Official compensation statements, bonus itemization, and M-Pesa disbursement tracking.
                </p>
              </div>

              {currentPayroll && (
                <button
                  onClick={() => setSelectedPayslip(currentPayroll)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Generate October 2026 Payslip</span>
                </button>
              )}
            </div>

            {/* October 2026 Current Month Pipeline Card */}
            <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                    CURRENT MONTH STATEMENT
                  </span>
                  <h3 className="text-xl font-bold text-white">October 2026 Monthly Earnings</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    STATUS: {currentPayroll?.status || 'APPROVED'}
                  </span>
                </div>
              </div>

              {/* Status progression bar */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Disbursement Pipeline</div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold">
                    <div className="text-[10px] text-slate-500 font-mono">STEP 1</div>
                    <div>Draft Generated</div>
                    <CheckCircle2 className="w-4 h-4 mx-auto mt-1 text-emerald-400" />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold">
                    <div className="text-[10px] text-slate-500 font-mono">STEP 2</div>
                    <div>Supervisor Review</div>
                    <CheckCircle2 className="w-4 h-4 mx-auto mt-1 text-emerald-400" />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/50 text-emerald-400 font-bold shadow-lg shadow-emerald-500/10">
                    <div className="text-[10px] text-emerald-400 font-mono">STEP 3</div>
                    <div>Admin Approved</div>
                    <CheckCircle2 className="w-4 h-4 mx-auto mt-1 text-emerald-400" />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400">
                    <div className="text-[10px] text-slate-500 font-mono">STEP 4</div>
                    <div>Processing Payout</div>
                    <Clock className="w-4 h-4 mx-auto mt-1 text-slate-500" />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400">
                    <div className="text-[10px] text-slate-500 font-mono">STEP 5</div>
                    <div>M-Pesa Disbursed</div>
                    <Clock className="w-4 h-4 mx-auto mt-1 text-slate-500" />
                  </div>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-mono">
                    <tr>
                      <th className="px-5 py-3">Compensation Item</th>
                      <th className="px-5 py-3">Description & Notes</th>
                      <th className="px-5 py-3 text-right">Amount (KES)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    <tr>
                      <td className="px-5 py-3.5 font-bold text-white">Basic Monthly Retainer</td>
                      <td className="px-5 py-3.5 text-slate-400">Fixed monthly contracted salary (40 hrs/week)</td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-white">
                        KES {monthlyPay.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-emerald-950/10">
                      <td className="px-5 py-3.5 font-bold text-emerald-400">Performance Bonus</td>
                      <td className="px-5 py-3.5 text-slate-400">
                        {currentPayroll?.bonusReason || 'CSAT > 98% quality metric adherence bonus'}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-400">
                        + KES {(currentPayroll?.bonus || 3500).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-5 py-3.5 font-bold text-slate-400">Deductions</td>
                      <td className="px-5 py-3.5 text-slate-500">Nil / Zero infractions recorded</td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-500">
                        - KES 0
                      </td>
                    </tr>
                    <tr className="bg-slate-950/90 font-bold text-sm">
                      <td className="px-5 py-4 text-white" colSpan={2}>
                        Total Net Compensation Payable:
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-emerald-400 text-base">
                        KES {((currentPayroll?.netPayment) || (monthlyPay + 3500)).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Past Monthly Statements Archive */}
            <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 p-6 space-y-4">
              <h3 className="text-base font-bold text-white">Historical Payment Statements</h3>
              <div className="divide-y divide-slate-800/60">
                {payrollRecords.map((rec) => (
                  <div key={rec.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white">{rec.payrollMonth}</div>
                        <div className="text-slate-400 text-[11px]">
                          Ref: {rec.transactionReference || 'MP-2026-PAID'} • {rec.paymentMethod} {rec.payoutAccount}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono font-bold text-emerald-400 text-sm">
                          KES {rec.netPayment.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-emerald-400 font-semibold">{rec.status}</span>
                      </div>

                      <button
                        onClick={() => setSelectedPayslip(rec)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        <span>View Statement</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: ATTENDANCE & LIVE SESSIONS ==================== */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">Work Attendance & Live Tracker</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Active work clock, shift timestamps, and supervisor verification log.
                </p>
              </div>

              <div className="text-xs text-slate-400">
                Weekly Target: <strong>40 Hours</strong> • Logged this month: <strong className="text-emerald-400">{totalLoggedHours} Hours</strong>
              </div>
            </div>

            {/* Active Clock Session Controller */}
            <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 p-6 sm:p-8 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                    WORKSTATION CLOCK
                  </span>
                  <h3 className="text-2xl font-mono font-extrabold text-white mt-1">
                    {formatTimer(elapsedSeconds)}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeSession ? 'Session is live and tracking task activity' : 'Currently off-clock'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {activeSession ? (
                    <button
                      onClick={handleStopWorkSession}
                      className="px-6 py-3 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>Clock Out & Save Shift</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStartWorkSession}
                      disabled={isStartingSession}
                      className="px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                    >
                      {isStartingSession ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Clock In to Begin Shift</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Current Shift Task Focus & Description
                </label>
                <input
                  type="text"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="e.g. Ticketing Queue Triage, FAQ Updates, Escalation Handling..."
                  className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Work Sessions History Table */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-white text-sm">Shift Attendance Log</h3>
                <span className="text-xs text-slate-400 font-mono">{workSessions.length} sessions recorded</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono text-[10px] uppercase">
                    <tr>
                      <th className="px-6 py-3.5">Date & Start Time</th>
                      <th className="px-6 py-3.5">Task Description</th>
                      <th className="px-6 py-3.5">Duration</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Supervisor Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {workSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{session.date}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-slate-200 font-medium">{session.taskDescription}</div>
                          {session.notes && <div className="text-[11px] text-slate-500">{session.notes}</div>}
                        </td>

                        <td className="px-6 py-4 font-mono font-bold text-white">
                          {session.durationMinutes ? `${Math.floor(session.durationMinutes / 60)}h ${session.durationMinutes % 60}m` : 'In Progress'}
                        </td>

                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold ${
                            session.status === 'VERIFIED'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : session.status === 'IN_PROGRESS'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {session.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          {session.verifiedBySupervisor ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Verified by {supervisorName}</span>
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs">Pending Shift Sign-off</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: DELIVERABLES & JOBS ==================== */}
        {activeTab === 'deliverables' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">Assigned Monthly Deliverables</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Deliverable milestones assigned by your supervisor for the October monthly cycle.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 p-6 space-y-4 hover:border-slate-700 transition-colors"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-sky-400">
                        {job.categoryName || department}
                      </span>
                      <h3 className="font-bold text-white text-base mt-0.5">{job.title}</h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                      job.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : job.status === 'SUBMITTED'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">{job.description}</p>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Deadline: <strong className="text-white">{job.deadlineDays || 5} days remaining</strong>
                    </span>

                    <button
                      onClick={() => handleOpenSubmitDeliverable(job)}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <span>Submit Deliverable</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 5: SUPERVISOR DIRECT CHAT ==================== */}
        {activeTab === 'supervisor' && (
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl flex flex-col h-[650px]">
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold text-sm">
                    {supervisorName.slice(0, 2)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950"></span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{supervisorName}</h3>
                  <p className="text-[11px] text-slate-400">
                    Senior Operations Agent & Supervisor • {department}
                  </p>
                </div>
              </div>

              <div className="text-xs text-emerald-400 font-mono font-semibold">
                SLA Direct Escalation Line
              </div>
            </div>

            {/* Messages box */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messagesList.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-400">
                    <span className="font-semibold">{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.isMe
                        ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                        : 'bg-slate-800 text-white rounded-tl-none border border-slate-700/80'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center gap-3">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder={`Send update or question to supervisor ${supervisorName}...`}
                className="flex-1 text-xs px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={!chatMessage.trim()}
                className="px-4 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ==================== PAYSLIP STATEMENT MODAL ==================== */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-100 space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SWASHUB WORKPLACE PAYROLL STATEMENT</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">Official Payslip & Disbursement Receipt</h3>
              </div>
              <button onClick={() => setSelectedPayslip(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div>
                  <div className="text-slate-400">Employee / Client:</div>
                  <div className="font-bold text-white text-sm">{clientName}</div>
                  <div className="text-slate-400 text-[11px]">{department}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400">Period:</div>
                  <div className="font-bold text-emerald-400 text-sm">{selectedPayslip.payrollMonth}</div>
                  <div className="font-mono text-slate-500 text-[11px]">Receipt: {selectedPayslip.receiptNumber || 'SWP-2026-OCT-004'}</div>
                </div>
              </div>

              <div className="space-y-2 py-2">
                <div className="flex justify-between text-slate-300">
                  <span>Basic Monthly Contract Salary:</span>
                  <span className="font-mono font-bold text-white">KES {selectedPayslip.basicMonthlyPay.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Performance Incentive / CSAT Bonus:</span>
                  <span className="font-mono font-bold">+ KES {selectedPayslip.bonus.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Authorized Deductions:</span>
                  <span className="font-mono font-bold">- KES {selectedPayslip.deductions.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between text-base font-extrabold text-white">
                  <span>Net Disbursed Amount:</span>
                  <span className="font-mono text-emerald-400">KES {selectedPayslip.netPayment.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-4 text-[11px] text-slate-400">
                <div>
                  <span>Disbursement Rail: </span>
                  <strong className="text-slate-200">{selectedPayslip.paymentMethod} ({selectedPayslip.payoutAccount})</strong>
                </div>
                <div>
                  <span>Transaction Reference: </span>
                  <strong className="text-slate-200 font-mono">{selectedPayslip.transactionReference || 'MP-PAY-OCT-2601'}</strong>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified by Swashub Operations & Supervisor {supervisorName}</span>
              </div>

              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Payslip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUBMIT DELIVERABLE MODAL ==================== */}
      {submittingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Submit Deliverable: {submittingJob.title}</h3>
              <button onClick={() => setSubmittingJob(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submissionSuccess ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-center space-y-2 text-emerald-300">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="font-bold text-sm">Deliverable Submitted Successfully!</div>
                <p className="text-xs text-slate-400">Supervisor {supervisorName} has been notified for review.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitDeliverable} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Deliverable URL / Cloud Link (Google Drive / Sheet / GitHub)
                  </label>
                  <input
                    type="url"
                    required
                    value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Completion Notes for Supervisor {supervisorName}
                  </label>
                  <textarea
                    rows={4}
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    placeholder="Summary of completed tasks, SLA metrics, tickets resolved..."
                    className="w-full text-xs p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingWork}
                  className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmittingWork ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Submission</span>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
