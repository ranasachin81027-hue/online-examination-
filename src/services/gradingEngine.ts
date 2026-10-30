import { Question, Exam, ExamAttempt, QuestionResponse } from '../types';

/**
 * Auto-Grading Engine
 * Evaluates student MCQ responses strictly adhering to academic rules:
 * 1. Correct option: +question.marks
 * 2. Incorrect option: -exam.negativeMarking
 * 3. Unattempted: 0 marks
 * 4. Final score clamped: minimum 0 (score cannot fall below 0)
 * 5. Percentage: (score / totalMarks) * 100
 */
export function gradeExamAttempt(
  exam: Exam,
  questions: Question[],
  studentResponses: Record<string, 'A' | 'B' | 'C' | 'D' | null>,
  studentId: string,
  studentName: string,
  studentRoll: string,
  existingAttemptId?: string,
  shuffleSeed = Date.now(),
  proctorViolationsCount = 0,
  isAutoSubmitted = false
): ExamAttempt {
  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;
  let negativeDeductions = 0;

  const detailedResponses: QuestionResponse[] = [];

  // Question lookup map for fast O(1) matching
  const questionMap = new Map<string, Question>();
  questions.forEach((q) => questionMap.set(q.id, q));

  // Only grade the questions allocated to this specific exam
  exam.questionIds.forEach((qId) => {
    const question = questionMap.get(qId);
    if (!question) return;

    const selected = studentResponses[qId] || null;

    if (selected === null || selected === undefined) {
      unattemptedCount++;
      detailedResponses.push({
        questionId: qId,
        selectedOption: null,
        isCorrect: false,
        marksAwarded: 0,
      });
    } else if (selected === question.correctOption) {
      correctCount++;
      score += question.marks;
      detailedResponses.push({
        questionId: qId,
        selectedOption: selected,
        isCorrect: true,
        marksAwarded: question.marks,
      });
    } else {
      incorrectCount++;
      const penalty = exam.negativeMarking || 0;
      negativeDeductions += penalty;
      score -= penalty;
      detailedResponses.push({
        questionId: qId,
        selectedOption: selected,
        isCorrect: false,
        marksAwarded: -penalty,
      });
    }
  });

  // Score must never drop below 0
  const finalScore = Math.max(0, Math.round(score * 100) / 100);
  const totalMarks = exam.totalMarks || (exam.questionIds.length * 2);
  const percentage = totalMarks > 0 ? Math.round(((finalScore / totalMarks) * 100) * 100) / 100 : 0;

  const attempt: ExamAttempt = {
    id: existingAttemptId || `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    examId: exam.id,
    examTitle: exam.title,
    subject: exam.subject,
    studentId,
    studentName,
    studentRoll,
    startTime: new Date(Date.now() - (exam.durationMinutes * 60 * 1000 * 0.8)).toISOString(),
    submissionTime: new Date().toISOString(),
    status: isAutoSubmitted ? 'auto_submitted' : 'submitted',
    score: finalScore,
    totalMarks,
    percentage,
    correctCount,
    incorrectCount,
    unattemptedCount,
    negativeDeductions: Math.round(negativeDeductions * 100) / 100,
    responses: studentResponses,
    detailedResponses,
    markedForReview: [],
    shuffleSeed,
    proctorViolationsCount,
  };

  return attempt;
}

/**
 * Deterministic PRNG and array shuffle using seed
 * Ensures student gets a consistent randomized view of questions and options
 */
export function shuffleArrayWithSeed<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let currentSeed = seed;

  const pseudoRandom = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(pseudoRandom() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
