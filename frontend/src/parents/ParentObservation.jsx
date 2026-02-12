import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Calendar, TrendingUp, AlertCircle, Clock, User, CheckCircle } from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const categories = [
  'Academic Performance',
  'Social Interaction',
  'Emotional Wellbeing',
  'Behavioral Changes',
  'Physical Health',
  'Sleep Patterns',
  'Eating Habits',
  'Communication',
];

const moodEmojis = [
  { emoji: '😊', label: 'Very Happy', value: 5 },
  { emoji: '🙂', label: 'Happy', value: 4 },
  { emoji: '😐', label: 'Neutral', value: 3 },
  { emoji: '😕', label: 'Sad', value: 2 },
  { emoji: '😟', label: 'Very Sad', value: 1 },
];

const concernLevels = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const concernButtonStyles = {
  low: 'border-green-400 bg-green-50 text-green-700',
  medium: 'border-yellow-400 bg-yellow-50 text-yellow-700',
  high: 'border-red-400 bg-red-50 text-red-700',
};

const concernBadge = (level) => {
  switch (level) {
    case 'high':
      return 'text-red-600 bg-red-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'low':
    default:
      return 'text-green-600 bg-green-100';
  }
};

const ParentObservation = () => {
  const [children, setChildren] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [observationData, setObservationData] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    category: categories[0],
    observation: '',
    moodRating: null,
    behaviorNotes: '',
    concernLevel: 'low',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        if (!token || userType !== 'Parent') {
          setError('Please login as a parent to manage observations.');
          setChildren([]);
          setObservations([]);
          return;
        }

        const [childrenRes, observationsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/attendance/parent/children`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/observations/parent`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const childrenPayload = await childrenRes.json().catch(() => ({}));
        if (!childrenRes.ok) {
          throw new Error(childrenPayload?.error || 'Unable to load children');
        }
        const childOptions = (childrenPayload.children || []).map((entry) => ({
          id: entry.student?._id || entry.studentId,
          name: entry.student?.name || 'Student',
          classLabel: entry.student
            ? `Grade ${entry.student.grade || ''} ${entry.student.section || ''}`
            : '',
        }));
        setChildren(childOptions);
        if (childOptions.length > 0 && !observationData.studentId) {
          setObservationData((prev) => ({ ...prev, studentId: childOptions[0].id }));
        }

        const observationPayload = await observationsRes.json().catch(() => ({}));
        if (!observationsRes.ok) {
          throw new Error(observationPayload?.error || 'Unable to load observations');
        }
        setObservations(Array.isArray(observationPayload.parentEntries) ? observationPayload.parentEntries : []);
      } catch (err) {
        console.error('Parent observation load error:', err);
        setError(err.message || 'Unable to load data');
        setChildren([]);
        setObservations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (field, value) => {
    setObservationData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/observations/parent`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: observationData.studentId,
          category: observationData.category,
          observation: observationData.observation,
          moodRating: observationData.moodRating,
          behaviorNotes: observationData.behaviorNotes,
          concernLevel: observationData.concernLevel,
          date: observationData.date,
        }),
      });
      const saved = await response.json();
      if (!response.ok) {
        throw new Error(saved?.error || 'Unable to submit observation');
      }
      setObservations((prev) => [saved, ...prev]);
      setSubmitted(true);
      setObservationData((prev) => ({
        ...prev,
        date: new Date().toISOString().split('T')[0],
        observation: '',
        behaviorNotes: '',
        moodRating: null,
        concernLevel: 'low',
      }));
      setTimeout(() => setSubmitted(false), 2500);
    } catch (err) {
      console.error('Parent observation submit error:', err);
      setError(err.message || 'Unable to save observation');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = () =>
    Boolean(
      observationData.studentId &&
        observationData.category &&
        observationData.observation &&
        observationData.moodRating !== null
    );

  const recentObservations = useMemo(() => observations.slice(0, 10), [observations]);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6">
      <div className="w-full px-3 sm:px-3 md:px-4 lg:px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Parent Observation Log</h1>
              <p className="text-gray-600">
                Share what you notice at home to help teachers support your child.
              </p>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">New Observation</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Child</label>
                {loading ? (
                  <p className="text-sm text-gray-500">Loading children...</p>
                ) : (
                  <select
                    value={observationData.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Choose a child</option>
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name} {child.classLabel ? `• ${child.classLabel}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={observationData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={observationData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
                <div className="grid grid-cols-5 gap-3">
                  {moodEmojis.map((mood) => (
                    <button
                      type="button"
                      key={mood.value}
                      onClick={() => handleInputChange('moodRating', mood.value)}
                      className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                        observationData.moodRating === mood.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                      <span className="text-xs text-gray-600">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observation Details
                </label>
                <textarea
                  value={observationData.observation}
                  onChange={(e) => handleInputChange('observation', e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what you have noticed..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={observationData.behaviorNotes}
                  onChange={(e) => handleInputChange('behaviorNotes', e.target.value)}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any extra details or context..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Concern Level</label>
                <div className="flex gap-3">
                  {concernLevels.map((level) => {
                    const selected = observationData.concernLevel === level.value;
                    const selectedClasses = concernButtonStyles[level.value];
                    return (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => handleInputChange('concernLevel', level.value)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                          selected
                            ? selectedClasses
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {level.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={!isFormValid() || submitting}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isFormValid()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {submitting ? 'Submitting...' : 'Record Observation'}
              </button>
              {submitted && (
                <div className="mt-3 flex items-center text-sm text-green-600 gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Observation submitted successfully.
                </div>
              )}
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Recent Observations</h2>
                <p className="text-sm text-gray-500">Latest entries you've submitted</p>
              </div>
              {loading && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Loading...
                </span>
              )}
            </div>
            <div className="p-6">
              {recentObservations.length === 0 ? (
                <div className="text-center text-sm text-gray-500">
                  No observations recorded yet.
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {recentObservations.map((obs) => (
                    <div key={obs.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{obs.studentName}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${concernBadge(obs.concernLevel || 'low')}`}>
                            {(obs.concernLevel || 'low').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{obs.recordedAt ? new Date(obs.recordedAt).toLocaleDateString() : obs.date}</span>
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="text-sm font-medium text-blue-600">
                          {obs.category || obs.observationText || 'Observation'}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">
                        {obs.observationText || obs.observation || ''}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Mood:</span>
                          <span className="text-lg">
                            {moodEmojis.find((m) => m.value === obs.moodRating)?.emoji || '—'}
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
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-gray-900">Observation Summary</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Total Entries</p>
              <p className="text-2xl font-semibold text-gray-900">{observations.length}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500">High Concern</p>
              <p className="text-2xl font-semibold text-red-600">
                {observations.filter((obs) => (obs.concernLevel || '').includes('high')).length}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Last Submission</p>
              <p className="text-2xl font-semibold text-gray-900">
                {observations[0]?.recordedAt
                  ? new Date(observations[0].recordedAt).toLocaleDateString()
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentObservation;
