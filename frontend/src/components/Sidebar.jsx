import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  BookOpen,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  User,
  File,
  Trophy,
  Bell,
  MessageCircle,
  MessageSquare,
  Brain,
  X,
  GraduationCap,
  BarChart3,
  Heart,
  Zap,
  Star,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudentDashboard } from './StudentDashboardContext';

const Sidebar = ({ activeView, isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState({});
  const collapsed = !isOpen;
  const { profile } = useStudentDashboard();
  const studentData = profile || {
    name: 'Student',
    username: '',
    grade: '',
    section: '',
    roll: '',
    schoolName: '',
    schoolLogo: null,
  };

  // Helper function to navigate to a page
  const navigateToPage = (pageId) => {
    const path = pageId === 'dashboard' ? '/dashboard' : `/dashboard/${pageId}`;
    navigate(path);
  };

  const handleNavigation = (pageId) => {
    navigateToPage(pageId);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const schoolLogoSrc = studentData.schoolLogo || '/harrow-hall-school.png';

  const menuItems = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: Home,
      gradient: 'from-blue-500 to-blue-600',
      description: 'Overview & Analytics'
    },
    { 
      id: 'ai-learning', 
      name: 'AI Learning', 
      icon: Brain,
      gradient: 'from-purple-500 to-purple-600',
      description: 'Smart Learning Hub',
      children: [
        { id: 'ai-learning-courses', name: 'AI Courses', icon: GraduationCap },
        { id: 'ai-learning-tutor', name: 'AI Tutor', icon: Brain },
      ]
    },
    { 
      id: 'academics', 
      name: 'Academics', 
      icon: BookOpen,
      gradient: 'from-emerald-500 to-emerald-600',
      description: 'Learning Materials',
      children: [
        { id: 'assignments', name: 'Assignments', icon: FileText },
        { id: 'assignments-journal', name: 'Journal', icon: File },
        { id: 'assignments-academic-alcove', name: 'Study Hub', icon: Target },
        { id: 'results', name: 'Results', icon: BarChart3 },
      ]
    },
    { 
      id: 'schedule', 
      name: 'Schedule', 
      icon: Calendar,
      gradient: 'from-orange-500 to-orange-600',
      description: 'Time Management',
      children: [
        { id: 'routine', name: 'Daily Routine', icon: Calendar },
        { id: 'attendance', name: 'Attendance', icon: Users },
      ]
    },
    { 
      id: 'communication', 
      name: 'Communication', 
      icon: MessageSquare,
      gradient: 'from-indigo-500 to-indigo-600',
      description: 'Connect & Collaborate',
      children: [
        { id: 'chat', name: 'Messages', icon: MessageCircle },
        { id: 'teacherfeedback', name: 'Teacher Feedback', icon: Star },
        { id: 'excuse-letter', name: 'Excuse Letter', icon: FileText },
        { id: 'noticeboard', name: 'Notice Board', icon: Bell },
      ]
    },
    { 
      id: 'wellness', 
      name: 'Wellness', 
      icon: Heart,
      gradient: 'from-pink-500 to-pink-600',
      description: 'Health & Wellbeing',
      children: [
        { id: 'wellbeing', name: 'Mental Health', icon: Heart },
        { id: 'achievements', name: 'Achievements', icon: Trophy },
      ]
    },
  ];

  const handleLogout = () => {
    // Clear any auth tokens or user data here if needed
    localStorage.removeItem('token'); // Example: remove JWT token
    // Redirect to login page
    navigate('/');
  };

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 768 && isOpen && !event.target.closest('.sidebar')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300" 
          onClick={() => setIsOpen(false)} 
        />
      )}
      
      <div
        className={`sidebar fixed md:relative h-screen bg-white shadow-2xl transition-all duration-500 ease-in-out z-50 flex flex-col border-r border-gray-200 overflow-x-hidden ${
          isOpen ? 'w-80' : 'w-20'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${!isOpen ? 'overflow-hidden' : ''}`}
        style={{
          transitionProperty: 'width, transform, box-shadow',
          transitionDuration: '0.4s',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        aria-label="Sidebar"
      >
        {/* Redesigned Header with Smooth Transitions */}
        <div className="relative overflow-hidden">
          <div className={`transition-all duration-400 ease-in-out ${isOpen ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform -translate-x-4 pointer-events-none absolute inset-0'}`}>
            {/* Expanded Header with Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 via-yellow-600 to-yellow-500 opacity-90" />
            <div className="relative p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                      <img src={schoolLogoSrc} className="w-6 h-6 rounded-lg object-cover" alt="School Logo"/>
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                  </div>
                  <div className="text-white">
                    <div className="font-bold text-lg leading-tight">
                      {studentData.schoolName || studentData.name}
                    </div>
                    <div className="text-white/80 text-xs">
                      {studentData.grade
                        ? `Class ${studentData.grade}${studentData.section ? ` • Section ${studentData.section}` : ''}`
                        : `${studentData.name}'s Portal`}
                    </div>
                    {studentData.roll && (
                      <div className="text-white/80 text-[11px]">Roll No: {studentData.roll}</div>
                    )}
                  </div>
                </div>
                
                {/* Mobile menu toggle */}
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="md:hidden p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors border border-white/30"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className={`transition-all duration-400 ease-in-out ${!isOpen ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-4 pointer-events-none absolute inset-0'}`}>
            {/* Collapsed Header - Clean & Minimal */}
            <div className="p-2 border-b border-gray-200">
              <div className="flex flex-col items-center space-y-3">
                {/* Logo */}
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-md">
                    <img src={schoolLogoSrc} className="w-6 h-6 rounded-lg object-cover" alt="School Logo"/>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                </div>
                
                {/* Divider */}
                <div className="w-8 h-px bg-gray-300" />
              </div>
            </div>
          </div>
        </div>
        {/* Completely Redesigned Navigation */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden modern-scrollbar ${!isOpen ? 'px-1 py-2' : 'px-4 py-6'}`}>
          <div className={`${isOpen ? 'space-y-2' : 'space-y-1'}`}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = !!item.children?.length;
              const isActive =
                activeView === item.id ||
                (hasChildren && activeView.startsWith(`${item.id}-`)) ||
                (hasChildren && item.children?.some((c) => c.id === activeView));
              const defaultExpanded = hasChildren && isActive;
              const expanded = openGroups[item.id] === undefined ? defaultExpanded : openGroups[item.id];
              const showSubmenu = hasChildren && expanded && !collapsed;

              const handleItemClick = (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (hasChildren) {
                  if (collapsed) {
                    handleNavigation(item.id);
                    return;
                  }

                  setOpenGroups((prev) => ({ ...prev, [item.id]: !expanded }));
                } else {
                  handleNavigation(item.id);
                }
              };

              return (
                <div key={item.id} className="mb-1">
                  <button
                    onClick={handleItemClick}
                    className={`
                      ${hasChildren 
                        ? 'w-full flex items-center space-x-3 px-3 py-3 rounded-lg' 
                        : 'w-full flex items-center space-x-3 px-4 py-3 rounded-lg'
                      }
                      group transition-all duration-300 ease-out transform
                      ${hasChildren
                        ? 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-yellow-50 hover:text-gray-900 hover:shadow-md hover:scale-105 active:scale-95'
                        : isActive 
                          ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 shadow-md border-l-4 border-yellow-500'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-yellow-50 hover:text-gray-900 hover:shadow-md hover:scale-105 active:scale-95 hover:border-l-4 hover:border-blue-300'
                      }
                    `}
                  >
                    <Icon
                      size={20}
                      className={`flex-shrink-0 transition-all duration-300 ${
                        !hasChildren && isActive
                          ? 'text-yellow-600'
                          : 'text-gray-600 group-hover:text-blue-600 group-hover:scale-110'
                      }`}
                    />
                    {!collapsed && (
                      <span className="font-medium flex-1 text-left transition-all duration-300">
                        {item.name}
                      </span>
                    )}
                    {!collapsed && hasChildren && (
                      showSubmenu ? (
                        <ChevronDown size={16} className="text-gray-400 group-hover:text-blue-600 transition-all duration-300 group-hover:rotate-180" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-600 transition-all duration-300 group-hover:translate-x-1" />
                      )
                    )}
                  </button>

                  {showSubmenu && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = activeView === child.id;
                        return (
                          <button
                            key={child.id}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleNavigation(child.id);
                            }}
                            className={`
                              w-full flex items-center space-x-3 px-4 py-2 rounded-lg
                              group transition-all duration-300 ease-out transform
                              ${childActive 
                                ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border-l-2 border-yellow-500 shadow-sm' 
                                : 'text-gray-500 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-gray-700 hover:shadow-sm hover:scale-105 active:scale-95 hover:border-l-2 hover:border-blue-200'}
                            `}
                          >
                            <ChildIcon
                              size={16}
                              className={`flex-shrink-0 transition-all duration-300 ${childActive ? 'text-yellow-600' : 'group-hover:text-blue-600 group-hover:scale-110'}`}
                            />
                            <span className="text-sm font-medium transition-all duration-300">{child.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
        {/* Redesigned Bottom Section - Matches New Style */}
        <div className={`border-t border-gray-200 ${!isOpen ? 'p-2' : 'p-4'}`}>
          <div className={`${isOpen ? 'space-y-2' : 'space-y-1'}`}>
            {/* Settings Button */}
            {!isOpen ? (
              <button className="group relative w-full h-12 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-yellow-50 hover:scale-105 hover:shadow-md hover:text-gray-900 transition-all duration-300 ease-out transform active:scale-95">
                <div className="relative flex items-center justify-center w-6 h-6 transition-all duration-300 text-gray-600 group-hover:text-blue-600 group-hover:scale-110">
                  <Settings size={18} strokeWidth={1.8} className="flex-shrink-0 transition-all duration-300" />
                </div>
                
                {/* Enhanced Tooltip */}
                <div className="absolute left-full ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform translate-x-2 group-hover:translate-x-0 pointer-events-none z-50">
                  <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-gray-700 min-w-max">
                    <div className="font-semibold text-sm">Settings</div>
                    <div className="text-xs text-gray-300 mt-1">Preferences & Config</div>
                    
                    {/* Modern Arrow */}
                    <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2">
                      <div className="w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45" />
                    </div>
                  </div>
                </div>
                
                {/* Subtle Hover Ring */}
                <div className="absolute inset-0 rounded-xl ring-1 ring-transparent group-hover:ring-gray-300/30 transition-all duration-300" />
              </button>
            ) : (
              <button className="group relative w-full flex items-center px-4 py-3 rounded-xl text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-yellow-50 hover:text-gray-900 hover:shadow-md hover:scale-105 transition-all duration-300 ease-out transform active:scale-95">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300">
                  <Settings size={20} className="flex-shrink-0 transition-all duration-300" />
                </div>
                <div className="ml-3">
                  <div className="font-medium text-sm transition-all duration-300">Settings</div>
                  <div className="text-xs text-gray-500 group-hover:text-blue-600 transition-all duration-300">Preferences & Config</div>
                </div>
              </button>
            )}
            
            {/* Logout Button */}
            {!isOpen ? (
              <button
                onClick={handleLogout}
                className="group relative w-full h-12 flex items-center justify-center rounded-xl text-red-500 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:scale-105 hover:shadow-md hover:text-red-600 transition-all duration-300 ease-out transform active:scale-95"
              >
                <div className="relative flex items-center justify-center w-6 h-6 transition-all duration-300 text-red-500 group-hover:text-red-600 group-hover:scale-110">
                  <LogOut size={18} strokeWidth={1.8} className="flex-shrink-0 transition-all duration-300" />
                </div>
                
                {/* Enhanced Tooltip */}
                <div className="absolute left-full ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform translate-x-2 group-hover:translate-x-0 pointer-events-none z-50">
                  <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-gray-700 min-w-max">
                    <div className="font-semibold text-sm">Logout</div>
                    <div className="text-xs text-gray-300 mt-1">Sign out securely</div>
                    
                    {/* Modern Arrow */}
                    <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2">
                      <div className="w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45" />
                    </div>
                  </div>
                </div>
                
                {/* Subtle Hover Ring */}
                <div className="absolute inset-0 rounded-xl ring-1 ring-transparent group-hover:ring-red-300/30 transition-all duration-300" />
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="group relative w-full flex items-center px-4 py-3 rounded-xl text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 hover:shadow-md hover:scale-105 transition-all duration-300 ease-out transform active:scale-95"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 text-red-600 group-hover:bg-red-200 group-hover:scale-110 transition-all duration-300">
                  <LogOut size={20} className="flex-shrink-0 transition-all duration-300" />
                </div>
                <div className="ml-3">
                  <div className="font-medium text-sm transition-all duration-300">Logout</div>
                  <div className="text-xs text-red-500 group-hover:text-red-600 transition-all duration-300">Sign out securely</div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
