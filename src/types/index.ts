export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rollNumber?: string; // For students
  department?: string; // For teachers/admins
  status: 'active' | 'suspended';
  avatar?: string;
  createdAt: string;
}

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string;
  subject: string;
  topic: string;
  questionText: string;
  codeSnippet?: string;
  options: QuestionOption[];
  correctOption: 'A' | 'B' | 'C' | 'D';
  difficulty: DifficultyLevel;
  marks: number;
  explanation?: string;
  createdBy: string; // Teacher user ID or name
  createdAt: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  negativeMarking: number; // e.g. 0.5 marks deducted per wrong answer
  startTime: string; // ISO string
  endTime: string;   // ISO string
  instructions: string[];
  status: 'draft' | 'published' | 'completed';
  createdBy: string; // Teacher user ID
  creatorName: string;
  questionIds: string[];
  totalMarks: number;
  createdAt: string;
}

export interface ProctorLog {
  id: string;
  attemptId: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  eventType: 'tab_switch' | 'window_blur' | 'multiple_session' | 'fullscreen_exit';
  eventDescription: string;
  timestamp: string;
}

export interface QuestionResponse {
  questionId: string;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
  isCorrect: boolean;
  marksAwarded: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  subject: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  startTime: string;
  submissionTime?: string;
  status: 'in_progress' | 'submitted' | 'auto_submitted';
  score: number;
  totalMarks: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  negativeDeductions: number;
  responses: Record<string, 'A' | 'B' | 'C' | 'D' | null>;
  detailedResponses?: QuestionResponse[];
  markedForReview: string[];
  shuffleSeed: number;
  proctorViolationsCount: number;
}

export interface TopicPerformance {
  topic: string;
  totalQuestions: number;
  correctQuestions: number;
  percentage: number;
}

export interface ExamAnalytics {
  examId: string;
  examTitle: string;
  totalRegistered: number;
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  averagePercentage: number;
  passRate: number; // Percentage with >= 40%
  scoreDistribution: {
    range: string;
    count: number;
  }[];
  questionStats: {
    questionId: string;
    questionText: string;
    topic: string;
    correctPercent: number;
    incorrectPercent: number;
    unattemptedPercent: number;
    difficulty: DifficultyLevel;
  }[];
  topicStats: TopicPerformance[];
}
