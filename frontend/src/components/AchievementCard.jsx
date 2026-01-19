import React, { useEffect, useMemo, useState } from 'react';
import { Award, Lock, Star, RefreshCcw, AlertCircle } from 'lucide-react';

const milestoneDefinitions = [
  {
    id: 'attendance-75',
    title: 'Attendance Star',
    description: 'Maintain attendance above 75%.',
    icon: '🌟',
    points: 120,
    target: 75,
    metric: (stats) => stats.attendancePercentage || 0,
    unit: '%'
  },
  {
    id: 'attendance-90',
    title: 'Consistency Champ',
    description: 'Keep attendance at 90% or higher.',
    icon: '🔥',
    points: 200,
    target: 90,
    metric: (stats) => stats.attendancePercentage || 0,
    unit: '%'
  },
  {
    id: 'streak-5',
    title: 'Presence Streak',
    description: 'Attend 5 classes in a row.',
    icon: '📆',
    points: 150,
    target: 5,
    metric: (_stats, context) => context.attendanceStreak,
    unit: 'days'
  },
  {
    id: 'present-20',
    title: 'On-Time Hero',
    description: 'Be present for 20 classes.',
    icon: '✅',
    points: 180,
    target: 20,
    metric: (stats) => stats.presentDays || 0,
    unit: 'classes'
  },
  {
    id: 'course-active',
    title: 'Course Explorer',
    description: 'Enroll in an active course.',
    icon: '📚',
    points: 100,
    target: 1,
    metric: (stats) => stats.activeCourses || 0,
    unit: 'course'
  }
];

const AchievementCard = () => {
  const [achievements, setAchievements] = useState({ earned: [], upcoming: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');

        if (!token || userType !== 'Student') {
          setLoading(false);
          setAchievements({ earned: [], upcoming: [] });
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/student/auth/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Unable to load dashboard achievements');
        }

        const data = await response.json();
        const streak = calculateAttendanceStreak(data.recentAttendance || []);
        const computed = buildAchievements(data.stats || {}, streak);

        setAchievements({
          earned: computed.filter(item => item.earned),
          upcoming: computed.filter(item => !item.earned)
        });
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Failed to load achievements:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const earnedCount = achievements.earned.length;
  const totalMilestones = useMemo(() => milestoneDefinitions.length, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-24 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
        <div className="flex items-center space-x-3 text-red-600">
          <AlertCircle size={20} />
          <p className="font-medium">Unable to load achievements right now.</p>
        </div>
        <p className="text-sm text-gray-500 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="text-yellow-500" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Achievements</h2>
          </div>
          <div className="text-sm text-gray-500 flex items-center space-x-2">
            <span>{earnedCount} of {totalMilestones} earned</span>
            {lastUpdated && (
              <span className="inline-flex items-center text-xs text-gray-400">
                <RefreshCcw size={12} className="mr-1" />
                Updated {lastUpdated.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Earned Achievements */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <Star className="text-yellow-500" size={20} />
            <span>Recent Achievements</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.earned.length === 0 && (
              <div className="col-span-full text-sm text-gray-500">
                No milestones unlocked yet. Keep progressing!
              </div>
            )}
            {achievements.earned.slice(0, 4).map((achievement) => (
              <div key={achievement.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Award size={14} className="text-white" />
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{achievement.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                        +{achievement.points} points
                      </span>
                      <span className="text-xs text-gray-500">
                        {achievement.achievedOn ? new Date(achievement.achievedOn).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Achievements */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <Lock className="text-gray-400" size={20} />
            <span>Upcoming Achievements</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.upcoming.length === 0 && (
              <div className="col-span-full text-sm text-gray-500">
                You're all caught up. New goals will appear here soon.
              </div>
            )}
            {achievements.upcoming.map((achievement) => (
              <div key={achievement.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <Lock size={14} className="text-white" />
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{achievement.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${achievement.progress}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                        +{achievement.points} points
                      </span>
                      <span className="text-xs text-gray-500">
                        {achievement.currentValue}{achievement.unit ? ` / ${achievement.target} ${achievement.unit}` : ''}
                      </span>
                    </div>
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

export default AchievementCard;

function calculateAttendanceStreak(attendance = []) {
  if (!attendance.length) return 0;
  // Assume attendance sorted newest last in DB, ensure descending
  const sorted = [...attendance].sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 0;
  const today = new Date();
  let cursor = new Date(sorted[0]?.date || today);

  for (const record of sorted) {
    const recordDate = new Date(record.date);
    if (record.status !== 'present') {
      if (recordDate.toDateString() === cursor.toDateString()) {
        break;
      }
      break;
    }

    if (streak === 0) {
      streak = 1;
      cursor = recordDate;
      continue;
    }

    const expected = new Date(cursor);
    expected.setDate(expected.getDate() - 1);

    if (recordDate.toDateString() === expected.toDateString()) {
      streak += 1;
      cursor = recordDate;
    } else {
      break;
    }
  }

  return streak;
}

function buildAchievements(stats, attendanceStreak) {
  return milestoneDefinitions.map((milestone) => {
    const currentValue = milestone.metric(stats, { attendanceStreak }) || 0;
    const earned = currentValue >= milestone.target;
    const progress = milestone.target
      ? Math.min(100, Math.round((currentValue / milestone.target) * 100))
      : earned ? 100 : 0;

    return {
      ...milestone,
      earned,
      progress,
      currentValue,
      target: milestone.target,
      achievedOn: earned ? new Date().toISOString() : null
    };
  });
}
