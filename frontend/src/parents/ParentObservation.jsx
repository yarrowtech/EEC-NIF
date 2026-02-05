import React, { useState, useEffect } from 'react';
import { Eye, Calendar, TrendingUp, AlertCircle, Clock, User, CheckCircle } from 'lucide-react';

const ParentObservation = () => {
  const [observations, setObservations] = useState([]);
  const [observationData, setObservationData] = useState({
    childName: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    observation: '',
    moodRating: null,
    behaviorNotes: '',
    concernLevel: 'low'
  });
  const [submitted, setSubmitted] = useState(false);

  const children = [
    { id: 1, name: 'Emma Johnson', class: 'Grade 5A', image: '/api/placeholder/32/32' },
    { id: 2, name: 'Liam Johnson', class: 'Grade 3B', image: '/api/placeholder/32/32' }
  ];

  const categories = [
    'Academic Performance',
    'Social Interaction',
    'Emotional Wellbeing',
    'Behavioral Changes',
    'Physical Health',
    'Sleep Patterns',
    'Eating Habits',
    'Communication'
  ];

  const moodEmojis = [
    { emoji: '😊', label: 'Very Happy', value: 5 },
    { emoji: '🙂', label: 'Happy', value: 4 },
    { emoji: '😐', label: 'Neutral', value: 3 },
    { emoji: '😕', label: 'Sad', value: 2 },
    { emoji: '😟', label: 'Very Sad', value: 1 }
  ];

  const concernLevels = [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'high', label: 'High', color: 'red' }
  ];

  useEffect(() => {
    const sampleObservations = [
      {
        id: 1,
        childName: 'Emma Johnson',
        date: '2024-01-15',
        category: 'Academic Performance',
        observation: 'Emma showed great enthusiasm during math class today. She completed her homework early and helped classmates.',
        moodRating: 5,
        behaviorNotes: 'Very positive attitude towards learning',
        concernLevel: 'low',
        timestamp: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        childName: 'Emma Johnson',
        date: '2024-01-14',
        category: 'Social Interaction',
        observation: 'Emma seemed withdrawn during lunch break. She didn\'t interact much with her usual friend group.',
        moodRating: 2,
        behaviorNotes: 'Less social than usual, preferred to read alone',
        concernLevel: 'medium',
        timestamp: '2024-01-14T12:15:00Z'
      }
    ];
    setObservations(sampleObservations);
  }, []);

  const handleInputChange = (field, value) => {
    setObservationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newObservation = {
      ...observationData,
      id: observations.length + 1,
      timestamp: new Date().toISOString()
    };
    
    setObservations(prev => [newObservation, ...prev]);
    setSubmitted(true);
    
    // Reset form
    setObservationData({
      childName: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      observation: '',
      moodRating: null,
      behaviorNotes: '',
      concernLevel: 'low'
    });

    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  const isFormValid = () => {
    return observationData.childName && 
           observationData.category && 
           observationData.observation && 
           observationData.moodRating !== null;
  };

  const getConcernColor = (level) => {
    switch(level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6">
      <div className="w-full px-3 sm:px-3 md:px-4 lg:px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Parent Observation Portal</h1>
              <p className="text-gray-600">Track and record your child's daily observations</p>
            </div>
          </div>
        </div>

        {submitted && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">Observation recorded successfully!</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New Observation Form */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Record New Observation
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Child Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Child
                </label>
                <select
                  value={observationData.childName}
                  onChange={(e) => handleInputChange('childName', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a child</option>
                  {children.map(child => (
                    <option key={child.id} value={child.name}>
                      {child.name} - {child.class}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={observationData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={observationData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Mood Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Child's Mood
                </label>
                <div className="flex justify-center space-x-4">
                  {moodEmojis.map(mood => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => handleInputChange('moodRating', mood.value)}
                      className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                        observationData.moodRating === mood.value
                          ? 'bg-blue-100 border-2 border-blue-400'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <span className="text-2xl mb-1">{mood.emoji}</span>
                      <span className="text-xs text-gray-600">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Observation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observation Details
                </label>
                <textarea
                  value={observationData.observation}
                  onChange={(e) => handleInputChange('observation', e.target.value)}
                  placeholder="Describe what you observed about your child today..."
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Behavior Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={observationData.behaviorNotes}
                  onChange={(e) => handleInputChange('behaviorNotes', e.target.value)}
                  placeholder="Any additional behavioral notes or context..."
                  rows="2"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Concern Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Concern Level
                </label>
                <div className="flex space-x-4">
                  {concernLevels.map(level => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => handleInputChange('concernLevel', level.value)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        observationData.concernLevel === level.value
                          ? `bg-${level.color}-100 border-${level.color}-400 text-${level.color}-700`
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!isFormValid()}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isFormValid()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Record Observation
              </button>
            </form>
          </div>

          {/* Recent Observations */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Recent Observations
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {observations.map(obs => (
                  <div key={obs.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{obs.childName}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConcernColor(obs.concernLevel)}`}>
                          {obs.concernLevel.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{obs.date}</span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <span className="text-sm font-medium text-blue-600">{obs.category}</span>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-2">{obs.observation}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Mood:</span>
                        <span className="text-lg">
                          {moodEmojis.find(m => m.value === obs.moodRating)?.emoji}
                        </span>
                      </div>
                      
                      {obs.behaviorNotes && (
                        <div className="text-xs text-gray-500 max-w-xs truncate">
                          Notes: {obs.behaviorNotes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentObservation;
