import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  BookOpen,
  Award,
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
  Menu,
  X,
  GraduationCap,
  BarChart3,
  Heart,
  Zap,
  Star,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeView, isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState({});

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
        className={`sidebar fixed md:relative h-screen bg-white shadow-2xl transition-all duration-300 z-50 flex flex-col border-r border-gray-200 ${
          isOpen ? 'w-80' : 'w-20'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${!isOpen ? 'overflow-hidden' : ''}`}
        aria-label="Sidebar"
      >
        {/* Redesigned Header */}
        <div className="relative">
          {isOpen ? (
            <>
              {/* Expanded Header with Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-90" />
              <div className="relative p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                        <img src='/harrow-hall-school.png' className="w-6 h-6 rounded-lg" alt="School Logo"/>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                    </div>
                    <div className="text-white">
                      <div className="font-bold text-lg">Student Name</div>
                      <div className="text-white/80 text-xs">Student Dashboard</div>
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
            </>
          ) : (
            /* Collapsed Header - Clean & Minimal */
            <div className="p-3 border-b border-gray-200">
              <div className="flex flex-col items-center space-y-3">
                {/* Logo */}
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <img src='/harrow-hall-school.png' className="w-6 h-6 rounded-lg" alt="School Logo"/>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                </div>
                
                {/* Divider */}
                <div className="w-8 h-px bg-gray-300" />
                
                {/* Student Initial */}
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  S
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Completely Redesigned Navigation */}
        <nav className={`flex-1 overflow-y-auto modern-scrollbar ${!isOpen ? 'px-1 py-2' : 'px-4 py-6'}`}>
          <div className={`${isOpen ? 'space-y-2' : 'space-y-1'}`}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = !!item.children?.length;
              const isActive = activeView === item.id || (hasChildren && activeView.startsWith(`${item.id}-`)) || 
                             (hasChildren && item.children?.some(c => c.id === activeView));
              const defaultExpanded = hasChildren && isActive;
              const expanded = openGroups[item.id] === undefined ? defaultExpanded : openGroups[item.id];
              
              if (!isOpen) {
                // Revolutionary Collapsed Design - Perfect Alignment & Spacing
                return (
                  <div key={item.id} className="relative">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNavigation(item.id);
                      }}
                      className={`group relative w-full h-12 flex items-center justify-center rounded-xl transition-all duration-300 ease-out ${
                        isActive
                          ? `bg-gradient-to-br ${item.gradient} text-white shadow-xl shadow-gray-400/20 transform scale-[1.02] ring-1 ring-white/20`
                          : 'text-gray-500 hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-50 hover:scale-[1.02] hover:shadow-md hover:text-gray-700'
                      }`}
                    >
                      {/* Perfect Icon Container */}
                      <div className={`relative flex items-center justify-center w-6 h-6 transition-all duration-300 ${
                        isActive
                          ? 'text-white drop-shadow-sm'
                          : 'text-gray-500 group-hover:text-gray-700'
                      }`}>
                        <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} className="transition-all duration-300" />
                      </div>
                      
                      {/* Modern Active Indicator - Right Side */}
                      {isActive && (
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white/90 rounded-l-full shadow-sm" />
                      )}
                      
                      {/* Enhanced Tooltip with Better Positioning */}
                      <div className="absolute left-full ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform translate-x-2 group-hover:translate-x-0 pointer-events-none z-50">
                        <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-gray-700 min-w-max">
                          <div className="font-semibold text-sm">{item.name}</div>
                          <div className="text-xs text-gray-300 mt-1">{item.description}</div>
                          
                          {/* Modern Arrow */}
                          <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2">
                            <div className="w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Subtle Hover Ring */}
                      <div className="absolute inset-0 rounded-xl ring-1 ring-transparent group-hover:ring-gray-300/30 transition-all duration-300" />
                    </button>
                    
                    {/* Refined Submenu Dots for Children */}
                    {hasChildren && isActive && (
                      <div className="mt-1 flex flex-col items-center space-y-0.5 py-2">
                        {item.children.slice(0, 4).map((child, index) => (
                          <button
                            key={child.id}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleNavigation(child.id);
                            }}
                            className={`group/child relative w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                              activeView === child.id
                                ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg scale-105`
                                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 hover:scale-105'
                            }`}
                          >
                            <child.icon size={12} strokeWidth={activeView === child.id ? 2.5 : 2} />
                            
                            {/* Child Tooltip - Compact */}
                            <div className="absolute left-full ml-2 opacity-0 group-hover/child:opacity-100 transition-all duration-200 pointer-events-none z-50">
                              <div className="bg-gray-800 text-white px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shadow-xl">
                                {child.name}
                                <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2">
                                  <div className="w-1.5 h-1.5 bg-gray-800 rotate-45" />
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                        
                        {/* More indicator if there are additional children */}
                        {item.children.length > 4 && (
                          <div className="w-1 h-1 bg-gray-400 rounded-full mt-1" />
                        )}
                      </div>
                    )}
                  </div>
                );
              }
              
              // Expanded State Design - Full Menu with Modern Cards
              return (
                <div key={item.id}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      if (hasChildren) {
                        setOpenGroups((prev) => ({ ...prev, [item.id]: !expanded }));
                        if (!expanded) {
                          handleNavigation(item.id);
                        }
                      } else {
                        handleNavigation(item.id);
                      }
                    }}
                    className={`group relative w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive && !hasChildren
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg transform scale-[1.02]`
                        : isActive && hasChildren
                        ? 'bg-gray-50 text-gray-900 border border-gray-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg mr-3 ${
                      isActive && !hasChildren
                        ? 'bg-white/20 text-white' 
                        : isActive && hasChildren
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm text-left">{item.name}</div>
                          <div className={`text-xs text-left ${
                            isActive ? 'text-gray-600' : 'text-gray-500'
                          }`}>
                            {item.description}
                          </div>
                        </div>
                        {hasChildren && (
                          <ChevronDown 
                            size={16} 
                            className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} 
                          />
                        )}
                      </div>
                    </div>
                  </button>
                  
                  {/* Expanded Submenu */}
                  {hasChildren && (
                    <div className={`overflow-hidden transition-all duration-300 ${
                      expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="mt-2 ml-6 space-y-1">
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
                              className={`group relative w-full flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                childActive
                                  ? `bg-gradient-to-r ${item.gradient} text-white shadow-md`
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              <div className={`flex items-center justify-center w-8 h-8 rounded-lg mr-3 ${
                                childActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                              }`}>
                                <ChildIcon size={16} />
                              </div>
                              <span className="font-medium">{child.name}</span>
                            </button>
                          );
                        })}
                      </div>
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
              <button className="group relative w-full h-12 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-50 hover:scale-[1.02] hover:shadow-md hover:text-gray-700 transition-all duration-300 ease-out">
                <div className="relative flex items-center justify-center w-6 h-6 transition-all duration-300 text-gray-500 group-hover:text-gray-700">
                  <Settings size={18} strokeWidth={1.8} className="transition-all duration-300" />
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
              <button className="group relative w-full flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-gray-200">
                  <Settings size={20} />
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-sm">Settings</div>
                  <div className="text-xs text-gray-500">Preferences & Config</div>
                </div>
              </button>
            )}
            
            {/* Logout Button */}
            {!isOpen ? (
              <button
                onClick={handleLogout}
                className="group relative w-full h-12 flex items-center justify-center rounded-xl text-red-500 hover:bg-gradient-to-br hover:from-red-50 hover:to-red-100 hover:scale-[1.02] hover:shadow-md hover:text-red-600 transition-all duration-300 ease-out"
              >
                <div className="relative flex items-center justify-center w-6 h-6 transition-all duration-300 text-red-500 group-hover:text-red-600">
                  <LogOut size={18} strokeWidth={1.8} className="transition-all duration-300" />
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
                className="group relative w-full flex items-center px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 text-red-600 group-hover:bg-red-200">
                  <LogOut size={20} />
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-sm">Logout</div>
                  <div className="text-xs text-red-500">Sign out securely</div>
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
