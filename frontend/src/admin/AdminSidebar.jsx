import React from 'react';
import { ChevronRight, X, ChevronLeft } from 'lucide-react';
import { ADMIN_MENU_ITEMS } from './adminConstants';
import { NavLink } from 'react-router-dom';

const AdminSidebar = ({ 
  onMenuItemClick, 
  collapsed = false, 
  onToggleSidebar 
}) => {
  return (
    <>
      <div className={`
        ${collapsed ? "w-20": "w-70"}
        bg-white border-r border-gray-200
        flex flex-col h-full shadow-lg
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!collapsed && <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-yellow-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-xl font-bold">EEC</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-800">Electronic Educare</span>
                <span className="text-xs text-gray-500">Admin Portal</span>
              </div>
            </div>}
            <button 
              onClick={onToggleSidebar}
              className="p-2 bg-transparent rounded-lg text-gray-500"
            >
              {collapsed && <ChevronRight size={16} />}
              {!collapsed && <ChevronLeft size={16} />}
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          {ADMIN_MENU_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.path}
                onClick={() => {
                  onMenuItemClick(item.label);
                }}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 
                  group transition-colors duration-200
                  ${isActive 
                    ? 'bg-yellow-50 text-yellow-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <Icon size={20} className={`flex-shrink-0 transition-colors duration-200`} />
                {!collapsed && <span className="font-medium flex-1">{item.label}</span>}
                {item.hasSubmenu && (
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Admin Info Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-yellow-600 font-semibold">A</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">administrator@eec.edu</p>
            </div>
          </div>
        </div>
        {/* Removed Logout Button */}
      </div>
    </>
  );
};

export default AdminSidebar;