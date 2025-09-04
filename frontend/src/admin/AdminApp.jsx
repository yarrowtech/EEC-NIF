import { Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import Analytics from './Analytics';
import Teachers from './Teachers';
import Students from './Students';
import Routines from './Routines';
import LessonPlanPage from './pages/LessonPlan';
import TeacherTimetable from './pages/TeacherTimetable';
import ExaminationManagement from './pages/ExaminationManagement';
import ParentsManagement from './pages/ParentsManagement';
import SubjectManagement from './pages/SubjectManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import Result from './pages/Result';
import FeesCollection from './pages/FeesCollection';
import NewAdd from './pages/NewAdd';
import { useState } from 'react';

const AdminApp = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');

  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item);
  };

  // state to manage admin header
  const [showAdminHeader, setShowAdminHeader] = useState(true)

  return (
    <AdminLayout
      activeMenuItem={activeMenuItem}
      onMenuItemClick={handleMenuItemClick}
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={() => {setSidebarCollapsed(!sidebarCollapsed)}}
      adminUser={{
        name: 'Admin User',
        role: 'Administrator',
        avatar: 'src/koushik-bala-pp.jpg',
      }}
      showAdminHeader={showAdminHeader}
    >
      <Routes>
        <Route path="dashboard" element={<Dashboard setShowAdminHeader={setShowAdminHeader} />} />
        <Route index element={<Dashboard setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="analytics" element={<Analytics setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="teachers" element={<Teachers setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="students" element={<Students setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="routines" element={<Routines setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="parents" element={<ParentsManagement setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="subjects" element={<SubjectManagement setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="attendance" element={<AttendanceManagement setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="examination" element={<ExaminationManagement setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="timetable" element={<TeacherTimetable setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="lesson-plans" element={<LessonPlanPage setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="result" element={<Result setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="fees" element={<FeesCollection setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="new-add" element={<NewAdd setShowAdminHeader={setShowAdminHeader} />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminApp;
