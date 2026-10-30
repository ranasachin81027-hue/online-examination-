import { User, Question, Exam, ExamAttempt, ProctorLog } from '../types';
import { INITIAL_USERS, INITIAL_QUESTIONS, INITIAL_EXAMS, INITIAL_ATTEMPTS, INITIAL_PROCTOR_LOGS } from '../data/mockData';

const STORAGE_KEYS = {
  USERS: 'examportal_users',
  QUESTIONS: 'examportal_questions',
  EXAMS: 'examportal_exams',
  ATTEMPTS: 'examportal_attempts',
  PROCTOR_LOGS: 'examportal_proctor_logs',
  CURRENT_USER: 'examportal_current_user',
  ACTIVE_EXAM_SESSION: 'examportal_active_session',
};

class StorageService {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXAMS)) {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTEMPTS)) {
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(INITIAL_ATTEMPTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROCTOR_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.PROCTOR_LOGS, JSON.stringify(INITIAL_PROCTOR_LOGS));
    }
    // Default logged in user: Aarav Patel (Student) for quick demo
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[3]));
    }
  }

  // --- Users ---
  getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  addUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: `u-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Update current user if matching
    const current = this.getCurrentUser();
    if (current && current.id === id) {
      this.setCurrentUser(users[idx]);
    }
    return users[idx];
  }

  toggleUserStatus(id: string): User | null {
    const users = this.getUsers();
    const user = users.find((u) => u.id === id);
    if (!user) return null;
    user.status = user.status === 'active' ? 'suspended' : 'active';
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return user;
  }

  // --- Current Session ---
  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // --- Questions ---
  getQuestions(): Question[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      return data ? JSON.parse(data) : INITIAL_QUESTIONS;
    } catch {
      return INITIAL_QUESTIONS;
    }
  }

  addQuestion(question: Omit<Question, 'id' | 'createdAt'>): Question {
    const questions = this.getQuestions();
    const newQuestion: Question = {
      ...question,
      id: `q-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    questions.unshift(newQuestion);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    return newQuestion;
  }

  updateQuestion(id: string, updates: Partial<Question>): Question | null {
    const questions = this.getQuestions();
    const idx = questions.findIndex((q) => q.id === id);
    if (idx === -1) return null;
    questions[idx] = { ...questions[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    return questions[idx];
  }

  deleteQuestion(id: string): boolean {
    const questions = this.getQuestions().filter((q) => q.id !== id);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    return true;
  }

  // --- Exams ---
  getExams(): Exam[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXAMS);
      return data ? JSON.parse(data) : INITIAL_EXAMS;
    } catch {
      return INITIAL_EXAMS;
    }
  }

  getExamById(id: string): Exam | undefined {
    return this.getExams().find((e) => e.id === id);
  }

  addExam(exam: Omit<Exam, 'id' | 'createdAt'>): Exam {
    const exams = this.getExams();
    const newExam: Exam = {
      ...exam,
      id: `exam-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    exams.unshift(newExam);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    return newExam;
  }

  updateExam(id: string, updates: Partial<Exam>): Exam | null {
    const exams = this.getExams();
    const idx = exams.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    exams[idx] = { ...exams[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    return exams[idx];
  }

  deleteExam(id: string): boolean {
    const exams = this.getExams().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    return true;
  }

  // --- Attempts & Grading ---
  getAttempts(): ExamAttempt[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      return data ? JSON.parse(data) : INITIAL_ATTEMPTS;
    } catch {
      return INITIAL_ATTEMPTS;
    }
  }

  getAttemptById(id: string): ExamAttempt | undefined {
    return this.getAttempts().find((a) => a.id === id);
  }

  getStudentAttempts(studentId: string): ExamAttempt[] {
    return this.getAttempts().filter((a) => a.studentId === studentId);
  }

  getStudentAttemptForExam(studentId: string, examId: string): ExamAttempt | undefined {
    return this.getAttempts().find(
      (a) => a.studentId === studentId && a.examId === examId
    );
  }

  saveAttempt(attempt: ExamAttempt): ExamAttempt {
    const attempts = this.getAttempts();
    const idx = attempts.findIndex((a) => a.id === attempt.id);
    if (idx >= 0) {
      attempts[idx] = attempt;
    } else {
      attempts.unshift(attempt);
    }
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
    return attempt;
  }

  // --- Proctor Logs ---
  getProctorLogs(): ProctorLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROCTOR_LOGS);
      return data ? JSON.parse(data) : INITIAL_PROCTOR_LOGS;
    } catch {
      return INITIAL_PROCTOR_LOGS;
    }
  }

  logProctorEvent(event: Omit<ProctorLog, 'id' | 'timestamp'>): ProctorLog {
    const logs = this.getProctorLogs();
    const newLog: ProctorLog = {
      ...event,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.PROCTOR_LOGS, JSON.stringify(logs));
    return newLog;
  }

  // --- In-Progress Session Autosave ---
  saveActiveSession(session: {
    examId: string;
    studentId: string;
    responses: Record<string, 'A' | 'B' | 'C' | 'D' | null>;
    markedForReview: string[];
    remainingSeconds: number;
    shuffleSeed: number;
    violationsCount: number;
    startTime: string;
  }) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EXAM_SESSION, JSON.stringify(session));
  }

  getActiveSession(examId: string, studentId: string) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_EXAM_SESSION);
      if (!data) return null;
      const parsed = JSON.parse(data);
      if (parsed.examId === examId && parsed.studentId === studentId) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  clearActiveSession() {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_EXAM_SESSION);
  }

  // --- Reset All Data ---
  resetAll() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(INITIAL_ATTEMPTS));
    localStorage.setItem(STORAGE_KEYS.PROCTOR_LOGS, JSON.stringify(INITIAL_PROCTOR_LOGS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[3]));
    this.clearActiveSession();
  }
}

export const storage = new StorageService();
