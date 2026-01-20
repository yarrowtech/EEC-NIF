// src/App.jsx
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
import SuperAdminApp from "./superAdmin/SuperAdminApp";


import ArchivedStudents from "./admin/ArchivedStudents";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/home"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/ai-learning"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/ai-learning-courses"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/ai-learning-tutor"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/academics"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/assignments"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/assignments-journal"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/assignments-academic-alcove"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/results"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/schedule"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/routine"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/attendance"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/communication"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/chat"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/teacherfeedback"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/excuse-letter"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/noticeboard"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/wellness"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/wellbeing"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/achievements"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/themecustomizer"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/complaint" element={<ComplaintManagementSystem />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/*"
          element={
            <ProtectedRoute allowedRoles={["SuperAdmin"]}>
              <SuperAdminApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/principal"
          element={
            <ProtectedRoute allowedRoles={["Principal", "Admin"]}>
              <PrincipalDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<ProfileUpdate />} />
        <Route
          path="/parents/*"
          element={
            <ProtectedRoute allowedRoles={["Parent", "Admin"]}>
              <ParentPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers/*"
          element={
            <ProtectedRoute allowedRoles={["Teacher", "Admin"]}>
              <TeacherPortal />
            </ProtectedRoute>
          }
        />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/feedback/thank-you" element={<FeedbackThankYou />} />
        <Route path="/school-registration" element={<SchoolRegistrationForm />} />
        <Route path="/school-registration/success" element={<SchoolRegistrationSuccess />} />
        <Route path="/meet-the-developer" element={<MeetTheDeveloper />} />
        <Route
          path="/dashboard/games"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <GamesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/games/:gameKey"
          element={
            <ProtectedRoute allowedRoles={["Student", "Admin"]}>
              <GamesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/archived-students"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <ArchivedStudents />
            </ProtectedRoute>
          }
        />
      </Routes>

      <FloatingGamesButton />
    </BrowserRouter>
  );
}

export default App;
