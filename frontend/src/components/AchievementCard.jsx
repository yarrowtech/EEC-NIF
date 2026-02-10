import React from 'react';
import { Award, AlertCircle } from 'lucide-react';

const AchievementCard = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100">
    <div className="p-6 border-b border-gray-100">
      <div className="flex items-center space-x-2">
        <Award className="text-yellow-500" size={24} />
        <h2 className="text-xl font-semibold text-gray-900">Achievements</h2>
      </div>
    </div>
    <div className="p-6">
      <div className="flex items-center space-x-3 text-gray-600">
        <AlertCircle size={20} />
        <p className="font-medium">No achievements yet.</p>
      </div>
      <p className="text-sm text-gray-500 mt-2">Achievements will appear here once available.</p>
    </div>
  </div>
);

export default AchievementCard;
