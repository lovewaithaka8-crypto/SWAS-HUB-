export type Role = 'ADMIN' | 'AGENT' | 'CLIENT' | 'PENDING_PAYMENT';

export type UserStatus = 'ACTIVE' | 'PENDING_PAYMENT' | 'SUSPENDED';

export type JobStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CORRECTION_REQUIRED'
  | 'APPROVED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'PAID';

export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type TransactionType = 'REGISTRATION_FEE' | 'EARNING' | 'WITHDRAWAL';

export type TransactionStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REJECTED';

export type PaymentChannel = 'MPESA' | 'AIRTEL_MONEY' | 'BANK_TRANSFER' | 'CARD' | 'PAYPAL';

export type AgentPermission =
  | 'view_clients'
  | 'approve_clients'
  | 'activate_client_workplace'
  | 'suspend_client'
  | 'manage_client_jobs'
  | 'create_tasks'
  | 'assign_workers'
  | 'update_task_status'
  | 'approve_submissions'
  | 'manage_support_tickets'
  | 'handle_disputes'
  | 'review_payments'
  | 'request_withdrawal_approval'
  | 'process_withdrawals'
  | 'send_notifications'
  | 'manage_departments';

export type AgentRolePreset =
  | 'SUPPORT_AGENT'
  | 'OPERATIONS_AGENT'
  | 'FINANCE_AGENT'
  | 'SENIOR_AGENT'
  | 'CUSTOM';

export type RiskLevel = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  agentIdNumber?: string; // e.g., 'AG-0042'
  name: string;
  email: string;
  phone: string;
  role: Role;
  rolePreset?: AgentRolePreset;
  permissions?: AgentPermission[];
  isStaff?: boolean;
  department?: string;
  status: UserStatus;
  categoryId?: string;
  balance: number;
  mpesaNumber?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  active: boolean;
  agentCount?: number;
  jobCount?: number;
}

export interface Milestone {
  id: string;
  jobId: string;
  title: string;
  description?: string;
  status: MilestoneStatus;
  order: number;
}

export interface JobAssignment {
  id: string;
  jobId: string;
  agentId: string;
  status: JobStatus;
  assignedAt: string;
  acceptedAt?: string;
  completedAt?: string;
}

export interface Submission {
  id: string;
  jobId: string;
  agentId: string;
  agentName?: string;
  notes: string;
  fileUrls: string[];
  status: JobStatus;
  adminReview?: string;
  reviewedAt?: string;
  submittedAt: string;
  createdAt?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  categoryId: string;
  categoryName?: string;
  paymentAmount: number; // in KES
  deadline: string;
  deadlineDays?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: JobStatus;
  attachments: string[];
  clientId?: string;
  clientName?: string;
  assignedClientId?: string;
  assignedClient?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  createdAt: string;
  milestones: Milestone[];
  assignedAgentIds: string[];
  assignedAgents?: { id: string; name: string; email: string; avatarUrl?: string }[];
  submissions?: Submission[];
  // For agent perspective:
  currentAgentStatus?: JobStatus;
  agentSubmission?: Submission;
  correctionInstructions?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  reference: string;
  paymentChannel?: PaymentChannel;
  mpesaReceipt?: string;
  notes?: string;
  flutterwaveRef?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'job' | 'payment' | 'review' | 'system' | 'announcement' | 'agent_activity' | 'high_risk_alert';
  read: boolean;
  linkUrl?: string;
  riskLevel?: RiskLevel;
  relatedAgentName?: string;
  relatedItem?: string;
  createdAt: string;
}

export type CommunicationChannel = 'EMAIL' | 'WHATSAPP' | 'PORTAL';

export interface Workplace {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  agentId: string;
  agentName: string;
  department?: string;
  level: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'ARCHIVED';
  permissions: string[];
  jobsCount: number;
  tasksCount: number;
  messagesCount: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CommunicationMessage {
  id: string;
  workplaceId?: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  agentId?: string;
  agentName?: string;
  channel: CommunicationChannel;
  sender: 'CLIENT' | 'AGENT' | 'ADMIN';
  subject?: string;
  content: string;
  status: 'DELIVERED' | 'READ' | 'REPLIED' | 'WAITING' | 'ESCALATED';
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  attachments?: string[];
  createdAt: string;
  repliedAt?: string;
  repliedBy?: string;
}

export interface Message {
  id: string;
  jobId?: string;
  workplaceId?: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  receiverId?: string;
  content: string;
  channel?: CommunicationChannel;
  createdAt: string;
}

export interface PlatformSettings {
  registrationFee: number;
  currency: string;
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  flutterwavePublicKey: string;
  autoAssignNewAgents: boolean;
  minWithdrawalAmount: number;
  requireAdminApprovalForFinancials: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  userId?: string;
  userName?: string;
  timestamp: string;
  type: 'auth' | 'job' | 'payment' | 'admin' | 'withdrawal' | 'dispute' | 'support' | 'fraud' | 'permission' | 'client';
}

export type ClientStatus =
  | 'NEW'
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'ACTIVE'
  | 'REQUIRES_ATTENTION'
  | 'SUSPENDED'
  | 'INACTIVE'
  | 'PENDING_ACTIVATION'
  | 'RESTRICTED';

export interface ClientDocument {
  id: string;
  name: string;
  category: 'ID_CARD' | 'TAX_PIN' | 'CONTRACT' | 'PORTFOLIO' | 'CERTIFICATE' | 'WORK_AGREEMENT';
  fileUrl: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'CORRECTION_REQUIRED';
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone: string;
  status: ClientStatus;
  workplaceActivated: boolean;
  reviewedByAgentId?: string;
  reviewedByAgentName?: string;
  activatedAt?: string;
  rejectionReason?: string;
  verificationDocs?: string[];
  documents?: ClientDocument[];
  internalNotes?: string[];
  notes?: string;
  totalSpent: number;
  jobsPostedCount: number;
  completedJobsCount: number;
  joinedAt: string;
  // Monthly Employment & Payroll additions:
  monthlySalary?: number; // e.g. 35,000 KES
  department?: string; // e.g. 'Customer Support', 'Content Operations'
  contractStatus?: 'ACTIVE' | 'PENDING' | 'RENEWED' | 'SUSPENDED' | 'TERMINATED';
  contractStartDate?: string;
  contractEndDate?: string;
  nextPaymentDate?: string;
  workingHours?: string; // e.g. '40 hrs/week (Mon-Fri 09:00 - 17:00 EAT)'
  workingDays?: string; // e.g. 'Monday - Friday'
  responsibilities?: string[];
  supervisorAgentId?: string;
  supervisorAgentName?: string;
  mpesaPayoutNumber?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  avatarUrl?: string;
  currentWorkStatus?: 'ONLINE' | 'OFFLINE' | 'ON_BREAK' | 'IN_SESSION';
  lastActiveAt?: string;
  lastLoginAt?: string;
  lastSubmissionAt?: string;
  lastMessageAt?: string;
}

export interface MonthlyContract {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  department: string;
  monthlySalary: number; // in KES
  currency: string;
  status: 'ACTIVE' | 'PENDING' | 'RENEWED' | 'SUSPENDED' | 'TERMINATED';
  startDate: string;
  endDate: string;
  nextPaymentDate: string;
  paymentCycle: 'MONTHLY';
  workingHours: string;
  workingDays: string;
  responsibilities: string[];
  supervisorAgentId: string;
  supervisorAgentName: string;
  bonuses: number;
  deductions: number;
  internalNotes?: string;
  createdAt: string;
}

export type PayrollStatus = 'DRAFT' | 'REVIEWED' | 'APPROVED' | 'PROCESSING' | 'PAID' | 'FAILED';

export interface MonthlyPayrollRecord {
  id: string;
  payrollMonth: string; // e.g. 'October 2026'
  clientId: string;
  clientName: string;
  clientEmail: string;
  department: string;
  basicMonthlyPay: number;
  bonus: number;
  bonusReason?: string;
  deductions: number;
  deductionReason?: string;
  adjustments: number;
  netPayment: number;
  status: PayrollStatus;
  paymentMethod: 'MPESA' | 'BANK_TRANSFER' | 'PESALINK' | 'AIRTEL_MONEY';
  payoutAccount: string;
  transactionReference?: string;
  approvalStatus: 'PENDING_REVIEW' | 'REVIEWED' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface ClientWorkSession {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';
  taskDescription: string;
  relatedJobId?: string;
  relatedJobTitle?: string;
  notes?: string;
  verifiedBySupervisor?: boolean;
}

export interface AuditTrailEntry {
  id: string;
  agentId: string;
  agentName: string;
  agentRole: string; // e.g., 'Operations Agent', 'Senior Agent', 'Support Agent', 'Finance Agent', 'Admin'
  action: string; // e.g., 'Assigned task', 'Changed job status', 'Approved client workplace', etc.
  itemType: 'JOB' | 'CLIENT' | 'TASK' | 'WITHDRAWAL' | 'USER' | 'PERMISSION' | 'SETTING';
  itemId: string; // e.g. '#JOB-10482', 'Client #C102'
  itemName: string; // e.g. 'Fintech App QA Testing', 'Jane Wanjiku'
  fieldChanged?: string; // e.g. 'Status', 'Worker Assigned', 'Payment Amount', 'Workplace Activation'
  previousValue?: string; // Before
  newValue?: string; // After
  reason?: string;
  department?: string;
  riskLevel?: RiskLevel;
  requiresAdminApproval?: boolean;
  approvalStatus?: 'NOT_REQUIRED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  ipAddress?: string;
  deviceInfo?: string;
  timestamp?: string;
  date?: string;
  time?: string;
}

export interface Dispute {
  id: string;
  jobId: string;
  jobTitle: string;
  clientId: string;
  clientName: string;
  workerId: string;
  workerName: string;
  amount: number;
  reason: string;
  evidenceNotes: string;
  evidenceFiles?: string[];
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED_WORKER' | 'RESOLVED_CLIENT' | 'REFUNDED';
  verdict?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  subject: string;
  category: 'Account' | 'Payment' | 'Withdrawal' | 'Job' | 'Worker' | 'Client' | 'Technical' | 'Dispute';
  status: 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  messages: {
    senderId: string;
    senderName: string;
    senderRole: Role;
    message: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  category: string;
  defaultPay: number;
  estimatedHours: number;
  description: string;
  requirements: string[];
}

export interface FraudAlert {
  id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: 'MULTI_ACCOUNT' | 'SUSPICIOUS_TX' | 'UNUSUAL_WITHDRAWAL' | 'RAPID_SUBMIT' | 'FAILED_LOGIN';
  title: string;
  description: string;
  targetId: string;
  targetName: string;
  timestamp: string;
  status: 'ACTIVE' | 'DISMISSED' | 'INVESTIGATING';
}

export interface WorkerLevel {
  id: string;
  name: 'Beginner' | 'Verified' | 'Skilled' | 'Expert' | 'Elite';
  minJobs: number;
  minApprovalRate: number;
  perks: string;
  badgeColor: string;
}
