import React, { useState, useEffect } from 'react';
import { apiRequest, uploadFile } from '../../lib/api.ts';
import { Job, Category, Submission, TaskTemplate } from '../../types/index.ts';
import {
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  Users,
  Paperclip,
  X,
  Upload,
  Calendar,
  DollarSign,
  ChevronRight,
  Eye,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
  Copy,
  Pause,
  Play,
  RotateCcw,
  FileText,
  Star
} from 'lucide-react';

interface Props {
  initialCreateOpen?: boolean;
}

export const AdminTasksJobs: React.FC<Props> = ({ initialCreateOpen = false }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Create Task Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(initialCreateOpen);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobRequirements, setJobRequirements] = useState<string[]>([
    'Clean deliverables adhering strictly to template specifications',
    'Zero plagiarism / accurate formatting',
  ]);
  const [newRequirementText, setNewRequirementText] = useState('');
  const [jobCategoryId, setJobCategoryId] = useState('');
  const [workerPaymentAmount, setWorkerPaymentAmount] = useState('12000');
  const [clientPrice, setClientPrice] = useState('15000');
  const [jobDeadline, setJobDeadline] = useState('2026-10-25');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');
  const [estimatedHours, setEstimatedHours] = useState('12');
  const [jobMilestones, setJobMilestones] = useState<{ title: string; description?: string }[]>([
    { title: 'Milestone 1: Preliminary Outline & Verification' },
    { title: 'Milestone 2: Final Polished Deliverable Upload' },
  ]);
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [autoAssignMode, setAutoAssignMode] = useState(false);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);

  // Review Drawer State
  const [reviewDrawerJob, setReviewDrawerJob] = useState<Job | null>(null);
  const [activeReviewSubmission, setActiveReviewSubmission] = useState<Submission | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  const fetchData = async () => {
    try {
      const [jobsRes, catsRes, agentsRes, tmplRes] = await Promise.all([
        apiRequest<{ jobs: Job[] }>('/api/jobs'),
        apiRequest<{ categories: Category[] }>('/api/categories'),
        apiRequest<{ agents: any[] }>('/api/agents'),
        apiRequest<{ templates: TaskTemplate[] }>('/api/templates').catch(() => ({ templates: [] })),
      ]);
      setJobs(jobsRes.jobs || []);
      setCategories(catsRes.categories || []);
      setAgents(agentsRes.agents || []);
      setTemplates(tmplRes.templates || []);
      if (catsRes.categories?.length > 0 && !jobCategoryId) {
        setJobCategoryId(catsRes.categories[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyTemplate = (tmpl: TaskTemplate) => {
    setJobTitle(tmpl.name);
    setJobDescription(tmpl.description);
    setWorkerPaymentAmount(String(tmpl.defaultPay));
    setClientPrice(String(Math.round(tmpl.defaultPay * 1.25)));
    setEstimatedHours(String(tmpl.estimatedHours));
    setJobRequirements(tmpl.requirements);
    if (tmpl.category) setJobCategoryId(tmpl.category);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingJob(true);
    try {
      let finalAgentIds = selectedAgentIds;
      if (autoAssignMode && agents.length > 0) {
        // Smart recommendation: Pick agent in category with highest completion rate
        const matched = agents.filter((a) => !a.categoryId || a.categoryId === jobCategoryId);
        if (matched.length > 0) {
          finalAgentIds = [matched[0].id];
        } else {
          finalAgentIds = [agents[0].id];
        }
      }

      await apiRequest('/api/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title: jobTitle,
          description: jobDescription,
          requirements: jobRequirements,
          categoryId: jobCategoryId,
          paymentAmount: Number(workerPaymentAmount),
          deadline: new Date(jobDeadline).toISOString(),
          milestones: jobMilestones,
          assignedAgentIds: finalAgentIds,
        }),
      });

      setIsCreateModalOpen(false);
      setJobTitle('');
      setJobDescription('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create task');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const handleOpenReview = (job: Job) => {
    setReviewDrawerJob(job);
    if (job.submissions && job.submissions.length > 0) {
      setActiveReviewSubmission(job.submissions[0]);
    } else {
      setActiveReviewSubmission(null);
    }
    setReviewDecision('APPROVE');
    setReviewNotes('');
  };

  const handleProcessReview = async () => {
    if (!reviewDrawerJob || !activeReviewSubmission) return;
    setIsReviewing(true);
    try {
      await apiRequest(`/api/jobs/${reviewDrawerJob.id}/review`, {
        method: 'POST',
        body: JSON.stringify({
          agentId: activeReviewSubmission.agentId,
          decision: reviewDecision,
          reviewNotes: reviewNotes || (reviewDecision === 'APPROVE' ? 'Approved by Admin' : 'Changes required'),
        }),
      });
      setReviewDrawerJob(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Review processing failed');
    } finally {
      setIsReviewing(false);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || j.categoryId === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || j.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Advanced Task & Project Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Create tasks from templates, smart-assign best matched workers, monitor milestone execution, and verify QA.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Task</span>
        </button>
      </div>

      {/* Task Templates Bar */}
      {templates.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fast Task Templates (Click to clone into creator):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {templates.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => {
                  handleApplyTemplate(tmpl);
                  setIsCreateModalOpen(true);
                }}
                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-medium transition-colors flex items-center gap-2"
              >
                <span>{tmpl.name}</span>
                <span className="font-mono text-emerald-400 font-bold">{tmpl.defaultPay.toLocaleString()} KES</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title, skills, brief..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
          >
            <option value="ALL">All Departments</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
          >
            <option value="ALL">All Task Statuses</option>
            <option value="SUBMITTED">Under Review (QA Action Needed)</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="APPROVED">Approved & Paid</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="REJECTED">Revision Requested</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading tasks...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No tasks match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-medium uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Task Title & Department</th>
                  <th className="px-6 py-3.5">Assigned Workers</th>
                  <th className="px-6 py-3.5">Worker Pay / Escrow</th>
                  <th className="px-6 py-3.5">Deadline</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredJobs.map((job) => {
                  const isPendingReview = job.status === 'SUBMITTED';

                  return (
                    <tr
                      key={job.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isPendingReview ? 'bg-purple-950/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-white max-w-sm truncate">{job.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{job.categoryName}</div>
                      </td>

                      <td className="px-6 py-4">
                        {job.assignedAgents?.length ? (
                          <div className="flex items-center gap-1.5">
                            {job.assignedAgents.slice(0, 3).map((ag) => (
                              <span
                                key={ag.id}
                                className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-slate-200 font-medium"
                              >
                                {ag.name.split(' ')[0]}
                              </span>
                            ))}
                            {job.assignedAgents.length > 3 && (
                              <span className="text-[10px] text-slate-400">+{job.assignedAgents.length - 3}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                        {job.paymentAmount.toLocaleString()} KES
                      </td>

                      <td className="px-6 py-4 font-mono text-slate-400 text-[11px]">
                        {new Date(job.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-[11px] font-semibold ${
                            job.status === 'APPROVED'
                              ? 'text-emerald-400'
                              : job.status === 'SUBMITTED'
                              ? 'text-purple-400 font-bold'
                              : job.status === 'IN_PROGRESS'
                              ? 'text-sky-400'
                              : job.status === 'REJECTED'
                              ? 'text-rose-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {job.status === 'SUBMITTED' ? 'Ready for Review' : job.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenReview(job)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1.5 ${
                            isPendingReview
                              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isPendingReview ? 'Review Work' : 'Inspect'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Submission Drawer */}
      {reviewDrawerJob && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col overflow-hidden text-slate-100">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">
                  Deliverable Review & Arbitration
                </div>
                <h3 className="text-base font-bold text-white truncate max-w-md">{reviewDrawerJob.title}</h3>
              </div>
              <button
                onClick={() => setReviewDrawerJob(null)}
                className="text-slate-400 hover:text-white p-1 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Worker Pay Payout:</span>
                  <span className="font-bold text-emerald-400">
                    {reviewDrawerJob.paymentAmount.toLocaleString()} KES
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Department:</span>
                  <span className="text-slate-200">{reviewDrawerJob.categoryName}</span>
                </div>
              </div>

              {activeReviewSubmission ? (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Worker Submission Delivery
                  </h4>

                  <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/80 space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-800 pb-2 text-[11px]">
                      <span className="text-slate-400">Submitted at:</span>
                      <span className="font-mono text-slate-300">
                        {new Date(activeReviewSubmission.submittedAt).toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-300 block mb-1">Worker Notes & Evidence Summary:</span>
                      <p className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-200 leading-relaxed whitespace-pre-line">
                        {activeReviewSubmission.notes}
                      </p>
                    </div>

                    {activeReviewSubmission.fileUrls?.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-300 block mb-1">Attached Deliverables:</span>
                        <div className="space-y-1.5">
                          {activeReviewSubmission.fileUrls.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-emerald-400 font-mono text-[11px]"
                            >
                              <span className="truncate">{url}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Decision Actions */}
                  <div className="pt-4 border-t border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Evaluation Decision
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setReviewDecision('APPROVE')}
                        className={`py-3 px-4 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                          reviewDecision === 'APPROVE'
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-500'
                            : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Approve & Release Funds</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReviewDecision('REJECT')}
                        className={`py-3 px-4 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                          reviewDecision === 'REJECT'
                            ? 'border-rose-500 bg-rose-500/20 text-rose-300 ring-2 ring-rose-500'
                            : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>Request Revision</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Review Feedback for Worker
                      </label>
                      <textarea
                        rows={3}
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Provide QA notes, checklist approval, or revision requirements..."
                        className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <button
                      disabled={isReviewing}
                      onClick={handleProcessReview}
                      className={`w-full py-3 rounded-2xl text-xs font-bold shadow-lg transition-all ${
                        reviewDecision === 'APPROVE'
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          : 'bg-rose-600 hover:bg-rose-500 text-white'
                      }`}
                    >
                      {isReviewing ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : reviewDecision === 'APPROVE' ? (
                        <span>Release {reviewDrawerJob.paymentAmount.toLocaleString()} KES to Worker Balance</span>
                      ) : (
                        <span>Send Revision Notice</span>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No deliverables submitted yet for this project.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Advanced Task Creator Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-100">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Create New Task / Contract</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. B2B Enterprise Migration Case Studies (Batch 2)"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={jobCategoryId}
                    onChange={(e) => setJobCategoryId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Worker Payout (KES)</label>
                  <input
                    type="number"
                    required
                    value={workerPaymentAmount}
                    onChange={(e) => setWorkerPaymentAmount(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Client Escrow (KES)</label>
                  <input
                    type="number"
                    value={clientPrice}
                    onChange={(e) => setClientPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Deadline</label>
                  <input
                    type="date"
                    required
                    value={jobDeadline}
                    onChange={(e) => setJobDeadline(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Work Hours</label>
                  <input
                    type="number"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Brief</label>
                <textarea
                  rows={4}
                  required
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Explain scope, deliverables, file formats, and client specifications..."
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Smart Worker Assignment */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Smart Worker Assignment</span>
                  </span>
                  <label className="text-xs text-slate-400 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoAssignMode}
                      onChange={(e) => setAutoAssignMode(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded"
                    />
                    <span>Auto-assign best ranked worker</span>
                  </label>
                </div>

                {!autoAssignMode && (
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {agents.map((ag) => {
                      const isSelected = selectedAgentIds.includes(ag.id);
                      return (
                        <div
                          key={ag.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedAgentIds(selectedAgentIds.filter((id) => id !== ag.id));
                            } else {
                              setSelectedAgentIds([...selectedAgentIds, ag.id]);
                            }
                          }}
                          className={`p-2 rounded-xl flex items-center justify-between text-xs cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                              : 'hover:bg-slate-900 text-slate-300'
                          }`}
                        >
                          <div>
                            <span className="font-semibold text-white">{ag.name}</span>{' '}
                            <span className="text-slate-500 text-[11px]">({ag.categoryName || 'General'})</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingJob}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl text-xs font-bold shadow-lg transition-all"
              >
                {isSubmittingJob ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <span>Publish Task Contract</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
