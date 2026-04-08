import { Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import Analytics from './Analytics';
import Teachers from './Teachers';
import Students from './Students';
import Wellbeing from './pages/Wellbeing';
import SchoolsManagement from './pages/SchoolsManagement';
import SchoolAdminsManagement from './pages/SchoolAdminsManagement';
import Routines from './Routines';
import FloorRoomManagement from './pages/FloorRoomManagement';
import LessonPlanPage from './pages/LessonPlan';
import TeacherTimetable from './pages/TeacherTimetable';
import ExaminationManagement from './pages/ExaminationManagement';
import ParentsManagement from './pages/ParentsManagement';
import SubjectManagement from './pages/SubjectManagement';
import AcademicSetup from './pages/AcademicSetup';
import AttendanceManagement from './pages/AttendanceManagement';
import Result from './pages/Result';
import FeesCollection from './pages/FeesCollection';
import FeesDashboard from './pages/FeesDashboard';
import StudentFeeDetails from './pages/StudentFeeDetails';
import FeesManagement from './pages/FeesManagement';
import HR from './pages/HR';
import SchoolRegistrations from './pages/SchoolRegistrations';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Support from './pages/Support';
import NoticeManagement from './pages/NoticeManagement';
import AdminSettings from './pages/AdminSettings';
import StudentPromotion from './pages/StudentPromotion';
import ReportCardManagement from './pages/ReportCardManagement';
import HolidayList from './pages/HolidayList';
import { useState, useEffect, useMemo } from 'react';
import { ADMIN_MENU_ITEMS } from './adminConstants';
import { ensureAdminFetchScope, syncScopeFromProfile } from './utils/adminScope';

ensureAdminFetchScope();

const resolveLogoUrl = (logo) => {
  if (!logo) return '';
  if (typeof logo === 'string') return logo;
  if (typeof logo === 'object') {
    return logo.secure_url || logo.url || logo.path || '';
  }
  return '';
};

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

  const handleSettingsUpdated = ({ admin, school } = {}) => {
    setAdminProfile((prev) => {
      const next = { ...(prev || {}) };
      if (admin && typeof admin === 'object') {
        next.name = admin.name ?? next.name;
        next.email = admin.email ?? next.email;
        next.avatar = admin.avatar ?? next.avatar;
        next.campusName = admin.campusName ?? next.campusName;
        next.campusType = admin.campusType ?? next.campusType;
      }
      if (school && typeof school === 'object') {
        next.schoolName = school.name ?? next.schoolName;
        const nextLogo = resolveLogoUrl(school.logo);
        if (nextLogo) next.schoolLogo = nextLogo;
        if (!nextLogo && Object.prototype.hasOwnProperty.call(school, 'logo')) {
          next.schoolLogo = '';
        }
      }
      return next;
    });
  };

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
        let schoolDetails = {};

        if (data?.role === 'admin') {
          try {
            const schoolRes = await fetch(`${import.meta.env.VITE_API_URL}/api/schools`, {
              method: 'GET',
              headers: {
                authorization: `Bearer ${token}`,
              },
            });

            if (schoolRes.ok) {
              const schoolList = await schoolRes.json();
              const schools = Array.isArray(schoolList) ? schoolList : [];
              const matchedSchool =
                schools.find((school) => String(school?._id) === String(data?.schoolId)) || schools[0];

              if (matchedSchool) {
                schoolDetails = {
                  schoolName: matchedSchool.name || '',
                  schoolLogo: resolveLogoUrl(matchedSchool.logo),
                };
              }
            }
          } catch (schoolErr) {
            console.error('Failed to load school details', schoolErr);
          }
        }

        const profileWithSchool = { ...data, ...schoolDetails };
        setAdminProfile(profileWithSchool);
        syncScopeFromProfile(profileWithSchool);
      } catch (err) {
        console.error('Failed to load admin profile', err);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (adminProfile) {
      syncScopeFromProfile(adminProfile);
    }
  }, [adminProfile]);

  const isSuperAdmin = adminProfile?.role === 'super_admin';
  const schoolAdminMenuOrder = useMemo(
    () => [
      'Dashboard',
      'Analytics',
      'Academic Setup',
      // 'Subjects',
      'Teachers',
      'Students',
      'Teacher Timetable',
      'Student Attendance',
      'Promotion & Leave',
      'Parents',
      'Routines',
      'Floor & Rooms',
      'Lesson Plan',
      'Exam Management',
      'Result Management',
      'Report Cards',
      'Fees Management',
      'Notices',
      'Holiday List',
      'HR',
      'Support',
    ],
    []
  );

  const menuItems = useMemo(() => {
    if (isSuperAdmin) return ADMIN_MENU_ITEMS;
    const filteredMenuItems = ADMIN_MENU_ITEMS.filter((item) => item.scope !== 'super');
    const orderIndexByLabel = new Map(
      schoolAdminMenuOrder.map((label, index) => [label, index])
    );

    return [...filteredMenuItems].sort((a, b) => {
      const indexA = orderIndexByLabel.has(a.label)
        ? orderIndexByLabel.get(a.label)
        : Number.MAX_SAFE_INTEGER;
      const indexB = orderIndexByLabel.has(b.label)
        ? orderIndexByLabel.get(b.label)
        : Number.MAX_SAFE_INTEGER;
      return indexA - indexB;
    });
  }, [isSuperAdmin, schoolAdminMenuOrder]);

  const adminUser = {
    name: adminProfile?.name || 'Admin User',
    role: isSuperAdmin ? 'SUPER ADMIN' : 'School Admin',
    avatar: adminProfile?.avatar || '',
    schoolName: adminProfile?.schoolName || '',
    schoolLogo: adminProfile?.schoolLogo || '',
    campusName: adminProfile?.campusName || '',
    campusType: adminProfile?.campusType || ''
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
        <Route path="teachers" element={<Teachers setShowAdminHeader={setShowAdminHeader} />} />
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
        <Route path="routine" element={<Routines setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="routines" element={<Routines setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="floor-rooms" element={<FloorRoomManagement setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="parents" element={<ParentsManagement setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="academics" element={<AcademicSetup setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="subjects" element={<SubjectManagement setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="attendance" element={<AttendanceManagement setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="examination" element={<ExaminationManagement setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="timetable" element={<TeacherTimetable setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="lesson-plans" element={<LessonPlanPage setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="result" element={<Result setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="report-cards" element={<ReportCardManagement setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="fees" element={<FeesCollection setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="fees/collection" element={<FeesCollection setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="fees/manage" element={<FeesManagement setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="fees/dashboard" element={<FeesDashboard setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="fees/student-details" element={<StudentFeeDetails setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="hr" element={<HR setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="support" element={<Support setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="notices" element={<NoticeManagement setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="holidays" element={<HolidayList setShowAdminHeader={setShowAdminHeader} />} />
        <Route path="school-registrations" element={<SchoolRegistrations setShowAdminHeader={setShowAdminHeader} />} />
        <Route
          path="settings"
          element={
            <AdminSettings
              setShowAdminHeader={setShowAdminHeader}
              onSettingsUpdated={handleSettingsUpdated}
            />
          }
        />
        <Route path="promotion" element={<StudentPromotion setShowAdminHeader={setShowAdminHeader} />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminApp;
