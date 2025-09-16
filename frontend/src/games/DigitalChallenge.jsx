import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, RotateCcw, Clock, CheckCircle, XCircle, Calculator } from 'lucide-react';

const DigitalChallenge = ({ onBack }) => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'memorizing', 'recalling', 'result'
  const [digits, setDigits] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(null);
  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [isCovered, setIsCovered] = useState(false);

  // Generate random 12-digit number
  const generateDigits = () => {
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  };

  // Start memorization phase
  const startGame = () => {
    const newDigits = generateDigits();
    setDigits(newDigits);
    setUserInput('');
    setScore(null);
    setGameState('memorizing');
    setTimeLeft(30);
    setIsCovered(false);
  };

  // Start recall phase
  const startRecall = () => {
    setGameState('recalling');
    setIsCovered(true);
    setUserInput('');
  };

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
    setGameState('result');
  };

  // Next round
  const nextRound = () => {
    setRound(round + 1);
    startGame();
  };

  // Reset game
  const resetGame = () => {
    setGameState('menu');
    setDigits('');
    setUserInput('');
    setTimeLeft(30);
    setScore(null);
    setRound(1);
    setTotalScore(0);
    setIsCovered(false);
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

  // Timer countdown for memorization
  useEffect(() => {
    let timer;
    if (gameState === 'memorizing' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (gameState === 'memorizing' && timeLeft === 0) {
      startRecall();
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Digital Challenge</h2>
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

        {gameState === 'menu' && (
          <div className="text-center space-y-6">
            <div className="mb-6">
              <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Digital Memory Challenge</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Using any technique you like, spend up to 30 seconds memorizing the row of 12 digits 
                on the calculator display. When time is up, cover them and write them out in order 
                as accurately as you can.
              </p>
            </div>
            
            {totalScore > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="text-lg font-bold text-blue-600">
                  Total Score: {totalScore} digits across {round - 1} rounds
                </div>
                <div className="text-sm text-gray-600">
                  Average: {Math.round(totalScore / (round - 1))} digits per round
                </div>
              </div>
            )}
            
            <button
              onClick={startGame}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Play className="w-5 h-5" />
              {totalScore > 0 ? `Start Round ${round}` : 'Start Challenge'}
            </button>
          </div>
        )}

        {gameState === 'memorizing' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-700 mb-2">
                Study these digits carefully!
              </div>
              <div className="text-orange-600 font-medium mb-4">
                Time remaining: {timeLeft} seconds
              </div>
            </div>

            {/* Calculator Display */}
            <div className="bg-gray-800 rounded-xl p-6 max-w-2xl mx-auto">
              <div className="bg-green-900 rounded-lg p-4 mb-4">
                <div className="font-mono text-3xl text-green-400 text-center tracking-widest">
                  {digits}
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 max-w-md mx-auto">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Memory Tips:</strong> Try grouping digits, creating patterns, 
                  or using visualization techniques!
                </p>
              </div>
              
              <button
                onClick={startRecall}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                I'm Ready to Recall
              </button>
            </div>
          </div>
        )}

        {gameState === 'recalling' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-700 mb-2">
                Now enter the digits from memory!
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Progress: {userInput.length}/12 digits entered
              </div>
            </div>

            {/* Calculator Display - Covered */}
            <div className="bg-gray-800 rounded-xl p-6 max-w-2xl mx-auto">
              <div className="bg-green-900 rounded-lg p-4 mb-4">
                <div className="font-mono text-3xl text-green-400 text-center tracking-widest">
                  {isCovered ? userInput.padEnd(12, '_') : digits}
                </div>
              </div>
              
              {/* Calculator Buttons */}
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
                  Clear
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
                  Submit
                </button>
              </div>
            </div>

            <div className="text-center">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-md mx-auto">
                <p className="text-sm text-blue-800">
                  Use the calculator buttons to input the sequence you memorized.
                  Take your time and be as accurate as possible!
                </p>
              </div>
            </div>
          </div>
        )}

        {gameState === 'result' && score && (
          <div className="text-center space-y-6">
            <div className="mb-4">
              {score.percentage >= 80 ? (
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
              ) : (
                <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-2" />
              )}
              <div className="text-2xl font-bold text-gray-800 mb-2">
                Score: {score.correct}/{score.total} ({score.percentage}%)
              </div>
            </div>
            
            {/* Show comparison */}
            <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
              <div className="text-sm text-gray-600 mb-4">Digit-by-digit comparison:</div>
              <div className="space-y-3">
                <div className="font-mono text-lg">
                  <span className="text-gray-500">Correct: </span>
                  <span className="text-green-600 tracking-widest">{digits}</span>
                </div>
                <div className="font-mono text-lg">
                  <span className="text-gray-500">Your answer: </span>
                  <span className="tracking-widest">
                    {digits.split('').map((digit, index) => {
                      const userDigit = userInput[index] || '_';
                      const isCorrect = userDigit === digit;
                      return (
                        <span
                          key={index}
                          className={isCorrect ? 'text-green-600' : 'text-red-600'}
                        >
                          {userDigit}
                        </span>
                      );
                    })}
                  </span>
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
  );
};

export default DigitalChallenge;