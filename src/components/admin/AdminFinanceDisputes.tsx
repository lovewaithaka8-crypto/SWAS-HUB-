import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.ts';
import { Transaction, Dispute } from '../../types/index.ts';
import {
  Wallet,
  Smartphone,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Loader2,
  FileText,
  DollarSign,
  Scale,
  ShieldCheck,
  ChevronRight,
  X
} from 'lucide-react';

export const AdminFinanceDisputes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'WITHDRAWALS' | 'ESCROW_FLOW' | 'DISPUTES' | 'RECEIPTS'>('WITHDRAWALS');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Active Dispute modal/drawer
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [verdictNotes, setVerdictNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const fetchData = async () => {
    try {
      const [txsRes, dispRes] = await Promise.all([
        apiRequest<{ transactions: Transaction[] }>('/api/transactions'),
        apiRequest<{ disputes: Dispute[] }>('/api/disputes').catch(() => ({ disputes: [] })),
      ]);
      setTransactions(txsRes.transactions || []);
      setDisputes(dispRes.disputes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProcessWithdrawal = async (txId: string, decision: 'APPROVE' | 'REJECT') => {
    let rejectionReason = '';
    if (decision === 'REJECT') {
      const input = prompt('Enter rejection feedback for the agent (funds will be restored to their balance):');
      if (!input) return;
      rejectionReason = input;
    }

    setProcessingId(txId);
    try {
      await apiRequest(`/api/withdrawals/${txId}/process`, {
        method: 'POST',
        body: JSON.stringify({
          decision,
          rejectionReason,
        }),
      });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Processing failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleResolveDispute = async (decision: 'RESOLVED_WORKER' | 'RESOLVED_CLIENT' | 'REFUNDED') => {
    if (!selectedDispute) return;
    setIsResolving(true);
    try {
      await apiRequest(`/api/disputes/${selectedDispute.id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({
          verdict: verdictNotes || 'Arbitration decision signed by Operations Admin',
          resolution: decision,
        }),
      });
      setSelectedDispute(null);
      setVerdictNotes('');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Dispute resolution failed');
    } finally {
      setIsResolving(false);
    }
  };

  const withdrawals = transactions.filter((t) => t.type === 'WITHDRAWAL');
  const earnings = transactions.filter((t) => t.type === 'EARNING');
  const registrations = transactions.filter((t) => t.type === 'REGISTRATION_FEE');

  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'PENDING').length;
  const totalRevenue = registrations.reduce((sum, t) => sum + t.amount, 0);
  const totalDisbursed = withdrawals.filter((w) => w.status === 'SUCCESSFUL').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Financial Command & Disputes Desk</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full platform ledger, M-Pesa payout authorization, client-worker escrow flows, and dispute mediation.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('WITHDRAWALS')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'WITHDRAWALS'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>M-Pesa Payouts</span>
            {pendingWithdrawalsCount > 0 && (
              <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full font-bold text-[10px]">
                {pendingWithdrawalsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('ESCROW_FLOW')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'ESCROW_FLOW'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 text-sky-400" />
            <span>Escrow Ledger Flow</span>
          </button>
          <button
            onClick={() => setActiveTab('DISPUTES')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'DISPUTES'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-purple-400" />
            <span>Disputes ({disputes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('RECEIPTS')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'RECEIPTS'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-teal-400" />
            <span>Registration Receipts ({registrations.length})</span>
          </button>
        </div>
      </div>

      {/* 1. M-PESA WITHDRAWALS QUEUE */}
      {activeTab === 'WITHDRAWALS' && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Safaricom M-Pesa Payout Authorization Queue</h2>
            <div className="text-xs font-mono text-emerald-400">
              Total Disbursed: {totalDisbursed.toLocaleString()} KES
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading queue...</div>
          ) : withdrawals.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No withdrawal records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-medium uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Agent Account</th>
                    <th className="px-6 py-3.5">M-Pesa Number & Details</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Date Requested</th>
                    <th className="px-6 py-3.5 text-right">Payout Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {withdrawals.map((tx) => {
                    const isPending = tx.status === 'PENDING';
                    const isBusy = processingId === tx.id;

                    return (
                      <tr
                        key={tx.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isPending ? 'bg-amber-950/20' : ''
                        }`}
                      >
                        <td className="px-6 py-4 font-sans">
                          <div className="font-bold text-white">{tx.userName}</div>
                          <div className="text-[11px] text-slate-400">{tx.userEmail}</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-slate-200 font-semibold">{tx.notes}</div>
                          {tx.mpesaReceipt && (
                            <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                              Receipt: {tx.mpesaReceipt}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 font-bold text-emerald-400">
                          {tx.amount.toLocaleString()} KES
                        </td>

                        <td className="px-6 py-4 font-sans">
                          <span
                            className={`text-[11px] font-semibold ${
                              tx.status === 'SUCCESSFUL'
                                ? 'text-emerald-400'
                                : tx.status === 'PENDING'
                                ? 'text-amber-400 font-bold'
                                : 'text-rose-400'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-slate-400 font-sans text-[11px]">
                          {new Date(tx.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>

                        <td className="px-6 py-4 text-right font-sans">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                disabled={isBusy}
                                onClick={() => handleProcessWithdrawal(tx.id, 'APPROVE')}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1"
                              >
                                {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Disburse M-Pesa</span>}
                              </button>
                              <button
                                disabled={isBusy}
                                onClick={() => handleProcessWithdrawal(tx.id, 'REJECT')}
                                className="px-2.5 py-1.5 border border-rose-500/40 text-rose-400 hover:bg-rose-950 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs italic">Settled</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. ESCROW LEDGER FLOW */}
      {activeTab === 'ESCROW_FLOW' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-4">Complete Financial Money Flow Architecture</h3>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-center text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-semibold text-white">
                Client Payment
              </div>
              <div className="text-slate-500 font-bold">→</div>
              <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500/40 font-semibold text-emerald-300">
                Platform Escrow
              </div>
              <div className="text-slate-500 font-bold">→</div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-semibold text-white">
                QA Verification
              </div>
              <div className="text-slate-500 font-bold">→</div>
              <div className="p-3 rounded-xl bg-teal-950 border border-teal-500/40 font-semibold text-teal-300">
                M-Pesa Payout
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Total Client Deposits (Escrow)</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">421,000 KES</div>
              <div className="text-[11px] text-emerald-400 font-mono mt-1">100% Pre-funded</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Accreditation Revenue (5,000 KES)</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{totalRevenue.toLocaleString()} KES</div>
              <div className="text-[11px] text-slate-400 mt-1">Flutterwave Settled</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Worker Payouts Completed</div>
              <div className="text-2xl font-bold font-mono text-teal-300 mt-1">{totalDisbursed.toLocaleString()} KES</div>
              <div className="text-[11px] text-slate-400 mt-1">Direct Safaricom Rails</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. DISPUTES MEDIATION CENTER */}
      {activeTab === 'DISPUTES' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-white">Dispute & Resolution Mediation Center</h2>
              <span className="text-xs text-slate-400 font-mono">{disputes.length} active dispute cases</span>
            </div>

            {disputes.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No dispute cases currently open.</div>
            ) : (
              <div className="divide-y divide-slate-800">
                {disputes.map((disp) => (
                  <div key={disp.id} className="p-6 hover:bg-slate-800/40 transition-colors space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
                          CASE ID: {disp.id}
                        </div>
                        <h3 className="text-base font-bold text-white mt-0.5">{disp.jobTitle}</h3>
                      </div>
                      <div className="font-mono text-base font-bold text-emerald-400">
                        {disp.amount.toLocaleString()} KES Escrow
                      </div>
                    </div>

                    {/* Parties Triangle */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[11px] text-slate-400 block mb-0.5">Client Complaint:</span>
                        <div className="font-semibold text-white">{disp.clientName}</div>
                        <p className="text-slate-300 mt-1 italic">"{disp.reason}"</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[11px] text-slate-400 block mb-0.5">Worker Rebuttal / Evidence:</span>
                        <div className="font-semibold text-white">{disp.workerName}</div>
                        <p className="text-slate-300 mt-1 italic">"{disp.evidenceNotes}"</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] font-mono text-amber-400 font-bold">
                        STATUS: {disp.status}
                      </span>
                      <button
                        onClick={() => setSelectedDispute(disp)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                      >
                        Enter Arbitration Workspace
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. REGISTRATION RECEIPTS */}
      {activeTab === 'RECEIPTS' && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-sm font-bold text-white">Flutterwave Registration Fee Receipts</h2>
            <div className="text-xs font-mono text-emerald-400 font-bold">
              Total Revenue: {totalRevenue.toLocaleString()} KES
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-medium uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Accredited Agent</th>
                  <th className="px-6 py-3.5">Payment Method</th>
                  <th className="px-6 py-3.5">Reference Code</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Date Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {registrations.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-sans">
                      <div className="font-bold text-white">{tx.userName}</div>
                      <div className="text-[11px] text-slate-400">{tx.userEmail}</div>
                    </td>

                    <td className="px-6 py-4 font-sans text-slate-200">
                      {tx.paymentChannel}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      <div>{tx.reference}</div>
                      {tx.flutterwaveRef && (
                        <div className="text-[10px] text-slate-500">FLW: {tx.flutterwaveRef}</div>
                      )}
                    </td>

                    <td className="px-6 py-4 font-bold text-emerald-400">
                      {tx.amount.toLocaleString()} KES
                    </td>

                    <td className="px-6 py-4 font-sans text-emerald-400 font-semibold">
                      {tx.status}
                    </td>

                    <td className="px-6 py-4 text-right text-slate-400 font-sans text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dispute Arbitration Workspace Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base text-white">Dispute Arbitration Verdict</h3>
              </div>
              <button onClick={() => setSelectedDispute(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="font-bold text-white">{selectedDispute.jobTitle}</div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">Escrow Value:</span>
                <span className="font-bold text-emerald-400">{selectedDispute.amount.toLocaleString()} KES</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Admin Arbitration Notes & Legal Verdict
              </label>
              <textarea
                rows={3}
                value={verdictNotes}
                onChange={(e) => setVerdictNotes(e.target.value)}
                placeholder="Explain decision rationale, revision guidelines, or refund proportion..."
                className="w-full text-xs p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                disabled={isResolving}
                onClick={() => handleResolveDispute('RESOLVED_WORKER')}
                className="py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Release to Worker
              </button>

              <button
                disabled={isResolving}
                onClick={() => handleResolveDispute('REFUNDED')}
                className="py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Full Refund to Client
              </button>

              <button
                disabled={isResolving}
                onClick={() => handleResolveDispute('RESOLVED_CLIENT')}
                className="py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Force Revision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
