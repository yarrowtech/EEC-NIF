import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import { ADMIN_MENU_ITEMS } from './adminConstants';
import { NavLink } from 'react-router-dom';

const AdminSidebar = ({ 
  onMenuItemClick, 
  collapsed = false, 
  onToggleSidebar 
}) => {
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleSubmenu = (menuLabel) => {
    if (collapsed) return; // Don't expand submenus when sidebar is collapsed
    setExpandedMenus(prev => ({
      ...prev,
      [menuLabel]: !prev[menuLabel]
    }));
  };

  return (
    <>
      <div className={`
        ${collapsed ? "w-20" : "w-72"}
        bg-white border-r border-gray-200
        flex flex-col h-full shadow-lg
        transition-[width] duration-300 ease-in-out
      `}>
        {/* Logo */}
        <div className={`${collapsed ? 'p-4' : 'p-4'} border-b border-gray-200 relative`}>
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className={`${collapsed ? 'w-8 h-8' : 'w-12 h-12'} bg-gradient-to-br from-blue-900 to-yellow-500 rounded-lg flex items-center justify-center shadow-md`}>
                <span className="text-white text-xl font-bold">EEC</span>
              </div>
              {!collapsed && <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-800">Electronic Educare</span>
                <span className="text-xs text-gray-500">Admin Portal</span>
              </div>}
            </div>
            <button 
              onClick={onToggleSidebar}
              className={`absolute ${collapsed ? 'top-2 right-[-7px] ' : 'top-4 right-[-5px]'} p-4 bg-transparent rounded-lg text-gray-500 hover:text-gray-700 transition-all duration-300 ease-out transform hover:scale-110 active:scale-95`}
              aria-label={collapsed ? 'Open sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Open sidebar' : 'Collapse sidebar'}
            >
              {collapsed && <ChevronRight size={16} className="transition-transform duration-300 hover:translate-x-1" />}
              {!collapsed && <ChevronLeft size={16} className="transition-transform duration-300 hover:-translate-x-1" />}
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto sidebar-scroll">
          {ADMIN_MENU_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isExpanded = expandedMenus[item.label];
            
            return (
              <div key={index} className="mb-1">
                {/* Main Menu Item */}
                {item.hasSubmenu ? (
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-3 rounded-lg
                      group transition-all duration-300 ease-out
                      text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-yellow-50 
                      hover:text-gray-900 hover:shadow-md hover:scale-105
                      transform active:scale-95
                    `}
                  >
                    <Icon size={20} className="flex-shrink-0 transition-all duration-300 group-hover:text-blue-600 group-hover:scale-110" />
                    {!collapsed && <span className="font-medium flex-1 text-left transition-all duration-300">{item.label}</span>}
                    {!collapsed && (
                      isExpanded ? (
                        <ChevronDown size={16} className="text-gray-400 group-hover:text-blue-600 transition-all duration-300 group-hover:rotate-180" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-600 transition-all duration-300 group-hover:translate-x-1" />
                      )
                    )}
                  </button>
                ) : (
                  <NavLink
                    to={item.path}
                    onClick={() => onMenuItemClick(item.label)}
                  >
                    {({ isActive }) => (
                      <div className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg
                        group transition-all duration-300 ease-out transform
                        ${isActive 
                          ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 shadow-md border-l-4 border-yellow-500' 
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-yellow-50 hover:text-gray-900 hover:shadow-md hover:scale-105 active:scale-95 hover:border-l-4 hover:border-blue-300'}
                      `}>
                        <Icon size={20} className={`flex-shrink-0 transition-all duration-300 ${isActive ? 'text-yellow-600' : 'group-hover:text-blue-600 group-hover:scale-110'}`} />
                        {!collapsed && <span className="font-medium flex-1 transition-all duration-300">{item.label}</span>}
                      </div>
                    )}
                  </NavLink>
                )}
                
                {/* Submenu Items */}
                {item.hasSubmenu && isExpanded && !collapsed && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.submenu.map((subItem, subIndex) => {
                      const SubIcon = subItem.icon;
                      return (
                        <NavLink
                          key={subIndex}
                          to={subItem.path}
                          onClick={() => onMenuItemClick(subItem.label)}
                        >
                          {({ isActive }) => (
                            <div className={`
                              flex items-center space-x-3 px-4 py-2 rounded-lg
                              group transition-all duration-300 ease-out transform
                              ${isActive 
                                ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border-l-2 border-yellow-500 shadow-sm' 
                                : 'text-gray-500 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-gray-700 hover:shadow-sm hover:scale-105 active:scale-95 hover:border-l-2 hover:border-blue-200'}
                            `}>
                              <SubIcon size={16} className={`flex-shrink-0 transition-all duration-300 ${isActive ? 'text-yellow-600' : 'group-hover:text-blue-600 group-hover:scale-110'}`} />
                              <span className="text-sm font-medium transition-all duration-300">{subItem.label}</span>
                            </div>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Admin Info Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 cursor-pointer group">
          <div className={`flex items-center ${collapsed ? 'justify-center space-x-0' : 'space-x-3'}`}>
            <div className="w-10 h-10 rounded-full bg-yellow-100 group-hover:bg-blue-100 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
              <span className="text-yellow-600 group-hover:text-blue-600 font-semibold transition-all duration-300">A</span>
            </div>
            {!collapsed && (
              <div className="transition-all duration-300">
                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-900 transition-all duration-300">Admin User</p>
                <p className="text-xs text-gray-500 group-hover:text-blue-600 transition-all duration-300">administrator@eec.edu</p>
              </div>
            )}
          </div>
        </div>
        {/* Removed Logout Button */}
      </div>
    </>
  );
};

export default AdminSidebar;
