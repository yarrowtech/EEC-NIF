// frontend/src/admin/pages/ArchivedStudents.jsx
import React, { useEffect, useState } from "react";
import { FileDown } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

const ArchivedStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchArchived = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/nif/students/archived`, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load archived students:", err);
      alert("Failed to load archived students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchived();
  }, []);

  const downloadCSV = () => {
    window.location.href = `${API_BASE}/api/nif/students/archived/export`;
  };

  return (
    <div className="min-h-screen p-8 bg-yellow-50">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-700">
            Archived Students
          </h1>

          <button
            onClick={downloadCSV}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FileDown size={16} />
            Download CSV
          </button>
        </div>

        {/* Table */}
        <table className="w-full border border-yellow-200 rounded-lg">
          <thead className="bg-yellow-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Course</th>
              <th className="p-3 text-left">Batch</th>
              <th className="p-3 text-left">Passed Out</th>
              <th className="p-3 text-left">Paid</th>
              <th className="p-3 text-left">Archived At</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  Loading archived students...
                </td>
              </tr>
            )}

            {!loading &&
              students.map((s) => (
                <tr key={s._id} className="border-t">
                  <td className="p-3">{s.studentName}</td>
                  <td className="p-3">{s.course}</td>
                  <td className="p-3">{s.batchCode}</td>
                  <td className="p-3">{s.passedOutYear}</td>
                  <td className="p-3">₹{s.feeSummary?.totalPaid}</td>
                  <td className="p-3">
                    {s.archivedAt
                      ? new Date(s.archivedAt).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}

            {!loading && students.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No archived students yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArchivedStudents;
