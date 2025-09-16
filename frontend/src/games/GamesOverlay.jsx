import React, { useState } from 'react';
import { Gamepad2, X, Sparkles } from 'lucide-react';
import { MemoryMatch, QuickMath, WordScramble, SmileyCircles } from '.';

const games = [
  { key: 'smiley-circles', emoji: '🙂', name: 'Smiley Circles', desc: 'Visual memory challenge' },
  { key: 'memory', emoji: '🧠', name: 'Memory Match', desc: 'Train your recall skills' },
  { key: 'math', emoji: '➗', name: 'Quick Math', desc: 'Sharpen mental math' },
  { key: 'words', emoji: '🔤', name: 'Word Scramble', desc: 'Boost vocabulary' },
];

const GamesOverlay = ({ isOpen, onClose }) => {
  const [selected, setSelected] = useState(null); // game key or null
  if (!isOpen) return null;

  const renderGame = () => {
    switch (selected) {
      case 'smiley-circles':
        return <SmileyCircles />;
      case 'memory':
        return <MemoryMatch />;
      case 'math':
        return <QuickMath />;
      case 'words':
        return <WordScramble />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0 overflow-y-auto">
        {/* Hero header */}
        <div className="relative h-56 w-full bg-cover bg-center" style={{ backgroundImage: "url('/games.png')" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/10" />
          <div className="relative z-10 h-full flex items-end px-4 sm:px-6 md:px-8 pb-4">
            <div>
              <div className="flex items-center gap-2 text-white">
                <Gamepad2 className="w-6 h-6 text-yellow-300" />
                <h1 className="text-xl sm:text-2xl font-semibold">Fun Learning Games</h1>
              </div>
              <p className="text-white/90 text-xs sm:text-sm mt-1">Quick challenges to boost memory, math, and words</p>
            </div>
          </div>
          {/* Buttons inspired by guide image */}
          <div className="absolute left-4 right-4 bottom-4 z-10 flex gap-2 overflow-x-auto no-scrollbar">
            {games.map((g) => (
              <button
                key={`btn-${g.key}`}
                onClick={() => setSelected(g.key)}
                className={`shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-gray-800 text-sm shadow-md backdrop-blur border border-white/60 ${selected===g.key? 'ring-2 ring-indigo-400' : ''}`}
              >
                <span className="text-lg" aria-hidden>{g.emoji}</span>
                <span className="font-medium">{g.name}</span>
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/40 text-white hover:bg-black/50"
            aria-label="Close games"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 md:px-8 py-6">
          {selected ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              {renderGame()}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {games.map((g) => (
                  <div key={g.key} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl" aria-hidden>{g.emoji}</span>
                      <div>
                        <div className="font-semibold text-gray-900">{g.name}</div>
                        <div className="text-sm text-gray-500">{g.desc}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected(g.key)}
                      className="text-sm px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Play
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-600">
                <Sparkles className="w-4 h-4 text-yellow-500" /> More games launching soon
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamesOverlay;

