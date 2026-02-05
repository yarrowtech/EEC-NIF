import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  Users,
  UserCheck,
  Calendar as CalendarIcon,
  TrendingUp,
  GraduationCap,
  UsersRound,
  Plus,
  Bell,
  FileBarChart,
  AlertCircle,
  Clock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Quick actions
const quickActions = [
  { title: 'Add Student', action: 'student', icon: Plus, color: 'blue' },
  { title: 'Send Notification', action: 'notification', icon: Bell, color: 'purple' },
  { title: 'Generate Report', action: 'report', icon: FileBarChart, color: 'orange' },
];

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const computeOutstanding = (invoice = {}) => {
  const total = Number(invoice.totalAmount || 0);
  const paid = Number(invoice.paidAmount || 0);
  const hasBalance = invoice.balanceAmount === 0 || invoice.balanceAmount;
  const balance = hasBalance ? Number(invoice.balanceAmount) : total - paid;
  if (!Number.isFinite(balance)) {
    return 0;
  }
  return Math.max(0, balance);
};

const getMonthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const buildMonthlyTrend = (invoices = [], payments = [], months = 6) => {
  const buckets = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i -= 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: getMonthKey(monthDate),
      month: monthDate.toLocaleString('default', { month: 'short' }),
      collected: 0,
      due: 0,
    });
  }
  const bucketMap = buckets.reduce((map, bucket) => map.set(bucket.key, bucket), new Map());

  payments.forEach((payment) => {
    const ts = payment.paidOn || payment.createdAt;
    if (!ts) return;
    const key = getMonthKey(new Date(ts));
    if (bucketMap.has(key)) {
      bucketMap.get(key).collected += Number(payment.amount || 0);
    }
  });

  invoices.forEach((invoice) => {
    const ts = invoice.dueDate || invoice.createdAt;
    if (!ts) return;
    const key = getMonthKey(new Date(ts));
    if (bucketMap.has(key)) {
      bucketMap.get(key).due += computeOutstanding(invoice);
    }
  });

  return buckets;
};

const buildUpcomingFromInvoices = (invoices = []) => {
  const now = new Date();
  return invoices
    .filter(
      (invoice) =>
        invoice.dueDate &&
        computeOutstanding(invoice) > 0 &&
        new Date(invoice.dueDate) >= now
    )
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4)
    .map((invoice) => ({
      id: invoice._id || invoice.id,
      date: invoice.dueDate,
      title: invoice.title || 'Fee Invoice',
      desc: `${formatCurrency(computeOutstanding(invoice))} outstanding`,
    }));
};

const classifyActivity = (action = '') => {
  const value = action.toLowerCase();
  if (value.includes('delete') || value.includes('remove') || value.includes('archive')) {
    return 'warning';
  }
  if (value.includes('create') || value.includes('add') || value.includes('approve')) {
    return 'success';
  }
  return 'info';
};

const normalizeActivity = (logs = []) =>
  logs.slice(0, 6).map((log) => ({
    id: log._id || log.id,
    action: log.action || 'Activity recorded',
    detail: log.entity
      ? `${log.entity}${log.entityId ? ` • ${log.entityId}` : ''}`
      : typeof log.meta === 'string'
        ? log.meta
        : log.meta?.message || '',
    createdAt: log.createdAt || log.timestamp || new Date().toISOString(),
    type: classifyActivity(log.action || ''),
  }));

const buildFinancialState = (invoices = [], payments = []) => {
  const trend = buildMonthlyTrend(invoices, payments);
  const totals = invoices.reduce(
    (acc, invoice) => {
      const outstanding = computeOutstanding(invoice);
      acc.totalOutstanding += outstanding;
      if (
        invoice.dueDate &&
        new Date(invoice.dueDate) < new Date() &&
        outstanding > 0
      ) {
        acc.overdueAmount += outstanding;
      }
      return acc;
    },
    { totalOutstanding: 0, overdueAmount: 0 }
  );
  const totalCollected = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );
  return {
    trend,
    totals: {
      totalCollected,
      totalOutstanding: totals.totalOutstanding,
      overdueAmount: totals.overdueAmount,
    },
    upcomingInvoices: buildUpcomingFromInvoices(invoices),
  };
};

const Dashboard = ({ setShowAdminHeader }) => {
  const [selectedAction, setSelectedAction] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [financialState, setFinancialState] = useState({
    trend: [],
    totals: { totalCollected: 0, totalOutstanding: 0, overdueAmount: 0 },
    upcomingInvoices: [],
  });
  const [financialLoading, setFinancialLoading] = useState(true);
  const [financialError, setFinancialError] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState('');

  const handleActionClick = (action) => {
    setSelectedAction(action);
    setTimeout(() => setSelectedAction(null), 2000);
  };

  useEffect(() => {
    setShowAdminHeader(true);
  }, [setShowAdminHeader]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/dashboard-stats`, {
          headers: {
            authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to load dashboard stats');
        }
        setDashboardStats(data);
      } catch (err) {
        setStatsError(err.message || 'Failed to load dashboard stats');
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadFinancials = async () => {
      setFinancialError('');
      setFinancialLoading(true);
      try {
        const [invoiceRes, paymentRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/fees/invoices`),
          fetch(`${import.meta.env.VITE_API_URL}/api/fees/payments`),
        ]);
        const invoicesData = await invoiceRes.json().catch(() => []);
        const paymentsData = await paymentRes.json().catch(() => []);
        if (!invoiceRes.ok) {
          throw new Error(invoicesData?.error || 'Failed to load invoices');
        }
        if (!paymentRes.ok) {
          throw new Error(paymentsData?.error || 'Failed to load payments');
        }
        if (!cancelled) {
          setFinancialState(
            buildFinancialState(
              Array.isArray(invoicesData) ? invoicesData : [],
              Array.isArray(paymentsData) ? paymentsData : []
            )
          );
        }
      } catch (err) {
        if (!cancelled) {
          setFinancialError(err.message || 'Failed to load fee data');
          setFinancialState({
            trend: [],
            totals: { totalCollected: 0, totalOutstanding: 0, overdueAmount: 0 },
            upcomingInvoices: [],
          });
        }
      } finally {
        if (!cancelled) {
          setFinancialLoading(false);
        }
      }
    };

    loadFinancials();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadActivity = async () => {
      setActivityError('');
      setActivityLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/audit-logs`);
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to load activity');
        }
        if (!cancelled) {
          setAuditLogs(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setActivityError(err.message || 'Failed to load activity');
          setAuditLogs([]);
        }
      } finally {
        if (!cancelled) {
          setActivityLoading(false);
        }
      }
    };

    loadActivity();
    return () => {
      cancelled = true;
    };
  }, []);

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        icon: 'text-blue-500',
        hover: 'hover:bg-blue-100',
        progress: 'bg-blue-500'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-600',
        icon: 'text-green-500',
        hover: 'hover:bg-green-100',
        progress: 'bg-green-500'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-600',
        icon: 'text-purple-500',
        hover: 'hover:bg-purple-100',
        progress: 'bg-purple-500'
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-600',
        icon: 'text-orange-500',
        hover: 'hover:bg-orange-100',
        progress: 'bg-orange-500'
      }
    };
    return colors[color] || colors.blue;
  };

  const totalStudents = dashboardStats?.students?.total || 0;
  const recentStudents = dashboardStats?.students?.recent || 0;
  const totalTeachers = dashboardStats?.teachers?.total || 0;
  const recentTeachers = dashboardStats?.teachers?.recent || 0;
  const totalParents = dashboardStats?.parents?.total || 0;
  const recentParents = dashboardStats?.parents?.recent || 0;
  const totalUsers = dashboardStats?.totalUsers || 0;

  const getPercent = (value, total) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };

  const keyMetrics = [
    {
      label: 'Students',
      value: totalStudents,
      total: totalStudents,
      percentage: getPercent(recentStudents, totalStudents),
      icon: Users,
      color: 'blue',
      trend: `${recentStudents} new in 30 days`
    },
    {
      label: 'Teachers',
      value: totalTeachers,
      total: totalTeachers,
      percentage: getPercent(recentTeachers, totalTeachers),
      icon: UserCheck,
      color: 'green',
      trend: `${recentTeachers} new in 30 days`
    },
    {
      label: 'Parents',
      value: totalParents,
      total: totalParents,
      percentage: getPercent(recentParents, totalParents),
      icon: UsersRound,
      color: 'purple',
      trend: `${recentParents} new in 30 days`
    },
    {
      label: 'Total Users',
      value: totalUsers,
      total: totalUsers,
      percentage: getPercent(dashboardStats?.recentTotal || 0, totalUsers),
      icon: Users,
      color: 'orange',
      trend: `${dashboardStats?.recentTotal || 0} new in 30 days`
    },
  ];

  const statsOverview = [
    { label: 'Total Teachers', value: totalTeachers, icon: GraduationCap, change: `+${recentTeachers}`, color: 'blue' },
    { label: 'Total Students', value: totalStudents, icon: Users, change: `+${recentStudents}`, color: 'green' },
    { label: 'Total Parents', value: totalParents, icon: UsersRound, change: `+${recentParents}`, color: 'orange' },
    { label: 'Total Users', value: totalUsers, icon: Users, change: `+${dashboardStats?.recentTotal || 0}`, color: 'purple' },
  ];

  const feesTrend = financialState.trend;
  const chartTotalCollected = feesTrend.reduce((sum, entry) => sum + entry.collected, 0);
  const upcomingEvents = financialState.upcomingInvoices;
  const recentActivity = normalizeActivity(auditLogs);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here is what is happening today.</p>
        </div>

        {statsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            {statsError}
          </div>
        )}

        {/* Key Metrics - Attendance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {keyMetrics.map((metric) => {
            const Icon = metric.icon;
            const colors = getColorClasses(metric.color);
            return (
              <div key={metric.label} className={`bg-white rounded-xl p-6 shadow-sm border ${colors.border} hover:shadow-md transition-shadow duration-200`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colors.bg}`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                    {metric.percentage}%
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
                    <span className="text-sm text-gray-500">/ {metric.total}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className={`${colors.progress} h-2 rounded-full transition-all duration-300`} style={{ width: `${metric.percentage}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {statsLoading ? 'Loading...' : metric.trend}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsOverview.map((stat) => {
            const Icon = stat.icon;
            const colors = getColorClasses(stat.color);
            return (
              <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {statsLoading ? '...' : stat.value}
                    </h3>
                    <p className={`text-xs ${colors.text} font-medium mt-2 flex items-center gap-1`}>
                      <TrendingUp className="w-3 h-3" />
                      {statsLoading ? 'Loading...' : `${stat.change} this month`}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${colors.bg}`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fees Collection & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Fees Collection Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-gray-700" />
                  Fees Collection
                </h2>
                <p className="text-sm text-gray-600 mt-1">Last 6 months overview</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total Collected</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(chartTotalCollected)}
                </p>
              </div>
            </div>
            {financialError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span>{financialError}</span>
              </div>
            )}
            {financialLoading ? (
              <div className="flex h-60 items-center justify-center text-sm text-gray-500">
                Loading fee data...
              </div>
            ) : feesTrend.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={feesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [formatCurrency(value), '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="collected" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Collected" />
                  <Bar dataKey="due" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Due" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-60 items-center justify-center text-sm text-gray-500">
                No fee data available yet.
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                const colors = getColorClasses(action.color);
                return (
                  <button
                    key={action.action}
                    onClick={() => handleActionClick(action.action)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 ${
                      selectedAction === action.action
                        ? `${colors.bg} ${colors.border} scale-95`
                        : `border-gray-200 hover:border-${action.color}-300 ${colors.hover}`
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                      <Icon className={`w-4 h-4 ${colors.icon}`} />
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{action.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-gray-700" />
              Upcoming Events
            </h2>
            {financialLoading ? (
              <p className="text-sm text-gray-500">Loading due schedules...</p>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming fee deadlines.</p>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id || event.date}
                    className="flex gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[60px] p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-lg font-bold text-blue-600">
                        {new Date(event.date).getDate()}
                      </span>
                      <span className="text-xs text-blue-600 font-medium">
                        {new Date(event.date).toLocaleString('default', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-700" />
              Recent Activity
            </h2>
            {activityError ? (
              <p className="text-sm text-red-600">{activityError}</p>
            ) : activityLoading ? (
              <p className="text-sm text-gray-500">Loading audit trail...</p>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity recorded.</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((item) => (
                  <div
                    key={item.id || item.createdAt}
                    className="flex gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div
                      className={`mt-1 p-1.5 rounded-full ${
                        item.type === 'success'
                          ? 'bg-green-100'
                          : item.type === 'warning'
                            ? 'bg-orange-100'
                            : 'bg-blue-100'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          item.type === 'success'
                            ? 'bg-green-500'
                            : item.type === 'warning'
                              ? 'bg-orange-500'
                              : 'bg-blue-500'
                        }`}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 mb-1">{item.action}</p>
                      {item.detail && (
                        <p className="text-xs text-gray-600 mb-0.5">{item.detail}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {selectedAction && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-900">
              Processing {selectedAction} action...
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
