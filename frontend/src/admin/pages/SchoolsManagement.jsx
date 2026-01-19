import React, { useEffect, useState } from 'react';
import { Building2, Plus, Mail, Phone, MapPin } from 'lucide-react';

const SchoolsManagement = ({ setShowAdminHeader, isSuperAdmin }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    status: 'active',
  });

  useEffect(() => {
    setShowAdminHeader(false);
  }, [setShowAdminHeader]);

  useEffect(() => {
    const fetchSchools = async () => {
      if (!isSuperAdmin) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/schools`, {
          headers: {
            authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to load schools');
        }
        const data = await res.json();
        setSchools(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to load schools');
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, [isSuperAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/schools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to create school');
      }
      setSchools((prev) => [data, ...prev]);
      setShowForm(false);
      setFormData({
        name: '',
        code: '',
        address: '',
        contactEmail: '',
        contactPhone: '',
        status: 'active',
      });
    } catch (err) {
      setError(err.message || 'Failed to create school');
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/90 border border-blue-200 rounded-2xl shadow-xl p-8 text-center max-w-lg">
          <h2 className="text-2xl font-semibold text-blue-800">Super Admin Only</h2>
          <p className="text-gray-600 mt-2">You do not have access to manage schools.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 flex flex-col">
      <div className="flex-1 flex flex-col mx-auto w-full bg-white/90 shadow-2xl border border-blue-200 overflow-hidden p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">Schools</h1>
            <p className="text-gray-600 mt-1">Create and manage tenant schools</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
            onClick={() => setShowForm((prev) => !prev)}
          >
            <Plus size={18} />
            Add School
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
              placeholder="School name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="School code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Contact email"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Contact phone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
            />
            <select
              className="border rounded-lg px-3 py-2"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
            <div className="text-gray-600">Loading schools...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {schools.map((school) => (
                <div key={school._id} className="border border-blue-100 rounded-xl p-4 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building2 className="text-blue-700" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{school.name}</h3>
                      <p className="text-sm text-gray-500">Code: {school.code}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    {school.address && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-blue-600" />
                        <span>{school.address}</span>
                      </div>
                    )}
                    {school.contactEmail && (
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-blue-600" />
                        <span>{school.contactEmail}</span>
                      </div>
                    )}
                    {school.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-blue-600" />
                        <span>{school.contactPhone}</span>
                      </div>
                    )}
                    <div className="text-xs uppercase tracking-wide text-gray-500">
                      Status: {school.status || 'active'}
                    </div>
                  </div>
                </div>
              ))}
              {schools.length === 0 && (
                <div className="text-gray-600">No schools yet.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolsManagement;
