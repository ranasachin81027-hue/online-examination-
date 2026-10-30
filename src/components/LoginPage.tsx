import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { storage } from '../services/storage';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  KeyRound, 
  HelpCircle,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onGoToRegister: () => void;
  onGoHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onGoToRegister,
  onGoHome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const users = storage.getUsers();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

      if (!user) {
        setError('No account found with this email. Please check your credentials or register a student account.');
        setIsLoading(false);
        return;
      }

      if (user.status === 'suspended') {
        setError('Account Suspended: Access to this workstation has been restricted by the Examination Controller.');
        setIsLoading(false);
        return;
      }

      storage.setCurrentUser(user);
      setIsLoading(false);
      onLoginSuccess(user);
    }, 400);
  };

  const handleQuickLogin = (userRole: UserRole, index = 0) => {
    const roleUsers = users.filter((u) => u.role === userRole);
    const target = roleUsers[index] || roleUsers[0];
    if (target) {
      setEmail(target.email);
      setPassword('demo123');
      setError(null);
      setIsLoading(true);
      setTimeout(() => {
        storage.setCurrentUser(target);
        setIsLoading(false);
        onLoginSuccess(target);
      }, 300);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Informational Sidebar (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

          <div className="relative z-10">
            {/* Back to Home Link */}
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white transition-colors cursor-pointer mb-8"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal Homepage</span>
            </button>

            {/* Brand */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-indigo-800/80 border border-indigo-700/80 flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">ExamPortal</h2>
                <p className="text-xs text-indigo-300">University Online Evaluation</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-8">
              Sign in with your institutional credentials to enter the automated examination system, view results, or manage assessments.
            </p>

            {/* Security checklist */}
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Encrypted session tokens with automatic session invalidation on duplicate login.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Single-attempt enforcement with continuous answer autosave.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Automated proctoring telemetry logs tab switches and external focus loss.</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 relative z-10 text-[11px] text-slate-400 flex items-center justify-between">
            <span>B.Tech CSE Mini-Project</span>
            <span>Security Standard 2026</span>
          </div>
        </div>

        {/* Right Form Area (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Select your institutional identity or use a demonstration profile below.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student.aarav@examportal.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">
                  Demo hint: any password
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span>Remember this workstation</span>
              </label>

              <button
                type="button"
                onClick={() => alert('For college project demonstration, credentials are provided in the 1-Click Demo Profiles below.')}
                className="text-indigo-700 hover:text-indigo-900 font-medium cursor-pointer"
              >
                Need Help?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-indigo-900 hover:bg-indigo-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <span>Sign In to Workstation</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Viva Demo Profiles */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
              <span>Instant Viva Demonstration Accounts</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('student', 0)}
                className="p-2.5 bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition cursor-pointer group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-950 flex items-center justify-between">
                  <span>Student</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">Aarav Patel</div>
                <div className="text-[10px] text-slate-400">Roll: CS22B001</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('teacher', 0)}
                className="p-2.5 bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition cursor-pointer group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-950 flex items-center justify-between">
                  <span>Faculty</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">Prof. Rajesh Sharma</div>
                <div className="text-[10px] text-slate-400">DSA Subject Lead</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 0)}
                className="p-2.5 bg-slate-50 hover:bg-purple-50/80 border border-slate-200 hover:border-purple-300 rounded-xl text-left transition cursor-pointer group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-purple-950 flex items-center justify-between">
                  <span>Admin</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">Dr. Arvind Sharma</div>
                <div className="text-[10px] text-slate-400">Exam Controller</div>
              </button>
            </div>
          </div>

          {/* Registration link */}
          <div className="mt-6 text-center text-xs text-slate-500">
            <span>New student without an account? </span>
            <button
              onClick={onGoToRegister}
              className="font-semibold text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer"
            >
              Register here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
