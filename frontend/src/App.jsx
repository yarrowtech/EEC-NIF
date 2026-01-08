// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import Dashboard from "./components/Dashboard";
import ComplaintManagementSystem from "./parents/ComplaintManagementSystem";
import AdminApp from "./admin/AdminApp";
import PrincipalDashboard from "./principal/PrincipalDashboard";
import ProfileUpdate from "./components/ProfileUpdate";
import ParentPortal from "./parents/ParentPortal";
import TeacherPortal from "./teachers/TeacherPortal";
import FeedbackPage from "./pages/FeedbackPage";
import FeedbackThankYou from "./pages/FeedbackThankYou";
import MeetTheDeveloper from "./pages/MeetTheDeveloper";
import FloatingGamesButton from "./components/FloatingGamesButton";
import GamesPage from "./games/GamesPage";


import ArchivedStudents from "./admin/ArchivedStudents";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/home" element={<Dashboard />} />
        <Route path="/dashboard/ai-learning" element={<Dashboard />} />
        <Route path="/dashboard/ai-learning-courses" element={<Dashboard />} />
        <Route path="/dashboard/ai-learning-tutor" element={<Dashboard />} />
        <Route path="/dashboard/academics" element={<Dashboard />} />
        <Route path="/dashboard/assignments" element={<Dashboard />} />
        <Route path="/dashboard/assignments-journal" element={<Dashboard />} />
        <Route path="/dashboard/assignments-academic-alcove" element={<Dashboard />} />
        <Route path="/dashboard/results" element={<Dashboard />} />
        <Route path="/dashboard/schedule" element={<Dashboard />} />
        <Route path="/dashboard/routine" element={<Dashboard />} />
        <Route path="/dashboard/attendance" element={<Dashboard />} />
        <Route path="/dashboard/communication" element={<Dashboard />} />
        <Route path="/dashboard/chat" element={<Dashboard />} />
        <Route path="/dashboard/teacherfeedback" element={<Dashboard />} />
        <Route path="/dashboard/excuse-letter" element={<Dashboard />} />
        <Route path="/dashboard/noticeboard" element={<Dashboard />} />
        <Route path="/dashboard/wellness" element={<Dashboard />} />
        <Route path="/dashboard/wellbeing" element={<Dashboard />} />
        <Route path="/dashboard/achievements" element={<Dashboard />} />
        <Route path="/dashboard/profile" element={<Dashboard />} />
        <Route path="/dashboard/themecustomizer" element={<Dashboard />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/complaint" element={<ComplaintManagementSystem />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/principal" element={<PrincipalDashboard />} />
        <Route path="/profile" element={<ProfileUpdate />} />
        <Route path="/parents/*" element={<ParentPortal />} />
        <Route path="/teachers/*" element={<TeacherPortal />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/feedback/thank-you" element={<FeedbackThankYou />} />
        <Route path="/meet-the-developer" element={<MeetTheDeveloper />} />
        <Route path="/dashboard/games" element={<GamesPage />} />
        <Route path="/dashboard/games/:gameKey" element={<GamesPage />} />
        <Route
          path="/admin/archived-students"
          element={<ArchivedStudents />}
        />
      </Routes>

      <FloatingGamesButton />
    </BrowserRouter>
  );
}

export default App;
