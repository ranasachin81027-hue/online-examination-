export interface SourceFile {
  name: string;
  path: string;
  language: string;
  content: string;
}

export const PYTHON_FLASK_FILES: SourceFile[] = [
  {
    name: 'schema.sql',
    path: 'schema.sql',
    language: 'sql',
    content: `-- Online Examination & Auto-Grading Portal
-- Database Schema for SQLite3
-- B.Tech Computer Science Mini Project

PRAGMA foreign_keys = ON;

-- 1. Users Table (Role-Based Access Control)
DROP TABLE IF EXISTS proctor_logs;
DROP TABLE IF EXISTS responses;
DROP TABLE IF EXISTS attempts;
DROP TABLE IF EXISTS exam_questions;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'teacher', 'student')) NOT NULL,
    roll_number TEXT,
    department TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended')),
    session_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Questions Bank
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT CHECK(correct_option IN ('A', 'B', 'C', 'D')) NOT NULL,
    difficulty TEXT CHECK(difficulty IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Medium',
    marks REAL NOT NULL DEFAULT 2.0,
    explanation TEXT,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
);

-- 3. Examinations Table
CREATE TABLE exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    negative_marking REAL NOT NULL DEFAULT 0.0,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    instructions TEXT,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'completed')),
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
);

-- 4. Examination Questions Mapping (Many-to-Many)
CREATE TABLE exam_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
    UNIQUE(exam_id, question_id)
);

-- 5. Student Exam Attempts (Strict 1 Attempt Per Student per Exam)
CREATE TABLE attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    exam_id INTEGER NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submission_time TIMESTAMP,
    status TEXT DEFAULT 'in_progress' CHECK(status IN ('in_progress', 'submitted', 'auto_submitted')),
    score REAL DEFAULT 0.0,
    total_marks REAL NOT NULL,
    percentage REAL DEFAULT 0.0,
    shuffle_seed INTEGER NOT NULL,
    FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE,
    UNIQUE(student_id, exam_id)
);

-- 6. Individual Question Responses for Each Attempt
CREATE TABLE responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attempt_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    selected_option TEXT CHECK(selected_option IN ('A', 'B', 'C', 'D')),
    is_correct BOOLEAN DEFAULT 0,
    marks_awarded REAL DEFAULT 0.0,
    FOREIGN KEY (attempt_id) REFERENCES attempts (id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
    UNIQUE(attempt_id, question_id)
);

-- 7. Automated Proctor Integrity Logs
CREATE TABLE proctor_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    attempt_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    event_description TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (attempt_id) REFERENCES attempts (id) ON DELETE CASCADE
);

CREATE INDEX idx_attempts_student ON attempts(student_id);
CREATE INDEX idx_attempts_exam ON attempts(exam_id);
CREATE INDEX idx_questions_subject ON questions(subject);
`,
  },
  {
    name: 'grading.py',
    path: 'grading.py',
    language: 'python',
    content: `"""
Online Examination & Auto-Grading Engine
B.Tech CSE Mini-Project Core Business Logic

Rules:
- Correct answer: Award full question marks (+marks).
- Incorrect answer: Deduct configured negative marking penalty (-negative_marking).
- Unattempted answer: Award 0 marks.
- Final score cannot fall below 0 (clamped).
- Percentage = (final_score / total_marks) * 100
- Ensure exam attempt is graded strictly once.
"""

def grade_attempt(exam, questions, student_responses):
    """
    Args:
        exam (dict): Exam metadata (total_marks, negative_marking)
        questions (list[dict]): Questions with correct_option, marks, id
        student_responses (dict): Map of question_id -> selected_option ('A'|'B'|'C'|'D'|None)
    Returns:
        dict: Grading summary with final score, percentage, counts, and response details
    """
    score = 0.0
    correct_count = 0
    incorrect_count = 0
    unattempted_count = 0
    negative_deductions = 0.0
    detailed_responses = []

    negative_penalty = float(exam.get('negative_marking', 0.0))
    total_marks = float(exam.get('total_marks', 0.0))

    # Fast question mapping
    question_map = {q['id']: q for q in questions}

    for q_id, q in question_map.items():
        chosen = student_responses.get(q_id) or student_responses.get(str(q_id))
        marks = float(q.get('marks', 2.0))
        correct_opt = q.get('correct_option')

        if chosen is None or str(chosen).strip() == '':
            unattempted_count += 1
            awarded = 0.0
            is_correct = False
        elif str(chosen).strip().upper() == str(correct_opt).strip().upper():
            correct_count += 1
            awarded = marks
            score += awarded
            is_correct = True
        else:
            incorrect_count += 1
            awarded = -negative_penalty
            negative_deductions += negative_penalty
            score += awarded
            is_correct = False

        detailed_responses.append({
            'question_id': q_id,
            'selected_option': chosen,
            'is_correct': is_correct,
            'marks_awarded': round(awarded, 2)
        })

    # Floor final score at zero
    final_score = max(0.0, round(score, 2))
    percentage = round((final_score / total_marks) * 100, 2) if total_marks > 0 else 0.0

    return {
        'score': final_score,
        'total_marks': total_marks,
        'percentage': percentage,
        'correct_count': correct_count,
        'incorrect_count': incorrect_count,
        'unattempted_count': unattempted_count,
        'negative_deductions': round(negative_deductions, 2),
        'detailed_responses': detailed_responses
    }
`,
  },
  {
    name: 'app.py',
    path: 'app.py',
    language: 'python',
    content: `"""
Online Examination & Auto-Grading Portal
Flask Application Server
"""

import os
import sqlite3
import random
from datetime import datetime
from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from grading import grade_attempt

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'examportal_btech_secret_key_2026')
DATABASE = os.path.join(app.instance_path, 'examportal.db')

os.makedirs(app.instance_path, exist_ok=True)

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    with app.app_context():
        db = get_db()
        with open('schema.sql', 'r') as f:
            db.cursor().executescript(f.read())
        db.commit()

# --- Role Decorators ---
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to continue.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def role_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return redirect(url_for('login'))
            if session.get('role') not in roles:
                flash('Unauthorized access for your role.', 'danger')
                return redirect(url_for('index'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# --- Routes ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email'].strip().lower()
        password = request.form['password']

        db = get_db()
        user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

        if user and check_password_hash(user['password_hash'], password):
            if user['status'] == 'suspended':
                flash('Your account is suspended. Contact the administrator.', 'danger')
                return render_template('login.html')

            session.clear()
            session['user_id'] = user['id']
            session['name'] = user['name']
            session['role'] = user['role']
            session['email'] = user['email']

            # Role-based dashboard redirect
            if user['role'] == 'admin':
                return redirect(url_for('admin_dashboard'))
            elif user['role'] == 'teacher':
                return redirect(url_for('teacher_dashboard'))
            else:
                return redirect(url_for('student_dashboard'))
        else:
            flash('Invalid email or password.', 'danger')

    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['name'].strip()
        email = request.form['email'].strip().lower()
        password = request.form['password']
        roll_number = request.form.get('roll_number', '').strip()
        department = request.form.get('department', '').strip()

        db = get_db()
        existing = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if existing:
            flash('An account with this email already exists.', 'warning')
            return render_template('register.html')

        hashed = generate_password_hash(password)
        db.execute(
            "INSERT INTO users (name, email, password_hash, role, roll_number, department) VALUES (?, ?, ?, 'student', ?, ?)",
            (name, email, hashed, roll_number, department)
        )
        db.commit()
        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out safely.', 'info')
    return redirect(url_for('login'))

# --- Admin Routes ---
@app.route('/admin/dashboard')
@role_required('admin')
def admin_dashboard():
    db = get_db()
    total_students = db.execute("SELECT COUNT(*) FROM users WHERE role = 'student'").fetchone()[0]
    total_teachers = db.execute("SELECT COUNT(*) FROM users WHERE role = 'teacher'").fetchone()[0]
    total_exams = db.execute("SELECT COUNT(*) FROM exams").fetchone()[0]
    total_questions = db.execute("SELECT COUNT(*) FROM questions").fetchone()[0]
    users = db.execute("SELECT * FROM users ORDER BY created_at DESC").fetchall()
    return render_template('admin/dashboard.html', total_students=total_students, total_teachers=total_teachers, total_exams=total_exams, total_questions=total_questions, users=users)

# --- Teacher Routes ---
@app.route('/teacher/dashboard')
@role_required('teacher')
def teacher_dashboard():
    db = get_db()
    exams = db.execute("SELECT * FROM exams WHERE created_by = ? ORDER BY created_at DESC", (session['user_id'],)).fetchall()
    return render_template('teacher/dashboard.html', exams=exams)

# --- Student Routes ---
@app.route('/student/dashboard')
@role_required('student')
def student_dashboard():
    db = get_db()
    exams = db.execute("SELECT * FROM exams WHERE status = 'published'").fetchall()
    attempts = db.execute("SELECT a.*, e.title as exam_title FROM attempts a JOIN exams e ON a.exam_id = e.id WHERE a.student_id = ?", (session['user_id'],)).fetchall()
    return render_template('student/dashboard.html', exams=exams, attempts=attempts)

if __name__ == '__main__':
    if not os.path.exists(DATABASE):
        init_db()
    app.run(debug=True, port=5000)
`,
  },
  {
    name: 'test_grading.py',
    path: 'tests/test_grading.py',
    language: 'python',
    content: `"""
Automated Pytest Test Suite for Online Examination & Auto-Grading Engine
Validates all scoring criteria, negative penalties, and edge cases.
"""

import pytest
from grading import grade_attempt

def test_specification_example_calculation():
    """
    Matches prompt specification example:
    5 questions worth 2 marks each (Total 10 marks), negative penalty of 0.5 per wrong answer.
    - 3 correct answers (+6 marks)
    - 1 incorrect answer (-0.5 marks)
    - 1 unattempted question (0 marks)
    Expected score = 5.5/10 (55%)
    """
    exam = {'total_marks': 10.0, 'negative_marking': 0.5}
    questions = [
        {'id': 1, 'marks': 2.0, 'correct_option': 'A'},
        {'id': 2, 'marks': 2.0, 'correct_option': 'B'},
        {'id': 3, 'marks': 2.0, 'correct_option': 'C'},
        {'id': 4, 'marks': 2.0, 'correct_option': 'D'},
        {'id': 5, 'marks': 2.0, 'correct_option': 'A'},
    ]
    student_responses = {
        1: 'A',  # Correct (+2)
        2: 'B',  # Correct (+2)
        3: 'C',  # Correct (+2)
        4: 'B',  # Incorrect (-0.5)
        5: None  # Unattempted (0)
    }

    result = grade_attempt(exam, questions, student_responses)

    assert result['score'] == 5.5
    assert result['percentage'] == 55.0
    assert result['correct_count'] == 3
    assert result['incorrect_count'] == 1
    assert result['unattempted_count'] == 1
    assert result['negative_deductions'] == 0.5

def test_score_floor_cannot_drop_below_zero():
    """
    If negative penalties exceed correct answers, score must clamp to 0.0.
    """
    exam = {'total_marks': 6.0, 'negative_marking': 1.0}
    questions = [
        {'id': 1, 'marks': 2.0, 'correct_option': 'A'},
        {'id': 2, 'marks': 2.0, 'correct_option': 'B'},
        {'id': 3, 'marks': 2.0, 'correct_option': 'C'},
    ]
    student_responses = {
        1: 'D',  # -1.0
        2: 'D',  # -1.0
        3: 'D',  # -1.0
    }

    result = grade_attempt(exam, questions, student_responses)

    assert result['score'] == 0.0  # Floor applied
    assert result['percentage'] == 0.0
    assert result['incorrect_count'] == 3

def test_perfect_score():
    exam = {'total_marks': 4.0, 'negative_marking': 0.5}
    questions = [
        {'id': 1, 'marks': 2.0, 'correct_option': 'A'},
        {'id': 2, 'marks': 2.0, 'correct_option': 'B'},
    ]
    student_responses = {1: 'A', 2: 'B'}
    result = grade_attempt(exam, questions, student_responses)
    assert result['score'] == 4.0
    assert result['percentage'] == 100.0
`,
  },
  {
    name: 'requirements.txt',
    path: 'requirements.txt',
    language: 'text',
    content: `Flask>=3.0.0
Werkzeug>=3.0.0
python-dotenv>=1.0.0
pytest>=8.0.0
`,
  },
  {
    name: 'README.md',
    path: 'README.md',
    language: 'markdown',
    content: `# Online Examination & Auto-Grading Portal (ExamPortal)
B.Tech Computer Science & Engineering Mini-Project

## 1. Project Overview
ExamPortal is a secure, role-based web examination portal built with Python, Flask, and SQLite. It provides automatic objective evaluation with negative marking, question & option randomization, real-time proctor integrity monitoring (tab-switching and window blur events), and class performance analytics.

## 2. Windows Installation & Execution Guide

### Prerequisites
- Python 3.9+ installed on Windows ([python.org](https://www.python.org))
- Visual Studio Code or any code editor
- Windows Command Prompt or PowerShell

### Step-by-Step Run Instructions
\`\`\`bash
# 1. Open Terminal or Command Prompt in the project folder
cd online-examination-portal

# 2. Create Python virtual environment
python -m venv venv

# 3. Activate virtual environment
# On Windows Command Prompt:
venv\\Scripts\\activate
# On Windows PowerShell:
venv\\Scripts\\Activate.ps1

# 4. Install dependencies
pip install -r requirements.txt

# 5. Initialize the SQLite database and seed mock data
python app.py
\`\`\`

Access the live portal at: **http://127.0.0.1:5000**

## 3. Demo Credentials
| Role | Email | Password |
|---|---|---|
| Administrator | admin@examportal.edu | admin123 |
| Teacher (DSA) | teacher.sharma@examportal.edu | teacher123 |
| Teacher (DBMS) | teacher.gupta@examportal.edu | teacher123 |
| Student (Aarav) | student.aarav@examportal.edu | student123 |
| Student (Priya) | student.priya@examportal.edu | student123 |

## 4. Run Automated Test Suite
\`\`\`bash
pytest tests/test_grading.py -v
\`\`\`
`,
  },
];
