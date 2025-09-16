import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, RotateCcw, Clock, CheckCircle, XCircle } from 'lucide-react';

const MindTrainingGames = ({ onBack }) => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'result'
  const [targetShape, setTargetShape] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isCorrect, setIsCorrect] = useState(null);

  const shapes = [
    { id: 'circle', name: 'Circle', color: 'bg-red-500', style: 'rounded-full' },
    { id: 'square', name: 'Square', color: 'bg-blue-500', style: 'rounded-lg' },
    { id: 'triangle', name: 'Triangle', color: 'bg-green-500', style: 'rounded-full' }
  ];

  const startGame = () => {
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    setTargetShape(randomShape);
    setGameState('playing');
    setTimeLeft(5);
    setIsCorrect(null);
  };

  const handleShapeClick = (selectedShape) => {
    const correct = selectedShape.id === targetShape.id;
    setIsCorrect(correct);
    if (correct) {
      setScore(score + 10);
    }
    setGameState('result');
    
    setTimeout(() => {
      setRound(round + 1);
      if (round < 10) {
        startGame();
      } else {
        setGameState('menu');
        setRound(1);
      }
    }, 1500);
  };

  const resetGame = () => {
    setGameState('menu');
    setScore(0);
    setRound(1);
    setTimeLeft(5);
    setIsCorrect(null);
  };

  // Timer countdown
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      setIsCorrect(false);
      setGameState('result');
      setTimeout(() => {
        setRound(round + 1);
        if (round < 10) {
          startGame();
        } else {
          setGameState('menu');
          setRound(1);
        }
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft, round]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-2xl font-bold text-gray-800">MIND Training Games</h2>
      </div>

      <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-8 text-center">
        {gameState === 'menu' && (
          <div className="space-y-6">
            <div className="inline-flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-red-500 rounded-full border-4 border-red-600"></div>
              <div className="w-16 h-16 bg-blue-500 rounded-lg border-4 border-blue-600"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Shape Recognition Challenge</h3>
            <p className="text-gray-600 mb-4">
              Match the target shape as quickly as possible! You have 5 seconds for each round.
            </p>
            {score > 0 && (
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="text-lg font-bold text-green-600">Final Score: {score}/100</div>
                <div className="text-sm text-gray-600">
                  {score >= 80 ? '🏆 Excellent!' : score >= 60 ? '👍 Good job!' : '💪 Keep practicing!'}
                </div>
              </div>
            )}
            <button
              onClick={startGame}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              <Play className="w-5 h-5" />
              {score > 0 ? 'Play Again' : 'Start Training'}
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-semibold">Round {round}/10</div>
              <div className="flex items-center gap-2 text-orange-600">
                <Clock className="w-5 h-5" />
                <span className="text-xl font-bold">{timeLeft}s</span>
              </div>
              <div className="text-lg font-semibold">Score: {score}</div>
            </div>

            <div className="space-y-4">
              <div className="text-xl font-bold text-gray-800">
                Click the {targetShape?.name}!
              </div>
              
              <div className="flex justify-center gap-6">
                {shapes.map((shape) => (
                  <button
                    key={shape.id}
                    onClick={() => handleShapeClick(shape)}
                    className={`w-24 h-24 ${shape.color} ${shape.style} border-4 border-gray-700 hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="space-y-4">
            <div className="text-center">
              {isCorrect ? (
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-2" />
              )}
              <div className="text-2xl font-bold">
                {isCorrect ? 'Correct! +10 points' : 'Time\'s up! Try again'}
              </div>
              <div className="text-gray-600">
                {round < 10 ? `Round ${round + 1} starting...` : 'Game completed!'}
              </div>
            </div>
          </div>
        )}

        {gameState !== 'result' && (
          <button
            onClick={resetGame}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default MindTrainingGames;