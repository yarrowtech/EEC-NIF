import React, { useState } from 'react';
import { 
  Star, 
  MessageCircle, 
  User, 
  BookOpen, 
  Clock,
  CheckCircle,
  Send,
  RotateCcw,
  Award,
  TrendingUp,
  Heart,
  ThumbsUp,
  Target,
  Users,
  Calendar,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  Eye,
  Edit3
} from 'lucide-react';

const TeacherFeedback = () => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [ratings, setRatings] = useState({});
  const [hoveredRatings, setHoveredRatings] = useState({});
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [showPreviousFeedback, setShowPreviousFeedback] = useState(false);

  // Mock data for subjects and teachers
  const subjects = [
    {
      id: 'mathematics',
      name: 'Mathematics',
      teacher: 'Dr. Sarah Johnson',
      teacherImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      code: 'MATH-101',
      schedule: 'Mon, Wed, Fri - 9:00 AM'
    },
    {
      id: 'physics',
      name: 'Physics',
      teacher: 'Prof. Michael Chen',
      teacherImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      code: 'PHY-201',
      schedule: 'Tue, Thu - 11:00 AM'
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      teacher: 'Dr. Emily Rodriguez',
      teacherImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      code: 'CHEM-201',
      schedule: 'Mon, Wed, Fri - 2:00 PM'
    },
    {
      id: 'english',
      name: 'English Literature',
      teacher: 'Ms. Jennifer Davis',
      teacherImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      code: 'ENG-301',
      schedule: 'Tue, Thu - 10:00 AM'
    },
    {
      id: 'history',
      name: 'World History',
      teacher: 'Mr. David Thompson',
      teacherImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      code: 'HIST-201',
      schedule: 'Mon, Wed - 1:00 PM'
    },
    {
      id: 'biology',
      name: 'Biology',
      teacher: 'Dr. Lisa Anderson',
      teacherImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
      code: 'BIO-201',
      schedule: 'Tue, Fri - 9:00 AM'
    }
  ];

  // Rating categories for teacher evaluation
  const ratingCategories = [
    {
      id: 'teaching_quality',
      label: 'Teaching Quality',
      description: 'How well does the teacher explain concepts?',
      icon: Award
    },
    {
      id: 'communication',
      label: 'Communication',
      description: 'How clear and effective is the teacher\'s communication?',
      icon: MessageCircle
    },
    {
      id: 'engagement',
      label: 'Student Engagement',
      description: 'How well does the teacher engage students in learning?',
      icon: Users
    },
    {
      id: 'preparation',
      label: 'Class Preparation',
      description: 'How well-prepared is the teacher for each class?',
      icon: BookOpen
    },
    {
      id: 'availability',
      label: 'Availability & Support',
      description: 'How accessible is the teacher for questions and help?',
      icon: Heart
    },
    {
      id: 'fairness',
      label: 'Fair Assessment',
      description: 'How fair and consistent is the teacher\'s grading?',
      icon: Target
    }
  ];

  // Previous feedback data (mock)
  const previousFeedback = [
    {
      id: 1,
      subject: 'Mathematics',
      teacher: 'Dr. Sarah Johnson',
      date: '2024-07-15',
      rating: 4.5,
      feedback: 'Excellent teacher! Very clear explanations and always willing to help.',
      categories: {
        teaching_quality: 5,
        communication: 4,
        engagement: 5,
        preparation: 4,
        availability: 5,
        fairness: 4
      }
    },
    {
      id: 2,
      subject: 'Physics',
      teacher: 'Prof. Michael Chen',
      date: '2024-07-10',
      rating: 4.0,
      feedback: 'Great practical demonstrations. Could improve on explaining complex theories.',
      categories: {
        teaching_quality: 4,
        communication: 3,
        engagement: 5,
        preparation: 4,
        availability: 4,
        fairness: 4
      }
    }
  ];

  const handleRatingChange = (category, rating) => {
    setRatings(prev => ({ ...prev, [category]: rating }));
  };

  const handleRatingHover = (category, rating) => {
    setHoveredRatings(prev => ({ ...prev, [category]: rating }));
  };

  const handleRatingLeave = (category) => {
    setHoveredRatings(prev => ({ ...prev, [category]: 0 }));
  };

  const getAverageRating = () => {
    const ratingValues = Object.values(ratings);
    if (ratingValues.length === 0) return 0;
    return (ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length).toFixed(1);
  };

  const handleSubmit = () => {
    if (!selectedSubject || Object.keys(ratings).length === 0) {
      alert('Please select a subject and provide ratings before submitting.');
      return;
    }
    
    // In a real app, this would be sent to the backend
    console.log('Feedback submitted:', {
      subject: selectedSubject,
      ratings,
      feedback,
      averageRating: getAverageRating()
    });
    
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setRatings({});
      setFeedback('');
      setSelectedSubject('');
      setSelectedTeacher('');
    }, 3000);
  };

  const resetForm = () => {
    setRatings({});
    setFeedback('');
    setSelectedSubject('');
    setSelectedTeacher('');
  };

  const filteredSubjects = subjects.filter(subject => 
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.teacher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPreviousFeedback = previousFeedback.filter(item => 
    filterSubject === 'all' || item.subject.toLowerCase().includes(filterSubject.toLowerCase())
  );

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-yellow-200 max-w-md mx-auto">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-amber-900 mb-2">Feedback Submitted!</h3>
          <p className="text-amber-600 mb-4">Thank you for your valuable feedback. Your input helps us improve the learning experience.</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-amber-700">
              <strong>Subject:</strong> {subjects.find(s => s.id === selectedSubject)?.name}<br />
              <strong>Average Rating:</strong> {getAverageRating()}/5 stars
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-purple-50 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <MessageCircle className="w-8 h-8" />
              Teacher Feedback
            </h1>
            <p className="text-yellow-100 text-lg">Share your thoughts about your teachers and help improve the learning experience</p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-lg p-4">
              <div className="text-3xl font-bold">{subjects.length}</div>
              <div className="text-sm text-yellow-100">Subjects Available</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Feedback Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-100">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-amber-900">Select Subject & Teacher</h3>
            </div>
            
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-400" />
                <input
                  type="text"
                  placeholder="Search subjects or teachers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSubjects.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => {
                    setSelectedSubject(subject.id);
                    setSelectedTeacher(subject.teacher);
                  }}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedSubject === subject.id
                      ? 'border-purple-400 bg-purple-50 ring-2 ring-purple-100'
                      : 'border-yellow-200 bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={subject.teacherImage}
                      alt={subject.teacher}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";
                      }}
                    />
                    <div>
                      <h4 className="font-bold text-amber-900">{subject.name}</h4>
                      <p className="text-sm text-amber-600">{subject.code}</p>
                    </div>
                  </div>
                  <div className="text-sm text-amber-700">
                    <p className="font-medium">{subject.teacher}</p>
                    <p className="text-xs text-amber-600">{subject.schedule}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rating Categories */}
          {selectedSubject && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-amber-500" />
                  <h3 className="text-xl font-bold text-amber-900">Rate Your Teacher</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{getAverageRating()}</div>
                  <div className="text-sm text-amber-600">Average Rating</div>
                </div>
              </div>
              
              <div className="space-y-6">
                {ratingCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.id} className="border-b border-yellow-100 pb-4 last:border-b-0">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Icon className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-amber-900 mb-1">{category.label}</h4>
                          <p className="text-sm text-amber-600 mb-3">{category.description}</p>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform hover:scale-110"
                                onMouseEnter={() => handleRatingHover(category.id, star)}
                                onMouseLeave={() => handleRatingLeave(category.id)}
                                onClick={() => handleRatingChange(category.id, star)}
                              >
                                <Star
                                  className={`w-6 h-6 transition-colors ${
                                    star <= (hoveredRatings[category.id] || ratings[category.id] || 0)
                                      ? 'fill-yellow-400 text-yellow-500'
                                      : 'text-gray-300 hover:text-gray-400'
                                  }`}
                                />
                              </button>
                            ))}
                            {ratings[category.id] && (
                              <span className="ml-2 text-sm font-medium text-amber-700">
                                {ratings[category.id]}/5
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additional Comments */}
          {selectedSubject && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-100">
              <div className="flex items-center gap-3 mb-4">
                <Edit3 className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-amber-900">Additional Comments</h3>
              </div>
              <textarea
                rows="5"
                placeholder="Share specific feedback, suggestions, or what you appreciate about this teacher's teaching style..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
              />
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-amber-600">
                  {feedback.length}/500 characters
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={resetForm}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedSubject || Object.keys(ratings).length === 0}
                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Submit Feedback
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Previous Feedback & Statistics */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-100">
            <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Your Feedback Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-amber-700">Total Feedback Given</span>
                <span className="font-bold text-amber-900">12</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-purple-700">Average Rating Given</span>
                <span className="font-bold text-purple-900">4.2/5</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-green-700">Response Rate</span>
                <span className="font-bold text-green-900">89%</span>
              </div>
            </div>
          </div>

          {/* Previous Feedback */}
          <div className="bg-white rounded-xl shadow-lg border border-yellow-100">
            <div className="p-6 border-b border-yellow-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Previous Feedback
                </h3>
                <button
                  onClick={() => setShowPreviousFeedback(!showPreviousFeedback)}
                  className="flex items-center gap-1 text-purple-600 hover:text-purple-700"
                >
                  {showPreviousFeedback ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  {showPreviousFeedback ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {showPreviousFeedback && (
                <div className="mt-4">
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  >
                    <option value="all">All Subjects</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.name}>{subject.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {showPreviousFeedback && (
              <div className="max-h-96 overflow-y-auto">
                {filteredPreviousFeedback.map((item) => (
                  <div key={item.id} className="p-4 border-b border-yellow-100 last:border-b-0 hover:bg-yellow-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-amber-900">{item.subject}</h4>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                        <span className="text-sm font-medium text-amber-700">{item.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-amber-600 mb-2">{item.teacher}</p>
                    <p className="text-sm text-amber-700 mb-2">"{item.feedback}"</p>
                    <div className="flex items-center justify-between text-xs text-amber-600">
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      <span>6 categories rated</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherFeedback;