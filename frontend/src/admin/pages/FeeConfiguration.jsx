import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Trash2, Save, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const PROGRAM_OPTIONS_BASE = [
  { label: '4 Year B DES', value: 'B_DES' },
  { label: '3 Year B VOC', value: 'B_VOC' },
  { label: '2 Year M VOC', value: 'M_VOC' },
  { label: '2 Year Advanced Certificate', value: 'ADV_CERT' },
  { label: '1 Year Certificate', value: 'ADV_CERT' },
];

const PROGRAM_LABEL_LOOKUP = PROGRAM_OPTIONS_BASE.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

const FALLBACK_STREAMS = ['Fashion Design', 'Interior Design'];

const INITIAL_COMPONENTS = [
  { id: 1, name: 'Time of Admission', amount: 60000 },
  { id: 2, name: 'Registration fee', amount: 5000 },
  { id: 3, name: 'MSU fees', amount: 1500 },
  { id: 4, name: '1st Installment', amount: 45000 },
  { id: 5, name: '2nd Installment', amount: 45000 },
];

const FeeConfiguration = ({ setShowAdminHeader }) => {
  useEffect(() => {
    setShowAdminHeader(false);
  }, [setShowAdminHeader]);

  const [programOptions, setProgramOptions] = useState(PROGRAM_OPTIONS_BASE);
  const [streamsByProgram, setStreamsByProgram] = useState({});
  const [selectedProgram, setSelectedProgram] = useState(
    PROGRAM_OPTIONS_BASE[0]?.value || ''
  );
  const [selectedStream, setSelectedStream] = useState('');
  const [feeComponents, setFeeComponents] = useState(INITIAL_COMPONENTS);
  const [currentCourseId, setCurrentCourseId] = useState('');
  const [loadingStructure, setLoadingStructure] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [metadataLoaded, setMetadataLoaded] = useState(false);
  const [metadataError, setMetadataError] = useState('');
  
  const programLabel =
    programOptions.find((program) => program.value === selectedProgram)?.label ||
    'Select Program';

  const streamOptions =
    streamsByProgram[selectedProgram] && streamsByProgram[selectedProgram].length
      ? streamsByProgram[selectedProgram]
      : FALLBACK_STREAMS;

  const effectiveStreamLabel = selectedStream || (streamOptions[0] || 'Select Stream');
  const viewStructureDisabled = !metadataLoaded || !selectedStream || !selectedProgram;

  useEffect(() => {
    if (!streamOptions.length) return;
    if (!selectedStream || !streamOptions.includes(selectedStream)) {
      setSelectedStream(streamOptions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgram, streamOptions.join('|')]);

  useEffect(() => {
    const controller = new AbortController();

    const loadProgramMetadata = async () => {
      setMetadataError('');
      try {
        const res = await fetch(`${API_BASE}/api/nif/course/fetch?limit=200`, {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          signal: controller.signal,
        });
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          throw new Error(data.message || 'Failed to load course metadata');
        }
        if (!Array.isArray(data)) return;

        const grouped = {};
        data.forEach((course) => {
          const programType = course.programType;
          if (!programType) return;
          if (!grouped[programType]) {
            grouped[programType] = {
              label:
                course.programLabel ||
                PROGRAM_LABEL_LOOKUP[programType] ||
                programType,
              streams: new Set(),
            };
          }
          if (course.department) {
            grouped[programType].streams.add(course.department);
          }
        });

        const derivedPrograms = Object.entries(grouped).map(([value, meta]) => ({
          value,
          label: meta.label || PROGRAM_LABEL_LOOKUP[value] || value,
        }));

        const merged = PROGRAM_OPTIONS_BASE.map((base) => {
          const match = derivedPrograms.find((p) => p.value === base.value);
          return match || base;
        });
        const extras = derivedPrograms.filter(
          (p) => !PROGRAM_OPTIONS_BASE.some((base) => base.value === p.value)
        );
        setProgramOptions([...merged, ...extras]);

        const mapping = {};
        Object.entries(grouped).forEach(([value, meta]) => {
          mapping[value] = Array.from(meta.streams).sort();
        });
        setStreamsByProgram(mapping);
        setMetadataLoaded(true);

        if (selectedProgram && mapping[selectedProgram]?.length) {
          if (!mapping[selectedProgram].includes(selectedStream)) {
            setSelectedStream(mapping[selectedProgram][0]);
          }
        } else {
          const firstProgramWithStreams = Object.keys(mapping)[0];
          if (firstProgramWithStreams) {
            setSelectedProgram(firstProgramWithStreams);
            setSelectedStream(mapping[firstProgramWithStreams][0] || '');
          }
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Program metadata load failed:', err);
        setMetadataError(err.message || 'Failed to load program metadata');
        const fallbackMap = PROGRAM_OPTIONS_BASE.reduce((acc, option) => {
          acc[option.value] = [...FALLBACK_STREAMS];
          return acc;
        }, {});
        setStreamsByProgram(fallbackMap);
        setMetadataLoaded(true);
        if (!selectedStream && FALLBACK_STREAMS.length) {
          setSelectedStream(FALLBACK_STREAMS[0]);
        }
      }
    };

    loadProgramMetadata();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadFeeStructure = async () => {
      const programType = selectedProgram;
      if (!programType || !selectedStream) {
        setFeeComponents([]);
        setCurrentCourseId('');
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

  const canSave =
    Boolean(selectedProgram && selectedStream && currentCourseId && feeComponents.length);

  const handleSave = async () => {
    const programType = selectedProgram;
    const targetStream = selectedStream;
    if (!programType) {
      alert('Please select a valid program to save.');
      return;
    }
    if (!targetStream) {
      alert('Select a stream before saving.');
      return;
    }
    if (!currentCourseId) {
      alert('No course exists for this program/stream combination. Please create the course first in Course Management.');
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
          stream: targetStream,
          courseId: currentCourseId || undefined,
          components: sanitizedComponents,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save fee structure');
      }
      setCurrentCourseId(data.courseId || data._id || currentCourseId);
      setSelectedStream(targetStream);
      setStreamsByProgram((prev) => {
        const existing = prev[programType] || [];
        if (existing.includes(targetStream)) return prev;
        return {
          ...prev,
          [programType]: [...existing, targetStream],
        };
      });
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
          {metadataError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {metadataError}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-medium text-gray-700">Select Program</label>
            <div className="relative">
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full px-4 min-h-[52px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {programOptions.map((program) => (
                  <option key={program.value} value={program.value}>
                    {program.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-medium text-gray-700">Select Stream</label>
            <div className="relative">
              <select
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                className="w-full px-4 min-h-[52px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                disabled={!streamOptions.length}
              >
                {streamOptions.map((stream) => (
                  <option key={stream} value={stream}>
                    {stream}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
            <p className="text-xs text-gray-500">
              Streams are derived from existing courses.
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-medium text-gray-700">Actions</label>
            <button
              onClick={() => setRefreshKey((prev) => prev + 1)}
              disabled={viewStructureDisabled}
              className="w-full h-[52px] px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {metadataLoaded ? 'View Structure' : 'Loading...'}
            </button>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-gray-800">
            Fee Structure: {programLabel} • {effectiveStreamLabel}
          </h2>
          <p className="text-sm text-gray-500">
            Components currently configured for this selection. Total entries: {feeComponents.length}
          </p>
          {!currentCourseId && (
            <p className="text-sm text-red-600">
              No existing course found for this selection. Please add the course before saving.
            </p>
          )}
        </div>
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
          className="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
          disabled
        >
          <Save size={16} />
          Save Changes (Disabled)
        </button>
      </div>

    </div>
  );
};

export default FeeConfiguration;
