import React, { useState } from 'react';
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  BookOpen,
  Award,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  File,
  Atom,
  Trophy,
  Bell,
  MessageCircle,
  MessageSquare,
  Brain
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = ({ activeView, setActiveView, isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState({});

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { 
      id: 'ai-learning', 
      name: 'AI Learning', 
      icon: Brain,
      children: [
        { id: 'ai-learning-courses', name: 'Courses', icon: BookOpen },
      ]
    },
    { id: 'attendance', name: 'Attendance', icon: Users },
    { id: 'routine', name: 'Routine', icon: Calendar },
    { 
      id: 'assignments', 
      name: 'Assignments', 
      icon: FileText,
      children: [
        { id: 'assignments', name: 'Assignment', icon: FileText },
        { id: 'assignments-journal', name: 'Journal', icon: File },
        { id: 'assignments-academic-alcove', name: 'Academic Alcove', icon: BookOpen },
      ]
    },
    { id: 'results', name: 'Results', icon: Trophy },
    { id: 'noticeboard', name: 'Notice Board', icon: Bell },
    { id: 'teacherfeedback', name: 'Teacher Feedback', icon: MessageCircle },
    { 
      id: 'chat', 
      name: 'Chat', 
      icon: MessageSquare,
      children: [
        { id: 'chat', name: 'Messages', icon: MessageSquare },
        { id: 'excuse-letter', name: 'Excuse Letter', icon: FileText },
      ]
    },
    { id: 'wellbeing', name: 'Wellbeing', icon: Brain },
    { id: 'achievements', name: 'Achievements', icon: Award },
  ];

  const handleLogout = () => {
    // Clear any auth tokens or user data here if needed
    localStorage.removeItem('token'); // Example: remove JWT token
    // Redirect to login page
    navigate('/');
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {/* {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden" onClick={() => setIsOpen(false)} aria-label="Close sidebar" />
      )} */}
      <div
        className={`h-screen bg-gradient-to-b from-yellow-50 to-amber-50 shadow-lg transition-all duration-300 z-50 border-r border-yellow-200 flex flex-col
        `}
        aria-label="Sidebar"
        aria-hidden={!isOpen && window.innerWidth < 768}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-yellow-200">
          <div className={`flex items-center space-x-3 ${isOpen ? 'block' : 'hidden md:block'}`}> 
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full overflow-hidden flex items-center justify-center shadow-sm">
              <img src='/harrow-hall-school.png' className="text-white font-bold text-sm w-full"/>
            </div>
            {isOpen && <span className="font-bold text-amber-800">Student Portal</span>}
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-yellow-100 transition-colors text-amber-700"
            aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
        {/* Navigation */}
        <nav className="mt-6 px-3 flex-1 overflow-y-auto custom-scrollbar">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = !!item.children?.length;
              const isActive = activeView === item.id || (hasChildren && activeView.startsWith(`${item.id}-`));
              const defaultExpanded = hasChildren && (activeView === item.id || (activeView && activeView.startsWith(`${item.id}-`)) || item.children?.some(c => c.id === activeView));
              const expanded = openGroups[item.id] === undefined ? defaultExpanded : openGroups[item.id];
              if (item.link) {
                return (
                  <li key={item.id}>
                    <Link
                      to={item.link}
                      // No sidebar close on menu click
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                        window.location.pathname === item.link
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg'
                          : 'text-amber-700 hover:bg-yellow-100 hover:text-amber-800'
                      }`}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      {isOpen && <span className={`font-medium ${isOpen ? 'block' : 'hidden md:block'}`}>{item.name}</span>}
                    </Link>
                  </li>
                );
              }
              return (
                <li
                  key={item.id}
                  className="relative"
                >
                  <button
                    onClick={() => {
                      if (hasChildren) {
                        setActiveView(item.id);
                        setOpenGroups((prev) => ({ ...prev, [item.id]: !expanded }));
                      } else {
                        setActiveView(item.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg' 
                        : 'text-amber-700 hover:bg-yellow-100 hover:text-amber-800'
                    }`}
                    aria-expanded={hasChildren ? expanded : undefined}
                    aria-controls={hasChildren ? `submenu-${item.id}` : undefined}
                  >
                    <span className="flex items-center space-x-3">
                      <Icon size={20} className="flex-shrink-0" />
                      {isOpen && <span className={`font-medium ${isOpen ? 'block' : 'hidden md:block'}`}>{item.name}</span>}
                    </span>
                    {hasChildren && (
                      <span className="ml-2 text-xs text-amber-800">{expanded ? '▾' : '▸'}</span>
                    )}
                  </button>
                  {item.children && (
                    <ul
                      id={`submenu-${item.id}`}
                      className={`mt-1 ${isOpen ? 'ml-6' : 'ml-2'} space-y-1 submenu ${expanded ? 'submenu-open' : 'submenu-closed'}`}
                    >
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = activeView === child.id;
                        return (
                          <li key={child.id}>
                            <button
                              onClick={() => setActiveView(child.id)}
                              className={`w-full flex items-center ${isOpen ? 'space-x-3 px-3' : 'justify-center'} py-2 rounded-lg text-sm transition-all duration-200 ${
                                childActive
                                  ? 'bg-yellow-100 text-amber-900 border border-yellow-300'
                                  : 'text-amber-700 hover:bg-yellow-100 hover:text-amber-800'
                              }`}
                            >
                              <ChildIcon size={16} className="flex-shrink-0" />
                              {isOpen && <span className="font-medium">{child.name}</span>}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        {/* Bottom Section */}
        <div className="p-3 border-t border-yellow-200">
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-amber-700 hover:bg-yellow-100 hover:text-amber-800 transition-colors">
              <Settings size={20} className="flex-shrink-0" />
              {isOpen && <span className={`font-medium ${isOpen ? 'block' : 'hidden md:block'}`}>Settings</span>}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut size={20} className="flex-shrink-0" />
              {isOpen && <span className={`font-medium ${isOpen ? 'block' : 'hidden md:block'}`}>Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
