import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Users, Calendar, FileText, Download, Loader2 } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const CoursesView = () => {
  const [selectedChildId, setSelectedChildId] = useState('');
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadChildren = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Login required');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/api/parent/auth/profile`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to load children');
        }

        const childList = Array.isArray(data.children) ? data.children : [];
        setChildren(childList);
        if (childList.length > 0 && !selectedChildId) {
          setSelectedChildId(childList[0]);
        }
      } catch (err) {
        setError(err.message || 'Could not load children data');
      } finally {
        setLoading(false);
      }
    };

    loadChildren();
  }, []);

  const selectedChild = children.find(child => child === selectedChildId) || children[0];

  const coursesData = {
    studentName: selectedChild || "Select a child",
    class: "10-A",
    totalCourses: 6,
    completedModules: 24,
    upcomingAssignments: 3,
    courses: [
      {
        id: 1,
        name: "Advanced Mathematics",
        teacher: "Dr. Sarah Johnson",
        schedule: "Mon, Wed, Fri - 9:00 AM",
        progress: 85,
        modules: 8,
        completedModules: 6,
        nextAssignment: "2024-03-15",
        materials: ["Textbook", "Practice Sheets", "Video Lectures"]
      },
      {
        id: 2,
        name: "Physics",
        teacher: "Prof. Michael Chen",
        schedule: "Tue, Thu - 10:30 AM",
        progress: 75,
        modules: 6,
        completedModules: 4,
        nextAssignment: "2024-03-18",
        materials: ["Lab Manual", "Study Guide", "Online Simulations"]
      },
      {
        id: 3,
        name: "English Literature",
        teacher: "Ms. Emily Davis",
        schedule: "Mon, Wed - 2:00 PM",
        progress: 90,
        modules: 5,
        completedModules: 4,
        nextAssignment: "2024-03-20",
        materials: ["Novel Collection", "Writing Guide", "Audio Books"]
      }
    ]
  };

  return (
    <div className="w-full p-2 sm:p-3 md:p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Courses</h1>
        <p className="text-yellow-100 text-sm sm:text-base">View your child's enrolled courses</p>
      </div>

      {/* Child Selector */}
      <div className="bg-white rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <Users className="w-5 h-5 text-yellow-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Select Child</h3>
        </div>
        <select
          value={selectedChildId}
          onChange={(e) => setSelectedChildId(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
          disabled={loading}
        >
          <option value="">Select a child</option>
          {children.map((child, index) => (
            <option key={index} value={child}>
              {child}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-8 border border-gray-100 flex items-center justify-center text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading courses...
        </div>
      ) : !selectedChild ? (
        <div className="bg-white rounded-xl p-8 border border-gray-100 text-gray-500 text-center">
          Please select a child to view courses.
        </div>
      ) : (
        <>
      {/* Student Info & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-4">Student Info</h3>
          <div className="space-y-1 sm:space-y-2">
            <p className="text-gray-600 text-sm sm:text-base">Name: {coursesData.studentName}</p>
            <p className="text-gray-600 text-sm sm:text-base">Class: {coursesData.class}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-xl sm:text-2xl font-bold text-yellow-600">{coursesData.totalCourses}</h3>
          <p className="text-gray-600 text-sm sm:text-base">Total Courses</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-xl sm:text-2xl font-bold text-blue-600">{coursesData.completedModules}</h3>
          <p className="text-gray-600 text-sm sm:text-base">Completed Modules</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-xl sm:text-2xl font-bold text-red-600">{coursesData.upcomingAssignments}</h3>
          <p className="text-gray-600 text-sm sm:text-base">Upcoming Assignments</p>
        </div>
      </div>

      {/* Course List */}
      <div className="space-y-4 sm:space-y-6">
        {coursesData.courses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">{course.name}</h3>
                  </div>
                  <div className="flex flex-wrap items-center space-x-4 text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{course.teacher}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.schedule}</span>
                    </div>
                  </div>
                </div>
                <button className="flex items-center space-x-1 text-xs sm:text-sm text-yellow-600 hover:text-yellow-700">
                  <Download className="w-4 h-4" />
                  <span>Materials</span>
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
                    <span className="text-gray-600">Course Progress</span>
                    <span className="font-medium text-gray-800">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                {/* Course Stats */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Modules</p>
                    <p className="font-medium text-gray-800">{course.completedModules}/{course.modules}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Next Assignment</p>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="font-medium text-gray-800">{new Date(course.nextAssignment).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Materials</p>
                    <p className="font-medium text-gray-800">{course.materials.length} items</p>
                  </div>
                </div>

                {/* Course Materials */}
                <div className="pt-3 sm:pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Available Materials</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {course.materials.map((material, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 sm:px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
        </>
      )}
    </div>
  );
};

export default CoursesView;
