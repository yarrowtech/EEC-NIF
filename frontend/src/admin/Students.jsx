import React, { useState, useEffect } from "react";
import { Mail, Phone, Calendar, ChevronDown, Hash, BookOpen } from 'lucide-react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  MoreVertical,
  Heart,
  AlertCircle,
  CheckCircle,
  IndianRupee,
  Smile,
  Frown,
  Meh,
  TrendingUp,
  TrendingDown,
  Brain,
  Users,
  Eye,
  MessageCircle,
  Star,
  X,
} from "lucide-react";

const Students = ({ setShowAdminHeader }) => {
  const [studentData, setStudentData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showWellbeingModal, setShowWellbeingModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [wellbeingData, setWellbeingData] = useState({});
  const [courses, setCourses] = useState([]);
  const [newStudent, setNewStudent] = useState({
    name: "",
    roll: "",
    grade: "",
    section: "",
    gender: "",
    mobile: "",
    email: "",
    address: "",
    dob: "",
    pincode: "",
    course: "",
    status: "Active",
  });

  const filteredStudents = studentData.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll.includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper functions for new features
  const getTodayAttendance = (student) => {
    if (!student.attendance || student.attendance.length === 0) return null;
    const today = new Date().toDateString();
    return student.attendance.find(
      (att) => new Date(att.date).toDateString() === today
    );
  };

  const getHealthStatus = (student) => {
    // Mock health status - in real app, this would come from backend
    const healthStatuses = ["healthy", "sick", "injured", "absent-sick"];
    return (
      student.healthStatus ||
      healthStatuses[Math.floor(Math.random() * healthStatuses.length)]
    );
  };

  const getFeesStatus = () => {
    // Mock fees data - integrate with actual fees system
    const mockFees = {
      totalDue: 18700,
      paidAmount: Math.floor(Math.random() * 18700),
      dueDate: "2024-02-15",
    };
    mockFees.dueAmount = mockFees.totalDue - mockFees.paidAmount;
    mockFees.status =
      mockFees.dueAmount === 0
        ? "paid"
        : mockFees.dueAmount < mockFees.totalDue
        ? "partial"
        : "due";
    return mockFees;
  };

  // Emotional Wellbeing Functions
  const getWellbeingStatus = (studentId) => {
    if (!wellbeingData[studentId]) {
      // Initialize with random data for demo
      const moods = ["excellent", "good", "neutral", "concerning", "critical"];
      const mood = moods[Math.floor(Math.random() * moods.length)];
      const socialEngagement = Math.floor(Math.random() * 10) + 1;
      const academicStress = Math.floor(Math.random() * 10) + 1;
      const behaviorChanges = Math.random() > 0.7;

      setWellbeingData((prev) => ({
        ...prev,
        [studentId]: {
          mood,
          socialEngagement,
          academicStress,
          behaviorChanges,
          lastAssessment: new Date().toISOString().split("T")[0],
          notes: "",
          interventions: [],
          counselingSessions: Math.floor(Math.random() * 5),
          parentNotifications: Math.floor(Math.random() * 3),
        },
      }));
      return { mood, socialEngagement, academicStress, behaviorChanges };
    }
    return wellbeingData[studentId];
  };

  const getMoodIcon = (mood) => {
    const moodIcons = {
      excellent: { icon: Smile, color: "text-green-600", bg: "bg-green-100" },
      good: { icon: Smile, color: "text-blue-600", bg: "bg-blue-100" },
      neutral: { icon: Meh, color: "text-yellow-600", bg: "bg-yellow-100" },
      concerning: {
        icon: Frown,
        color: "text-orange-600",
        bg: "bg-orange-100",
      },
      critical: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
    };
    return moodIcons[mood] || moodIcons.neutral;
  };

  const updateWellbeingData = (studentId, updates) => {
    setWellbeingData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        ...updates,
        lastAssessment: new Date().toISOString().split("T")[0],
      },
    }));
  };

  const openWellbeingModal = (student) => {
    console.log("Opening wellbeing modal for student:", student);
    setSelectedStudent(student);
    setShowWellbeingModal(true);
  };

  // ensure admin header/context is visible on this page
  useEffect(() => {
    setShowAdminHeader(true);

    // Fetch students
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/get-students`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch students");
        }
        return res.json();
      })
      .then((data) => {
        setStudentData(data);
      })
      .catch((err) => {
        console.error("Error fetching students:", err);
      });

    // Fetch courses for course selection
    fetch(`${import.meta.env.VITE_API_URL}/api/course/fetch`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch courses");
        }
        return res.json();
      })
      .then((data) => {
        setCourses(data);
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
      });
  }, [setShowAdminHeader]);

  const handleAddStudentChange = (e) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/student/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newStudent),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      console.error("Registration failed:", data);
      throw new Error("Registration failed");
    }
    console.log("New student added:", data);
    // Here you would send newStudent to backend or update state
    setShowAddForm(false);
    setNewStudent({
      name: "",
      roll: "",
      grade: "",
      section: "",
      gender: "",
      mobile: "",
      email: "",
      address: "",
      dob: "",
      pincode: "",
      course: "",
      status: "Active",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100 p-8">
      <div className="max-w-7xl mx-auto bg-white/90 rounded-2xl shadow-2xl p-8 border border-yellow-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-700">
              Student Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and monitor student information, health status, attendance,
              and fees
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Student
            </button>
            <button
              onClick={() => {
                console.log("Test modal clicked");
                setSelectedStudent({
                  id: "test",
                  name: "Test Student",
                  roll: "001",
                  grade: "10",
                  section: "A",
                });
                setShowWellbeingModal(true);
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Brain size={16} />
              Test Wellbeing Modal
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">
                  Total Students
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {studentData.length}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {studentData.length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">
                  Present Today
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {
                    studentData.filter(
                      (s) => getTodayAttendance(s)?.status === "present"
                    ).length
                  }
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">
                  Health Issues
                </h3>
                <p className="text-2xl font-bold text-red-600">
                  {
                    studentData.filter((s) => {
                      const health = getHealthStatus(s);
                      return (
                        health === "sick" ||
                        health === "injured" ||
                        health === "absent-sick"
                      );
                    }).length
                  }
                </p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">
                  Fees Pending
                </h3>
                <p className="text-2xl font-bold text-orange-600">
                  {
                    studentData.filter(() => {
                      const fees = getFeesStatus();
                      return fees.status !== "paid";
                    }).length
                  }
                </p>
              </div>
              <IndianRupee className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">
                  Wellbeing Alert
                </h3>
                <p className="text-2xl font-bold text-purple-600">
                  {
                    studentData.filter((student) => {
                      const wellbeing = getWellbeingStatus(student.id);
                      return (
                        wellbeing.mood === "concerning" ||
                        wellbeing.mood === "critical"
                      );
                    }).length
                  }
                </p>
              </div>
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[240px] relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 min-w-[160px] flex-shrink-0">
            <option value="">All Classes</option>
            <option value="X">Class X</option>
            <option value="IX">Class IX</option>
            {/* Add more class options */}
          </select>
          <select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 min-w-[160px] flex-shrink-0">
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            {/* Add more section options */}
          </select>
          <select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 min-w-[180px] flex-shrink-0">
            <option value="">All Health Status</option>
            <option value="healthy">Healthy</option>
            <option value="sick">Sick</option>
            <option value="injured">Injured</option>
            <option value="absent-sick">Absent (Sick)</option>
          </select>
          <select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 min-w-[180px] flex-shrink-0">
            <option value="">All Attendance</option>
            <option value="present">Present Today</option>
            <option value="absent">Absent Today</option>
            <option value="not-marked">Not Marked</option>
          </select>
          <select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 min-w-[160px] flex-shrink-0">
            <option value="">All Wellbeing</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="neutral">Neutral</option>
            <option value="concerning">Concerning</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-yellow-50">
                <th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">
                  Name
                </th>
                <th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">
                  Roll No.
                </th>
                <th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">
                  Class
                </th>
                <th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">
                  Section
                </th>
                <th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">
                  Health Status
                </th>
                <th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">
                  Attendance Today
                </th>
                <th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">
                  Wellbeing
                </th>
                <th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">
                  Fees Due
                </th>
                <th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">
                  Phone
                </th>
                <th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-yellow-50 transition-colors"
                >
                  <td className="border-b border-yellow-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-yellow-100 px-6 py-4 text-gray-600">
                    {student.roll}
                  </td>
                  <td className="border-b border-yellow-100 px-6 py-4 text-gray-600">
                    {student.grade}
                  </td>
                  <td className="border-b border-yellow-100 px-6 py-4 text-gray-600">
                    {student.section}
                  </td>

                  {/* Health Status */}
                  <td className="border-b border-yellow-100 px-6 py-4">
                    {(() => {
                      const healthStatus = getHealthStatus(student);
                      const healthConfig = {
                        healthy: {
                          icon: Heart,
                          color: "text-green-600",
                          bg: "bg-green-100",
                          text: "Healthy",
                        },
                        sick: {
                          icon: AlertCircle,
                          color: "text-red-600",
                          bg: "bg-red-100",
                          text: "Sick",
                        },
                        injured: {
                          icon: AlertCircle,
                          color: "text-orange-600",
                          bg: "bg-orange-100",
                          text: "Injured",
                        },
                        "absent-sick": {
                          icon: AlertCircle,
                          color: "text-red-600",
                          bg: "bg-red-100",
                          text: "Absent (Sick)",
                        },
                      };
                      const config =
                        healthConfig[healthStatus] || healthConfig.healthy;
                      const Icon = config.icon;
                      return (
                        <div className="flex items-center gap-2">
                          <Icon size={16} className={config.color} />
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}
                          >
                            {config.text}
                          </span>
                        </div>
                      );
                    })()}
                  </td>

                  {/* Today's Attendance */}
                  <td className="border-b border-yellow-100 px-6 py-4">
                    {(() => {
                      const todayAttendance = getTodayAttendance(student);
                      if (!todayAttendance) {
                        return (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            <Calendar size={12} className="mr-1" />
                            Not Marked
                          </span>
                        );
                      }
                      return (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            todayAttendance.status === "present"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {todayAttendance.status === "present" ? (
                            <>
                              <CheckCircle size={12} className="mr-1" />
                              Present
                            </>
                          ) : (
                            <>
                              <AlertCircle size={12} className="mr-1" />
                              Absent
                            </>
                          )}
                        </span>
                      );
                    })()}
                  </td>

                  {/* Emotional Wellbeing */}
                  <td className="border-b border-yellow-100 px-6 py-4">
                    {(() => {
                      const wellbeing = getWellbeingStatus(student.id);
                      const moodConfig = getMoodIcon(wellbeing.mood);
                      const Icon = moodConfig.icon;
                      return (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Icon size={16} className={moodConfig.color} />
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${moodConfig.bg} ${moodConfig.color}`}
                            >
                              {wellbeing.mood.charAt(0).toUpperCase() +
                                wellbeing.mood.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Stress: {wellbeing.academicStress}/10</span>
                            {wellbeing.behaviorChanges && (
                              <AlertCircle
                                size={12}
                                className="text-orange-500"
                                title="Behavior changes noted"
                              />
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log(
                                "View Details clicked for:",
                                student.name
                              );
                              openWellbeingModal(student);
                            }}
                            className="text-xs text-purple-600 hover:text-purple-800 font-medium cursor-pointer"
                          >
                            View Details
                          </button>
                        </div>
                      );
                    })()}
                  </td>

                  {/* Fees Due */}
                  <td className="border-b border-yellow-100 px-6 py-4">
                    {(() => {
                      const feesStatus = getFeesStatus();
                      return (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <IndianRupee size={12} className="text-gray-500" />
                            <span
                              className={`text-sm font-medium ${
                                feesStatus.status === "paid"
                                  ? "text-green-600"
                                  : feesStatus.status === "partial"
                                  ? "text-orange-600"
                                  : "text-red-600"
                              }`}
                            >
                              ₹{feesStatus.dueAmount.toLocaleString()}
                            </span>
                          </div>
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              feesStatus.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : feesStatus.status === "partial"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {feesStatus.status === "paid"
                              ? "Paid"
                              : feesStatus.status === "partial"
                              ? "Partial"
                              : "Due"}
                          </span>
                        </div>
                      );
                    })()}
                  </td>

                  <td className="border-b border-yellow-100 px-6 py-4 text-gray-600">
                    {student.mobile}
                  </td>
                  {/* <td className="border-b border-yellow-100 px-6 py-4">
										<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
											{student.status}
										</span>
									</td> */}
                  <td className="border-b border-yellow-100 px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                        title="Mark Present"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                        title="Mark Absent"
                      >
                        <AlertCircle size={16} />
                      </button>
                      <button
                        className="text-purple-600 hover:text-purple-800 p-1 rounded hover:bg-purple-50"
                        title="Health Status"
                      >
                        <Heart size={16} />
                      </button>
                      <button
                        className="text-orange-600 hover:text-orange-800 p-1 rounded hover:bg-orange-50"
                        title="Fees"
                      >
                        <IndianRupee size={16} />
                      </button>
                      <button
                        className="text-purple-600 hover:text-purple-800 p-1 rounded hover:bg-purple-50"
                        title="Wellbeing Assessment"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Brain icon clicked for:", student.name);
                          openWellbeingModal(student);
                        }}
                      >
                        <Brain size={16} />
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50">
                        <Edit2 size={16} />
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-gray-600">
            Showing {filteredStudents.length} of {studentData.length} students
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-yellow-50">
              Previous
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-yellow-50">
              Next
            </button>
          </div>
        </div>

        {/* Emotional Wellbeing Modal */}
        {showWellbeingModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Emotional Wellbeing Assessment
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {selectedStudent.name} • Roll: {selectedStudent.roll} •
                      Class: {selectedStudent.grade}-{selectedStudent.section}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowWellbeingModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Current Status Overview */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Current Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(() => {
                      const wellbeing = getWellbeingStatus(selectedStudent.id);
                      const moodConfig = getMoodIcon(wellbeing.mood);
                      const MoodIcon = moodConfig.icon;
                      return (
                        <>
                          <div className="text-center">
                            <div
                              className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${moodConfig.bg} mb-2`}
                            >
                              <MoodIcon
                                className={`w-8 h-8 ${moodConfig.color}`}
                              />
                            </div>
                            <h4 className="font-medium text-gray-900">
                              Overall Mood
                            </h4>
                            <p
                              className={`text-sm font-medium ${moodConfig.color}`}
                            >
                              {wellbeing.mood.charAt(0).toUpperCase() +
                                wellbeing.mood.slice(1)}
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-2">
                              <Users className="w-8 h-8 text-blue-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">
                              Social Engagement
                            </h4>
                            <p className="text-sm font-medium text-blue-600">
                              {wellbeing.socialEngagement}/10
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-2">
                              <TrendingUp className="w-8 h-8 text-orange-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">
                              Academic Stress
                            </h4>
                            <p className="text-sm font-medium text-orange-600">
                              {wellbeing.academicStress}/10
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Assessment Form */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Update Assessment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mood Rating
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={
                          wellbeingData[selectedStudent.id]?.mood || "neutral"
                        }
                        onChange={(e) =>
                          updateWellbeingData(selectedStudent.id, {
                            mood: e.target.value,
                          })
                        }
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="neutral">Neutral</option>
                        <option value="concerning">Concerning</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Social Engagement (1-10)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        className="w-full"
                        value={
                          wellbeingData[selectedStudent.id]?.socialEngagement ||
                          5
                        }
                        onChange={(e) =>
                          updateWellbeingData(selectedStudent.id, {
                            socialEngagement: parseInt(e.target.value),
                          })
                        }
                      />
                      <div className="text-center text-sm text-gray-600 mt-1">
                        {wellbeingData[selectedStudent.id]?.socialEngagement ||
                          5}
                        /10
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Academic Stress (1-10)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        className="w-full"
                        value={
                          wellbeingData[selectedStudent.id]?.academicStress || 5
                        }
                        onChange={(e) =>
                          updateWellbeingData(selectedStudent.id, {
                            academicStress: parseInt(e.target.value),
                          })
                        }
                      />
                      <div className="text-center text-sm text-gray-600 mt-1">
                        {wellbeingData[selectedStudent.id]?.academicStress || 5}
                        /10
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="behaviorChanges"
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                        checked={
                          wellbeingData[selectedStudent.id]?.behaviorChanges ||
                          false
                        }
                        onChange={(e) =>
                          updateWellbeingData(selectedStudent.id, {
                            behaviorChanges: e.target.checked,
                          })
                        }
                      />
                      <label
                        htmlFor="behaviorChanges"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Behavior changes observed
                      </label>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows="3"
                      placeholder="Add any observations, concerns, or notes..."
                      value={wellbeingData[selectedStudent.id]?.notes || ""}
                      onChange={(e) =>
                        updateWellbeingData(selectedStudent.id, {
                          notes: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Support Actions */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Support & Interventions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-medium text-gray-900">
                        Counseling Sessions
                      </h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {wellbeingData[selectedStudent.id]
                          ?.counselingSessions || 0}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <Users className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <h4 className="font-medium text-gray-900">
                        Parent Meetings
                      </h4>
                      <p className="text-2xl font-bold text-yellow-600">
                        {wellbeingData[selectedStudent.id]
                          ?.parentNotifications || 0}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-medium text-gray-900">
                        Interventions
                      </h4>
                      <p className="text-2xl font-bold text-green-600">
                        {wellbeingData[selectedStudent.id]?.interventions
                          ?.length || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                      <MessageCircle size={16} />
                      Schedule Counseling
                    </button>
                    <button className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-2">
                      <Users size={16} />
                      Notify Parents
                    </button>
                    <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                      <Star size={16} />
                      Add Intervention
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowWellbeingModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Save Assessment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Student Form Modal */}
        {/* Add Student Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Enroll New Student
                      </h2>
                      <p className="text-yellow-100 mt-1">
                        Complete all sections to register student
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                  {["Personal", "Academic", "Review"].map((step, index) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                          index === 0
                            ? "bg-yellow-500 border-yellow-500 text-white"
                            : "border-gray-300 text-gray-500"
                        } font-semibold text-sm`}
                      >
                        {index + 1}
                      </div>
                      <span
                        className={`ml-2 text-sm font-medium ${
                          index === 0 ? "text-yellow-600" : "text-gray-500"
                        }`}
                      >
                        {step}
                      </span>
                      {index < 2 && (
                        <div className="w-12 h-0.5 bg-gray-300 mx-4" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <form onSubmit={handleAddStudentSubmit} className="space-y-8">
                  {/* Personal Details Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Users className="w-3 h-3 text-yellow-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Personal Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name Field */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Full Name
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="name"
                            value={newStudent.name}
                            onChange={handleAddStudentChange}
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                            placeholder="Enter student's full name"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Users className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {/* Email Field */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Email Address
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            name="email"
                            value={newStudent.email}
                            onChange={handleAddStudentChange}
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                            placeholder="student@example.com"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Mail className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {/* Mobile Field */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Mobile Number
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            name="mobile"
                            value={newStudent.mobile}
                            onChange={handleAddStudentChange}
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                            placeholder="+91 98765 43210"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Phone className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Date of Birth
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            name="dob"
                            value={newStudent.dob}
                            onChange={handleAddStudentChange}
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Gender
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                          name="gender"
                          value={newStudent.gender}
                          onChange={handleAddStudentChange}
                          required
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all appearance-none bg-white"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      {/* Pincode */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Pincode
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={newStudent.pincode}
                          onChange={handleAddStudentChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                          placeholder="Enter 6-digit pincode"
                          maxLength="6"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={newStudent.address}
                        onChange={handleAddStudentChange}
                        rows={3}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all resize-none"
                        placeholder="Enter complete residential address..."
                      />
                    </div>
                  </div>

                  {/* Academic Details Section */}
                  <div className="space-y-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <BookOpen className="w-3 h-3 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Academic Details
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Roll Number */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Roll Number
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="roll"
                            value={newStudent.roll}
                            onChange={handleAddStudentChange}
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                            placeholder="Enter roll number"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Hash className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {/* Program */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Program
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                          name="grade"
                          value={newStudent.grade}
                          onChange={handleAddStudentChange}
                          required
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all appearance-none bg-white"
                        >
                          <option value="">Select Program</option>
                          <optgroup label="Fashion Design">
                            <option value="Fashion Design - 1 year Certificate Program">
                              1 year Certificate Program
                            </option>
                            <option value="Fashion Design - 2 year Advanced Certificate">
                              2 year Advanced Certificate
                            </option>
                            <option value="Fashion Design - 3 year B Voc Program">
                              3 year B Voc Program
                            </option>
                            <option value="Fashion Design - 4 year B Des Program">
                              4 year B Des Program
                            </option>
                            <option value="Fashion Design - 2 Year M Voc program">
                              2 Year M Voc program
                            </option>
                          </optgroup>
                          <optgroup label="Interior Design">
                            <option value="Interior Design - 1 year Certificate Program">
                              1 year Certificate Program
                            </option>
                            <option value="Interior Design - 2 year Advanced Certificate">
                              2 year Advanced Certificate
                            </option>
                            <option value="Interior Design - 3 year B Voc Program">
                              3 year B Voc Program
                            </option>
                            <option value="Interior Design - 4 year B Des Program">
                              4 year B Des Program
                            </option>
                            <option value="Interior Design - 2 Year M Voc program">
                              2 Year M Voc program
                            </option>
                          </optgroup>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      {/* Section */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Section
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                          name="section"
                          value={newStudent.section}
                          onChange={handleAddStudentChange}
                          required
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all appearance-none bg-white"
                        >
                          <option value="">Select Section</option>
                          <option value="A">Section A</option>
                          <option value="B">Section B</option>
                          <option value="C">Section C</option>
                          <option value="D">Section D</option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      All fields marked with{" "}
                      <span className="text-red-500">*</span> are required
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl hover:from-yellow-600 hover:to-amber-600 font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Enroll Student
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;