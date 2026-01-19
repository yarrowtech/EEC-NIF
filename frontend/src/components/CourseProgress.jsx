import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, User, ChevronRight, GraduationCap } from 'lucide-react';

const CourseProgress = () => {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');

        if (!token || userType !== 'Student') return;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/student/auth/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Course data received:', data.course);
          setCourseData(data.course);
        }
      } catch (error) {
        console.error('Failed to fetch course data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-purple-400 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-purple-400">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Current Course</h2>
        </div>
      </div>

      <div className="p-6">
        {courseData ? (
          <div className="space-y-6">
            <div className="group hover:bg-gray-50 rounded-lg p-4 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-md">
                    <GraduationCap size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {courseData.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center space-x-1">
                        <BookOpen size={14} />
                        <span>{courseData.grade}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User size={14} />
                        <span>Section {courseData.section}</span>
                      </div>
                      {courseData.duration && (
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{courseData.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    courseData.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {courseData.status || 'Active'}
                  </div>
                  {courseData.batchCode && (
                    <div className="text-sm text-gray-500 mt-1">
                      Batch: {courseData.batchCode}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{courseData.grade}</div>
                  <div className="text-xs text-gray-600 mt-1">Grade</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{courseData.section}</div>
                  <div className="text-xs text-gray-600 mt-1">Section</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{courseData.status === 'Active' ? '✓' : '○'}</div>
                  <div className="text-xs text-gray-600 mt-1">Status</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <GraduationCap size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">No Course Assigned</p>
            <p className="text-sm text-gray-400 mt-1">Please contact your administrator</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseProgress;