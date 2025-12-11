import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import {
  Search,
  Download,
  IndianRupee,
  Users,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Eye,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const DEFAULT_PROGRAMS = [
  { value: 'ADV_CERT', label: 'Advance Certificate (1 / 2 Years)' },
  { value: 'B_VOC', label: 'B.Voc (3 Years)' },
  { value: 'M_VOC', label: 'M.Voc (2 Years)' },
  { value: 'B_DES', label: 'B.Des (4 Years)' },
];
const DEFAULT_STREAMS = ['Fashion Design', 'Interior Design'];
const ALL_PROGRAM = { value: 'ALL', label: 'All Programs' };
const ALL_COURSE = 'ALL';
const ALL_YEAR = 'ALL';

const getYearsForProgram = (programType) => {
  switch (programType) {
    case 'ADV_CERT':
      return [1, 2];
    case 'B_VOC':
      return [1, 2, 3];
    case 'M_VOC':
      return [1, 2];
    case 'B_DES':
      return [1, 2, 3, 4];
    default:
      return [];
  }
};

const NifFeesCollection = ({ setShowAdminHeader }) => {
  const navigate = useNavigate();

  const [programOptions, setProgramOptions] = useState(DEFAULT_PROGRAMS);
  const [coursesByProgram, setCoursesByProgram] = useState({});
  const [courseOptions, setCourseOptions] = useState(DEFAULT_STREAMS);

  const [programType, setProgramType] = useState(ALL_PROGRAM.value);
  const [course, setCourse] = useState(ALL_COURSE);
  const [yearNumber, setYearNumber] = useState(ALL_YEAR);
  const [recordStatusFilter, setRecordStatusFilter] = useState('active');

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setShowAdminHeader?.(false);
  }, [setShowAdminHeader]);

  const yearOptions = useMemo(() => {
    if (programType === ALL_PROGRAM.value) return [];
    return getYearsForProgram(programType);
  }, [programType]);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/nif/course/fetch`, {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data) || !data.length) return;

        const grouped = {};
        data.forEach((doc) => {
          const type = doc.programType || 'ADV_CERT';
          if (!grouped[type]) {
            grouped[type] = {
              label:
                doc.programLabel ||
                DEFAULT_PROGRAMS.find((p) => p.value === type)?.label ||
                type,
              streams: new Set(),
            };
          }
          if (doc.department) grouped[type].streams.add(doc.department);
        });

        const derivedPrograms = Object.entries(grouped).map(
          ([value, meta]) => ({
            value,
            label: meta.label,
          })
        );

        if (derivedPrograms.length) {
          const merged = DEFAULT_PROGRAMS.map((base) => {
            const match = derivedPrograms.find((p) => p.value === base.value);
            return match || base;
          });
          const extras = derivedPrograms.filter(
            (p) => !DEFAULT_PROGRAMS.some((base) => base.value === p.value)
          );
          setProgramOptions([...merged, ...extras]);
        }

        const mapping = Object.fromEntries(
          Object.entries(grouped).map(([value, meta]) => [
            value,
            Array.from(meta.streams),
          ])
        );
        setCoursesByProgram(mapping);
        if (
          programType !== ALL_PROGRAM.value &&
          !mapping[programType]?.length
        ) {
          setProgramType(ALL_PROGRAM.value);
          setYearNumber(ALL_YEAR);
        }
      } catch (err) {
        console.error('Failed to load course filters', err);
      }
    };

    loadFilters();
  }, [programType]);

  useEffect(() => {
    if (programType === ALL_PROGRAM.value) {
      setCourseOptions(DEFAULT_STREAMS);
      if (course !== ALL_COURSE && !DEFAULT_STREAMS.includes(course)) {
        setCourse(DEFAULT_STREAMS[0] || ALL_COURSE);
      }
      return;
    }
    const streams = coursesByProgram[programType];
    if (streams?.length) {
      setCourseOptions(streams);
      if (course !== ALL_COURSE && !streams.includes(course)) {
        setCourse(streams[0]);
      }
    } else {
      setCourseOptions(DEFAULT_STREAMS);
      if (course !== ALL_COURSE && !DEFAULT_STREAMS.includes(course)) {
        setCourse(DEFAULT_STREAMS[0]);
      }
    }
  }, [programType, coursesByProgram, course]);

  const fetchRecords = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const params = new URLSearchParams();
      if (programType !== ALL_PROGRAM.value) params.append('programType', programType);
      if (course !== ALL_COURSE) params.append('course', course);
      if (programType !== ALL_PROGRAM.value && yearNumber !== ALL_YEAR) {
        params.append('year', String(yearNumber));
      }
      if (recordStatusFilter === 'archived') {
        params.append('archived', 'true');
      } else if (recordStatusFilter === 'all') {
        params.append('archived', 'all');
      } else {
        params.append('archived', 'false');
      }

      const url =
        params.toString().length > 0
          ? `${API_BASE}/api/nif/fees?${params.toString()}`
          : `${API_BASE}/api/nif/fees`;

      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch fee records');
      }
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programType, course, yearNumber, recordStatusFilter]);

  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;
    const query = searchTerm.toLowerCase();
    return records.filter(
      (record) =>
        record.name?.toLowerCase().includes(query) ||
        record.roll?.toLowerCase().includes(query)
    );
  }, [records, searchTerm]);

  const summary = useMemo(() => {
    if (!records.length) {
      return {
        totalStudents: 0,
        totalDue: 0,
        totalCollected: 0,
        totalPending: 0,
      };
    }
    const totalStudents = records.length;
    const totalDue = records.reduce(
      (sum, r) => sum + Number(r.totalFee || 0),
      0
    );
    const totalCollected = records.reduce(
      (sum, r) => sum + Number(r.paidAmount || 0),
      0
    );
    const totalPending = records.reduce(
      (sum, r) => sum + Number(r.dueAmount || 0),
      0
    );
    return { totalStudents, totalDue, totalCollected, totalPending };
  }, [records]);

  const handleCollectFees = async (record) => {
    if (!record?.feeRecordId) return;
    const input = window.prompt(
      `Enter amount to collect for ${record.name}`,
      record.dueAmount || ''
    );
    if (!input) return;
    const amount = Number(input);
    if (!amount || amount <= 0) {
      alert('Enter a valid amount');
      return;
    }
    if (amount > (record.dueAmount || 0)) {
      alert('Amount cannot exceed due amount');
      return;
    }
    const method =
      window.prompt('Enter payment method (cash/card/upi/...):', 'cash') ||
      'cash';

    try {
      const res = await fetch(
        `${API_BASE}/api/nif/fees/collect/${record.feeRecordId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ amount, method }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Payment failed');
      }
      setRecords((prev) =>
        prev.map((item) =>
          item.feeRecordId === record.feeRecordId
            ? {
                ...item,
                paidAmount: data.paidAmount,
                dueAmount: data.dueAmount,
                status: data.status,
                lastPayment: data.lastPayment,
              }
            : item
        )
      );
      alert('Payment collected successfully');
    } catch (err) {
      alert(err.message || 'Failed to collect payment');
    }
  };

  const handleViewDetails = (record) => {
    if (!record?.feeRecordId) return;
    navigate(`/admin/fees/student-details?record=${record.feeRecordId}`, {
      state: { feeRecordId: record.feeRecordId },
    });
  };

  const exportFeesReport = () => {
    if (!records.length) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const currentDate = new Date().toLocaleDateString();
    let y = 20;

    doc.setFontSize(18);
    doc.text('NIF Fees Collection Report', pageWidth / 2, y, {
      align: 'center',
    });
    y += 10;
    doc.setFontSize(11);
    doc.text(
      `Program: ${
        programType === ALL_PROGRAM.value
          ? 'All'
          : programOptions.find((p) => p.value === programType)?.label ||
            programType
      } | Stream: ${
        course === ALL_COURSE ? 'All' : course
      } | Year: ${yearNumber === ALL_YEAR ? 'All' : yearNumber}`,
      pageWidth / 2,
      y,
      { align: 'center' }
    );
    y += 6;
    doc.text(`Generated on: ${currentDate}`, pageWidth / 2, y, {
      align: 'center',
    });

    y += 10;
    doc.setFontSize(10);
    doc.text(`Total Students: ${summary.totalStudents}`, 20, y);
    y += 5;
    doc.text(`Total Fees: ₹${summary.totalDue.toLocaleString()}`, 20, y);
    y += 5;
    doc.text(`Collected: ₹${summary.totalCollected.toLocaleString()}`, 20, y);
    y += 5;
    doc.text(`Pending: ₹${summary.totalPending.toLocaleString()}`, 20, y);

    y += 10;
    doc.setFontSize(9);
    doc.text('Name', 10, y);
    doc.text('Roll', 50, y);
    doc.text('Total', 90, y);
    doc.text('Paid', 120, y);
    doc.text('Due', 150, y);
    doc.text('Status', 175, y);
    y += 4;
    doc.line(10, y, pageWidth - 10, y);
    y += 6;

    filteredRecords.forEach((record) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(record.name || '-', 10, y);
      doc.text(record.roll || '-', 50, y);
      doc.text(`₹${Number(record.totalFee || 0).toLocaleString()}`, 90, y);
      doc.text(`₹${Number(record.paidAmount || 0).toLocaleString()}`, 120, y);
      doc.text(`₹${Number(record.dueAmount || 0).toLocaleString()}`, 150, y);
      doc.text(record.status || '-', 175, y);
      y += 6;
    });

    doc.save(
      `nif-fees-${programType}-${course}-year${yearNumber}-${currentDate.replace(
        /\//g,
        '-'
      )}.pdf`
    );
  };

  const summaryCards = [
    { label: 'Total Students', value: summary.totalStudents, icon: Users },
    {
      label: 'Total Fees',
      value: `₹${summary.totalDue.toLocaleString()}`,
      icon: IndianRupee,
    },
    {
      label: 'Collected',
      value: `₹${summary.totalCollected.toLocaleString()}`,
      icon: CheckCircle2,
    },
    {
      label: 'Pending',
      value: `₹${summary.totalPending.toLocaleString()}`,
      icon: AlertCircle,
    },
  ];

  const getStatusChip = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'partial':
        return 'bg-yellow-100 text-yellow-700';
      case 'due':
      default:
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">NIF Fees Collection</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program Type
            </label>
            <div className="relative">
              <select
                value={programType}
                onChange={(e) => {
                  const value = e.target.value;
                  setProgramType(value);
                  if (value === ALL_PROGRAM.value) {
                    setYearNumber(ALL_YEAR);
                  } else {
                    const years = getYearsForProgram(value);
                    if (!years.includes(Number(yearNumber))) {
                      setYearNumber(years[0] || 1);
                    }
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white"
              >
                <option value={ALL_PROGRAM.value}>{ALL_PROGRAM.label}</option>
                {programOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stream
            </label>
            <div className="relative">
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white"
              >
                <option value={ALL_COURSE}>All Streams</option>
                {courseOptions.map((stream) => (
                  <option key={stream} value={stream}>
                    {stream}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <div className="relative">
              {programType === ALL_PROGRAM.value ? (
                <select
                  value={ALL_YEAR}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                >
                  <option value={ALL_YEAR}>All Years</option>
                </select>
              ) : (
                <select
                  value={yearNumber}
                  onChange={(e) => setYearNumber(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
              )}
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Records
            </label>
            <div className="relative">
              <select
                value={recordStatusFilter}
                onChange={(e) => setRecordStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="all">All</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                {card.value}
              </p>
            </div>
            <card.icon className="w-8 h-8 text-yellow-500" />
          </div>
        ))}
      </div>

      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {fetchError}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Search by student name or roll"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Records</span>
            <select
              value={recordStatusFilter}
              onChange={(e) => setRecordStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="all">All</option>
            </select>
          </div>
          <button
            onClick={exportFeesReport}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            <Download size={16} />
            Export Report
          </button>
          <button
            onClick={fetchRecords}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Roll</th>
                <th className="px-4 py-3 text-left">Program</th>
                <th className="px-4 py-3 text-left">Stream</th>
                <th className="px-4 py-3 text-right">Total Fee</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-right">Outstanding</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    Loading fee records...
                  </td>
                </tr>
              )}

              {!loading && !filteredRecords.length && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                    No fee records found for the selected filters.
                  </td>
                </tr>
              )}

              {!loading &&
                filteredRecords.map((record) => (
                  <tr key={record.feeRecordId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {record.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{record.roll}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {record.program}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {record.course}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      ₹{Number(record.totalFee || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      ₹{Number(record.paidAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600 font-semibold">
                      ₹{Number(record.dueAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusChip(
                          record.status
                        )}`}
                      >
                        {record.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {record.status !== 'paid' && (
                          <button
                            onClick={() => handleCollectFees(record)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded bg-green-600 text-white hover:bg-green-700"
                          >
                            <IndianRupee size={12} />
                            Collect
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetails(record)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded border border-purple-300 hover:bg-green-50 text-black"
                        >
                          <Eye size={12} />
                          Fee Breakup
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NifFeesCollection;
