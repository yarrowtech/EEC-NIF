import React, { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';
import { getPoints } from '../utils/points';

const PointsBadge = ({ className = '' }) => {
  const [points, setPoints] = useState(0);

  useEffect(() => {
    setPoints(getPoints());
    const onUpdate = (e) => setPoints(e?.detail?.total ?? getPoints());
    window.addEventListener('points:update', onUpdate);
    return () => window.removeEventListener('points:update', onUpdate);
  }, []);

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-sm font-semibold shadow-sm ${className}`}>
      <Coins className="w-4 h-4 text-amber-600" />
      <span>{points}</span>
      <span className="hidden sm:inline">Points</span>
    </div>
  );
};

export default PointsBadge;

