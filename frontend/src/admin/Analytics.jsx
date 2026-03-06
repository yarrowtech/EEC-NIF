import { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  DollarSign,
  Download,
  Activity,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const classOptions = ['All Classes', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const sectionOptions = ['All Sections', 'A', 'B', 'C', 'D'];

const buildApiUrl = (path) => `${API_BASE}${path}`;

const normalizeClassValue = (value) => {
  if (!value || value === 'All Classes') return '';
  const match = value.match(/(\d+)/);
  return match ? match[1] : '';
};

const normalizeSectionValue = (value) => (value === 'All Sections' ? '' : value);

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Math.round(value || 0));
const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN');

const buildFeeChartData = (invoices) => {
  const now = new Date();
  const buckets = [];
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    buckets.push({
      key,
      month: date.toLocaleString('default', { month: 'short' }),
      paid: 0,
      pending: 0
    });
  }
  const map = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  invoices.forEach((invoice) => {
    const sourceDate = invoice.dueDate || invoice.createdAt;
    if (!sourceDate) return;
    const parsedDate = new Date(sourceDate);
    if (Number.isNaN(parsedDate.getTime())) return;
    const key = `${parsedDate.getFullYear()}-${parsedDate.getMonth()}`;
    const bucket = map.get(key);
    if (!bucket) return;
    bucket.paid += Number(invoice.paidAmount || 0);
    bucket.pending += Number(invoice.balanceAmount || 0);
  });
  return buckets.map(({ month, paid, pending }) => ({
    month,
    paid: Math.round(paid),
    pending: Math.round(pending)
  }));
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Recently';
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
};

const Analytics = ({ setShowAdminHeader }) => {
  const [selectedClass, setSelectedClass] = useState(classOptions[0]);
  const [selectedSection, setSelectedSection] = useState(sectionOptions[0]);
  const [progressAnalytics, setProgressAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [reportsSummary, setReportsSummary] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState('');
  const [feeInvoices, setFeeInvoices] = useState([]);
  const [feesLoading, setFeesLoading] = useState(false);
  const [feesError, setFeesError] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState('');

  useEffect(() => {
    setShowAdminHeader(true);
  }, [setShowAdminHeader]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const controller = new AbortController();
    const loadAnalytics = async () => {
      setAnalyticsLoading(true);
      setAnalyticsError('');
      try {
        const params = new URLSearchParams();
        const grade = normalizeClassValue(selectedClass);
        const section = normalizeSectionValue(selectedSection);
        if (grade) params.append('grade', grade);
        if (section) params.append('section', section);
        const query = params.toString() ? `?${params.toString()}` : '';
        const res = await fetch(buildApiUrl(`/api/progress/analytics${query}`), {
          headers: getAuthHeaders(),
          signal: controller.signal,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || 'Unable to load performance analytics');
        }
        setProgressAnalytics(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          setAnalyticsError(error.message || 'Unable to load performance analytics');
        }
      } finally {
        if (!controller.signal.aborted) {
          setAnalyticsLoading(false);
        }
      }
    };
    loadAnalytics();
    return () => controller.abort();
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    const controller = new AbortController();
    const loadReports = async () => {
      setReportsLoading(true);
      setReportsError('');
      try {
        const res = await fetch(buildApiUrl('/api/reports/summary'), {
          headers: getAuthHeaders(),
          signal: controller.signal,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || 'Unable to load school summary');
        }
        setReportsSummary(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          setReportsError(error.message || 'Unable to load school summary');
        }
      } finally {
        if (!controller.signal.aborted) {
          setReportsLoading(false);
        }
      }
    };
    loadReports();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadInvoices = async () => {
      setFeesLoading(true);
      setFeesError('');
      try {
        const res = await fetch(buildApiUrl('/api/fees/invoices'), {
          headers: getAuthHeaders(),
          signal: controller.signal,
        });
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          throw new Error(data?.error || 'Unable to load fees data');
        }
        setFeeInvoices(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!controller.signal.aborted) {
          setFeesError(error.message || 'Unable to load fees data');
        }
      } finally {
        if (!controller.signal.aborted) {
          setFeesLoading(false);
        }
      }
    };
    loadInvoices();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadActivity = async () => {
      setActivityLoading(true);
      setActivityError('');
      try {
        const res = await fetch(buildApiUrl('/api/audit-logs'), {
          headers: getAuthHeaders(),
          signal: controller.signal,
        });
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          throw new Error(data?.error || 'Unable to load recent activity');
        }
        setAuditLogs(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!controller.signal.aborted) {
          setActivityError(error.message || 'Unable to load recent activity');
        }
      } finally {
        if (!controller.signal.aborted) {
          setActivityLoading(false);
        }
      }
    };
    loadActivity();
    return () => controller.abort();
  }, []);

  const attendanceRate = useMemo(() => {
    if (!reportsSummary?.attendance) return 0;
    const { present = 0, totalMarked = 0 } = reportsSummary.attendance;
    if (!totalMarked) return 0;
    return Math.round((present / totalMarked) * 100);
  }, [reportsSummary]);

  const subjectPerformance = useMemo(() => {
    if (!progressAnalytics?.subjectPerformance) return [];
    return Object.entries(progressAnalytics.subjectPerformance)
      .map(([subject, stats]) => ({
        subject,
        averageScore: stats.averageScore || 0,
        studentCount: stats.studentCount || 0,
      }))
      .sort((a, b) => b.averageScore - a.averageScore);
  }, [progressAnalytics]);

  const gradeDistributionData = useMemo(() => {
    if (!progressAnalytics?.gradeDistribution) return [];
    const colors = {
      'A+': '#0ea5e9',
      'A': '#10b981',
      'B+': '#3b82f6',
      'B': '#60a5fa',
      'C+': '#f59e0b',
      'C': '#f97316',
      'D': '#ef4444',
      'F': '#6b7280',
    };
    return Object.entries(progressAnalytics.gradeDistribution).map(([grade, count]) => ({
      grade,
      students: count,
      color: colors[grade] || '#94a3b8',
    }));
  }, [progressAnalytics]);

  const attendanceData = useMemo(() => {
    if (!reportsSummary?.attendance) return [];
    const { present = 0, absent = 0, totalMarked = 0 } = reportsSummary.attendance;
    const others = Math.max(totalMarked - present - absent, 0);
    const slices = [
      { name: 'Present', value: present, color: '#10b981' },
      { name: 'Absent', value: absent, color: '#ef4444' },
    ];
    if (others > 0) {
      slices.push({ name: 'Other', value: others, color: '#f59e0b' });
    }
    return slices.filter((slice) => slice.value > 0);
  }, [reportsSummary]);

  const improvementStats = useMemo(() => {
    if (!progressAnalytics?.improvementTrends) return [];
    const colors = {
      improving: '#10b981',
      stable: '#6b7280',
      declining: '#ef4444',
    };
    const total = Object.values(progressAnalytics.improvementTrends).reduce((sum, value) => sum + value, 0);
    return Object.entries(progressAnalytics.improvementTrends).map(([label, count]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      value: total ? Math.round((count / total) * 100) : 0,
      count,
      color: colors[label] || '#3b82f6',
    }));
  }, [progressAnalytics]);

  const filteredInvoices = useMemo(() => {
    const grade = normalizeClassValue(selectedClass);
    const section = normalizeSectionValue(selectedSection);
    return feeInvoices.filter((invoice) => {
      const classValue = `${invoice.className || ''}`.match(/(\d+)/)?.[1] || '';
      const sectionValue = (invoice.section || '').toUpperCase();
      const gradeMatches = !grade || classValue === grade;
      const sectionMatches = !section || sectionValue === section.toUpperCase();
      return gradeMatches && sectionMatches;
    });
  }, [feeInvoices, selectedClass, selectedSection]);

  const feesChartData = useMemo(() => buildFeeChartData(filteredInvoices), [filteredInvoices]);

  const recentActivity = useMemo(() => {
    if (!auditLogs.length) return [];
    const palette = ['blue', 'green', 'purple', 'orange'];
    return auditLogs.slice(0, 6).map((log, index) => ({
      id: log._id || index,
      teacher: log.meta?.actorName || log.actorType || 'Admin',
      action: log.action || 'Update',
      subject: log.entity || log.meta?.entityName || 'Record',
      time: formatRelativeTime(log.createdAt),
      color: palette[index % palette.length],
    }));
  }, [auditLogs]);

  const keyMetrics = useMemo(() => {
    const totalStudents = reportsSummary?.users?.students || progressAnalytics?.totalStudents || 0;
    const fees = reportsSummary?.fees || {};
    const improvement = progressAnalytics?.improvementTrends || {};
    const improvingCount = improvement.improving || 0;
    const decliningCount = improvement.declining || 0;
    return [
      {
        title: 'Total Students',
        value: totalStudents ? totalStudents.toLocaleString() : '—',
        change: reportsSummary?.users?.teachers ? `${reportsSummary.users.teachers} teachers` : '',
        trend: 'up',
        icon: Users,
        color: 'blue',
        description: 'Active in this school',
      },
      {
        title: 'Attendance Rate',
        value: attendanceRate ? `${attendanceRate}%` : '—',
        change: reportsSummary?.attendance ? `${reportsSummary.attendance.present || 0} marked present` : '',
        trend: attendanceRate >= 85 ? 'up' : 'down',
        icon: CheckCircle,
        color: 'green',
        description: 'Across all classes',
      },
      {
        title: 'Average Score',
        value: progressAnalytics ? `${progressAnalytics.averageScore || 0}%` : '—',
        change: progressAnalytics ? `${improvingCount} improving` : '',
        trend: improvingCount >= decliningCount ? 'up' : 'down',
        icon: GraduationCap,
        color: 'purple',
        description: 'Subject mastery',
      },
      {
        title: 'Fees Collected',
        value: fees ? formatCurrency(fees.paidAmount || 0) : '—',
        change: fees ? `Outstanding ${formatCurrency(fees.balanceAmount || 0)}` : '',
        trend: (fees?.paidAmount || 0) >= (fees?.balanceAmount || 0) ? 'up' : 'down',
        icon: DollarSign,
        color: 'orange',
        description: 'Collections to date',
      },
    ];
  }, [attendanceRate, progressAnalytics, reportsSummary]);

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        icon: 'text-blue-500',
        gradient: 'from-blue-500 to-blue-600',
        light: 'bg-blue-100'
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        icon: 'text-green-500',
        gradient: 'from-green-500 to-green-600',
        light: 'bg-green-100'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        icon: 'text-purple-500',
        gradient: 'from-purple-500 to-purple-600',
        light: 'bg-purple-100'
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        icon: 'text-orange-500',
        gradient: 'from-orange-500 to-orange-600',
        light: 'bg-orange-100'
      }
    };
    return colors[color] || colors.blue;
  };

  const exportAnalyticsToPDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    const now = new Date();
    const generatedAt = now.toLocaleString('en-IN');
    const generatedDate = now.toISOString().slice(0, 10);
    let yPos = 16;

    const ensureSpace = (required = 8) => {
      if (yPos + required > pageHeight - 14) {
        pdf.addPage();
        yPos = 16;
      }
    };

    const addTitle = (text) => {
      ensureSpace(12);
      pdf.setFontSize(13);
      pdf.setFont(undefined, 'bold');
      pdf.text(text, margin, yPos);
      yPos += 7;
    };

    const addLine = (label, value = '') => {
      ensureSpace(7);
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      const line = `${label}: ${value}`;
      const wrapped = pdf.splitTextToSize(line, contentWidth);
      pdf.text(wrapped, margin, yPos);
      yPos += wrapped.length * 5;
    };

    const addTableRows = (headers, rows) => {
      ensureSpace(9);
      pdf.setFontSize(9.5);
      pdf.setFont(undefined, 'bold');
      pdf.text(headers.join(' | '), margin, yPos);
      yPos += 5;
      pdf.setFont(undefined, 'normal');
      if (!rows.length) {
        addLine('Info', 'No records available');
        return;
      }
      rows.forEach((row) => {
        const text = row.join(' | ');
        const wrapped = pdf.splitTextToSize(text, contentWidth);
        ensureSpace(wrapped.length * 5 + 1);
        pdf.text(wrapped, margin, yPos);
        yPos += wrapped.length * 5;
      });
    };

    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.text('Admin Analytics Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Generated: ${generatedAt}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
    pdf.text(`Filters: ${selectedClass} | ${selectedSection === 'All Sections' ? 'All Sections' : `Sec ${selectedSection}`}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    addTitle('Key Metrics');
    keyMetrics.forEach((metric) => {
      addLine(metric.title, `${metric.value}${metric.change ? ` (${metric.change})` : ''}`);
    });

    addTitle('Attendance & Users');
    addLine('Attendance Rate', `${attendanceRate || 0}%`);
    addLine('Present', formatNumber(reportsSummary?.attendance?.present || 0));
    addLine('Absent', formatNumber(reportsSummary?.attendance?.absent || 0));
    addLine('Total Marked', formatNumber(reportsSummary?.attendance?.totalMarked || 0));
    addLine('Students', formatNumber(reportsSummary?.users?.students || progressAnalytics?.totalStudents || 0));
    addLine('Teachers', formatNumber(reportsSummary?.users?.teachers || 0));

    addTitle('Fees Overview');
    addLine('Collected', formatCurrency(reportsSummary?.fees?.paidAmount || 0));
    addLine('Outstanding', formatCurrency(reportsSummary?.fees?.balanceAmount || 0));
    addLine('Total Invoiced', formatCurrency((reportsSummary?.fees?.paidAmount || 0) + (reportsSummary?.fees?.balanceAmount || 0)));
    addLine('Invoices In Scope', formatNumber(filteredInvoices.length));

    addTitle('Fees Collection Trend (6 Months)');
    addTableRows(
      ['Month', 'Collected', 'Pending'],
      feesChartData.map((item) => [
        item.month,
        formatCurrency(item.paid),
        formatCurrency(item.pending),
      ])
    );

    addTitle('Subject Performance');
    addTableRows(
      ['Subject', 'Average', 'Students'],
      subjectPerformance.slice(0, 12).map((item) => [
        item.subject,
        `${item.averageScore}%`,
        formatNumber(item.studentCount),
      ])
    );

    addTitle('Grade Distribution');
    addTableRows(
      ['Grade', 'Students'],
      gradeDistributionData.map((item) => [item.grade, formatNumber(item.students)])
    );

    addTitle('Improvement Trends');
    addTableRows(
      ['Trend', 'Count', 'Share'],
      improvementStats.map((item) => [item.label, formatNumber(item.count), `${item.value}%`])
    );

    addTitle('Recent Admin Activity');
    addTableRows(
      ['Actor', 'Action', 'Entity', 'Time'],
      recentActivity.map((item) => [item.teacher, item.action, item.subject, item.time])
    );

    ensureSpace(8);
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    pdf.text('Source: Live admin analytics, reports summary, fees invoices, and audit logs.', margin, yPos);

    pdf.save(`admin-analytics-report-${generatedDate}.pdf`);
  };

  const activeErrors = [analyticsError, reportsError, feesError, activityError].filter(Boolean);
  const initialLoading =
    (analyticsLoading || reportsLoading) &&
    !progressAnalytics &&
    !reportsSummary;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6 space-y-6">
        {initialLoading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center text-gray-600">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              Loading analytics...
            </div>
          </div>
        ) : (
          <>
            {activeErrors.length > 0 && (
              <div className="space-y-2">
                {activeErrors.map((err, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
                <p className="text-gray-600">Comprehensive insights and performance metrics</p>
              </div>
              <button
                onClick={exportAnalyticsToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {keyMetrics.map((metric, idx) => {
                const Icon = metric.icon;
                const colors = getColorClasses(metric.color);
                const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;

                return (
                  <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${colors.bg}`}>
                        <Icon className={`w-6 h-6 ${colors.icon}`} />
                      </div>
                      {metric.change && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          metric.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          <TrendIcon className="w-3 h-3" />
                          {metric.change}
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</p>
                    <p className="text-xs text-gray-500">{metric.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-gray-700" />
                    Subject Performance
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Average scores by subject</p>
                </div>
                {analyticsLoading && !subjectPerformance.length ? (
                  <div className="text-center text-gray-500 py-10 text-sm">Loading performance data...</div>
                ) : subjectPerformance.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={subjectPerformance}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="subject" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Area type="monotone" dataKey="averageScore" stroke="#6366f1" fillOpacity={1} fill="url(#scoreGradient)" name="Average Score" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500 py-10 text-sm">No subject analytics available yet.</div>
                )}
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-gray-700" />
                      Fees Collection
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Paid vs pending over the last 6 months</p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {classOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {sectionOptions.map((section) => (
                        <option key={section} value={section}>
                          {section === 'All Sections' ? section : `Sec ${section}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {feesLoading && !feesChartData.length ? (
                  <div className="text-center text-gray-500 py-10 text-sm">Loading fee analytics...</div>
                ) : feesChartData.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={feesChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="paid" fill="#10b981" radius={[4, 4, 0, 0]} name="Collected" />
                      <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500 py-10 text-sm">No fee data for this filter.</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Attendance Breakdown</h2>
                    <p className="text-sm text-gray-600">Based on reported sessions</p>
                  </div>
                  <div className="bg-green-50 px-3 py-1 rounded-lg">
                    <p className="text-sm font-semibold text-green-600">{attendanceRate || 0}% Present</p>
                  </div>
                </div>
                {reportsLoading && !attendanceData.length ? (
                  <div className="text-center text-gray-500 py-10 text-sm">Loading attendance breakdown...</div>
                ) : attendanceData.length ? (
                  <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <ResponsiveContainer width="50%" height={200}>
                      <PieChart>
                        <Pie
                          data={attendanceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {attendanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-3">
                      {attendanceData.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-sm text-gray-600">{item.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-10 text-sm">No attendance data recorded.</div>
                )}
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Subject Progress</h2>
                <p className="text-sm text-gray-600 mb-4">Average mastery across subjects</p>
                <div className="space-y-4">
                  {subjectPerformance.slice(0, 6).map((course, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{course.subject}</span>
                        <span className="text-sm font-semibold text-gray-900">{course.averageScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.averageScore}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  {!subjectPerformance.length && (
                    <p className="text-sm text-gray-500 text-center py-6">No subject performance data available.</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Grade Distribution</h2>
                <p className="text-sm text-gray-600 mb-6">Latest performance snapshot</p>
                {gradeDistributionData.length ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={gradeDistributionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <YAxis type="category" dataKey="grade" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="students" radius={[0, 4, 4, 0]}>
                        {gradeDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500 py-6 text-sm">No grade distribution data yet.</div>
                )}
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-700" />
                  Improvement Trends
                </h2>
                <p className="text-sm text-gray-600 mb-6">Student momentum over the last term</p>
                <div className="grid grid-cols-2 gap-4">
                  {improvementStats.length ? (
                    improvementStats.map((stat, idx) => (
                      <div key={idx} className="p-4 rounded-lg border-2" style={{ borderColor: stat.color, backgroundColor: stat.color + '10' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">{stat.label}</span>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }}></div>
                        </div>
                        <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}%</p>
                        <p className="text-xs text-gray-500 mt-1">{stat.count} students</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 col-span-2 text-center py-4">No improvement data yet.</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-700" />
                  Recent Activity
                </h2>
                <p className="text-sm text-gray-600 mb-4">Latest admin actions</p>
                {activityLoading && !recentActivity.length ? (
                  <div className="text-center text-gray-500 py-6 text-sm">Loading activity...</div>
                ) : recentActivity.length ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => {
                      const colors = getColorClasses(activity.color);
                      return (
                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                            <Activity className={`w-5 h-5 ${colors.icon}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.teacher}</p>
                            <p className="text-xs text-gray-600">{activity.action}{activity.subject ? `: ${activity.subject}` : ''}</p>
                            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6 text-sm">No recent activity logged.</div>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
