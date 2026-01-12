import React from 'react';
import { ChevronRight, Menu } from 'lucide-react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ 
  children, 
  activeMenuItem, 
  onMenuItemClick,
  sidebarCollapsed,
  onToggleSidebar,
  adminUser,
  breadcrumbs = [],
  showAdminHeader,
  showBreadcrumb = true
}) => {
  const defaultBreadcrumbs = [
    { label: 'Admin', path: '/admin' },
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: activeMenuItem, current: true }
  ];

  const currentBreadcrumbs = breadcrumbs.length > 0 ? breadcrumbs : defaultBreadcrumbs;
  
  return (
    <div className="flex w-full h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar
        activeMenuItem={activeMenuItem}
        onMenuItemClick={onMenuItemClick}
        collapsed={sidebarCollapsed}
        onToggleSidebar={onToggleSidebar}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {showAdminHeader && <AdminHeader
          adminUser={adminUser}
        />}
        
        {/* Breadcrumb */}
        {showBreadcrumb && (
          <div className="px-4 lg:px-8 bg-white border-b">
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
