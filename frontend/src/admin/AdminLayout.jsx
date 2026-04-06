import { useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({
  children,
  activeMenuItem,
  onMenuItemClick,
  sidebarCollapsed,
  onToggleSidebar,
  adminUser,
  menuItems,
  showAdminHeader,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex w-full h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar
        activeMenuItem={activeMenuItem}
        onMenuItemClick={onMenuItemClick}
        collapsed={sidebarCollapsed}
        onToggleSidebar={onToggleSidebar}
        menuItems={menuItems}
        adminUser={adminUser}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {showAdminHeader && (
          <AdminHeader
            adminUser={adminUser}
            onOpenMobileSidebar={() => setMobileOpen(true)}
          />
        )}

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
