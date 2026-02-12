import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, Clock, Eye, User } from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
};

const Observation = () => {
  const [formData, setFormData] = useState({
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    q5: null,
    q6: null,
    q7: null,
    q8: null,
    q9: null,
    q10: null
  });

  const [submitted, setSubmitted] = useState(false);
  const [teacherObservations, setTeacherObservations] = useState([]);
  const [teacherStats, setTeacherStats] = useState(null);
  const [teacherChildren, setTeacherChildren] = useState([]);
  const [teacherLoading, setTeacherLoading] = useState(true);
  const [teacherError, setTeacherError] = useState('');

  const questions = [
    {
      id: 'q1',
      text: 'How often have you observed your child seeming more irritable, sad, or emotionally flat than is usual for them?'
    },
    {
      id: 'q2',
      text: 'How often has your child withdrawn from family activities or preferred to be alone, more so than their typical behavior?'
    },
    {
      id: 'q3',
      text: 'How much have you noticed a change in your child\'s sleep, such as sleeping much more, much less, or having trouble falling/staying asleep?'
    },
    {
      id: 'q4',
      text: 'How often has your child shown interest or enthusiasm for hobbies, friendships, or activities they normally enjoy?'
    },
    {
      id: 'q5',
      text: 'How would you describe your child\'s overall energy level at home?'
    },
    {
      id: 'q6',
      text: 'How often has your child expressed significant worry about school, their future, or their friendships?'
    },
    {
      id: 'q7',
      text: 'How often has your child become easily frustrated or upset by small problems or setbacks?'
    },
    {
      id: 'q8',
      text: 'How often has your child complained of physical issues like headaches, stomach aches, or general fatigue?'
    },
    {
      id: 'q9',
      text: 'How much has your child been communicating with you about their schoolwork or their experiences at school?'
    },
    {
      id: 'q10',
      text: 'How often have you heard your child make negative or highly critical comments about themselves?'
    }
  ];

  const emojiOptions = [
    { emoji: '😊', label: 'Very Good', value: 0 },
    { emoji: '🙂', label: 'Okay', value: 1 },
    { emoji: '😐', label: 'Neutral', value: 2 },
    { emoji: '😕', label: 'Worried', value: 3 },
    { emoji: '😟', label: 'Very Worried', value: 4 }
  ];

  const handleEmojiClick = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Observation Form Submitted:', formData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        q1: null, q2: null, q3: null, q4: null, q5: null,
        q6: null, q7: null, q8: null, q9: null, q10: null
      });
    }, 3000);
  };

  const isFormComplete = () => {
    return Object.values(formData).every(value => value !== null);
  };

  useEffect(() => {
    const fetchTeacherObservations = async () => {
      setTeacherLoading(true);
      setTeacherError('');
      try {
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        if (!token || userType !== 'Parent') {
          setTeacherError('Please login as a parent to view teacher observations.');
          setTeacherObservations([]);
          setTeacherChildren([]);
          setTeacherStats(null);
          return;
        }
        const res = await fetch(`${API_BASE_URL}/api/observations/parent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || 'Unable to load teacher observations');
        }
        setTeacherObservations(Array.isArray(data.observations) ? data.observations : []);
        setTeacherStats(data.stats || null);
        setTeacherChildren(Array.isArray(data.children) ? data.children : []);
      } catch (err) {
        console.error('Parent observation dashboard error:', err);
        setTeacherError(err.message || 'Unable to load teacher observations');
        setTeacherObservations([]);
        setTeacherChildren([]);
        setTeacherStats(null);
      } finally {
        setTeacherLoading(false);
      }
    };
    fetchTeacherObservations();
  }, []);

  const latestTeacherObservations = useMemo(
    () => teacherObservations.slice(0, 4),
    [teacherObservations]
  );

  return (
    <div className="min-h-screen bg-gray-50 py-5">
      <div className="w-full px-3 sm:px-3 md:px-4 lg:px-4">
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-blue-500" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Teacher Observation Dashboard</h2>
                <p className="text-sm text-gray-600">
                  See the latest wellbeing notes teachers recorded for your child.
                </p>
              </div>
            </div>

            {teacherError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {teacherError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Total Notes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {teacherStats?.total ?? (teacherLoading ? '—' : 0)}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Urgent Alerts</p>
                <p className="text-2xl font-semibold text-red-600">
                  {teacherStats?.urgent ?? (teacherLoading ? '—' : 0)}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Follow-ups</p>
                <p className="text-2xl font-semibold text-amber-600">
                  {teacherStats?.followUps ?? (teacherLoading ? '—' : 0)}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p a className="text-sm text-gray-500">Last Updated</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {teacherStats?.lastUpdated ? formatDate(teacherStats.lastUpdated) : '—'}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-800">By Child</h3>
                {teacherLoading ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : teacherChildren.length === 0 ? (
                  <p className="text-sm text-gray-500">No teacher notes available yet.</p>
                ) : (
                  <div className="space-y-3">
                    {teacherChildren.map((child) => (
                      <div key={child.studentId} className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{child.studentName}</p>
                          <p className="text-xs text-gray-500">
                            Grade {child.grade} {child.section}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{child.totalEntries}</p>
                          <p className="text-xs text-gray-500">entries</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-800">Recent Teacher Notes</h3>
                {teacherLoading ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : latestTeacherObservations.length === 0 ? (
                  <p className="text-sm text-gray-500">No recent observations.</p>
                ) : (
                  <div className="space-y-3">
                    {latestTeacherObservations.map((item) => (
                      <div key={item.id} className="rounded-md border border-gray-100 px-3 py-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{item.studentName}</span>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            item.urgencyLevel === 'urgent'
                              ? 'bg-red-100 text-red-700'
                              : item.urgencyLevel === 'high'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {item.urgencyLevel}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(item.recordedAt)}</span>
                          {item.teacher?.name && (
                            <>
                              <span>•</span>
                              <span>{item.teacher.name}</span>
                            </>
                          )}
                        </div>
                        {item.additionalNotes && (
                          <p className="mt-2 text-sm text-gray-700">{item.additionalNotes}</p>
                        )}
                        <div className="mt-2 flex gap-2 text-xs text-gray-500">
                          <span>Health Score: {item.healthScore ?? '-'}</span>
                          <span>Emotion Score: {item.emotionScore ?? '-'}</span>
                        </div>
                        {item.followUpRequired && (
                          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                            <AlertTriangle className="h-3 w-3" /> Follow-up recommended
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Child Behavior Observation Form
            </h1>
            <p className="text-gray-600 mb-4">
              Please answer the following questions about your child's recent behavior and emotional state.
            </p>
          </div>

          {submitted && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Thank you! Your observation has been submitted successfully.</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {questions.map((question, index) => (
              <div key={question.id} className="border-b border-gray-200 pb-6">
                <div className="mb-6">
                  <label className="block text-lg font-medium text-gray-900 mb-4">
                    {index + 1}. {question.text}
                  </label>
                </div>
                
                <div className="flex justify-center space-x-4">
                  {emojiOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleEmojiClick(question.id, option.value)}
                      className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200 border-2 ${
                        formData[question.id] === option.value
                          ? 'bg-blue-100 border-blue-400 shadow-md'
                          : 'bg-gray-50 hover:bg-gray-100 border-transparent hover:border-gray-300'
                      }`}
                    >
                      <span className="text-3xl mb-2">{option.emoji}</span>
                      <span className="text-sm font-medium text-gray-700">{option.label}</span>
                    </button>
                  ))}
                </div>
                
                {formData[question.id] !== null && (
                  <div className="mt-4 text-center">
                    <span className="text-sm text-green-600 font-medium">✓ Answered</span>
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={!isFormComplete()}
                className={`px-8 py-3 rounded-lg font-medium text-white transition-colors ${
                  isFormComplete()
                    ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Submit Observation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Observation; 
