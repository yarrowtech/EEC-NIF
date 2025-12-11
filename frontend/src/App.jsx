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
