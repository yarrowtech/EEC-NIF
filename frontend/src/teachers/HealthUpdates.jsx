import React, { useState } from 'react';
import { Activity, Search, Plus, Calendar, AlertCircle, TrendingUp, User, Shield, Heart, FileText, Filter, ArrowLeft, Brain, Smile, Frown, Meh, Users, MessageCircle, Star } from 'lucide-react';

const HealthUpdates = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  
  const students = [
    {
      id: 1,
      name: "Koushik Bala",
      class: "10-A",
      healthStatus: "Good",
      lastUpdate: "2024-03-01",
      recentIssues: [],
      height: "165 cm",
      weight: "52 kg",
      bloodGroup: "B+",
      bmi: "19.1",
      allergies: ["None"],
      medications: ["None"],
      emergencyContact: "+1 (555) 123-4567",
      // Emotional Wellbeing Data
      emotionalWellbeing: {
        mood: "excellent",
        socialEngagement: 9,
        academicStress: 3,
        behaviorChanges: false,
        lastAssessment: "2024-03-01",
        notes: "Student shows excellent emotional stability and positive attitude towards learning.",
        counselingSessions: 0,
        parentNotifications: 0,
        interventions: [],
        supportActions: [
          { type: "Praise", date: "2024-02-28", description: "Recognized for helping classmates" },
          { type: "Peer Support", date: "2024-02-25", description: "Assigned as study buddy mentor" }
        ]
      }
    },
    {
      id: 2,
      name: "John Doe",
      class: "10-A",
      healthStatus: "Under Observation",
      lastUpdate: "2024-03-05",
      recentIssues: ["Mild Fever"],
      height: "170 cm",
      weight: "60 kg",
      bloodGroup: "O+",
      bmi: "20.8",
      allergies: ["Peanuts"],
      medications: ["Antihistamine"],
      emergencyContact: "+1 (555) 987-6543",
      // Emotional Wellbeing Data
      emotionalWellbeing: {
        mood: "concerning",
        socialEngagement: 4,
        academicStress: 8,
        behaviorChanges: true,
        lastAssessment: "2024-03-05",
        notes: "Student showing signs of academic pressure. Recommended for counseling support.",
        counselingSessions: 2,
        parentNotifications: 1,
        interventions: ["Academic Support", "Stress Management"],
        supportActions: [
          { type: "Counseling", date: "2024-03-03", description: "Individual session on exam anxiety" },
          { type: "Parent Meeting", date: "2024-03-01", description: "Discussed academic pressure concerns" }
        ]
      }
    },
    {
      id: 3,
      name: "Emma Johnson",
      class: "10-B",
      healthStatus: "Needs Attention",
      lastUpdate: "2024-03-03",
      recentIssues: ["Asthma", "Seasonal Allergies"],
      height: "158 cm",
      weight: "48 kg",
      bloodGroup: "A+",
      bmi: "19.2",
      allergies: ["Dust", "Pollen"],
      medications: ["Inhaler", "Antihistamine"],
      emergencyContact: "+1 (555) 456-7890",
      // Emotional Wellbeing Data
      emotionalWellbeing: {
        mood: "good",
        socialEngagement: 7,
        academicStress: 5,
        behaviorChanges: false,
        lastAssessment: "2024-03-03",
        notes: "Despite health challenges, student maintains positive outlook. Good peer relationships.",
        counselingSessions: 1,
        parentNotifications: 1,
        interventions: ["Health Support"],
        supportActions: [
          { type: "Health Counseling", date: "2024-03-02", description: "Discussed coping strategies for health conditions" },
          { type: "Accommodation", date: "2024-02-28", description: "Provided extra time during physical activities" }
        ]
      }
    },
    {
      id: 4,
      name: "Michael Brown",
      class: "10-B",
      healthStatus: "Good",
      lastUpdate: "2024-03-10",
      recentIssues: [],
      height: "175 cm",
      weight: "65 kg",
      bloodGroup: "AB+",
      bmi: "21.2",
      allergies: ["None"],
      medications: ["None"],
      emergencyContact: "+1 (555) 234-5678",
      // Emotional Wellbeing Data
      emotionalWellbeing: {
        mood: "neutral",
        socialEngagement: 6,
        academicStress: 6,
        behaviorChanges: false,
        lastAssessment: "2024-03-10",
        notes: "Student shows average engagement. Could benefit from more social activities.",
        counselingSessions: 0,
        parentNotifications: 0,
        interventions: [],
        supportActions: [
          { type: "Group Activity", date: "2024-03-08", description: "Participated in team building exercise" },
          { type: "Academic Support", date: "2024-03-05", description: "Extra help session for mathematics" }
        ]
      }
    }
  ];

  const [newUpdate, setNewUpdate] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Regular Checkup',
    findings: '',
    recommendations: '',
    status: 'Good'
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || student.class === filterClass;
    return matchesSearch && matchesClass;
  });

  const healthStats = {
    totalStudents: students.length,
    goodHealth: students.filter(s => s.healthStatus === 'Good').length,
    underObservation: students.filter(s => s.healthStatus === 'Under Observation').length,
    needsAttention: students.filter(s => s.healthStatus === 'Needs Attention').length
  };

  const wellbeingStats = {
    excellentMood: students.filter(s => s.emotionalWellbeing.mood === 'excellent').length,
    concerningMood: students.filter(s => s.emotionalWellbeing.mood === 'concerning' || s.emotionalWellbeing.mood === 'critical').length,
    behaviorChanges: students.filter(s => s.emotionalWellbeing.behaviorChanges).length,
    needsCounseling: students.filter(s => s.emotionalWellbeing.counselingSessions > 0).length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Student Health & Wellbeing Management</h1>
            <p className="text-gray-500">Monitor and manage student physical health and emotional wellbeing</p>
          </div>
          <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <span>New Health Record</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{healthStats.totalStudents}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Good Health</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{healthStats.goodHealth}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Heart className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Under Observation</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{healthStats.underObservation}</h3>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Activity className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Need Attention</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{healthStats.needsAttention}</h3>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Emotional Wellbeing Stats */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-600" />
          Emotional Wellbeing Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Excellent Mood</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{wellbeingStats.excellentMood}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Smile className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Concerning Mood</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{wellbeingStats.concerningMood}</h3>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Frown className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Behavior Changes</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{wellbeingStats.behaviorChanges}</h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Need Counseling</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{wellbeingStats.needsCounseling}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Student Directory</h2>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              
              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select 
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                >
                  <option value="all">All Classes</option>
                  <option value="10-A">Class 10-A</option>
                  <option value="10-B">Class 10-B</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedStudent?.id === student.id 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        student.healthStatus === 'Good' ? 'bg-green-500' :
                        student.healthStatus === 'Under Observation' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <div>
                        <h3 className="font-medium text-gray-800">{student.name}</h3>
                        <p className="text-sm text-gray-500">Class: {student.class}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.healthStatus === 'Good' 
                        ? 'bg-green-100 text-green-800'
                        : student.healthStatus === 'Under Observation'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.healthStatus}
                    </span>
                  </div>
                  {student.recentIssues.length > 0 && (
                    <div className="mt-2 flex items-center">
                      <AlertCircle className="w-3 h-3 text-yellow-500 mr-1" />
                      <span className="text-xs text-yellow-700">
                        {student.recentIssues.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No students found matching your search.
              </div>
            )}
          </div>
        </div>

        {/* Health Details Panel */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {selectedStudent ? (
            <div>
              <div className="p-5 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setSelectedStudent(null)}
                      className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">{selectedStudent.name}</h2>
                      <p className="text-sm text-gray-500">Class: {selectedStudent.class} | Last update: {selectedStudent.lastUpdate}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedStudent.healthStatus === 'Good' 
                      ? 'bg-green-100 text-green-800'
                      : selectedStudent.healthStatus === 'Under Observation'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedStudent.healthStatus}
                  </span>
                </div>
              </div>

              <div className="p-5 border-b border-gray-100">
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'overview' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab('medical')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'medical' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Medical Info
                  </button>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'history' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    History
                  </button>
                  <button 
                    onClick={() => setActiveTab('wellbeing')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                      activeTab === 'wellbeing' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Brain className="w-4 h-4" />
                    <span>Wellbeing</span>
                  </button>
                </div>
              </div>

              <div className="p-5">
                {activeTab === 'overview' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-800 mb-2">Vital Statistics</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500">Height</p>
                            <p className="font-medium">{selectedStudent.height}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Weight</p>
                            <p className="font-medium">{selectedStudent.weight}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">BMI</p>
                            <p className="font-medium">{selectedStudent.bmi}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Blood Group</p>
                            <p className="font-medium">{selectedStudent.bloodGroup}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-yellow-800 mb-2">Recent Issues</h3>
                        {selectedStudent.recentIssues.length > 0 ? (
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {selectedStudent.recentIssues.map((issue, index) => (
                              <li key={index} className="text-yellow-700">{issue}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-yellow-700">No recent health issues</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Emergency Contact</h3>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-800 font-medium">{selectedStudent.emergencyContact}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'medical' && (
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Allergies</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.allergies.map((allergy, index) => (
                          <span key={index} className="px-2.5 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Current Medications</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.medications.map((med, index) => (
                          <span key={index} className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {med}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Health Update History</h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <FileText className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-gray-800">Regular Checkup</h4>
                              <span className="text-xs text-gray-500">2024-03-01</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">All vitals normal. No issues reported.</p>
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Good
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="bg-yellow-100 p-2 rounded-full">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-gray-800">Sick Visit</h4>
                              <span className="text-xs text-gray-500">2024-02-15</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Mild fever observed. Recommended rest and hydration.</p>
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Under Observation
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'wellbeing' && (
                  <div className="space-y-6">
                    {/* Wellbeing Overview */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-purple-800 mb-3 flex items-center">
                        <Brain className="w-4 h-4 mr-2" />
                        Emotional Wellbeing Assessment
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                            selectedStudent.emotionalWellbeing.mood === 'excellent' ? 'bg-green-100' :
                            selectedStudent.emotionalWellbeing.mood === 'good' ? 'bg-blue-100' :
                            selectedStudent.emotionalWellbeing.mood === 'neutral' ? 'bg-yellow-100' :
                            selectedStudent.emotionalWellbeing.mood === 'concerning' ? 'bg-orange-100' :
                            'bg-red-100'
                          }`}>
                            {selectedStudent.emotionalWellbeing.mood === 'excellent' || selectedStudent.emotionalWellbeing.mood === 'good' ? (
                              <Smile className={`w-6 h-6 ${
                                selectedStudent.emotionalWellbeing.mood === 'excellent' ? 'text-green-600' : 'text-blue-600'
                              }`} />
                            ) : selectedStudent.emotionalWellbeing.mood === 'neutral' ? (
                              <Meh className="w-6 h-6 text-yellow-600" />
                            ) : (
                              <Frown className={`w-6 h-6 ${
                                selectedStudent.emotionalWellbeing.mood === 'concerning' ? 'text-orange-600' : 'text-red-600'
                              }`} />
                            )}
                          </div>
                          <h4 className="text-sm font-medium text-gray-900">Overall Mood</h4>
                          <p className={`text-xs font-medium capitalize ${
                            selectedStudent.emotionalWellbeing.mood === 'excellent' ? 'text-green-600' :
                            selectedStudent.emotionalWellbeing.mood === 'good' ? 'text-blue-600' :
                            selectedStudent.emotionalWellbeing.mood === 'neutral' ? 'text-yellow-600' :
                            selectedStudent.emotionalWellbeing.mood === 'concerning' ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {selectedStudent.emotionalWellbeing.mood}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-2">
                            <Users className="w-6 h-6 text-blue-600" />
                          </div>
                          <h4 className="text-sm font-medium text-gray-900">Social Engagement</h4>
                          <p className="text-xs font-medium text-blue-600">{selectedStudent.emotionalWellbeing.socialEngagement}/10</p>
                        </div>
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 mb-2">
                            <TrendingUp className="w-6 h-6 text-orange-600" />
                          </div>
                          <h4 className="text-sm font-medium text-gray-900">Academic Stress</h4>
                          <p className="text-xs font-medium text-orange-600">{selectedStudent.emotionalWellbeing.academicStress}/10</p>
                        </div>
                      </div>
                    </div>

                    {/* Wellbeing Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Assessment Details</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Last Assessment</span>
                            <span className="text-xs font-medium">{selectedStudent.emotionalWellbeing.lastAssessment}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Counseling Sessions</span>
                            <span className="text-xs font-medium">{selectedStudent.emotionalWellbeing.counselingSessions}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Parent Notifications</span>
                            <span className="text-xs font-medium">{selectedStudent.emotionalWellbeing.parentNotifications}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Behavior Changes</span>
                            <span className={`text-xs font-medium ${selectedStudent.emotionalWellbeing.behaviorChanges ? 'text-orange-600' : 'text-green-600'}`}>
                              {selectedStudent.emotionalWellbeing.behaviorChanges ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Interventions</h3>
                        <div className="space-y-2">
                          {selectedStudent.emotionalWellbeing.interventions.length > 0 ? (
                            selectedStudent.emotionalWellbeing.interventions.map((intervention, index) => (
                              <div key={index} className="flex items-center">
                                <Star className="w-3 h-3 text-yellow-500 mr-2" />
                                <span className="text-xs text-gray-700">{intervention}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500">No interventions needed</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Notes and Support Actions */}
                    <div className="space-y-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Assessment Notes</h3>
                        <p className="text-xs text-gray-600">
                          {selectedStudent.emotionalWellbeing.notes || 'No additional notes available.'}
                        </p>
                      </div>

                      {selectedStudent.emotionalWellbeing.supportActions && selectedStudent.emotionalWellbeing.supportActions.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-3">Support Actions Taken</h3>
                          <div className="space-y-3">
                            {selectedStudent.emotionalWellbeing.supportActions.map((action, index) => (
                              <div key={index} className="flex items-start space-x-3">
                                <div className="bg-purple-100 p-1.5 rounded-full">
                                  <MessageCircle className="w-3 h-3 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <h4 className="text-xs font-medium text-gray-800">{action.type}</h4>
                                    <span className="text-xs text-gray-500">{action.date}</span>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-5 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Health Update</h3>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={newUpdate.date}
                          onChange={(e) => setNewUpdate({...newUpdate, date: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={newUpdate.type}
                          onChange={(e) => setNewUpdate({...newUpdate, type: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option>Regular Checkup</option>
                          <option>Sick Visit</option>
                          <option>Follow-up</option>
                          <option>Emergency</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={newUpdate.status}
                          onChange={(e) => setNewUpdate({...newUpdate, status: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option>Good</option>
                          <option>Under Observation</option>
                          <option>Needs Attention</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Findings</label>
                      <textarea
                        value={newUpdate.findings}
                        onChange={(e) => setNewUpdate({...newUpdate, findings: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Enter medical findings..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
                      <textarea
                        value={newUpdate.recommendations}
                        onChange={(e) => setNewUpdate({...newUpdate, recommendations: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Enter recommendations..."
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                      >
                        Save Health Update
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Select a student</h3>
              <p className="text-gray-500 text-sm">
                Choose a student from the list to view and manage their health records
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthUpdates;