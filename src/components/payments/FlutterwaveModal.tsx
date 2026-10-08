import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  ShieldCheck,
  Smartphone,
  CreditCard,
  Building,
  CheckCircle2,
  X,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const FlutterwaveModal: React.FC = () => {
  const { user, settings, isPaymentModalOpen, setIsPaymentModalOpen, completeRegistrationPayment } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'CARD' | 'AIRTEL_MONEY' | 'BANK_TRANSFER' | 'PAYPAL'>('MPESA');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '+254712345678');
  const [airtelNumber, setAirtelNumber] = useState(user?.phone || '+254733123456');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('841');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stkPushSent, setStkPushSent] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isPaymentModalOpen || !user) return null;

  const feeAmount = settings?.registrationFee || 5000;
  const currency = settings?.currency || 'KES';

  const handleMpesaPay = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    // Step 1: Simulate STK Push sent
    setTimeout(() => {
      setIsProcessing(false);
      setStkPushSent(true);
    }, 1200);
  };

  const handleConfirmMpesaPin = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const updatedUser = await completeRegistrationPayment('MPESA', phoneNumber);
      const generatedReceipt = `QJD${Math.floor(100000 + Math.random() * 900000)}`;
      setSuccessReceipt(generatedReceipt);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment verification failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDirectPay = async (channel: string, contact: string) => {
    setIsProcessing(true);
    setErrorMessage('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1800));
      await completeRegistrationPayment(channel, contact);
      setSuccessReceipt(`FLW${Math.floor(100000 + Math.random() * 900000)}`);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (isSuccess) {
      setIsPaymentModalOpen(false);
      setIsSuccess(false);
      setStkPushSent(false);
    } else {
      setIsPaymentModalOpen(false);
      setStkPushSent(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 z-10">
        {/* Flutterwave Header Banner */}
        <div className="bg-slate-950 px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
              FW
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <span>Flutterwave</span>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/80 font-mono font-medium">
                  ESCROW GATEWAY
                </span>
              </div>
              <div className="text-xs text-slate-400">Merchant: Swashub Operations Kenya</div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Summary Bar */}
        <div className="bg-slate-950/50 border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">Accreditation License:</span>{' '}
            <span className="font-medium text-slate-200">Lifetime Agent Seat</span>
          </div>
          <div className="font-mono text-base font-extrabold text-emerald-400">
            {feeAmount.toLocaleString()} {currency}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess ? (
            /* Success State */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Payment Confirmed!</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Your Flutterwave accreditation payment was successfully verified. Your account is now fully active as an
                accredited <strong>Agent</strong>.
              </p>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-2 max-w-sm mx-auto font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Receipt No:</span>
                  <span className="font-bold text-emerald-400">{successReceipt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount Paid:</span>
                  <span className="text-white">{feeAmount.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-400 font-bold">ACTIVE AGENT</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full max-w-sm mt-4 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/15 transition-all"
              >
                Enter Agent Workplace
              </button>
            </div>
          ) : (
            /* Payment Method Selection & Forms */
            <div>
              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('MPESA')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    paymentMethod === 'MPESA'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                  <span className="text-[11px] font-semibold block">M-Pesa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('AIRTEL_MONEY')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    paymentMethod === 'AIRTEL_MONEY'
                      ? 'border-red-500 bg-red-500/10 text-red-400 shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mx-auto mb-1 text-red-400" />
                  <span className="text-[11px] font-semibold block">Airtel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-sky-500 bg-sky-500/10 text-sky-400 shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1 text-sky-400" />
                  <span className="text-[11px] font-semibold block">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    paymentMethod === 'BANK_TRANSFER'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <Building className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                  <span className="text-[11px] font-semibold block">Bank</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('PAYPAL')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    paymentMethod === 'PAYPAL'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                  <span className="text-[11px] font-semibold block">PayPal</span>
                </button>
              </div>

              {/* M-Pesa Flow */}
              {paymentMethod === 'MPESA' && (
                <div className="space-y-4">
                  {!stkPushSent ? (
                    <>
                      <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-2xl text-xs space-y-1">
                        <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4" />
                          Safaricom M-Pesa STK Push
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          We will trigger a prompt on your phone for <strong>{feeAmount.toLocaleString()} KES</strong>.
                          Enter your M-Pesa PIN when prompted.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Safaricom M-Pesa Number
                        </label>
                        <input
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+254 712 345678"
                          className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-emerald-500 focus:outline-hidden font-mono"
                        />
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Format: 07XXXXXXXX or +2547XXXXXXXX
                        </span>
                      </div>

                      <button
                        onClick={handleMpesaPay}
                        disabled={isProcessing}
                        className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Send M-Pesa STK Prompt</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    /* Waiting for STK Push confirmation */
                    <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-4">
                      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">STK Push Sent to Your Phone!</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Check phone <span className="font-mono text-emerald-400 font-bold">{phoneNumber}</span> and
                          enter your Safaricom PIN for {feeAmount.toLocaleString()} KES.
                        </p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleConfirmMpesaPin}
                          disabled={isProcessing}
                          className="flex-1 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <span>I Have Entered My PIN</span>
                          )}
                        </button>
                        <button
                          onClick={() => setStkPushSent(false)}
                          className="px-4 py-3 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Airtel Money Flow */}
              {paymentMethod === 'AIRTEL_MONEY' && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-950/20 border border-red-800/40 rounded-2xl text-xs space-y-1">
                    <div className="font-semibold text-red-400">Airtel Money Push</div>
                    <p className="text-slate-400 text-[11px]">
                      Enter your Airtel Kenya mobile number to authorize the {feeAmount.toLocaleString()} KES charge.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Airtel Money Number
                    </label>
                    <input
                      type="text"
                      value={airtelNumber}
                      onChange={(e) => setAirtelNumber(e.target.value)}
                      placeholder="+254 733 123456"
                      className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-red-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <button
                    onClick={() => handleDirectPay('AIRTEL_MONEY', airtelNumber)}
                    disabled={isProcessing}
                    className="w-full py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Authorize Airtel Payment</span>}
                  </button>
                </div>
              )}

              {/* Card Flow */}
              {paymentMethod === 'CARD' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-sky-500 focus:outline-hidden font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-sky-500 focus:outline-hidden font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">CVV</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full text-xs px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-sky-500 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleDirectPay('CARD', cardNumber)}
                    disabled={isProcessing}
                    className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Pay {feeAmount.toLocaleString()} KES via Card</span>}
                  </button>
                </div>
              )}

              {/* Bank Transfer Flow */}
              {paymentMethod === 'BANK_TRANSFER' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-2xl text-xs space-y-2">
                    <div className="font-semibold text-amber-400">Direct Bank Deposit / Pesalink</div>
                    <div className="text-[11px] text-slate-400 space-y-1">
                      <div>Bank: <strong>Equity Bank Kenya</strong></div>
                      <div>Account Name: <strong>Swashub Escrow Operations</strong></div>
                      <div>Account No: <strong>0180293847291</strong></div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDirectPay('BANK_TRANSFER', 'Equity-0180293847291')}
                    disabled={isProcessing}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Bank Transfer</span>}
                  </button>
                </div>
              )}

              {/* PayPal Flow */}
              {paymentMethod === 'PAYPAL' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-950/20 border border-blue-800/40 rounded-2xl text-xs space-y-1">
                    <div className="font-semibold text-blue-400">PayPal International</div>
                    <p className="text-slate-400 text-[11px]">
                      Equivalent: ~$38.50 USD converted automatically at checkout.
                    </p>
                  </div>

                  <button
                    onClick={() => handleDirectPay('PAYPAL', user.email)}
                    disabled={isProcessing}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Continue with PayPal</span>}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Security Badges */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit TLS Encrypted</span>
          </div>
          <div>Flutterwave PCI-DSS Level 1 Certified</div>
        </div>
      </div>
    </div>
  );
};
