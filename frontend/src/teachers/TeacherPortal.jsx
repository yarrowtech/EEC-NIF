import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Users,
  Activity,
  Calendar,
  FileText,
  ClipboardCheck,
  Menu,
  X,
  UserCheck,
  Home,
  BookOpen,
  MessageSquare,
  BarChart3,
  AlertTriangle,
  Brain,
  Briefcase,
  Clock,
  Eye,
  LogOut,
} from 'lucide-react';

import HealthUpdates from './HealthUpdates';
import ParentMeetings from './ParentMeetings';
import AssignmentManagement from './AssignmentManagement';
import AssignmentEvaluation from './AssignmentEvaluation';
import AttendanceManagement from './AttendanceManagement';
import TeacherDashboard from './TeacherDashboard';
import LessonPlanDashboard from './LessonPlanDashboard';
import TeacherChat from './TeacherChat';
import StudentProgress from './StudentProgress';
import WeakStudentIdentification from './WeakStudentIdentification';
import AILearningPath from './AILearningPath';
import TestTeacherPortal from './TestTeacherPortal';
import AIPoweredTeaching from './AIPoweredTeaching';
import MyWorkPortal from './MyWorkPortal';
import ClassRoutine from './ClassRoutine';
import StudentObservation from './StudentObservation';
import ClassNotes from './ClassNotes';

const PORTAL_BASE = '/teacher';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: `${PORTAL_BASE}/dashboard` },
  { icon: Briefcase, label: 'My Work Portal', path: `${PORTAL_BASE}/my-work-portal` },
  { icon: Clock, label: 'Class Routine', path: `${PORTAL_BASE}/class-routine` },
  { icon: UserCheck, label: 'Attendance', path: `${PORTAL_BASE}/attendance` },
  { icon: BarChart3, label: 'Student Progress', path: `${PORTAL_BASE}/progress` },
  { icon: AlertTriangle, label: 'Weak Students', path: `${PORTAL_BASE}/weak-students` },
  { icon: Brain, label: 'AI Powered Teaching', path: `${PORTAL_BASE}/ai-powered-teaching` },
  { icon: Activity, label: 'Student Health Updates', path: `${PORTAL_BASE}/health-updates` },
  { icon: Eye, label: 'Student Observations', path: `${PORTAL_BASE}/student-observations` },
  { icon: Calendar, label: 'Parent Meetings', path: `${PORTAL_BASE}/parent-meetings` },
  { icon: FileText, label: 'Assignment Management', path: `${PORTAL_BASE}/assignments` },
  { icon: ClipboardCheck, label: 'Assignment Evaluation', path: `${PORTAL_BASE}/evaluation` },
  { icon: MessageSquare, label: 'Chat', path: `${PORTAL_BASE}/chat` },
  { icon: BookOpen, label: 'Lesson Plans', path: `${PORTAL_BASE}/lesson-plans` },
  { icon: FileText, label: 'Class Notes', path: `${PORTAL_BASE}/class-notes` },
];

const TeacherPortal = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.pathname.startsWith('/teachers')) return;
    const canonicalPath = location.pathname.replace('/teachers', '/teacher');
    navigate(canonicalPath, { replace: true });
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (window.innerWidth >= 1024) return;
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const activePageTitle = useMemo(() => {
    const active = menuItems.find(
      (item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
    );
    return active?.label || 'Teacher Portal';
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Teacher Portal</p>
              <p className="text-xs text-slate-500">Academic workspace</p>
            </div>
          </div>
          <button
            className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="h-[calc(100vh-4rem)] overflow-y-auto p-3">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-amber-100 text-amber-800'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-3 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <button
                className="lg:hidden rounded-lg p-2 text-slate-700 hover:bg-slate-100"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu size={20} />
              </button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">{activePageTitle}</h1>
                <p className="text-xs text-slate-500 truncate">
                  {new Date().toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <main className="p-2 sm:p-4">
          <Routes>
            <Route index element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="test" element={<TestTeacherPortal />} />
            <Route path="my-work-portal" element={<MyWorkPortal />} />
            <Route path="class-routine" element={<ClassRoutine />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="progress" element={<StudentProgress />} />
            <Route path="weak-students" element={<WeakStudentIdentification />} />
            <Route path="ai-powered-teaching" element={<AIPoweredTeaching />} />
            <Route path="ai-learning/:studentId/:subject" element={<AILearningPath />} />
            <Route path="health-updates" element={<HealthUpdates />} />
            <Route path="student-observations" element={<StudentObservation />} />
            <Route path="parent-meetings" element={<ParentMeetings />} />
            <Route path="assignments" element={<AssignmentManagement />} />
            <Route path="evaluation" element={<AssignmentEvaluation />} />
            <Route path="chat" element={<TeacherChat />} />
            <Route path="lesson-plans" element={<LessonPlanDashboard />} />
            <Route path="class-notes" element={<ClassNotes />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default TeacherPortal;
