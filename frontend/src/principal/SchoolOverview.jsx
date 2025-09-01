import React from 'react';
import { 
  TrendingUp, 
  Users, 
  GraduationCap, 
  BookOpen,
  Award,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const SchoolOverview = ({ stats, activities }) => {
  const overviewCards = [
    {
      title: 'Student Population',
      value: stats.totalStudents.toLocaleString(),
      change: '+4.2%',
      trend: 'up',
      icon: GraduationCap,
      color: 'blue',
      details: [
        { label: 'New Admissions', value: '47' },
        { label: 'Active Enrollment', value: '1,247' },
        { label: 'Graduation Rate', value: '96.5%' }
      ]
    },
    {
      title: 'Faculty & Staff',
      value: (stats.totalTeachers + stats.totalStaff).toString(),
      change: '+2.1%',
      trend: 'up',
      icon: Users,
      color: 'green',
      details: [
        { label: 'Teachers', value: stats.totalTeachers.toString() },
        { label: 'Support Staff', value: stats.totalStaff.toString() },
        { label: 'Satisfaction', value: '4.6/5' }
      ]
    },
    {
      title: 'Academic Performance',
      value: `${stats.graduationRate}%`,
      change: '+1.8%',
      trend: 'up',
      icon: Award,
      color: 'purple',
      details: [
        { label: 'Above Average', value: '89%' },
        { label: 'Honor Roll', value: '234' },
        { label: 'Merit Awards', value: '156' }
      ]
    },
    {
      title: 'Financial Health',
      value: `$${stats.currentRevenue}M`,
      change: `+${stats.monthlyGrowth}%`,
      trend: 'up',
      icon: DollarSign,
      color: 'emerald',
      details: [
        { label: 'Monthly Revenue', value: `$${stats.currentRevenue}M` },
        { label: 'Budget Usage', value: `${stats.budgetUtilization}%` },
        { label: 'Surplus', value: '$180K' }
      ]
    }
  ];

  const systemHealth = [
    { name: 'Academic System', status: 'operational', uptime: '99.9%', color: 'green' },
    { name: 'Finance System', status: 'operational', uptime: '99.8%', color: 'green' },
    { name: 'Communication', status: 'maintenance', uptime: '97.5%', color: 'yellow' },
    { name: 'Student Portal', status: 'operational', uptime: '99.7%', color: 'green' },
    { name: 'Library System', status: 'operational', uptime: '99.4%', color: 'green' },
    { name: 'Transport System', status: 'operational', uptime: '98.9%', color: 'green' }
  ];

  const departmentPerformance = [
    { name: 'Mathematics', score: 94, trend: 'up', change: '+2.1' },
    { name: 'Science', score: 91, trend: 'up', change: '+1.8' },
    { name: 'English', score: 89, trend: 'stable', change: '+0.5' },
    { name: 'History', score: 87, trend: 'up', change: '+3.2' },
    { name: 'Arts', score: 92, trend: 'up', change: '+1.5' },
    { name: 'Physical Ed.', score: 88, trend: 'down', change: '-0.8' }
  ];

  // Sample calendar data
  const calendarEvents = [
    { id: 1, date: '2023-10-15', title: 'Parent-Teacher Conference', type: 'academic' },
    { id: 2, date: '2023-10-18', title: 'Science Fair', type: 'academic' },
    { id: 3, date: '2023-10-20', title: 'Sports Day', type: 'event' },
    { id: 4, date: '2023-10-25', title: 'Quarterly Exams Begin', type: 'academic' },
    { id: 5, date: '2023-10-28', title: 'Art Exhibition', type: 'event' },
    { id: 6, date: '2023-11-01', title: 'Staff Development Day', type: 'holiday' }
  ];

  // Current month view for calendar
  const currentMonth = "October 2023";
  const daysInMonth = 31;
  const firstDayOffset = 0; // Sunday

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < firstDayOffset; i++) {
    calendarDays.push({ day: null, events: [] });
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `2023-10-${i.toString().padStart(2, '0')}`;
    const dayEvents = calendarEvents.filter(event => event.date === dateStr);
    calendarDays.push({ day: i, events: dayEvents });
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  card.color === 'blue' ? 'bg-blue-100' :
                  card.color === 'green' ? 'bg-green-100' :
                  card.color === 'purple' ? 'bg-purple-100' :
                  'bg-emerald-100'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    card.color === 'blue' ? 'text-blue-600' :
                    card.color === 'green' ? 'text-green-600' :
                    card.color === 'purple' ? 'text-purple-600' :
                    'text-emerald-600'
                  }`} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  card.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {card.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {card.change}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{card.value}</h3>
              <p className="text-sm text-gray-600 mb-4">{card.title}</p>
              
              <div className="space-y-2">
                {card.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{detail.label}</span>
                    <span className="font-medium text-gray-700">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* System Health & Department Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              System Health Status
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {systemHealth.map((system, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      system.color === 'green' ? 'bg-green-500' :
                      system.color === 'yellow' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="font-medium text-gray-900">{system.name}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                      system.status === 'operational' ? 'bg-green-100 text-green-700' :
                      system.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {system.status}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{system.uptime} uptime</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              Department Performance
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {departmentPerformance.map((dept, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{dept.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{dept.score}%</span>
                        <div className={`flex items-center gap-1 text-xs ${
                          dept.trend === 'up' ? 'text-green-600' :
                          dept.trend === 'down' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {dept.trend === 'up' ? <ArrowUp className="w-3 h-3" /> :
                           dept.trend === 'down' ? <ArrowDown className="w-3 h-3" /> : null}
                          {dept.change}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          dept.score >= 90 ? 'bg-green-500' :
                          dept.score >= 80 ? 'bg-blue-500' :
                          dept.score >= 70 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${dept.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            School Calendar - {currentMonth}
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="font-medium text-gray-900">{currentMonth}</span>
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayData, index) => (
              <div 
                key={index} 
                className={`min-h-20 p-2 border rounded-lg ${
                  dayData.day ? 'bg-white border-gray-200' : 'bg-gray-50 border-transparent'
                }`}
              >
                {dayData.day && (
                  <>
                    <div className="text-sm font-medium text-gray-900 mb-1">{dayData.day}</div>
                    <div className="space-y-1">
                      {dayData.events.slice(0, 2).map(event => (
                        <div 
                          key={event.id} 
                          className={`text-xs p-1 rounded truncate ${
                            event.type === 'academic' ? 'bg-blue-100 text-blue-800' :
                            event.type === 'event' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayData.events.length > 2 && (
                        <div className="text-xs text-gray-500">+{dayData.events.length - 2} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Recent School Activities
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-2 ${
                  activity.type === 'staff' ? 'bg-blue-500' :
                  activity.type === 'student' ? 'bg-green-500' :
                  activity.type === 'finance' ? 'bg-purple-500' :
                  activity.type === 'academic' ? 'bg-orange-500' :
                  'bg-gray-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-600">{activity.time}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.type === 'staff' ? 'bg-blue-100 text-blue-700' :
                      activity.type === 'student' ? 'bg-green-100 text-green-700' :
                      activity.type === 'finance' ? 'bg-purple-100 text-purple-700' :
                      activity.type === 'academic' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {activity.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sample data for the component
SchoolOverview.defaultProps = {
  stats: {
    totalStudents: 1247,
    totalTeachers: 78,
    totalStaff: 42,
    graduationRate: 96.5,
    currentRevenue: 2.8,
    monthlyGrowth: 5.2,
    budgetUtilization: 78
  },
  activities: [
    { id: 1, action: 'New student registration completed', time: '2 hours ago', type: 'student' },
    { id: 2, action: 'Quarterly budget report generated', time: '5 hours ago', type: 'finance' },
    { id: 3, action: 'Teacher training session scheduled', time: 'Yesterday', type: 'staff' },
    { id: 4, action: 'Science lab equipment updated', time: '2 days ago', type: 'academic' },
    { id: 5, action: 'Sports equipment purchase approved', time: '3 days ago', type: 'finance' }
  ]
};

export default SchoolOverview;