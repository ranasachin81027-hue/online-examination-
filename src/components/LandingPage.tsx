import React from 'react';
import { User, UserRole } from '../types';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  BarChart3, 
  Clock, 
  Shuffle, 
  ArrowRight, 
  FileCheck, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Layers,
  Sparkles,
  Code2
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreFeatures: () => void;
  onQuickLogin: (role: UserRole) => void;
  onOpenSourceModal: () => void;
  onGoToLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onExploreFeatures,
  onQuickLogin,
  onOpenSourceModal,
  onGoToLogin,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-700/60 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Academic Mini-Project Demo Edition</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
            Smart Examinations. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-200 to-indigo-100">
              Instant Results.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            A comprehensive, role-based examination and auto-grading platform engineered for Computer Science departments. Features real-time objective scoring, negative marking calculations, anti-cheating browser telemetry, and deep class analytics.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-14">
            <button
              onClick={onGoToLogin || onGetStarted}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2 cursor-pointer text-sm"
            >
              <span>Sign In / Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreFeatures}
              className="px-6 py-3 bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700 font-semibold rounded-xl transition cursor-pointer text-sm"
            >
              Explore Features
            </button>
            <button
              onClick={onOpenSourceModal}
              className="px-5 py-3 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-800/80 font-medium rounded-xl transition cursor-pointer text-sm flex items-center gap-2"
            >
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>Python & SQLite Source</span>
            </button>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xl max-w-3xl mx-auto text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center justify-between">
              <span>Instant Demonstration Profiles (1-Click Switch)</span>
              <span className="text-slate-400 font-normal lowercase">no password required</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => onQuickLogin('student')}
                className="p-3 rounded-xl bg-slate-800/60 hover:bg-indigo-900/40 border border-slate-700 hover:border-indigo-500/50 transition cursor-pointer text-left group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
                  <span>Student View</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-300 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-slate-400">Aarav Patel · Take DSA Exam & View Autosave</p>
              </button>

              <button
                onClick={() => onQuickLogin('teacher')}
                className="p-3 rounded-xl bg-slate-800/60 hover:bg-blue-900/40 border border-slate-700 hover:border-blue-500/50 transition cursor-pointer text-left group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
                  <span>Teacher View</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-300 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-slate-400">Prof. Sharma · Question Bank, Analytics & Integrity</p>
              </button>

              <button
                onClick={() => onQuickLogin('admin')}
                className="p-3 rounded-xl bg-slate-800/60 hover:bg-purple-900/40 border border-slate-700 hover:border-purple-500/50 transition cursor-pointer text-left group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
                  <span>Admin View</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-300 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-slate-400">Dr. Arvind Sharma · Manage Users & System Logs</p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-700 mb-2">Built for Academic Rigor</p>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">
            Core Features of ExamPortal
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            Every component is designed to simulate a modern university examination system with strict grading accuracy and proctoring safeguards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-800 mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Automated Grading Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instant evaluation with configurable negative marking (e.g. -0.5 per wrong answer). Implements strict single-attempt grading with automatic zero-floor protection.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-800 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Integrity & Proctor Logs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Monitors client-side tab switching, window blur, and external navigation events with millisecond timestamps to detect unauthorized lookups during tests.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 mb-4">
              <Shuffle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Randomized Questions & Options</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Shuffles question sequence and option choices uniquely for every student session using deterministic seeds while preserving absolute grading accuracy.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-800 mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Real-Time Deep Analytics</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Interactive histograms, class score distributions, question difficulty index (% students answering correctly), topic breakdowns, and printable PDF reports.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="bg-slate-100/70 py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-700 mb-2">Operational Workflow</p>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">How the Portal Operates</h2>
            <p className="text-slate-600 text-sm mt-2">End-to-end examination lifecycle from question authoring to grade publication</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
              <div className="text-xs font-bold text-indigo-800 mb-2">Step 01</div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Author Question Bank</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Teachers create rich MCQ questions categorized by subject, topic, difficulty (Easy/Medium/Hard), and marks with explanations.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
              <div className="text-xs font-bold text-indigo-800 mb-2">Step 02</div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Configure & Schedule</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Set duration, start/end dates, negative marking penalty, exam instructions, and publish for registered students.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
              <div className="text-xs font-bold text-indigo-800 mb-2">Step 03</div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Timed Secure Test</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Students take randomized exams with continuous autosave, live timer countdown, question palette, and proctoring telemetry.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
              <div className="text-xs font-bold text-indigo-800 mb-2">Step 04</div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Instant Grading & Reports</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Immediate score computation, question-by-question review, class distribution charts, and official printable grade sheets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demonstration Credentials Box */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Pre-Configured Demo Credentials</h3>
              <p className="text-xs text-slate-500 mt-1">
                Prepared specifically for examination evaluators and project viva demonstration.
              </p>
            </div>
            <button
              onClick={onOpenSourceModal}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer self-start md:self-auto transition"
            >
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>Inspect Flask / SQLite Code</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
              <div className="text-xs font-bold text-purple-900 mb-1">Administrator</div>
              <div className="text-xs text-slate-700 font-medium">admin@examportal.edu</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Password: admin123</div>
              <button
                onClick={() => onQuickLogin('admin')}
                className="mt-3 text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Launch Admin Dashboard</span> →
              </button>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
              <div className="text-xs font-bold text-blue-900 mb-1">Teacher (Prof. Sharma)</div>
              <div className="text-xs text-slate-700 font-medium">teacher.sharma@examportal.edu</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Password: teacher123</div>
              <button
                onClick={() => onQuickLogin('teacher')}
                className="mt-3 text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Launch Teacher Dashboard</span> →
              </button>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <div className="text-xs font-bold text-emerald-900 mb-1">Student (Aarav Patel)</div>
              <div className="text-xs text-slate-700 font-medium">student.aarav@examportal.edu</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Password: student123 · Roll: CS22B001</div>
              <button
                onClick={() => onQuickLogin('student')}
                className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Launch Student Dashboard</span> →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-900 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">ExamPortal — Online Examination & Auto-Grading System</p>
              <p className="text-xs text-slate-500">B.Tech Computer Science & Engineering Mini-Project Demonstration</p>
            </div>
          </div>
          <div className="text-xs text-slate-500 text-center md:text-right">
            <p>Designed with Python, Flask, SQLite, and Modern Web Standards</p>
            <p className="mt-1">Department of Computer Science · Academic Year 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
