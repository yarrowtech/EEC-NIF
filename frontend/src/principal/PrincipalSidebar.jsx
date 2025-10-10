import React from 'react';
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

const PrincipalSidebar = ({ activeView, setActiveView, isOpen, setIsOpen }) => {

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
    <div className={`h-screen bg-gradient-to-b from-yellow-50 to-amber-50 border-r border-yellow-200 shadow-2xl transition-all duration-300 flex flex-col fixed left-0 top-0 z-50 ${
      isOpen ? 'w-80' : 'w-20'
    }`}>
      {/* Header */}
      <div className="p-6 border-b border-yellow-200">
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-3 ${isOpen ? 'block' : 'hidden'}`}>
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            {isOpen && (
              <div>
                <h1 className="font-bold text-lg text-amber-800">Principal Portal</h1>
                <p className="text-xs text-yellow-600">Electronic Educare Center</p>
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
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
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
              </button>
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

      {/* Footer */}
      <div className="p-4 border-t border-yellow-200">
        {/* Principal Info */}
        {isOpen && (
          <div className="mt-4 pt-4 border-t border-yellow-200">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800">Dr. Principal</p>
                <p className="text-xs text-yellow-600">School Principal</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrincipalSidebar;
