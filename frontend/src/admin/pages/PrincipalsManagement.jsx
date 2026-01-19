import React, { useEffect, useState } from 'react';
import { UserRound, Plus, Mail, School } from 'lucide-react';

const PrincipalsManagement = ({ setShowAdminHeader, isSuperAdmin, adminSchoolId }) => {
  const [principals, setPrincipals] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    schoolId: '',
  });

  useEffect(() => {
    setShowAdminHeader(false);
  }, [setShowAdminHeader]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const principalRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/get-principals`, {
          headers: { authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!principalRes.ok) {
          throw new Error('Failed to load principals');
        }
        const principalData = await principalRes.json();
        setPrincipals(Array.isArray(principalData) ? principalData : []);

        if (isSuperAdmin) {
          const schoolRes = await fetch(`${import.meta.env.VITE_API_URL}/api/schools`, {
            headers: { authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          if (!schoolRes.ok) {
            throw new Error('Failed to load schools');
          }
          const schoolData = await schoolRes.json();
          setSchools(Array.isArray(schoolData) ? schoolData : []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load principals');
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
    if (!isSuperAdmin && !adminSchoolId) {
      setError('School assignment is required to create a principal.');
      return;
    }
    try {
      const payload = {
        ...formData,
        schoolId: isSuperAdmin ? formData.schoolId : adminSchoolId,
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/principal/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to create principal');
      }
      setPrincipals((prev) => [data, ...prev]);
      setShowForm(false);
      setFormData({ name: '', username: '', email: '', password: '', schoolId: '' });
    } catch (err) {
      setError(err.message || 'Failed to create principal');
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 flex flex-col">
      <div className="flex-1 flex flex-col mx-auto w-full bg-white/90 shadow-2xl border border-blue-200 overflow-hidden p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">Principals</h1>
            <p className="text-gray-600 mt-1">Create and manage principal accounts</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
            onClick={() => setShowForm((prev) => !prev)}
          >
            <Plus size={18} />
            Add Principal
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
              placeholder="Email"
              name="email"
              type="email"
              value={formData.email}
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
            {isSuperAdmin && (
              <select
                className="border rounded-lg px-3 py-2 md:col-span-2"
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
            )}
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
            <div className="text-gray-600">Loading principals...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {principals.map((principal) => (
                <div key={principal._id || principal.username} className="border border-blue-100 rounded-xl p-4 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <UserRound className="text-blue-700" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{principal.name || principal.username}</h3>
                      <p className="text-sm text-gray-500">{principal.username}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-blue-600" />
                      <span>{principal.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <School size={14} className="text-blue-600" />
                      <span>{principal.schoolId?.name || 'Assigned School'}</span>
                    </div>
                  </div>
                </div>
              ))}
              {principals.length === 0 && (
                <div className="text-gray-600">No principals yet.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrincipalsManagement;
