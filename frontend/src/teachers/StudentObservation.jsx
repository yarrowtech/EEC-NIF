import React, { useState } from 'react';
import { 
  Eye, 
  Calendar, 
  User, 
  Heart, 
  Brain, 
  Save, 
  Plus, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
  TrendingUp,
  Activity
} from 'lucide-react';

const StudentObservation = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [observations, setObservations] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const classes = ['Class 5A', 'Class 5B', 'Class 6A', 'Class 6B', 'Class 7A', 'Class 7B'];
  
  const students = [
    { id: 1, name: 'Emma Johnson', class: 'Class 5A', rollNo: '001' },
    { id: 2, name: 'Liam Smith', class: 'Class 5A', rollNo: '002' },
    { id: 3, name: 'Sophia Brown', class: 'Class 5A', rollNo: '003' },
    { id: 4, name: 'Noah Davis', class: 'Class 5B', rollNo: '004' },
    { id: 5, name: 'Olivia Wilson', class: 'Class 5B', rollNo: '005' },
    { id: 6, name: 'Mason Taylor', class: 'Class 6A', rollNo: '006' }
  ];

  const healthCategories = [
    'Physical Symptoms',
    'Energy Level',
    'Appetite',
    'Sleep Quality',
    'Physical Activity',
    'Injury/Illness',
    'Hygiene',
    'General Wellness'
  ];

  const emotionCategories = [
    'Mood',
    'Social Interaction',
    'Academic Engagement',
    'Behavior',
    'Attention/Focus',
    'Stress Level',
    'Confidence',
    'Communication'
  ];

  const healthOptions = {
    'Physical Symptoms': ['None', 'Headache', 'Stomach ache', 'Fatigue', 'Cough/Cold', 'Fever', 'Other'],
    'Energy Level': ['Very High', 'High', 'Normal', 'Low', 'Very Low'],
    'Appetite': ['Excellent', 'Good', 'Normal', 'Poor', 'Very Poor'],
    'Sleep Quality': ['Well Rested', 'Slightly Tired', 'Tired', 'Very Tired', 'Exhausted'],
    'Physical Activity': ['Very Active', 'Active', 'Moderate', 'Less Active', 'Inactive'],
    'Injury/Illness': ['None', 'Minor Injury', 'Illness', 'Chronic Condition', 'Medication Needed'],
    'Hygiene': ['Excellent', 'Good', 'Acceptable', 'Needs Attention', 'Poor'],
    'General Wellness': ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor']
  };

  const emotionOptions = {
    'Mood': ['Very Happy', 'Happy', 'Content', 'Neutral', 'Sad', 'Very Sad', 'Irritable'],
    'Social Interaction': ['Very Social', 'Social', 'Moderate', 'Withdrawn', 'Isolated'],
    'Academic Engagement': ['Highly Engaged', 'Engaged', 'Moderate', 'Disengaged', 'Completely Disengaged'],
    'Behavior': ['Excellent', 'Good', 'Acceptable', 'Challenging', 'Concerning'],
    'Attention/Focus': ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor'],
    'Stress Level': ['No Stress', 'Low', 'Moderate', 'High', 'Very High'],
    'Confidence': ['Very Confident', 'Confident', 'Moderate', 'Low Confidence', 'Very Low'],
    'Communication': ['Excellent', 'Good', 'Average', 'Limited', 'Concerning']
  };

  const [observationForm, setObservationForm] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    healthObservations: {},
    emotionObservations: {},
    additionalNotes: '',
    urgencyLevel: 'normal',
    followUpRequired: false,
    parentNotification: false
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNo.includes(searchTerm);
    const matchesClass = selectedClass === '' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleObservationChange = (type, category, value) => {
    setObservationForm(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [category]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newObservation = {
      ...observationForm,
      id: observations.length + 1,
      timestamp: new Date().toISOString(),
      studentName: students.find(s => s.id === parseInt(observationForm.studentId))?.name || ''
    };
    
    setObservations(prev => [newObservation, ...prev]);
    setSubmitted(true);
    
    // Reset form
    setObservationForm({
      studentId: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      healthObservations: {},
      emotionObservations: {},
      additionalNotes: '',
      urgencyLevel: 'normal',
      followUpRequired: false,
      parentNotification: false
    });

    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  const getUrgencyColor = (level) => {
    switch(level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'high': return 'text-yellow-600 bg-yellow-100';
      case 'urgent': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthScore = (observations) => {
    const scores = Object.values(observations).map(value => {
      if (typeof value === 'string') {
        if (value.includes('Excellent') || value.includes('Very High') || value.includes('Very Good')) return 5;
        if (value.includes('Good') || value.includes('High') || value.includes('Normal')) return 4;
        if (value.includes('Moderate') || value.includes('Acceptable') || value.includes('Average')) return 3;
        if (value.includes('Poor') || value.includes('Low') || value.includes('Challenging')) return 2;
        if (value.includes('Very Poor') || value.includes('Very Low') || value.includes('Concerning')) return 1;
      }
      return 3;
    });
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Health & Emotion Observation</h1>
              <p className="text-gray-600">Record daily observations of student physical health and emotional wellbeing</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Observation Form */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                New Observation Entry
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Student and Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Student
                  </label>
                  <select
                    value={observationForm.studentId}
                    onChange={(e) => setObservationForm(prev => ({...prev, studentId: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Choose a student</option>
                    {filteredStudents.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} - {student.rollNo} ({student.class})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={observationForm.date}
                    onChange={(e) => setObservationForm(prev => ({...prev, date: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={observationForm.time}
                    onChange={(e) => setObservationForm(prev => ({...prev, time: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Health Observations */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Physical Health Observations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {healthCategories.map(category => (
                    <div key={category}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {category}
                      </label>
                      <select
                        value={observationForm.healthObservations[category] || ''}
                        onChange={(e) => handleObservationChange('healthObservations', category, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select option</option>
                        {healthOptions[category].map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emotion Observations */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-500" />
                  Emotional & Behavioral Observations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {emotionCategories.map(category => (
                    <div key={category}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {category}
                      </label>
                      <select
                        value={observationForm.emotionObservations[category] || ''}
                        onChange={(e) => handleObservationChange('emotionObservations', category, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select option</option>
                        {emotionOptions[category].map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Level
                  </label>
                  <select
                    value={observationForm.urgencyLevel}
                    onChange={(e) => setObservationForm(prev => ({...prev, urgencyLevel: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low - Routine observation</option>
                    <option value="normal">Normal - Standard monitoring</option>
                    <option value="high">High - Needs attention</option>
                    <option value="urgent">Urgent - Immediate action required</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="followUp"
                      checked={observationForm.followUpRequired}
                      onChange={(e) => setObservationForm(prev => ({...prev, followUpRequired: e.target.checked}))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="followUp" className="ml-2 text-sm text-gray-700">
                      Follow-up required
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="parentNotify"
                      checked={observationForm.parentNotification}
                      onChange={(e) => setObservationForm(prev => ({...prev, parentNotification: e.target.checked}))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="parentNotify" className="ml-2 text-sm text-gray-700">
                      Notify parents
                    </label>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes & Observations
                </label>
                <textarea
                  value={observationForm.additionalNotes}
                  onChange={(e) => setObservationForm(prev => ({...prev, additionalNotes: e.target.value}))}
                  placeholder="Add any additional observations, context, or specific details..."
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={!observationForm.studentId}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                  observationForm.studentId
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save className="w-5 h-5 mr-2" />
                Save Observation
              </button>
            </form>
          </div>

          {/* Student Search and Recent Observations */}
          <div className="space-y-6">
            {/* Student Filter */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Student Filter
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Classes</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Student</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Name or roll number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Observations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Recent Observations
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {observations.length > 0 ? observations.slice(0, 5).map(obs => (
                  <div key={obs.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900 text-sm">{obs.studentName}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(obs.urgencyLevel)}`}>
                          {obs.urgencyLevel.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{obs.date}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="text-xs">
                        <span className="text-gray-500">Health Score:</span>
                        <span className="ml-1 font-medium">{getHealthScore(obs.healthObservations)}/5</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Emotion Score:</span>
                        <span className="ml-1 font-medium">{getHealthScore(obs.emotionObservations)}/5</span>
                      </div>
                    </div>
                    
                    {obs.additionalNotes && (
                      <p className="text-xs text-gray-600 truncate">{obs.additionalNotes}</p>
                    )}
                    
                    <div className="flex items-center space-x-2 mt-2">
                      {obs.followUpRequired && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Follow-up</span>
                      )}
                      {obs.parentNotification && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Parent Notify</span>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6">
                    <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No observations recorded yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentObservation;