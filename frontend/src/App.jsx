import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ComplaintManagementSystem from "./parents/ComplaintManagementSystem";
import AdminApp from "./admin/AdminApp";
import PrincipalDashboard from "./principal/PrincipalDashboard";
import ProfileUpdate from "./components/ProfileUpdate";
import ParentPortal from "./parents/ParentPortal";
import TeacherPortal from "./teachers/TeacherPortal";
import FeedbackPage from "./pages/FeedbackPage";
import FeedbackThankYou from "./pages/FeedbackThankYou";
import MeetTheDeveloper from "./pages/MeetTheDeveloper";
import SchoolRegistrationForm from "./components/SchoolRegistrationForm";
import SchoolRegistrationSuccess from "./components/SchoolRegistrationSuccess";
import FloatingGamesButton from "./components/FloatingGamesButton";
import GamesPage from "./games/GamesPage";
import SuperAdminApp from "./Super Admin/SuperAdminApp";
import ArchivedStudents from "./admin/ArchivedStudents";

const ROLES = Object.freeze({
  STUDENT: "Student",
  PARENT: "Parent",
  TEACHER: "Teacher",
  SCHOOL_ADMIN: "Admin",
  PRINCIPAL: "Principal",
  SUPER_ADMIN: "SuperAdmin",
});

const withAuth = (allowedRoles, element) => (
  <ProtectedRoute allowedRoles={allowedRoles}>{element}</ProtectedRoute>
);
const AUTHENTICATED_ROLES = Object.values(ROLES);

const studentSections = [
  "home",
  "ai-learning",
  "ai-learning-courses",
  "ai-learning-tutor",
  "academics",
  "assignments",
  "assignments-journal",
  "assignments-academic-alcove",
  "results",
  "schedule",
  "routine",
  "attendance",
  "communication",
  "chat",
  "teacherfeedback",
  "excuse-letter",
  "noticeboard",
  "wellness",
  "wellbeing",
  "achievements",
  "profile",
  "themecustomizer",
];

const studentBasePaths = ["/student", "/dashboard"];
const studentDashboardPaths = studentBasePaths.flatMap((basePath) => [
  basePath,
  `${basePath}/*`,
  ...studentSections.map((section) => `${basePath}/${section}`),
]);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/complaint" element={<ComplaintManagementSystem />} />
        <Route
          path="/profile"
          element={withAuth(AUTHENTICATED_ROLES, <ProfileUpdate />)}
        />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/feedback/thank-you" element={<FeedbackThankYou />} />
        <Route
          path="/school-registration"
          element={<SchoolRegistrationForm />}
        />
        <Route
          path="/school-registration/success"
          element={<SchoolRegistrationSuccess />}
        />
        <Route path="/meet-the-developer" element={<MeetTheDeveloper />} />

        {/* Student module */}
        {studentDashboardPaths.map((path) => (
          <Route
            key={path}
            path={path}
            element={withAuth([ROLES.STUDENT], <Dashboard />)}
          />
        ))}
        <Route
          path="/student/games"
          element={
            withAuth([ROLES.STUDENT], <GamesPage />)
          }
        />
        <Route
          path="/student/games/:gameKey"
          element={
            withAuth([ROLES.STUDENT], <GamesPage />)
          }
        />
        <Route
          path="/dashboard/games"
          element={
            withAuth([ROLES.STUDENT], <GamesPage />)
          }
        />
        <Route
          path="/dashboard/games/:gameKey"
          element={
            withAuth([ROLES.STUDENT], <GamesPage />)
          }
        />

        {/* School admin module */}
        <Route
          path="/admin/*"
          element={withAuth([ROLES.SCHOOL_ADMIN], <AdminApp />)}
        />
        <Route
          path="/school-admin/*"
          element={withAuth([ROLES.SCHOOL_ADMIN], <AdminApp />)}
        />
        <Route
          path="/admin/archived-students"
          element={withAuth([ROLES.SCHOOL_ADMIN], <ArchivedStudents />)}
        />
        <Route
          path="/principal"
          element={withAuth([ROLES.PRINCIPAL], <PrincipalDashboard />)}
        />
        <Route
          path="/super-admin/*"
          element={withAuth([ROLES.SUPER_ADMIN], <SuperAdminApp />)}
        />

        {/* Parent module */}
        <Route
          path="/parents/*"
          element={withAuth([ROLES.PARENT], <ParentPortal />)}
        />
        <Route
          path="/parent/*"
          element={withAuth([ROLES.PARENT], <ParentPortal />)}
        />

        {/* Teacher module */}
        <Route
          path="/teachers/*"
          element={withAuth([ROLES.TEACHER], <TeacherPortal />)}
        />
        <Route
          path="/teacher/*"
          element={withAuth([ROLES.TEACHER], <TeacherPortal />)}
        />

      </Routes>

      <FloatingGamesButton />
    </BrowserRouter>
  );
}

export default App;
