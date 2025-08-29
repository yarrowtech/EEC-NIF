import React, { useState } from 'react';
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
  MessageSquare
} from 'lucide-react';

import HealthUpdates from './HealthUpdates';
import ParentMeetings from './ParentMeetings';
import AssignmentManagement from './AssignmentManagement';
import AssignmentEvaluation from './AssignmentEvaluation';
import AttendanceManagement from './AttendanceManagement';
import TeacherDashboard from './TeacherDashboard';
import LessonPlanDashboard from './LessonPlanDashboard';
import TeacherChat from './TeacherChat';

const TeacherPortal = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/teachers' },
    { icon: UserCheck, label: 'Attendance', path: '/teachers/attendance' },
    { icon: Activity, label: 'Student Health Updates', path: '/teachers/health-updates' },
    { icon: Calendar, label: 'Parent Meetings', path: '/teachers/parent-meetings' },
    { icon: FileText, label: 'Assignment Management', path: '/teachers/assignments' },
    { icon: ClipboardCheck, label: 'Assignment Evaluation', path: '/teachers/evaluation' },
    { icon: MessageSquare, label: 'Chat', path: '/teachers/chat' },
    { icon: BookOpen, label: 'Lesson Plans', path: '/teachers/lesson-plans' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Sidebar Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-yellow-500 text-white rounded-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-screen w-64 bg-white shadow-lg z-40 overflow-y-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        transition-transform duration-300 ease-in-out
      `}>
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
      <div className="flex-1 lg:ml-64 min-h-screen overflow-y-scroll">
        <div className="h-screen">
          <Routes>
            <Route path="/" element={<TeacherDashboard />} />
            <Route path="/attendance" element={<AttendanceManagement />} />
            <Route path="/health-updates" element={<HealthUpdates />} />
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
