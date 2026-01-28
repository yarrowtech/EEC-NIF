import React, { useMemo } from 'react';
import { BookOpen, Trophy, Clock, TrendingUp } from 'lucide-react';
import { useStudentDashboard } from './StudentDashboardContext';

const QuickStats = () => {
  const { stats: dashboardStats, course, loading } = useStudentDashboard();

  const stats = useMemo(() => {
    if (!dashboardStats) {
      return [
        {
          title: "Active Courses",
          value: loading ? "..." : "0",
          change: loading ? "Loading..." : "No course assigned",
          changeType: "neutral",
          icon: BookOpen,
          color: "bg-blue-500"
        },
        {
          title: "Achievements",
          value: loading ? "..." : "0",
          change: loading ? "Loading..." : "Track achievements soon",
          changeType: "neutral",
          icon: Trophy,
          color: "bg-yellow-500"
        },
        {
          title: "Attendance",
          value: loading ? "..." : "0%",
          change: loading ? "Loading..." : "0/0 days",
          changeType: "neutral",
          icon: Clock,
          color: "bg-green-500"
        },
        {
          title: "Overall Progress",
          value: loading ? "..." : "0%",
          change: loading ? "Loading..." : "Focus on your classes",
          changeType: "neutral",
          icon: TrendingUp,
          color: "bg-purple-500"
        }
      ];
    }

    const attendanceChange = dashboardStats.attendancePercentage >= 75
      ? 'Good attendance'
      : dashboardStats.attendancePercentage >= 50
      ? 'Needs improvement'
      : 'Low attendance';

    const attendanceType = dashboardStats.attendancePercentage >= 75
      ? 'positive'
      : dashboardStats.attendancePercentage >= 50
      ? 'neutral'
      : 'negative';

    return [
      {
        title: "Active Courses",
        value: dashboardStats.activeCourses.toString(),
        change: course ? course.name : "No course assigned",
        changeType: dashboardStats.activeCourses > 0 ? "positive" : "neutral",
        icon: BookOpen,
        color: "bg-blue-500"
      },
      {
        title: "Achievements",
        value: dashboardStats.achievements.toString(),
        change: "Keep learning!",
        changeType: "neutral",
        icon: Trophy,
        color: "bg-yellow-500"
      },
      {
        title: "Attendance",
        value: `${dashboardStats.attendancePercentage}%`,
        change: `${dashboardStats.presentDays}/${dashboardStats.totalClasses} days`,
        changeType: attendanceType,
        icon: Clock,
        color: "bg-green-500"
      },
      {
        title: "Overall Progress",
        value: `${dashboardStats.overallProgress}%`,
        change: attendanceChange,
        changeType: attendanceType,
        icon: TrendingUp,
        color: "bg-purple-500"
      }
    ];
  }, [dashboardStats, course, loading]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-purple-400 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon size={24} className="text-white" />
              </div>
              <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                stat.changeType === 'positive' 
                  ? 'text-green-700 bg-green-100' 
                  : stat.changeType === 'negative'
                  ? 'text-red-700 bg-red-100'
                  : 'text-gray-700 bg-gray-100'
              }`}>
                {stat.change}
              </div>
            </div>
            
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickStats;
