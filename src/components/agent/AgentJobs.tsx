import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiRequest, uploadFile } from '../../lib/api.ts';
import { Job, Milestone, Submission } from '../../types/index.ts';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Send,
  Calendar,
  DollarSign,
  ChevronRight,
  X,
  MessageSquare,
  FileCheck,
  Paperclip,
  Check,
  Loader2,
  Download,
  Sparkles
} from 'lucide-react';

export const AgentJobs: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Submission form state inside drawer
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Chat message state inside drawer
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'brief' | 'work' | 'chat'>('brief');

  const fetchJobs = async () => {
    try {
      const res = await apiRequest<{ jobs: Job[] }>('/api/jobs');
      setJobs(res.jobs || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const loadJobDetails = async (jobId: string) => {
    try {
      const res = await apiRequest<{ job: Job }>(`/api/jobs/${jobId}`);
      setSelectedJob(res.job);
      setSubmissionNotes(res.job.agentSubmission?.notes || '');
      setSubmissionFiles(res.job.agentSubmission?.fileUrls || []);
      setSubmitError('');
      setSubmitSuccess('');

      // Fetch chat messages for this job
      const msgsRes = await apiRequest<{ messages: any[] }>(`/api/messages?jobId=${jobId}`);
      setChatMessages(msgsRes.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptJob = async (jobId: string) => {
    try {
      await apiRequest(`/api/jobs/${jobId}/accept`, { method: 'POST' });
      await fetchJobs();
      if (selectedJob?.id === jobId) {
        await loadJobDetails(jobId);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to accept job');
    }
  };

  const handleToggleMilestone = async (jobId: string, milestoneId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await apiRequest(`/api/jobs/${jobId}/milestones/${milestoneId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchJobs();
      if (selectedJob?.id === jobId) {
        await loadJobDetails(jobId);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update milestone');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const file = files[0];
      const res = await uploadFile(file);
      setSubmissionFiles((prev) => [...prev, res.url]);
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitWork = async () => {
    if (!selectedJob) return;
    if (!submissionNotes.trim()) {
      setSubmitError('Please provide summary notes explaining your work deliverables.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      await apiRequest(`/api/jobs/${selectedJob.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          notes: submissionNotes,
          fileUrls: submissionFiles,
        }),
      });
      setSubmitSuccess('Deliverables submitted successfully! Admin will review within 24 hours.');
      await fetchJobs();
      await loadJobDetails(selectedJob.id);
      await refreshUser();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit work');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim() || !selectedJob) return;
    setIsSendingMessage(true);
    try {
      const res = await apiRequest<{ message: any }>('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          jobId: selectedJob.id,
          content: newChatMessage,
        }),
      });
      setChatMessages((prev) => [...prev, res.message]);
      setNewChatMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const currentStatus = j.currentAgentStatus || j.status;
    if (filterStatus === 'ALL') return true;
    return currentStatus === filterStatus;
  });

  return (
    <div className="space-y-8">
      {/* Page Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Assigned Projects</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Projects dispatched by the Operations Admin. Complete milestones to trigger QA review and escrow payouts.
          </p>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs font-medium overflow-x-auto backdrop-blur-xl">
          {['ALL', 'ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {st === 'ALL'
                ? 'All Jobs'
                : st === 'ASSIGNED'
                ? 'Action Required'
                : st === 'IN_PROGRESS'
                ? 'In Progress'
                : st === 'SUBMITTED'
                ? 'Under Review'
                : st === 'APPROVED'
                ? 'Approved'
                : 'Needs Revision'}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid / List */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs">Loading assigned project queue...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="p-16 bg-slate-900/60 rounded-3xl border border-slate-800 text-center space-y-4 backdrop-blur-xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto border border-slate-700">
            <Briefcase className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No projects found in this view</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            You will receive instant SMS and in-app alerts whenever the Operations Admin assigns a new project to your queue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const currentStatus = job.currentAgentStatus || job.status;
            const completedMilestones = job.milestones.filter((m) => m.status === 'COMPLETED').length;
            const totalMilestones = job.milestones.length;
            const progressPct = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

            return (
              <div
                key={job.id}
                className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800/90 hover:border-slate-700/80 transition-all p-6 flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* Category & Status */}
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span className="font-medium text-emerald-400">{job.categoryName}</span>
                    <span className="flex items-center gap-1 font-mono text-[11px] font-semibold">
                      {currentStatus === 'ASSIGNED' && <span className="text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/60">Action Required</span>}
                      {currentStatus === 'IN_PROGRESS' && <span className="text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-800/60">In Progress</span>}
                      {currentStatus === 'SUBMITTED' && <span className="text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/60">Under Review</span>}
                      {currentStatus === 'APPROVED' && <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">Approved & Paid</span>}
                      {currentStatus === 'REJECTED' && <span className="text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800/60">Revision Needed</span>}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white line-clamp-2 leading-snug">{job.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">{job.description}</p>

                  {/* Payment & Deadline */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Fixed Payout</div>
                      <div className="font-mono text-base font-extrabold text-emerald-400 mt-0.5">
                        {job.paymentAmount.toLocaleString()} KES
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Target Deadline</div>
                      <div className="font-mono text-xs text-slate-200 mt-0.5">
                        {new Date(job.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* Milestones Progress */}
                  <div className="mt-4">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                      <span>Milestones Progress</span>
                      <span className="font-mono text-slate-300">{completedMilestones}/{totalMilestones} Completed</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2.5">
                  {currentStatus === 'ASSIGNED' ? (
                    <button
                      onClick={() => handleAcceptJob(job.id)}
                      className="flex-1 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept Project</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => loadJobDetails(job.id)}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Work on Project</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      loadJobDetails(job.id);
                      setActiveDrawerTab('chat');
                    }}
                    className="p-2.5 bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 rounded-xl transition-colors"
                    title="Message Admin about this job"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-over Workspace Drawer for Selected Job */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex justify-end">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                  <span className="text-emerald-400 font-medium">{selectedJob.categoryName}</span>
                  <span>·</span>
                  <span className="font-mono font-bold text-white">
                    {selectedJob.paymentAmount.toLocaleString()} KES
                  </span>
                  <span>·</span>
                  <span>Due {new Date(selectedJob.deadline).toLocaleDateString()}</span>
                </div>
                <h2 className="text-lg font-bold text-white leading-snug">{selectedJob.title}</h2>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Tab Navigation */}
            <div className="px-6 border-b border-slate-800 flex gap-6 text-xs font-medium bg-slate-950/30">
              <button
                onClick={() => setActiveDrawerTab('brief')}
                className={`py-3.5 border-b-2 transition-colors ${
                  activeDrawerTab === 'brief'
                    ? 'border-emerald-400 text-emerald-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                1. Brief & Requirements
              </button>
              <button
                onClick={() => setActiveDrawerTab('work')}
                className={`py-3.5 border-b-2 transition-colors ${
                  activeDrawerTab === 'work'
                    ? 'border-emerald-400 text-emerald-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                2. Milestones & Evidence Upload
              </button>
              <button
                onClick={() => setActiveDrawerTab('chat')}
                className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
                  activeDrawerTab === 'chat'
                    ? 'border-emerald-400 text-emerald-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>3. Admin Support Chat</span>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Review Feedback Banner (if rejected or approved) */}
              {selectedJob.agentSubmission?.adminReview && (
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                    selectedJob.agentSubmission.status === 'APPROVED'
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                  }`}
                >
                  <div className="font-bold flex items-center gap-2">
                    {selectedJob.agentSubmission.status === 'APPROVED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>
                      {selectedJob.agentSubmission.status === 'APPROVED'
                        ? 'Admin Approved This Work!'
                        : 'Admin Revision Feedback:'}
                    </span>
                  </div>
                  <p className="leading-relaxed text-slate-300">{selectedJob.agentSubmission.adminReview}</p>
                </div>
              )}

              {/* TAB 1: Brief */}
              {activeDrawerTab === 'brief' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Job Description
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                      {selectedJob.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Strict Quality Requirements
                    </h3>
                    <ul className="space-y-2">
                      {selectedJob.requirements.map((req, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selectedJob.attachments?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Attached Reference Files
                      </h3>
                      <div className="space-y-2">
                        {selectedJob.attachments.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 transition-colors"
                          >
                            <span className="flex items-center gap-2 truncate font-mono">
                              <Paperclip className="w-3.5 h-3.5" />
                              <span className="truncate">{url}</span>
                            </span>
                            <Download className="w-3.5 h-3.5 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => setActiveDrawerTab('work')}
                      className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                    >
                      <span>Proceed to Deliverables</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: Milestones & Work Submission */}
              {activeDrawerTab === 'work' && (
                <div className="space-y-6">
                  {/* Milestones Checklist */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Project Milestones Checklist
                    </h3>
                    <div className="space-y-2.5">
                      {selectedJob.milestones.map((ms) => (
                        <div
                          key={ms.id}
                          onClick={() => handleToggleMilestone(selectedJob.id, ms.id, ms.status)}
                          className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                            ms.status === 'COMPLETED'
                              ? 'bg-emerald-950/30 border-emerald-500/40'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                              ms.status === 'COMPLETED'
                                ? 'bg-emerald-400 border-emerald-400 text-slate-950'
                                : 'border-slate-700 bg-slate-900'
                            }`}
                          >
                            {ms.status === 'COMPLETED' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div className="text-xs flex-1">
                            <div
                              className={`font-semibold ${
                                ms.status === 'COMPLETED' ? 'text-emerald-300 line-through' : 'text-white'
                              }`}
                            >
                              {ms.title}
                            </div>
                            {ms.description && <div className="text-slate-400 mt-0.5">{ms.description}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submission Form */}
                  <div className="pt-4 border-t border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Submit Work for Admin Review
                    </h3>

                    {submitError && (
                      <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300">
                        {submitError}
                      </div>
                    )}

                    {submitSuccess && (
                      <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300">
                        {submitSuccess}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Delivery Notes & Proof Summary
                      </label>
                      <textarea
                        rows={4}
                        value={submissionNotes}
                        onChange={(e) => setSubmissionNotes(e.target.value)}
                        placeholder="Explain how you completed the tasks, links to Google Sheets/Docs, and summary of results..."
                        className="w-full text-xs p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    {/* File Evidence Upload */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Attach Deliverable Files (Spreadsheets, PDFs, DOCX, ZIP)
                      </label>

                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-medium text-white flex items-center gap-2 transition-colors">
                          <Upload className="w-4 h-4 text-emerald-400" />
                          <span>{isUploading ? 'Uploading...' : 'Choose File to Upload'}</span>
                          <input
                            type="file"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[11px] text-slate-400">Up to 25 MB per file</span>
                      </div>

                      {/* Uploaded Files List */}
                      {submissionFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {submissionFiles.map((f, i) => (
                            <div
                              key={i}
                              className="text-xs flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 font-mono"
                            >
                              <span className="truncate text-slate-300">{f}</span>
                              <button
                                type="button"
                                onClick={() => setSubmissionFiles(submissionFiles.filter((_, idx) => idx !== i))}
                                className="text-rose-400 hover:text-rose-300 text-xs px-2"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      disabled={isSubmitting || isUploading}
                      onClick={handleSubmitWork}
                      className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting Deliverables...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Work for Review ({selectedJob.paymentAmount.toLocaleString()} KES)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Job Support Chat */}
              {activeDrawerTab === 'chat' && (
                <div className="h-full flex flex-col justify-between space-y-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto p-1">
                    {chatMessages.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/40 rounded-2xl border border-slate-800">
                        No messages yet for this project. Ask the Admin if you need clarifications!
                      </div>
                    ) : (
                      chatMessages.map((m) => {
                        const isMe = m.senderId === user?.id;
                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            <div className="text-[10px] text-slate-400 mb-0.5">
                              {m.senderName} ({m.senderRole}) · {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div
                              className={`p-3.5 rounded-2xl max-w-sm text-xs leading-relaxed ${
                                isMe
                                  ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                                  : 'bg-slate-800 text-white rounded-tl-none border border-slate-700'
                              }`}
                            >
                              {m.content}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-800 flex gap-2">
                    <input
                      type="text"
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      placeholder="Message the Admin about this project..."
                      className="flex-1 text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-emerald-500 focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      disabled={isSendingMessage || !newChatMessage.trim()}
                      className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold disabled:opacity-50 transition-colors"
                    >
                      Send
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
