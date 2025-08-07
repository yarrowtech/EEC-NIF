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

const Dashboard = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false); // default to closed on mobile

  // Define view components in an object for cleaner code
  const viewComponents = {
    dashboard: DashboardHome,
    attendance: AttendanceView,
    routine: RoutineView,
    assignments: AssignmentView,
    courses: CoursesView,
    results: ResultsView,
    noticeboard: NoticeBoard,
    teacherfeedback: TeacherFeedback,
    achievements: AchievementsView,
    profile: ProfileUpdate,
    themecustomizer: ThemeCustomizer,
  };

  const renderContent = () => {
    const Component = viewComponents[activeView] || DashboardHome;
    return <Component />;
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
        className={`h-screen overflow-y-scroll flex-1 flex flex-col w-full transition-all duration-300`}
      >
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 p-2 sm:p-4 md:p-6 w-full">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;