// src/app.jsx (keep this as your main app)
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import Dashboard from './components/Dashboard' 
import ComplaintManagementSystem from './parents/ComplaintManagementSystem'
import AdminApp from './admin/AdminApp' 
import PrincipalDashboard from './principal/PrincipalDashboard'
import ProfileUpdate from './components/ProfileUpdate'
import ParentPortal from './parents/ParentPortal'
import TeacherPortal from './teachers/TeacherPortal'
import FeedbackPage from './pages/FeedbackPage'
import FeedbackThankYou from './pages/FeedbackThankYou'
import MeetTheDeveloper from './pages/MeetTheDeveloper'
import FloatingAIAssistant from './components/FloatingAIAssistant'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup" element={<SignupForm/>}/>
        <Route path="/complaint" element={<ComplaintManagementSystem/>}/>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/principal" element={<PrincipalDashboard />} />
        <Route path="/profile" element={<ProfileUpdate />} />
        <Route path="/parents/*" element={<ParentPortal />} />
        <Route path="/teachers/*" element={<TeacherPortal />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/feedback/thank-you" element={<FeedbackThankYou />} />
        <Route path="/meet-the-developer" element={<MeetTheDeveloper />} />
      </Routes>
      
      {/* AI Assistant - Available on all pages except login/signup */}
      <FloatingAIAssistant />
    </BrowserRouter>
  )
}

export default App