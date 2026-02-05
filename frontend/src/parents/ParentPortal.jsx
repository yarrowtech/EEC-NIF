import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  CreditCard, 
  Activity,
  MessageSquare,
  Menu,
  X,
  Award,
  GraduationCap,
  FileText,
  Video,
  ChevronLeft,
  ChevronRight,
  Home,
  Eye,
  LogOut
} from 'lucide-react';
import AttendanceReport from './AttendanceReport';
import AcademicReport from './AcademicReport';
import FeesPayment from './FeesPayment';
import HealthReport from './HealthReport';
import ComplaintManagementSystem from './ComplaintManagementSystem';
import ResultsView from './ResultsView';
import AchievementsView from './AchievementsView';
import CoursesView from './CoursesView';
import PTMPortal from './PTMPortal';
import ParentDashboard from './ParentDashboard';
import Observation from './Observation';
import ParentObservation from './ParentObservation';
import ParentChat from './ParentChat';
import ClassRoutine from './ClassRoutine';

const ParentPortal = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [parentProfile, setParentProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

  useEffect(() => {
    const loadParentProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/api/parent/auth/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        setParentProfile(data);
      } catch (err) {
        console.error('Failed to load parent profile', err);
      }
    };
    loadParentProfile();
  }, [API_BASE]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth >= 1024) return;
      if (!sidebarOpen) return;
      if (event.target.closest('.parent-sidebar')) return;
      setSidebarOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  const menuItems = [
    { icon: Home, label: 'Dashboard', description: 'Overview & insights', path: '/parents' },
    { icon: Calendar, label: 'Class Routine', description: 'Daily schedule', path: '/parents/routine' },
    { icon: Calendar, label: 'Attendance Report', description: 'Punctuality tracker', path: '/parents/attendance' },
    { icon: BookOpen, label: 'Academic Report', description: 'Learning progress', path: '/parents/academic' },
    { icon: CreditCard, label: 'Fees Payment', description: 'Bills & dues', path: '/parents/fees' },
    { icon: Activity, label: 'Health Report', description: 'Wellness records', path: '/parents/health' },
    { icon: MessageSquare, label: 'Chat', description: 'Connect with staff', path: '/parents/chat' },
    { icon: MessageSquare, label: 'Complaints', description: 'Issue resolution', path: '/parents/complaints' },
    { icon: Video, label: 'Parent-Teacher Meetings', description: 'Upcoming PTMs', path: '/parents/ptm' },
    { icon: Eye, label: 'Observation', description: 'Teacher notes', path: '/parents/observation' },
    { icon: Eye, label: 'Parent Observation', description: 'Share feedback', path: '/parents/parent-observation' },
    { icon: GraduationCap, label: 'Results', description: 'Performance summary', path: '/parents/results' },
    { icon: Award, label: 'Achievements', description: 'Celebrate wins', path: '/parents/achievements' },
    { icon: FileText, label: 'Courses', description: 'Curriculum view', path: '/parents/courses' }
  ];

  const normalizePath = (path) => {
    if (!path) return '/';
    const sanitized = path.replace(/\/+$/, '');
    return sanitized || '/';
  };

  const currentPath = normalizePath(
    location.pathname.replace(/^\/parent/, '/parents')
  );

  const handleMenuClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const childrenCount = Array.isArray(parentProfile?.children)
    ? parentProfile.children.length
    : 0;
  const wardLabel = childrenCount === 1 ? 'ward' : 'wards';

  return (
    <div className="min-h-screen bg-gray-100 flex relative">
      {/* Mobile Sidebar Toggle */}
      {!sidebarOpen && <button
        className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-yellow-500 text-white rounded-lg shadow-lg"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu size={24} />
      </button>}

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar backdrop"
        />
      )}

      <div
        className={`parent-sidebar fixed lg:relative h-screen bg-white shadow-2xl transition-all duration-500 ease-in-out z-30 flex flex-col border-r border-gray-200 overflow-hidden
          ${sidebarOpen ? 'w-80' : 'w-20'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          transitionProperty: 'width, transform, box-shadow',
          transitionDuration: '0.4s',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        aria-label="Sidebar navigation"
      >
        <div className="relative overflow-hidden">
          <div className={`transition-all duration-400 ease-in-out ${sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none absolute inset-0'}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-500 opacity-95" />
            <div className="relative px-4 py-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                  </div>
                  <div className="text-white">
                    <div className="font-semibold text-lg leading-tight">
                      {parentProfile?.name ? `${parentProfile.name}` : 'Parent Portal'}
                    </div>
                    <div className="text-white/80 text-xs">
                      Monitoring {childrenCount || 'your'} {childrenCount ? wardLabel : 'wards'}
                    </div>
                    <div className="text-white/70 text-xs mt-1">
                      Stay updated with daily progress
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="hidden lg:flex p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors border border-white/30"
                    aria-label="Collapse sidebar"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors border border-white/30"
                    aria-label="Close sidebar"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={`transition-all duration-400 ease-in-out ${!sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none absolute inset-0'}`}>
            <div className="p-3 border-b border-gray-200 bg-white">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="hidden lg:flex">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                    aria-label="Expand sidebar"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className={`flex-1 overflow-y-auto modern-scrollbar ${sidebarOpen ? 'px-4 py-6 space-y-2' : 'px-1 py-4 space-y-1'}`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const targetPath = normalizePath(item.path);
            const isRootLink = targetPath === '/parents';
            const isActive = isRootLink
              ? currentPath === targetPath
              : currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleMenuClick}
                className={`
                  group flex items-start rounded-2xl transition-all duration-300 ease-out transform ${
                    sidebarOpen ? 'px-4 py-3' : 'px-2 py-3 justify-center'
                  }
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 shadow-md border-l-4 border-yellow-500'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-yellow-50 hover:text-gray-900 hover:shadow-md hover:scale-105 active:scale-95 hover:border-l-4 hover:border-blue-300'
                  }
                `}
              >
                <Icon
                  className={`flex-shrink-0 transition-all duration-300 ${isActive ? 'text-yellow-600' : 'text-gray-500 group-hover:text-blue-600 group-hover:scale-110'}`}
                  size={sidebarOpen ? 20 : 18}
                />
                {sidebarOpen && (
                  <div className="ml-3 flex-1">
                    <div className="font-medium text-sm text-gray-800">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className={`${sidebarOpen ? 'p-4' : 'p-2'} border-t border-gray-200`}>
          <button
            type="button"
            onClick={handleLogout}
            className={`group relative w-full flex items-center rounded-xl transition-all duration-300 ease-out transform ${
              sidebarOpen ? 'px-4 py-3' : 'px-0 py-2 justify-center'
            } text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 hover:shadow-md hover:scale-105 active:scale-95`}
          >
            <div className={`flex items-center justify-center rounded-lg transition-all duration-300 ${
              sidebarOpen ? 'w-10 h-10 bg-red-100 group-hover:bg-red-200' : 'w-10 h-10 bg-red-100'
            }`}>
              <LogOut size={20} />
            </div>
            {sidebarOpen && (
              <div className="ml-3 text-left">
                <div className="font-medium text-sm">Logout</div>
                <div className="text-xs text-red-500">Sign out securely</div>
              </div>
            )}
          </button>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto h-screen bg-gray-50 transition-all duration-300 ${sidebarOpen ? '' : ''} p-2 sm:p-3`}>
        <Routes>
          <Route
            path="/"
            element={
              <ParentDashboard
                parentName={parentProfile?.name}
                childrenNames={Array.isArray(parentProfile?.children) ? parentProfile.children : []}
              />
            }
          />
          <Route path="attendance" element={<AttendanceReport />} />
          <Route path="routine" element={<ClassRoutine />} />
          <Route path="academic" element={<AcademicReport />} />
          <Route path="fees" element={<FeesPayment />} />
          <Route path="health" element={<HealthReport />} />
          <Route path="complaints" element={<ComplaintManagementSystem />} />
          <Route path="chat" element={<ParentChat />} />
          <Route path="ptm" element={<PTMPortal />} />
          <Route path="observation" element={<Observation />} />
          <Route path="parent-observation" element={<ParentObservation />} />
          <Route path="results" element={<ResultsView />} />
          <Route path="achievements" element={<AchievementsView />} />
          <Route path="courses" element={<CoursesView />} />
        </Routes>
      </div>
    </div>
  );
};

export default ParentPortal;
