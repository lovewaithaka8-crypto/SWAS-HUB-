import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiRequest } from '../../lib/api.ts';
import { Transaction } from '../../types/index.ts';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  X,
  Loader2,
  DollarSign,
  FileText
} from 'lucide-react';

export const AgentEarnings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [earningsData, setEarningsData] = useState<{
    availableBalance: number;
    pendingEarnings: number;
    totalWithdrawn: number;
    lifetimeEarnings: number;
    transactions: Transaction[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [mpesaPhone, setMpesaPhone] = useState(user?.mpesaNumber || user?.phone || '+254712345678');
  const [withdrawNotes, setWithdrawNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchEarnings = async () => {
    try {
      const res = await apiRequest('/api/earnings');
      setEarningsData(res);
    } catch (err) {
      console.error('Failed to load earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
      setErrorMessage('Please enter a valid withdrawal amount.');
      return;
    }
    if (amount < 1000) {
      setErrorMessage('Minimum withdrawal amount is 1,000 KES.');
      return;
    }
    if (amount > (earningsData?.availableBalance || 0)) {
      setErrorMessage('Withdrawal amount cannot exceed your available balance.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await apiRequest('/api/withdrawals/request', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          mpesaNumber: mpesaPhone,
          notes: withdrawNotes,
        }),
      });

      setSuccessMessage('Withdrawal request queued! Operations Admin will disburse via M-Pesa.');
      await fetchEarnings();
      await refreshUser();
      setTimeout(() => {
        setIsWithdrawModalOpen(false);
        setSuccessMessage('');
        setWithdrawAmount('');
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Withdrawal request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Earnings & M-Pesa Ledger</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your verified project payouts and initiate direct Safaricom M-Pesa disbursements.
          </p>
        </div>

        <button
          onClick={() => setIsWithdrawModalOpen(true)}
          className="px-5 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/15 flex items-center gap-2 transition-all self-start sm:self-auto hover:scale-[1.02]"
        >
          <Smartphone className="w-4 h-4" />
          <span>Request M-Pesa Withdrawal</span>
        </button>
      </div>

      {/* Wallet Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Available Balance */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Available Balance</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
            {(earningsData?.availableBalance ?? user?.balance ?? 0).toLocaleString()} KES
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Ready for instant M-Pesa payout</div>
        </div>

        {/* Pending Review */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-purple-400">
            {(earningsData?.pendingEarnings ?? 0).toLocaleString()} KES
          </div>
          <div className="text-[11px] text-slate-500 mt-1">From submitted deliverables</div>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 hover:border-sky-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Withdrawn</span>
            <ArrowUpRight className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            {(earningsData?.totalWithdrawn ?? 0).toLocaleString()} KES
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Successfully sent to phone</div>
        </div>

        {/* Lifetime Earnings */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Lifetime Earnings</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-400">
            {(earningsData?.lifetimeEarnings ?? 0).toLocaleString()} KES
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total approved project volume</div>
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Wallet Transaction History</h2>
            <p className="text-xs text-slate-400 mt-0.5">Automated escrow credits and mobile money disbursements</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {earningsData?.transactions?.length ?? 0} transactions
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading ledger records...</div>
        ) : !earningsData?.transactions || earningsData.transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No transactions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800/80 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Type & Description</th>
                  <th className="px-6 py-3.5">Reference / Code</th>
                  <th className="px-6 py-3.5">Channel</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {earningsData.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-sans">
                      <div className="font-semibold text-white">
                        {tx.type === 'EARNING' && 'Project Earning'}
                        {tx.type === 'WITHDRAWAL' && 'M-Pesa Withdrawal'}
                        {tx.type === 'REGISTRATION_FEE' && 'Agent Accreditation Fee'}
                      </div>
                      {tx.notes && <div className="text-[11px] text-slate-400 truncate max-w-xs">{tx.notes}</div>}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      <div>{tx.reference}</div>
                      {tx.mpesaReceipt && (
                        <div className="text-[10px] text-emerald-400 font-bold">M-Pesa: {tx.mpesaReceipt}</div>
                      )}
                    </td>

                    <td className="px-6 py-4 font-sans text-slate-400">
                      {tx.paymentChannel || 'Internal Escrow'}
                    </td>

                    <td className="px-6 py-4 font-bold text-sm">
                      <span
                        className={
                          tx.type === 'EARNING'
                            ? 'text-emerald-400'
                            : tx.type === 'WITHDRAWAL'
                            ? 'text-rose-400'
                            : 'text-slate-300'
                        }
                      >
                        {tx.type === 'WITHDRAWAL' ? '-' : '+'}
                        {tx.amount.toLocaleString()} KES
                      </span>
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
        )}
      </div>

      {/* M-Pesa Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
            <div className="p-6 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">Withdraw to Safaricom M-Pesa</h3>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestWithdrawal} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Available for Withdrawal
                </label>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono font-bold text-emerald-400 text-base">
                  {(earningsData?.availableBalance ?? user?.balance ?? 0).toLocaleString()} KES
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Withdrawal Amount in KES (Min. 1,000 KES)
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  max={earningsData?.availableBalance ?? user?.balance ?? 0}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  M-Pesa Registered Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  placeholder="+254 712 345678"
                  className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Disbursed via automated Flutterwave Safaricom payout rail within 2 hours.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Optional Note for Operations
                </label>
                <input
                  type="text"
                  value={withdrawNotes}
                  onChange={(e) => setWithdrawNotes(e.target.value)}
                  placeholder="e.g. Weekly payout batch"
                  className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || (earningsData?.availableBalance || 0) < 1000}
                className="w-full mt-2 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Queuing M-Pesa Payout...</span>
                  </>
                ) : (
                  <span>Submit M-Pesa Withdrawal Request</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
