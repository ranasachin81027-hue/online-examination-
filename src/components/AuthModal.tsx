import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { storage } from '../services/storage';
import { 
  X, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  GraduationCap, 
  KeyRound, 
  UserCheck, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRoll, setRegRoll] = useState('');
  const [regDept, setRegDept] = useState('B.Tech CSE - 3rd Year');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const users = storage.getUsers();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const email = loginEmail.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === email);

    if (!user) {
      setError('No user account found with this email. Please check credentials or register.');
      return;
    }

    if (user.status === 'suspended') {
      setError('This account has been suspended by the Exam Controller. Please contact Administration.');
      return;
    }

    // In demo environment, accept password
    storage.setCurrentUser(user);
    onSuccess(user);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim() || !regRoll.trim()) {
      setError('Please fill in all required registration fields.');
      return;
    }

    const email = regEmail.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === email);
    if (existing) {
      setError('An account with this email address already exists. Please sign in.');
      return;
    }

    const newUser = storage.addUser({
      name: regName.trim(),
      email,
      role: 'student',
      rollNumber: regRoll.trim(),
      department: regDept.trim(),
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    setSuccessMsg('Registration successful! You are now logged in as student.');
    storage.setCurrentUser(newUser);
    setTimeout(() => {
      onSuccess(newUser);
      onClose();
    }, 1000);
  };

  const handleQuickLogin = (role: UserRole, index = 0) => {
    const roleUsers = users.filter((u) => u.role === role);
    const targetUser = roleUsers[index] || roleUsers[0];
    if (targetUser) {
      storage.setCurrentUser(targetUser);
      onSuccess(targetUser);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-800 flex items-center justify-center text-indigo-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">ExamPortal Authentication</h2>
              <p className="text-xs text-slate-300">Role-Based Access Control System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1">
          <button
            onClick={() => { setActiveTab('login'); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'login' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'register' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Student Registration</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <div>
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. student.aarav@examportal.edu"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password (demo: any password)"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Authenticate & Open Dashboard</span>
                </button>
              </form>

              {/* 1-Click Demo Accounts for seamless demonstration */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1-Click Demo Accounts (Fast Testing)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('student', 0)}
                    className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">Student</div>
                    <div className="text-[11px] text-slate-500 truncate">Aarav Patel (CS22B001)</div>
                    <div className="text-[10px] text-emerald-600 font-medium mt-1">Ready to take exam →</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('teacher', 0)}
                    className="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl text-left transition cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">Teacher</div>
                    <div className="text-[11px] text-slate-500 truncate">Prof. Sharma (DSA)</div>
                    <div className="text-[10px] text-blue-600 font-medium mt-1">View Analytics & QB →</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin', 0)}
                    className="p-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-xl text-left transition cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900">Admin</div>
                    <div className="text-[11px] text-slate-500 truncate">Dr. Arvind Sharma</div>
                    <div className="text-[10px] text-purple-600 font-medium mt-1">Manage Users & Exams →</div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Maya Krishnan"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    University Roll Number *
                  </label>
                  <input
                    type="text"
                    value={regRoll}
                    onChange={(e) => setRegRoll(e.target.value)}
                    placeholder="e.g. CS22B088"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department / Year
                  </label>
                  <input
                    type="text"
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                    placeholder="B.Tech CSE - 3rd Year"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. maya.cs22@examportal.edu"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create a secure password"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-indigo-900 hover:bg-indigo-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Create Student Account</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
