import React from 'react';
import { Award, Medal, Trophy, Download, Calendar, Star } from 'lucide-react';

const AchievementsView = () => {
  const achievementsData = {
    studentName: "Koushik Bala",
    class: "10-A",
    totalAwards: 12,
    recentAchievements: 3,
    achievements: [
      {
        id: 1,
        title: "First Place - Science Fair",
        category: "Academic",
        date: "2024-02-15",
        description: "Won first place for innovative project on renewable energy",
        awardType: "Gold Medal",
        issuer: "State Science Association"
      },
      {
        id: 2,
        title: "Best Speaker Award",
        category: "Extra-Curricular",
        date: "2024-01-20",
        description: "Recognized for outstanding performance in inter-school debate competition",
        awardType: "Trophy",
        issuer: "Regional Education Board"
      },
      {
        id: 3,
        title: "Academic Excellence",
        category: "Academic",
        date: "2023-12-15",
        description: "Achieved highest grades in Mathematics and Science",
        awardType: "Certificate",
        issuer: "School Administration"
      }
    ]
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Academic':
        return <Medal className="w-5 h-5" />;
      case 'Extra-Curricular':
        return <Trophy className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Achievements</h1>
        <p className="text-yellow-100 text-sm sm:text-base">View your child's achievements and awards</p>
      </div>

      {/* Student Info & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-4">Student Info</h3>
          <div className="space-y-1 sm:space-y-2">
            <p className="text-gray-600 text-sm sm:text-base">Name: {achievementsData.studentName}</p>
            <p className="text-gray-600 text-sm sm:text-base">Class: {achievementsData.class}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-xl sm:text-2xl font-bold text-yellow-600">{achievementsData.totalAwards}</h3>
          <p className="text-gray-600 text-sm sm:text-base">Total Awards</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-xl sm:text-2xl font-bold text-blue-600">{achievementsData.recentAchievements}</h3>
          <p className="text-gray-600 text-sm sm:text-base">Recent Achievements</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm flex items-center justify-center">
          <button className="w-full flex items-center justify-center space-x-2 bg-yellow-500 text-black px-3 sm:px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-xs sm:text-sm">
            <Download className="w-4 h-4" />
            <span>Download Certificates</span>
          </button>
        </div>
      </div>

      {/* Achievements List */}
      <div className="space-y-4 sm:space-y-6">
        {achievementsData.achievements.map((achievement) => (
          <div key={achievement.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(achievement.category)}
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">{achievement.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(achievement.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  achievement.category === 'Academic' 
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {achievement.category}
                </span>
              </div>

              <p className="mt-2 sm:mt-4 text-gray-600 text-sm sm:text-base">{achievement.description}</p>

              <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm gap-2 sm:gap-0">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-600">{achievement.awardType}</span>
                </div>
                <span className="text-gray-500">Issued by: {achievement.issuer}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsView;