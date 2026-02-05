import React, { useState, useEffect } from 'react';
import { AlertCircle, Phone, Mail, MapPin, Users, Loader2 } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const FeesPayment = () => {
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

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Fees Information</h1>
        <p className="text-yellow-100 text-sm sm:text-base">Fee payment and information</p>
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
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading fee information...
        </div>
      ) : !selectedChild ? (
        <div className="bg-white rounded-xl p-8 border border-gray-100 text-gray-500 text-center">
          Please select a child to view fee information.
        </div>
      ) : (
        <>

      {/* Notice Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-yellow-100 p-3 rounded-full">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Fee Information Not Available Online</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              Fee payment and information is currently managed directly through the school office.
              Please contact the school administration for fee details, payment schedules, and payment methods.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact School Administration</h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="bg-yellow-50 p-2 rounded-lg">
                <Phone className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">Contact school office for number</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="bg-yellow-50 p-2 rounded-lg">
                <Mail className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">Contact school office for email</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="bg-yellow-50 p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Visit</p>
                <p className="font-medium">School Administration Office</p>
                <p className="text-sm text-gray-500">Office Hours: Monday - Friday, 9:00 AM - 4:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">What You Can Do</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-1">•</span>
            <span>Visit the school office during working hours for fee details</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-1">•</span>
            <span>Request a fee structure document from the administration</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-1">•</span>
            <span>Inquire about available payment methods and schedules</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-1">•</span>
            <span>Get receipts for all payments made at the school office</span>
          </li>
        </ul>
      </div>
        </>
      )}
    </div>
  );
};

export default FeesPayment;