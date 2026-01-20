import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
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
  Eye
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

const TeacherPortal = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/teachers' },
    { icon: Briefcase, label: 'My Work Portal', path: '/teachers/my-work-portal' },
    { icon: Clock, label: 'Class Routine', path: '/teachers/class-routine' },
    { icon: UserCheck, label: 'Attendance', path: '/teachers/attendance' },
    { icon: BarChart3, label: 'Student Progress', path: '/teachers/progress' },
    { icon: AlertTriangle, label: 'Weak Students', path: '/teachers/weak-students' },
    { icon: Brain, label: 'AI Powered Teaching', path: '/teachers/ai-powered-teaching' },
    { icon: Activity, label: 'Student Health Updates', path: '/teachers/health-updates' },
    { icon: Eye, label: 'Student Observations', path: '/teachers/student-observations' },
    { icon: Calendar, label: 'Parent Meetings', path: '/teachers/parent-meetings' },
    { icon: FileText, label: 'Assignment Management', path: '/teachers/assignments' },
    { icon: ClipboardCheck, label: 'Assignment Evaluation', path: '/teachers/evaluation' },
    { icon: MessageSquare, label: 'Chat', path: '/teachers/chat' },
    { icon: BookOpen, label: 'Lesson Plans', path: '/teachers/lesson-plans' },
  ];

  // Close sidebar when a link is clicked (mobile view)
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Sidebar Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-yellow-500 text-white rounded-lg shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Semi-transparent overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <style>{`
        .sidebar-custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .sidebar-custom-scrollbar::-webkit-scrollbar-track {
          background: #FEF9C3;
          border-radius: 10px;
          margin: 8px 0;
        }
        .sidebar-custom-scrollbar::-webkit-scrollbar-thumb {
          background: #EAB308;
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        .sidebar-custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CA8A04;
        }
      `}</style>
      <div
        className={`
          sidebar-custom-scrollbar
          fixed top-0 left-0 h-screen w-64 bg-white shadow-lg z-40 overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#EAB308 #FEF9C3'
        }}
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Teacher Portal</h2>
              <p className="text-sm text-gray-500">Welcome back!</p>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-yellow-50 text-gray-700 hover:text-yellow-600 transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-h-screen overflow-y-auto">
        <div className="h-full">
          <Routes>
            <Route path="/" element={<TeacherDashboard />} />
            <Route path="/test" element={<TestTeacherPortal />} />
            <Route path="/my-work-portal" element={<MyWorkPortal />} />
            <Route path="/class-routine" element={<ClassRoutine />} />
            <Route path="/attendance" element={<AttendanceManagement />} />
            <Route path="/progress" element={<StudentProgress />} />
            <Route path="/weak-students" element={<WeakStudentIdentification />} />
            <Route path="/ai-powered-teaching" element={<AIPoweredTeaching />} />
            <Route path="/ai-learning/:studentId/:subject" element={<AILearningPath />} />
            <Route path="/health-updates" element={<HealthUpdates />} />
            <Route path="/student-observations" element={<StudentObservation />} />
            <Route path="/parent-meetings" element={<ParentMeetings />} />
            <Route path="/assignments" element={<AssignmentManagement />} />
            <Route path="/evaluation" element={<AssignmentEvaluation />} />
            <Route path="/chat" element={<TeacherChat />} />
            <Route path="/lesson-plans" element={<LessonPlanDashboard />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default TeacherPortal;