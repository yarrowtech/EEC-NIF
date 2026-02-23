import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  BarChart3,
  Users,
  GraduationCap,
  DollarSign,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  FileText,
  Award,
  Shield,
  Building,
  TrendingUp,
  MessageSquare,
  Phone,
  Mail
} from 'lucide-react';
import { AUTH_NOTICE, logoutAndRedirect } from '../utils/authSession';

const PrincipalSidebar = ({ isOpen, setIsOpen, principalProfile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = () => {
    logoutAndRedirect({ navigate, notice: AUTH_NOTICE.LOGGED_OUT });
  };

  const getDisplayValue = (value, fallback) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
    return fallback;
  };

  const principalName = getDisplayValue(principalProfile?.name, 'Principal');
  const schoolName = getDisplayValue(
    principalProfile?.schoolName || principalProfile?.campusName,
    'Electronic Educare Center'
  );
  const schoolLogo = getDisplayValue(principalProfile?.schoolLogo, '');

  const menuItems = [
    { 
      id: 'overview', 
      name: 'Dashboard Overview', 
      icon: Home,
      description: 'School-wide statistics and KPIs'
    },
    { 
      id: 'academics', 
      name: 'Academic Analytics', 
      icon: BookOpen,
      description: 'Performance, grades, and curriculum'
    },
    { 
      id: 'students', 
      name: 'Student Analytics', 
      icon: GraduationCap,
      description: 'Enrollment, attendance, and progress'
    },
    { 
      id: 'staff', 
      name: 'Staff Management', 
      icon: Users,
      description: 'Teachers, performance, and HR'
    },
    { 
      id: 'finance', 
      name: 'Financial Dashboard', 
      icon: DollarSign,
      description: 'Budget, revenue, and expenses'
    },
    { 
      id: 'facilities', 
      name: 'Facilities & Resources', 
      icon: Building,
      description: 'Infrastructure and maintenance'
    },
    { 
      id: 'reports', 
      name: 'Reports & Analytics', 
      icon: BarChart3,
      description: 'Detailed reports and insights'
    },
    { 
      id: 'communications', 
      name: 'Communications', 
      icon: MessageSquare,
      description: 'Send SMS/Email to groups'
    },
    { 
      id: 'notifications', 
      name: 'Notification Center', 
      icon: Bell,
      description: 'Alerts and urgent matters'
    },
    { 
      id: 'calendar', 
      name: 'School Calendar', 
      icon: Calendar,
      description: 'Events and important dates'
    }
  ];

  const quickActions = [
    { id: 'emergency', name: 'Emergency Alert', icon: Shield, color: 'red' },
    { id: 'announcement', name: 'Send Announcement', icon: MessageSquare, color: 'blue' },
    { id: 'meeting', name: 'Schedule Meeting', icon: Calendar, color: 'green' },
    { id: 'report', name: 'Generate Report', icon: FileText, color: 'purple' }
  ];


  return (
    <>
      <style>{`
        .minimal-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .minimal-scrollbar::-webkit-scrollbar-track {
          background: rgba(251, 191, 36, 0.1);
          border-radius: 10px;
        }
        .minimal-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(251, 191, 36, 0.5);
          border-radius: 10px;
        }
        .minimal-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 191, 36, 0.7);
        }
        .minimal-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(251, 191, 36, 0.5) rgba(251, 191, 36, 0.1);
        }
      `}</style>
      <div className={`h-screen bg-gradient-to-b from-yellow-50 to-amber-50 border-r border-yellow-200 shadow-2xl transition-all duration-300 flex flex-col fixed left-0 top-0 z-50 ${
        isOpen ? 'w-80' : 'w-20'
      }`}>
        {/* Header */}
      <div className="p-6 border-b border-yellow-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`${isOpen ? 'w-12 h-12' : 'w-10 h-10'} rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg overflow-hidden border border-white/60 relative`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              {schoolLogo && (
                <img
                  src={schoolLogo}
                  alt={schoolName}
                  className="w-full h-full object-cover relative z-10"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
            </div>
            {isOpen && (
              <div>
                <h1 className="font-bold text-lg text-amber-800">{principalName}</h1>
                <p className="text-xs text-yellow-600">{schoolName}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-yellow-100 transition-colors text-amber-600 hover:text-amber-800"
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto minimal-scrollbar">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === `/principal/${item.id}` || (location.pathname === '/principal' && item.id === 'overview');

            return (
              <Link
                key={item.id}
                to={`/principal/${item.id}`}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg transform scale-105'
                    : 'text-amber-700 hover:bg-yellow-100 hover:text-amber-800 hover:transform hover:scale-102'
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {isOpen && (
                  <div className="flex-1 text-left">
                    <span className="font-medium text-sm block">{item.name}</span>
                    <span className="text-xs opacity-70 block">{item.description}</span>
                  </div>
                )}

                {!isOpen && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-amber-800 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-yellow-200">{item.description}</div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Actions Section */}
        {isOpen && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-amber-600 mb-4 px-4">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 hover:transform hover:scale-102 text-amber-700 ${
                      action.color === 'red' ? 'hover:bg-red-100 hover:text-red-700' :
                      action.color === 'blue' ? 'hover:bg-purple-100 hover:text-purple-700' :
                      action.color === 'green' ? 'hover:bg-yellow-100 hover:text-yellow-700' :
                      'hover:bg-amber-100 hover:text-amber-800'
                    }`}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    <span className="text-sm">{action.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Footer - Logout Button */}
      <div className="p-4 border-t border-yellow-200">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-red-700 hover:bg-red-50 hover:text-red-800 ${
            !isOpen && 'justify-center'
          }`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {isOpen && (
            <span className="font-medium text-sm">Logout</span>
          )}
        </button>
      </div>
      </div>
    </>
  );
};

export default PrincipalSidebar;
