import React, { useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import GamesOverlay from '../games/GamesOverlay';

const FloatingGamesButton = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboardHome =
    location.pathname === '/student' || location.pathname === '/dashboard';
  if (!isDashboardHome) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="relative">
        <button
          onClick={() => navigate('/student/games')}
          className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:via-purple-700 hover:to-indigo-700 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 relative group"
          aria-label="Open games menu"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-600 animate-ping opacity-20" />
          <Gamepad2 className="h-8 w-8 relative z-10" />
          <div className="absolute bottom-full mb-2 px-2 py-1 rounded-md bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">Games</div>
        </button>
      </div>
    </div>
  );
};

export default FloatingGamesButton;
