import React, { useState, useEffect } from 'react';
import { apiRequest, uploadFile } from '../../lib/api.ts';
import { Job, Category, User, Submission } from '../../types/index.ts';
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
  FileCheck,
  Sparkles
} from 'lucide-react';

export const AdminJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Create Job Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobRequirements, setJobRequirements] = useState<string[]>([
    'Complete tasks according to template specifications',
    'Zero plagiarism / formatting errors',
  ]);
  const [newRequirementText, setNewRequirementText] = useState('');
  const [jobCategoryId, setJobCategoryId] = useState('');
  const [jobPaymentAmount, setJobPaymentAmount] = useState('12000');
  const [jobDeadline, setJobDeadline] = useState('2026-10-25');
  const [jobAttachments, setJobAttachments] = useState<string[]>([]);
  const [jobMilestones, setJobMilestones] = useState<{ title: string; description?: string }[]>([
    { title: 'Milestone 1: Preliminary Draft & Outline' },
    { title: 'Milestone 2: Final Polished Delivery' },
  ]);
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Review Drawer State
  const [reviewDrawerJob, setReviewDrawerJob] = useState<Job | null>(null);
  const [activeReviewSubmission, setActiveReviewSubmission] = useState<Submission | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  const fetchData = async () => {
    try {
      const [jobsRes, catsRes, agentsRes] = await Promise.all([
        apiRequest<{ jobs: Job[] }>('/api/jobs'),
        apiRequest<{ categories: Category[] }>('/api/categories'),
        apiRequest<{ agents: any[] }>('/api/agents'),
      ]);
      setJobs(jobsRes.jobs || []);
      setCategories(catsRes.categories || []);
      setAgents(agentsRes.agents || []);
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

  const handleAddRequirement = () => {
    if (!newRequirementText.trim()) return;
    setJobRequirements([...jobRequirements, newRequirementText.trim()]);
    setNewRequirementText('');
  };

  const handleAddMilestone = () => {
    if (!newMilestoneText.trim()) return;
    setJobMilestones([...jobMilestones, { title: newMilestoneText.trim() }]);
    setNewMilestoneText('');
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingJob(true);
    try {
      await apiRequest('/api/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title: jobTitle,
          description: jobDescription,
          requirements: jobRequirements,
          categoryId: jobCategoryId,
          paymentAmount: Number(jobPaymentAmount),
          deadline: jobDeadline,
          attachments: jobAttachments,
          milestones: jobMilestones,
          assignedAgentIds: selectedAgentIds,
        }),
      });
      setIsCreateModalOpen(false);
      setJobTitle('');
      setJobDescription('');
      setSelectedAgentIds([]);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create job');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const openReviewDrawer = async (job: Job) => {
    setReviewDrawerJob(job);
    setReviewNotes('');
    setReviewDecision('APPROVE');
    try {
      const res = await apiRequest<{ job: Job }>(`/api/jobs/${job.id}`);
      setReviewDrawerJob(res.job);
      setActiveReviewSubmission(res.job.agentSubmission || null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessReview = async () => {
    if (!reviewDrawerJob) return;
    setIsReviewing(true);
    try {
      await apiRequest(`/api/jobs/${reviewDrawerJob.id}/review`, {
        method: 'POST',
        body: JSON.stringify({
          status: reviewDecision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          reviewNotes: reviewNotes || (reviewDecision === 'APPROVE' ? 'Quality criteria satisfied.' : 'Revisions requested.'),
        }),
      });
      setReviewDrawerJob(null);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to review submission');
    } finally {
      setIsReviewing(false);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'ALL' || j.categoryId === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || j.status === filterStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Project Jobs & Review Queue</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Publish project briefs with milestone criteria, dispatch work to agents, and evaluate deliverable evidence.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/15 flex items-center gap-2 transition-all self-start sm:self-auto hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Project Job</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-800/90 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Under Review (Action Needed)</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="APPROVED">Approved & Paid</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="REJECTED">Revision Requested</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid / Table */}
      <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading projects database...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No projects found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800/80 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Project Title & Category</th>
                  <th className="px-6 py-4">Assigned Agents</th>
                  <th className="px-6 py-4">Escrow Budget</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Review Deliverables</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredJobs.map((job) => {
                  const hasPendingReview = job.status === 'SUBMITTED';

                  return (
                    <tr
                      key={job.id}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        hasPendingReview ? 'bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-white max-w-sm truncate text-sm">{job.title}</div>
                        <div className="text-[11px] text-emerald-400 mt-0.5">{job.categoryName}</div>
                      </td>

                      <td className="px-6 py-4">
                        {job.assignedAgents?.length ? (
                          <div className="flex items-center gap-1.5">
                            {job.assignedAgents.slice(0, 3).map((ag) => (
                              <span
                                key={ag.id}
                                className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-slate-200 font-medium"
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

                      <td className="px-6 py-4 font-mono font-bold text-emerald-400 text-sm">
                        {job.paymentAmount.toLocaleString()} KES
                      </td>

                      <td className="px-6 py-4 text-slate-300 font-mono text-[11px]">
                        {new Date(job.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            job.status === 'APPROVED'
                              ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
                              : job.status === 'SUBMITTED'
                              ? 'text-purple-400 bg-purple-950/60 border-purple-800/60'
                              : job.status === 'IN_PROGRESS'
                              ? 'text-sky-400 bg-sky-950/60 border-sky-800/60'
                              : job.status === 'REJECTED'
                              ? 'text-rose-400 bg-rose-950/60 border-rose-800/60'
                              : 'text-slate-400 bg-slate-950/60 border-slate-800/60'
                          }`}
                        >
                          {job.status === 'SUBMITTED' ? 'Action: Review Needed' : job.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openReviewDrawer(job)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ml-auto ${
                            hasPendingReview
                              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-900/30'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{hasPendingReview ? 'Evaluate Work' : 'Inspect'}</span>
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

      {/* Slide-over Review Drawer */}
      {reviewDrawerJob && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex justify-end">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                  <span className="text-emerald-400 font-semibold">{reviewDrawerJob.categoryName}</span>
                  <span>·</span>
                  <span className="font-mono font-bold text-white">
                    {reviewDrawerJob.paymentAmount.toLocaleString()} KES Escrow
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{reviewDrawerJob.title}</h3>
              </div>
              <button
                onClick={() => setReviewDrawerJob(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeReviewSubmission ? (
                <div className="space-y-6">
                  {/* Submission Meta */}
                  <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Delivered By:</span>
                      <span className="font-bold text-white">{activeReviewSubmission.agentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Submission Timestamp:</span>
                      <span className="font-mono text-slate-300">
                        {new Date(activeReviewSubmission.submittedAt || activeReviewSubmission.createdAt || Date.now()).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Status:</span>
                      <span className="font-mono font-bold text-purple-400">{activeReviewSubmission.status}</span>
                    </div>
                  </div>

                  {/* Evidence Notes */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Agent Evidence Notes & Summary
                    </h4>
                    <p className="text-xs text-slate-200 whitespace-pre-line bg-slate-950/60 p-4 rounded-2xl border border-slate-800 leading-relaxed">
                      {activeReviewSubmission.notes}
                    </p>
                  </div>

                  {/* Uploaded Deliverables */}
                  {activeReviewSubmission.fileUrls?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Uploaded Deliverable Evidence
                      </h4>
                      <div className="space-y-2">
                        {activeReviewSubmission.fileUrls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 text-emerald-400 font-mono text-xs transition-colors"
                          >
                            <span className="truncate">{url}</span>
                            <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review Actions Form */}
                  <div className="pt-6 border-t border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Admin Evaluation & Decision
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setReviewDecision('APPROVE')}
                        className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          reviewDecision === 'APPROVE'
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-500'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Approve & Release Pay</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReviewDecision('REJECT')}
                        className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          reviewDecision === 'REJECT'
                            ? 'border-rose-500 bg-rose-500/20 text-rose-300 ring-2 ring-rose-500'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>Request Revisions</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Feedback & QA Notes for Agent
                      </label>
                      <textarea
                        rows={3}
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder={
                          reviewDecision === 'APPROVE'
                            ? 'Quality criteria satisfied! Approved for instant payout.'
                            : 'Specify required adjustments, missing fields, or correction guidelines...'
                        }
                        className="w-full text-xs p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <button
                      disabled={isReviewing}
                      onClick={handleProcessReview}
                      className={`w-full py-3 rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${
                        reviewDecision === 'APPROVE'
                          ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-500/20'
                          : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-900/30'
                      }`}
                    >
                      {isReviewing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : reviewDecision === 'APPROVE' ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>
                            Approve Deliverables & Credit {reviewDrawerJob.paymentAmount.toLocaleString()} KES
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>Send Revision Notice to Agent</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs bg-slate-950/40 rounded-2xl border border-slate-800">
                  Agent has not yet submitted deliverables for this project.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden my-8">
            <div className="p-6 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">Create Project-Based Job</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Title</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. B2B SaaS Case Studies & High-Converting SEO Blog Articles"
                  className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Workplace Category</label>
                  <select
                    value={jobCategoryId}
                    onChange={(e) => setJobCategoryId(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Payment Payout (KES)</label>
                  <input
                    type="number"
                    required
                    value={jobPaymentAmount}
                    onChange={(e) => setJobPaymentAmount(e.target.value)}
                    placeholder="15000"
                    className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={jobDeadline}
                    onChange={(e) => setJobDeadline(e.target.value)}
                    className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Detailed Description & Brief</label>
                <textarea
                  rows={4}
                  required
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Explain scope, deliverables, file formats, and client specifications..."
                  className="w-full text-xs p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Deliverable Acceptance Criteria
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newRequirementText}
                    onChange={(e) => setNewRequirementText(e.target.value)}
                    placeholder="Add mandatory requirement..."
                    className="flex-1 text-xs px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddRequirement}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1.5">
                  {jobRequirements.map((r, i) => (
                    <div
                      key={i}
                      className="text-xs flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-300"
                    >
                      <span>{r}</span>
                      <button
                        type="button"
                        onClick={() => setJobRequirements(jobRequirements.filter((_, idx) => idx !== i))}
                        className="text-rose-400 hover:text-rose-300 text-xs px-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Milestones</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newMilestoneText}
                    onChange={(e) => setNewMilestoneText(e.target.value)}
                    placeholder="Add milestone title..."
                    className="flex-1 text-xs px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1.5">
                  {jobMilestones.map((m, i) => (
                    <div
                      key={i}
                      className="text-xs flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-300"
                    >
                      <span>
                        {i + 1}. {m.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => setJobMilestones(jobMilestones.filter((_, idx) => idx !== i))}
                        className="text-rose-400 hover:text-rose-300 text-xs px-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assign to Agents */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Assign Project to Accredited Agents
                </label>
                <div className="max-h-36 overflow-y-auto border border-slate-800 rounded-xl p-2 space-y-1 bg-slate-950">
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
                        className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer text-xs transition-colors ${
                          isSelected ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold' : 'hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <div>
                          <span>{ag.name}</span>{' '}
                          <span className="text-[11px] text-slate-400">({ag.email})</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingJob}
                  className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmittingJob ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Publish Project & Dispatch to Assigned Agents</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
