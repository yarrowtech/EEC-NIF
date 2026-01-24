import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Building2,
  MessageSquare,
  AlertTriangle,
  LifeBuoy,
  Menu,
  KeyRound,
  Activity,
  IdCard,
  X
} from 'lucide-react';

const navLinks = [
  { to: '/super-admin/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/super-admin/requests', label: 'Requests', icon: Building2 },
  { to: '/super-admin/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/super-admin/issues', label: 'Issues', icon: AlertTriangle },
  { to: '/super-admin/tickets', label: 'Tickets', icon: LifeBuoy },
  { to: '/super-admin/credentials', label: 'Passwords', icon: KeyRound },
  { to: '/super-admin/id-pass', label: 'ID Pass', icon: IdCard },
  { to: '/super-admin/operations', label: 'Operations', icon: Activity },
  { to: '/super-admin/active-schools', label: 'Active Schools', icon: Building2 }
];

const SuperAdminLayout = ({ children, sidebarCollapsed, onToggleSidebar, insights, profile }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/');
  };

  const initials = profile?.name ? profile.name.trim().charAt(0).toUpperCase() : 'S';

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const renderNavItems = (showLabel = true) =>
    navLinks.map(({ to, label, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:text-amber-600 ${
            isActive ? 'text-amber-600 bg-amber-50 border-r-4 border-amber-400' : 'text-slate-600'
          }`
        }
        onClick={closeMobileMenu}
      >
        <Icon size={18} />
        {showLabel && <span>{label}</span>}
      </NavLink>
    ));

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex bg-white border-r border-slate-200 flex-col transition-all duration-200 ${
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

        <nav className="flex-1 py-4">{renderNavItems(!sidebarCollapsed)}</nav>

        <div className="px-4 py-5 border-t border-slate-100 text-xs text-slate-500">
          {!sidebarCollapsed && (
            <>
              <p className="font-semibold text-slate-600">{profile.name}</p>
              <p>{profile.role}</p>
              <p className="text-slate-400 break-all">{profile.email}</p>
            </>
          )}
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col md:hidden transform transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <Shield size={22} />
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">EEC Platform</p>
              <p className="text-base font-semibold text-slate-800">Super Admin</p>
            </div>
          </div>
          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-full border border-slate-200 text-slate-600"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">{renderNavItems(true)}</nav>
        <div className="px-4 py-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-600">{profile.name}</p>
          <p>{profile.role}</p>
          <p className="text-slate-400 break-all">{profile.email}</p>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-30 md:hidden" onClick={closeMobileMenu} role="presentation" />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>
              <div>
                <p className="text-xs uppercase text-slate-400 tracking-wide">Control Centre</p>
                <h1 className="text-2xl font-semibold text-slate-800">Super Admin Portal</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleSidebar}
                className="hidden md:inline-flex p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                aria-label="Toggle sidebar width"
              >
                <Menu size={18} />
              </button>
              <div className="flex items-center gap-3 rounded-full bg-slate-50 px-3 py-1.5 border border-slate-200">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile?.name || 'Super admin'}
                    className="h-9 w-9 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-amber-100 text-amber-700 font-semibold flex items-center justify-center border border-amber-200">
                    {initials}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-700">{profile?.name || 'Super Admin'}</p>
                  <p className="text-xs text-slate-500">{profile?.role || 'Super Administrator'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 px-3 py-1 rounded-full bg-red-100 border border-amber-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {insights.map((insight) => (
              <div key={insight.label} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <p className="text-xs uppercase tracking-wide text-slate-500">{insight.label}</p>
                <p className="text-2xl font-semibold text-slate-800">{insight.value}</p>
                {insight.change && (
                  <p
                    className={`text-xs font-medium ${
                      insight.change.startsWith('+') ? 'text-emerald-600' : 'text-slate-500'
                    }`}
                  >
                    {insight.change}
                  </p>
                )}
              </div>
            ))}
          </div>
        </header>

        <main className="super-admin-scroll flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
