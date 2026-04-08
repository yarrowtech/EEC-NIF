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
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex w-full h-dvh bg-gray-50">
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

      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-gray-50">
        <AdminHeader
          adminUser={adminUser}
          onOpenMobileSidebar={() => setMobileOpen(true)}
        />

        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
