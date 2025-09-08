import React, { useState } from 'react';
import { Calendar, Clock, Video, Phone, Users, MessageSquare, Check, X } from 'lucide-react';

const ParentMeetings = () => {
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const meetings = [
    {
      id: 1,
      studentName: "John Doe",
      parentName: "Mr. & Mrs. Doe",
      date: "2024-03-20",
      time: "10:00 AM",
      type: "Video Call",
      status: "scheduled",
      topic: "Academic Progress Discussion"
    },
    {
      id: 2,
      studentName: "Koushik Bala",
      parentName: "Mrs. Smith",
      date: "2024-03-22",
      time: "2:30 PM",
      type: "In Person",
      status: "pending",
      topic: "Behavioral Concerns"
    }
  ];

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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Parent-Teacher Meetings</h1>
        <p className="text-yellow-100">Schedule and manage parent meetings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meeting List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Upcoming Meetings</h2>
            </div>
            <div className="p-4 space-y-4">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-yellow-500 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-800">
                          Meeting with {meeting.parentName}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          meeting.status === 'scheduled' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {meeting.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Student: {meeting.studentName}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{meeting.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{meeting.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getMeetingTypeIcon(meeting.type)}
                          <span>{meeting.type}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Topic: {meeting.topic}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule Meeting Form */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Schedule New Meeting</h2>
          </div>
          <div className="p-4">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter student name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter parent name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                  <option value="in-person">In Person</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows="3"
                  placeholder="Enter meeting topic"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Schedule Meeting
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentMeetings; 