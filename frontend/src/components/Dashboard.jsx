import React, { useState } from 'react';
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
import AILearningDashboard from './AILearningDashboard';
import AcademicAlcove from './AcademicAlcove';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false); // default to closed on mobile

  // Define view components in an object for cleaner code
  const viewComponents = {
    dashboard: (props) => <DashboardHome {...props} setActiveView={setActiveView} />,
    'ai-learning': AILearningDashboard,
    'ai-learning-courses': CoursesView,
    attendance: AttendanceView,
    routine: RoutineView,
    assignments: (props) => <AssignmentView {...props} defaultType="school" />,
    'assignments-journal': (props) => <AssignmentView {...props} defaultType="journal" />,
    'assignments-academic-alcove': (props) => <AcademicAlcove {...props} />,
    courses: CoursesView,
    results: ResultsView,
    noticeboard: NoticeBoard,
    teacherfeedback: TeacherFeedback,
    chat: StudentChat,
    achievements: AchievementsView,
    profile: ProfileUpdate,
    themecustomizer: ThemeCustomizer,
  };

  const renderContent = () => {
    const Component = viewComponents[activeView] || DashboardHome;
    return typeof Component === 'function' ? <Component /> : <DashboardHome setActiveView={setActiveView} />;
  };

  return (
    <div className={`min-h-screen w-full bg-gray-50 grid ${sidebarOpen ? "grid-cols-[250px_1fr]" : "grid-cols-[100px_1fr]"} transition-all duration-300`}>
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <div 
        className={`h-screen min-h-0 ${activeView === 'chat' ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'} flex-1 flex flex-col w-full transition-all duration-300`}
      >
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onOpenProfile={() => setActiveView('profile')}
        />
        <main className={`flex-1 min-h-0 ${activeView === 'chat' ? 'p-0' : 'p-2 sm:p-4 md:p-6'} w-full flex flex-col`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
