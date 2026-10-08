import fs from 'fs';
import path from 'path';
import {
  User,
  Category,
  Job,
  Milestone,
  JobAssignment,
  Submission,
  Transaction,
  Notification,
  Message,
  PlatformSettings,
  ActivityLog,
  JobStatus,
  Client,
  MonthlyContract,
  MonthlyPayrollRecord,
  ClientWorkSession,
  Dispute,
  SupportTicket,
  FraudAlert,
  TaskTemplate
} from '../types/index.ts';

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  categories: Category[];
  jobs: Job[];
  jobAssignments: JobAssignment[];
  submissions: Submission[];
  transactions: Transaction[];
  notifications: Notification[];
  messages: Message[];
  settings: PlatformSettings;
  activityLogs: ActivityLog[];
  clients: Client[];
  contracts: MonthlyContract[];
  monthlyPayroll: MonthlyPayrollRecord[];
  workSessions: ClientWorkSession[];
  disputes: Dispute[];
  supportTickets: SupportTicket[];
  fraudAlerts: FraudAlert[];
  taskTemplates: TaskTemplate[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'swashub_db.json');

const INITIAL_SETTINGS: PlatformSettings = {
  registrationFee: 5000,
  currency: 'KES',
  platformName: 'Swashub',
  supportEmail: 'support@swashub.com',
  supportPhone: '+254 700 800900',
  flutterwavePublicKey: 'FLWPUBK_TEST-SWASHUB-PROD-2026',
  autoAssignNewAgents: true,
  minWithdrawalAmount: 1000,
  requireAdminApprovalForFinancials: true,
};

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-data-entry',
    name: 'Data Entry & Analysis',
    slug: 'data-entry',
    description: 'Tabular spreadsheet organization, data validation, web scraping, and database cleaning.',
    icon: 'Database',
    active: true,
  },
  {
    id: 'cat-content-writing',
    name: 'Content Writing & SEO Copy',
    slug: 'content-writing',
    description: 'Technical writing, case studies, blog posts, whitepapers, and SEO copywriting.',
    icon: 'PenTool',
    active: true,
  },
  {
    id: 'cat-customer-support',
    name: 'Customer Support & Chat Ops',
    slug: 'customer-support',
    description: 'Live chat assistance, email ticketing triage, customer feedback resolution, and FAQs.',
    icon: 'Headphones',
    active: true,
  },
  {
    id: 'cat-graphic-design',
    name: 'Graphic Design & Creative',
    slug: 'graphic-design',
    description: 'Brand identity assets, promotional banners, social media kits, and UI audit screens.',
    icon: 'Palette',
    active: true,
  },
  {
    id: 'cat-virtual-assist',
    name: 'Virtual Assistance & Admin Support',
    slug: 'virtual-assistance',
    description: 'Executive scheduling, invoice reconciliation, research compilation, and email handling.',
    icon: 'Briefcase',
    active: true,
  },
  {
    id: 'cat-transcription',
    name: 'Audio Transcription & Translation',
    slug: 'transcription',
    description: 'Interviews, legal proceedings, Swahili-English translations, and video subtitling.',
    icon: 'Mic',
    active: true,
  },
];

const INITIAL_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'usr-admin-1',
    name: 'Swashub Administrator',
    email: 'admin@swashub.com',
    phone: '+254 700 800900',
    role: 'ADMIN',
    status: 'ACTIVE',
    balance: 0,
    mpesaNumber: '+254 700 800900',
    avatarUrl: '/src/assets/images/hero_swashub_workspace_1791395160174.jpg',
    bio: 'Platform Operations & Quality Assurance Director at Swashub Kenya.',
    createdAt: '2026-01-01T08:00:00.000Z',
    passwordHash: 'admin123',
  },
  {
    id: 'usr-agent-sarah',
    name: 'Sarah Mwangi',
    email: 'sarah.mwangi@gmail.com',
    phone: '+254 712 345678',
    role: 'AGENT',
    status: 'ACTIVE',
    categoryId: 'cat-content-writing',
    balance: 14500,
    mpesaNumber: '+254 712 345678',
    avatarUrl: '/src/assets/images/agent_avatar_sarah_1791395183231.jpg',
    bio: 'Certified digital copywriter & researcher with 3+ years experience in B2B fintech and e-commerce writing.',
    createdAt: '2026-02-10T11:20:00.000Z',
    passwordHash: 'agent123',
  },
  {
    id: 'usr-agent-brian',
    name: 'Brian Kiprono',
    email: 'brian.kiprono@yahoo.com',
    phone: '+254 722 987654',
    role: 'AGENT',
    status: 'ACTIVE',
    categoryId: 'cat-data-entry',
    balance: 8000,
    mpesaNumber: '+254 722 987654',
    avatarUrl: '/src/assets/images/agent_avatar_brian_1791395193037.jpg',
    bio: 'Data accuracy specialist focused on spreadsheet automation, structured CSV normalization, and catalog auditing.',
    createdAt: '2026-02-15T14:15:00.000Z',
    passwordHash: 'agent123',
  },
  {
    id: 'usr-agent-esther',
    agentIdNumber: 'AG-0042',
    name: 'Esther Njoki',
    email: 'esther.njoki@swashub.com',
    phone: '+254 721 334455',
    role: 'AGENT',
    rolePreset: 'SENIOR_AGENT',
    isStaff: true,
    department: 'Customer Support',
    status: 'ACTIVE',
    balance: 24000,
    mpesaNumber: '+254 721 334455',
    avatarUrl: '/src/assets/images/agent_avatar_sarah_1791395183231.jpg',
    bio: 'Senior Operations Agent & Supervisor for Customer Support monthly clients.',
    createdAt: '2026-01-10T09:00:00.000Z',
    passwordHash: 'agent123',
  },
  {
    id: 'usr-client-jane',
    name: 'Jane Wanjiku',
    email: 'jane.wanjiku@gmail.com',
    phone: '+254 728 554433',
    role: 'CLIENT',
    status: 'ACTIVE',
    balance: 35000,
    mpesaNumber: '+254 728 554433',
    avatarUrl: '/src/assets/images/agent_avatar_sarah_1791395183231.jpg',
    bio: 'Customer Support Specialist under monthly employment contract supervised by Esther Njoki.',
    createdAt: '2026-02-20T08:00:00.000Z',
    passwordHash: 'client123',
  },
  {
    id: 'usr-pending-applicant',
    name: 'David Omondi',
    email: 'applicant@swashub.com',
    phone: '+254 733 445566',
    role: 'PENDING_PAYMENT',
    status: 'PENDING_PAYMENT',
    categoryId: 'cat-customer-support',
    balance: 0,
    mpesaNumber: '+254 733 445566',
    bio: 'Applicant awaiting registration fee confirmation via M-Pesa.',
    createdAt: '2026-03-01T09:30:00.000Z',
    passwordHash: 'applicant123',
  },
];

const INITIAL_JOBS: Job[] = [
  {
    id: 'job-101',
    title: 'E-Commerce Product Catalog Data Extraction & Cleaning',
    description: 'Normalize and enrich 2,400 product listings from vendor CSVs. Verify barcode values, format tax categories, align unit pricing in KES, and flag duplicate SKUs.',
    requirements: [
      'Clean spreadsheet containing all 2,400 SKUs formatted according to template',
      'Zero missing required attributes (title, SKU, price, tax band)',
      'Upload final sanitized XLSX and QA discrepancy summary sheet'
    ],
    categoryId: 'cat-data-entry',
    categoryName: 'Data Entry & Analysis',
    paymentAmount: 12500,
    deadline: '2026-10-18T18:00:00.000Z',
    status: 'IN_PROGRESS',
    attachments: [
      'https://swashub.com/docs/templates/Product_Catalog_Master_Template_v2.xlsx',
      'https://swashub.com/docs/guidelines/Kenyan_Retail_Tax_Standard_2026.pdf'
    ],
    createdAt: '2026-10-02T10:00:00.000Z',
    assignedAgentIds: ['usr-agent-brian'],
    milestones: [
      {
        id: 'ms-101-1',
        jobId: 'job-101',
        title: 'Initial Vendor CSV Audit & Schema Alignment',
        description: 'Verify column mappings and check for corrupted encoding.',
        status: 'COMPLETED',
        order: 1,
      },
      {
        id: 'ms-101-2',
        jobId: 'job-101',
        title: 'Batch Normalization of 2,400 SKUs',
        description: 'Apply formula cleaning, trim whitespaces, and validate barcodes.',
        status: 'IN_PROGRESS',
        order: 2,
      },
      {
        id: 'ms-101-3',
        jobId: 'job-101',
        title: 'Final Discrepancy QA & Delivery Upload',
        description: 'Run automated integrity check script and upload finished file.',
        status: 'PENDING',
        order: 3,
      },
    ],
  },
  {
    id: 'job-102',
    title: 'B2B SaaS Case Studies & High-Converting SEO Blog Articles',
    description: 'Write 3 in-depth case study articles (1,200 words each) highlighting enterprise client migrations to cloud payment infrastructure in East Africa.',
    requirements: [
      'Original copywriting passing 100% plagiarism check',
      'Natural integration of target high-intent keywords',
      'Include quote placeholders, callout metrics, and meta description',
      'Submit formatted Google Docs / Word DOCX with source links'
    ],
    categoryId: 'cat-content-writing',
    categoryName: 'Content Writing & SEO Copy',
    paymentAmount: 18000,
    deadline: '2026-10-15T15:00:00.000Z',
    status: 'SUBMITTED',
    attachments: [
      'https://swashub.com/docs/briefs/EastAfrica_Fintech_CaseStudies_Brief.pdf'
    ],
    createdAt: '2026-10-03T11:30:00.000Z',
    assignedAgentIds: ['usr-agent-sarah'],
    milestones: [
      {
        id: 'ms-102-1',
        jobId: 'job-102',
        title: 'Outline & Executive Summary Approval',
        description: 'Submit structural outlines for all 3 case studies.',
        status: 'COMPLETED',
        order: 1,
      },
      {
        id: 'ms-102-2',
        jobId: 'job-102',
        title: 'First Draft Submission',
        description: 'Complete drafts of Case Study 1 and Case Study 2.',
        status: 'COMPLETED',
        order: 2,
      },
      {
        id: 'ms-102-3',
        jobId: 'job-102',
        title: 'Final Polished Package & SEO Meta Tags',
        description: 'Complete Case Study 3, add headers, meta tags, and QA report.',
        status: 'COMPLETED',
        order: 3,
      },
    ],
  },
  {
    id: 'job-103',
    title: 'Technical Customer Support Ticket Resolution & FAQ Guide',
    description: 'Process 180 escalated support tickets regarding mobile payment reconciliation, prepare detailed empathetic responses, and compile a 10-page master FAQ handbook.',
    requirements: [
      '180 ticket draft replies adhering to quality SLA standards',
      '10-page verified knowledge base FAQ document',
      'Categorized report on top 5 root causes'
    ],
    categoryId: 'cat-customer-support',
    categoryName: 'Customer Support & Chat Ops',
    paymentAmount: 9500,
    deadline: '2026-10-05T17:00:00.000Z',
    status: 'APPROVED',
    attachments: [
      'https://swashub.com/docs/guidelines/Customer_Support_Tone_Guide_2026.pdf'
    ],
    createdAt: '2026-09-28T09:00:00.000Z',
    assignedAgentIds: ['usr-agent-sarah'],
    milestones: [
      {
        id: 'ms-103-1',
        jobId: 'job-103',
        title: 'Batch 1-90 Ticket Responses Completed',
        description: 'First half of customer inquiries processed.',
        status: 'COMPLETED',
        order: 1,
      },
      {
        id: 'ms-103-2',
        jobId: 'job-103',
        title: 'Batch 91-180 Ticket Responses & FAQ Draft',
        description: 'Remaining inquiries resolved and FAQ organized.',
        status: 'COMPLETED',
        order: 2,
      },
    ],
  },
  {
    id: 'job-104',
    title: 'Fintech Mobile App UI Audit & Promotional Social Media Graphics',
    description: 'Create 12 social media promotional banners (1080x1080 and 1920x1080) showcasing M-Pesa instant settlement features and modern security badges.',
    requirements: [
      '12 production-ready graphics exported in PNG & vector Figma file',
      'Consistent brand typography and color palette',
      'Mobile-optimized readability and high visual contrast'
    ],
    categoryId: 'cat-graphic-design',
    categoryName: 'Graphic Design & Creative',
    paymentAmount: 15000,
    deadline: '2026-10-22T17:00:00.000Z',
    status: 'ASSIGNED',
    attachments: [
      'https://swashub.com/docs/brand/Swashub_Brand_Identity_Guidelines.pdf'
    ],
    createdAt: '2026-10-04T14:00:00.000Z',
    assignedAgentIds: ['usr-agent-sarah', 'usr-agent-brian'],
    milestones: [
      {
        id: 'ms-104-1',
        jobId: 'job-104',
        title: 'Moodboard & Visual Direction Concept',
        description: '3 design directions proposed for feedback.',
        status: 'PENDING',
        order: 1,
      },
      {
        id: 'ms-104-2',
        jobId: 'job-104',
        title: 'High-Resolution Banner Production',
        description: 'Complete 12 design variations across 2 aspect ratios.',
        status: 'PENDING',
        order: 2,
      },
    ],
  },
  {
    id: 'job-105',
    title: 'Medical Audio Transcription & Timestamp Verification (Batch 14)',
    description: 'Transcribe 4 hours of clinical research interviews conducted in Nairobi. Ensure verbatim accuracy, medical terminology precision, and 5-second timestamp intervals.',
    requirements: [
      'Timestamped SRT and DOCX files for all 4 audio segments',
      'Zero misspellings of pharmacopeia terminology',
      'Speaker diarization tagged accurately (Dr. Kariuki, Patient A, etc.)'
    ],
    categoryId: 'cat-transcription',
    categoryName: 'Audio Transcription & Translation',
    paymentAmount: 11000,
    deadline: '2026-10-25T12:00:00.000Z',
    status: 'PENDING',
    attachments: [
      'https://swashub.com/docs/guidelines/Clinical_Transcription_Protocol.pdf'
    ],
    createdAt: '2026-10-05T08:30:00.000Z',
    assignedAgentIds: [],
    milestones: [
      {
        id: 'ms-105-1',
        jobId: 'job-105',
        title: 'Audio Segments 1 & 2 Transcription',
        description: 'First 2 hours drafted and proofread.',
        status: 'PENDING',
        order: 1,
      },
      {
        id: 'ms-105-2',
        jobId: 'job-105',
        title: 'Audio Segments 3 & 4 + Verification',
        description: 'Remaining audio transcribed and cross-verified.',
        status: 'PENDING',
        order: 2,
      },
    ],
  },
];

const INITIAL_ASSIGNMENTS: JobAssignment[] = [
  {
    id: 'asgn-1',
    jobId: 'job-101',
    agentId: 'usr-agent-brian',
    status: 'IN_PROGRESS',
    assignedAt: '2026-10-02T10:05:00.000Z',
    acceptedAt: '2026-10-02T11:00:00.000Z',
  },
  {
    id: 'asgn-2',
    jobId: 'job-102',
    agentId: 'usr-agent-sarah',
    status: 'SUBMITTED',
    assignedAt: '2026-10-03T11:35:00.000Z',
    acceptedAt: '2026-10-03T12:10:00.000Z',
  },
  {
    id: 'asgn-3',
    jobId: 'job-103',
    agentId: 'usr-agent-sarah',
    status: 'APPROVED',
    assignedAt: '2026-09-28T09:05:00.000Z',
    acceptedAt: '2026-09-28T09:30:00.000Z',
    completedAt: '2026-10-01T16:00:00.000Z',
  },
  {
    id: 'asgn-4',
    jobId: 'job-104',
    agentId: 'usr-agent-sarah',
    status: 'ASSIGNED',
    assignedAt: '2026-10-04T14:10:00.000Z',
  },
];

const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-201',
    jobId: 'job-102',
    agentId: 'usr-agent-sarah',
    notes: 'Completed all 3 enterprise cloud migration case studies. Full Google Docs share link provided with comments open. Plagiarism score is 0.8% (clean), and all quotes have been verified.',
    fileUrls: [
      'https://swashub.com/uploads/submissions/sarah_fintech_case_studies_final.docx',
      'https://swashub.com/uploads/submissions/sarah_seo_keyword_report.xlsx'
    ],
    status: 'SUBMITTED',
    submittedAt: '2026-10-06T16:45:00.000Z',
  },
  {
    id: 'sub-202',
    jobId: 'job-103',
    agentId: 'usr-agent-sarah',
    notes: 'All 180 customer support escalation drafts complete and QA handbook attached. Ready for review.',
    fileUrls: [
      'https://swashub.com/uploads/submissions/support_tickets_batch_180.xlsx',
      'https://swashub.com/uploads/submissions/FAQ_Handbook_v1.pdf'
    ],
    status: 'APPROVED',
    adminReview: 'Exceptional attention to detail and empathy. All 180 tickets verified with 100% adherence to guidelines. Earnings credited immediately.',
    reviewedAt: '2026-10-01T17:30:00.000Z',
    submittedAt: '2026-10-01T14:00:00.000Z',
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-reg-1',
    userId: 'usr-agent-sarah',
    userName: 'Sarah Mwangi',
    userEmail: 'sarah.mwangi@gmail.com',
    type: 'REGISTRATION_FEE',
    amount: 5000,
    status: 'SUCCESSFUL',
    reference: 'FLW-REG-847291-SM',
    paymentChannel: 'MPESA',
    mpesaReceipt: 'QJD893KL2P',
    notes: 'Swashub Agent Activation Fee paid via M-Pesa STK Push',
    flutterwaveRef: 'FLW_MOCK_TRANS_847291',
    createdAt: '2026-02-10T11:22:00.000Z',
  },
  {
    id: 'tx-reg-2',
    userId: 'usr-agent-brian',
    userName: 'Brian Kiprono',
    userEmail: 'brian.kiprono@yahoo.com',
    type: 'REGISTRATION_FEE',
    amount: 5000,
    status: 'SUCCESSFUL',
    reference: 'FLW-REG-991204-BK',
    paymentChannel: 'CARD',
    mpesaReceipt: 'CARD_AUTH_8832',
    notes: 'Swashub Agent Activation Fee paid via Flutterwave Visa Card',
    flutterwaveRef: 'FLW_MOCK_TRANS_991204',
    createdAt: '2026-02-15T14:18:00.000Z',
  },
  {
    id: 'tx-earn-1',
    userId: 'usr-agent-sarah',
    userName: 'Sarah Mwangi',
    userEmail: 'sarah.mwangi@gmail.com',
    type: 'EARNING',
    amount: 9500,
    status: 'SUCCESSFUL',
    reference: 'PAY-JOB-103-SM',
    notes: 'Approved payout for Job #job-103: Technical Customer Support Ticket Resolution',
    createdAt: '2026-10-01T17:30:00.000Z',
  },
  {
    id: 'tx-wth-1',
    userId: 'usr-agent-sarah',
    userName: 'Sarah Mwangi',
    userEmail: 'sarah.mwangi@gmail.com',
    type: 'WITHDRAWAL',
    amount: 5000,
    status: 'SUCCESSFUL',
    reference: 'WTH-88219-SM',
    paymentChannel: 'MPESA',
    mpesaReceipt: 'RK49910LLX',
    notes: 'Withdrawal to M-Pesa +254 712 345678',
    flutterwaveRef: 'FLW_PAYOUT_88219',
    createdAt: '2026-10-02T09:15:00.000Z',
  },
  {
    id: 'tx-wth-2',
    userId: 'usr-agent-brian',
    userName: 'Brian Kiprono',
    userEmail: 'brian.kiprono@yahoo.com',
    type: 'WITHDRAWAL',
    amount: 4000,
    status: 'PENDING',
    reference: 'WTH-90214-BK',
    paymentChannel: 'MPESA',
    notes: 'Withdrawal request to M-Pesa +254 722 987654 (Awaiting Admin approval)',
    createdAt: '2026-10-06T18:00:00.000Z',
  },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'usr-agent-sarah',
    title: 'New Job Assigned',
    message: 'You have been assigned to: "Fintech Mobile App UI Audit & Promotional Social Media Graphics" (15,000 KES). Review and accept the project.',
    type: 'job',
    read: false,
    linkUrl: '/jobs/job-104',
    createdAt: '2026-10-04T14:10:00.000Z',
  },
  {
    id: 'notif-2',
    userId: 'usr-agent-sarah',
    title: 'Submission Received for Review',
    message: 'Your work on "B2B SaaS Case Studies" was received by Admin and is currently under review.',
    type: 'review',
    read: true,
    linkUrl: '/jobs/job-102',
    createdAt: '2026-10-06T16:45:00.000Z',
  },
  {
    id: 'notif-3',
    userId: 'usr-agent-brian',
    title: 'Withdrawal Request Submitted',
    message: 'Your withdrawal request of 4,000 KES to M-Pesa +254 722 987654 has been queued for payout processing.',
    type: 'payment',
    read: false,
    linkUrl: '/earnings',
    createdAt: '2026-10-06T18:00:00.000Z',
  },
  {
    id: 'notif-4',
    userId: 'usr-admin-1',
    title: 'Job Submission Awaiting Review',
    message: 'Agent Sarah Mwangi submitted deliverables for Job #job-102: "B2B SaaS Case Studies".',
    type: 'review',
    read: false,
    linkUrl: '/admin/jobs',
    createdAt: '2026-10-06T16:46:00.000Z',
  },
  {
    id: 'notif-5',
    userId: 'usr-admin-1',
    title: 'Pending M-Pesa Withdrawal',
    message: 'Agent Brian Kiprono requested a 4,000 KES payout to M-Pesa +254 722 987654.',
    type: 'payment',
    read: false,
    linkUrl: '/admin/payments',
    createdAt: '2026-10-06T18:01:00.000Z',
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    jobId: 'job-102',
    senderId: 'usr-agent-sarah',
    senderName: 'Sarah Mwangi',
    senderRole: 'AGENT',
    receiverId: 'usr-admin-1',
    content: 'Hi Admin, regarding Case Study 2: should I focus more on the API latency improvements or the cost savings in KES?',
    createdAt: '2026-10-04T10:15:00.000Z',
  },
  {
    id: 'msg-2',
    jobId: 'job-102',
    senderId: 'usr-admin-1',
    senderName: 'Swashub Administrator',
    senderRole: 'ADMIN',
    receiverId: 'usr-agent-sarah',
    content: 'Focus primarily on the KES cost reduction and M-Pesa instant settlement percentages—our enterprise readers value financial ROI most.',
    createdAt: '2026-10-04T10:45:00.000Z',
  },
  {
    id: 'msg-3',
    jobId: 'job-102',
    senderId: 'usr-agent-sarah',
    senderName: 'Sarah Mwangi',
    senderRole: 'AGENT',
    receiverId: 'usr-admin-1',
    content: 'Understood! I have included concrete figures from the audit report in the draft.',
    createdAt: '2026-10-04T11:00:00.000Z',
  },
];

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    action: 'PLATFORM_INITIALIZED',
    details: 'Swashub operations database seeded with production workplaces and verified Kenyan agents.',
    timestamp: '2026-10-01T00:00:00.000Z',
    type: 'admin',
  },
  {
    id: 'log-2',
    action: 'JOB_APPROVED',
    details: 'Admin Swashub Administrator approved deliverables for Job #job-103 (Sarah Mwangi) and credited 9,500 KES.',
    userId: 'usr-admin-1',
    userName: 'Swashub Administrator',
    timestamp: '2026-10-01T17:30:00.000Z',
    type: 'job',
  },
  {
    id: 'log-3',
    action: 'WITHDRAWAL_PAID',
    details: 'M-Pesa payout of 5,000 KES completed to Sarah Mwangi (+254 712 345678). Receipt: RK49910LLX',
    userId: 'usr-admin-1',
    userName: 'Swashub Administrator',
    timestamp: '2026-10-02T09:15:00.000Z',
    type: 'withdrawal',
  },
  {
    id: 'log-4',
    action: 'SUBMISSION_RECEIVED',
    details: 'Agent Sarah Mwangi submitted files for Job #job-102: B2B SaaS Case Studies.',
    userId: 'usr-agent-sarah',
    userName: 'Sarah Mwangi',
    timestamp: '2026-10-06T16:45:00.000Z',
    type: 'job',
  },
  {
    id: 'log-5',
    action: 'WITHDRAWAL_REQUESTED',
    details: 'Brian Kiprono queued withdrawal of 4,000 KES to M-Pesa +254 722 987654.',
    userId: 'usr-agent-brian',
    userName: 'Brian Kiprono',
    timestamp: '2026-10-06T18:00:00.000Z',
    type: 'withdrawal',
  },
];

const INITIAL_CLIENTS: Client[] = [
  {
    id: 'clt-jane-wanjiku',
    name: 'Jane Wanjiku',
    email: 'jane.wanjiku@gmail.com',
    company: 'Customer Support Workplace',
    phone: '+254 728 554433',
    status: 'ACTIVE',
    workplaceActivated: true,
    totalSpent: 0,
    jobsPostedCount: 5,
    completedJobsCount: 4,
    joinedAt: '2026-02-20T08:00:00.000Z',
    monthlySalary: 35000,
    department: 'Customer Support',
    contractStatus: 'ACTIVE',
    contractStartDate: '2026-10-01',
    contractEndDate: '2027-09-30',
    nextPaymentDate: '2026-10-31',
    workingHours: '40 hrs/week (Mon-Fri 09:00 - 17:00 EAT)',
    workingDays: 'Monday - Friday',
    responsibilities: [
      'Manage high-priority customer support ticketing queues',
      'Resolve user escalation inquiries within 15-minute SLA',
      'Submit weekly customer satisfaction logs to supervisor Esther Njoki',
      'Update knowledge base documentation and FAQs'
    ],
    supervisorAgentId: 'usr-agent-esther',
    supervisorAgentName: 'Esther Njoki',
    mpesaPayoutNumber: '+254 728 554433',
    bankDetails: {
      bankName: 'Equity Bank Kenya',
      accountNumber: '0140293847291',
      accountName: 'Jane Wanjiku'
    },
    avatarUrl: '/src/assets/images/agent_avatar_sarah_1791395183231.jpg',
    currentWorkStatus: 'IN_SESSION',
    lastActiveAt: '2026-10-07T11:45:00.000Z'
  },
  {
    id: 'clt-david-kamau',
    name: 'David Kamau',
    email: 'david.kamau@gmail.com',
    company: 'Data Operations Hub',
    phone: '+254 723 889900',
    status: 'ACTIVE',
    workplaceActivated: true,
    totalSpent: 0,
    jobsPostedCount: 7,
    completedJobsCount: 6,
    joinedAt: '2026-01-10T09:00:00.000Z',
    monthlySalary: 42000,
    department: 'Data Entry & Analysis',
    contractStatus: 'ACTIVE',
    contractStartDate: '2026-10-01',
    contractEndDate: '2027-09-30',
    nextPaymentDate: '2026-10-31',
    workingHours: '40 hrs/week (Mon-Fri 08:30 - 16:30 EAT)',
    workingDays: 'Monday - Friday',
    responsibilities: [
      'Extract and audit supplier catalog CSVs and tax codes',
      'Perform data normalization on vendor pricing tables',
      'Coordinate data accuracy QA checks with supervisor Brian Kiprono'
    ],
    supervisorAgentId: 'usr-agent-brian',
    supervisorAgentName: 'Brian Kiprono',
    mpesaPayoutNumber: '+254 723 889900',
    bankDetails: {
      bankName: 'KCB Bank Kenya',
      accountNumber: '1122334455',
      accountName: 'David Kamau'
    },
    avatarUrl: '/src/assets/images/agent_avatar_brian_1791395193037.jpg',
    currentWorkStatus: 'ONLINE',
    lastActiveAt: '2026-10-07T10:15:00.000Z'
  },
  {
    id: 'clt-mary-wanjiku',
    name: 'Mary Wanjiku',
    email: 'mary.wanjiku@gmail.com',
    company: 'Content Publishing Hub',
    phone: '+254 715 776655',
    status: 'ACTIVE',
    workplaceActivated: true,
    totalSpent: 0,
    jobsPostedCount: 3,
    completedJobsCount: 3,
    joinedAt: '2026-03-01T10:00:00.000Z',
    monthlySalary: 38000,
    department: 'Content Writing & SEO',
    contractStatus: 'ACTIVE',
    contractStartDate: '2026-10-01',
    contractEndDate: '2027-09-30',
    nextPaymentDate: '2026-10-31',
    workingHours: '40 hrs/week (Mon-Fri 09:00 - 17:00 EAT)',
    workingDays: 'Monday - Friday',
    responsibilities: [
      'Produce technical fintech case studies and SEO articles',
      'Conduct keyword research and on-page optimization',
      'Submit editorial deliverables to supervisor Sarah Mwangi'
    ],
    supervisorAgentId: 'usr-agent-sarah',
    supervisorAgentName: 'Sarah Mwangi',
    mpesaPayoutNumber: '+254 715 776655',
    bankDetails: {
      bankName: 'Co-operative Bank of Kenya',
      accountNumber: '011299887766',
      accountName: 'Mary Wanjiku'
    },
    avatarUrl: '/src/assets/images/agent_avatar_sarah_1791395183231.jpg',
    currentWorkStatus: 'ONLINE',
    lastActiveAt: '2026-10-07T11:20:00.000Z'
  },
  {
    id: 'clt-safaricom-ent',
    name: 'Safaricom Enterprise Solutions',
    email: 'b2b-projects@safaricom.co.ke',
    company: 'Safaricom PLC Kenya',
    phone: '+254 722 000000',
    status: 'ACTIVE',
    workplaceActivated: true,
    totalSpent: 185000,
    jobsPostedCount: 12,
    completedJobsCount: 10,
    joinedAt: '2026-01-15T09:00:00.000Z',
    monthlySalary: 185000,
    department: 'Enterprise Telecom',
    contractStatus: 'ACTIVE',
    contractStartDate: '2026-01-01',
    contractEndDate: '2027-12-31',
    nextPaymentDate: '2026-10-31',
    workingHours: 'Enterprise Retainer (24/7 SLA Support)',
    workingDays: 'All Week',
    supervisorAgentId: 'usr-admin-1',
    supervisorAgentName: 'Swashub Administrator',
  },
  {
    id: 'clt-twiga-logistics',
    name: 'Twiga Foods Digital Operations',
    email: 'digital@twigafoods.com',
    company: 'Twiga Foods Kenya',
    phone: '+254 711 223344',
    status: 'ACTIVE',
    workplaceActivated: true,
    totalSpent: 94000,
    jobsPostedCount: 6,
    completedJobsCount: 5,
    joinedAt: '2026-02-01T10:30:00.000Z',
    monthlySalary: 94000,
    department: 'Agritech & Supply Chain',
    contractStatus: 'ACTIVE',
    contractStartDate: '2026-02-01',
    contractEndDate: '2027-01-31',
    nextPaymentDate: '2026-10-31',
    workingHours: 'Operations Retainer',
    workingDays: 'Monday - Friday',
    supervisorAgentId: 'usr-agent-brian',
    supervisorAgentName: 'Brian Kiprono',
  },
  {
    id: 'clt-kasha-africa',
    name: 'Kasha East Africa Health Portal',
    email: 'content@kasha.co',
    company: 'Kasha Global Inc',
    phone: '+254 733 998877',
    status: 'ACTIVE',
    workplaceActivated: true,
    totalSpent: 142000,
    jobsPostedCount: 9,
    completedJobsCount: 8,
    joinedAt: '2026-02-18T14:00:00.000Z',
    monthlySalary: 142000,
    department: 'Healthtech Content',
    contractStatus: 'ACTIVE',
    contractStartDate: '2026-02-15',
    contractEndDate: '2027-02-14',
    nextPaymentDate: '2026-10-31',
    workingHours: 'Content Retainer',
    workingDays: 'Monday - Friday',
    supervisorAgentId: 'usr-agent-sarah',
    supervisorAgentName: 'Sarah Mwangi',
  },
  {
    id: 'clt-samuel-ochieng',
    name: 'Samuel Ochieng',
    email: 'samuel.ochieng@gmail.com',
    company: 'Customer Ops Unit',
    phone: '+254 712 345678',
    status: 'NEW',
    workplaceActivated: false,
    totalSpent: 0,
    jobsPostedCount: 0,
    completedJobsCount: 0,
    joinedAt: '2026-10-07T09:30:00.000Z',
    monthlySalary: 35000,
    department: 'Customer Support',
    contractStatus: 'PENDING',
    workingHours: '40 hrs/week (Mon-Fri 09:00 - 17:00 EAT)',
    workingDays: 'Monday - Friday',
    supervisorAgentId: 'usr-agent-esther',
    supervisorAgentName: 'Esther Njoki',
    documents: [
      {
        id: 'doc-sam-1',
        name: 'National Identity Card (Front & Back)',
        category: 'ID_CARD',
        fileUrl: '/uploads/id_card_samuel.pdf',
        status: 'PENDING',
        uploadedAt: '2026-10-07T10:00:00.000Z',
      },
      {
        id: 'doc-sam-2',
        name: 'KRA PIN Tax Certificate',
        category: 'TAX_PIN',
        fileUrl: '/uploads/kra_pin_samuel.pdf',
        status: 'PENDING',
        uploadedAt: '2026-10-07T10:05:00.000Z',
      }
    ],
    internalNotes: [
      '[07 Oct 2026 by System]: New client application received; assigned to Esther Njoki for verification and workplace activation.'
    ],
    lastLoginAt: '2026-10-08T08:15:00.000Z'
  },
  {
    id: 'clt-faith-mutua',
    name: 'Faith Mutua',
    email: 'faith.mutua@gmail.com',
    company: 'Fintech Ticketing Desk',
    phone: '+254 798 112233',
    status: 'UNDER_REVIEW',
    workplaceActivated: false,
    totalSpent: 0,
    jobsPostedCount: 1,
    completedJobsCount: 0,
    joinedAt: '2026-10-05T14:20:00.000Z',
    monthlySalary: 36000,
    department: 'Customer Support',
    contractStatus: 'PENDING',
    workingHours: '40 hrs/week (Mon-Fri 09:00 - 17:00 EAT)',
    workingDays: 'Monday - Friday',
    supervisorAgentId: 'usr-agent-esther',
    supervisorAgentName: 'Esther Njoki',
    documents: [
      {
        id: 'doc-faith-1',
        name: 'National ID Scan',
        category: 'ID_CARD',
        fileUrl: '/uploads/id_faith.pdf',
        status: 'VERIFIED',
        verifiedAt: '2026-10-06T11:00:00.000Z',
        verifiedBy: 'Esther Njoki',
        uploadedAt: '2026-10-05T15:00:00.000Z',
      },
      {
        id: 'doc-faith-2',
        name: 'Customer Service Certificate',
        category: 'CERTIFICATE',
        fileUrl: '/uploads/cert_faith.pdf',
        status: 'PENDING',
        uploadedAt: '2026-10-05T15:10:00.000Z',
      }
    ],
    internalNotes: [
      '[06 Oct 2026 by Esther Njoki]: ID verified. Awaiting clarification on previous call center experience certificate.'
    ],
    lastLoginAt: '2026-10-08T09:00:00.000Z'
  },
  {
    id: 'clt-kevin-otieno',
    name: 'Kevin Otieno',
    email: 'kevin.otieno@gmail.com',
    company: 'Chat Operations Team',
    phone: '+254 701 998822',
    status: 'REQUIRES_ATTENTION',
    workplaceActivated: true,
    totalSpent: 0,
    jobsPostedCount: 4,
    completedJobsCount: 2,
    joinedAt: '2026-03-12T11:00:00.000Z',
    monthlySalary: 35000,
    department: 'Customer Support',
    contractStatus: 'ACTIVE',
    contractStartDate: '2026-10-01',
    contractEndDate: '2027-09-30',
    nextPaymentDate: '2026-10-31',
    workingHours: '40 hrs/week (Mon-Fri 09:00 - 17:00 EAT)',
    workingDays: 'Monday - Friday',
    supervisorAgentId: 'usr-agent-esther',
    supervisorAgentName: 'Esther Njoki',
    documents: [
      {
        id: 'doc-kevin-1',
        name: 'Updated Bank Authorization Form',
        category: 'WORK_AGREEMENT',
        fileUrl: '/uploads/bank_auth_kevin.pdf',
        status: 'CORRECTION_REQUIRED',
        rejectionReason: 'Bank stamp missing on signature box',
        uploadedAt: '2026-10-06T12:00:00.000Z',
      }
    ],
    internalNotes: [
      '[07 Oct 2026 by Esther Njoki]: Bank document rejected; requested re-upload with official branch stamp before October payroll lock.'
    ],
    lastLoginAt: '2026-10-07T16:45:00.000Z'
  },
  {
    id: 'clt-grace-nduta',
    name: 'Grace Nduta',
    email: 'grace.nduta@gmail.com',
    company: 'Escalations Support Desk',
    phone: '+254 720 445566',
    status: 'SUSPENDED',
    workplaceActivated: false,
    rejectionReason: 'Missed 3 consecutive mandatory shift checks without notice',
    totalSpent: 0,
    jobsPostedCount: 3,
    completedJobsCount: 2,
    joinedAt: '2026-04-01T08:00:00.000Z',
    monthlySalary: 35000,
    department: 'Customer Support',
    contractStatus: 'SUSPENDED',
    workingHours: '40 hrs/week',
    workingDays: 'Monday - Friday',
    supervisorAgentId: 'usr-agent-esther',
    supervisorAgentName: 'Esther Njoki',
    internalNotes: [
      '[06 Oct 2026 by Esther Njoki]: Suspended workplace following attendance review. Client contacted via email to explain absence.'
    ],
    lastLoginAt: '2026-10-06T10:00:00.000Z'
  },
];

const INITIAL_CONTRACTS: MonthlyContract[] = [
  {
    id: 'ctr-jane-wanjiku-2026',
    clientId: 'clt-jane-wanjiku',
    clientName: 'Jane Wanjiku',
    clientEmail: 'jane.wanjiku@gmail.com',
    department: 'Customer Support',
    monthlySalary: 35000,
    currency: 'KES',
    status: 'ACTIVE',
    startDate: '2026-10-01',
    endDate: '2027-09-30',
    nextPaymentDate: '2026-10-31',
    paymentCycle: 'MONTHLY',
    workingHours: '40 hrs/week (Mon-Fri 09:00 - 17:00 EAT)',
    workingDays: 'Monday - Friday',
    responsibilities: [
      'Manage high-priority customer support ticketing queues',
      'Resolve user escalation inquiries within 15-minute SLA',
      'Submit weekly customer satisfaction logs to supervisor Esther Njoki',
      'Update knowledge base documentation and FAQs'
    ],
    supervisorAgentId: 'usr-agent-esther',
    supervisorAgentName: 'Esther Njoki',
    bonuses: 3500,
    deductions: 0,
    internalNotes: 'Tier-1 Customer Support contract. Excellent ticket resolution turnaround.',
    createdAt: '2026-10-01T08:00:00.000Z'
  },
  {
    id: 'ctr-david-kamau-2026',
    clientId: 'clt-david-kamau',
    clientName: 'David Kamau',
    clientEmail: 'david.kamau@gmail.com',
    department: 'Data Entry & Analysis',
    monthlySalary: 42000,
    currency: 'KES',
    status: 'ACTIVE',
    startDate: '2026-10-01',
    endDate: '2027-09-30',
    nextPaymentDate: '2026-10-31',
    paymentCycle: 'MONTHLY',
    workingHours: '40 hrs/week (Mon-Fri 08:30 - 16:30 EAT)',
    workingDays: 'Monday - Friday',
    responsibilities: [
      'Extract and audit supplier catalog CSVs and tax codes',
      'Perform data normalization on vendor pricing tables',
      'Coordinate data accuracy QA checks with supervisor Brian Kiprono'
    ],
    supervisorAgentId: 'usr-agent-brian',
    supervisorAgentName: 'Brian Kiprono',
    bonuses: 2000,
    deductions: 0,
    internalNotes: 'High-speed data cleansing specialist. Zero format defects reported.',
    createdAt: '2026-10-01T08:00:00.000Z'
  },
  {
    id: 'ctr-mary-wanjiku-2026',
    clientId: 'clt-mary-wanjiku',
    clientName: 'Mary Wanjiku',
    clientEmail: 'mary.wanjiku@gmail.com',
    department: 'Content Writing & SEO',
    monthlySalary: 38000,
    currency: 'KES',
    status: 'ACTIVE',
    startDate: '2026-10-01',
    endDate: '2027-09-30',
    nextPaymentDate: '2026-10-31',
    paymentCycle: 'MONTHLY',
    workingHours: '40 hrs/week (Mon-Fri 09:00 - 17:00 EAT)',
    workingDays: 'Monday - Friday',
    responsibilities: [
      'Produce technical fintech case studies and SEO articles',
      'Conduct keyword research and on-page optimization',
      'Submit editorial deliverables to supervisor Sarah Mwangi'
    ],
    supervisorAgentId: 'usr-agent-sarah',
    supervisorAgentName: 'Sarah Mwangi',
    bonuses: 1500,
    deductions: 0,
    internalNotes: 'SEO and research articles contract. Consistent on-time draft deliveries.',
    createdAt: '2026-10-01T08:00:00.000Z'
  }
];

const INITIAL_MONTHLY_PAYROLL: MonthlyPayrollRecord[] = [
  {
    id: 'pay-oct-2026-jane',
    payrollMonth: 'October 2026',
    clientId: 'clt-jane-wanjiku',
    clientName: 'Jane Wanjiku',
    clientEmail: 'jane.wanjiku@gmail.com',
    department: 'Customer Support',
    basicMonthlyPay: 35000,
    bonus: 3500,
    bonusReason: 'Exceeded CSAT target (99.2% positive ratings in week 1)',
    deductions: 0,
    deductionReason: '',
    adjustments: 0,
    netPayment: 38500,
    status: 'APPROVED',
    paymentMethod: 'MPESA',
    payoutAccount: '+254 728 554433',
    transactionReference: 'MP-PAY-OCT-2601',
    approvalStatus: 'APPROVED',
    approvedBy: 'Swashub Administrator',
    approvedAt: '2026-10-05T14:00:00.000Z',
    receiptNumber: 'SWP-2026-OCT-004',
    notes: 'Approved for month-end automated M-Pesa B2C batch dispatch.',
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'pay-oct-2026-david',
    payrollMonth: 'October 2026',
    clientId: 'clt-david-kamau',
    clientName: 'David Kamau',
    clientEmail: 'david.kamau@gmail.com',
    department: 'Data Entry & Analysis',
    basicMonthlyPay: 42000,
    bonus: 2000,
    bonusReason: 'Zero discrepancy on 2,400 SKU verification pipeline',
    deductions: 0,
    deductionReason: '',
    adjustments: 0,
    netPayment: 44000,
    status: 'REVIEWED',
    paymentMethod: 'BANK_TRANSFER',
    payoutAccount: 'KCB Bank (1122334455)',
    transactionReference: 'BNK-PAY-OCT-2602',
    approvalStatus: 'REVIEWED',
    approvedBy: 'Esther Njoki',
    approvedAt: '2026-10-06T10:30:00.000Z',
    receiptNumber: 'SWP-2026-OCT-005',
    notes: 'Reviewed by supervising agent. Pending final admin disbursement authorization.',
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'pay-oct-2026-mary',
    payrollMonth: 'October 2026',
    clientId: 'clt-mary-wanjiku',
    clientName: 'Mary Wanjiku',
    clientEmail: 'mary.wanjiku@gmail.com',
    department: 'Content Writing & SEO',
    basicMonthlyPay: 38000,
    bonus: 1500,
    bonusReason: 'Early delivery of 3 fintech whitepapers',
    deductions: 0,
    deductionReason: '',
    adjustments: 0,
    netPayment: 39500,
    status: 'PROCESSING',
    paymentMethod: 'MPESA',
    payoutAccount: '+254 715 776655',
    transactionReference: 'MP-PAY-OCT-2603',
    approvalStatus: 'APPROVED',
    approvedBy: 'Swashub Administrator',
    approvedAt: '2026-10-05T14:30:00.000Z',
    receiptNumber: 'SWP-2026-OCT-006',
    notes: 'Batch M-Pesa dispatch queued with Safaricom B2C bulk portal.',
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'pay-sep-2026-jane',
    payrollMonth: 'September 2026',
    clientId: 'clt-jane-wanjiku',
    clientName: 'Jane Wanjiku',
    clientEmail: 'jane.wanjiku@gmail.com',
    department: 'Customer Support',
    basicMonthlyPay: 35000,
    bonus: 2000,
    bonusReason: 'September attendance & SLA bonus',
    deductions: 0,
    deductionReason: '',
    adjustments: 0,
    netPayment: 37000,
    status: 'PAID',
    paymentMethod: 'MPESA',
    payoutAccount: '+254 728 554433',
    transactionReference: 'MP-PAY-SEP-1982',
    approvalStatus: 'APPROVED',
    approvedBy: 'Swashub Administrator',
    approvedAt: '2026-09-28T11:00:00.000Z',
    paidAt: '2026-09-30T17:00:00.000Z',
    receiptNumber: 'SWP-2026-SEP-012',
    notes: 'M-Pesa B2C instant payout disbursed successfully.',
    createdAt: '2026-09-01T00:00:00.000Z'
  }
];

const INITIAL_WORK_SESSIONS: ClientWorkSession[] = [
  {
    id: 'ws-101',
    clientId: 'clt-jane-wanjiku',
    clientName: 'Jane Wanjiku',
    date: '2026-10-07',
    startTime: '2026-10-07T09:00:00.000Z',
    durationMinutes: 165,
    status: 'IN_PROGRESS',
    taskDescription: 'Live Chat Queue Assistance & Tier-1 Support Tickets',
    relatedJobId: 'job-103',
    relatedJobTitle: 'Technical Customer Support Ticket Resolution',
    notes: 'Processed 24 inbound user payment queries; verified 100% CSAT.'
  },
  {
    id: 'ws-100',
    clientId: 'clt-jane-wanjiku',
    clientName: 'Jane Wanjiku',
    date: '2026-10-06',
    startTime: '2026-10-06T09:00:00.000Z',
    endTime: '2026-10-06T17:00:00.000Z',
    durationMinutes: 480,
    status: 'VERIFIED',
    taskDescription: 'Master FAQ Guide Compilation & Ticket Escalations',
    relatedJobId: 'job-103',
    relatedJobTitle: 'Technical Customer Support Ticket Resolution',
    notes: 'Completed full 8-hour shift. Supervisor Esther Njoki verified shift output.',
    verifiedBySupervisor: true
  },
  {
    id: 'ws-102',
    clientId: 'clt-david-kamau',
    clientName: 'David Kamau',
    date: '2026-10-07',
    startTime: '2026-10-07T08:30:00.000Z',
    endTime: '2026-10-07T16:30:00.000Z',
    durationMinutes: 480,
    status: 'VERIFIED',
    taskDescription: 'Batch SKU Formula Normalization & Barcode Integrity Check',
    relatedJobId: 'job-101',
    relatedJobTitle: 'E-Commerce Product Catalog Data Extraction',
    notes: 'Normalized 1,200 product lines without formula errors.',
    verifiedBySupervisor: true
  }
];

const INITIAL_DISPUTES: Dispute[] = [
  {
    id: 'disp-201',
    jobId: 'job-101',
    jobTitle: 'E-Commerce Product Catalog Data Extraction',
    clientId: 'clt-twiga-logistics',
    clientName: 'Twiga Foods Digital Operations',
    workerId: 'usr-agent-brian',
    workerName: 'Brian Kiprono',
    amount: 12500,
    reason: 'Client flagged 14 barcodes formatted as scientific notation in initial test CSV.',
    evidenceNotes: 'Agent Brian re-exported using strict text format string. Ready for final admin arbitration.',
    status: 'INVESTIGATING',
    createdAt: '2026-10-05T14:20:00.000Z',
  },
];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-801',
    userId: 'usr-agent-brian',
    userName: 'Brian Kiprono',
    userRole: 'AGENT',
    subject: 'M-Pesa Payout Verification for Withdrawal WTH-90214-BK',
    category: 'Withdrawal',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    messages: [
      {
        senderId: 'usr-agent-brian',
        senderName: 'Brian Kiprono',
        senderRole: 'AGENT',
        message: 'Hello Support, I requested a 4,000 KES withdrawal yesterday. Can you verify when the M-Pesa batch will disburse?',
        timestamp: '2026-10-06T19:00:00.000Z',
      },
      {
        senderId: 'usr-admin-1',
        senderName: 'Swashub Administrator',
        senderRole: 'ADMIN',
        message: 'Hi Brian! Your request is in the pending payout queue and will be disbursed today during the morning M-Pesa batch window.',
        timestamp: '2026-10-07T08:15:00.000Z',
      },
    ],
    createdAt: '2026-10-06T19:00:00.000Z',
    updatedAt: '2026-10-07T08:15:00.000Z',
  },
  {
    id: 'tkt-802',
    userId: 'usr-agent-sarah',
    userName: 'Sarah Mwangi',
    userRole: 'AGENT',
    subject: 'Application to unlock Graphic Design Workplace',
    category: 'Account',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    messages: [
      {
        senderId: 'usr-agent-sarah',
        senderName: 'Sarah Mwangi',
        senderRole: 'AGENT',
        message: 'I have attached my Figma portfolio link. Would love to receive design tasks alongside SEO writing.',
        timestamp: '2026-10-03T11:00:00.000Z',
      },
      {
        senderId: 'usr-admin-1',
        senderName: 'Swashub Administrator',
        senderRole: 'ADMIN',
        message: 'Approved! Your account has been multi-assigned to Graphic Design projects.',
        timestamp: '2026-10-04T09:30:00.000Z',
      },
    ],
    createdAt: '2026-10-03T11:00:00.000Z',
    updatedAt: '2026-10-04T09:30:00.000Z',
  },
];

const INITIAL_FRAUD_ALERTS: FraudAlert[] = [
  {
    id: 'frd-01',
    severity: 'MEDIUM',
    type: 'UNUSUAL_WITHDRAWAL',
    title: 'Multiple Rapid Withdrawal Attempts Detected',
    description: 'Applicant account David Omondi attempted consecutive withdrawal attempts before completing accredited registration fee.',
    targetId: 'usr-pending-applicant',
    targetName: 'David Omondi',
    timestamp: '2026-10-06T20:10:00.000Z',
    status: 'ACTIVE',
  },
];

const INITIAL_TEMPLATES: TaskTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'B2B Technical Case Study & SEO Article',
    category: 'cat-content-writing',
    defaultPay: 18000,
    estimatedHours: 16,
    description: '3 comprehensive enterprise customer migration case studies (1,200 words each) with primary East Africa keyword density.',
    requirements: [
      'Original copywriting passing 100% plagiarism check',
      'Natural integration of target high-intent keywords',
      'Formatted Google Docs with source quotes verified'
    ],
  },
  {
    id: 'tmpl-2',
    name: 'Product Catalog Normalization & Barcode Cleaning',
    category: 'cat-data-entry',
    defaultPay: 12500,
    estimatedHours: 12,
    description: 'Scrape and format 2,400 raw vendor product listings into clean master CSV with standardized KES pricing.',
    requirements: [
      'Clean spreadsheet containing all 2,400 SKUs',
      'Zero missing required attributes (title, SKU, price, tax band)',
      'Upload final sanitized XLSX and QA discrepancy sheet'
    ],
  },
  {
    id: 'tmpl-3',
    name: 'Customer Support Escalation Ticket Responses & FAQ',
    category: 'cat-customer-support',
    defaultPay: 9500,
    estimatedHours: 8,
    description: 'Draft empathetic replies for 180 customer inquiries and summarize root causes into a 10-page master handbook.',
    requirements: [
      '180 ticket draft replies adhering to quality SLA standards',
      '10-page verified knowledge base FAQ document'
    ],
  },
];

class StorageService {
  private db: DatabaseSchema;

  constructor() {
    this.db = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);

        const loadedClients = parsed.clients || INITIAL_CLIENTS;
        for (const initClt of INITIAL_CLIENTS) {
          if (!loadedClients.some((c: any) => c.id === initClt.id)) {
            loadedClients.unshift(initClt);
          }
        }

        const loadedUsers = parsed.users || INITIAL_USERS;
        for (const initUsr of INITIAL_USERS) {
          if (!loadedUsers.some((u: any) => u.id === initUsr.id)) {
            loadedUsers.push(initUsr);
          }
        }

        return {
          users: loadedUsers,
          categories: parsed.categories || INITIAL_CATEGORIES,
          jobs: parsed.jobs || INITIAL_JOBS,
          jobAssignments: parsed.jobAssignments || INITIAL_ASSIGNMENTS,
          submissions: parsed.submissions || INITIAL_SUBMISSIONS,
          transactions: parsed.transactions || INITIAL_TRANSACTIONS,
          notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
          messages: parsed.messages || INITIAL_MESSAGES,
          settings: parsed.settings || INITIAL_SETTINGS,
          activityLogs: parsed.activityLogs || INITIAL_LOGS,
          clients: loadedClients,
          contracts: parsed.contracts || INITIAL_CONTRACTS,
          monthlyPayroll: parsed.monthlyPayroll || INITIAL_MONTHLY_PAYROLL,
          workSessions: parsed.workSessions || INITIAL_WORK_SESSIONS,
          disputes: parsed.disputes || INITIAL_DISPUTES,
          supportTickets: parsed.supportTickets || INITIAL_TICKETS,
          fraudAlerts: parsed.fraudAlerts || INITIAL_FRAUD_ALERTS,
          taskTemplates: parsed.taskTemplates || INITIAL_TEMPLATES,
        };
      }
    } catch (err) {
      console.error('Error reading database file, using initial dataset:', err);
    }

    const initialDb: DatabaseSchema = {
      users: INITIAL_USERS,
      categories: INITIAL_CATEGORIES,
      jobs: INITIAL_JOBS,
      jobAssignments: INITIAL_ASSIGNMENTS,
      submissions: INITIAL_SUBMISSIONS,
      transactions: INITIAL_TRANSACTIONS,
      notifications: INITIAL_NOTIFICATIONS,
      messages: INITIAL_MESSAGES,
      settings: INITIAL_SETTINGS,
      activityLogs: INITIAL_LOGS,
      clients: INITIAL_CLIENTS,
      contracts: INITIAL_CONTRACTS,
      monthlyPayroll: INITIAL_MONTHLY_PAYROLL,
      workSessions: INITIAL_WORK_SESSIONS,
      disputes: INITIAL_DISPUTES,
      supportTickets: INITIAL_TICKETS,
      fraudAlerts: INITIAL_FRAUD_ALERTS,
      taskTemplates: INITIAL_TEMPLATES,
    };
    this.persistDatabase(initialDb);
    return initialDb;
  }

  private persistDatabase(data?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data || this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to database file:', err);
    }
  }

  // --- Auth & Users ---
  getUsers() {
    return this.db.users.map(({ passwordHash, ...rest }) => rest);
  }

  getUserById(id: string) {
    const user = this.db.users.find((u) => u.id === id);
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return rest;
  }

  getUserByEmail(email: string) {
    return this.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: 'ADMIN' | 'AGENT' | 'PENDING_PAYMENT';
    status?: 'ACTIVE' | 'PENDING_PAYMENT' | 'SUSPENDED';
    categoryId?: string;
    mpesaNumber?: string;
  }) {
    const newUser = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      passwordHash: userData.password,
      role: userData.role || 'PENDING_PAYMENT',
      status: userData.status || 'PENDING_PAYMENT',
      categoryId: userData.categoryId,
      balance: 0,
      mpesaNumber: userData.mpesaNumber || userData.phone,
      createdAt: new Date().toISOString(),
    };
    this.db.users.push(newUser);
    this.logActivity({
      action: 'USER_REGISTERED',
      details: `User ${newUser.name} (${newUser.email}) registered as ${newUser.role}.`,
      userId: newUser.id,
      userName: newUser.name,
      type: 'auth',
    });
    this.persistDatabase();
    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }

  updateUser(id: string, updates: Partial<User>) {
    const idx = this.db.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.db.users[idx] = { ...this.db.users[idx], ...updates };
    this.persistDatabase();
    const { passwordHash, ...safeUser } = this.db.users[idx];
    return safeUser;
  }

  updateUserBalance(userId: string, delta: number) {
    const user = this.db.users.find((u) => u.id === userId);
    if (!user) return null;
    user.balance = Math.max(0, (user.balance || 0) + delta);
    this.persistDatabase();
    return user.balance;
  }

  // --- Categories ---
  getCategories() {
    return this.db.categories.map((cat) => {
      const agentCount = this.db.users.filter((u) => u.role === 'AGENT' && u.categoryId === cat.id).length;
      const jobCount = this.db.jobs.filter((j) => j.categoryId === cat.id).length;
      return { ...cat, agentCount, jobCount };
    });
  }

  getCategoryById(id: string) {
    return this.db.categories.find((c) => c.id === id);
  }

  createCategory(cat: Omit<Category, 'id' | 'agentCount' | 'jobCount'>) {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      ...cat,
    };
    this.db.categories.push(newCategory);
    this.logActivity({
      action: 'CATEGORY_CREATED',
      details: `Category "${newCategory.name}" was added by admin.`,
      type: 'admin',
    });
    this.persistDatabase();
    return newCategory;
  }

  updateCategory(id: string, updates: Partial<Category>) {
    const idx = this.db.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.db.categories[idx] = { ...this.db.categories[idx], ...updates };
    this.persistDatabase();
    return this.db.categories[idx];
  }

  deleteCategory(id: string) {
    this.db.categories = this.db.categories.filter((c) => c.id !== id);
    this.persistDatabase();
    return true;
  }

  // --- Jobs ---
  getJobs(userRole: string, userId?: string) {
    let jobs = [...this.db.jobs];
    // Attach category names and agents
    jobs = jobs.map((job) => {
      const category = this.db.categories.find((c) => c.id === job.categoryId);
      const assignedAgents = this.db.users
        .filter((u) => job.assignedAgentIds?.includes(u.id))
        .map(({ passwordHash, ...rest }) => rest);

      const submissions = this.db.submissions.filter((s) => s.jobId === job.id);

      let currentAgentStatus = job.status;
      let agentSubmission: Submission | undefined;

      if (userId) {
        const assignment = this.db.jobAssignments.find(
          (a) => a.jobId === job.id && a.agentId === userId
        );
        if (assignment) {
          currentAgentStatus = assignment.status;
        }
        agentSubmission = submissions.find((s) => s.agentId === userId);
      }

      return {
        ...job,
        categoryName: category?.name || 'General',
        assignedAgents,
        submissions,
        currentAgentStatus,
        agentSubmission,
      };
    });

    if (userRole === 'AGENT' && userId) {
      // Agents strictly only see jobs they are assigned to
      return jobs.filter((job) => job.assignedAgentIds?.includes(userId));
    }

    return jobs;
  }

  getJobById(id: string, userId?: string) {
    const job = this.db.jobs.find((j) => j.id === id);
    if (!job) return null;
    const category = this.db.categories.find((c) => c.id === job.categoryId);
    const assignedAgents = this.db.users
      .filter((u) => job.assignedAgentIds?.includes(u.id))
      .map(({ passwordHash, ...rest }) => rest);
    const submissions = this.db.submissions.filter((s) => s.jobId === job.id);

    let currentAgentStatus = job.status;
    let agentSubmission: Submission | undefined;

    if (userId) {
      const assignment = this.db.jobAssignments.find(
        (a) => a.jobId === job.id && a.agentId === userId
      );
      if (assignment) {
        currentAgentStatus = assignment.status;
      }
      agentSubmission = submissions.find((s) => s.agentId === userId);
    }

    return {
      ...job,
      categoryName: category?.name || 'General',
      assignedAgents,
      submissions,
      currentAgentStatus,
      agentSubmission,
    };
  }

  createJob(jobData: {
    title: string;
    description: string;
    requirements?: string[];
    categoryId: string;
    paymentAmount: number;
    deadline: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    attachments?: string[];
    milestones?: { title: string; description?: string }[];
    assignedAgentIds?: string[];
    clientId?: string;
    clientName?: string;
    assignedClientId?: string;
    assignedClient?: string;
    assignedAgentId?: string;
    assignedAgentName?: string;
  }) {
    const jobId = `job-${Date.now()}`;
    const newMilestones: Milestone[] = (jobData.milestones || []).map((m, index) => ({
      id: `ms-${jobId}-${index + 1}`,
      jobId,
      title: m.title,
      description: m.description,
      status: 'PENDING',
      order: index + 1,
    }));

    const agentIds = jobData.assignedAgentIds || (jobData.assignedAgentId ? [jobData.assignedAgentId] : []);
    const status: JobStatus = agentIds.length > 0 || jobData.assignedClientId ? 'ASSIGNED' : 'PENDING';

    const newJob: Job = {
      id: jobId,
      title: jobData.title,
      description: jobData.description,
      requirements: jobData.requirements || ['Deliverable quality check', 'Timeline adherence'],
      categoryId: jobData.categoryId,
      paymentAmount: jobData.paymentAmount,
      deadline: jobData.deadline,
      priority: jobData.priority || 'MEDIUM',
      status,
      attachments: jobData.attachments || [],
      clientId: jobData.clientId || jobData.assignedClientId,
      clientName: jobData.clientName || jobData.assignedClient,
      assignedClientId: jobData.assignedClientId || jobData.clientId,
      assignedClient: jobData.assignedClient || jobData.clientName,
      assignedAgentId: jobData.assignedAgentId,
      assignedAgentName: jobData.assignedAgentName,
      createdAt: new Date().toISOString(),
      milestones: newMilestones,
      assignedAgentIds: agentIds,
    };

    this.db.jobs.unshift(newJob);

    // Create assignments
    for (const agentId of newJob.assignedAgentIds) {
      this.db.jobAssignments.push({
        id: `asgn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        jobId,
        agentId,
        status: 'ASSIGNED',
        assignedAt: new Date().toISOString(),
      });

      // Send notification to agent
      this.createNotification({
        userId: agentId,
        title: 'New Job Assigned',
        message: `You were assigned to "${newJob.title}" with payment of ${newJob.paymentAmount.toLocaleString()} KES.`,
        type: 'job',
        linkUrl: `/jobs/${jobId}`,
      });
    }

    if (newJob.assignedClientId) {
      this.createNotification({
        userId: newJob.assignedClientId,
        title: 'New Work Assignment Received',
        message: `Your supervisor assigned "${newJob.title}". Due date: ${new Date(newJob.deadline).toLocaleDateString()}.`,
        type: 'job',
        linkUrl: `/client/workplace`,
      });
    }

    this.logActivity({
      action: 'JOB_CREATED',
      details: `Created task "${newJob.title}" for ${newJob.paymentAmount.toLocaleString()} KES. Client: ${newJob.assignedClient || 'General'}. Supervisor: ${newJob.assignedAgentName || 'Admin'}.`,
      type: 'job',
    });

    this.persistDatabase();
    return this.getJobById(jobId);
  }

  updateJob(id: string, updates: Partial<Job>) {
    const idx = this.db.jobs.findIndex((j) => j.id === id);
    if (idx === -1) return null;
    this.db.jobs[idx] = { ...this.db.jobs[idx], ...updates };
    this.persistDatabase();
    return this.getJobById(id);
  }

  deleteJob(id: string) {
    this.db.jobs = this.db.jobs.filter((j) => j.id !== id);
    this.db.jobAssignments = this.db.jobAssignments.filter((a) => a.jobId !== id);
    this.db.submissions = this.db.submissions.filter((s) => s.jobId !== id);
    this.persistDatabase();
    return true;
  }

  acceptJob(jobId: string, agentId: string) {
    const job = this.db.jobs.find((j) => j.id === jobId);
    if (!job) throw new Error('Job not found');

    const asgn = this.db.jobAssignments.find((a) => a.jobId === jobId && a.agentId === agentId);
    if (asgn) {
      asgn.status = 'IN_PROGRESS';
      asgn.acceptedAt = new Date().toISOString();
    } else {
      this.db.jobAssignments.push({
        id: `asgn-${Date.now()}`,
        jobId,
        agentId,
        status: 'IN_PROGRESS',
        assignedAt: new Date().toISOString(),
        acceptedAt: new Date().toISOString(),
      });
      if (!job.assignedAgentIds.includes(agentId)) {
        job.assignedAgentIds.push(agentId);
      }
    }

    job.status = 'IN_PROGRESS';
    this.persistDatabase();

    this.logActivity({
      action: 'JOB_ACCEPTED',
      details: `Agent ${agentId} accepted job "${job.title}".`,
      userId: agentId,
      type: 'job',
    });

    return this.getJobById(jobId, agentId);
  }

  toggleMilestone(jobId: string, milestoneId: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') {
    const job = this.db.jobs.find((j) => j.id === jobId);
    if (!job) return null;
    const ms = job.milestones.find((m) => m.id === milestoneId);
    if (!ms) return null;
    ms.status = status;
    this.persistDatabase();
    return ms;
  }

  submitJobWork(jobId: string, agentId: string, notes: string, fileUrls: string[]) {
    const job = this.db.jobs.find((j) => j.id === jobId);
    if (!job) throw new Error('Job not found');

    const submission: Submission = {
      id: `sub-${Date.now()}`,
      jobId,
      agentId,
      notes,
      fileUrls,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
    };

    // Remove previous submissions by this agent for this job if any
    this.db.submissions = this.db.submissions.filter((s) => !(s.jobId === jobId && s.agentId === agentId));
    this.db.submissions.push(submission);

    // Update assignment and job status
    const asgn = this.db.jobAssignments.find((a) => a.jobId === jobId && a.agentId === agentId);
    if (asgn) {
      asgn.status = 'SUBMITTED';
    }
    job.status = 'SUBMITTED';

    // Mark milestones completed
    job.milestones.forEach((m) => (m.status = 'COMPLETED'));

    // Notify admins
    const admins = this.db.users.filter((u) => u.role === 'ADMIN');
    for (const admin of admins) {
      this.createNotification({
        userId: admin.id,
        title: 'Job Submitted for Review',
        message: `Agent submitted deliverables for "${job.title}". Ready for your evaluation.`,
        type: 'review',
        linkUrl: `/admin/jobs`,
      });
    }

    this.logActivity({
      action: 'JOB_SUBMITTED',
      details: `Deliverables submitted for "${job.title}" by agent ${agentId}. Files: ${fileUrls.length}.`,
      userId: agentId,
      type: 'job',
    });

    this.persistDatabase();
    return submission;
  }

  reviewJobSubmission(jobId: string, agentId: string, decision: 'APPROVE' | 'REJECT' | 'CORRECTION_REQUIRED', reviewNotes: string, reviewerName: string = 'Supervisor') {
    const job = this.db.jobs.find((j) => j.id === jobId);
    if (!job) throw new Error('Job not found');

    const submission = this.db.submissions.find((s) => s.jobId === jobId && s.agentId === agentId);
    if (!submission) throw new Error('Submission not found');

    const asgn = this.db.jobAssignments.find((a) => a.jobId === jobId && a.agentId === agentId);

    if (decision === 'APPROVE') {
      submission.status = 'APPROVED';
      submission.adminReview = reviewNotes;
      submission.reviewedAt = new Date().toISOString();

      if (asgn) {
        asgn.status = 'APPROVED';
        asgn.completedAt = new Date().toISOString();
      }
      job.status = 'APPROVED';

      // Automatically credit earnings to agent!
      const user = this.db.users.find((u) => u.id === agentId);
      if (user) {
        user.balance = (user.balance || 0) + job.paymentAmount;

        const earnTx: Transaction = {
          id: `tx-earn-${Date.now()}`,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          type: 'EARNING',
          amount: job.paymentAmount,
          status: 'SUCCESSFUL',
          reference: `PAY-${job.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
          notes: `Approved payout for "${job.title}"`,
          createdAt: new Date().toISOString(),
        };
        this.db.transactions.unshift(earnTx);

        // Notify agent
        this.createNotification({
          userId: agentId,
          title: 'Work Approved & Earnings Credited! 🎉',
          message: `Your submission for "${job.title}" was approved! ${job.paymentAmount.toLocaleString()} KES has been credited to your available balance.`,
          type: 'payment',
          linkUrl: '/earnings',
        });
      }

      this.logActivity({
        action: 'SUBMISSION_APPROVED',
        details: `Deliverables approved for "${job.title}". Credited ${job.paymentAmount.toLocaleString()} KES to agent ${agentId}.`,
        type: 'job',
      });
    } else if (decision === 'CORRECTION_REQUIRED') {
      submission.status = 'UNDER_REVIEW';
      submission.adminReview = `[Correction Required by ${reviewerName}]: ${reviewNotes}`;
      submission.reviewedAt = new Date().toISOString();
      job.status = 'UNDER_REVIEW';
      job.correctionInstructions = reviewNotes;

      this.createNotification({
        userId: agentId,
        title: 'Correction Requested on Work ⚠️',
        message: `${reviewerName} requested corrections for "${job.title}": "${reviewNotes}". Please revise your deliverables.`,
        type: 'review',
        linkUrl: `/jobs/${job.id}`,
      });

      this.logActivity({
        action: 'SUBMISSION_CORRECTION_REQUESTED',
        details: `${reviewerName} requested corrections on "${job.title}". Instructions: ${reviewNotes}`,
        type: 'job',
      });
    } else {
      submission.status = 'REJECTED';
      submission.adminReview = reviewNotes;
      submission.reviewedAt = new Date().toISOString();

      if (asgn) {
        asgn.status = 'REJECTED';
      }
      job.status = 'REJECTED';

      this.createNotification({
        userId: agentId,
        title: 'Revision Requested on Submission ⚠️',
        message: `Admin requested changes for "${job.title}": "${reviewNotes}". Please check feedback and resubmit.`,
        type: 'review',
        linkUrl: `/jobs/${job.id}`,
      });

      this.logActivity({
        action: 'SUBMISSION_REJECTED',
        details: `Admin requested changes on "${job.title}". Reason: ${reviewNotes}`,
        type: 'job',
      });
    }

    this.persistDatabase();
    return this.getJobById(jobId, agentId);
  }

  // --- Transactions & Earnings ---
  getTransactions(userId?: string) {
    if (userId) {
      return this.db.transactions.filter((t) => t.userId === userId);
    }
    return this.db.transactions;
  }

  getAgentEarningsSummary(agentId: string) {
    const user = this.db.users.find((u) => u.id === agentId);
    if (!user) throw new Error('Agent not found');

    const agentTxs = this.db.transactions.filter((t) => t.userId === agentId);

    const lifetimeEarnings = agentTxs
      .filter((t) => t.type === 'EARNING' && t.status === 'SUCCESSFUL')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalWithdrawn = agentTxs
      .filter((t) => t.type === 'WITHDRAWAL' && t.status === 'SUCCESSFUL')
      .reduce((acc, t) => acc + t.amount, 0);

    const pendingWithdrawals = agentTxs
      .filter((t) => t.type === 'WITHDRAWAL' && t.status === 'PENDING')
      .reduce((acc, t) => acc + t.amount, 0);

    // Calculate pending earnings from submitted jobs not yet reviewed
    const submittedJobs = this.db.jobs.filter(
      (j) => j.assignedAgentIds?.includes(agentId) && (j.status === 'SUBMITTED' || j.status === 'UNDER_REVIEW')
    );
    const pendingEarnings = submittedJobs.reduce((acc, j) => acc + j.paymentAmount, 0);

    return {
      availableBalance: user.balance || 0,
      pendingEarnings,
      totalWithdrawn,
      pendingWithdrawals,
      lifetimeEarnings,
      transactions: agentTxs,
    };
  }

  requestWithdrawal(agentId: string, amount: number, mpesaNumber: string, notes?: string) {
    const user = this.db.users.find((u) => u.id === agentId);
    if (!user) throw new Error('User not found');

    if (amount <= 0) throw new Error('Withdrawal amount must be greater than 0');
    if (amount < this.db.settings.minWithdrawalAmount) {
      throw new Error(`Minimum withdrawal amount is ${this.db.settings.minWithdrawalAmount} KES`);
    }
    if ((user.balance || 0) < amount) {
      throw new Error('Insufficient available balance for this withdrawal');
    }

    // Deduct balance upfront
    user.balance = (user.balance || 0) - amount;

    const tx: Transaction = {
      id: `tx-wth-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      type: 'WITHDRAWAL',
      amount,
      status: 'PENDING',
      reference: `WTH-${Math.floor(100000 + Math.random() * 900000)}-${user.name.slice(0, 2).toUpperCase()}`,
      paymentChannel: 'MPESA',
      notes: notes || `M-Pesa withdrawal to ${mpesaNumber}`,
      createdAt: new Date().toISOString(),
    };

    this.db.transactions.unshift(tx);

    // Notify admins
    const admins = this.db.users.filter((u) => u.role === 'ADMIN');
    for (const admin of admins) {
      this.createNotification({
        userId: admin.id,
        title: 'New M-Pesa Withdrawal Request',
        message: `${user.name} requested ${amount.toLocaleString()} KES payout to ${mpesaNumber}.`,
        type: 'payment',
        linkUrl: '/admin/payments',
      });
    }

    this.logActivity({
      action: 'WITHDRAWAL_REQUESTED',
      details: `${user.name} queued withdrawal of ${amount.toLocaleString()} KES to M-Pesa ${mpesaNumber}.`,
      userId: user.id,
      userName: user.name,
      type: 'withdrawal',
    });

    this.persistDatabase();
    return tx;
  }

  processWithdrawal(txId: string, decision: 'APPROVE' | 'REJECT', payoutReceipt?: string, rejectionReason?: string) {
    const tx = this.db.transactions.find((t) => t.id === txId && t.type === 'WITHDRAWAL');
    if (!tx) throw new Error('Withdrawal transaction not found');
    if (tx.status !== 'PENDING') throw new Error('Transaction is not pending');

    const user = this.db.users.find((u) => u.id === tx.userId);

    if (decision === 'APPROVE') {
      tx.status = 'SUCCESSFUL';
      tx.mpesaReceipt = payoutReceipt || `MPESA_PAYOUT_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      tx.flutterwaveRef = `FLW_TRANSFER_${Date.now()}`;

      if (user) {
        this.createNotification({
          userId: user.id,
          title: 'Withdrawal Sent to M-Pesa 💸',
          message: `Your withdrawal of ${tx.amount.toLocaleString()} KES has been dispatched via Flutterwave M-Pesa payout. Receipt: ${tx.mpesaReceipt}`,
          type: 'payment',
          linkUrl: '/earnings',
        });
      }

      this.logActivity({
        action: 'WITHDRAWAL_APPROVED',
        details: `Admin processed M-Pesa payout of ${tx.amount.toLocaleString()} KES for ${tx.userName}. Receipt: ${tx.mpesaReceipt}`,
        type: 'withdrawal',
      });
    } else {
      tx.status = 'REJECTED';
      tx.notes = `${tx.notes || ''} [Rejected: ${rejectionReason || 'Declined by Administrator'}]`;

      // Refund the balance back to user
      if (user) {
        user.balance = (user.balance || 0) + tx.amount;
        this.createNotification({
          userId: user.id,
          title: 'Withdrawal Declined - Balance Refunded',
          message: `Your withdrawal request of ${tx.amount.toLocaleString()} KES was rejected: ${rejectionReason || 'Verification check failed'}. Funds have been restored to your balance.`,
          type: 'payment',
          linkUrl: '/earnings',
        });
      }

      this.logActivity({
        action: 'WITHDRAWAL_REJECTED',
        details: `Admin rejected withdrawal of ${tx.amount.toLocaleString()} KES for ${tx.userName}. Reason: ${rejectionReason}`,
        type: 'withdrawal',
      });
    }

    this.persistDatabase();
    return tx;
  }

  // --- Flutterwave Registration Payment & Webhook ---
  recordRegistrationPayment(userId: string, channel: 'MPESA' | 'AIRTEL_MONEY' | 'BANK_TRANSFER' | 'CARD' | 'PAYPAL', phone: string, flwRef?: string) {
    const user = this.db.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');

    const amount = this.db.settings.registrationFee;
    const ref = `FLW-REG-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const mpesaCode = `QJ${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const tx: Transaction = {
      id: `tx-reg-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      type: 'REGISTRATION_FEE',
      amount,
      status: 'SUCCESSFUL',
      reference: ref,
      paymentChannel: channel,
      mpesaReceipt: channel === 'MPESA' ? mpesaCode : undefined,
      notes: `Registration fee paid via Flutterwave (${channel})`,
      flutterwaveRef: flwRef || `FLW_TXN_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    this.db.transactions.unshift(tx);

    // ACTIVATE USER AS AGENT!
    user.role = 'AGENT';
    user.status = 'ACTIVE';
    if (phone && !user.mpesaNumber) {
      user.mpesaNumber = phone;
    }

    // Auto-assign to welcome job if setting enabled
    if (this.db.settings.autoAssignNewAgents) {
      const pendingJobs = this.db.jobs.filter((j) => j.status === 'PENDING' || j.status === 'ASSIGNED');
      if (pendingJobs.length > 0) {
        const targetJob = pendingJobs[0];
        if (!targetJob.assignedAgentIds.includes(user.id)) {
          targetJob.assignedAgentIds.push(user.id);
          this.db.jobAssignments.push({
            id: `asgn-${Date.now()}`,
            jobId: targetJob.id,
            agentId: user.id,
            status: 'ASSIGNED',
            assignedAt: new Date().toISOString(),
          });
        }
      }
    }

    this.createNotification({
      userId: user.id,
      title: 'Welcome to Swashub! Your Agent Account is Active 🚀',
      message: `Your registration fee payment of ${amount.toLocaleString()} KES has been confirmed. You now have full access to the Agent Workplace. Check your assigned jobs to get started!`,
      type: 'system',
      linkUrl: '/dashboard',
    });

    this.logActivity({
      action: 'AGENT_ACTIVATED',
      details: `${user.name} (${user.email}) activated as Agent after Flutterwave payment of ${amount.toLocaleString()} KES (${channel}).`,
      userId: user.id,
      userName: user.name,
      type: 'payment',
    });

    this.persistDatabase();
    const { passwordHash, ...safeUser } = user;
    return { user: safeUser, transaction: tx };
  }

  // --- Notifications ---
  getNotifications(userId: string) {
    return this.db.notifications.filter((n) => n.userId === userId);
  }

  createNotification(notif: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      read: false,
      createdAt: new Date().toISOString(),
      ...notif,
    };
    this.db.notifications.unshift(newNotif);
    this.persistDatabase();
    return newNotif;
  }

  markNotificationRead(id: string) {
    const notif = this.db.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.persistDatabase();
    }
    return notif;
  }

  markAllNotificationsRead(userId: string) {
    this.db.notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    this.persistDatabase();
    return true;
  }

  broadcastNotification(title: string, message: string, targetAgentId?: string) {
    if (targetAgentId) {
      this.createNotification({
        userId: targetAgentId,
        title,
        message,
        type: 'announcement',
      });
    } else {
      // Send to all agents
      const agents = this.db.users.filter((u) => u.role === 'AGENT');
      for (const agent of agents) {
        this.createNotification({
          userId: agent.id,
          title,
          message,
          type: 'announcement',
        });
      }
    }

    this.logActivity({
      action: 'ANNOUNCEMENT_BROADCAST',
      details: `Admin broadcasted announcement: "${title}" to ${targetAgentId ? `agent ${targetAgentId}` : 'all active agents'}.`,
      type: 'admin',
    });

    this.persistDatabase();
    return true;
  }

  // --- Messages & Support Chat ---
  getMessages(jobId?: string, userId?: string) {
    if (jobId) {
      return this.db.messages.filter((m) => m.jobId === jobId);
    }
    if (userId) {
      return this.db.messages.filter((m) => m.senderId === userId || m.receiverId === userId);
    }
    return this.db.messages;
  }

  createMessage(msg: {
    jobId?: string;
    senderId: string;
    senderName: string;
    senderRole: 'ADMIN' | 'AGENT' | 'PENDING_PAYMENT';
    receiverId?: string;
    content: string;
  }) {
    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      ...msg,
    };
    this.db.messages.push(newMsg);

    // If sent by agent, notify admins; if sent by admin, notify receiver
    if (msg.senderRole === 'AGENT') {
      const admins = this.db.users.filter((u) => u.role === 'ADMIN');
      for (const admin of admins) {
        this.createNotification({
          userId: admin.id,
          title: `New Message from ${msg.senderName}`,
          message: msg.content.length > 80 ? msg.content.slice(0, 80) + '...' : msg.content,
          type: 'system',
          linkUrl: msg.jobId ? `/admin/jobs` : `/admin/messages`,
        });
      }
    } else if (msg.receiverId) {
      this.createNotification({
        userId: msg.receiverId,
        title: 'New Message from Admin',
        message: msg.content.length > 80 ? msg.content.slice(0, 80) + '...' : msg.content,
        type: 'system',
        linkUrl: msg.jobId ? `/jobs/${msg.jobId}` : `/support`,
      });
    }

    this.persistDatabase();
    return newMsg;
  }

  // --- Settings ---
  getSettings() {
    return this.db.settings;
  }

  updateSettings(updates: Partial<PlatformSettings>) {
    this.db.settings = { ...this.db.settings, ...updates };
    this.logActivity({
      action: 'SETTINGS_UPDATED',
      details: `Admin updated platform configuration settings.`,
      type: 'admin',
    });
    this.persistDatabase();
    return this.db.settings;
  }

  // --- Activity Logs ---
  getActivityLogs() {
    return this.db.activityLogs.slice(0, 50);
  }

  logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    this.db.activityLogs.unshift(newLog);
    if (this.db.activityLogs.length > 200) {
      this.db.activityLogs.pop();
    }
  }

  // --- Clients Management ---
  getClients() {
    return this.db.clients || [];
  }

  getClientById(id: string) {
    if (!this.db.clients) return null;
    return this.db.clients.find((c) => c.id === id) || null;
  }

  createClient(clientData: Omit<Client, 'id' | 'totalSpent' | 'jobsPostedCount' | 'completedJobsCount' | 'joinedAt'>) {
    const newClient: Client = {
      id: `clt-${Date.now()}`,
      ...clientData,
      totalSpent: 0,
      jobsPostedCount: 0,
      completedJobsCount: 0,
      joinedAt: new Date().toISOString(),
    };
    if (!this.db.clients) this.db.clients = [];
    this.db.clients.push(newClient);
    this.persistDatabase();
    return newClient;
  }

  updateClient(id: string, updates: Partial<Client>) {
    if (!this.db.clients) return null;
    const idx = this.db.clients.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.db.clients[idx] = { ...this.db.clients[idx], ...updates };
    this.persistDatabase();
    return this.db.clients[idx];
  }

  activateClientWorkplace(id: string, agentName: string = 'Admin') {
    const client = this.updateClient(id, {
      status: 'ACTIVE',
      workplaceActivated: true,
      activatedAt: new Date().toISOString(),
      reviewedByAgentName: agentName,
    });
    if (client) {
      this.logActivity({
        action: 'CLIENT_WORKPLACE_ACTIVATED',
        details: `${agentName} activated monthly workplace for client ${client.name} (${client.department || 'Operations'}).`,
        type: 'client',
      });
    }
    return client;
  }

  suspendClientWorkplace(id: string, reason: string = 'Administrative review') {
    const client = this.updateClient(id, {
      status: 'SUSPENDED',
      workplaceActivated: false,
      rejectionReason: reason,
    });
    if (client) {
      this.logActivity({
        action: 'CLIENT_WORKPLACE_SUSPENDED',
        details: `Client ${client.name} suspended. Reason: ${reason}`,
        type: 'client',
      });
    }
    return client;
  }

  assignAgentToClient(clientId: string, agentId: string, agentName: string) {
    const client = this.updateClient(clientId, {
      supervisorAgentId: agentId,
      supervisorAgentName: agentName,
    });
    // Also sync existing contract supervisor
    if (this.db.contracts) {
      const contract = this.db.contracts.find((c) => c.clientId === clientId && c.status === 'ACTIVE');
      if (contract) {
        contract.supervisorAgentId = agentId;
        contract.supervisorAgentName = agentName;
      }
    }
    if (client) {
      this.logActivity({
        action: 'CLIENT_SUPERVISOR_ASSIGNED',
        details: `Assigned agent ${agentName} as supervising manager for client ${client.name}.`,
        type: 'client',
      });
      this.createNotification({
        userId: agentId,
        title: 'New Client Assigned to You',
        message: `You are now supervising ${client.name} (${client.department || 'Support & Operations'}). Monthly pay: KES ${(client.monthlySalary || 35000).toLocaleString()}.`,
        type: 'job',
      });
    }
    this.persistDatabase();
    return client;
  }

  // --- Monthly Contracts Management ---
  getContracts(clientId?: string) {
    const contracts = this.db.contracts || [];
    if (clientId) {
      return contracts.filter((c) => c.clientId === clientId);
    }
    return contracts;
  }

  getContractById(id: string) {
    if (!this.db.contracts) return null;
    return this.db.contracts.find((c) => c.id === id) || null;
  }

  createContract(contractData: Omit<MonthlyContract, 'id' | 'createdAt'>) {
    const newContract: MonthlyContract = {
      id: `ctr-${Date.now()}`,
      ...contractData,
      createdAt: new Date().toISOString(),
    };
    if (!this.db.contracts) this.db.contracts = [];
    this.db.contracts.unshift(newContract);

    // Sync client record
    this.updateClient(contractData.clientId, {
      monthlySalary: contractData.monthlySalary,
      department: contractData.department,
      contractStatus: contractData.status,
      contractStartDate: contractData.startDate,
      contractEndDate: contractData.endDate,
      nextPaymentDate: contractData.nextPaymentDate,
      workingHours: contractData.workingHours,
      workingDays: contractData.workingDays,
      responsibilities: contractData.responsibilities,
      supervisorAgentId: contractData.supervisorAgentId,
      supervisorAgentName: contractData.supervisorAgentName,
    });

    this.logActivity({
      action: 'MONTHLY_CONTRACT_CREATED',
      details: `Created monthly employment contract for ${contractData.clientName} (KES ${contractData.monthlySalary.toLocaleString()}/mo, Supervisor: ${contractData.supervisorAgentName}).`,
      type: 'admin',
    });

    this.persistDatabase();
    return newContract;
  }

  updateContract(id: string, updates: Partial<MonthlyContract>) {
    if (!this.db.contracts) return null;
    const idx = this.db.contracts.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    this.db.contracts[idx] = { ...this.db.contracts[idx], ...updates };
    const contract = this.db.contracts[idx];

    // Sync client record if salary, status or dates changed
    if (updates.monthlySalary || updates.department || updates.status || updates.supervisorAgentId) {
      this.updateClient(contract.clientId, {
        monthlySalary: contract.monthlySalary,
        department: contract.department,
        contractStatus: contract.status,
        contractStartDate: contract.startDate,
        contractEndDate: contract.endDate,
        nextPaymentDate: contract.nextPaymentDate,
        supervisorAgentId: contract.supervisorAgentId,
        supervisorAgentName: contract.supervisorAgentName,
      });
    }

    this.logActivity({
      action: 'MONTHLY_CONTRACT_UPDATED',
      details: `Updated contract ${contract.id} for ${contract.clientName}. Status: ${contract.status}, Pay: KES ${contract.monthlySalary.toLocaleString()}.`,
      type: 'admin',
    });

    this.persistDatabase();
    return contract;
  }

  terminateContract(id: string, reason: string = 'Contract concluded') {
    return this.updateContract(id, {
      status: 'TERMINATED',
      internalNotes: reason,
    });
  }

  // --- Monthly Payroll Command Center ---
  getMonthlyPayroll(month?: string, clientId?: string) {
    let list = this.db.monthlyPayroll || [];
    if (month && month !== 'ALL') {
      list = list.filter((p) => p.payrollMonth.toLowerCase() === month.toLowerCase());
    }
    if (clientId) {
      list = list.filter((p) => p.clientId === clientId);
    }
    return list;
  }

  generateMonthlyPayroll(month: string) {
    if (!this.db.monthlyPayroll) this.db.monthlyPayroll = [];
    const activeContracts = (this.db.contracts || []).filter((c) => c.status === 'ACTIVE' || c.status === 'RENEWED');
    const created: MonthlyPayrollRecord[] = [];

    for (const contract of activeContracts) {
      const exists = this.db.monthlyPayroll.some(
        (p) => p.clientId === contract.clientId && p.payrollMonth.toLowerCase() === month.toLowerCase()
      );
      if (!exists) {
        const client = this.getClientById(contract.clientId);
        const record: MonthlyPayrollRecord = {
          id: `pay-${month.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${contract.clientId}`,
          payrollMonth: month,
          clientId: contract.clientId,
          clientName: contract.clientName,
          clientEmail: contract.clientEmail,
          department: contract.department,
          basicMonthlyPay: contract.monthlySalary,
          bonus: contract.bonuses || 0,
          bonusReason: contract.bonuses > 0 ? 'Standard monthly performance bonus' : undefined,
          deductions: contract.deductions || 0,
          adjustments: 0,
          netPayment: contract.monthlySalary + (contract.bonuses || 0) - (contract.deductions || 0),
          status: 'DRAFT',
          paymentMethod: 'MPESA',
          payoutAccount: client?.mpesaPayoutNumber || client?.phone || '+254 700 000000',
          approvalStatus: 'PENDING_REVIEW',
          createdAt: new Date().toISOString(),
        };
        this.db.monthlyPayroll.unshift(record);
        created.push(record);
      }
    }

    this.logActivity({
      action: 'PAYROLL_GENERATED',
      details: `Generated monthly payroll for ${month} with ${created.length} client entries.`,
      type: 'admin',
    });

    this.persistDatabase();
    return this.getMonthlyPayroll(month);
  }

  updatePayrollRecord(id: string, updates: Partial<MonthlyPayrollRecord>) {
    if (!this.db.monthlyPayroll) return null;
    const idx = this.db.monthlyPayroll.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const current = this.db.monthlyPayroll[idx];
    const updated = { ...current, ...updates };

    // Recalculate net payment
    const basic = updated.basicMonthlyPay || 0;
    const bonus = updated.bonus || 0;
    const deductions = updated.deductions || 0;
    const adjustments = updated.adjustments || 0;
    updated.netPayment = basic + bonus - deductions + adjustments;

    this.db.monthlyPayroll[idx] = updated;
    this.persistDatabase();
    return updated;
  }

  approvePayrollRecord(id: string, adminName: string = 'Administrator') {
    return this.updatePayrollRecord(id, {
      status: 'APPROVED',
      approvalStatus: 'APPROVED',
      approvedBy: adminName,
      approvedAt: new Date().toISOString(),
    });
  }

  processPayrollPayment(id: string, adminName: string = 'Administrator') {
    const record = this.db.monthlyPayroll?.find((p) => p.id === id);
    if (!record) return null;

    const txRef = `MP-PAY-${Date.now().toString().slice(-4)}`;
    const receiptNum = `SWP-2026-REC-${Math.floor(1000 + Math.random() * 9000)}`;

    const updated = this.updatePayrollRecord(id, {
      status: 'PAID',
      paidAt: new Date().toISOString(),
      transactionReference: txRef,
      receiptNumber: receiptNum,
      approvedBy: adminName,
    });

    // Notify client of monthly payout
    const client = this.getClientById(record.clientId);
    const clientUser = this.db.users.find((u) => u.email.toLowerCase() === record.clientEmail.toLowerCase());
    if (clientUser) {
      clientUser.balance = (clientUser.balance || 0) + record.netPayment;
      this.createNotification({
        userId: clientUser.id,
        title: `Monthly Payout Sent! KES ${record.netPayment.toLocaleString()} 💰`,
        message: `Your ${record.payrollMonth} net salary of KES ${record.netPayment.toLocaleString()} has been disbursed via ${record.paymentMethod} to ${record.payoutAccount}. Ref: ${txRef}`,
        type: 'payment',
        linkUrl: '/earnings',
      });
    }

    this.logActivity({
      action: 'PAYROLL_DISBURSED',
      details: `Processed ${record.payrollMonth} payment of KES ${record.netPayment.toLocaleString()} to ${record.clientName} (${record.paymentMethod} ${record.payoutAccount}). Receipt: ${receiptNum}`,
      type: 'payment',
    });

    this.persistDatabase();
    return updated;
  }

  batchApprovePayroll(month: string, adminName: string = 'Administrator') {
    const records = this.getMonthlyPayroll(month);
    let count = 0;
    for (const r of records) {
      if (r.status === 'DRAFT' || r.status === 'REVIEWED') {
        this.approvePayrollRecord(r.id, adminName);
        count++;
      }
    }
    this.persistDatabase();
    return { count, month };
  }

  batchProcessPayroll(month: string, adminName: string = 'Administrator') {
    const records = this.getMonthlyPayroll(month);
    let count = 0;
    for (const r of records) {
      if (r.status === 'APPROVED' || r.status === 'PROCESSING') {
        this.processPayrollPayment(r.id, adminName);
        count++;
      }
    }
    this.persistDatabase();
    return { count, month };
  }

  // --- Client Work Sessions & Attendance Tracker ---
  getWorkSessions(clientId?: string) {
    const sessions = this.db.workSessions || [];
    if (clientId) {
      return sessions.filter((s) => s.clientId === clientId);
    }
    return sessions;
  }

  startWorkSession(clientId: string, taskDescription: string, relatedJobId?: string, relatedJobTitle?: string) {
    const client = this.getClientById(clientId);
    if (!client) throw new Error('Client not found');

    const newSession: ClientWorkSession = {
      id: `ws-${Date.now()}`,
      clientId,
      clientName: client.name,
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toISOString(),
      durationMinutes: 0,
      status: 'IN_PROGRESS',
      taskDescription,
      relatedJobId,
      relatedJobTitle,
    };

    if (!this.db.workSessions) this.db.workSessions = [];
    this.db.workSessions.unshift(newSession);

    this.updateClient(clientId, {
      currentWorkStatus: 'IN_SESSION',
      lastActiveAt: new Date().toISOString(),
    });

    this.persistDatabase();
    return newSession;
  }

  stopWorkSession(sessionId: string, durationMinutes?: number, notes?: string) {
    if (!this.db.workSessions) return null;
    const session = this.db.workSessions.find((s) => s.id === sessionId);
    if (!session) return null;

    const endTime = new Date().toISOString();
    session.endTime = endTime;
    session.status = 'COMPLETED';
    if (durationMinutes !== undefined) {
      session.durationMinutes = durationMinutes;
    } else {
      const startMs = new Date(session.startTime).getTime();
      const endMs = new Date(endTime).getTime();
      session.durationMinutes = Math.max(15, Math.round((endMs - startMs) / (1000 * 60)));
    }
    if (notes) session.notes = notes;

    this.updateClient(session.clientId, {
      currentWorkStatus: 'ONLINE',
      lastActiveAt: endTime,
    });

    this.persistDatabase();
    return session;
  }

  verifyWorkSession(sessionId: string, supervisorName: string = 'Supervisor') {
    if (!this.db.workSessions) return null;
    const session = this.db.workSessions.find((s) => s.id === sessionId);
    if (!session) return null;

    session.status = 'VERIFIED';
    session.verifiedBySupervisor = true;
    this.persistDatabase();
    return session;
  }

  getClientWorkplace(clientId: string) {
    const client = this.getClientById(clientId);
    if (!client) return null;

    const contracts = this.getContracts(clientId);
    const activeContract = contracts.find((c) => c.status === 'ACTIVE') || contracts[0] || null;
    const payrollRecords = this.getMonthlyPayroll(undefined, clientId);
    const currentPayroll = payrollRecords.find((p) => p.payrollMonth === 'October 2026') || payrollRecords[0] || null;
    const workSessions = this.getWorkSessions(clientId);
    const assignedJobs = (this.db.jobs || []).filter(
      (j) => j.clientId === clientId || j.assignedAgentIds.includes(clientId) || j.categoryName?.includes(client.department || '')
    );

    return {
      client,
      activeContract,
      allContracts: contracts,
      currentPayroll,
      payrollRecords,
      workSessions,
      assignedJobs,
    };
  }

  // --- Disputes & Resolutions ---
  getDisputes() {
    return this.db.disputes || [];
  }

  resolveDispute(id: string, verdict: string, resolution: 'RESOLVED_WORKER' | 'RESOLVED_CLIENT' | 'REFUNDED') {
    if (!this.db.disputes) return null;
    const disp = this.db.disputes.find((d) => d.id === id);
    if (!disp) return null;
    disp.status = resolution;
    disp.verdict = verdict;
    disp.resolvedAt = new Date().toISOString();
    this.logActivity({
      action: 'DISPUTE_RESOLVED',
      details: `Admin resolved dispute ${disp.id} for "${disp.jobTitle}" with verdict: ${verdict}`,
      type: 'dispute',
    });
    this.persistDatabase();
    return disp;
  }

  // --- Support Tickets ---
  getSupportTickets() {
    return this.db.supportTickets || [];
  }

  replySupportTicket(id: string, senderId: string, senderName: string, senderRole: any, message: string) {
    if (!this.db.supportTickets) return null;
    const ticket = this.db.supportTickets.find((t) => t.id === id);
    if (!ticket) return null;
    ticket.messages.push({
      senderId,
      senderName,
      senderRole,
      message,
      timestamp: new Date().toISOString(),
    });
    ticket.updatedAt = new Date().toISOString();
    if (senderRole === 'ADMIN') {
      ticket.status = 'WAITING';
    } else {
      ticket.status = 'IN_PROGRESS';
    }
    this.persistDatabase();
    return ticket;
  }

  updateTicketStatus(id: string, status: any) {
    if (!this.db.supportTickets) return null;
    const ticket = this.db.supportTickets.find((t) => t.id === id);
    if (!ticket) return null;
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    this.persistDatabase();
    return ticket;
  }

  // --- Fraud & Risk Alerts ---
  getFraudAlerts() {
    return this.db.fraudAlerts || [];
  }

  dismissFraudAlert(id: string) {
    if (!this.db.fraudAlerts) return null;
    const alert = this.db.fraudAlerts.find((a) => a.id === id);
    if (alert) {
      alert.status = 'DISMISSED';
      this.persistDatabase();
    }
    return alert;
  }

  // --- Task Templates ---
  getTaskTemplates() {
    return this.db.taskTemplates || [];
  }

  createTaskTemplate(tmpl: Omit<TaskTemplate, 'id'>) {
    const newTmpl: TaskTemplate = {
      id: `tmpl-${Date.now()}`,
      ...tmpl,
    };
    if (!this.db.taskTemplates) this.db.taskTemplates = [];
    this.db.taskTemplates.push(newTmpl);
    this.persistDatabase();
    return newTmpl;
  }

  // --- Data Export & System Health ---
  exportDatabase() {
    return this.db;
  }

  getSystemHealth() {
    return {
      status: 'HEALTHY',
      databaseEngine: 'File JSON Persistent Storage (Production Schema Ready)',
      activeWorkers: this.db.users.filter((u) => u.role === 'AGENT' && u.status === 'ACTIVE').length,
      activeJobs: this.db.jobs.filter((j) => j.status === 'IN_PROGRESS' || j.status === 'ASSIGNED').length,
      flutterwaveGateway: 'ONLINE',
      mpesaDisbursementApi: 'CONNECTED (Paybill 880100)',
      uptimeSeconds: Math.floor(process.uptime()),
      storageAllocatedMB: 4.8,
      lastBackupTimestamp: new Date().toISOString(),
    };
  }

  // Reset database for test environments
  resetToDefaults() {
    this.db = {
      users: INITIAL_USERS,
      categories: INITIAL_CATEGORIES,
      jobs: INITIAL_JOBS,
      jobAssignments: INITIAL_ASSIGNMENTS,
      submissions: INITIAL_SUBMISSIONS,
      transactions: INITIAL_TRANSACTIONS,
      notifications: INITIAL_NOTIFICATIONS,
      messages: INITIAL_MESSAGES,
      settings: INITIAL_SETTINGS,
      activityLogs: INITIAL_LOGS,
      clients: INITIAL_CLIENTS,
      contracts: INITIAL_CONTRACTS,
      monthlyPayroll: INITIAL_MONTHLY_PAYROLL,
      workSessions: INITIAL_WORK_SESSIONS,
      disputes: INITIAL_DISPUTES,
      supportTickets: INITIAL_TICKETS,
      fraudAlerts: INITIAL_FRAUD_ALERTS,
      taskTemplates: INITIAL_TEMPLATES,
    };
    this.persistDatabase();
    return true;
  }
}

export const storage = new StorageService();
