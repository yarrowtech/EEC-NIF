import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Trophy, Clock, TrendingUp, FileText } from 'lucide-react';
import { useStudentDashboard } from './StudentDashboardContext';

const QuickStats = () => {
  const { stats: dashboardStats, course, loading } = useStudentDashboard();
  const [assignmentSummary, setAssignmentSummary] = useState({
    total: 0,
    pending: 0,
    loading: false,
  });

  useEffect(() => {
    const activeCourses = dashboardStats?.activeCourses ?? 0;
    if (loading || activeCourses > 0) return;

    const fetchAssignments = async () => {
      try {
        setAssignmentSummary((prev) => ({ ...prev, loading: true }));
        const token = localStorage.getItem('token');
        if (!token) {
          setAssignmentSummary({ total: 0, pending: 0, loading: false });
          return;
        }
        const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
        const res = await fetch(`${API_BASE}/api/assignment/student/assignments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error('Failed to load assignments');
        }
        const data = await res.json();
        const assignmentsPayload = Array.isArray(data)
          ? data
          : Array.isArray(data?.assignments)
            ? data.assignments
            : [];
        const pendingCount = assignmentsPayload.filter((a) => a?.submissionStatus === 'not_submitted' || !a?.submissionStatus).length;
        const evaluatedCount = assignmentsPayload.filter((a) => a?.submissionStatus === 'graded').length;
        setAssignmentSummary({
          total: assignmentsPayload.length,
          pending: pendingCount,
          evaluated: evaluatedCount,
          loading: false,
        });
      } catch (err) {
        console.error('Assignments summary error:', err);
        setAssignmentSummary({ total: 0, pending: 0, evaluated: 0, loading: false });
      }
    };

    fetchAssignments();
  }, [dashboardStats, loading]);

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

    const baseStats = [
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

    if (dashboardStats.activeCourses === 0) {
      baseStats[0] = {
        title: "Assignments",
        value: assignmentSummary.loading ? "..." : assignmentSummary.total.toString(),
        change: assignmentSummary.loading
          ? "Loading..."
          : assignmentSummary.total > 0
            ? `Evaluated ${assignmentSummary.evaluated || 0}`
            : "No assignments",
        changeType: assignmentSummary.pending > 0 ? "neutral" : "positive",
        icon: FileText,
        color: "bg-blue-500"
      };
    }

    return baseStats;
  }, [dashboardStats, course, loading, assignmentSummary]);

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
