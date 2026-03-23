import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardHome from './DashboardHome';
import AttendanceView from './AttendanceView';
import RoutineView from './RoutineView';
import AssignmentView from './AssignmentView';
import CoursesView from './CoursesView';
import ResultsView from './ResultsView';
import AchievementsView from './AchievementsView';
import ThemeCustomizer from './ThemeCustomizer';
import ProfileUpdate from './ProfileUpdate';
import NoticeBoard from './NoticeBoard';
import TeacherFeedback from './TeacherFeedback';
import StudentChat from './StudentChat';
import ExcuseLetter from './ExcuseLetter';
import AILearningDashboard from './AILearningDashboard';
import AcademicAlcove from './AcademicAlcove';
import StudentWellbeing from './StudentWellbeing';
import LessonPlanStatusView from './LessonPlanStatusView';
import StudyMaterials from './StudyMaterials';
import { StudentDashboardProvider } from './StudentDashboardContext';
import MobileBottomNav from './MobileBottomNav';
import AdventureTryouts from './AdventureTryouts';
import HolidayListView from './HolidayListView';

const normalizeViewFromPath = (pathname) => {
  if (
    pathname === '/student' ||
    pathname === '/student/' ||
    pathname === '/dashboard' ||
    pathname === '/dashboard/'
  ) {
    return 'dashboard';
  }
  const match = pathname.match(/^\/(student|dashboard)\/([^/]+).*$/);
  if (match?.[2]) return match[2];
  return 'dashboard';
};

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false); // default to closed on mobile
  const journalRef = useRef(null);

  useEffect(() => {
    if (!location.pathname.startsWith('/dashboard')) return;
    const canonicalPath = location.pathname.replace('/dashboard', '/student');
    navigate(canonicalPath, { replace: true });
  }, [location.pathname, navigate]);

  const activeView = normalizeViewFromPath(location.pathname);

  // Function to handle navigation
  const setActiveView = (view) => {
    const path = view === 'dashboard' ? '/student' : `/student/${view}`;
    navigate(path);
  };

  // Function to handle journal save from mobile nav
  const handleSaveJournal = () => {
    if (journalRef.current?.saveJournal) {
      journalRef.current.saveJournal();
    }
  };

  // Define view components in an object for cleaner code
  const viewComponents = {
    dashboard: (props) => <DashboardHome {...props} setActiveView={setActiveView} />,
    home: (props) => <DashboardHome {...props} setActiveView={setActiveView} />,
    'ai-learning': AILearningDashboard,
    'ai-learning-courses': CoursesView,
    'ai-learning-tutor': AILearningDashboard,
    academics: (props) => <AssignmentView {...props} defaultType="school" />,
    attendance: AttendanceView,
    routine: RoutineView,
    schedule: RoutineView,
    holidays: HolidayListView,
    'lesson-plan-status': LessonPlanStatusView,
    assignments: (props) => <AssignmentView {...props} defaultType="school" />,
    'assignments-journal': (props) => <AssignmentView {...props} ref={journalRef} defaultType="journal" />,
    'assignments-academic-alcove': (props) => <AcademicAlcove {...props} />,
    'study-materials': StudyMaterials,
    courses: CoursesView,
    results: ResultsView,
    communication: StudentChat,
    noticeboard: NoticeBoard,
    teacherfeedback: TeacherFeedback,
    chat: StudentChat,
    'excuse-letter': ExcuseLetter,
    wellness: StudentWellbeing,
    wellbeing: StudentWellbeing,
    achievements: AchievementsView,
    tryouts: AdventureTryouts,
    profile: ProfileUpdate,
    themecustomizer: ThemeCustomizer,
  };

  useEffect(() => {
    if (!viewComponents[activeView]) {
      navigate('/student', { replace: true });
    }
  }, [activeView, navigate]);

  const renderContent = () => {
    const Component = viewComponents[activeView];

    if (Component) {
      return typeof Component === 'function' ? <Component /> : <Component setActiveView={setActiveView} />;
    } else {
      return <DashboardHome setActiveView={setActiveView} />;
    }
  };

  return (
    <StudentDashboardProvider>
      <div className="min-h-screen w-full bg-gray-50 flex relative overflow-hidden">
        <Sidebar
          activeView={activeView}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        <div
          className={`flex-1 flex flex-col h-screen transition-all duration-300 ${sidebarOpen ? '' : ''
            } ${(activeView === 'chat' || activeView === 'excuse-letter' || activeView === 'assignments-journal') ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'}`}
        >
          <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onOpenProfile={() => navigate('/student/profile')}
          />
          <main className={`flex-1 min-h-0 ${(activeView === 'chat' || activeView === 'excuse-letter' || activeView === 'assignments-journal') ? 'p-0' : ''} w-full flex flex-col`}>
            {renderContent()}
            {activeView !== 'chat' && activeView !== 'excuse-letter' && activeView !== 'assignments-journal' && (
              <div className="h-16 md:hidden shrink-0" aria-hidden="true" />
            )}
          </main>
        </div>
        <MobileBottomNav activeView={activeView} onSaveJournal={handleSaveJournal} />
      </div>
    </StudentDashboardProvider>
  );
};

export default Dashboard;
