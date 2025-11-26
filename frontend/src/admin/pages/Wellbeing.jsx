import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  MoreVertical, 
  Heart, 
  AlertCircle, 
  CheckCircle, 
  Calendar, 
  Smile, 
  Frown, 
  Meh, 
  TrendingUp, 
  Brain, 
  Users, 
  MessageCircle, 
  Star, 
  X,
  Filter
} from 'lucide-react';

const Wellbeing = ({ setShowAdminHeader }) => {
  const [studentData, setStudentData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showWellbeingModal, setShowWellbeingModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [wellbeingData, setWellbeingData] = useState({});
  const [filterStatus, setFilterStatus] = useState('');

  const filteredStudents = studentData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll.includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!filterStatus) return matchesSearch;
    
    const wellbeing = getWellbeingStatus(student.id);
    return matchesSearch && wellbeing.mood === filterStatus;
  });

  // Emotional Wellbeing Functions
  const getWellbeingStatus = (studentId) => {
    if (!wellbeingData[studentId]) {
      // Initialize with random data for demo
      const moods = ['excellent', 'good', 'neutral', 'concerning', 'critical'];
      const mood = moods[Math.floor(Math.random() * moods.length)];
      const socialEngagement = Math.floor(Math.random() * 10) + 1;
      const academicStress = Math.floor(Math.random() * 10) + 1;
      const behaviorChanges = Math.random() > 0.7;
      
      setWellbeingData(prev => ({
        ...prev,
        [studentId]: {
          mood,
          socialEngagement,
          academicStress,
          behaviorChanges,
          lastAssessment: new Date().toISOString().split('T')[0],
          notes: '',
          interventions: [],
          counselingSessions: Math.floor(Math.random() * 5),
          parentNotifications: Math.floor(Math.random() * 3)
        }
      }));
      return { mood, socialEngagement, academicStress, behaviorChanges };
    }
    return wellbeingData[studentId];
  };

  const getMoodIcon = (mood) => {
    const moodIcons = {
      excellent: { icon: Smile, color: 'text-green-600', bg: 'bg-green-100' },
      good: { icon: Smile, color: 'text-blue-600', bg: 'bg-blue-100' },
      neutral: { icon: Meh, color: 'text-yellow-600', bg: 'bg-yellow-100' },
      concerning: { icon: Frown, color: 'text-orange-600', bg: 'bg-orange-100' },
      critical: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' }
    };
    return moodIcons[mood] || moodIcons.neutral;
  };

  const updateWellbeingData = (studentId, updates) => {
    setWellbeingData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        ...updates,
        lastAssessment: new Date().toISOString().split('T')[0]
      }
    }));
  };

  const openWellbeingModal = (student) => {
    console.log('Opening wellbeing modal for student:', student);
    setSelectedStudent(student);
    setShowWellbeingModal(true);
  };

  // Fetch students data
  useEffect(() => {
    setShowAdminHeader(true);
    
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/get-students`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch students');
      }
      return res.json();
    })
    .then(data => {
      setStudentData(data);
    })
    .catch(err => {
      console.error('Error fetching students:', err);
    });
  }, [setShowAdminHeader]);

  // Calculate wellbeing statistics
  const wellbeingStats = {
    total: studentData.length,
    excellent: studentData.filter(s => getWellbeingStatus(s.id).mood === 'excellent').length,
    good: studentData.filter(s => getWellbeingStatus(s.id).mood === 'good').length,
    neutral: studentData.filter(s => getWellbeingStatus(s.id).mood === 'neutral').length,
    concerning: studentData.filter(s => getWellbeingStatus(s.id).mood === 'concerning').length,
    critical: studentData.filter(s => getWellbeingStatus(s.id).mood === 'critical').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto bg-white/90 rounded-2xl shadow-2xl p-8 border border-purple-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-purple-700">Student Wellbeing Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor and assess student emotional wellbeing and mental health</p>
          </div>
          <div className="flex items-center space-x-4">
            <Brain className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">Total Students</h3>
                <p className="text-2xl font-bold text-gray-900">{wellbeingStats.total}</p>
              </div>
              <Users className="w-8 h-8 text-gray-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">Excellent</h3>
                <p className="text-2xl font-bold text-green-600">{wellbeingStats.excellent}</p>
              </div>
              <Smile className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">Good</h3>
                <p className="text-2xl font-bold text-blue-600">{wellbeingStats.good}</p>
              </div>
              <Smile className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">Neutral</h3>
                <p className="text-2xl font-bold text-yellow-600">{wellbeingStats.neutral}</p>
              </div>
              <Meh className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">Concerning</h3>
                <p className="text-2xl font-bold text-orange-600">{wellbeingStats.concerning}</p>
              </div>
              <Frown className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">Critical</h3>
                <p className="text-2xl font-bold text-red-600">{wellbeingStats.critical}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[240px] relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select 
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Wellbeing Status</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="neutral">Neutral</option>
              <option value="concerning">Concerning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => {
            const wellbeing = getWellbeingStatus(student.id);
            const moodConfig = getMoodIcon(wellbeing.mood);
            const Icon = moodConfig.icon;
            
            return (
              <div
                key={student.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 cursor-pointer"
                onClick={() => openWellbeingModal(student)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-500">Roll: {student.roll}</p>
                    </div>
                  </div>
                  <div className={`p-2 rounded-full ${moodConfig.bg}`}>
                    <Icon size={20} className={moodConfig.color} />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overall Mood</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${moodConfig.bg} ${moodConfig.color}`}>
                      {wellbeing.mood.charAt(0).toUpperCase() + wellbeing.mood.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Academic Stress</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${wellbeing.academicStress > 7 ? 'bg-red-500' : wellbeing.academicStress > 4 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${(wellbeing.academicStress / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{wellbeing.academicStress}/10</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Social Engagement</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${(wellbeing.socialEngagement / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{wellbeing.socialEngagement}/10</span>
                    </div>
                  </div>
                  
                  {wellbeing.behaviorChanges && (
                    <div className="flex items-center gap-2 text-orange-600 text-sm">
                      <AlertCircle size={16} />
                      <span>Behavior changes noted</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                    <span>Last assessment: {wellbeing.lastAssessment}</span>
                    <span>Sessions: {wellbeing.counselingSessions}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Wellbeing Assessment Modal */}
        {showWellbeingModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Emotional Wellbeing Assessment</h2>
                    <p className="text-gray-600 mt-1">
                      {selectedStudent.name} • Roll: {selectedStudent.roll} • Class: {selectedStudent.grade}-{selectedStudent.section}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowWellbeingModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Current Status Overview */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(() => {
                      const wellbeing = getWellbeingStatus(selectedStudent.id);
                      const moodConfig = getMoodIcon(wellbeing.mood);
                      const MoodIcon = moodConfig.icon;
                      return (
                        <>
                          <div className="text-center">
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${moodConfig.bg} mb-2`}>
                              <MoodIcon className={`w-8 h-8 ${moodConfig.color}`} />
                            </div>
                            <h4 className="font-medium text-gray-900">Overall Mood</h4>
                            <p className={`text-sm font-medium ${moodConfig.color}`}>
                              {wellbeing.mood.charAt(0).toUpperCase() + wellbeing.mood.slice(1)}
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-2">
                              <Users className="w-8 h-8 text-blue-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">Social Engagement</h4>
                            <p className="text-sm font-medium text-blue-600">{wellbeing.socialEngagement}/10</p>
                          </div>
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-2">
                              <TrendingUp className="w-8 h-8 text-orange-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">Academic Stress</h4>
                            <p className="text-sm font-medium text-orange-600">{wellbeing.academicStress}/10</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Assessment Form */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Assessment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mood Rating</label>
                      <select 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={wellbeingData[selectedStudent.id]?.mood || 'neutral'}
                        onChange={(e) => updateWellbeingData(selectedStudent.id, { mood: e.target.value })}
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="neutral">Neutral</option>
                        <option value="concerning">Concerning</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Social Engagement (1-10)</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        className="w-full"
                        value={wellbeingData[selectedStudent.id]?.socialEngagement || 5}
                        onChange={(e) => updateWellbeingData(selectedStudent.id, { socialEngagement: parseInt(e.target.value) })}
                      />
                      <div className="text-center text-sm text-gray-600 mt-1">
                        {wellbeingData[selectedStudent.id]?.socialEngagement || 5}/10
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Academic Stress (1-10)</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        className="w-full"
                        value={wellbeingData[selectedStudent.id]?.academicStress || 5}
                        onChange={(e) => updateWellbeingData(selectedStudent.id, { academicStress: parseInt(e.target.value) })}
                      />
                      <div className="text-center text-sm text-gray-600 mt-1">
                        {wellbeingData[selectedStudent.id]?.academicStress || 5}/10
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="behaviorChanges"
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                        checked={wellbeingData[selectedStudent.id]?.behaviorChanges || false}
                        onChange={(e) => updateWellbeingData(selectedStudent.id, { behaviorChanges: e.target.checked })}
                      />
                      <label htmlFor="behaviorChanges" className="ml-2 text-sm text-gray-700">
                        Behavior changes observed
                      </label>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows="3"
                      placeholder="Add any observations, concerns, or notes..."
                      value={wellbeingData[selectedStudent.id]?.notes || ''}
                      onChange={(e) => updateWellbeingData(selectedStudent.id, { notes: e.target.value })}
                    />
                  </div>
                </div>

                {/* Support Actions */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Support & Interventions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-medium text-gray-900">Counseling Sessions</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {wellbeingData[selectedStudent.id]?.counselingSessions || 0}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <Users className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <h4 className="font-medium text-gray-900">Parent Meetings</h4>
                      <p className="text-2xl font-bold text-yellow-600">
                        {wellbeingData[selectedStudent.id]?.parentNotifications || 0}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-medium text-gray-900">Interventions</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {wellbeingData[selectedStudent.id]?.interventions?.length || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                      <MessageCircle size={16} />
                      Schedule Counseling
                    </button>
                    <button className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-2">
                      <Users size={16} />
                      Notify Parents
                    </button>
                    <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                      <Star size={16} />
                      Add Intervention
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowWellbeingModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Save Assessment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wellbeing;