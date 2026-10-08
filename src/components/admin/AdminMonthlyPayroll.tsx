import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.ts';
import { MonthlyPayrollRecord } from '../../types/index.ts';
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Smartphone,
  Building,
  RefreshCw,
  FileText,
  Printer,
  Edit2,
  Send,
  Loader2,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Lock,
  Download,
  X
} from 'lucide-react';

export const AdminMonthlyPayroll: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('October 2026');
  const [payrollList, setPayrollList] = useState<MonthlyPayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Edit record modal
  const [editingRecord, setEditingRecord] = useState<MonthlyPayrollRecord | null>(null);
  const [editBonus, setEditBonus] = useState(0);
  const [editBonusReason, setEditBonusReason] = useState('');
  const [editDeductions, setEditDeductions] = useState(0);
  const [editDeductionReason, setEditDeductionReason] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Payslip modal
  const [selectedPayslip, setSelectedPayslip] = useState<MonthlyPayrollRecord | null>(null);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<{ payroll: MonthlyPayrollRecord[] }>(`/api/payroll?month=${encodeURIComponent(selectedMonth)}`);
      setPayrollList(res.payroll || []);
    } catch (err) {
      console.error('Failed to load payroll:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [selectedMonth]);

  const handleGeneratePayroll = async () => {
    try {
      setLoading(true);
      await apiRequest('/api/payroll/generate', {
        method: 'POST',
        body: JSON.stringify({ month: selectedMonth }),
      });
      await fetchPayroll();
    } catch (err: any) {
      alert(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRecord = async (id: string) => {
    setProcessingId(id);
    try {
      await apiRequest(`/api/payroll/${id}/approve`, { method: 'POST' });
      await fetchPayroll();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleProcessPayment = async (id: string) => {
    setProcessingId(id);
    try {
      await apiRequest(`/api/payroll/${id}/process`, { method: 'POST' });
      await fetchPayroll();
    } catch (err: any) {
      alert(err.message || 'Disbursement failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleBatchApprove = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<{ result: { count: number; month: string } }>('/api/payroll/batch-approve', {
        method: 'POST',
        body: JSON.stringify({ month: selectedMonth }),
      });
      alert(`Successfully approved ${res.result.count} client payroll records for ${selectedMonth}!`);
      await fetchPayroll();
    } catch (err: any) {
      alert(err.message || 'Batch approval failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchProcess = async () => {
    if (!confirm(`Are you sure you want to disburse all approved client salaries for ${selectedMonth} via Safaricom M-Pesa B2C?`)) return;
    try {
      setLoading(true);
      const res = await apiRequest<{ result: { count: number; month: string } }>('/api/payroll/batch-process', {
        method: 'POST',
        body: JSON.stringify({ month: selectedMonth }),
      });
      alert(`Disbursement complete! Processed ${res.result.count} payments for ${selectedMonth}.`);
      await fetchPayroll();
    } catch (err: any) {
      alert(err.message || 'Batch disbursement failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (record: MonthlyPayrollRecord) => {
    setEditingRecord(record);
    setEditBonus(record.bonus || 0);
    setEditBonusReason(record.bonusReason || '');
    setEditDeductions(record.deductions || 0);
    setEditDeductionReason(record.deductionReason || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setIsSavingEdit(true);
    try {
      await apiRequest(`/api/payroll/${editingRecord.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          bonus: Number(editBonus),
          bonusReason: editBonusReason,
          deductions: Number(editDeductions),
          deductionReason: editDeductionReason,
        }),
      });
      setEditingRecord(null);
      await fetchPayroll();
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Metrics
  const totalPayrollAmount = payrollList.reduce((acc, p) => acc + p.netPayment, 0);
  const paidCount = payrollList.filter((p) => p.status === 'PAID').length;
  const approvedCount = payrollList.filter((p) => p.status === 'APPROVED').length;
  const pendingCount = payrollList.filter((p) => p.status === 'DRAFT' || p.status === 'REVIEWED').length;

  const filteredPayroll = payrollList.filter(
    (p) =>
      p.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.payoutAccount?.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PAYROLL COMMAND CENTER</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
            Client Monthly Payroll & Disbursements
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage monthly client salaries, performance bonuses, automated deductions, and Safaricom M-Pesa disbursements.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-semibold focus:outline-hidden"
          >
            <option value="October 2026">October 2026 (Current)</option>
            <option value="September 2026">September 2026 (Archived)</option>
            <option value="August 2026">August 2026 (Archived)</option>
            <option value="ALL">All Recorded Cycles</option>
          </select>

          <button
            onClick={handleGeneratePayroll}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sync / Generate Payroll</span>
          </button>

          <button
            onClick={handleBatchApprove}
            disabled={pendingCount === 0}
            className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approve All ({pendingCount})</span>
          </button>

          <button
            onClick={handleBatchProcess}
            disabled={approvedCount === 0}
            className="px-3.5 py-2 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Process M-Pesa Dispatches ({approvedCount})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <div className="text-xs text-slate-400 flex justify-between items-center">
            <span>Total Monthly Payroll</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">
            KES {totalPayrollAmount.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">{payrollList.length} total client payroll slots</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <div className="text-xs text-slate-400 flex justify-between items-center">
            <span>Disbursed (Paid)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">
            {paidCount} of {payrollList.length}
          </div>
          <div className="text-[11px] text-emerald-500/80">Confirmed Safaricom M-Pesa B2C</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <div className="text-xs text-slate-400 flex justify-between items-center">
            <span>Approved (Ready)</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-sky-400">
            {approvedCount}
          </div>
          <div className="text-[11px] text-slate-500">Ready for automated disbursement</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <div className="text-xs text-slate-400 flex justify-between items-center">
            <span>Pending Review</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-400">
            {pendingCount}
          </div>
          <div className="text-[11px] text-slate-500">Awaiting supervisor or admin sign-off</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search client name, phone, department..."
            className="w-full text-xs pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden"
          />
        </div>

        <div className="text-xs text-slate-400">
          Showing <strong>{filteredPayroll.length}</strong> records for {selectedMonth}
        </div>
      </div>

      {/* Main Payroll Table */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono text-[10px] uppercase">
              <tr>
                <th className="px-6 py-3.5">Client & Department</th>
                <th className="px-6 py-3.5">Basic Salary</th>
                <th className="px-6 py-3.5">Bonus & Additions</th>
                <th className="px-6 py-3.5">Deductions</th>
                <th className="px-6 py-3.5">Net Payout</th>
                <th className="px-6 py-3.5">Status & Method</th>
                <th className="px-6 py-3.5 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredPayroll.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white text-sm">{item.clientName}</div>
                    <div className="text-[11px] text-slate-400">{item.department}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{item.clientEmail}</div>
                  </td>

                  <td className="px-6 py-4 font-mono font-bold text-slate-200">
                    KES {item.basicMonthlyPay.toLocaleString()}
                  </td>

                  <td className="px-6 py-4 font-mono">
                    {item.bonus > 0 ? (
                      <div className="text-emerald-400 font-bold">
                        + KES {item.bonus.toLocaleString()}
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">{item.bonusReason}</div>
                      </div>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>

                  <td className="px-6 py-4 font-mono">
                    {item.deductions > 0 ? (
                      <div className="text-rose-400 font-bold">
                        - KES {item.deductions.toLocaleString()}
                        <div className="text-[10px] text-slate-400">{item.deductionReason}</div>
                      </div>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>

                  <td className="px-6 py-4 font-mono font-extrabold text-sm text-emerald-400">
                    KES {item.netPayment.toLocaleString()}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                      item.status === 'PAID'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : item.status === 'APPROVED'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : item.status === 'PROCESSING'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.status}
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">
                      {item.paymentMethod} • {item.payoutAccount}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedPayslip(item)}
                        title="View Official Payslip Statement"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      </button>

                      {item.status !== 'PAID' && (
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Bonus / Deductions"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                        </button>
                      )}

                      {item.status === 'DRAFT' || item.status === 'REVIEWED' ? (
                        <button
                          onClick={() => handleApproveRecord(item.id)}
                          disabled={processingId === item.id}
                          className="px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-[11px] transition-all"
                        >
                          {processingId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Approve'}
                        </button>
                      ) : null}

                      {item.status === 'APPROVED' ? (
                        <button
                          onClick={() => handleProcessPayment(item.id)}
                          disabled={processingId === item.id}
                          className="px-2.5 py-1 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-lg text-[11px] transition-all flex items-center gap-1"
                        >
                          {processingId === item.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <Smartphone className="w-3 h-3" />
                              <span>Disburse</span>
                            </>
                          )}
                        </button>
                      ) : null}

                      {item.status === 'PAID' && (
                        <span className="text-[11px] font-mono text-emerald-400 font-semibold px-2 py-0.5">
                          ✓ Settled
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== EDIT RECORD MODAL ==================== */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                Adjust Compensation: {editingRecord.clientName}
              </h3>
              <button onClick={() => setEditingRecord(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400">Basic Monthly Contract Salary:</span>
                <div className="font-mono font-bold text-white text-sm">
                  KES {editingRecord.basicMonthlyPay.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Performance Incentive / Bonus (KES)
                </label>
                <input
                  type="number"
                  value={editBonus}
                  onChange={(e) => setEditBonus(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Bonus Justification / Note</label>
                <input
                  type="text"
                  value={editBonusReason}
                  onChange={(e) => setEditBonusReason(e.target.value)}
                  placeholder="e.g. Exceeded CSAT target, zero ticket breaches..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Deductions / Adjustments (KES)
                </label>
                <input
                  type="number"
                  value={editDeductions}
                  onChange={(e) => setEditDeductions(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Deduction Reason</label>
                <input
                  type="text"
                  value={editDeductionReason}
                  onChange={(e) => setEditDeductionReason(e.target.value)}
                  placeholder="e.g. Unapproved shift absence..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Update Net Calculation</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== PAYSLIP STATEMENT MODAL ==================== */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-100 space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SWASHUB OPERATIONS PAYROLL DISBURSEMENT</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">Official Client Monthly Payslip</h3>
              </div>
              <button onClick={() => setSelectedPayslip(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div>
                  <div className="text-slate-400">Client / Worker Name:</div>
                  <div className="font-bold text-white text-sm">{selectedPayslip.clientName}</div>
                  <div className="text-slate-400 text-[11px]">{selectedPayslip.department}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400">Statement Month:</div>
                  <div className="font-bold text-emerald-400 text-sm">{selectedPayslip.payrollMonth}</div>
                  <div className="font-mono text-slate-500 text-[11px]">
                    Receipt: {selectedPayslip.receiptNumber || 'SWP-2026-OCT-004'}
                  </div>
                </div>
              </div>

              <div className="space-y-2 py-2">
                <div className="flex justify-between text-slate-300">
                  <span>Basic Monthly Contract Salary:</span>
                  <span className="font-mono font-bold text-white">
                    KES {selectedPayslip.basicMonthlyPay.toLocaleString()}
                  </span>
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
                  <span className="font-mono text-emerald-400">
                    KES {selectedPayslip.netPayment.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-4 text-[11px] text-slate-400">
                <div>
                  <span>Disbursement Rail: </span>
                  <strong className="text-slate-200">
                    {selectedPayslip.paymentMethod} ({selectedPayslip.payoutAccount})
                  </strong>
                </div>
                <div>
                  <span>Transaction Reference: </span>
                  <strong className="text-slate-200 font-mono">
                    {selectedPayslip.transactionReference || 'MP-PAY-OCT-2601'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Authorized by Swashub Operations Administrator</span>
              </div>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Payslip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
