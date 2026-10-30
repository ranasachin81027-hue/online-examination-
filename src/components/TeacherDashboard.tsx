import React, { useState, useMemo } from 'react';
import { User, Question, Exam, ExamAttempt, DifficultyLevel, ProctorLog } from '../types';
import { storage } from '../services/storage';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  BookOpen, 
  BarChart3, 
  FileCheck, 
  Calendar, 
  Clock, 
  Award, 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  AlertTriangle,
  Printer,
  ChevronRight,
  X,
  FileSpreadsheet
} from 'lucide-react';

interface TeacherDashboardProps {
  teacher: User;
  initialTab?: 'overview' | 'questions' | 'create_exam' | 'analytics';
  onViewStudentResult?: (attempt: ExamAttempt) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacher,
  initialTab = 'overview',
  onViewStudentResult,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'create_exam' | 'analytics'>(initialTab);

  // Storage data
  const [questions, setQuestions] = useState<Question[]>(() => storage.getQuestions());
  const [exams, setExams] = useState<Exam[]>(() => storage.getExams());
  const [attempts, setAttempts] = useState<ExamAttempt[]>(() => storage.getAttempts());
  const [proctorLogs, setProctorLogs] = useState<ProctorLog[]>(() => storage.getProctorLogs());

  // Reload handler
  const refreshData = () => {
    setQuestions(storage.getQuestions());
    setExams(storage.getExams());
    setAttempts(storage.getAttempts());
    setProctorLogs(storage.getProctorLogs());
  };

  // --- Question Bank Search & Filters ---
  const [qSearch, setQSearch] = useState('');
  const [qSubjectFilter, setQSubjectFilter] = useState('All');
  const [qDifficultyFilter, setQDifficultyFilter] = useState('All');

  // --- Add/Edit Question Modal ---
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [qSubject, setQSubject] = useState('Data Structures & Algorithms');
  const [qTopic, setQTopic] = useState('');
  const [qText, setQText] = useState('');
  const [qCodeSnippet, setQCodeSnippet] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOpt, setCorrectOpt] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [qDifficulty, setQDifficulty] = useState<DifficultyLevel>('Medium');
  const [qMarks, setQMarks] = useState<number>(2);
  const [qExplanation, setQExplanation] = useState('');

  // --- Create Exam Form State ---
  const [examTitle, setExamTitle] = useState('');
  const [examSubject, setExamSubject] = useState('Data Structures & Algorithms');
  const [examDuration, setExamDuration] = useState(25);
  const [examNegativeMarking, setExamNegativeMarking] = useState(0.5);
  const [examStartTime, setExamStartTime] = useState(
    new Date(Date.now() - 3600000).toISOString().slice(0, 16)
  );
  const [examEndTime, setExamEndTime] = useState(
    new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 16)
  );
  const [examInstructions, setExamInstructions] = useState(
    '1. Answer all questions.\n2. Negative marking penalty applies for incorrect answers.\n3. Autosave is enabled.\n4. Do not switch tabs or minimize browser during the examination.'
  );
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [examCreateSuccess, setExamCreateSuccess] = useState(false);

  // --- Analytics Selected Exam ---
  const [selectedAnalyticsExamId, setSelectedAnalyticsExamId] = useState<string>(() => {
    return exams[0]?.id || '';
  });

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch =
        q.questionText.toLowerCase().includes(qSearch.toLowerCase()) ||
        q.topic.toLowerCase().includes(qSearch.toLowerCase());
      const matchSubject = qSubjectFilter === 'All' || q.subject === qSubjectFilter;
      const matchDifficulty = qDifficultyFilter === 'All' || q.difficulty === qDifficultyFilter;
      return matchSearch && matchSubject && matchDifficulty;
    });
  }, [questions, qSearch, qSubjectFilter, qDifficultyFilter]);

  // Handle Save Question
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim() || !qTopic.trim()) {
      alert('Please fill out all required fields and options A-D.');
      return;
    }

    const questionData = {
      subject: qSubject,
      topic: qTopic.trim(),
      questionText: qText.trim(),
      codeSnippet: qCodeSnippet.trim() ? qCodeSnippet.trim() : undefined,
      options: [
        { id: 'A' as const, text: optA.trim() },
        { id: 'B' as const, text: optB.trim() },
        { id: 'C' as const, text: optC.trim() },
        { id: 'D' as const, text: optD.trim() },
      ],
      correctOption: correctOpt,
      difficulty: qDifficulty,
      marks: Number(qMarks) || 2,
      explanation: qExplanation.trim() ? qExplanation.trim() : undefined,
      createdBy: teacher.id,
    };

    if (editingQuestionId) {
      storage.updateQuestion(editingQuestionId, questionData);
    } else {
      storage.addQuestion(questionData);
    }

    setIsQuestionModalOpen(false);
    setEditingQuestionId(null);
    resetQuestionForm();
    refreshData();
  };

  const handleEditQuestion = (q: Question) => {
    setEditingQuestionId(q.id);
    setQSubject(q.subject);
    setQTopic(q.topic);
    setQText(q.questionText);
    setQCodeSnippet(q.codeSnippet || '');
    setOptA(q.options.find((o) => o.id === 'A')?.text || '');
    setOptB(q.options.find((o) => o.id === 'B')?.text || '');
    setOptC(q.options.find((o) => o.id === 'C')?.text || '');
    setOptD(q.options.find((o) => o.id === 'D')?.text || '');
    setCorrectOpt(q.correctOption);
    setQDifficulty(q.difficulty);
    setQMarks(q.marks);
    setQExplanation(q.explanation || '');
    setIsQuestionModalOpen(true);
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      storage.deleteQuestion(id);
      refreshData();
    }
  };

  const resetQuestionForm = () => {
    setQText('');
    setQTopic('');
    setQCodeSnippet('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectOpt('A');
    setQDifficulty('Medium');
    setQMarks(2);
    setQExplanation('');
    setEditingQuestionId(null);
  };

  // Handle Create Exam
  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) {
      alert('Please enter an examination title.');
      return;
    }
    if (selectedQuestionIds.length === 0) {
      alert('Please select at least 1 question for this examination.');
      return;
    }

    const calculatedTotalMarks = selectedQuestionIds.reduce((sum, qId) => {
      const q = questions.find((item) => item.id === qId);
      return sum + (q ? q.marks : 2);
    }, 0);

    const instructionsArray = examInstructions
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    storage.addExam({
      title: examTitle.trim(),
      subject: examSubject,
      durationMinutes: Number(examDuration),
      negativeMarking: Number(examNegativeMarking),
      startTime: new Date(examStartTime).toISOString(),
      endTime: new Date(examEndTime).toISOString(),
      instructions: instructionsArray,
      status: 'published',
      createdBy: teacher.id,
      creatorName: teacher.name,
      questionIds: selectedQuestionIds,
      totalMarks: calculatedTotalMarks,
    });

    setExamCreateSuccess(true);
    refreshData();
    setTimeout(() => {
      setExamCreateSuccess(false);
      setActiveTab('overview');
    }, 1500);
  };

  // Analytics Calculation for selected exam
  const currentAnalyticsExam = exams.find((e) => e.id === selectedAnalyticsExamId) || exams[0];
  const examAttempts = attempts.filter((a) => a.examId === currentAnalyticsExam?.id);

  const analyticsSummary = useMemo(() => {
    if (!examAttempts.length || !currentAnalyticsExam) {
      return {
        totalAttempts: 0,
        avgScore: 0,
        avgPercentage: 0,
        highScore: 0,
        lowScore: 0,
        passRate: 0,
        distribution: [
          { range: '0 - 39% (Fail)', count: 0 },
          { range: '40 - 59% (Pass)', count: 0 },
          { range: '60 - 79% (Merit)', count: 0 },
          { range: '80 - 100% (Distinction)', count: 0 },
        ],
      };
    }

    const total = examAttempts.length;
    const scores = examAttempts.map((a) => a.score);
    const percentages = examAttempts.map((a) => a.percentage);
    const avgScore = Math.round((scores.reduce((a, b) => a + b, 0) / total) * 100) / 100;
    const avgPercentage = Math.round((percentages.reduce((a, b) => a + b, 0) / total) * 10) / 10;
    const highScore = Math.max(...scores);
    const lowScore = Math.min(...scores);
    const passedCount = examAttempts.filter((a) => a.percentage >= 40).length;
    const passRate = Math.round((passedCount / total) * 100);

    const dist = [
      { range: '0 - 39% (Fail)', count: examAttempts.filter((a) => a.percentage < 40).length },
      { range: '40 - 59% (Pass)', count: examAttempts.filter((a) => a.percentage >= 40 && a.percentage < 60).length },
      { range: '60 - 79% (Merit)', count: examAttempts.filter((a) => a.percentage >= 60 && a.percentage < 80).length },
      { range: '80 - 100% (Distinction)', count: examAttempts.filter((a) => a.percentage >= 80).length },
    ];

    return {
      totalAttempts: total,
      avgScore,
      avgPercentage,
      highScore,
      lowScore,
      passRate,
      distribution: dist,
    };
  }, [examAttempts, currentAnalyticsExam]);

  // Question difficulty analysis
  const questionAccuracyStats = useMemo(() => {
    if (!currentAnalyticsExam) return [];

    return currentAnalyticsExam.questionIds.map((qId) => {
      const q = questions.find((item) => item.id === qId);
      if (!q) return null;

      let correct = 0;
      let incorrect = 0;
      let unattempted = 0;

      examAttempts.forEach((att) => {
        const resp = att.responses[qId];
        if (resp === null || resp === undefined) {
          unattempted++;
        } else if (resp === q.correctOption) {
          correct++;
        } else {
          incorrect++;
        }
      });

      const total = examAttempts.length || 1;
      const accuracyPercent = Math.round((correct / total) * 100);

      return {
        id: q.id,
        text: q.questionText,
        topic: q.topic,
        difficulty: q.difficulty,
        marks: q.marks,
        accuracyPercent,
        correct,
        incorrect,
        unattempted,
        isHard: accuracyPercent < 50,
      };
    }).filter(Boolean);
  }, [currentAnalyticsExam, questions, examAttempts]);

  // Proctor logs for this exam
  const examProctorLogs = proctorLogs.filter(
    (log) => log.examId === currentAnalyticsExam?.id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Profile */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Teacher Faculty Portal
            </h1>
            <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Faculty / Examiner
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {teacher.name} · {teacher.department || 'Department of Computer Science'}
          </p>
        </div>

        {/* Quick Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'overview' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'questions' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Question Bank ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('create_exam')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'create_exam' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Create Exam
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'analytics' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Results & Analytics
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Question Bank Items</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{questions.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Categorized across 2 subjects</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Examinations Active</div>
              <div className="text-2xl font-black text-indigo-950 mt-1">{exams.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Published & scheduled</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Student Attempts</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">{attempts.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Automatically evaluated</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Class Average</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {attempts.length > 0
                  ? Math.round(attempts.reduce((a, b) => a + b.percentage, 0) / attempts.length)
                  : 0}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Across all examinations</div>
            </div>
          </div>

          {/* Published Examinations Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Your Examinations</h2>
              <button
                onClick={() => setActiveTab('create_exam')}
                className="px-3 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule New Exam</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Exam Title</th>
                    <th className="py-3 px-3">Subject</th>
                    <th className="py-3 px-3">Duration</th>
                    <th className="py-3 px-3">Questions</th>
                    <th className="py-3 px-3">Penalty</th>
                    <th className="py-3 px-3">Attempts</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exams.map((exam) => {
                    const examAttemptsCount = attempts.filter((a) => a.examId === exam.id).length;
                    return (
                      <tr key={exam.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {exam.title}
                        </td>
                        <td className="py-3 px-3 text-slate-600">{exam.subject}</td>
                        <td className="py-3 px-3 text-slate-600">{exam.durationMinutes} mins</td>
                        <td className="py-3 px-3 text-slate-600">{exam.questionIds.length} Qs ({exam.totalMarks} Marks)</td>
                        <td className="py-3 px-3 text-rose-600 font-medium">-{exam.negativeMarking}</td>
                        <td className="py-3 px-3 font-semibold text-indigo-900">{examAttemptsCount} submissions</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedAnalyticsExamId(exam.id);
                              setActiveTab('analytics');
                            }}
                            className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                          >
                            View Analytics →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUESTION BANK */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Controls: Search, Filters, Add Button */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={qSearch}
                  onChange={(e) => setQSearch(e.target.value)}
                  placeholder="Search questions or topics..."
                  className="w-full pl-9 pr-3.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={qSubjectFilter}
                onChange={(e) => setQSubjectFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-700 bg-white"
              >
                <option value="All">All Subjects</option>
                <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                <option value="Database Management Systems">Database Management Systems</option>
              </select>

              <select
                value={qDifficultyFilter}
                onChange={(e) => setQDifficultyFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-700 bg-white"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <button
              onClick={() => {
                resetQuestionForm();
                setIsQuestionModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add MCQ Question</span>
            </button>
          </div>

          {/* Questions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Subject & Topic</th>
                    <th className="py-3 px-4">Question Text & Options</th>
                    <th className="py-3 px-4">Correct</th>
                    <th className="py-3 px-4">Difficulty</th>
                    <th className="py-3 px-4">Marks</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 align-top w-52">
                        <div className="font-semibold text-slate-900">{q.subject}</div>
                        <div className="text-[11px] text-slate-500">{q.topic}</div>
                      </td>

                      <td className="py-3.5 px-4 align-top max-w-md">
                        <div className="font-medium text-slate-900 mb-1.5 leading-snug">
                          {q.questionText}
                        </div>
                        {q.codeSnippet && (
                          <pre className="p-2 mb-2 bg-slate-900 text-slate-200 rounded text-[11px] font-mono overflow-x-auto">
                            <code>{q.codeSnippet}</code>
                          </pre>
                        )}
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                          {q.options.map((opt) => (
                            <div
                              key={opt.id}
                              className={`truncate ${opt.id === q.correctOption ? 'font-bold text-emerald-700' : ''}`}
                            >
                              {opt.id}. {opt.text}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">
                          {q.correctOption}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          q.difficulty === 'Medium' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {q.difficulty}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-top font-bold text-slate-900">
                        {q.marks}
                      </td>

                      <td className="py-3.5 px-4 align-top text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleEditQuestion(q)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded cursor-pointer transition"
                          title="Edit Question"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded cursor-pointer transition"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CREATE EXAMINATION */}
      {activeTab === 'create_exam' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-4xl mx-auto">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Create & Schedule New Examination</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select questions from bank, configure duration, dates, and negative marking penalty
            </p>
          </div>

          {examCreateSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Examination created and published successfully! Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleCreateExam} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Examination Title *
                </label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. CS304: Advanced Algorithms Quiz"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject *
                </label>
                <select
                  value={examSubject}
                  onChange={(e) => setExamSubject(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                  <option value="Database Management Systems">Database Management Systems</option>
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="Computer Networks">Computer Networks</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Duration (Minutes) *
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={examDuration}
                  onChange={(e) => setExamDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Negative Penalty (Marks per wrong) *
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="2"
                  value={examNegativeMarking}
                  onChange={(e) => setExamNegativeMarking(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Start Schedule
                </label>
                <input
                  type="datetime-local"
                  value={examStartTime}
                  onChange={(e) => setExamStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  required
                />
              </div>
            </div>

            {/* Question Selector from Question Bank */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900">
                    Select Questions from Bank ({selectedQuestionIds.length} Selected)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Total Marks:{' '}
                    <strong>
                      {selectedQuestionIds.reduce((sum, id) => {
                        const q = questions.find((item) => item.id === id);
                        return sum + (q ? q.marks : 2);
                      }, 0)}{' '}
                      Marks
                    </strong>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedQuestionIds(questions.map((q) => q.id))}
                    className="text-xs text-indigo-700 hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedQuestionIds([])}
                    className="text-xs text-slate-500 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 p-1">
                {questions.map((q) => {
                  const isChecked = selectedQuestionIds.includes(q.id);
                  return (
                    <label
                      key={q.id}
                      className="p-3 flex items-start gap-3 hover:bg-slate-50 cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedQuestionIds((prev) =>
                            prev.includes(q.id)
                              ? prev.filter((id) => id !== q.id)
                              : [...prev, q.id]
                          );
                        }}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">{q.questionText}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {q.subject} · {q.topic} · {q.difficulty} · {q.marks} Marks
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Exam instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Examination Instructions
              </label>
              <textarea
                rows={3}
                value={examInstructions}
                onChange={(e) => setExamInstructions(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                Publish Examination
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: RESULTS & ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Exam Selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Select Examination:</span>
              <select
                value={selectedAnalyticsExamId}
                onChange={(e) => setSelectedAnalyticsExamId(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} ({ex.subject})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer no-print"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Class Analytics Report</span>
            </button>
          </div>

          {/* Metric KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <div className="text-[11px] text-slate-500 font-medium">Submissions</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{analyticsSummary.totalAttempts}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Students evaluated</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <div className="text-[11px] text-slate-500 font-medium">Class Average</div>
              <div className="text-2xl font-black text-indigo-950 mt-1">{analyticsSummary.avgScore}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Average: {analyticsSummary.avgPercentage}%</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <div className="text-[11px] text-slate-500 font-medium">Highest / Lowest</div>
              <div className="text-xl font-black text-emerald-700 mt-1">
                {analyticsSummary.highScore} <span className="text-xs text-slate-400 font-normal">/ {analyticsSummary.lowScore}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Range across batch</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <div className="text-[11px] text-slate-500 font-medium">Pass Percentage</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{analyticsSummary.passRate}%</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Scored ≥ 40%</div>
            </div>
          </div>

          {/* Score Distribution Histogram */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Score Distribution Histogram
            </h3>
            <div className="space-y-3">
              {analyticsSummary.distribution.map((dist) => {
                const total = analyticsSummary.totalAttempts || 1;
                const pct = Math.round((dist.count / total) * 100);
                return (
                  <div key={dist.range}>
                    <div className="flex items-center justify-between text-xs font-medium mb-1">
                      <span className="text-slate-700">{dist.range}</span>
                      <span className="text-slate-500">{dist.count} student(s) ({pct}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question Difficulty & Success Rate Matrix */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Question Accuracy & Difficulty Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Question</th>
                    <th className="py-2.5 px-3">Topic</th>
                    <th className="py-2.5 px-3">Correct</th>
                    <th className="py-2.5 px-3">Wrong</th>
                    <th className="py-2.5 px-3">Accuracy %</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {questionAccuracyStats.map((stat, idx) => {
                    if (!stat) return null;
                    return (
                      <tr key={stat.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-medium text-slate-900 max-w-sm truncate">
                          Q{idx + 1}. {stat.text}
                        </td>
                        <td className="py-3 px-3 text-slate-600">{stat.topic}</td>
                        <td className="py-3 px-3 text-emerald-600 font-semibold">{stat.correct}</td>
                        <td className="py-3 px-3 text-rose-600 font-semibold">{stat.incorrect}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{stat.accuracyPercent}%</td>
                        <td className="py-3 px-3">
                          {stat.isHard ? (
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
                              Challenging Question
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                              Well Understood
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Proctoring Integrity Violations Log */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Proctoring & Anti-Cheating Telemetry Logs ({examProctorLogs.length})
              </h3>
            </div>

            {examProctorLogs.length === 0 ? (
              <div className="p-4 bg-emerald-50 rounded-xl text-xs text-emerald-800">
                No proctoring violations recorded for this examination session.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {examProctorLogs.map((log) => (
                  <div key={log.id} className="p-3.5 flex flex-wrap items-center justify-between gap-2 hover:bg-slate-50">
                    <div>
                      <div className="font-bold text-slate-900">
                        {log.studentName} (Roll: {log.studentRoll})
                      </div>
                      <div className="text-slate-600 text-[11px] mt-0.5">
                        {log.eventDescription}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold uppercase text-[10px]">
                        {log.eventType.replace('_', ' ')}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Submissions List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Individual Student Submissions & Grade Records
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Roll Number</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Percentage</th>
                    <th className="py-2.5 px-3">Correct / Wrong</th>
                    <th className="py-2.5 px-3">Submitted At</th>
                    <th className="py-2.5 px-3 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {examAttempts.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-semibold text-slate-900">{att.studentName}</td>
                      <td className="py-3 px-3 text-slate-600">{att.studentRoll}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{att.score} / {att.totalMarks}</td>
                      <td className="py-3 px-3">
                        <span className={`font-semibold ${att.percentage >= 40 ? 'text-indigo-950' : 'text-rose-600'}`}>
                          {att.percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {att.correctCount} correct · {att.incorrectCount} wrong
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {new Date(att.submissionTime || '').toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {onViewStudentResult && (
                          <button
                            onClick={() => onViewStudentResult(att)}
                            className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold cursor-pointer"
                          >
                            Inspect →
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Question Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingQuestionId ? 'Edit MCQ Question' : 'Add MCQ Question to Bank'}
              </h3>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={qSubject}
                    onChange={(e) => setQSubject(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                    <option value="Database Management Systems">Database Management Systems</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Topic *</label>
                  <input
                    type="text"
                    value={qTopic}
                    onChange={(e) => setQTopic(e.target.value)}
                    placeholder="e.g. Binary Search Trees"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Question Prompt *</label>
                <textarea
                  rows={3}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Enter the full question statement..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Code Snippet (Optional)</label>
                <textarea
                  rows={2}
                  value={qCodeSnippet}
                  onChange={(e) => setQCodeSnippet(e.target.value)}
                  placeholder="Optional code block in C++/Python/SQL..."
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-900">Multiple Choice Options *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-slate-100 font-bold text-xs flex items-center justify-center shrink-0">A</span>
                    <input
                      type="text"
                      value={optA}
                      onChange={(e) => setOptA(e.target.value)}
                      placeholder="Option A"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-slate-100 font-bold text-xs flex items-center justify-center shrink-0">B</span>
                    <input
                      type="text"
                      value={optB}
                      onChange={(e) => setOptB(e.target.value)}
                      placeholder="Option B"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-slate-100 font-bold text-xs flex items-center justify-center shrink-0">C</span>
                    <input
                      type="text"
                      value={optC}
                      onChange={(e) => setOptC(e.target.value)}
                      placeholder="Option C"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-slate-100 font-bold text-xs flex items-center justify-center shrink-0">D</span>
                    <input
                      type="text"
                      value={optD}
                      onChange={(e) => setOptD(e.target.value)}
                      placeholder="Option D"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Correct Option, Difficulty, Marks */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Correct Answer *</label>
                  <select
                    value={correctOpt}
                    onChange={(e) => setCorrectOpt(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-emerald-50 text-emerald-900 font-bold"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Marks</label>
                  <input
                    type="number"
                    value={qMarks}
                    onChange={(e) => setQMarks(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                    min="1"
                    max="10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Answer Explanation</label>
                <textarea
                  rows={2}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Explain why this option is correct for the answer sheet review..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  {editingQuestionId ? 'Update Question' : 'Save Question to Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
