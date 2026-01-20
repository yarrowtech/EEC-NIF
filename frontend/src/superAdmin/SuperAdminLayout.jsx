import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, Building2, MessageSquare, AlertTriangle, LifeBuoy, Menu, KeyRound, Activity, IdCard } from 'lucide-react';

const navLinks = [
  { to: '/super-admin/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/super-admin/requests', label: 'Requests', icon: Building2 },
  { to: '/super-admin/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/super-admin/issues', label: 'Issues', icon: AlertTriangle },
  { to: '/super-admin/tickets', label: 'Tickets', icon: LifeBuoy },
  { to: '/super-admin/credentials', label: 'Passwords', icon: KeyRound },
  { to: '/super-admin/id-pass', label: 'ID Pass', icon: IdCard },
  { to: '/super-admin/operations', label: 'Operations', icon: Activity }
];

const SuperAdminLayout = ({ children, sidebarCollapsed, onToggleSidebar, insights, profile }) => {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside
        className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-200 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
            <Shield size={24} />
          </div>
          {!sidebarCollapsed && (
            <div>
              <p className="text-xs uppercase text-slate-500">EEC Platform</p>
              <p className="text-base font-semibold text-slate-800">Super Admin</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:text-amber-600 ${
                  isActive ? 'text-amber-600 bg-amber-50 border-r-4 border-amber-400' : 'text-slate-600'
                }`
              }
            >
              <Icon size={18} />
              {!sidebarCollapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-5 border-t border-slate-100 text-xs text-slate-500">
          {!sidebarCollapsed && (
            <>
              <p className="font-semibold text-slate-600">{profile.name}</p>
              <p>{profile.role}</p>
              <p className="text-slate-400">{profile.email}</p>
            </>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-slate-400 tracking-wide">Control Centre</p>
              <h1 className="text-2xl font-semibold text-slate-800">Super Admin Portal</h1>
            </div>
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
              aria-label="Toggle sidebar"
            >
              <Menu size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {insights.map((insight) => (
              <div key={insight.label} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <p className="text-xs uppercase tracking-wide text-slate-500">{insight.label}</p>
                <p className="text-2xl font-semibold text-slate-800">{insight.value}</p>
                {insight.change && (
                  <p className={`text-xs font-medium ${insight.change.startsWith('+') ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {insight.change}
                  </p>
                )}
              </div>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
