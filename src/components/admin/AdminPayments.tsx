import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.ts';
import { Transaction } from '../../types/index.ts';
import {
  Smartphone,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Loader2,
  DollarSign,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const AdminPayments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'WITHDRAWALS' | 'REGISTRATIONS'>('WITHDRAWALS');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const res = await apiRequest<{ transactions: Transaction[] }>('/api/transactions');
      setTransactions(res.transactions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleProcessWithdrawal = async (txId: string, decision: 'APPROVE' | 'REJECT') => {
    let rejectionReason = '';
    if (decision === 'REJECT') {
      const input = prompt('Please enter the reason for rejection (this will be shown to the agent and their balance will be refunded):');
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
      await fetchTransactions();
    } catch (err: any) {
      alert(err.message || 'Processing failed');
    } finally {
      setProcessingId(null);
    }
  };

  const withdrawals = transactions.filter((t) => t.type === 'WITHDRAWAL');
  const registrations = transactions.filter((t) => t.type === 'REGISTRATION_FEE');

  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'PENDING').length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Payments & Escrow Settlements</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Audit Flutterwave registration revenues and authorize Safaricom M-Pesa payout queues.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs font-medium backdrop-blur-xl">
          <button
            onClick={() => setActiveTab('WITHDRAWALS')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'WITHDRAWALS'
                ? 'bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Agent Withdrawals Queue</span>
            {pendingWithdrawalsCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {pendingWithdrawalsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('REGISTRATIONS')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'REGISTRATIONS'
                ? 'bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Registration Receipts ({registrations.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'WITHDRAWALS' && (
        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl">
          <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">M-Pesa Withdrawal Requests Queue</h2>
              <p className="text-xs text-slate-400 mt-0.5">Disbursements executed via automated Safaricom gateway</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {withdrawals.length} entries recorded
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading withdrawals ledger...</div>
          ) : withdrawals.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">No withdrawal requests queued.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800/80 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Agent Name & Email</th>
                    <th className="px-6 py-4">Destination & Receipt</th>
                    <th className="px-6 py-4">Requested Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date Requested</th>
                    <th className="px-6 py-4 text-right">Settlement Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {withdrawals.map((tx) => {
                    const isPending = tx.status === 'PENDING';
                    const isBusy = processingId === tx.id;

                    return (
                      <tr
                        key={tx.id}
                        className={`hover:bg-slate-800/30 transition-colors ${
                          isPending ? 'bg-amber-950/20' : ''
                        }`}
                      >
                        <td className="px-6 py-4 font-sans">
                          <div className="font-bold text-white text-sm">{tx.userName}</div>
                          <div className="text-[11px] text-slate-400">{tx.userEmail}</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-slate-200 font-semibold">{tx.notes || 'Safaricom M-Pesa'}</div>
                          {tx.mpesaReceipt && (
                            <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                              Receipt: {tx.mpesaReceipt}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 font-bold text-sm text-emerald-400">
                          {tx.amount.toLocaleString()} KES
                        </td>

                        <td className="px-6 py-4 font-sans">
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                              tx.status === 'SUCCESSFUL'
                                ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
                                : tx.status === 'PENDING'
                                ? 'text-amber-400 bg-amber-950/60 border-amber-800/60'
                                : 'text-rose-400 bg-rose-950/60 border-rose-800/60'
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
                                className="px-3.5 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 flex items-center gap-1 transition-all disabled:opacity-50"
                              >
                                {isBusy ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>Disburse M-Pesa</span>
                                  </>
                                )}
                              </button>
                              <button
                                disabled={isBusy}
                                onClick={() => handleProcessWithdrawal(tx.id, 'REJECT')}
                                className="px-3 py-1.5 border border-rose-800/60 text-rose-400 hover:bg-rose-950/40 rounded-xl text-xs transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-mono">Completed</span>
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

      {activeTab === 'REGISTRATIONS' && (
        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl">
          <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Flutterwave Registration Fee Ledger</h2>
              <p className="text-xs text-slate-400 mt-0.5">Accreditation receipts validated via webhook signatures</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {registrations.length} verified payments
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800/80 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Agent Applicant</th>
                  <th className="px-6 py-4">Transaction Reference</th>
                  <th className="px-6 py-4">Payment Rail</th>
                  <th className="px-6 py-4">Accreditation Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Verification Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {registrations.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-sans">
                      <div className="font-bold text-white text-sm">{tx.userName}</div>
                      <div className="text-[11px] text-slate-400">{tx.userEmail}</div>
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      <div>{tx.reference}</div>
                      {tx.mpesaReceipt && (
                        <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                          Receipt: {tx.mpesaReceipt}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 font-sans text-slate-300">
                      {tx.paymentChannel || 'Flutterwave'}
                    </td>

                    <td className="px-6 py-4 font-bold text-emerald-400 text-sm">
                      {tx.amount.toLocaleString()} KES
                    </td>

                    <td className="px-6 py-4 font-sans">
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
                        {tx.status}
                      </span>
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
    </div>
  );
};
