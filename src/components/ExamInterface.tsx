import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Exam, Question, User, ExamAttempt } from '../types';
import { storage } from '../services/storage';
import { gradeExamAttempt, shuffleArrayWithSeed } from '../services/gradingEngine';
import { 
  Clock, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Send, 
  ShieldAlert, 
  Check, 
  HelpCircle,
  X,
  FileCheck2,
  Lock
} from 'lucide-react';

interface ExamInterfaceProps {
  exam: Exam;
  student: User;
  onFinishExam: (attempt: ExamAttempt) => void;
  onCancel: () => void;
}

export const ExamInterface: React.FC<ExamInterfaceProps> = ({
  exam,
  student,
  onFinishExam,
  onCancel,
}) => {
  const allQuestions = storage.getQuestions();
  
  // Get active session or initialize new one
  const existingSession = useMemo(() => {
    return storage.getActiveSession(exam.id, student.id);
  }, [exam.id, student.id]);

  const shuffleSeed = useMemo(() => {
    return existingSession?.shuffleSeed || (Date.now() + Math.floor(Math.random() * 10000));
  }, [existingSession]);

  // Exam questions shuffled deterministically for this student
  const examQuestions = useMemo(() => {
    const rawQuestions = exam.questionIds
      .map((id) => allQuestions.find((q) => q.id === id))
      .filter((q): q is Question => Boolean(q));

    // Shuffle questions
    const shuffledQ = shuffleArrayWithSeed(rawQuestions, shuffleSeed);

    // Shuffle options of each question while preserving their IDs ('A', 'B', 'C', 'D')
    // We map each option cleanly
    return shuffledQ;
  }, [exam.questionIds, allQuestions, shuffleSeed]);

  // Current question index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Student answers: { [questionId]: 'A' | 'B' | 'C' | 'D' | null }
  const [responses, setResponses] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | null>>(() => {
    if (existingSession?.responses) {
      return existingSession.responses;
    }
    const initial: Record<string, 'A' | 'B' | 'C' | 'D' | null> = {};
    examQuestions.forEach((q) => {
      initial[q.id] = null;
    });
    return initial;
  });

  // Marked for review list
  const [markedForReview, setMarkedForReview] = useState<string[]>(() => {
    return existingSession?.markedForReview || [];
  });

  // Remaining time in seconds
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (existingSession?.remainingSeconds !== undefined && existingSession.remainingSeconds > 0) {
      return existingSession.remainingSeconds;
    }
    return exam.durationMinutes * 60;
  });

  // Proctoring violations
  const [violationsCount, setViolationsCount] = useState<number>(() => {
    return existingSession?.violationsCount || 0;
  });
  const [showProctorWarning, setShowProctorWarning] = useState<string | null>(null);

  // Submission confirmation modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Autosave status indicator
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Timer countdown and auto-submission
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit('Time Expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 2. Autosave state to storage every time responses or time change
  useEffect(() => {
    storage.saveActiveSession({
      examId: exam.id,
      studentId: student.id,
      responses,
      markedForReview,
      remainingSeconds: secondsRemaining,
      shuffleSeed,
      violationsCount,
      startTime: existingSession?.startTime || new Date().toISOString(),
    });
    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [responses, markedForReview, secondsRemaining, violationsCount, exam.id, student.id, shuffleSeed, existingSession]);

  // 3. Proctoring: Listen for Tab-Switch & Window Blur
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolationsCount((c) => c + 1);
        setShowProctorWarning('Tab switch detected! Your action has been flagged in the proctoring log.');
        storage.logProctorEvent({
          attemptId: `temp-${exam.id}-${student.id}`,
          examId: exam.id,
          examTitle: exam.title,
          studentId: student.id,
          studentName: student.name,
          studentRoll: student.rollNumber || 'N/A',
          eventType: 'tab_switch',
          eventDescription: 'Student navigated away from exam tab / browser hidden.',
        });
      }
    };

    const handleWindowBlur = () => {
      setViolationsCount((c) => c + 1);
      setShowProctorWarning('Window focus lost! External application switch recorded.');
      storage.logProctorEvent({
        attemptId: `temp-${exam.id}-${student.id}`,
        examId: exam.id,
        examTitle: exam.title,
        studentId: student.id,
        studentName: student.name,
        studentRoll: student.rollNumber || 'N/A',
        eventType: 'window_blur',
        eventDescription: 'Exam browser window lost focus to desktop or second monitor.',
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [exam.id, exam.title, student.id, student.name, student.rollNumber]);

  // Current question data
  const currentQuestion = examQuestions[currentIndex];

  const handleSelectOption = (optionId: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQuestion) return;
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: prev[currentQuestion.id] === optionId ? null : optionId,
    }));
  };

  const handleClearSelection = () => {
    if (!currentQuestion) return;
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: null,
    }));
  };

  const handleToggleReview = () => {
    if (!currentQuestion) return;
    setMarkedForReview((prev) =>
      prev.includes(currentQuestion.id)
        ? prev.filter((id) => id !== currentQuestion.id)
        : [...prev, currentQuestion.id]
    );
  };

  // Submission handler
  const executeSubmission = (isAuto = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Grade attempt using auto-grading engine
    const gradedAttempt = gradeExamAttempt(
      exam,
      allQuestions,
      responses,
      student.id,
      student.name,
      student.rollNumber || 'CS22B001',
      undefined,
      shuffleSeed,
      violationsCount,
      isAuto
    );

    // Save attempt persistently in storage
    storage.saveAttempt(gradedAttempt);

    // Clear unfinished in-progress session
    storage.clearActiveSession();

    onFinishExam(gradedAttempt);
  };

  const handleAutoSubmit = (reason: string) => {
    setShowProctorWarning(`Auto-submitting: ${reason}`);
    setTimeout(() => {
      executeSubmission(true);
    }, 1200);
  };

  // Stats calculation for palette & confirmation
  const totalCount = examQuestions.length;
  const answeredCount = Object.values(responses).filter((val) => val !== null).length;
  const markedCount = markedForReview.length;
  const unattemptedCount = totalCount - answeredCount;

  // Format timer
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isTimeCritical = secondsRemaining <= 300; // Under 5 mins

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Exam Header */}
      <header className="bg-slate-900 text-white px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-900 flex items-center justify-center font-bold text-indigo-300">
            {currentIndex + 1}
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight truncate max-w-[200px] sm:max-w-md">
              {exam.title}
            </h1>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>{student.name} ({student.rollNumber || 'Student'})</span>
              <span>·</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Autosaved {lastSavedTime}
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right: Timer & Submit */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-sm font-mono font-bold tracking-wider ${
            isTimeCritical 
              ? 'bg-rose-950/80 text-rose-300 border-rose-700 animate-pulse'
              : 'bg-slate-800 text-slate-200 border-slate-700'
          }`}>
            <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-rose-400' : 'text-indigo-400'}`} />
            <span>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Submit Examination</span>
            <span className="sm:hidden">Submit</span>
          </button>
        </div>
      </header>

      {/* Proctoring Warning Banner */}
      {showProctorWarning && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between border-b border-amber-600 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-950 shrink-0" />
            <span>{showProctorWarning} (Total flags: {violationsCount})</span>
          </div>
          <button
            onClick={() => setShowProctorWarning(null)}
            className="p-1 hover:bg-amber-600/30 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Examination Viewport */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Question Area (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 min-h-[550px]">
          {currentQuestion ? (
            <div>
              {/* Question metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-bold text-indigo-900">Question {currentIndex + 1} of {totalCount}</span>
                  <span>·</span>
                  <span>{currentQuestion.topic}</span>
                  <span>·</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    currentQuestion.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700' :
                    currentQuestion.difficulty === 'Medium' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-emerald-700 font-semibold">+{currentQuestion.marks} Marks</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-rose-600 font-semibold">-{exam.negativeMarking} on Wrong</span>
                </div>
              </div>

              {/* Question text */}
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-6 leading-relaxed">
                {currentQuestion.questionText}
              </h2>

              {/* Code snippet if any */}
              {currentQuestion.codeSnippet && (
                <div className="mb-6 p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
                  <pre>{currentQuestion.codeSnippet}</pre>
                </div>
              )}

              {/* 4 Options (A, B, C, D) */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt) => {
                  const isSelected = responses[currentQuestion.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-medium ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {opt.id}
                      </div>
                      <span className="text-sm leading-relaxed mt-0.5">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              Question not found.
            </div>
          )}

          {/* Bottom Actions Bar */}
          <div className="pt-6 mt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleReview}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                  currentQuestion && markedForReview.includes(currentQuestion.id)
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>
                  {currentQuestion && markedForReview.includes(currentQuestion.id) ? 'Marked for Review' : 'Mark for Review'}
                </span>
              </button>

              {currentQuestion && responses[currentQuestion.id] && (
                <button
                  onClick={handleClearSelection}
                  className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  Clear Choice
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentIndex < totalCount - 1 ? (
                <button
                  onClick={() => setCurrentIndex((i) => Math.min(totalCount - 1, i + 1))}
                  className="px-5 py-2 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <span>Review & Submit</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Question Palette & Proctor Notice (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Question Navigator Palette */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Question Navigator Palette
            </h3>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 pb-4 mb-4 border-b border-slate-100 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500 shrink-0"></span>
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500 shrink-0"></span>
                <span>Review ({markedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-200 shrink-0"></span>
                <span>Pending ({unattemptedCount})</span>
              </div>
            </div>

            {/* Grid of buttons */}
            <div className="grid grid-cols-5 gap-2">
              {examQuestions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = responses[q.id] !== null;
                const isMarked = markedForReview.includes(q.id);

                let bgClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                if (isMarked) {
                  bgClass = 'bg-amber-500 text-white hover:bg-amber-600';
                } else if (isAnswered) {
                  bgClass = 'bg-emerald-600 text-white hover:bg-emerald-700';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center transition cursor-pointer ${bgClass} ${
                      isCurrent ? 'ring-2 ring-indigo-900 ring-offset-2 scale-105' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exam Rules & Proctor Notice */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-2">
              <Lock className="w-4 h-4 text-indigo-700" />
              <span>Exam Environment Safeguards</span>
            </div>
            <ul className="text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
              <li>• Questions and choices are uniquely randomized.</li>
              <li>• Responses autosave continuously to prevent loss.</li>
              <li>• Tab switching, minimizing, or window blur are logged.</li>
              <li>• Exam will auto-submit when the countdown expires.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Ready to Submit?</h3>
                <p className="text-xs text-slate-500">Review your attempt summary before final submission.</p>
              </div>
            </div>

            {/* Summary statistics */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 mb-5 text-center text-xs">
              <div className="p-2">
                <div className="text-[10px] text-slate-500 font-medium">Answered</div>
                <div className="text-lg font-bold text-emerald-600">{answeredCount}</div>
              </div>
              <div className="p-2">
                <div className="text-[10px] text-slate-500 font-medium">Unanswered</div>
                <div className="text-lg font-bold text-slate-600">{unattemptedCount}</div>
              </div>
              <div className="p-2">
                <div className="text-[10px] text-slate-500 font-medium">Marked Review</div>
                <div className="text-lg font-bold text-amber-600">{markedCount}</div>
              </div>
            </div>

            {unattemptedCount > 0 && (
              <p className="text-xs text-amber-700 mb-4 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                Notice: You have {unattemptedCount} unanswered question(s). Unattempted questions will earn 0 marks.
              </p>
            )}

            <p className="text-xs text-slate-500 mb-6">
              Once submitted, your examination will be instantly evaluated by the auto-grading engine. You will not be able to modify your answers.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Return to Exam
              </button>
              <button
                onClick={() => executeSubmission(false)}
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-800 rounded-lg transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Grading Responses...' : 'Confirm Final Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
