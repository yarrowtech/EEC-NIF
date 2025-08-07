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
  Activity
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

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  card.color === 'blue' ? 'bg-yellow-100' :
                  card.color === 'green' ? 'bg-amber-100' :
                  card.color === 'purple' ? 'bg-purple-100' :
                  'bg-yellow-100'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    card.color === 'blue' ? 'text-yellow-600' :
                    card.color === 'green' ? 'text-amber-600' :
                    card.color === 'purple' ? 'text-purple-600' :
                    'text-yellow-600'
                  }`} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  card.trend === 'up' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {card.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {card.change}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-amber-900 mb-1">{card.value}</h3>
              <p className="text-sm text-amber-600 mb-4">{card.title}</p>
              
              <div className="space-y-2">
                {card.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="flex items-center justify-between text-xs">
                    <span className="text-amber-600">{detail.label}</span>
                    <span className="font-medium text-amber-700">{detail.value}</span>
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
        <div className="bg-white rounded-xl shadow-sm border border-yellow-100">
          <div className="p-6 border-b border-yellow-100">
            <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-500" />
              System Health Status
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {systemHealth.map((system, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      system.color === 'green' ? 'bg-amber-500' :
                      system.color === 'yellow' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="font-medium text-amber-900">{system.name}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                      system.status === 'operational' ? 'bg-amber-100 text-amber-700' :
                      system.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {system.status}
                    </div>
                    <div className="text-xs text-amber-600 mt-1">{system.uptime} uptime</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-yellow-100">
          <div className="p-6 border-b border-yellow-100">
            <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
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
                      <span className="font-medium text-amber-900">{dept.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-amber-900">{dept.score}%</span>
                        <div className={`flex items-center gap-1 text-xs ${
                          dept.trend === 'up' ? 'text-amber-600' :
                          dept.trend === 'down' ? 'text-red-600' :
                          'text-amber-500'
                        }`}>
                          {dept.trend === 'up' ? <ArrowUp className="w-3 h-3" /> :
                           dept.trend === 'down' ? <ArrowDown className="w-3 h-3" /> : null}
                          {dept.change}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          dept.score >= 90 ? 'bg-purple-500' :
                          dept.score >= 80 ? 'bg-amber-500' :
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

      {/* Recent Activities Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-yellow-100">
        <div className="p-6 border-b border-yellow-100">
          <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Recent School Activities
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-yellow-50 rounded-lg transition-colors">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-2 ${
                  activity.type === 'staff' ? 'bg-amber-500' :
                  activity.type === 'student' ? 'bg-yellow-500' :
                  activity.type === 'finance' ? 'bg-purple-500' :
                  activity.type === 'academic' ? 'bg-orange-500' :
                  'bg-amber-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-amber-900">{activity.action}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-amber-600">{activity.time}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.type === 'staff' ? 'bg-amber-100 text-amber-700' :
                      activity.type === 'student' ? 'bg-yellow-100 text-yellow-700' :
                      activity.type === 'finance' ? 'bg-purple-100 text-purple-700' :
                      activity.type === 'academic' ? 'bg-orange-100 text-orange-700' :
                      'bg-amber-100 text-amber-700'
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

export default SchoolOverview;