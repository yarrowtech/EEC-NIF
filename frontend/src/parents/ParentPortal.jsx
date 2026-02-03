import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
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
  ChevronDown,
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

const ParentPortal = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [parentProfile, setParentProfile] = useState(null);
  const navRef = useRef(null);
  const navigate = useNavigate();
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

  const scrollDown = () => {
    if (navRef.current) {
      navRef.current.scrollBy({ top: 200, behavior: 'smooth' });
    }
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/parents' },
    { icon: Calendar, label: 'Attendance Report', path: '/parents/attendance' },
    { icon: BookOpen, label: 'Academic Report', path: '/parents/academic' },
    { icon: CreditCard, label: 'Fees Payment', path: '/parents/fees' },
    { icon: Activity, label: 'Health Report', path: '/parents/health' },
    { icon: MessageSquare, label: 'Chat', path: '/parents/chat' },
    { icon: MessageSquare, label: 'Complaints', path: '/parents/complaints' },
    { icon: Video, label: 'Parent-Teacher Meetings', path: '/parents/ptm' },
    { icon: Eye, label: 'Observation', path: '/parents/observation' },
    { icon: Eye, label: 'Parent Observation', path: '/parents/parent-observation' },
    { icon: GraduationCap, label: 'Results', path: '/parents/results' },
    { icon: Award, label: 'Achievements', path: '/parents/achievements' },
    { icon: FileText, label: 'Courses', path: '/parents/courses' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex gap-0">
      {/* Mobile Sidebar Toggle */}
      {!sidebarOpen && <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-yellow-500 text-white rounded-lg"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={24} />
      </button>}

      {/* Backdrop for mobile sidebar */}
      {/* {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
          onClick={() => setSisetSidebarOpendebarOpen(false)}
          aria-label="Close sidebar"
        />
      )} */}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen bg-white shadow-lg transform transition-max-width duration-300 ease-in-out z-40 md:block
          lg:translate-x-0 ${sidebarOpen ? 'max-w-80' : 'hidden max-w-32'}
        `}
        style={{ willChange: 'transform' }}
        aria-label="Sidebar"
      >
        <div className="p-6 w-full h-full flex flex-col">
          <div className="flex items-center space-x-3 mb-8">
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Users className="w-6 aspect-square text-yellow-600" />
            </div>
            {sidebarOpen && <div>
              <h2 className="text-lg font-semibold text-gray-800">Parent Portal</h2>
              <p className="text-sm text-gray-500">
                Welcome back{parentProfile?.name ? `, ${parentProfile.name}` : ''}!
              </p>
            </div>}
            <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-yellow-100 transition-colors text-amber-700"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
          </div>

          <nav ref={navRef} className="space-y-2 overflow-y-auto flex-grow scrollbar-hide">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-yellow-50 text-gray-700 hover:text-yellow-600 transition-colors"
              >
                <item.icon className="h-5 w-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>

          {/* Scroll Down Button */}
          <button
            onClick={scrollDown}
            className="mt-2 w-full py-2 flex items-center justify-center text-gray-500 hover:text-yellow-600 transition-colors"
          >
            <ChevronDown className="h-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`overflow-y-scroll h-screen ${sidebarOpen ? 'md:ml-80' : 'md:ml-32'} flex-grow p-6 bg-gray-50 transition-all duration-300`}>
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
