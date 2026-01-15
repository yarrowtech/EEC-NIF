import React, { useState, useEffect } from 'react';
import { BookOpen, Trophy, Clock, TrendingUp } from 'lucide-react';

const QuickStats = () => {
  const [stats, setStats] = useState([
    {
      title: "Active Courses",
      value: "0",
      change: "Loading...",
      changeType: "neutral",
      icon: BookOpen,
      color: "bg-blue-500"
    },
    {
      title: "Achievements",
      value: "0",
      change: "Loading...",
      changeType: "neutral",
      icon: Trophy,
      color: "bg-yellow-500"
    },
    {
      title: "Attendance",
      value: "0%",
      change: "Loading...",
      changeType: "neutral",
      icon: Clock,
      color: "bg-green-500"
    },
    {
      title: "Overall Progress",
      value: "0%",
      change: "Loading...",
      changeType: "neutral",
      icon: TrendingUp,
      color: "bg-purple-500"
    }
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');

        if (!token || userType !== 'Student') return;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/student/auth/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Dashboard data received:', data);

          const attendanceChange = data.stats.attendancePercentage >= 75
            ? 'Good attendance'
            : data.stats.attendancePercentage >= 50
            ? 'Needs improvement'
            : 'Low attendance';

          const attendanceType = data.stats.attendancePercentage >= 75
            ? 'positive'
            : data.stats.attendancePercentage >= 50
            ? 'neutral'
            : 'negative';

          setStats([
            {
              title: "Active Courses",
              value: data.stats.activeCourses.toString(),
              change: data.course ? data.course.name : "No course assigned",
              changeType: data.stats.activeCourses > 0 ? "positive" : "neutral",
              icon: BookOpen,
              color: "bg-blue-500"
            },
            {
              title: "Achievements",
              value: data.stats.achievements.toString(),
              change: "Keep learning!",
              changeType: "neutral",
              icon: Trophy,
              color: "bg-yellow-500"
            },
            {
              title: "Attendance",
              value: `${data.stats.attendancePercentage}%`,
              change: `${data.stats.presentDays}/${data.stats.totalClasses} days`,
              changeType: attendanceType,
              icon: Clock,
              color: "bg-green-500"
            },
            {
              title: "Overall Progress",
              value: `${data.stats.overallProgress}%`,
              change: attendanceChange,
              changeType: attendanceType,
              icon: TrendingUp,
              color: "bg-purple-500"
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

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