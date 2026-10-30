import React, { useState, useMemo } from 'react';
import { User, UserRole, Exam, ProctorLog } from '../types';
import { storage } from '../services/storage';
import { 
  Users, 
  ShieldCheck, 
  FileText, 
  BookOpen, 
  UserPlus, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertOctagon, 
  Activity, 
  ShieldAlert, 
  X,
  UserCheck,
  RefreshCw
} from 'lucide-react';

interface AdminDashboardProps {
  admin: User;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin }) => {
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [exams, setExams] = useState<Exam[]>(() => storage.getExams());
  const [questions] = useState(() => storage.getQuestions());
  const [proctorLogs] = useState<ProctorLog[]>(() => storage.getProctorLogs());
  const [attempts] = useState(() => storage.getAttempts());

  const refreshUsers = () => {
    setUsers(storage.getUsers());
    setExams(storage.getExams());
  };

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | UserRole>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'suspended'>('All');

  // Add User Modal
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newRoll, setNewRoll] = useState('');
  const [newDept, setNewDept] = useState('Computer Science');

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.rollNumber && u.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchRole = roleFilter === 'All' || u.role === roleFilter;
      const matchStatus = statusFilter === 'All' || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handleToggleStatus = (userId: string) => {
    storage.toggleUserStatus(userId);
    refreshUsers();
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      alert('Please fill out name and email.');
      return;
    }

    storage.addUser({
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      rollNumber: newRole === 'student' ? newRoll.trim() : undefined,
      department: newDept.trim(),
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    setIsAddUserModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewRoll('');
    refreshUsers();
  };

  const studentsCount = users.filter((u) => u.role === 'student').length;
  const teachersCount = users.filter((u) => u.role === 'teacher').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Administrator & Controller Portal
            </h1>
            <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
              Exam Controller
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {admin.name} · University Examination Board Oversight & Access Governance
          </p>
        </div>

        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-xs self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New Account</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Enrolled Students</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{studentsCount}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Active candidates</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Faculty Evaluators</div>
          <div className="text-2xl font-black text-indigo-950 mt-1">{teachersCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Authoring exams</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Examinations Active</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{exams.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{questions.length} total questions in bank</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Attempts Logged</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{attempts.length}</div>
          <div className="text-[11px] text-amber-600 mt-0.5">{proctorLogs.length} integrity telemetry events</div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">User Governance & Access Control</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Search, filter, inspect, and toggle active/suspended states for student and faculty accounts
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, roll, or email..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg w-56 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700"
            >
              <option value="All">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Administrators</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">User Profile</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Roll / Dept</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Created Date</th>
                <th className="py-2.5 px-3 text-right">Access Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const isActive = u.status === 'active';
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'teacher' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {u.rollNumber ? (
                        <span className="font-mono text-slate-800 font-medium">{u.rollNumber}</span>
                      ) : (
                        u.department || 'N/A'
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition ${
                            isActive
                              ? 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                        >
                          {isActive ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Examination Overview & Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Examinations Master Registry</h2>
          <div className="divide-y divide-slate-100">
            {exams.map((exam) => (
              <div key={exam.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900">{exam.title}</div>
                  <div className="text-[11px] text-slate-500">
                    {exam.subject} · {exam.questionIds.length} Questions · Total {exam.totalMarks} Marks
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                    Published
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Faculty: {exam.creatorName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Activity & Integrity Telemetry */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-indigo-700" />
            <h2 className="text-base font-bold text-slate-900">Recent Integrity & Proctor Activity</h2>
          </div>

          <div className="space-y-3">
            {proctorLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-900">{log.studentName} ({log.studentRoll})</span>
                  <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-[11px] text-slate-600">{log.eventDescription}</p>
                <div className="text-[10px] text-amber-700 font-medium mt-1 uppercase">
                  Event: {log.eventType.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Provision User Account</h3>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Kumar"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ramesh@examportal.edu"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {newRole === 'student' ? 'Roll Number *' : 'Department *'}
                  </label>
                  <input
                    type="text"
                    value={newRole === 'student' ? newRoll : newDept}
                    onChange={(e) => newRole === 'student' ? setNewRoll(e.target.value) : setNewDept(e.target.value)}
                    placeholder={newRole === 'student' ? 'CS22B099' : 'CSE'}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
