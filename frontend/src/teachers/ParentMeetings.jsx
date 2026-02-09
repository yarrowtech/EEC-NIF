import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Phone, Users, MessageSquare, Check, X, AlertCircle, Trash2 } from 'lucide-react';
import axios from 'axios';

const ParentMeetings = () => {
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    studentId: '',
    title: '',
    topic: '',
    description: '',
    meetingDate: '',
    meetingTime: '',
    meetingType: 'In Person',
    location: '',
    meetingLink: ''
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchMeetings();
    fetchStudents();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/meeting/teacher/my-meetings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeetings(response.data);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError(err.response?.data?.error || 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/meeting/teacher/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchParentForStudent = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/meeting/teacher/student/${studentId}/parent`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      console.error('Error fetching parent:', err);
      throw err;
    }
  };

  const handleStudentChange = async (e) => {
    const studentId = e.target.value;
    setFormData({ ...formData, studentId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.studentId || !formData.title || !formData.topic || !formData.meetingDate || !formData.meetingTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Get parent for the selected student
      const parent = await fetchParentForStudent(formData.studentId);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/meeting/teacher/create`,
        {
          ...formData,
          parentId: parent._id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        await fetchMeetings();
        setFormData({
          studentId: '',
          title: '',
          topic: '',
          description: '',
          meetingDate: '',
          meetingTime: '',
          meetingType: 'In Person',
          location: '',
          meetingLink: ''
        });
        alert('Meeting scheduled successfully! Parent has been notified.');
      }
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError(err.response?.data?.error || 'Failed to schedule meeting');
      alert(err.response?.data?.error || 'Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/meeting/teacher/delete/${meetingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchMeetings();
      alert('Meeting deleted successfully');
    } catch (err) {
      console.error('Error deleting meeting:', err);
      alert(err.response?.data?.error || 'Failed to delete meeting');
    } finally {
      setLoading(false);
    }
  };

  const getMeetingTypeIcon = (type) => {
    switch (type) {
      case 'Video Call':
        return <Video className="w-4 h-4" />;
      case 'Phone Call':
        return <Phone className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Parent-Teacher Meetings</h1>
        <p className="text-yellow-100">Schedule and manage parent meetings</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meeting List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Upcoming Meetings</h2>
            </div>
            <div className="p-4 space-y-4">
              {loading && meetings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-2 animate-spin" />
                  <p>Loading meetings...</p>
                </div>
              ) : meetings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2" />
                  <p>No meetings scheduled yet</p>
                </div>
              ) : (
                meetings.map((meeting) => (
                  <div
                    key={meeting._id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-yellow-500 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-800">
                            {meeting.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                            {meeting.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Student: {meeting.studentId?.name} ({meeting.studentId?.grade} - {meeting.studentId?.section})
                        </p>
                        <p className="text-sm text-gray-500">
                          Parent: {meeting.parentId?.name}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(meeting.meetingDate)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{meeting.meetingTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {getMeetingTypeIcon(meeting.meetingType)}
                            <span>{meeting.meetingType}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          Topic: {meeting.topic}
                        </p>
                        {meeting.description && (
                          <p className="text-sm text-gray-600">
                            {meeting.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(meeting._id)}
                        className="ml-4 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Schedule Meeting Form */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Schedule New Meeting</h2>
          </div>
          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student *
                </label>
                <select
                  value={formData.studentId}
                  onChange={handleStudentChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.grade} - {student.section})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="e.g., Academic Discussion"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic *
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="e.g., Student Progress"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.meetingDate}
                    onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={formData.meetingTime}
                    onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Type *
                </label>
                <select
                  value={formData.meetingType}
                  onChange={(e) => setFormData({ ...formData, meetingType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="Video Call">Video Call</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="In Person">In Person</option>
                </select>
              </div>

              {formData.meetingType === 'In Person' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="e.g., Teacher's Office"
                  />
                </div>
              )}

              {formData.meetingType === 'Video Call' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows="3"
                  placeholder="Additional details about the meeting"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Scheduling...' : 'Schedule Meeting'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentMeetings;
