import React from 'react';
import { 
  MessageSquare, 
  Phone, 
  Calendar, 
  FileText,
  Bell,
  AlertTriangle,
  Users,
  Mail,
  Download,
  Settings,
  Shield,
  Zap
} from 'lucide-react';

const QuickActions = () => {
  const quickActions = [
    {
      id: 'emergency',
      title: 'Emergency Alert',
      description: 'Send emergency notification to all staff',
      icon: Shield,
      color: 'red',
      urgent: true
    },
    {
      id: 'announcement',
      title: 'School Announcement',
      description: 'Broadcast message to students and staff',
      icon: MessageSquare,
      color: 'blue',
      urgent: false
    },
    {
      id: 'meeting',
      title: 'Schedule Meeting',
      description: 'Arrange staff or parent meetings',
      icon: Calendar,
      color: 'green',
      urgent: false
    },
    {
      id: 'report',
      title: 'Generate Report',
      description: 'Create performance or financial reports',
      icon: FileText,
      color: 'purple',
      urgent: false
    },
    {
      id: 'contact',
      title: 'Contact Emergency',
      description: 'Quick contact for urgent situations',
      icon: Phone,
      color: 'orange',
      urgent: true
    },
    {
      id: 'notification',
      title: 'Send Notification',
      description: 'Send targeted notifications',
      icon: Bell,
      color: 'yellow',
      urgent: false
    }
  ];

  const handleAction = (actionId) => {
    console.log(`Quick action triggered: ${actionId}`);
    // Implement specific action logic here
    switch (actionId) {
      case 'emergency':
        // Handle emergency alert
        break;
      case 'announcement':
        // Handle announcement
        break;
      case 'meeting':
        // Handle meeting scheduling
        break;
      case 'report':
        // Handle report generation
        break;
      case 'contact':
        // Handle emergency contact
        break;
      case 'notification':
        // Handle notification sending
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-yellow-100">
      <div className="p-6 border-b border-yellow-100">
        <h3 className="text-lg font-semibold text-amber-800 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Quick Actions
        </h3>
        <p className="text-sm text-amber-600 mt-1">Instant access to important functions</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                className={`p-4 rounded-lg border-2 border-dashed transition-all duration-200 hover:scale-105 hover:shadow-md group ${
                  action.urgent 
                    ? 'border-red-300 hover:border-red-400 hover:bg-red-50' 
                    : action.color === 'blue' ? 'border-purple-300 hover:border-purple-400 hover:bg-purple-50' :
                      action.color === 'green' ? 'border-yellow-300 hover:border-yellow-400 hover:bg-yellow-50' :
                      action.color === 'purple' ? 'border-amber-300 hover:border-amber-400 hover:bg-amber-50' :
                      action.color === 'orange' ? 'border-orange-300 hover:border-orange-400 hover:bg-orange-50' :
                      'border-yellow-300 hover:border-yellow-400 hover:bg-yellow-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    action.urgent 
                      ? 'bg-red-100 group-hover:bg-red-200' 
                      : action.color === 'blue' ? 'bg-purple-100 group-hover:bg-purple-200' :
                        action.color === 'green' ? 'bg-yellow-100 group-hover:bg-yellow-200' :
                        action.color === 'purple' ? 'bg-amber-100 group-hover:bg-amber-200' :
                        action.color === 'orange' ? 'bg-orange-100 group-hover:bg-orange-200' :
                        'bg-yellow-100 group-hover:bg-yellow-200'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      action.urgent 
                        ? 'text-red-600' 
                        : action.color === 'blue' ? 'text-purple-600' :
                          action.color === 'green' ? 'text-yellow-600' :
                          action.color === 'purple' ? 'text-amber-600' :
                          action.color === 'orange' ? 'text-orange-600' :
                          'text-yellow-600'
                    }`} />
                  </div>
                  {action.urgent && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      URGENT
                    </span>
                  )}
                </div>
                
                <div className="text-left">
                  <h4 className="font-semibold text-amber-900 mb-1">{action.title}</h4>
                  <p className="text-sm text-amber-600">{action.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;