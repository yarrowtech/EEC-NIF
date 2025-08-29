import { useState, useEffect } from 'react';
import { Line, Pie, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = ({ setShowAdminHeader }) => {
  const [timeFilter, setTimeFilter] = useState('last6months');
  const [activeTab, setActiveTab] = useState('overview');

  const handleTimeFilterChange = (e) => {
    setTimeFilter(e.target.value);
  };

  // making the admin header invisible
  useEffect(() => {
    setShowAdminHeader(true);
  }, []);

  // Data for Student Performance Trend (Line Chart)
  const performanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Class 10-A',
        data: [75, 78, 80, 82, 85, 88],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Class 9-B',
        data: [68, 72, 75, 78, 80, 82],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Class 11-C',
        data: [80, 82, 79, 85, 87, 90],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const performanceOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 60,
        max: 100,
        title: {
          display: true,
          text: 'Performance Score (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
    },
  };

  // Data for Attendance Breakdown (Pie Chart)
  const attendanceData = {
    labels: ['Present', 'Absent', 'Late', 'Excused'],
    datasets: [
      {
        label: 'Attendance',
        data: [85, 8, 4, 3],
        backgroundColor: ['#34d399', '#ef4444', '#facc15', '#93c5fd'],
        borderWidth: 0,
      },
    ],
  };

  const attendanceOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  // Data for Course Progress (Bar Chart)
  const courseProgressData = {
    labels: ['Mathematics', 'Science', 'History', 'English', 'Art', 'Physics', 'Chemistry'],
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: [85, 70, 65, 90, 60, 75, 68],
        backgroundColor: [
          '#8b5cf6',
          '#10b981',
          '#f59e0b',
          '#3b82f6',
          '#ec4899',
          '#6366f1',
          '#14b8a6'
        ],
        borderRadius: 4,
      },
    ],
  };

  const courseProgressOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Completion Rate (%)',
        },
      },
    },
  };

  // Data for Assignment Submission (Doughnut Chart)
  const assignmentData = {
    labels: ['Submitted', 'Pending', 'Late', 'Not Submitted'],
    datasets: [
      {
        label: 'Assignments',
        data: [72, 15, 8, 5],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6b7280'],
        borderWidth: 0,
      },
    ],
  };

  // Data for Grade Distribution
  const gradeDistributionData = {
    labels: ['A (90-100)', 'B (80-89)', 'C (70-79)', 'D (60-69)', 'F (<60)'],
    datasets: [
      {
        label: 'Students',
        data: [120, 185, 210, 95, 40],
        backgroundColor: [
          '#10b981',
          '#3b82f6',
          '#f59e0b',
          '#ef4444',
          '#6b7280'
        ],
        borderRadius: 4,
      },
    ],
  };

  // Teacher Activity Data
  const teacherActivities = [
    { id: 1, name: 'Ms. Johnson', action: 'Created Lesson', date: 'Jun 15, 2025', details: 'Algebra Basics for Class 8', avatarColor: 'bg-blue-500' },
    { id: 2, name: 'Mr. Patel', action: 'Graded Exam', date: 'Jun 14, 2025', details: 'Midterm Science Exam - Class 9', avatarColor: 'bg-green-500' },
    { id: 3, name: 'Ms. Smith', action: 'Updated Timetable', date: 'Jun 13, 2025', details: 'Added extra session for History', avatarColor: 'bg-purple-500' },
    { id: 4, name: 'Mr. Davis', action: 'Uploaded Resources', date: 'Jun 12, 2025', details: 'Chemistry lab manual', avatarColor: 'bg-yellow-500' },
    { id: 5, name: 'Ms. Garcia', action: 'Created Assignment', date: 'Jun 11, 2025', details: 'English essay - due Jun 18', avatarColor: 'bg-pink-500' },
  ];

  // Upcoming Events Data
  const upcomingEvents = [
    { id: 1, title: 'Final Exams', date: 'Jul 5, 2025', type: 'exam' },
    { id: 2, title: 'Parent-Teacher Meeting', date: 'Jul 12, 2025', type: 'meeting' },
    { id: 3, title: 'Science Fair', date: 'Jul 20, 2025', type: 'event' },
    { id: 4, title: 'End of Term', date: 'Jul 30, 2025', type: 'academic' },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 lg:mb-0">Analytics Dashboard</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-3">
            <label htmlFor="time-filter" className="text-gray-700 font-medium whitespace-nowrap">
              Time Period:
            </label>
            <select
              id="time-filter"
              value={timeFilter}
              onChange={handleTimeFilterChange}
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last6months">Last 6 Months</option>
              <option value="lastyear">Last Year</option>
            </select>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-1 flex">
            <button 
              className={`px-3 py-1 rounded-md text-sm font-medium ${activeTab === 'overview' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm font-medium ${activeTab === 'detailed' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('detailed')}
            >
              Detailed
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Students</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">1,245</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <span className="inline-block mr-1">+5.2%</span> from last month
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Teachers</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">82</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <span className="inline-block mr-1">+2.4%</span> from last month
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Average Attendance</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">92%</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <span className="inline-block mr-1">+1.8%</span> from last month
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Course Completion</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">78%</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <span className="inline-block mr-1">+3.7%</span> from last month
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Student Performance Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Student Performance Trend</h3>
          <p className="text-gray-600 text-sm mb-4">Average performance scores by class over time</p>
          <div className="w-full h-80">
            <Line data={performanceData} options={performanceOptions} />
          </div>
        </div>

        {/* Course Progress */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Course Progress</h3>
          <p className="text-gray-600 text-sm mb-4">Completion rates for active courses</p>
          <div className="w-full h-80">
            <Bar data={courseProgressData} options={courseProgressOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Attendance Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Attendance Breakdown</h3>
          <p className="text-gray-600 text-sm mb-4">Distribution of student attendance</p>
          <div className="w-full max-w-xs mx-auto h-64">
            <Pie data={attendanceData} options={attendanceOptions} />
          </div>
        </div>

        {/* Assignment Submission */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Assignment Status</h3>
          <p className="text-gray-600 text-sm mb-4">Current assignment submission rates</p>
          <div className="w-full max-w-xs mx-auto h-64">
            <Doughnut data={assignmentData} options={attendanceOptions} />
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Grade Distribution</h3>
          <p className="text-gray-600 text-sm mb-4">Distribution of student grades</p>
          <div className="w-full h-64">
            <Bar 
              data={gradeDistributionData} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Students',
                    },
                  },
                },
              }} 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teacher Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Teacher Activity</h3>
          <div className="space-y-4">
            {teacherActivities.map(activity => (
              <div key={activity.id} className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`h-10 w-10 rounded-full ${activity.avatarColor} flex items-center justify-center text-white font-medium mr-3`}>
                  {activity.name.split(' ')[0][0]}{activity.name.split(' ')[1][0]}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-800">{activity.name}</h4>
                    <span className="text-xs text-gray-500">{activity.date}</span>
                  </div>
                  <p className="text-sm text-gray-700">{activity.action}: <span className="text-gray-600">{activity.details}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Events</h3>
          <div className="space-y-4">
            {upcomingEvents.map(event => (
              <div key={event.id} className="p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-800">{event.title}</h4>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full capitalize">{event.type}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {event.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;