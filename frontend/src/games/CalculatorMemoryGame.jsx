import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, RotateCcw, Calculator, Clock, CheckCircle, XCircle } from 'lucide-react';

const CalculatorMemoryGame = ({ onBack }) => {
  const [gameState, setGameState] = useState('ready'); // 'ready', 'memorizing', 'recalling', 'finished'
  const [digits, setDigits] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(null);
  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);

  // Generate random 12-digit number
  const generateDigits = () => {
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  };

  // Start game
  const startGame = () => {
    const newDigits = generateDigits();
    setDigits(newDigits);
    setUserInput('');
    setScore(null);
    setGameState('memorizing');
    setTimeLeft(30);
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameState === 'memorizing' && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (gameState === 'memorizing' && timeLeft === 0) {
      setGameState('recalling');
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft]);

  // Check answer
  const checkAnswer = () => {
    let correct = 0;
    const userDigits = userInput.padEnd(12, ' ');
    
    for (let i = 0; i < 12; i++) {
      if (digits[i] === userDigits[i]) {
        correct++;
      }
    }
    
    const percentage = Math.round((correct / 12) * 100);
    setScore({ correct, total: 12, percentage });
    setTotalScore(totalScore + correct);
    setGameState('finished');
  };

  // Next round
  const nextRound = () => {
    setRound(round + 1);
    startGame();
  };

  // Reset game
  const resetGame = () => {
    setGameState('ready');
    setDigits('');
    setUserInput('');
    setTimeLeft(30);
    setScore(null);
    setRound(1);
    setTotalScore(0);
  };

  // Handle number input
  const handleNumberClick = (num) => {
    if (gameState === 'recalling' && userInput.length < 12) {
      setUserInput(userInput + num);
    }
  };

  // Handle backspace
  const handleBackspace = () => {
    if (gameState === 'recalling') {
      setUserInput(userInput.slice(0, -1));
    }
  };

  // Clear input
  const clearInput = () => {
    if (gameState === 'recalling') {
      setUserInput('');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Calculator Memory Game</h2>
          <p className="text-gray-600">Memorize 12 digits in 30 seconds, then recall them!</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Game Stats */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-500">Round</div>
              <div className="text-2xl font-bold text-blue-600">{round}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Total Score</div>
              <div className="text-2xl font-bold text-green-600">{totalScore}</div>
            </div>
          </div>
          
          {gameState === 'memorizing' && (
            <div className="flex items-center gap-2 text-orange-600">
              <Clock className="w-5 h-5" />
              <span className="text-xl font-bold">{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* Calculator Display */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="bg-green-900 rounded-lg p-4 mb-4">
            <div className="font-mono text-2xl text-green-400 text-right tracking-wider">
              {gameState === 'ready' && '000000000000'}
              {gameState === 'memorizing' && digits}
              {gameState === 'recalling' && (
                <span>
                  {userInput.padEnd(12, '_')}
                </span>
              )}
              {gameState === 'finished' && digits}
            </div>
          </div>

          {/* Calculator Buttons */}
          {(gameState === 'recalling') && (
            <div className="grid grid-cols-4 gap-2">
              {/* Number buttons */}
              {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num.toString())}
                  className="bg-gray-600 hover:bg-gray-500 text-white rounded-lg h-12 text-lg font-semibold transition-colors"
                >
                  {num}
                </button>
              ))}
              
              {/* Bottom row */}
              <button
                onClick={clearInput}
                className="bg-red-600 hover:bg-red-500 text-white rounded-lg h-12 text-sm font-semibold transition-colors"
              >
                C
              </button>
              <button
                onClick={() => handleNumberClick('0')}
                className="bg-gray-600 hover:bg-gray-500 text-white rounded-lg h-12 text-lg font-semibold transition-colors"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="bg-orange-600 hover:bg-orange-500 text-white rounded-lg h-12 text-sm font-semibold transition-colors"
              >
                ←
              </button>
              <button
                onClick={checkAnswer}
                disabled={userInput.length !== 12}
                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg h-12 text-sm font-semibold transition-colors"
              >
                ✓
              </button>
            </div>
          )}
        </div>

        {/* Instructions and Controls */}
        <div className="space-y-4">
          {gameState === 'ready' && (
            <div className="text-center">
              <div className="mb-4">
                <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  You'll have 30 seconds to memorize a 12-digit sequence.
                  <br />
                  Then you'll need to input the digits in the exact order!
                </p>
              </div>
              <button
                onClick={startGame}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Play className="w-5 h-5" />
                Start Round {round}
              </button>
            </div>
          )}

          {gameState === 'memorizing' && (
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-700 mb-2">
                Memorize these digits!
              </div>
              <div className="text-orange-600 font-medium">
                Time remaining: {timeLeft} seconds
              </div>
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  Focus on the 12-digit sequence above. Use any memory technique you prefer!
                </p>
              </div>
            </div>
          )}

          {gameState === 'recalling' && (
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-700 mb-2">
                Now enter the digits from memory!
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Progress: {userInput.length}/12 digits entered
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  Use the calculator buttons below to input the sequence you memorized.
                </p>
              </div>
            </div>
          )}

          {gameState === 'finished' && score && (
            <div className="text-center">
              <div className="mb-4">
                {score.percentage >= 80 ? (
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-2" />
                )}
                <div className="text-2xl font-bold text-gray-800 mb-2">
                  Score: {score.correct}/{score.total} ({score.percentage}%)
                </div>
              </div>
              
              {/* Show comparison */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-600 mb-2">Comparison:</div>
                <div className="font-mono text-lg space-y-1">
                  <div>
                    <span className="text-gray-500">Correct: </span>
                    <span className="text-green-600">{digits}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Your answer: </span>
                    <span className="text-blue-600">{userInput.padEnd(12, '_')}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={nextRound}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Next Round
                </button>
                <button
                  onClick={resetGame}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset Game
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculatorMemoryGame;