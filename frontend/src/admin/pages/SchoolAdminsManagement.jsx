import React, { useEffect, useState } from 'react';
import { Shield, Plus, User, School } from 'lucide-react';

const SchoolAdminsManagement = ({ setShowAdminHeader, isSuperAdmin }) => {
  const [admins, setAdmins] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    schoolId: '',
  });

  useEffect(() => {
    setShowAdminHeader(false);
  }, [setShowAdminHeader]);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      if (!isSuperAdmin) {
        setLoading(false);
        return;
      }
      const readErrorMessage = async (res, fallback) => {
        try {
          const data = await res.json();
          return data?.error || data?.message || `${fallback} (HTTP ${res.status})`;
        } catch (err) {
          return `${fallback} (HTTP ${res.status})`;
        }
      };
      try {
        const adminRes = await fetch(`${apiBase}/api/admin/auth/school-admins`, {
          headers: { authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!adminRes.ok) {
          const message = await readErrorMessage(adminRes, 'Failed to load school admins');
          throw new Error(message);
        }
        const adminData = await adminRes.json();
        setAdmins(Array.isArray(adminData) ? adminData : []);

        const schoolRes = await fetch(`${apiBase}/api/schools`, {
          headers: { authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!schoolRes.ok) {
          const message = await readErrorMessage(schoolRes, 'Failed to load schools');
          setError(message);
          return;
        }
        const schoolData = await schoolRes.json();
        setSchools(Array.isArray(schoolData) ? schoolData : []);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isSuperAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${apiBase}/api/admin/auth/school-admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to create school admin');
      }
      setAdmins((prev) => [data, ...prev]);
      setShowForm(false);
      setFormData({ username: '', password: '', name: '', schoolId: '' });
    } catch (err) {
      setError(err.message || 'Failed to create school admin');
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/90 border border-blue-200 rounded-2xl shadow-xl p-8 text-center max-w-lg">
          <h2 className="text-2xl font-semibold text-blue-800">Super Admin Only</h2>
          <p className="text-gray-600 mt-2">You do not have access to manage school admins.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 flex flex-col">
      <div className="flex-1 flex flex-col mx-auto w-full bg-white/90 shadow-2xl border border-blue-200 overflow-hidden p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">School Admins</h1>
            <p className="text-gray-600 mt-1">Assign admins to schools</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
            onClick={() => setShowForm((prev) => !prev)}
          >
            <Plus size={18} />
            Add Admin
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-xl border border-blue-100 p-4">
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Full name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <select
              className="border rounded-lg px-3 py-2"
              name="schoolId"
              value={formData.schoolId}
              onChange={handleChange}
              required
            >
              <option value="">Select school</option>
              {schools.map((school) => (
                <option key={school._id} value={school._id}>
                  {school.name} ({school.code})
                </option>
              ))}
            </select>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">
                Create
              </button>
            </div>
          </form>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-gray-600">Loading school admins...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {admins.map((admin) => (
                <div key={admin._id} className="border border-blue-100 rounded-xl p-4 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Shield className="text-blue-700" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{admin.name || admin.username}</h3>
                      <p className="text-sm text-gray-500">{admin.username}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-blue-600" />
                      <span>School Admin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <School size={14} className="text-blue-600" />
                      <span>{admin.schoolId?.name || 'Assigned School'}</span>
                    </div>
                  </div>
                </div>
              ))}
              {admins.length === 0 && (
                <div className="text-gray-600">No school admins yet.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolAdminsManagement;
