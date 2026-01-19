import { Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import Analytics from './Analytics';
import Teachers from './Teachers';
import Staff from './Staff';
import Students from './Students';
import Wellbeing from './pages/Wellbeing';
import Routines from './Routines';
import LessonPlanPage from './pages/LessonPlan';
import TeacherTimetable from './pages/TeacherTimetable';
import ExaminationManagement from './pages/ExaminationManagement';
import ParentsManagement from './pages/ParentsManagement';
import CourseManagement from './pages/CourseManagement';
import SubjectManagement from './pages/SubjectManagement';
import AcademicSetup from './pages/AcademicSetup';
import AttendanceManagement from './pages/AttendanceManagement';
import Result from './pages/Result';
import FeesCollection from './pages/FeesCollection';
import FeesDashboard from './pages/FeesDashboard';
import StudentFeeDetails from './pages/StudentFeeDetails';
import HR from './pages/HR';
import SchoolRegistrations from './pages/SchoolRegistrations';
import { useState } from 'react';

const AdminApp = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');
  const [adminProfile, setAdminProfile] = useState(null);

  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item);
  };

  // state to manage admin header
  const [showAdminHeader, setShowAdminHeader] = useState(true);
  const [showAdminBreadcrumb, setShowAdminBreadcrumb] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/auth/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        setAdminProfile(data);
      } catch (err) {
        console.error('Failed to load admin profile', err);
      }
    };

    fetchProfile();
  }, []);

  const isSuperAdmin = adminProfile && !adminProfile.schoolId;

  const menuItems = useMemo(() => {
    if (isSuperAdmin) return ADMIN_MENU_ITEMS;
    return ADMIN_MENU_ITEMS.filter((item) => item.scope !== 'super');
  }, [isSuperAdmin]);

  const adminUser = {
    name: adminProfile?.name || 'Admin User',
    role: isSuperAdmin ? 'SUPER ADMIN' : 'School Admin',
    avatar: 'src/koushik-bala-pp.jpg',
  };

  return (
    <AdminLayout
      activeMenuItem={activeMenuItem}
      onMenuItemClick={handleMenuItemClick}
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={() => {setSidebarCollapsed(!sidebarCollapsed)}}
      adminUser={adminUser}
      menuItems={menuItems}
      showAdminHeader={showAdminHeader}
      showBreadcrumb={showAdminBreadcrumb}
    >
      <Routes>
        <Route path="dashboard" element={<Dashboard setShowAdminHeader={setShowAdminHeader} />} />
        <Route index element={<Dashboard setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="analytics" element={<Analytics setShowAdminHeader={setShowAdminHeader} />} />
        <Route
          path="schools"
          element={<SchoolsManagement setShowAdminHeader={setShowAdminHeader} isSuperAdmin={isSuperAdmin} />}
        />
        <Route
          path="school-admins"
          element={<SchoolAdminsManagement setShowAdminHeader={setShowAdminHeader} isSuperAdmin={isSuperAdmin} />}
        />
        <Route
          path="principals"
          element={
            <PrincipalsManagement
              setShowAdminHeader={setShowAdminHeader}
              isSuperAdmin={isSuperAdmin}
              adminSchoolId={adminProfile?.schoolId || null}
            />
          }
        />
        <Route path="teachers" element={<Teachers setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="staff" element={<Staff setShowAdminHeader={setShowAdminHeader} />} />
        <Route
          path="students"
          element={
            <Students
              setShowAdminHeader={setShowAdminHeader}
              setShowAdminBreadcrumb={setShowAdminBreadcrumb}
            />
          }
        />
        <Route path="wellbeing" element={<Wellbeing setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="routines" element={<Routines setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="parents" element={<ParentsManagement setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="academics" element={<AcademicSetup setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="courses" element={<CourseManagement setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="subjects" element={<SubjectManagement setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="attendance" element={<AttendanceManagement setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="examination" element={<ExaminationManagement setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="timetable" element={<TeacherTimetable setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="lesson-plans" element={<LessonPlanPage setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="result" element={<Result setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="fees" element={<FeesCollection setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="fees/dashboard" element={<FeesDashboard setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="fees/student-details" element={<StudentFeeDetails setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="hr" element={<HR setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="school-registrations" element={<SchoolRegistrations setShowAdminHeader={setShowAdminHeader} />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminApp;
