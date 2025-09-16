import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Gamepad2, Sparkles } from 'lucide-react';
import { 
  MemoryMatch, 
  QuickMath, 
  WordScramble, 
  SmileyCircles,
  MindTrainingGames,
  ReshapedGame,
  MapIdentifier,
  FacialRecall,
  CalculatorGames,
  GroceryGame,
  CalculatorMemoryGame,
  DigitalChallenge
} from '.';

const games = [
  { 
    key: 'mind-training', 
    name: 'MIND Training Games', 
    desc: 'On the Go...', 
    bgColor: 'from-yellow-200 to-orange-200',
    textColor: 'text-gray-800',
    size: 'large'
  },
  { 
    key: 'smiley-circles', 
    name: 'Smiley Circles', 
    desc: 'Guess The emotions of the emojis', 
    bgColor: 'from-purple-200 to-purple-300',
    textColor: 'text-gray-800',
    size: 'medium'
  },
  { 
    key: 'reshaped', 
    name: 'RESHAPED', 
    desc: 'Games design for kids to understand geometric shapes', 
    bgColor: 'from-gray-200 to-gray-300',
    textColor: 'text-gray-800',
    size: 'medium'
  },
  { 
    key: 'map-identifier', 
    name: 'Map Identifier', 
    desc: 'Guess different maps around the world and increase geographic knowledge', 
    bgColor: 'from-gray-300 to-gray-400',
    textColor: 'text-gray-800',
    size: 'large'
  },
  { 
    key: 'facial-recall', 
    name: 'Facial Recall', 
    desc: 'Memorize the names associated with the faces', 
    bgColor: 'from-gray-200 to-gray-300',
    textColor: 'text-gray-800',
    size: 'medium'
  },
  { 
    key: 'calculator-games', 
    name: 'Calculator Games', 
    desc: 'Practice Calculations through fun, interactive games', 
    bgColor: 'from-green-200 to-green-300',
    textColor: 'text-gray-800',
    size: 'medium'
  },
  { 
    key: 'grocery', 
    name: 'Grocery', 
    desc: 'Spend time memorizing given grocery list and shop efficiently', 
    bgColor: 'from-pink-200 to-purple-200',
    textColor: 'text-gray-800',
    size: 'medium'
  },
  { 
    key: 'calculator-memory', 
    name: 'Calculator Memory', 
    desc: 'Memorize 12 digits in 30 seconds and recall them perfectly', 
    bgColor: 'from-blue-200 to-indigo-200',
    textColor: 'text-gray-800',
    size: 'medium'
  },
  { 
    key: 'more-games', 
    name: 'More Games Coming', 
    desc: 'Stay tuned for exciting new games!', 
    bgColor: 'from-pink-300 to-red-300',
    textColor: 'text-gray-800',
    size: 'large',
    disabled: true
  }
];

const GamesPage = () => {
  const navigate = useNavigate();
  const { gameKey } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back to Dashboard Button */}
      <div className="px-4 sm:px-6 md:px-8 pt-6">
        <button
          onClick={() => navigate(gameKey ? '/dashboard/games' : '/dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow-md hover:shadow-lg border border-gray-200 text-gray-700 hover:text-gray-900 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          {gameKey ? 'Back to Games' : 'Back to Dashboard'}
        </button>
      </div>

      {/* If a specific game is selected, show it full-page */}
      {gameKey && (
        <div className="px-4 sm:px-6 md:px-8 py-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            {gameKey === 'memory' && <MemoryMatch />}
            {gameKey === 'math' && <QuickMath />}
            {gameKey === 'words' && <WordScramble />}
            {gameKey === 'smiley-circles' && <SmileyCircles />}
            {gameKey === 'mind-training' && <MindTrainingGames />}
            {gameKey === 'reshaped' && <ReshapedGame />}
            {gameKey === 'map-identifier' && <MapIdentifier />}
            {gameKey === 'facial-recall' && <FacialRecall />}
            {gameKey === 'calculator-games' && <CalculatorGames />}
            {gameKey === 'grocery' && <GroceryGame />}
            {gameKey === 'calculator-memory' && <CalculatorMemoryGame />}
            {gameKey === 'digital-challenge' && <DigitalChallenge />}
          </div>
        </div>
      )}

      {/* Games grid - exactly matching the design layout */}
      {!gameKey && (
        <div className="px-4 sm:px-6 md:px-8 py-6">
          <div className="grid grid-cols-3 gap-4 max-w-6xl mx-auto">
            
            {/* MIND Training Games - Large yellow card (top-left) */}
            <div
              className="col-span-1 row-span-2 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-6 cursor-pointer transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden border-2 border-white/20"
              onClick={() => navigate('/dashboard/games/mind-training')}
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* 3D Decorative shapes with depth */}
              <div className="absolute top-2 right-2 w-32 h-32 border-6 border-orange-400 rounded-full opacity-50 transform rotate-12 hover:rotate-45 transition-transform duration-700" 
                   style={{ filter: 'drop-shadow(6px 6px 12px rgba(0,0,0,0.4))' }}></div>
              <div className="absolute top-8 right-8 w-28 h-28 border-6 border-blue-500 rounded-lg opacity-50 transform -rotate-12 hover:rotate-12 transition-transform duration-700"
                   style={{ filter: 'drop-shadow(6px 6px 12px rgba(0,0,0,0.4))' }}></div>
              
              {/* 3D Brain icon */}
              <div className="absolute top-2 left-2 text-5xl opacity-20 transform hover:scale-110 transition-transform duration-300">🧠</div>
              
              <div className="relative z-10">
                <div className="text-lg font-medium text-gray-800 mb-2 drop-shadow-sm">Play</div>
                <div className="text-2xl font-bold text-gray-900 mb-1 drop-shadow-sm">MIND Training</div>
                <div className="text-2xl font-bold text-gray-900 mb-2 drop-shadow-sm">Games</div>
                <div className="text-sm text-gray-700 mb-4 drop-shadow-sm">On the Go...</div>
                
                <div className="flex gap-4 mt-8">
                  <div className="w-16 h-16 bg-red-500 rounded-full border-4 border-red-600 transform hover:scale-110 transition-transform duration-300"
                       style={{ filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.4))' }}></div>
                  <div className="w-16 h-16 bg-blue-500 rounded-lg border-4 border-blue-600 transform hover:scale-110 transition-transform duration-300"
                       style={{ filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.4))' }}></div>
                </div>
              </div>
            </div>

            {/* Smiley Circles - Medium purple card (top-middle) */}
            <div
              className="col-span-1 bg-gradient-to-br from-purple-300 to-purple-400 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-6 cursor-pointer transform hover:scale-105 hover:-translate-y-2 relative border-2 border-white/20"
              onClick={() => navigate('/dashboard/games/smiley-circles')}
              style={{
                boxShadow: '0 20px 40px -12px rgba(147, 51, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* 3D Emoji icon */}
              <div className="absolute top-2 right-2 text-4xl opacity-20 transform hover:scale-110 transition-transform duration-300">😊</div>
              
              <div className="text-xl font-bold text-gray-800 mb-2 drop-shadow-sm">Smiley</div>
              <div className="text-xl font-bold text-gray-800 mb-3 drop-shadow-sm">Circles</div>
              <div className="text-sm text-gray-700 mb-4 drop-shadow-sm">Guess The emotions of the emojis</div>
              
              <div className="flex gap-3 mb-3">
                <span className="text-4xl transform hover:scale-125 transition-transform duration-300 cursor-pointer" 
                      style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))' }}>😊</span>
                <span className="text-4xl transform hover:scale-125 transition-transform duration-300 cursor-pointer" 
                      style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))' }}>😠</span>
                <span className="text-4xl transform hover:scale-125 transition-transform duration-300 cursor-pointer" 
                      style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))' }}>😲</span>
                <span className="text-4xl transform hover:scale-125 transition-transform duration-300 cursor-pointer" 
                      style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))' }}>😢</span>
              </div>
              
              <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-full h-3 w-16 shadow-lg" 
                   style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}></div>
            </div>

            {/* Map Identifier - Large gray card (top-right) */}
            <div
              className="col-span-1 row-span-2 bg-gradient-to-br from-gray-300 to-gray-400 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-6 cursor-pointer transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden border-2 border-white/20"
              onClick={() => navigate('/dashboard/games/map-identifier')}
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* 3D Globe icon */}
              <div className="absolute top-2 left-2 text-5xl opacity-20 transform hover:rotate-45 transition-transform duration-700">🌍</div>
              
              {/* India map silhouette with 3D effect */}
              <div className="absolute right-4 top-4 w-32 h-40 transform hover:scale-110 transition-transform duration-500">
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 opacity-70 transform hover:rotate-3 transition-transform duration-500" 
                     style={{
                       clipPath: 'polygon(20% 10%, 80% 15%, 90% 40%, 85% 70%, 60% 85%, 40% 90%, 15% 80%, 10% 50%, 15% 20%)',
                       filter: 'drop-shadow(6px 6px 12px rgba(0,0,0,0.4))'
                     }}></div>
              </div>
              
              <div className="relative z-10">
                <div className="text-2xl font-bold text-gray-800 mb-3 drop-shadow-sm">Map Identifier</div>
                <div className="text-sm text-gray-700 mb-6 max-w-32 drop-shadow-sm">
                  Guess different maps around the world and increase geographic knowledge
                </div>
                
                <div className="absolute bottom-6">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg transform hover:scale-105 transition-transform duration-300"
                       style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}>
                    Level: Medium
                  </div>
                </div>
              </div>
            </div>

            {/* Facial Recall - Medium gray card (middle-left) */}
            <div
              className="col-span-1 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-6 cursor-pointer transform hover:scale-105 hover:-translate-y-2 border-2 border-white/20"
              onClick={() => navigate('/dashboard/games/facial-recall')}
              style={{
                boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* 3D Face icon */}
              <div className="absolute top-2 right-2 text-4xl opacity-20 transform hover:scale-110 transition-transform duration-300">👤</div>
              
              <div className="text-xl font-bold text-gray-800 mb-2 drop-shadow-sm">Facial Recall</div>
              <div className="text-sm text-gray-700 mb-4 drop-shadow-sm">Memorize the names associated with the faces</div>
              
              <div className="flex gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full border-3 border-orange-600 transform hover:scale-110 hover:rotate-3 transition-all duration-300"
                     style={{ filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.4))' }}></div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full border-3 border-blue-600 transform hover:scale-110 hover:-rotate-3 transition-all duration-300"
                     style={{ filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.4))' }}></div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-3 border-green-600 transform hover:scale-110 hover:rotate-3 transition-all duration-300"
                     style={{ filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.4))' }}></div>
              </div>
            </div>

            {/* Digital Challenge - Medium green card (middle-center) */}
            <div
              className="col-span-1 bg-gradient-to-br from-green-300 to-green-400 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-6 cursor-pointer transform hover:scale-105 hover:-translate-y-2 border-2 border-white/20"
              onClick={() => navigate('/dashboard/games/digital-challenge')}
              style={{
                boxShadow: '0 20px 40px -12px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* 3D Calculator icon */}
              <div className="absolute top-2 right-2 text-4xl opacity-20 transform hover:scale-110 transition-transform duration-300">🧮</div>
              
              <div className="text-xl font-bold text-gray-800 mb-2 drop-shadow-sm">Digital</div>
              <div className="text-xl font-bold text-gray-800 mb-3 drop-shadow-sm">Challenge</div>
              <div className="text-sm text-gray-700 mb-4 drop-shadow-sm">Memorize 12 digits in 30 seconds</div>
              
              {/* Calculator display with 3D effect */}
              <div className="bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg p-3 mb-3 transform hover:scale-105 transition-transform duration-300"
                   style={{ filter: 'drop-shadow(6px 6px 12px rgba(0,0,0,0.4))' }}>
                <div className="bg-gradient-to-b from-green-800 to-green-900 rounded p-2 text-center"
                     style={{ filter: 'drop-shadow(inset 0 2px 4px rgba(0,0,0,0.3))' }}>
                  <span className="font-mono text-green-400 text-sm drop-shadow-sm">123456789012</span>
                </div>
                <div className="grid grid-cols-3 gap-1 mt-2">
                  {[7,8,9,4,5,6,1,2,3].map(num => (
                    <div key={num} className="bg-gradient-to-b from-gray-500 to-gray-700 rounded text-white text-sm text-center py-1 transform hover:scale-110 transition-transform duration-200"
                         style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.4))' }}>{num}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* RESHAPED - Medium gray card (bottom-left) */}
            <div
              className="col-span-1 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-6 cursor-pointer transform hover:scale-105 hover:-translate-y-2 border-2 border-white/20"
              onClick={() => navigate('/dashboard/games/reshaped')}
              style={{
                boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* 3D Shapes icon */}
              <div className="absolute top-2 right-2 text-4xl opacity-20 transform hover:rotate-45 transition-transform duration-700">🔷</div>
              
              <div className="text-xl font-bold text-gray-800 mb-3 drop-shadow-sm">RESHAPED</div>
              <div className="text-sm text-gray-700 mb-4 drop-shadow-sm">Games design for kids to understand geometric shapes</div>
              
              <div className="flex gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded transform rotate-12 hover:rotate-45 hover:scale-110 transition-all duration-300"
                     style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))' }}></div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full hover:scale-110 transition-all duration-300"
                     style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))' }}></div>
                <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-blue-500 hover:scale-110 transition-all duration-300"
                     style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))' }}></div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full relative hover:scale-110 transition-all duration-300"
                     style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))' }}>
                  <div className="w-3 h-3 bg-gray-200 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-full h-3 w-16 shadow-lg"
                   style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}></div>
            </div>

            {/* Grocery - Medium card (bottom-center) */}
            <div
              className="col-span-1 bg-gradient-to-br from-blue-200 to-blue-300 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-6 cursor-pointer transform hover:scale-105 hover:-translate-y-2 border-2 border-white/20"
              onClick={() => navigate('/dashboard/games/grocery')}
              style={{
                boxShadow: '0 20px 40px -12px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* 3D Shopping cart icon */}
              <div className="absolute top-2 right-2 text-4xl opacity-20 transform hover:scale-110 transition-transform duration-300">🛒</div>
              
              <div className="text-xl font-bold text-gray-800 mb-3 drop-shadow-sm">Grocery</div>
              <div className="text-sm text-gray-700 mb-4 drop-shadow-sm">Spend time memorizing given grocery list and shop efficiently</div>
              
              <div className="flex gap-3 mb-3">
                <span className="text-4xl transform hover:scale-125 hover:rotate-6 transition-all duration-300 cursor-pointer" 
                      style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))' }}>🥖</span>
                <span className="text-4xl transform hover:scale-125 hover:-rotate-6 transition-all duration-300 cursor-pointer" 
                      style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))' }}>📦</span>
                <span className="text-4xl transform hover:scale-125 hover:rotate-3 transition-all duration-300 cursor-pointer" 
                      style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))' }}>🥛</span>
              </div>
            </div>

            {/* More Games Coming - Large pink card (bottom-right) */}
            <div
              className="col-span-1 bg-gradient-to-br from-pink-300 to-red-300 rounded-3xl shadow-2xl p-6 opacity-70 cursor-not-allowed border-2 border-white/20 relative overflow-hidden"
              style={{
                boxShadow: '0 20px 40px -12px rgba(244, 63, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* 3D Coming soon icon */}
              <div className="absolute top-2 right-2 text-5xl opacity-30 transform hover:scale-110 transition-transform duration-300">🚀</div>
              
              {/* Animated dots */}
              <div className="absolute top-6 left-6 flex gap-2">
                <div className="w-3 h-3 bg-white rounded-full opacity-40 animate-pulse" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-white rounded-full opacity-40 animate-pulse" style={{ animationDelay: '200ms' }}></div>
                <div className="w-3 h-3 bg-white rounded-full opacity-40 animate-pulse" style={{ animationDelay: '400ms' }}></div>
              </div>
              
              <div className="text-2xl font-bold text-gray-800 mb-2 drop-shadow-sm">More Games Coming</div>
              <div className="text-sm text-gray-700 drop-shadow-sm">Stay tuned for exciting new games!</div>
              
              {/* Progress bar animation */}
              <div className="mt-4 bg-white/30 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-white/60 to-white/80 h-full rounded-full w-1/3 animate-pulse"></div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default GamesPage;
