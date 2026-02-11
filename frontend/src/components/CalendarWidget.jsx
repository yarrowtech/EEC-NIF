import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, X, Edit3, Trash2, AlertCircle } from 'lucide-react';
import { useStudentDashboard } from './StudentDashboardContext';

const statusStyles = {
  present: { label: 'Present', color: 'bg-green-500' },
  absent: { label: 'Absent', color: 'bg-red-500' },
  late: { label: 'Late', color: 'bg-yellow-500' },
  leave: { label: 'Leave', color: 'bg-yellow-500' }
};

const baseEventTypes = [
  { value: 'quiz', label: 'Quiz', color: 'bg-red-500' },
  { value: 'assignment', label: 'Assignment', color: 'bg-blue-500' },
  { value: 'class', label: 'Class', color: 'bg-green-500' },
  { value: 'meeting', label: 'Meeting', color: 'bg-purple-500' },
  { value: 'exam', label: 'Exam', color: 'bg-orange-500' },
  { value: 'project', label: 'Project', color: 'bg-indigo-500' }
];

const attendanceEventTypes = Object.entries(statusStyles).map(([value, meta]) => ({
  value,
  label: meta.label,
  color: meta.color
}));

const eventTypes = [...baseEventTypes, ...attendanceEventTypes];

const defaultEvent = {
  title: '',
  date: '',
  time: '',
  type: 'assignment',
  description: '',
  color: 'bg-blue-500'
};

const mapAttendanceEvents = (records = []) =>
  records.flatMap((record, index) => {
    const parsedDate = new Date(record.date);
    if (Number.isNaN(parsedDate.getTime())) return [];
    const style = statusStyles[record.status] || { color: 'bg-blue-500', label: 'Class' };
    return {
      id: record._id || `attendance-${index}`,
      title: style.label,
      date: parsedDate.toISOString().split('T')[0],
      time: record.time || '',
      type: record.status || 'class',
      color: style.color,
      description: record.subject ? record.subject : 'Attendance entry',
      notes: record.notes,
      readOnly: true
    };
  });

const CalendarWidget = () => {
  const { recentAttendance } = useStudentDashboard();
  const seedEvents = useMemo(() => mapAttendanceEvents(recentAttendance || []), [recentAttendance]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [events, setEvents] = useState(seedEvents);
  const [newEvent, setNewEvent] = useState(defaultEvent);
  const [loading, setLoading] = useState(seedEvents.length === 0);
  const [error, setError] = useState(null);
  const [lastSynced, setLastSynced] = useState(seedEvents.length > 0 ? new Date() : null);

  useEffect(() => {
    if (events.length > 0 || seedEvents.length === 0) return;
    setEvents(seedEvents);
    setLoading(false);
    setLastSynced(new Date());
  }, [events.length, seedEvents]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchAttendanceEvents = async () => {
      try {
        setLoading(seedEvents.length === 0);
        setError(null);
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');

        if (!token || userType !== 'Student') {
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/student/auth/attendance`, {
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Unable to load attendance calendar.');
        }

        const data = await response.json();
        setEvents(mapAttendanceEvents(data.attendance || []));
        setLastSynced(new Date());
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Failed to fetch attendance calendar:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceEvents();
    return () => controller.abort();
  }, [seedEvents.length]);

  const monthNames = useMemo(() => ([
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]), []);

  const daysOfWeek = useMemo(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const cursor = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === cursor.toDateString();
      });

      days.push({
        date: new Date(cursor),
        isCurrentMonth: cursor.getMonth() === month,
        isToday: cursor.toDateString() === new Date().toDateString(),
        events: dayEvents
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    return days;
  };

  const resolveEventColor = (type) => statusStyles[type]?.color
    || eventTypes.find(eventType => eventType.value === type)?.color
    || 'bg-blue-500';

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleDateClick = (day) => {
    setSelectedDate(day.date);
    const formattedDate = day.date.toISOString().split('T')[0];
    setNewEvent(prev => ({ ...prev, date: formattedDate }));
  };

  const handleAddEvent = () => {
    setShowEventModal(true);
    setEditingEvent(null);
    setNewEvent({
      ...defaultEvent,
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : ''
    });
  };

  const handleEditEvent = (event) => {
    if (event.readOnly) return;
    setEditingEvent(event);
    setNewEvent({ ...event });
    setShowEventModal(true);
  };

  const handleDeleteEvent = (eventId) => {
    const event = events.find(ev => ev.id === eventId);
    if (event?.readOnly) return;
    setEvents(events.filter(ev => ev.id !== eventId));
  };

  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;

    const eventData = {
      ...newEvent,
      color: resolveEventColor(newEvent.type),
      id: editingEvent ? editingEvent.id : Date.now(),
      readOnly: false
    };

    if (editingEvent) {
      setEvents(events.map(event => (event.id === editingEvent.id ? eventData : event)));
    } else {
      setEvents([...events, eventData]);
    }

    setShowEventModal(false);
    setNewEvent(defaultEvent);
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    return events
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  };

  const days = getDaysInMonth(currentDate);
  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 max-w-4xl mx-auto">
      <div className="p-6 border-b border-purple-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Calendar className="text-purple-500" size={20} />
            <h2 className="text-lg font-semibold text-purple-900">Calendar</h2>
          </div>
          <div className="flex items-center gap-3">
            {lastSynced && (
              <span className="text-xs text-purple-800 bg-purple-100 px-2 py-1 rounded-full">
                Synced {lastSynced.toLocaleDateString()}
              </span>
            )}
            {/* <button
              onClick={handleAddEvent}
              className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Plus size={16} />
              <span>Add Event</span>
            </button> */}
          </div>
        </div>
        {error && (
          <div className="mt-3 flex items-center text-sm text-red-600 bg-white border border-red-100 rounded-lg px-3 py-2">
            <AlertCircle size={16} className="mr-2" />
            {error}
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-purple-700" />
          </button>

          <h3 className="text-lg font-semibold text-purple-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>

          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-purple-900" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-purple-600 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-6">
          {days.map((day, index) => (
            <button
              key={`${day.date.toISOString()}-${index}`}
              onClick={() => handleDateClick(day)}
              className={`
                aspect-square flex flex-col items-center justify-center text-sm rounded-lg transition-colors relative p-1
                ${day.isCurrentMonth 
                  ? day.isToday 
                    ? 'bg-purple-500 text-black font-semibold hover:bg-purple-600' 
                    : 'text-purple-900 hover:bg-purple-100'
                  : 'text-purple-300 hover:bg-purple-50'
                }
                ${selectedDate && day.date.toDateString() === selectedDate.toDateString() 
                  ? 'ring-2 ring-purple-400' 
                  : ''
                }
              `}
            >
              <span className="text-xs">{day.date.getDate()}</span>
              {day.events.length > 0 && (
                <div className="flex space-x-1 mt-1">
                  {day.events.slice(0, 2).map((event, i) => (
                    <div
                      key={`${event.id}-${i}`}
                      className={`w-1.5 h-1.5 rounded-full ${event.color}`}
                      title={event.title}
                    />
                  ))}
                  {day.events.length > 2 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" title={`+${day.events.length - 2} more`} />
                  )}
                </div>
              )}
            </button>
          ))}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-purple-900 mb-3 flex items-center space-x-2">
            <Clock size={16} className="text-purple-600" />
            <span>Upcoming Events</span>
          </h4>

          <div className="space-y-3">
            {loading && (
              <div className="space-y-2">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="h-16 bg-white border border-purple-100 rounded-lg animate-pulse" />
                ))}
              </div>
            )}
            {!loading && upcomingEvents.length === 0 && !error && (
              <p className="text-sm text-purple-500 text-center py-4">No upcoming classes or events recorded yet.</p>
            )}

            {!loading && upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-start space-x-3 p-3 bg-purple-50/50 hover:bg-purple-100/50 transition-colors rounded-lg border border-purple-100 group">
                <div className={`w-3 h-3 rounded-full ${event.color} mt-1.5 flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-purple-900 truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-purple-600">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {event.time && ` at ${event.time}`}
                  </p>
                  {event.description && (
                    <p className="text-xs text-purple-500 mt-1 truncate">
                      {event.description}{event.notes ? ` • ${event.notes}` : ''}
                    </p>
                  )}
                </div>
                {!event.readOnly && (
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-200 rounded"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Enter event title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  {eventTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  rows="3"
                  placeholder="Enter event description"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEvent}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;
