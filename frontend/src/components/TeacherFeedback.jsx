import React, { useEffect, useMemo, useState } from 'react';
import { 
  Star, 
  MessageCircle, 
  BookOpen, 
  Clock,
  CheckCircle,
  Send,
  RotateCcw,
  Award,
  TrendingUp,
  Heart,
  Target,
  Users,
  ChevronDown,
  ChevronRight,
  Search,
  Eye,
  Edit3,
  Shield,
  X
} from 'lucide-react';

const TeacherFeedback = () => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [ratings, setRatings] = useState({});
  const [hoveredRatings, setHoveredRatings] = useState({});
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [showPreviousFeedback, setShowPreviousFeedback] = useState(false);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [previousFeedback, setPreviousFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submittedContext, setSubmittedContext] = useState(null);

  const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
  const placeholderAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";

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

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const userType = localStorage.getItem('userType');

      if (!token || userType !== 'Student') {
        setLoadError('Student session not found. Please login again.');
        setLoading(false);
        return;
      }

      setLoadError('');
      setLoading(true);

      try {
        const headers = {
          Authorization: `Bearer ${token}`
        };

        const [contextRes, historyRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/student/auth/teacher-feedback/context`, { headers }),
          fetch(`${API_BASE_URL}/api/student/auth/teacher-feedback`, { headers })
        ]);

        const contextData = await contextRes.json();
        if (!contextRes.ok) {
          throw new Error(contextData.error || 'Unable to load teacher data');
        }
        setTeacherSubjects(Array.isArray(contextData.teachers) ? contextData.teachers : []);

        const historyData = await historyRes.json();
        if (!historyRes.ok) {
          throw new Error(historyData.error || 'Unable to load feedback history');
        }
        setPreviousFeedback(Array.isArray(historyData) ? historyData : []);
      } catch (err) {
        console.error('Teacher feedback fetch error:', err);
        setLoadError(err.message || 'Failed to load teacher feedback data.');
        setTeacherSubjects([]);
        setPreviousFeedback([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE_URL]);

  const selectedContext = useMemo(
    () => teacherSubjects.find(subject => subject.contextId === selectedSubject),
    [teacherSubjects, selectedSubject]
  );

  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return teacherSubjects;
    const normalizedQuery = searchQuery.toLowerCase();
    return teacherSubjects.filter(subject =>
      subject.subjectName?.toLowerCase().includes(normalizedQuery) ||
      subject.teacherName?.toLowerCase().includes(normalizedQuery)
    );
  }, [teacherSubjects, searchQuery]);

  const previousSubjectOptions = useMemo(() => {
    const set = new Set();
    previousFeedback.forEach(item => {
      if (item.subjectName) set.add(item.subjectName);
    });
    return Array.from(set);
  }, [previousFeedback]);

  const filteredPreviousFeedback = useMemo(() => {
    if (filterSubject === 'all') return previousFeedback;
    return previousFeedback.filter(item => item.subjectName === filterSubject);
  }, [previousFeedback, filterSubject]);

  const totalFeedbackGiven = previousFeedback.length;
  const averageRatingGiven = totalFeedbackGiven
    ? (previousFeedback.reduce((sum, item) => sum + (item.overallRating || 0), 0) / totalFeedbackGiven).toFixed(1)
    : '0.0';
  const responseRate = teacherSubjects.length
    ? Math.min(100, Math.round((totalFeedbackGiven / teacherSubjects.length) * 100))
    : 0;

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

  const getSelectedContextOrAlert = () => {
    if (!selectedSubject) {
      setSubmitError('Please select a subject before submitting feedback.');
      return null;
    }
    const context = teacherSubjects.find(subject => subject.contextId === selectedSubject);
    if (!context) {
      setSubmitError('Selected subject is no longer available. Please choose again.');
      return null;
    }
    if (Object.keys(ratings).length === 0) {
      setSubmitError('Please provide ratings before submitting.');
      return null;
    }
    return context;
  };

  const handleSubmit = async () => {
    setSubmitError('');
    const context = getSelectedContextOrAlert();
    if (!context) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setSubmitError('Student session not found. Please login again.');
      return;
    }

    setSubmitError('');
    setSubmittingFeedback(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/student/auth/teacher-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          teacherId: context.teacherId,
          subjectId: context.subjectId,
          subjectName: context.subjectName,
          ratings,
          comments: feedback,
          anonymous: isAnonymous
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      if (data.feedback) {
        setPreviousFeedback(prev => [data.feedback, ...prev]);
      }

      setSubmittedContext(context);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setSubmittedContext(null);
        setIsModalOpen(false);
        resetForm();
      }, 2500);
    } catch (err) {
      console.error('Feedback submit error:', err);
      setSubmitError(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const resetForm = (keepSelection = false) => {
    setRatings({});
    setHoveredRatings({});
    setFeedback('');
    setSubmitError('');
    setIsAnonymous(true);
    if (!keepSelection) {
      setSelectedSubject('');
    }
  };

  const openFeedbackModal = (subject) => {
    resetForm(true);
    setSelectedSubject(subject.contextId);
    setIsModalOpen(true);
    setIsSubmitted(false);
    setSubmittedContext(null);
  };

  const closeFeedbackModal = () => {
    setIsModalOpen(false);
    setIsSubmitted(false);
    setSubmittedContext(null);
    setSubmittingFeedback(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-yellow-200 max-w-md mx-auto">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold text-amber-900 mb-2">Loading your teachers…</h3>
          <p className="text-amber-600">Fetching your timetable and previous feedback.</p>
        </div>
      </div>
    );
  }

  return (
    <>
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
              <div className="text-3xl font-bold">{teacherSubjects.length}</div>
              <div className="text-sm text-yellow-100">Subjects Available</div>
            </div>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {loadError}
        </div>
      )}

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
              {filteredSubjects.length === 0 ? (
                <div className="col-span-2 text-center text-sm text-amber-600 py-6">
                  No matching subjects. Try adjusting your search.
                </div>
              ) : (
                filteredSubjects.map((subject) => (
                  <div
                    key={subject.contextId}
                    onClick={() => openFeedbackModal(subject)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedSubject === subject.contextId
                        ? 'border-purple-400 bg-purple-50 ring-2 ring-purple-100'
                        : 'border-yellow-200 bg-white hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={subject.teacherProfilePic || placeholderAvatar}
                        alt={subject.teacherName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        onError={(e) => {
                          e.target.src = placeholderAvatar;
                        }}
                      />
                      <div>
                        <h4 className="font-bold text-amber-900">{subject.subjectName}</h4>
                        <p className="text-sm text-amber-600">
                          {subject.className}
                          {subject.sectionName ? ` • Section ${subject.sectionName}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-amber-700">
                      <p className="font-medium">{subject.teacherName}</p>
                      {subject.scheduleTimes?.length > 0 && (
                        <p className="text-xs text-amber-600">
                          {subject.scheduleTimes[0].dayOfWeek}
                          {subject.scheduleTimes[0].time ? ` • ${subject.scheduleTimes[0].time}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-purple-900">Share Feedback Securely</h3>
            </div>
            <p className="text-sm text-purple-700">
              Tap any teacher card above to open a feedback modal. You can rate every teaching category,
              leave specific comments, and your responses are anonymous by default so you can be honest without worry.
            </p>
          </div>
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
                <span className="font-bold text-amber-900">{totalFeedbackGiven}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-purple-700">Average Rating Given</span>
                <span className="font-bold text-purple-900">{averageRatingGiven}/5</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-green-700">Response Rate</span>
                <span className="font-bold text-green-900">{responseRate}%</span>
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
                    {previousSubjectOptions.map(subjectName => (
                      <option key={subjectName} value={subjectName}>{subjectName}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {showPreviousFeedback && (
              <div className="max-h-96 overflow-y-auto">
                {filteredPreviousFeedback.length === 0 ? (
                  <div className="p-4 text-center text-sm text-amber-600">
                    No feedback records yet.
                  </div>
                ) : (
                  filteredPreviousFeedback.map((item) => (
                    <div key={item.id} className="p-4 border-b border-yellow-100 last:border-b-0 hover:bg-yellow-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-amber-900">{item.subjectName}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                          <span className="text-sm font-medium text-amber-700">{(item.overallRating || 0).toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-amber-600 mb-2">{item.teacherName}</p>
                      <p className="text-sm text-amber-700 mb-2">"{item.comments || 'No comments provided.'}"</p>
                      <div className="flex items-center justify-between text-xs text-amber-600 flex-wrap gap-2">
                        <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</span>
                        <div className="flex items-center gap-2">
                          {item.isAnonymous && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                              Anonymous
                            </span>
                          )}
                          <span>{Object.keys(item.ratings || {}).length} categories rated</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-8 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-purple-100">
            <div className="flex items-start justify-between p-6 border-b border-slate-100">
              <div>
                <p className="text-sm text-slate-500">Providing feedback for</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {selectedContext?.teacherName || submittedContext?.teacherName || 'Teacher'}
                </h3>
                <p className="text-sm text-slate-600">
                  {selectedContext?.subjectName || submittedContext?.subjectName || 'Subject'}
                </p>
              </div>
              <button
                onClick={closeFeedbackModal}
                className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {isSubmitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-2xl font-semibold text-slate-900 mb-2">Feedback sent!</h4>
                  <p className="text-slate-600 mb-4">
                    Thanks for sharing your thoughts about{' '}
                    <strong>{submittedContext?.teacherName || selectedContext?.teacherName || 'your teacher'}</strong>.
                    Your response was recorded anonymously.
                  </p>
                  <div className="inline-flex flex-col items-center bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">
                      {submittedContext?.subjectName || selectedContext?.subjectName || 'Subject'}
                    </span>
                    <span>Average rating {getAverageRating()}/5</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-3">
                    <div className="p-2 rounded-full bg-white shadow-sm">
                      <Star className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Average Rating</p>
                      <p className="text-2xl font-bold text-purple-600">{getAverageRating()}</p>
                    </div>
                    <div className="ml-auto text-sm text-slate-500">
                      Rate each category below and leave detailed comments.
                    </div>
                  </div>
                  <div className="space-y-6">
                    {ratingCategories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <div key={category.id} className="border border-slate-100 rounded-xl p-4">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-amber-50 rounded-lg">
                              <Icon className="w-5 h-5 text-amber-500" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                                <h4 className="font-semibold text-slate-900">{category.label}</h4>
                                {ratings[category.id] && (
                                  <span className="text-sm font-medium text-purple-700">
                                    {ratings[category.id]}/5
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-500 mb-3">{category.description}</p>
                              <div className="flex items-center gap-2 flex-wrap">
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
                                      className={`w-7 h-7 transition-colors ${
                                        star <= (hoveredRatings[category.id] || ratings[category.id] || 0)
                                          ? 'fill-yellow-400 text-yellow-500'
                                          : 'text-gray-200 hover:text-gray-400'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 bg-purple-50 border border-purple-100 rounded-xl p-4">
                      <div className="p-2 bg-white rounded-full shadow-sm text-purple-600">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-purple-900">Submit anonymously</p>
                        <p className="text-sm text-purple-600">
                          Teachers will only see “Anonymous Student” for this response.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAnonymous((prev) => !prev)}
                        className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                          isAnonymous ? 'bg-purple-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            isAnonymous ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        ></span>
                      </button>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Edit3 className="w-5 h-5 text-green-600" />
                        <h4 className="text-lg font-semibold text-slate-900">Comments</h4>
                      </div>
                      <textarea
                        rows="4"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Share what went really well or what could improve..."
                        maxLength={500}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                      />
                      <div className="text-xs text-slate-500 text-right mt-1">{feedback.length}/500 characters</div>
                    </div>
                  </div>
                  {submitError && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                      {submitError}
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => resetForm(true)}
                      disabled={submittingFeedback}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!selectedSubject || Object.keys(ratings).length === 0 || submittingFeedback}
                      className="flex items-center gap-2 px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      {submittingFeedback ? 'Submitting…' : 'Submit Feedback'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherFeedback;
