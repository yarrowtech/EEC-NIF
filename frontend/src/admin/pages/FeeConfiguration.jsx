import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Trash2, Save, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const PROGRAM_TYPE_MAP = {
  '4 Year B DES': 'B_DES',
  '3 Year B VOC': 'B_VOC',
  '2 Year M VOC': 'M_VOC',
  '2 Year Advanced Certificate': 'ADV_CERT',
  '1 Year Certificate': 'ADV_CERT',
};

const INITIAL_COMPONENTS = [
  { id: 1, name: 'Time of Admission', amount: 60000, dueMonth: '' },
  { id: 2, name: 'Registration fee', amount: 5000, dueMonth: '' },
  { id: 3, name: 'MSU fees', amount: 1500, dueMonth: '' },
  { id: 4, name: '1st Installment', amount: 45000, dueMonth: '' },
  { id: 5, name: '2nd Installment', amount: 45000, dueMonth: '' },
];

const FeeConfiguration = ({ setShowAdminHeader }) => {
  useEffect(() => {
    setShowAdminHeader(false);
  }, [setShowAdminHeader]);

  const [selectedProgram, setSelectedProgram] = useState('4 Year B DES');
  const [selectedStream, setSelectedStream] = useState('Fashion Design');
  const [feeComponents, setFeeComponents] = useState(INITIAL_COMPONENTS);
  const [currentCourseId, setCurrentCourseId] = useState('');
  const [loadingStructure, setLoadingStructure] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const programs = [
    '4 Year B DES',
    '3 Year B VOC', 
    '2 Year M VOC',
    '2 Year Advanced Certificate',
    '1 Year Certificate'
  ];

  const streams = [
    'Fashion Design',
    'Interior Design'
  ];

  useEffect(() => {
    const controller = new AbortController();

    const loadFeeStructure = async () => {
      const programType = PROGRAM_TYPE_MAP[selectedProgram] || null;
      if (!programType) {
        setFeeComponents([]);
        setCurrentCourseId('');
        setLoadError('Please select a valid program to load fee components.');
        return;
      }

      setLoadingStructure(true);
      setLoadError('');
      try {
        const params = new URLSearchParams({
          programType,
          stream: selectedStream,
        });

        const res = await fetch(
          `${API_BASE}/api/nif/course/fee-structure?${params.toString()}`,
          {
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            signal: controller.signal,
          }
        );

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 404) {
            setFeeComponents([]);
            setCurrentCourseId('');
            setLoadError('No fee structure found for this program and stream yet.');
            return;
          }
          throw new Error(data.message || 'Failed to load fee structure');
        }

        setCurrentCourseId(data.courseId || data._id || '');
        const sanitized = Array.isArray(data.installments)
          ? data.installments.map((inst, idx) => ({
              id: `${inst.label || 'component'}-${idx}-${Date.now()}`,
              name: inst.label || '',
              amount: Number(inst.amount || 0),
              dueMonth: inst.dueMonth || '',
            }))
          : [];
        setFeeComponents(sanitized.length ? sanitized : []);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Fee structure fetch failed:', err);
        setLoadError(err.message || 'Failed to load fee structure');
        setFeeComponents([]);
        setCurrentCourseId('');
      } finally {
        if (!controller.signal.aborted) {
          setLoadingStructure(false);
        }
      }
    };

    loadFeeStructure();
    return () => controller.abort();
  }, [selectedProgram, selectedStream, refreshKey]);

  const addFeeComponent = () => {
    const newComponent = {
      id: Date.now(),
      name: '',
      amount: 0,
      dueMonth: '',
    };
    setFeeComponents([...feeComponents, newComponent]);
  };

  const updateFeeComponent = (id, field, value) => {
    setFeeComponents(feeComponents.map(component => 
      component.id === id 
        ? { ...component, [field]: field === 'amount' ? Number(value) : value }
        : component
    ));
  };

  const deleteFeeComponent = (id) => {
    setFeeComponents(feeComponents.filter(component => component.id !== id));
  };

  const getTotalFee = () => {
    return feeComponents.reduce(
      (sum, component) => sum + Number(component.amount || 0),
      0
    );
  };

  const handleSave = async () => {
    const programType = PROGRAM_TYPE_MAP[selectedProgram];
    if (!programType) {
      alert('Please select a valid program to save.');
      return;
    }

    const sanitizedComponents = feeComponents
      .map((component) => {
        const label = (component.name || '').trim();
        const amount = Number(component.amount || 0);
        if (!label || Number.isNaN(amount) || amount < 0) {
          return null;
        }
        return {
          label,
          amount,
          dueMonth: component.dueMonth || '',
        };
      })
      .filter(Boolean);

    if (!sanitizedComponents.length) {
      alert('Add at least one fee component before saving.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/nif/course/fee-structure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          programType,
          stream: selectedStream,
          courseId: currentCourseId || undefined,
          components: sanitizedComponents,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save fee structure');
      }
      setCurrentCourseId(data.courseId || data._id || currentCourseId);
      alert('Fee structure updated successfully!');
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Fee structure save failed:', err);
      alert(err.message || 'Failed to save fee structure');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Fee Structure</h1>
          <p className="text-gray-600">
            Define and update the fee structure for each program and stream offered by the college.
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Select Program</label>
            <div className="relative">
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {programs.map((program) => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Select Stream</label>
            <div className="relative">
              <select
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {streams.map((stream) => (
                  <option key={stream} value={stream}>{stream}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>

          <button 
            onClick={() => setRefreshKey((prev) => prev + 1)}
            className="h-12 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Structure
          </button>
        </div>
      </div>

      {/* Section Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800">
          Fee Structure for: {selectedProgram} - {selectedStream}
        </h2>
      </div>

      {/* Fee Structure Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loadError && !loadingStructure && (
          <div className="px-6 py-3 text-sm text-red-600 border-b border-red-200 bg-red-50">
            {loadError}
          </div>
        )}
        {loadingStructure ? (
          <div className="p-6 text-center text-gray-500">Loading fee structure...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fee Component Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount (INR)
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {feeComponents.length ? (
                  feeComponents.map((component) => (
                    <tr key={component.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={component.name}
                          onChange={(e) => updateFeeComponent(component.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter fee component name"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={component.amount}
                          onChange={(e) => updateFeeComponent(component.id, 'amount', e.target.value)}
                          className="w-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => deleteFeeComponent(component.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={3}>
                      No fee components defined for this course. Click “Add Fee Component” to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <button
              onClick={addFeeComponent}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus size={16} />
              Add Fee Component
            </button>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <p className="text-sm font-medium text-gray-600">Total Fee:</p>
            <p className="text-lg font-bold text-gray-900">₹{getTotalFee().toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
          <X size={16} />
          Cancel
        </button>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

    </div>
  );
};

export default FeeConfiguration;
