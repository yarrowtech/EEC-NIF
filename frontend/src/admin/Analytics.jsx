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
  const [activeTab, setActiveTab] = useState('overview');
  // Fees chart filters
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('A');

  // (Time period filter removed)

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

  // Fees Collection (Bar Chart) with Class/Section dropdowns
  const classOptions = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const sectionOptions = ['A', 'B', 'C', 'D'];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const getSeed = (cls, sec) => {
    const s = (cls + '-' + sec).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return s % 97 + 3; // simple deterministic seed
  };

  const feesChartData = (() => {
    const seed = getSeed(selectedClass, selectedSection);
    const paid = months.map((_, i) => Math.round(50 + ((seed * (i + 1)) % 40))); // 50–90k
    const pending = months.map((_, i) => Math.round(20 + ((seed * (i + 3)) % 30))); // 20–50k
    return {
      labels: months,
      datasets: [
        {
          label: 'Paid (₹k)',
          data: paid,
          backgroundColor: '#10b981',
          borderRadius: 4,
        },
        {
          label: 'Pending (₹k)',
          data: pending,
          backgroundColor: '#ef4444',
          borderRadius: 4,
        },
      ],
    };
  })();

  const feesChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ₹${ctx.parsed.y}k`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Amount (₹ thousands)' },
      },
      x: { title: { display: true, text: 'Month' } },
    },
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

  // Derived summary stats
  const totalStudentsCount = 1245;
  const totalTeachersCount = 82;
  const presentPercentage = attendanceData.datasets[0].data[0];
  const presentStudentsCount = Math.round(totalStudentsCount * (presentPercentage / 100));
  const presentTeachersPercent = 92; // demo percent
  const presentTeachersCount = Math.round(totalTeachersCount * (presentTeachersPercent / 100));

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
        {/* Total Students */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Students</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">{totalStudentsCount.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">Updated today</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Present Students */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Present Students</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">{presentStudentsCount.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">{presentPercentage}% present</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Present Teachers */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Present Teachers</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">{presentTeachersCount}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">{presentTeachersPercent}% present</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M19 3v4M4 7h16M6 11h12M6 15h8M6 19h6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Attendance Today */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Attendance Today</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">{presentPercentage}%</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">Based on attendance breakdown</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

      {/* Fees Collection */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Fees Collection</h3>
            <p className="text-gray-600 text-sm">Paid vs Pending by month</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {classOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {sectionOptions.map(s => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="w-full h-80">
          <Bar data={feesChartData} options={feesChartOptions} />
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
