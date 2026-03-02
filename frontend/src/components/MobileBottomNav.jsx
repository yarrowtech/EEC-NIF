import React from 'react';
import { Home, BookOpen, Calendar, MessageCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { id: 'dashboard', label: 'Home',      icon: Home,          path: '/student' },
  { id: 'academics', label: 'Academics', icon: BookOpen,       path: '/student/academics' },
  { id: 'routine',   label: 'Schedule',  icon: Calendar,      path: '/student/routine' },
  { id: 'chat',      label: 'Messages',  icon: MessageCircle, path: '/student/chat' },
  { id: 'profile',   label: 'Profile',   icon: User,          path: '/student/profile' },
];

const MobileBottomNav = ({ activeView }) => {
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch h-16">
        {navItems.map(({ id, label, icon: Icon, path }) => {
          const isActive =
            id === 'dashboard'
              ? activeView === 'dashboard' || activeView === 'home'
              : activeView === id || activeView.startsWith(`${id}-`);

          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors active:scale-95 ${
                isActive ? 'text-amber-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-amber-50' : ''
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={isActive ? 'text-amber-600' : 'text-gray-400'}
                />
              </div>
              <span
                className={`text-[10px] font-medium leading-none ${
                  isActive ? 'text-amber-600' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
