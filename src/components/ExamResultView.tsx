import React, { useEffect, useMemo } from 'react';
import { ExamAttempt, Question } from '../types';
import { storage } from '../services/storage';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  ArrowLeft, 
  Printer, 
  BarChart3, 
  Clock, 
  ShieldAlert, 
  GraduationCap,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface ExamResultViewProps {
  attempt: ExamAttempt;
  onBackToDashboard: () => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  attempt,
  onBackToDashboard,
}) => {
  const allQuestions = storage.getQuestions();
  const exam = storage.getExamById(attempt.examId);

  // Trigger celebratory confetti on high scores (>= 75%)
  useEffect(() => {
    if (attempt.percentage >= 75) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [attempt.percentage]);

  // Topic breakdown calculation
  const topicBreakdown = useMemo(() => {
    const topics: Record<string, { total: number; correct: number; marks: number }> = {};
    
    const responses = attempt.detailedResponses || [];
    responses.forEach((resp) => {
      const q = allQuestions.find((item) => item.id === resp.questionId);
      if (!q) return;
      if (!topics[q.topic]) {
        topics[q.topic] = { total: 0, correct: 0, marks: 0 };
      }
      topics[q.topic].total += 1;
      if (resp.isCorrect) {
        topics[q.topic].correct += 1;
      }
      topics[q.topic].marks += resp.marksAwarded;
    });

    return Object.entries(topics).map(([topic, data]) => ({
      topic,
      total: data.total,
      correct: data.correct,
      percentage: Math.round((data.correct / data.total) * 100),
      marks: Math.round(data.marks * 10) / 10,
    }));
  }, [attempt, allQuestions]);

  const isPassed = attempt.percentage >= 40;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top action bar */}
      <div className="flex items-center justify-between mb-6 no-print">
        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Result Sheet</span>
          </button>
        </div>
      </div>

      {/* Official College Header for Print Mode */}
      <div className="hidden print-only text-center pb-6 mb-6 border-b border-slate-300">
        <h1 className="text-xl font-bold uppercase tracking-wide">University College of Engineering</h1>
        <p className="text-sm text-slate-600">Department of Computer Science & Engineering</p>
        <p className="text-xs text-slate-500 mt-1">Official Automated Examination Evaluation Report</p>
      </div>

      {/* Result Hero Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8 print-break-inside-avoid">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <span>{attempt.subject}</span>
              <span>·</span>
              <span>Exam ID: {attempt.examId}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {attempt.examTitle}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Candidate: <strong>{attempt.studentName}</strong> (Roll No: {attempt.studentRoll})
            </p>
          </div>

          <div className="text-right flex md:flex-col items-center md:items-end justify-between">
            <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${
              isPassed 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {isPassed ? 'GRADE: PASS / QUALIFIED' : 'GRADE: FAIL / RETEST NEEDED'}
            </span>
            <div className="text-xs text-slate-400 mt-2">
              Evaluated: {new Date(attempt.submissionTime || '').toLocaleString()}
            </div>
          </div>
        </div>

        {/* Big Score Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="text-xs text-slate-500 font-medium">Final Score</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {attempt.score} <span className="text-xs font-normal text-slate-400">/ {attempt.totalMarks}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Clamped floor (≥ 0)</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="text-xs text-slate-500 font-medium">Percentage</div>
            <div className={`text-2xl sm:text-3xl font-black mt-1 ${isPassed ? 'text-indigo-950' : 'text-rose-600'}`}>
              {attempt.percentage}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Min 40% to pass</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="text-xs text-slate-500 font-medium">Answer Accuracy</div>
            <div className="text-xl font-bold text-slate-800 mt-1">
              {attempt.correctCount} Correct
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {attempt.incorrectCount} Wrong · {attempt.unattemptedCount} Skipped
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="text-xs text-slate-500 font-medium">Negative Deductions</div>
            <div className="text-xl font-bold text-rose-600 mt-1">
              -{attempt.negativeDeductions}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Penalty: -{exam?.negativeMarking || 0.5} / wrong
            </div>
          </div>
        </div>

        {/* Proctoring telemetry notice */}
        {attempt.proctorViolationsCount > 0 && (
          <div className="mt-6 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Integrity Monitor:</strong> {attempt.proctorViolationsCount} browser focus loss / tab-switch event(s) were recorded for this attempt.
            </span>
          </div>
        )}
      </div>

      {/* Topic-Wise Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8 print-break-inside-avoid">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-indigo-700" />
          <h2 className="text-base font-bold text-slate-900">Topic-Wise Performance Analytics</h2>
        </div>

        <div className="space-y-4">
          {topicBreakdown.map((item) => (
            <div key={item.topic}>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-800">{item.topic}</span>
                <span className="text-slate-500">
                  {item.correct}/{item.total} Correct ({item.percentage}%) · Score: {item.marks} marks
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    item.percentage >= 70 ? 'bg-emerald-500' :
                    item.percentage >= 40 ? 'bg-indigo-600' : 'bg-rose-500'
                  }`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question-By-Question Detailed Review */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Question-by-Question Evaluation Sheet</h2>
            <p className="text-xs text-slate-500">Detailed audit of student selection vs correct answer and marks awarded</p>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Total {attempt.detailedResponses?.length || 0} Questions
          </div>
        </div>

        <div className="space-y-6">
          {attempt.detailedResponses?.map((resp, idx) => {
            const question = allQuestions.find((q) => q.id === resp.questionId);
            if (!question) return null;

            const isCorrect = resp.isCorrect;
            const isUnattempted = resp.selectedOption === null;

            return (
              <div
                key={resp.questionId}
                className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs print-break-inside-avoid"
              >
                {/* Question header */}
                <div className="flex items-center justify-between gap-2 text-xs mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-900">Q{idx + 1}.</span>
                    <span className="font-medium text-slate-600">{question.topic}</span>
                    <span>·</span>
                    <span className="text-slate-400">{question.difficulty}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-bold">
                    {isUnattempted ? (
                      <span className="text-slate-500 flex items-center gap-1">
                        <MinusCircle className="w-3.5 h-3.5" /> 0 Marks (Skipped)
                      </span>
                    ) : isCorrect ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> +{resp.marksAwarded} Marks
                      </span>
                    ) : (
                      <span className="text-rose-600 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> {resp.marksAwarded} Marks (Penalty)
                      </span>
                    )}
                  </div>
                </div>

                {/* Prompt */}
                <p className="text-sm font-semibold text-slate-900 mb-4 leading-relaxed">
                  {question.questionText}
                </p>

                {/* Code snippet if present */}
                {question.codeSnippet && (
                  <pre className="mb-4 p-3 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto">
                    <code>{question.codeSnippet}</code>
                  </pre>
                )}

                {/* Options list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {question.options.map((opt) => {
                    const isStudentChoice = resp.selectedOption === opt.id;
                    const isCorrectAnswer = question.correctOption === opt.id;

                    let style = 'bg-slate-50 border-slate-200 text-slate-700';
                    if (isCorrectAnswer) {
                      style = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold ring-1 ring-emerald-400';
                    } else if (isStudentChoice && !isCorrect) {
                      style = 'bg-rose-50 border-rose-300 text-rose-900 font-medium ring-1 ring-rose-400';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${style}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{opt.id}.</span>
                          <span>{opt.text}</span>
                        </div>
                        {isCorrectAnswer && (
                          <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100 px-1.5 py-0.5 rounded">
                            Correct
                          </span>
                        )}
                        {isStudentChoice && !isCorrect && (
                          <span className="text-[10px] font-bold text-rose-700 uppercase bg-rose-100 px-1.5 py-0.5 rounded">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {question.explanation && (
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-950">
                    <span className="font-semibold text-indigo-900">Explanation: </span>
                    <span className="text-indigo-900/80">{question.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Signatures for Print Mode */}
        <div className="hidden print-only mt-16 pt-8 border-t border-slate-300 flex justify-between text-xs text-slate-600">
          <div>
            <div className="w-40 border-b border-slate-400 mb-1"></div>
            <div>Student Signature</div>
          </div>
          <div>
            <div className="w-40 border-b border-slate-400 mb-1"></div>
            <div>Evaluation Officer / Examiner</div>
          </div>
          <div>
            <div className="w-40 border-b border-slate-400 mb-1"></div>
            <div>Head of Department (CSE)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
