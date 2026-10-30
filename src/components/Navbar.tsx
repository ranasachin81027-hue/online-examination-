import React, { useState } from 'react';
import { User } from '../types';
import { storage } from '../services/storage';
import { 
  GraduationCap, 
  UserCircle, 
  LogOut, 
  ChevronDown, 
  Code2, 
  RotateCcw,
  Shield,
  BookOpen,
  LayoutDashboard
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onSelectUser: (user: User | null) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenSourceModal: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSelectUser,
  activeView,
  setActiveView,
  onOpenSourceModal,
  onOpenAuthModal,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const users = storage.getUsers();

  const handleReset = () => {
    storage.resetAll();
    const updatedUsers = storage.getUsers();
    // Default to Aarav
    onSelectUser(updatedUsers[3]);
    setResetConfirm(false);
    setActiveView('student_dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top institution bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-wide">B.Tech Computer Science Project</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Department of Examination & Assessment</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenSourceModal}
            className="flex items-center gap-1.5 text-indigo-300 hover:text-white transition-colors cursor-pointer font-medium"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Python/Flask Code & Windows Setup</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => setResetConfirm(true)}
            className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
            title="Reset sample database to default"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => setActiveView(currentUser ? `${currentUser.role}_dashboard` : 'landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-900 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-800 transition-colors">
            <GraduationCap className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">ExamPortal</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                Auto-Grading
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Online Examination & Evaluation System</p>
          </div>
        </div>

        {/* Central Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setActiveView('landing')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              activeView === 'landing' ? 'text-indigo-950 bg-slate-100 font-semibold' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Home
          </button>

          {currentUser && (
            <button
              onClick={() => setActiveView(`${currentUser.role}_dashboard`)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeView.includes('dashboard') ? 'text-indigo-950 bg-slate-100 font-semibold' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              <span>Dashboard</span>
            </button>
          )}

          {currentUser?.role === 'teacher' && (
            <>
              <button
                onClick={() => setActiveView('teacher_questions')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'teacher_questions' ? 'text-indigo-950 bg-slate-100 font-semibold' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span>Question Bank</span>
              </button>
            </>
          )}

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setActiveView('admin_users')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeView === 'admin_users' ? 'text-indigo-950 bg-slate-100 font-semibold' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Shield className="w-4 h-4 text-slate-500" />
              <span>User Management</span>
            </button>
          )}
        </nav>

        {/* Right side controls & role quick-switcher */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition cursor-pointer text-left shadow-xs"
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
                />
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 leading-tight flex items-center gap-1.5">
                    <span>{currentUser.name}</span>
                    <span className={`text-[10px] font-bold uppercase px-1 rounded ${
                      currentUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      currentUser.role === 'teacher' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[130px]">
                    {currentUser.rollNumber || currentUser.email}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Dropdown for Switch Role & Accounts */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quick Switch Demo Account</p>
                    <p className="text-xs text-slate-600 mt-0.5">Switch perspective instantly for review:</p>
                  </div>

                  <div className="max-h-64 overflow-y-auto py-1">
                    {users.map((u) => {
                      const isCurrent = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            storage.setCurrentUser(u);
                            onSelectUser(u);
                            setDropdownOpen(false);
                            setActiveView(`${u.role}_dashboard`);
                          }}
                          className={`w-full px-3.5 py-2 text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                            isCurrent ? 'bg-indigo-50/80 text-indigo-950 font-medium' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          <div className="truncate flex-1">
                            <div className="text-xs font-medium flex items-center gap-1.5">
                              <span className="truncate">{u.name}</span>
                              <span className="text-[10px] text-slate-500">({u.role})</span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {u.rollNumber ? `Roll: ${u.rollNumber}` : u.email}
                            </div>
                          </div>
                          {isCurrent && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 mt-1 pt-1 px-1">
                    <button
                      onClick={() => {
                        storage.setCurrentUser(null);
                        onSelectUser(null);
                        setDropdownOpen(false);
                        setActiveView('login');
                      }}
                      className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition cursor-pointer font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView('login')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'login'
                    ? 'bg-slate-100 text-indigo-950 font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <UserCircle className="w-4 h-4 text-indigo-700" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => setActiveView('register')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs ${
                  activeView === 'register'
                    ? 'bg-indigo-950 text-white font-bold ring-2 ring-indigo-400'
                    : 'bg-indigo-900 hover:bg-indigo-800 text-white'
                }`}
              >
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {resetConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Reset Demo Database?</h3>
            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              This will restore all sample users, exams, question bank items, and attempt records back to the pristine factory state. Any new questions or tests you added will be refreshed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setResetConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-900 hover:bg-indigo-800 rounded-lg transition cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
