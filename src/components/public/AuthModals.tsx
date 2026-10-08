import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiRequest } from '../../lib/api.ts';
import { Category } from '../../types/index.ts';
import {
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  User,
  Check,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
  Smartphone
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickLogin, setCurrentView } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/10 blur-[140px] rounded-full"></div>
        <div className="absolute -bottom-20 right-1/4 w-[400px] h-[300px] bg-sky-500/8 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-8 sm:p-10 shadow-2xl z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-extrabold text-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-950/60">
            S
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Sign in to Swashub</h2>
          <p className="text-xs text-slate-400 mt-2">Access your Agent Workplace or Operations Command Center</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-hidden transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-hidden transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.01]"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In to Account</span>}
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick One-Click Demo Access
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => quickLogin('admin')}
              className="p-2.5 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-colors group"
            >
              <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">Admin Account</div>
              <div className="text-[10px] text-slate-400">Executive Command</div>
            </button>
            <button
              onClick={() => quickLogin('client')}
              className="p-2.5 bg-emerald-950/20 border border-emerald-800/40 hover:border-emerald-700/60 rounded-xl text-left transition-colors group"
            >
              <div className="font-semibold text-emerald-400">Client: Jane Wanjiku</div>
              <div className="text-[10px] text-emerald-300/80">35,000 KES/mo Workplace</div>
            </button>
            <button
              onClick={() => quickLogin('esther')}
              className="p-2.5 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-colors group"
            >
              <div className="font-semibold text-white group-hover:text-sky-400 transition-colors">Supervisor: Esther</div>
              <div className="text-[10px] text-slate-400">Lead Operations Agent</div>
            </button>
            <button
              onClick={() => quickLogin('sarah')}
              className="p-2.5 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-colors group"
            >
              <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">Agent: Sarah</div>
              <div className="text-[10px] text-slate-400">14,500 KES · Content</div>
            </button>
            <button
              onClick={() => quickLogin('brian')}
              className="p-2.5 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-colors group"
            >
              <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">Agent: Brian</div>
              <div className="text-[10px] text-slate-400">8,000 KES · Data</div>
            </button>
            <button
              onClick={() => quickLogin('applicant')}
              className="p-2.5 bg-amber-950/20 border border-amber-800/40 hover:border-amber-700/60 rounded-xl text-left transition-colors group"
            >
              <div className="font-semibold text-amber-300">Applicant: David</div>
              <div className="text-[10px] text-amber-400/80">Pending Fee</div>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an agent seat?{' '}
          <button
            onClick={() => setCurrentView('register')}
            className="text-emerald-400 font-semibold hover:underline"
          >
            Apply for Accreditation
          </button>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const { register, settings, setCurrentView } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+254');
  const [password, setPassword] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<{ categories: Category[] }>('/api/categories')
      .then((res) => {
        setCategories(res.categories || []);
        if (res.categories?.length > 0) {
          setCategoryId(res.categories[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await register({
        name,
        email,
        phone,
        password,
        categoryId,
      });
      // The register method in AuthContext automatically switches currentView to 'payment-required' and opens the Flutterwave modal!
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  const registrationFee = settings?.registrationFee || 5000;

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-emerald-500/10 blur-[150px] rounded-full"></div>
        <div className="absolute top-2/3 right-1/4 w-[450px] h-[350px] bg-sky-500/7 blur-[130px] rounded-full"></div>
      </div>

      <div className="relative w-full max-w-lg bg-slate-900/80 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-8 sm:p-10 shadow-2xl z-10 my-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-extrabold text-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-950/60">
            S
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Apply to Become an Agent</h2>
          <p className="text-xs text-slate-400 mt-2">
            One-time {registrationFee.toLocaleString()} KES accreditation fee guarantees direct project assignments
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Legal Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Samuel Mutua"
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-hidden transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="samuel@gmail.com"
                  className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone / M-Pesa Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 712 345678"
                  className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-hidden transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Create Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                minLength={6}
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-hidden transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Workplace Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 text-white rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-hidden transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fee Notice Card */}
          <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl text-xs space-y-1.5">
            <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Next Step: Flutterwave Escrow Payment
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Upon submitting, you will be prompted to authorize the <strong>{registrationFee.toLocaleString()} KES</strong> accreditation
              fee via M-Pesa STK push, Card, or Airtel Money to immediately activate your Agent workplace.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.01]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Register & Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already registered?{' '}
          <button
            onClick={() => setCurrentView('login')}
            className="text-emerald-400 font-semibold hover:underline"
          >
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
};
