/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Exam, ExamAttempt } from './types';
import { storage } from './services/storage';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ExamInterface } from './components/ExamInterface';
import { ExamResultView } from './components/ExamResultView';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { AuthModal } from './components/AuthModal';
import { ProjectSourceModal } from './components/ProjectSourceModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.getCurrentUser());
  const [activeView, setActiveView] = useState<string>(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (hash === 'login' || hash === 'register') return hash;
    return 'landing';
  });
  
  // Active test state
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [activeAttemptResult, setActiveAttemptResult] = useState<ExamAttempt | null>(null);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);

  // Sync current user and hash route on load
  useEffect(() => {
    const user = storage.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash === 'login' || hash === 'register') {
        setActiveView(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handlers
  const handleUserSelect = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      setActiveView(`${user.role}_dashboard`);
    } else {
      setActiveView('login');
    }
  };

  const handleStartExam = (exam: Exam) => {
    setActiveExam(exam);
    setActiveView('exam_interface');
  };

  const handleFinishExam = (attempt: ExamAttempt) => {
    setActiveAttemptResult(attempt);
    setActiveView('exam_result');
  };

  const handleViewResult = (attempt: ExamAttempt) => {
    setActiveAttemptResult(attempt);
    setActiveView('exam_result');
  };

  const handleQuickLoginFromLanding = (role: 'admin' | 'teacher' | 'student') => {
    const allUsers = storage.getUsers();
    const targetUser = allUsers.find((u) => u.role === role);
    if (targetUser) {
      storage.setCurrentUser(targetUser);
      setCurrentUser(targetUser);
      setActiveView(`${role}_dashboard`);
    }
  };

  // If in an active exam, we render full examination layout without standard navbar
  if (activeView === 'exam_interface' && activeExam && currentUser) {
    return (
      <ExamInterface
        exam={activeExam}
        student={currentUser}
        onFinishExam={handleFinishExam}
        onCancel={() => {
          setActiveExam(null);
          setActiveView('student_dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Universal Navbar */}
      <Navbar
        currentUser={currentUser}
        onSelectUser={handleUserSelect}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenSourceModal={() => setIsSourceModalOpen(true)}
        onOpenAuthModal={() => setActiveView('login')}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {activeView === 'landing' && (
          <LandingPage
            onGetStarted={() => {
              if (currentUser) {
                setActiveView(`${currentUser.role}_dashboard`);
              } else {
                setActiveView('login');
              }
            }}
            onExploreFeatures={() => {
              const el = document.getElementById('features');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onGoToLogin={() => setActiveView('login')}
            onQuickLogin={handleQuickLoginFromLanding}
            onOpenSourceModal={() => setIsSourceModalOpen(true)}
          />
        )}

        {activeView === 'login' && (
          <LoginPage
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setActiveView(`${user.role}_dashboard`);
            }}
            onGoToRegister={() => setActiveView('register')}
            onGoHome={() => setActiveView('landing')}
          />
        )}

        {activeView === 'register' && (
          <RegisterPage
            onRegisterSuccess={(user) => {
              setCurrentUser(user);
              setActiveView('student_dashboard');
            }}
            onGoToLogin={() => setActiveView('login')}
            onGoHome={() => setActiveView('landing')}
          />
        )}

        {activeView === 'student_dashboard' && currentUser && currentUser.role === 'student' && (
          <StudentDashboard
            student={currentUser}
            onStartExam={handleStartExam}
            onViewResult={handleViewResult}
          />
        )}

        {(activeView === 'teacher_dashboard' || activeView === 'teacher_questions') &&
          currentUser &&
          currentUser.role === 'teacher' && (
            <TeacherDashboard
              teacher={currentUser}
              initialTab={activeView === 'teacher_questions' ? 'questions' : 'overview'}
              onViewStudentResult={handleViewResult}
            />
          )}

        {(activeView === 'admin_dashboard' || activeView === 'admin_users') &&
          currentUser &&
          currentUser.role === 'admin' && <AdminDashboard admin={currentUser} />}

        {activeView === 'exam_result' && activeAttemptResult && (
          <ExamResultView
            attempt={activeAttemptResult}
            onBackToDashboard={() => {
              setActiveAttemptResult(null);
              if (currentUser) {
                setActiveView(`${currentUser.role}_dashboard`);
              } else {
                setActiveView('landing');
              }
            }}
          />
        )}
      </main>

      {/* Auth Modal (Optional quick access) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setActiveView(`${user.role}_dashboard`);
        }}
      />

      {/* Python / Flask Source Code & Windows Guide Modal */}
      <ProjectSourceModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
      />
    </div>
  );
}
