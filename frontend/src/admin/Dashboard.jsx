import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  Users,
  UserCheck,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  GraduationCap,
  UsersRound,
  Plus,
  Bell,
  FileBarChart,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Zap,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ── helpers ──────────────────────────────────────────────────────────────────

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
  if (!Number.isFinite(balance)) return 0;
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
    if (bucketMap.has(key)) bucketMap.get(key).collected += Number(payment.amount || 0);
  });

  invoices.forEach((invoice) => {
    const ts = invoice.dueDate || invoice.createdAt;
    if (!ts) return;
    const key = getMonthKey(new Date(ts));
    if (bucketMap.has(key)) bucketMap.get(key).due += computeOutstanding(invoice);
  });

  return buckets;
};

const buildUpcomingFromInvoices = (invoices = []) => {
  const now = new Date();
  return invoices
    .filter((inv) => inv.dueDate && computeOutstanding(inv) > 0 && new Date(inv.dueDate) >= now)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4)
    .map((inv) => ({
      id: inv._id || inv.id,
      date: inv.dueDate,
      title: inv.title || 'Fee Invoice',
      desc: `${formatCurrency(computeOutstanding(inv))} outstanding`,
    }));
};

const classifyActivity = (action = '') => {
  const v = action.toLowerCase();
  if (v.includes('delete') || v.includes('remove') || v.includes('archive')) return 'warning';
  if (v.includes('create') || v.includes('add') || v.includes('approve')) return 'success';
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
    (acc, inv) => {
      const outstanding = computeOutstanding(inv);
      acc.totalOutstanding += outstanding;
      if (inv.dueDate && new Date(inv.dueDate) < new Date() && outstanding > 0)
        acc.overdueAmount += outstanding;
      return acc;
    },
    { totalOutstanding: 0, overdueAmount: 0 }
  );
  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
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

// ── sub-components ────────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon, gradient, textColor, trend, loading }) => (
  <div className={`relative rounded-2xl p-6 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 ${gradient}`}>
    {/* Decorative blob */}
    <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-20 bg-white" />
    <div className="absolute -bottom-6 -right-2 w-16 h-16 rounded-full opacity-10 bg-white" />

    <div className="relative">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white">
          {loading ? '...' : trend}
        </span>
      </div>
      <p className="text-white/80 text-sm font-medium mb-1">{label}</p>
      <h3 className="text-3xl font-black text-white tracking-tight">
        {loading ? <span className="animate-pulse">—</span> : value.toLocaleString()}
      </h3>
    </div>
  </div>
);

const QuickActionCard = ({ icon: Icon, label, color, onClick, active }) => (
  <button
    onClick={onClick}
    className={`group flex flex-col items-center gap-2 px-5 py-4 rounded-xl border-2 transition-all duration-200 font-medium text-sm
      ${active
        ? `${color.activeBg} ${color.border} scale-95 shadow-inner`
        : `bg-white ${color.border} hover:${color.hoverBg} hover:shadow-md hover:-translate-y-0.5`
      }`}
  >
    <div className={`p-3 rounded-xl ${active ? color.iconBgActive : color.iconBg} transition-colors`}>
      <Icon className={`w-5 h-5 ${active ? color.iconActive : color.icon}`} />
    </div>
    <span className={active ? color.textActive : 'text-gray-700'}>{label}</span>
  </button>
);

const ActivityDot = ({ type }) => {
  const styles = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
  };
  const rings = {
    success: 'bg-emerald-100',
    warning: 'bg-amber-100',
    info: 'bg-blue-100',
  };
  return (
    <div className={`mt-1 p-1.5 rounded-full flex-shrink-0 ${rings[type] || rings.info}`}>
      <div className={`w-2 h-2 rounded-full ${styles[type] || styles.info}`} />
    </div>
  );
};

// Custom tooltip for recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2" style={{ color: entry.color }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: entry.color }} />
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

// ── main component ────────────────────────────────────────────────────────────

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
  const [now, setNow] = useState(new Date());

  // live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleActionClick = (action) => {
    setSelectedAction(action);
    setTimeout(() => setSelectedAction(null), 2000);
  };

  useEffect(() => {
    setShowAdminHeader(true);
  }, [setShowAdminHeader]);

  // fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/dashboard-stats`, {
          headers: { authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to load dashboard stats');
        setDashboardStats(data);
      } catch (err) {
        setStatsError(err.message || 'Failed to load dashboard stats');
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // fetch financials
  useEffect(() => {
    let cancelled = false;
    const loadFinancials = async () => {
      setFinancialError('');
      setFinancialLoading(true);
      try {
        const authHeaders = { authorization: `Bearer ${localStorage.getItem('token')}` };
        const [invoiceRes, paymentRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/fees/invoices`, { headers: authHeaders }),
          fetch(`${import.meta.env.VITE_API_URL}/api/fees/payments`, { headers: authHeaders }),
        ]);
        const invoicesData = await invoiceRes.json().catch(() => []);
        const paymentsData = await paymentRes.json().catch(() => []);
        if (!invoiceRes.ok) throw new Error(invoicesData?.error || 'Failed to load invoices');
        if (!paymentRes.ok) throw new Error(paymentsData?.error || 'Failed to load payments');
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
        if (!cancelled) setFinancialLoading(false);
      }
    };
    loadFinancials();
    return () => { cancelled = true; };
  }, []);

  // fetch audit logs
  useEffect(() => {
    let cancelled = false;
    const loadActivity = async () => {
      setActivityError('');
      setActivityLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/audit-logs`);
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(data?.error || 'Failed to load activity');
        if (!cancelled) setAuditLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          setActivityError(err.message || 'Failed to load activity');
          setAuditLogs([]);
        }
      } finally {
        if (!cancelled) setActivityLoading(false);
      }
    };
    loadActivity();
    return () => { cancelled = true; };
  }, []);

  // ── derived values ────────────────────────────────────────────────────────

  const totalStudents = dashboardStats?.students?.total || 0;
  const recentStudents = dashboardStats?.students?.recent || 0;
  const totalTeachers = dashboardStats?.teachers?.total || 0;
  const recentTeachers = dashboardStats?.teachers?.recent || 0;
  const totalParents = dashboardStats?.parents?.total || 0;
  const recentParents = dashboardStats?.parents?.recent || 0;
  const totalUsers = dashboardStats?.totalUsers || 0;
  const recentUsers = dashboardStats?.recentTotal || 0;

  const { trend: feesTrend, totals: feeTotals, upcomingInvoices: upcomingEvents } = financialState;
  const recentActivity = normalizeActivity(auditLogs);

  const statCards = [
    {
      label: 'Total Students',
      value: totalStudents,
      icon: Users,
      gradient: 'bg-gradient-to-br from-blue-600 to-blue-400',
      trend: `+${recentStudents} this month`,
      loading: statsLoading,
    },
    {
      label: 'Total Teachers',
      value: totalTeachers,
      icon: GraduationCap,
      gradient: 'bg-gradient-to-br from-violet-600 to-purple-400',
      trend: `+${recentTeachers} this month`,
      loading: statsLoading,
    },
    {
      label: 'Total Parents',
      value: totalParents,
      icon: UsersRound,
      gradient: 'bg-gradient-to-br from-amber-500 to-yellow-400',
      trend: `+${recentParents} this month`,
      loading: statsLoading,
    },
    {
      label: 'All Users',
      value: totalUsers,
      icon: Activity,
      gradient: 'bg-gradient-to-br from-emerald-600 to-teal-400',
      trend: `+${recentUsers} this month`,
      loading: statsLoading,
    },
  ];

  const quickActions = [
    {
      label: 'Add Student',
      action: 'student',
      icon: Plus,
      color: {
        border: 'border-blue-200', hoverBg: 'bg-blue-50', activeBg: 'bg-blue-50',
        iconBg: 'bg-blue-100', iconBgActive: 'bg-blue-200',
        icon: 'text-blue-600', iconActive: 'text-blue-700',
        textActive: 'text-blue-700',
      },
    },
    {
      label: 'Send Notification',
      action: 'notification',
      icon: Bell,
      color: {
        border: 'border-purple-200', hoverBg: 'bg-purple-50', activeBg: 'bg-purple-50',
        iconBg: 'bg-purple-100', iconBgActive: 'bg-purple-200',
        icon: 'text-purple-600', iconActive: 'text-purple-700',
        textActive: 'text-purple-700',
      },
    },
    {
      label: 'Generate Report',
      action: 'report',
      icon: FileBarChart,
      color: {
        border: 'border-amber-200', hoverBg: 'bg-amber-50', activeBg: 'bg-amber-50',
        iconBg: 'bg-amber-100', iconBgActive: 'bg-amber-200',
        icon: 'text-amber-600', iconActive: 'text-amber-700',
        textActive: 'text-amber-700',
      },
    },
  ];

  const feeSummaryPills = [
    {
      label: 'Collected',
      value: formatCurrency(feeTotals.totalCollected),
      icon: CheckCircle2,
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      label: 'Outstanding',
      value: formatCurrency(feeTotals.totalOutstanding),
      icon: DollarSign,
      cls: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      label: 'Overdue',
      value: formatCurrency(feeTotals.overdueAmount),
      icon: AlertTriangle,
      cls: 'bg-red-50 text-red-700 border-red-200',
    },
  ];

  const greeting = (() => {
    const h = now.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto p-6 space-y-7 max-w-screen-2xl">

        {/* ── Hero Banner ─────────────────────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-400/10 rounded-full -translate-y-1/3 translate-x-1/4 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-7">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-semibold tracking-wider uppercase">System Active</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight">
                {greeting}, Admin 👋
              </h1>
              <p className="text-slate-400 text-sm">
                Here's what's happening across your school this week.
              </p>
              {!statsLoading && (
                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium">
                    <Users className="w-3.5 h-3.5 text-blue-300" />
                    {totalStudents.toLocaleString()} Students
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-300" />
                    {totalTeachers.toLocaleString()} Teachers
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium">
                    <UsersRound className="w-3.5 h-3.5 text-amber-300" />
                    {totalParents.toLocaleString()} Parents
                  </span>
                </div>
              )}
            </div>

            {/* Live clock */}
            <div className="flex flex-col items-end gap-1 bg-white/5 rounded-xl px-5 py-4 border border-white/10 backdrop-blur-sm flex-shrink-0">
              <p className="text-slate-400 text-xs">
                {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-white text-3xl font-mono font-bold tracking-widest">
                {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {/* ── Error Banner ─────────────────────────────────────────────────── */}
        {statsError && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {statsError}
          </div>
        )}

        {/* ── 4-Card Stat Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* ── Fees Chart + Quick Actions ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Fees Chart — 2/3 width */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-blue-500" />
                    Fees Collection
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">Revenue trend — last 6 months</p>
                </div>
              </div>

              {/* Summary pills */}
              {!financialLoading && !financialError && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {feeSummaryPills.map(({ label, value, icon: Icon, cls }) => (
                    <span key={label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${cls}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {label}: {value}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {financialError && (
              <div className="mx-6 mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {financialError}
              </div>
            )}

            <div className="px-4 pb-5">
              {financialLoading ? (
                <div className="flex h-56 items-center justify-center text-sm text-gray-400">
                  <span className="animate-pulse">Loading fee data...</span>
                </div>
              ) : feesTrend.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={feesTrend} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                    <Bar dataKey="collected" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Collected" maxBarSize={40} />
                    <Bar dataKey="due" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Due" maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-56 items-center justify-center text-sm text-gray-400">
                  No fee data available yet.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions — 1/3 width */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Quick Actions
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Common admin tasks</p>
            </div>

            <div className="grid grid-cols-1 gap-3 flex-1">
              {quickActions.map((qa) => (
                <QuickActionCard
                  key={qa.action}
                  icon={qa.icon}
                  label={qa.label}
                  color={qa.color}
                  onClick={() => handleActionClick(qa.action)}
                  active={selectedAction === qa.action}
                />
              ))}
            </div>

            {selectedAction && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-medium text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Processing {selectedAction} action…
              </div>
            )}
          </div>
        </div>

        {/* ── Upcoming Events + Recent Activity ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
              <CalendarIcon className="w-5 h-5 text-blue-500" />
              Upcoming Fee Deadlines
            </h2>
            {financialLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <CalendarIcon className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm">No upcoming fee deadlines.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id || event.date}
                    className="flex gap-4 items-center p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[52px] p-2 bg-blue-600 text-white rounded-xl shadow-sm">
                      <span className="text-lg font-black leading-none">
                        {new Date(event.date).getDate()}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                        {new Date(event.date).toLocaleString('default', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-800">{event.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{event.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
              <Clock className="w-5 h-5 text-purple-500" />
              Recent Activity
            </h2>
            {activityError ? (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-3 border border-red-100">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {activityError}
              </div>
            ) : activityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Activity className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm">No recent activity recorded.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((item, idx) => (
                  <div
                    key={item.id || item.createdAt}
                    className={`flex gap-3 py-3 ${idx < recentActivity.length - 1 ? 'border-b border-gray-50' : ''}`}
                  >
                    <ActivityDot type={item.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.action}</p>
                      {item.detail && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{item.detail}</p>
                      )}
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
