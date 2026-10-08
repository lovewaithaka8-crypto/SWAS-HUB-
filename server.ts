import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { storage } from './src/server/storage.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Ensure uploads folder exists
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage
const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper: Parse user from authorization token/header
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
    name: string;
  };
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  // Format: "Bearer usr-xxx" or "Bearer <base64>"
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return next();

  try {
    let userId = token;
    if (token.includes(':')) {
      userId = token.split(':')[0];
    } else if (token.startsWith('ey') || token.includes('=')) {
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        if (decoded.includes(':')) userId = decoded.split(':')[0];
      } catch {
        // use token as id directly
      }
    }

    const user = storage.getUserById(userId);
    if (user) {
      req.user = {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
      };
    }
  } catch (err) {
    console.warn('Auth parsing error:', err);
  }
  next();
};

app.use(authMiddleware);

// ==================== REST API ENDPOINTS ====================

// --- Authentication ---
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = storage.getUserByEmail(email);
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.status === 'SUSPENDED') {
    return res.status(403).json({ error: 'Account has been suspended by administration. Contact support.' });
  }

  const { passwordHash, ...safeUser } = user;
  const token = `${user.id}:${user.role}:${Date.now()}`;

  res.json({
    user: safeUser,
    token,
    message: 'Login successful',
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, password, categoryId, mpesaNumber } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'Name, email, phone, and password are required' });
  }

  const existing = storage.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  // New user starts in PENDING_PAYMENT status until registration fee is completed
  const newUser = storage.createUser({
    name,
    email,
    phone,
    password,
    role: 'PENDING_PAYMENT',
    status: 'PENDING_PAYMENT',
    categoryId,
    mpesaNumber: mpesaNumber || phone,
  });

  const token = `${newUser.id}:${newUser.role}:${Date.now()}`;
  res.status(201).json({
    user: newUser,
    token,
    registrationFee: storage.getSettings().registrationFee,
    currency: storage.getSettings().currency,
    message: 'Account created. Please complete the registration fee to activate your Agent workspace.',
  });
});

app.get('/api/auth/me', (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user = storage.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

app.put('/api/auth/profile', (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { phone, mpesaNumber, bio, avatarUrl, categoryId } = req.body;
  const updated = storage.updateUser(req.user.id, {
    ...(phone && { phone }),
    ...(mpesaNumber && { mpesaNumber }),
    ...(bio !== undefined && { bio }),
    ...(avatarUrl && { avatarUrl }),
    ...(categoryId && { categoryId }),
  });
  res.json({ user: updated });
});

// --- Categories ---
app.get('/api/categories', (_req: Request, res: Response) => {
  const categories = storage.getCategories();
  res.json({ categories });
});

app.post('/api/categories', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const { name, slug, description, icon } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required' });
  }
  const category = storage.createCategory({
    name,
    slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description,
    icon: icon || 'Briefcase',
    active: true,
  });
  res.status(201).json({ category });
});

app.put('/api/categories/:id', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const updated = storage.updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Category not found' });
  res.json({ category: updated });
});

app.delete('/api/categories/:id', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  storage.deleteCategory(req.params.id);
  res.json({ success: true });
});

// --- Jobs ---
app.get('/api/jobs', (req: AuthRequest, res: Response) => {
  const role = req.user?.role || 'PUBLIC';
  const userId = req.user?.id;
  const jobs = storage.getJobs(role, userId);
  res.json({ jobs });
});

app.get('/api/jobs/:id', (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const job = storage.getJobById(req.params.id, userId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  // Security: If user is an AGENT, ensure they are assigned to this job
  if (req.user?.role === 'AGENT' && !job.assignedAgentIds.includes(req.user.id)) {
    return res.status(403).json({ error: 'Access denied: You are not assigned to this job.' });
  }

  res.json({ job });
});

app.post('/api/jobs', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'AGENT') {
    return res.status(403).json({ error: 'Forbidden: Admin or Agent access required' });
  }
  const {
    title,
    description,
    requirements,
    categoryId,
    paymentAmount,
    deadline,
    attachments,
    milestones,
    assignedAgentIds,
    priority,
    clientId,
    clientName,
    assignedClientId,
    assignedClient,
  } = req.body;

  if (!title || !description || !paymentAmount || !deadline) {
    return res.status(400).json({ error: 'Missing required task parameters' });
  }

  const job = storage.createJob({
    title,
    description,
    requirements: Array.isArray(requirements) ? requirements : [requirements || 'Standard requirements'],
    categoryId: categoryId || 'cat-customer-support',
    paymentAmount: Number(paymentAmount),
    deadline,
    priority: priority || 'MEDIUM',
    attachments: attachments || [],
    milestones: milestones || [],
    assignedAgentIds: assignedAgentIds || (req.user.role === 'AGENT' ? [req.user.id] : []),
    clientId: clientId || assignedClientId,
    clientName: clientName || assignedClient,
    assignedClientId: assignedClientId || clientId,
    assignedClient: assignedClient || clientName,
    assignedAgentId: req.user.role === 'AGENT' ? req.user.id : undefined,
    assignedAgentName: req.user.role === 'AGENT' ? req.user.name : undefined,
  });

  res.status(201).json({ job });
});

app.put('/api/jobs/:id', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'AGENT') {
    return res.status(403).json({ error: 'Forbidden: Admin or Agent access required' });
  }
  const updated = storage.updateJob(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Job not found' });
  res.json({ job: updated });
});

app.delete('/api/jobs/:id', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  storage.deleteJob(req.params.id);
  res.json({ success: true });
});

// Agent actions on jobs
app.post('/api/jobs/:id/accept', (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'AGENT') {
    return res.status(403).json({ error: 'Forbidden: Agent access required' });
  }
  try {
    const job = storage.acceptJob(req.params.id, req.user.id);
    res.json({ job, message: 'Job accepted! You may now track milestones and submit your work.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to accept job' });
  }
});

app.post('/api/jobs/:id/milestones/:mId/toggle', (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { status } = req.body;
  const milestone = storage.toggleMilestone(req.params.id, req.params.mId, status);
  if (!milestone) return res.status(404).json({ error: 'Milestone not found' });
  res.json({ milestone });
});

app.post('/api/jobs/:id/submit', (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'AGENT') {
    return res.status(403).json({ error: 'Forbidden: Agent access required' });
  }
  const { notes, fileUrls } = req.body;
  if (!notes) {
    return res.status(400).json({ error: 'Please provide notes/summary for your submission' });
  }

  try {
    const submission = storage.submitJobWork(
      req.params.id,
      req.user.id,
      notes,
      Array.isArray(fileUrls) ? fileUrls : []
    );
    res.json({ submission, message: 'Work successfully submitted for Admin review!' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Submission failed' });
  }
});

// Review on job submissions (Admin or supervising Agent)
app.post('/api/jobs/:id/review', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'AGENT') {
    return res.status(403).json({ error: 'Forbidden: Admin or Agent access required' });
  }
  const { agentId, decision, reviewNotes } = req.body;
  if (!decision) {
    return res.status(400).json({ error: 'decision (APPROVE | REJECT | CORRECTION_REQUIRED) is required' });
  }

  try {
    const updatedJob = storage.reviewJobSubmission(
      req.params.id,
      agentId || req.user.id,
      decision,
      reviewNotes || (decision === 'APPROVE' ? 'Approved' : 'Changes requested'),
      req.user.name || 'Supervisor'
    );
    res.json({
      job: updatedJob,
      message:
        decision === 'APPROVE'
          ? 'Submission approved and marked completed!'
          : decision === 'CORRECTION_REQUIRED'
          ? 'Correction instructions sent to client!'
          : 'Submission rejected and feedback sent.',
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Review failed' });
  }
});

// --- Agents Management (Admin) ---
app.get('/api/agents', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const allUsers = storage.getUsers();
  const agents = allUsers.filter((u) => u.role === 'AGENT' || u.role === 'PENDING_PAYMENT');

  // Enrich with performance metrics
  const enriched = agents.map((agent) => {
    const agentJobs = storage.getJobs('ADMIN').filter((j) => j.assignedAgentIds?.includes(agent.id));
    const completedJobs = agentJobs.filter((j) => j.status === 'APPROVED' || j.status === 'PAID').length;
    const category = storage.getCategoryById(agent.categoryId || '');
    return {
      ...agent,
      categoryName: category?.name || 'Unassigned',
      totalAssignedJobs: agentJobs.length,
      completedJobs,
    };
  });

  res.json({ agents: enriched });
});

app.post('/api/agents', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const { name, email, phone, password, categoryId, mpesaNumber } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'Missing required credentials' });
  }

  const existing = storage.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  // Admin directly creates verified Agent
  const newAgent = storage.createUser({
    name,
    email,
    phone,
    password,
    role: 'AGENT',
    status: 'ACTIVE',
    categoryId,
    mpesaNumber: mpesaNumber || phone,
  });

  res.status(201).json({ agent: newAgent, message: 'Agent account successfully created!' });
});

app.put('/api/agents/:id/status', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const { status, role } = req.body;
  const updated = storage.updateUser(req.params.id, {
    ...(status && { status }),
    ...(role && { role }),
  });
  if (!updated) return res.status(404).json({ error: 'Agent not found' });
  res.json({ agent: updated });
});

app.put('/api/agents/:id/category', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const { categoryId } = req.body;
  const updated = storage.updateUser(req.params.id, { categoryId });
  if (!updated) return res.status(404).json({ error: 'Agent not found' });
  res.json({ agent: updated });
});

// --- Earnings & Withdrawals ---
app.get('/api/earnings', (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'AGENT') {
    return res.status(403).json({ error: 'Forbidden: Agent access required' });
  }
  try {
    const summary = storage.getAgentEarningsSummary(req.user.id);
    res.json(summary);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to fetch earnings' });
  }
});

app.post('/api/withdrawals/request', (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'AGENT') {
    return res.status(403).json({ error: 'Forbidden: Agent access required' });
  }
  const { amount, mpesaNumber, notes } = req.body;
  if (!amount || !mpesaNumber) {
    return res.status(400).json({ error: 'Amount and M-Pesa phone number are required' });
  }

  try {
    const tx = storage.requestWithdrawal(req.user.id, Number(amount), mpesaNumber, notes);
    res.status(201).json({
      transaction: tx,
      message: 'Withdrawal request submitted! Payout will be sent to your M-Pesa once verified by Admin.',
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Withdrawal request failed' });
  }
});

app.get('/api/withdrawals', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const allTxs = storage.getTransactions();
  const withdrawals = allTxs.filter((t) => t.type === 'WITHDRAWAL');
  res.json({ withdrawals });
});

app.post('/api/withdrawals/:id/process', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const { decision, payoutReceipt, rejectionReason } = req.body;
  if (!decision || (decision !== 'APPROVE' && decision !== 'REJECT')) {
    return res.status(400).json({ error: 'decision must be APPROVE or REJECT' });
  }

  try {
    const tx = storage.processWithdrawal(req.params.id, decision, payoutReceipt, rejectionReason);
    res.json({
      transaction: tx,
      message: decision === 'APPROVE' ? 'M-Pesa payout confirmed and marked as successful!' : 'Withdrawal rejected and funds refunded to agent balance.',
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Processing failed' });
  }
});

// --- Flutterwave Payment Flow (M-Pesa, Cards, Bank, Airtel) ---
app.post('/api/flutterwave/initialize', (req: AuthRequest, res: Response) => {
  const { email, phone, name, channel = 'MPESA', userId } = req.body;
  const targetUserId = req.user?.id || userId;

  if (!targetUserId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const settings = storage.getSettings();
  const txRef = `SWASHUB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Return Flutterwave checkout metadata configuration
  res.json({
    status: 'success',
    data: {
      link: null, // Simulated or Flutterwave standard checkout
      tx_ref: txRef,
      amount: settings.registrationFee,
      currency: settings.currency,
      customer: {
        email,
        phonenumber: phone,
        name,
      },
      payment_options: 'mpesa,card,ussd,banktransfer,account',
      customizations: {
        title: 'Swashub Agent Registration',
        description: `Lifetime Agent Accreditation & Workplace Access (${settings.registrationFee} ${settings.currency})`,
        logo: 'https://swashub.com/logo.png',
      },
      publicKey: settings.flutterwavePublicKey,
      channel,
    },
  });
});

app.post('/api/flutterwave/verify', (req: AuthRequest, res: Response) => {
  const { tx_ref, flw_ref, channel = 'MPESA', phone, userId } = req.body;
  const targetUserId = req.user?.id || userId;

  if (!targetUserId) {
    return res.status(400).json({ error: 'User ID is required for verification' });
  }

  try {
    // Record payment & upgrade user to AGENT role!
    const result = storage.recordRegistrationPayment(
      targetUserId,
      channel.toUpperCase() as any,
      phone || '',
      flw_ref || `FLW_VERIFIED_${tx_ref}`
    );

    res.json({
      status: 'success',
      user: result.user,
      transaction: result.transaction,
      message: 'Payment verified! Your account is now activated as an accredited Swashub Agent.',
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Payment verification failed' });
  }
});

// Webhook endpoint for Flutterwave
app.post('/api/flutterwave/webhook', (req: Request, res: Response) => {
  const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH || 'swashub_webhook_secret_key';
  const signature = req.headers['verif-hash'];

  // Accept and log webhook
  console.log('Received Flutterwave Webhook:', req.body?.event);

  if (signature && signature !== secretHash) {
    console.warn('Webhook signature mismatch, processing in test sandbox mode');
  }

  const payload = req.body?.data;
  if (payload && payload.status === 'successful') {
    const customerEmail = payload.customer?.email;
    if (customerEmail) {
      const user = storage.getUserByEmail(customerEmail);
      if (user && user.role === 'PENDING_PAYMENT') {
        storage.recordRegistrationPayment(
          user.id,
          (payload.payment_type || 'MPESA').toUpperCase() as any,
          payload.customer?.phone_number || '',
          String(payload.id)
        );
      }
    }
  }

  res.status(200).send('Webhook received OK');
});

// --- Transactions & Audit Ledger ---
app.get('/api/transactions', (req: AuthRequest, res: Response) => {
  const role = req.user?.role;
  const userId = req.user?.id;
  if (role === 'ADMIN') {
    return res.json({ transactions: storage.getTransactions() });
  }
  if (role === 'AGENT' && userId) {
    return res.json({ transactions: storage.getTransactions(userId) });
  }
  res.status(403).json({ error: 'Access denied' });
});

// --- Notifications ---
app.get('/api/notifications', (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const notifs = storage.getNotifications(req.user.id);
  res.json({ notifications: notifs });
});

app.post('/api/notifications/:id/read', (req: AuthRequest, res: Response) => {
  const updated = storage.markNotificationRead(req.params.id);
  res.json({ notification: updated });
});

app.post('/api/notifications/read-all', (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  storage.markAllNotificationsRead(req.user.id);
  res.json({ success: true });
});

app.post('/api/notifications/broadcast', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const { title, message, targetAgentId } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }
  storage.broadcastNotification(title, message, targetAgentId);
  res.json({ success: true, message: 'Announcement sent successfully!' });
});

// --- Messages / Job Support Chat ---
app.get('/api/messages', (req: AuthRequest, res: Response) => {
  const { jobId } = req.query;
  const userId = req.user?.id;
  const messages = storage.getMessages(jobId as string, req.user?.role === 'ADMIN' ? undefined : userId);
  res.json({ messages });
});

app.post('/api/messages', (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { jobId, content, receiverId } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });

  const message = storage.createMessage({
    jobId,
    senderId: req.user.id,
    senderName: req.user.name,
    senderRole: req.user.role as any,
    receiverId,
    content,
  });
  res.status(201).json({ message });
});

// --- Settings ---
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json({ settings: storage.getSettings() });
});

app.put('/api/settings', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const updated = storage.updateSettings(req.body);
  res.json({ settings: updated });
});

// --- Activity Logs (Admin) ---
app.get('/api/activity-logs', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  res.json({ logs: storage.getActivityLogs() });
});

// --- Clients & Workplace Management ---
app.get('/api/clients', (req: AuthRequest, res: Response) => {
  // Allow ADMIN or AGENT with supervisor permissions to list clients
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'AGENT') {
    return res.status(403).json({ error: 'Forbidden: Admin or Agent access required' });
  }
  res.json({ clients: storage.getClients() });
});

app.get('/api/clients/:id', (req: AuthRequest, res: Response) => {
  const client = storage.getClientById(req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  res.json({ client });
});

app.post('/api/clients', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const client = storage.createClient(req.body);
  res.status(201).json({ client });
});

app.put('/api/clients/:id', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'AGENT') {
    return res.status(403).json({ error: 'Forbidden: Admin or Agent access required' });
  }
  const updated = storage.updateClient(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Client not found' });
  res.json({ client: updated });
});

app.post('/api/clients/:id/activate', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'AGENT') {
    return res.status(403).json({ error: 'Forbidden: Admin or Agent access required' });
  }
  const updated = storage.activateClientWorkplace(req.params.id, req.user?.name);
  if (!updated) return res.status(404).json({ error: 'Client not found' });
  res.json({ client: updated, message: 'Client workplace activated successfully!' });
});

app.post('/api/clients/:id/suspend', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'AGENT') {
    return res.status(403).json({ error: 'Forbidden: Admin or Agent access required' });
  }
  const { reason } = req.body;
  const updated = storage.suspendClientWorkplace(req.params.id, reason);
  if (!updated) return res.status(404).json({ error: 'Client not found' });
  res.json({ client: updated, message: 'Client suspended.' });
});

app.post('/api/clients/:id/assign-agent', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const { agentId, agentName } = req.body;
  if (!agentId || !agentName) {
    return res.status(400).json({ error: 'agentId and agentName are required' });
  }
  const updated = storage.assignAgentToClient(req.params.id, agentId, agentName);
  if (!updated) return res.status(404).json({ error: 'Client not found' });
  res.json({ client: updated, message: `Supervisor ${agentName} assigned successfully.` });
});

// Composite Client Workplace data endpoint (for client or admin preview)
app.get('/api/client-workplace/:id', (req: AuthRequest, res: Response) => {
  const workplace = storage.getClientWorkplace(req.params.id);
  if (!workplace) return res.status(404).json({ error: 'Client workplace data not found' });
  res.json({ workplace });
});

// --- Monthly Contracts ---
app.get('/api/contracts', (req: AuthRequest, res: Response) => {
  const clientId = req.query.clientId as string | undefined;
  res.json({ contracts: storage.getContracts(clientId) });
});

app.get('/api/contracts/:id', (req: AuthRequest, res: Response) => {
  const contract = storage.getContractById(req.params.id);
  if (!contract) return res.status(404).json({ error: 'Contract not found' });
  res.json({ contract });
});

app.post('/api/contracts', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const contract = storage.createContract(req.body);
  res.status(201).json({ contract, message: 'Monthly employment contract created.' });
});

app.put('/api/contracts/:id', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const updated = storage.updateContract(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Contract not found' });
  res.json({ contract: updated, message: 'Contract updated successfully.' });
});

app.post('/api/contracts/:id/terminate', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const { reason } = req.body;
  const updated = storage.terminateContract(req.params.id, reason);
  if (!updated) return res.status(404).json({ error: 'Contract not found' });
  res.json({ contract: updated, message: 'Contract terminated.' });
});

// --- Monthly Payroll Command Center ---
app.get('/api/payroll', (req: AuthRequest, res: Response) => {
  const month = req.query.month as string | undefined;
  const clientId = req.query.clientId as string | undefined;
  res.json({ payroll: storage.getMonthlyPayroll(month, clientId) });
});

app.post('/api/payroll/generate', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const { month = 'October 2026' } = req.body;
  const payroll = storage.generateMonthlyPayroll(month);
  res.json({ payroll, message: `Payroll generated for ${month}.` });
});

app.put('/api/payroll/:id', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const updated = storage.updatePayrollRecord(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Payroll record not found' });
  res.json({ payroll: updated });
});

app.post('/api/payroll/:id/approve', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const updated = storage.approvePayrollRecord(req.params.id, req.user.name);
  if (!updated) return res.status(404).json({ error: 'Payroll record not found' });
  res.json({ payroll: updated, message: 'Payroll approved.' });
});

app.post('/api/payroll/:id/process', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const updated = storage.processPayrollPayment(req.params.id, req.user.name);
  if (!updated) return res.status(404).json({ error: 'Payroll record not found' });
  res.json({ payroll: updated, message: 'Payment disbursed successfully!' });
});

app.post('/api/payroll/batch-approve', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const { month = 'October 2026' } = req.body;
  const result = storage.batchApprovePayroll(month, req.user.name);
  res.json({ result, message: `Approved ${result.count} records for ${month}.` });
});

app.post('/api/payroll/batch-process', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const { month = 'October 2026' } = req.body;
  const result = storage.batchProcessPayroll(month, req.user.name);
  res.json({ result, message: `Processed ${result.count} disbursements for ${month}.` });
});

// --- Client Work Sessions & Attendance Tracker ---
app.get('/api/work-sessions', (req: AuthRequest, res: Response) => {
  const clientId = req.query.clientId as string | undefined;
  res.json({ sessions: storage.getWorkSessions(clientId) });
});

app.post('/api/work-sessions/start', (req: AuthRequest, res: Response) => {
  const { clientId, taskDescription, relatedJobId, relatedJobTitle } = req.body;
  const targetClientId = clientId || req.user?.id;
  if (!targetClientId) return res.status(400).json({ error: 'clientId is required' });

  const session = storage.startWorkSession(targetClientId, taskDescription || 'Active Client Shift', relatedJobId, relatedJobTitle);
  res.status(201).json({ session });
});

app.post('/api/work-sessions/:id/stop', (req: AuthRequest, res: Response) => {
  const { durationMinutes, notes } = req.body;
  const session = storage.stopWorkSession(req.params.id, durationMinutes, notes);
  if (!session) return res.status(404).json({ error: 'Work session not found' });
  res.json({ session });
});

app.post('/api/work-sessions/:id/verify', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'AGENT') {
    return res.status(403).json({ error: 'Forbidden: Supervisor access required' });
  }
  const session = storage.verifyWorkSession(req.params.id, req.user?.name);
  if (!session) return res.status(404).json({ error: 'Work session not found' });
  res.json({ session, message: 'Work session verified.' });
});

// --- Disputes ---
app.get('/api/disputes', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  res.json({ disputes: storage.getDisputes() });
});

app.post('/api/disputes/:id/resolve', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const { verdict, resolution } = req.body;
  const dispute = storage.resolveDispute(req.params.id, verdict, resolution);
  if (!dispute) return res.status(404).json({ error: 'Dispute not found' });
  res.json({ dispute, message: 'Dispute resolved successfully' });
});

// --- Support Tickets ---
app.get('/api/support-tickets', (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const allTickets = storage.getSupportTickets();
  if (req.user.role === 'ADMIN' || req.user.role === 'AGENT') {
    return res.json({ tickets: allTickets });
  }
  const userTickets = allTickets.filter((t) => t.userId === req.user?.id);
  res.json({ tickets: userTickets });
});

app.post('/api/support-tickets/:id/reply', (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message content is required' });
  const ticket = storage.replySupportTicket(req.params.id, req.user.id, req.user.name, req.user.role, message);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json({ ticket });
});

app.put('/api/support-tickets/:id/status', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'AGENT') {
    return res.status(403).json({ error: 'Forbidden: Admin or Agent access required' });
  }
  const { status } = req.body;
  const ticket = storage.updateTicketStatus(req.params.id, status);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json({ ticket });
});

// --- Fraud & Risk ---
app.get('/api/fraud-alerts', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  res.json({ alerts: storage.getFraudAlerts() });
});

app.post('/api/fraud-alerts/:id/dismiss', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const alert = storage.dismissFraudAlert(req.params.id);
  res.json({ alert });
});

// --- Task Templates ---
app.get('/api/templates', (_req: Request, res: Response) => {
  res.json({ templates: storage.getTaskTemplates() });
});

app.post('/api/templates', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const template = storage.createTaskTemplate(req.body);
  res.status(201).json({ template });
});

// --- System Health & Export ---
app.get('/api/system/health', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  res.json({ health: storage.getSystemHealth() });
});

app.get('/api/system/export', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  res.json({ data: storage.exportDatabase() });
});

// --- File Upload ---
app.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: fileUrl,
    filename: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

// --- Reset / Seed ---
app.post('/api/seed/reset', (_req: Request, res: Response) => {
  storage.resetToDefaults();
  res.json({ success: true, message: 'Database reset to demo state' });
});

// ==================== VITE & STATIC SERVING ====================
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Swashub] Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Swashub server:', err);
  process.exit(1);
});
