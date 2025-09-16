import React from 'react';
import { Gamepad2, Sparkles, X } from 'lucide-react';

const defaultGames = [
  { key: 'mind-training', name: 'MIND Training Games', desc: 'On the Go...', bgColor: 'from-yellow-200 to-orange-200' },
  { key: 'smiley-circles', name: 'Smiley Circles', desc: 'Guess emotions of emojis', bgColor: 'from-purple-200 to-purple-300' },
  { key: 'reshaped', name: 'RESHAPED', desc: 'Understand geometric shapes', bgColor: 'from-gray-200 to-gray-300' },
  { key: 'map-identifier', name: 'Map Identifier', desc: 'Geographic knowledge', bgColor: 'from-gray-300 to-gray-400' },
  { key: 'facial-recall', name: 'Facial Recall', desc: 'Memorize names and faces', bgColor: 'from-gray-200 to-gray-300' },
  { key: 'calculator-games', name: 'Calculator Games', desc: 'Practice calculations', bgColor: 'from-green-200 to-green-300' },
];

const GamesMenu = ({ games = defaultGames, onClose, onPlay }) => {
  return (
    <div className="absolute bottom-16 right-0 w-80 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden bg-white/70 backdrop-blur">
      {/* Hero area with image background */}
      <div
        className="h-32 w-full bg-cover bg-center relative"
        style={{ backgroundImage: "url('/games.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-2 left-3 text-white">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-yellow-300" />
            <h3 className="text-sm font-semibold tracking-wide">Fun Learning Games</h3>
          </div>
          <p className="text-[11px] opacity-90">Quick challenges to boost skills</p>
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/30 hover:bg-black/40 text-white"
          aria-label="Close games menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Game list */}
      <div className="p-3 space-y-2 bg-white max-h-80 overflow-y-auto">
        {games.slice(0, 6).map((g) => (
          <div
            key={g.key}
            className={`
              relative p-3 rounded-xl bg-gradient-to-r ${g.bgColor} 
              shadow-sm hover:shadow-md transition-all cursor-pointer
              border border-gray-200 hover:border-gray-300
            `}
            onClick={() => onPlay && onPlay(g.key)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-800 mb-1">{g.name}</div>
                <div className="text-xs text-gray-700">{g.desc}</div>
              </div>
              
              {/* Visual indicators for specific games */}
              <div className="ml-2 flex gap-1">
                {g.key === 'mind-training' && (
                  <>
                    <div className="w-4 h-4 bg-red-500 rounded-full border border-red-600"></div>
                    <div className="w-4 h-4 bg-blue-500 rounded border border-blue-600"></div>
                  </>
                )}
                {g.key === 'smiley-circles' && (
                  <>
                    <span className="text-sm">😊</span>
                    <span className="text-sm">😠</span>
                  </>
                )}
                {g.key === 'reshaped' && (
                  <>
                    <div className="w-3 h-3 bg-yellow-400 transform rotate-45"></div>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </>
                )}
                {g.key === 'map-identifier' && (
                  <div className="w-6 h-4 bg-orange-500 opacity-60 rounded"></div>
                )}
                {g.key === 'calculator-games' && (
                  <div className="w-4 h-4 bg-green-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs">+</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="absolute top-1 right-1">
              <div className="bg-green-500 hover:bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-medium transition-colors">
                Play
              </div>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-3 p-2">
          <Sparkles className="w-3 h-3 text-yellow-500" />
          More exciting games coming soon!
        </div>
      </div>
    </div>
  );
};

export default GamesMenu;

