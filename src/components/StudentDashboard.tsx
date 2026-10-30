import React, { useState } from 'react';
import { User, Exam, ExamAttempt } from '../types';
import { storage } from '../services/storage';
import { 
  BookOpen, 
  Clock, 
  Award, 
  Calendar, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Play, 
  TrendingUp,
  BarChart2,
  ShieldAlert
} from 'lucide-react';

interface StudentDashboardProps {
  student: User;
  onStartExam: (exam: Exam) => void;
  onViewResult: (attempt: ExamAttempt) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  onStartExam,
  onViewResult,
}) => {
  const [activeTab, setActiveTab] = useState<'available' | 'completed' | 'upcoming'>('available');

  const allExams = storage.getExams();
  const studentAttempts = storage.getStudentAttempts(student.id);

  const now = new Date().getTime();

  // Categorize exams
  const completedExamIds = new Set(studentAttempts.map((a) => a.examId));

  const availableExams = allExams.filter((exam) => {
    if (exam.status !== 'published') return false;
    const start = new Date(exam.startTime).getTime();
    const end = new Date(exam.endTime).getTime();
    const isWithinSchedule = now >= start && now <= end;
    const isCompleted = completedExamIds.has(exam.id);
    return isWithinSchedule && !isCompleted;
  });

  const upcomingExams = allExams.filter((exam) => {
    if (exam.status !== 'published') return false;
    const start = new Date(exam.startTime).getTime();
    return now < start;
  });

  const completedAttempts = studentAttempts.filter(
    (a) => a.status === 'submitted' || a.status === 'auto_submitted'
  );

  // Performance summary
  const totalCompleted = completedAttempts.length;
  const avgPercentage = totalCompleted > 0
    ? Math.round(completedAttempts.reduce((acc, a) => acc + a.percentage, 0) / totalCompleted)
    : 0;
  const highestPercentage = totalCompleted > 0
    ? Math.max(...completedAttempts.map((a) => a.percentage))
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Student Profile & Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={student.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Welcome, {student.name}
              </h1>
              <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Student
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="font-medium text-slate-700">Roll: {student.rollNumber || 'CS22B001'}</span>
              <span>·</span>
              <span>{student.department || 'B.Tech CSE'}</span>
              <span>·</span>
              <span>{student.email}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-8">
          <div>
            <div className="text-xs text-slate-500">Exams Completed</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{totalCompleted}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Average Score</div>
            <div className="text-xl font-bold text-indigo-950 mt-0.5">{avgPercentage}%</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Highest Score</div>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">{highestPercentage}%</div>
          </div>
        </div>
      </div>

      {/* Tabs for Available, Completed, Upcoming */}
      <div className="flex items-center justify-between border-b border-slate-200 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('available')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer px-3 flex items-center gap-2 ${
              activeTab === 'available'
                ? 'border-indigo-900 text-indigo-950'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Play className="w-4 h-4 text-emerald-600" />
            <span>Available Exams ({availableExams.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer px-3 flex items-center gap-2 ${
              activeTab === 'completed'
                ? 'border-indigo-900 text-indigo-950'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-indigo-600" />
            <span>Completed Exams & Results ({completedAttempts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer px-3 flex items-center gap-2 ${
              activeTab === 'upcoming'
                ? 'border-indigo-900 text-indigo-950'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Upcoming Schedule ({upcomingExams.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Available Exams */}
      {activeTab === 'available' && (
        <div>
          {availableExams.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No New Exams Currently Open</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                You have either completed all assigned active examinations, or the testing window is closed. Check the completed tab for your scores.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableExams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-semibold text-indigo-900">{exam.subject}</span>
                      <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        Open Now
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                      {exam.title}
                    </h3>

                    <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Duration: <strong>{exam.durationMinutes} Minutes</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>Total Marks: <strong>{exam.totalMarks} Marks</strong> ({exam.questionIds.length} Questions)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                        <span>Negative Penalty: <strong>-{exam.negativeMarking} per incorrect answer</strong></span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-6">
                      <p className="font-semibold text-slate-700 mb-1">Exam Instructions:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
                        <li>Strict single attempt allowed.</li>
                        <li>Automated proctoring logs tab-switching events.</li>
                        <li>Autosave enabled; answers persist continuously.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Created by {exam.creatorName}</span>
                    <button
                      onClick={() => onStartExam(exam)}
                      className="px-5 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-xs"
                    >
                      <span>Start Examination</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Completed Exams & Results */}
      {activeTab === 'completed' && (
        <div>
          {completedAttempts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Exams Completed Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Once you finish an examination, your auto-graded score breakdown and question review will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedAttempts.map((attempt) => {
                const isPassed = attempt.percentage >= 40;
                return (
                  <div
                    key={attempt.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="font-semibold text-slate-700">{attempt.subject}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                          isPassed ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {isPassed ? 'PASSED' : 'RE-EVALUATION REQUIRED'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mb-3">
                        {attempt.examTitle}
                      </h3>

                      {/* Score metrics */}
                      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4 text-center">
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">Score</div>
                          <div className="text-base font-extrabold text-slate-900 mt-0.5">
                            {attempt.score} <span className="text-xs text-slate-400 font-normal">/ {attempt.totalMarks}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">Percentage</div>
                          <div className={`text-base font-extrabold mt-0.5 ${isPassed ? 'text-indigo-950' : 'text-rose-600'}`}>
                            {attempt.percentage}%
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">Accuracy</div>
                          <div className="text-xs font-semibold text-slate-700 mt-1">
                            {attempt.correctCount} Correct · {attempt.incorrectCount} Wrong
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 space-y-1">
                        <div>Submitted: {new Date(attempt.submissionTime || '').toLocaleString()}</div>
                        {attempt.proctorViolationsCount > 0 && (
                          <div className="text-amber-700 font-medium">
                            Proctor Notice: {attempt.proctorViolationsCount} tab-switch event(s) recorded during exam.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => onViewResult(attempt)}
                        className="px-4 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-900 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>View Detailed Answer Review & Analytics</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Upcoming Schedule */}
      {activeTab === 'upcoming' && (
        <div>
          {upcomingExams.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Future Exams Scheduled</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Your professors have not published upcoming exam schedules yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-slate-700">{exam.subject}</span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Scheduled
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{exam.title}</h3>
                  <div className="text-xs text-slate-600 space-y-1 mb-4">
                    <div>Opens: <strong>{new Date(exam.startTime).toLocaleString()}</strong></div>
                    <div>Duration: <strong>{exam.durationMinutes} Minutes</strong></div>
                    <div>Total Marks: <strong>{exam.totalMarks} Marks</strong></div>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>This exam is not yet open. You can start once the scheduled window begins.</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
