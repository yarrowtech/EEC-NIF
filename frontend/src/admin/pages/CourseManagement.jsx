import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Users,
  Clock,
  Calendar,
  IndianRupee,
  X,
  ChevronDown,
} from "lucide-react";

const CourseManagement = ({ setShowAdminHeader }) => {
  const [allCourses, setAllCourses] = useState([]);

  // making the admin header invisible
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/course/fetch`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        setAllCourses(data);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
    setShowAdminHeader(false);
  }, []);

  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: "",
    duration: "",
    fees: "",
  });

  const handleAddCourseChange = (e) => {
    const { name, value } = e.target;
    setNewCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCourseSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = ["name", "duration", "fees"];
    const missingFields = requiredFields.filter(
      (field) => !newCourse[field] || newCourse[field].trim() === ""
    );

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Submitting course data:", newCourse);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/course/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(newCourse),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add course");
      }

      const data = await res.json();
      console.log("Course added successfully:", data);
      alert("Course added successfully!");

      // Refresh courses list
      const coursesRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/course/fetch`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setAllCourses(coursesData);
      }

      // Close form and reset
      setShowAddForm(false);
      setNewCourse({ name: "", duration: "", fees: "" });
    } catch (err) {
      console.error("Error adding course:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100 flex flex-col">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full bg-white/90 rounded-2xl shadow-2xl m-4 border border-yellow-200 overflow-hidden">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 p-8 bg-white/90 border-b border-yellow-100">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-yellow-700">
                Course Management
              </h1>
              <p className="text-gray-600 mt-2">Manage and organize courses</p>
            </div>
            <div className="flex items-center space-x-4">
              <BookOpen className="w-12 h-12 text-yellow-500" />
            </div>
          </div>

          {/* Add Course Button */}
          <div className="flex justify-end">
            <button
              className="flex items-center space-x-2 bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Add Course</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden p-8">
          <div className="h-full overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {course.title}
                      </h3>
                      <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        {course.department}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-400 hover:text-yellow-600 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{course.desc}</p>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Duration: {course.duration}</span>
                    </div>
                    {course.fees && (
                      <div className="flex items-center text-sm text-gray-600">
                        <IndianRupee className="w-4 h-4 mr-2" />
                        <span>Fees: ₹{course.fees}</span>
                      </div>
                    )}
                    {course.instructor && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Instructor: {course.instructor}</span>
                      </div>
                    )}
                    {course.totalStudents && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{course.totalStudents} Students</span>
                      </div>
                    )}
                    {course.startingDate && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          Starts:{" "}
                          {new Date(course.startingDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-colors duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-yellow-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-yellow-700">
                  Add New Course
                </h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddCourseSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    STREAM
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="stream"
                      value={newCourse.stream}
                      onChange={handleAddCourseChange}
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all appearance-none bg-white"
                    >
                      <option value="">Select a stream</option>
                      <option value="Fashion Design">Fashion Design</option>
                      <option value="Interior Design">Interior Design</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={newCourse.name}
                    onChange={handleAddCourseChange}
                    required
                    placeholder="Enter course name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none placeholder-gray-400 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="duration"
                    value={newCourse.duration}
                    onChange={handleAddCourseChange}
                    required
                    placeholder="e.g., 6 months, 1 year"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none placeholder-gray-400 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fees <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      name="fees"
                      value={newCourse.fees}
                      onChange={handleAddCourseChange}
                      required
                      placeholder="Enter course fees"
                      type="number"
                      min="0"
                      className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none placeholder-gray-400 text-gray-800"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    {isSubmitting ? "Adding..." : "Add Course"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;
