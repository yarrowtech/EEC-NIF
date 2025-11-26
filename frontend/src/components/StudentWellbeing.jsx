import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Heart, 
  Smile, 
  Frown, 
  Meh, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Star, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Plus,
  Edit3,
  Save
} from 'lucide-react';

const StudentWellbeing = () => {
  const [currentMood, setCurrentMood] = useState('');
  const [stressLevel, setStressLevel] = useState(5);
  const [socialEngagement, setSocialEngagement] = useState(5);
  const [behaviorChanges, setBehaviorChanges] = useState(false);
  const [notes, setNotes] = useState('');
  const [wellbeingHistory, setWellbeingHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // Mock data for student's wellbeing history
  useEffect(() => {
    const mockHistory = [
      {
        date: '2024-01-15',
        mood: 'good',
        stressLevel: 4,
        socialEngagement: 7,
        notes: 'Feeling positive about upcoming exams'
      },
      {
        date: '2024-01-10',
        mood: 'neutral',
        stressLevel: 6,
        socialEngagement: 6,
        notes: 'Normal day, focused on assignments'
      },
      {
        date: '2024-01-05',
        mood: 'excellent',
        stressLevel: 3,
        socialEngagement: 8,
        notes: 'Great day! Enjoyed group project work'
      }
    ];
    setWellbeingHistory(mockHistory);
  }, []);

  const getMoodIcon = (mood) => {
    const moodConfig = {
      excellent: { icon: Smile, color: 'text-green-600', bg: 'bg-green-100' },
      good: { icon: Smile, color: 'text-blue-600', bg: 'bg-blue-100' },
      neutral: { icon: Meh, color: 'text-yellow-600', bg: 'bg-yellow-100' },
      concerning: { icon: Frown, color: 'text-orange-600', bg: 'bg-orange-100' },
      critical: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' }
    };
    return moodConfig[mood] || moodConfig.neutral;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      date: new Date().toISOString().split('T')[0],
      mood: currentMood,
      stressLevel,
      socialEngagement,
      behaviorChanges,
      notes
    };
    
    setWellbeingHistory([newEntry, ...wellbeingHistory]);
    
    // Reset form
    setCurrentMood('');
    setStressLevel(5);
    setSocialEngagement(5);
    setBehaviorChanges(false);
    setNotes('');
    setIsEditing(false);
    
    // Show success message (you can add toast notification here)
    console.log('Wellbeing entry saved:', newEntry);
  };

  const latestEntry = wellbeingHistory[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">My Wellbeing</h1>
          </div>
          <p className="text-gray-600">Track your emotional wellbeing and mental health journey</p>
        </div>

        {/* Current Status Overview */}
        {latestEntry && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-purple-600" />
              Current Wellbeing Status
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                {(() => {
                  const moodConfig = getMoodIcon(latestEntry.mood);
                  const MoodIcon = moodConfig.icon;
                  return (
                    <>
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${moodConfig.bg} mb-3`}>
                        <MoodIcon className={`w-8 h-8 ${moodConfig.color}`} />
                      </div>
                      <h3 className="font-medium text-gray-900">Current Mood</h3>
                      <p className={`text-sm font-medium ${moodConfig.color}`}>
                        {latestEntry.mood.charAt(0).toUpperCase() + latestEntry.mood.slice(1)}
                      </p>
                    </>
                  );
                })()}
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-3">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-medium text-gray-900">Stress Level</h3>
                <p className="text-sm font-medium text-orange-600">{latestEntry.stressLevel}/10</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-3">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900">Social Engagement</h3>
                <p className="text-sm font-medium text-blue-600">{latestEntry.socialEngagement}/10</p>
              </div>
            </div>
            
            {latestEntry.notes && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Latest note:</span> {latestEntry.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Wellbeing Check-in Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-600" />
              Daily Check-in
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Edit3 size={16} />
                New Entry
              </button>
            )}
          </div>

          {isEditing && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How are you feeling today?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {['excellent', 'good', 'neutral', 'concerning', 'critical'].map((mood) => {
                    const moodConfig = getMoodIcon(mood);
                    const MoodIcon = moodConfig.icon;
                    return (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => setCurrentMood(mood)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          currentMood === mood
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className={`w-8 h-8 mx-auto mb-2 rounded-full ${moodConfig.bg} flex items-center justify-center`}>
                          <MoodIcon className={`w-5 h-5 ${moodConfig.color}`} />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {mood.charAt(0).toUpperCase() + mood.slice(1)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stress Level: {stressLevel}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low Stress</span>
                  <span>High Stress</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Engagement: {socialEngagement}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={socialEngagement}
                  onChange={(e) => setSocialEngagement(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low Engagement</span>
                  <span>High Engagement</span>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="behaviorChanges"
                  checked={behaviorChanges}
                  onChange={(e) => setBehaviorChanges(e.target.checked)}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                />
                <label htmlFor="behaviorChanges" className="ml-2 text-sm text-gray-700">
                  I've noticed changes in my behavior or mood patterns
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="How was your day? Any thoughts or feelings you'd like to note..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!currentMood}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save Check-in
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Wellbeing History */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Wellbeing History
          </h2>
          
          {wellbeingHistory.length > 0 ? (
            <div className="space-y-4">
              {wellbeingHistory.map((entry, index) => {
                const moodConfig = getMoodIcon(entry.mood);
                const MoodIcon = moodConfig.icon;
                
                return (
                  <div key={index} className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-full ${moodConfig.bg} flex items-center justify-center flex-shrink-0`}>
                      <MoodIcon className={`w-5 h-5 ${moodConfig.color}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${moodConfig.bg} ${moodConfig.color}`}>
                            {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{entry.date}</span>
                      </div>
                      
                      <div className="flex gap-4 text-sm text-gray-600 mb-2">
                        <span>Stress: {entry.stressLevel}/10</span>
                        <span>Social: {entry.socialEngagement}/10</span>
                      </div>
                      
                      {entry.notes && (
                        <p className="text-sm text-gray-700">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No wellbeing entries yet. Start your first check-in!</p>
            </div>
          )}
        </div>

        {/* Support Resources */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-600" />
            Support & Resources
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <MessageCircle className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">Counseling Services</h3>
              <p className="text-sm text-gray-600 mb-3">Talk to our professional counselors</p>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                Schedule Session →
              </button>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <Users className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">Peer Support</h3>
              <p className="text-sm text-gray-600 mb-3">Connect with other students</p>
              <button className="text-green-600 text-sm font-medium hover:text-green-700">
                Join Groups →
              </button>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <Heart className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">Mental Health Tips</h3>
              <p className="text-sm text-gray-600 mb-3">Learn coping strategies</p>
              <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                View Resources →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentWellbeing;