import React from 'react';
import AdminCongratulationsCard from './AdminCongratulationsCard';
import { ADMIN_STATS, ADMIN_EMPLOYEE_DATA } from './adminConstants';
import AdminAvatar from './Avatar';
import AdminProgressBar from './ProgressBar';
import {
  MoreHorizontal,
  Award,
  Users,
  GraduationCap,
  BookOpen,
  FileText
} from 'lucide-react';
import CredentialGeneratorButton from './components/CredentialGeneratorButton';

const AdminDashboard = () => {
  const statsCards = [
    {
      title: 'Total Students',
      value: ADMIN_STATS.totalStudents,
      icon: GraduationCap,
      color: 'bg-yellow-400',
      change: '+12%',
    },
    {
      title: 'Total Teachers',
      value: ADMIN_STATS.totalTeachers,
      icon: Users,
      color: 'bg-yellow-400',
      change: '+8%',
    },
    {
      title: 'Active Courses',
      value: ADMIN_STATS.totalCourses,
      icon: BookOpen,
      color: 'bg-yellow-400',
      change: '+5%',
    },
  ];

  return (
    <div className="w-full h-full space-y-6">
      {/* Header Section */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">School Dashboard</h2>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Welcome Card */}
        <div className="lg:col-span-8">
          <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome Back, Admin! 📚</h3>
            <p className="text-gray-700 mb-4">
              Let's make learning better! Check the latest updates and manage your school efficiently.
            </p>
            <button className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
              View School Reports
            </button>
          </div>
        </div>

        {/* Achievement Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl p-6 shadow-md h-full flex flex-col justify-center items-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Achievement Unlocked! 🏆</h3>
            <p className="text-gray-600 mb-4 text-center">Your school has achieved a 95% attendance rate this month!</p>
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                <Award size={40} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-md border border-yellow-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-green-600 text-sm">{stat.change} from last month</p>
                </div>
                <div className={`p-3 ${stat.color} rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teacher Performance Card */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-yellow-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Teacher Performance</h3>
            <button className="p-2 hover:bg-yellow-100 rounded-lg transition-colors">
              <MoreHorizontal size={20} className="text-gray-600" />
            </button>
          </div>
          
          <div className="space-y-6">
            {ADMIN_EMPLOYEE_DATA.map((teacher) => (
              <div key={teacher.id} className="flex items-center space-x-4">
                <AdminAvatar emoji={teacher.avatar} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-800">{teacher.name}</h4>
                    <span className="text-sm text-gray-500">{teacher.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{teacher.role}</p>
                  <AdminProgressBar 
                    progress={teacher.progress} 
                    color={teacher.color}
                    animated={true}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <CredentialGeneratorButton
              buttonText="Generate IDs & Passwords"
              buttonClassName="w-full justify-start bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
              allowRoleSelection
            />
            <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-3 text-left transition-colors flex items-center gap-2">
              <FileText size={20} /> Generate Attendance Report
            </button>
            <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-3 text-left transition-colors flex items-center gap-2">
              <Users size={20} /> Manage Students & Teachers
            </button>
            <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-3 text-left transition-colors flex items-center gap-2">
              <BookOpen size={20} /> Update Course Materials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
