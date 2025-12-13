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
    <div className="flex w-screen h-screen bg-gray-50">
      <AdminSidebar 
        activeMenuItem={activeMenuItem} 
        onMenuItemClick={onMenuItemClick}
        collapsed={sidebarCollapsed}
        onToggleSidebar={onToggleSidebar}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {showAdminHeader && <AdminHeader
          adminUser={adminUser}
        />}
        
        {/* Breadcrumb */}
        {showBreadcrumb && (
          <div className="px-4 lg:px-8 py-4 bg-white border-b">
            <div className="flex items-center space-x-2 text-gray-600 overflow-x-auto">
              {sidebarCollapsed && (
                <button 
                  onClick={onToggleSidebar}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors mr-3"
                >
                  <Menu size={20} />
                </button>
              )}
              <span className="text-xl lg:text-2xl font-bold text-gray-800 whitespace-nowrap">
                {activeMenuItem}
              </span>
              <div className="hidden md:flex items-center space-x-2">
                {currentBreadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    <ChevronRight size={16} className="text-gray-400" />
                    <span className={`whitespace-nowrap ${crumb.current ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                      {crumb.label}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
