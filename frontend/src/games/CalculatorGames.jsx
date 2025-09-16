import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, RotateCcw, Calculator, Clock, CheckCircle, XCircle, Trophy, Target, Zap, Brain } from 'lucide-react';

const gameModes = [
  {
    id: 'speed',
    name: 'Speed Math',
    desc: 'Solve as many problems as possible in 60 seconds',
    icon: Zap,
    timeLimit: 60,
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'accuracy',
    name: 'Accuracy Challenge',
    desc: 'Get 10 problems correct with minimal mistakes',
    icon: Target,
    timeLimit: null,
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 'mental',
    name: 'Mental Math',
    desc: 'Complex problems to challenge your brain',
    icon: Brain,
    timeLimit: null,
    color: 'from-purple-400 to-purple-600'
  },
  {
    id: 'practice',
    name: 'Free Practice',
    desc: 'Practice at your own pace',
    icon: Calculator,
    timeLimit: null,
    color: 'from-green-400 to-green-600'
  }
];

const CalculatorGames = ({ onBack }) => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'modeSelect', 'playing', 'result'
  const [selectedMode, setSelectedMode] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);
  const [problemHistory, setProblemHistory] = useState([]);
  const [round, setRound] = useState(1);

  const generateProblem = (difficulty = 'medium') => {
    const operations = ['+', '-', '×', '÷'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;

    if (difficulty === 'easy') {
      switch (operation) {
        case '+':
          num1 = Math.floor(Math.random() * 20) + 1;
          num2 = Math.floor(Math.random() * 20) + 1;
          answer = num1 + num2;
          break;
        case '-':
          num1 = Math.floor(Math.random() * 30) + 10;
          num2 = Math.floor(Math.random() * num1) + 1;
          answer = num1 - num2;
          break;
        case '×':
          num1 = Math.floor(Math.random() * 10) + 1;
          num2 = Math.floor(Math.random() * 10) + 1;
          answer = num1 * num2;
          break;
        case '÷':
          answer = Math.floor(Math.random() * 10) + 1;
          num2 = Math.floor(Math.random() * 8) + 2;
          num1 = answer * num2;
          break;
      }
    } else if (difficulty === 'hard') {
      switch (operation) {
        case '+':
          num1 = Math.floor(Math.random() * 200) + 50;
          num2 = Math.floor(Math.random() * 200) + 50;
          answer = num1 + num2;
          break;
        case '-':
          num1 = Math.floor(Math.random() * 300) + 100;
          num2 = Math.floor(Math.random() * num1) + 50;
          answer = num1 - num2;
          break;
        case '×':
          num1 = Math.floor(Math.random() * 25) + 10;
          num2 = Math.floor(Math.random() * 15) + 5;
          answer = num1 * num2;
          break;
        case '÷':
          answer = Math.floor(Math.random() * 20) + 5;
          num2 = Math.floor(Math.random() * 15) + 3;
          num1 = answer * num2;
          break;
      }
    } else { // medium
      switch (operation) {
        case '+':
          num1 = Math.floor(Math.random() * 100) + 10;
          num2 = Math.floor(Math.random() * 100) + 10;
          answer = num1 + num2;
          break;
        case '-':
          num1 = Math.floor(Math.random() * 150) + 50;
          num2 = Math.floor(Math.random() * num1) + 10;
          answer = num1 - num2;
          break;
        case '×':
          num1 = Math.floor(Math.random() * 15) + 5;
          num2 = Math.floor(Math.random() * 12) + 3;
          answer = num1 * num2;
          break;
        case '÷':
          answer = Math.floor(Math.random() * 15) + 3;
          num2 = Math.floor(Math.random() * 12) + 2;
          num1 = answer * num2;
          break;
      }
    }

    return { num1, num2, operation, answer, difficulty };
  };

  const startGame = (mode) => {
    setSelectedMode(mode);
    const difficulty = mode.id === 'mental' ? 'hard' : mode.id === 'practice' ? 'easy' : 'medium';
    setCurrentProblem(generateProblem(difficulty));
    setUserInput('');
    setScore(0);
    setMistakes(0);
    setRound(1);
    setProblemHistory([]);
    setIsCorrect(null);
    setGameState('playing');
    
    if (mode.timeLimit) {
      setTimeLeft(mode.timeLimit);
    }
  };

  const handleNumberClick = (num) => {
    if (gameState === 'playing' && isCorrect === null) {
      setUserInput(prev => prev + num);
    }
  };

  const handleClear = () => {
    if (gameState === 'playing') {
      setUserInput('');
    }
  };

  const handleBackspace = () => {
    if (gameState === 'playing') {
      setUserInput(prev => prev.slice(0, -1));
    }
  };

  const checkAnswer = () => {
    if (!userInput || isCorrect !== null) return;

    const userAnswer = parseInt(userInput);
    const correct = userAnswer === currentProblem.answer;
    setIsCorrect(correct);

    const problemData = {
      ...currentProblem,
      userAnswer,
      isCorrect: correct,
      round
    };
    setProblemHistory(prev => [...prev, problemData]);

    if (correct) {
      setScore(score + 10);
    } else {
      setMistakes(mistakes + 1);
    }

    setTimeout(() => {
      // Check game end conditions
      if (selectedMode.id === 'accuracy' && (score + 10 >= 100 || mistakes >= 3)) {
        setGameState('result');
        return;
      }

      if (selectedMode.id === 'mental' && round >= 15) {
        setGameState('result');
        return;
      }

      // Continue to next problem
      const difficulty = selectedMode.id === 'mental' ? 'hard' : selectedMode.id === 'practice' ? 'easy' : 'medium';
      setCurrentProblem(generateProblem(difficulty));
      setUserInput('');
      setRound(round + 1);
      setIsCorrect(null);
    }, 1500);
  };

  const resetGame = () => {
    setGameState('menu');
    setSelectedMode(null);
    setCurrentProblem(null);
    setUserInput('');
    setScore(0);
    setMistakes(0);
    setTimeLeft(0);
    setIsCorrect(null);
    setProblemHistory([]);
    setRound(1);
  };

  // Timer countdown
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && selectedMode?.timeLimit && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (gameState === 'playing' && selectedMode?.timeLimit && timeLeft === 0) {
      setGameState('result');
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft, selectedMode]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Calculator Games</h2>
          <p className="text-gray-600">Practice math through fun, interactive challenges!</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        {gameState === 'menu' && (
          <div className="text-center space-y-6">
            <div className="mb-6">
              <Calculator className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Math Challenge Center</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Choose your challenge and improve your calculation skills!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {gameModes.map((mode) => {
                const IconComponent = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => startGame(mode)}
                    className={`p-6 rounded-xl bg-gradient-to-br ${mode.color} text-white text-left transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <IconComponent className="w-8 h-8" />
                      <h4 className="text-xl font-bold">{mode.name}</h4>
                    </div>
                    <p className="text-white/90 mb-3">{mode.desc}</p>
                    {mode.timeLimit && (
                      <div className="flex items-center gap-1 text-white/80 text-sm">
                        <Clock className="w-4 h-4" />
                        {mode.timeLimit} seconds
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {score > 0 && (
              <div className="bg-green-50 rounded-lg p-4 mt-6">
                <div className="text-lg font-bold text-green-600">Last Game: {score} points</div>
                <div className="text-sm text-gray-600">
                  Mode: {selectedMode?.name} | Problems: {problemHistory.length}
                </div>
              </div>
            )}
          </div>
        )}

        {gameState === 'playing' && currentProblem && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">
                {selectedMode?.name} - Problem {round}
              </div>
              {selectedMode?.timeLimit && (
                <div className="flex items-center gap-2 text-orange-600">
                  <Clock className="w-5 h-5" />
                  <span className="text-xl font-bold">{timeLeft}s</span>
                </div>
              )}
              <div className="text-lg font-semibold">Score: {score}</div>
            </div>

            {isCorrect !== null && (
              <div className="text-center">
                {isCorrect ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="w-8 h-8" />
                    <span className="text-xl font-bold">Correct! +10 points</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <XCircle className="w-8 h-8" />
                    <span className="text-xl font-bold">
                      Incorrect! Answer was {currentProblem.answer}
                    </span>
                  </div>
                )}
              </div>
            )}

            {isCorrect === null && (
              <div className="max-w-2xl mx-auto">
                {/* Calculator Interface */}
                <div className="bg-gray-800 rounded-xl p-6 shadow-2xl">
                  {/* Display */}
                  <div className="bg-green-900 rounded-lg p-4 mb-6">
                    <div className="text-green-400 text-right font-mono text-2xl mb-2">
                      {currentProblem.num1} {currentProblem.operation} {currentProblem.num2} = ?
                    </div>
                    <div className="text-green-300 text-right font-mono text-lg">
                      {userInput || '0'}
                    </div>
                  </div>
                  
                  {/* Calculator Buttons */}
                  <div className="grid grid-cols-4 gap-3">
                    {/* Number pad */}
                    {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleNumberClick(num.toString())}
                        className="bg-gray-600 hover:bg-gray-500 text-white rounded-lg h-12 text-xl font-semibold transition-colors"
                      >
                        {num}
                      </button>
                    ))}
                    
                    {/* Bottom row */}
                    <button
                      onClick={handleClear}
                      className="bg-red-600 hover:bg-red-500 text-white rounded-lg h-12 text-lg font-semibold transition-colors"
                    >
                      C
                    </button>
                    <button
                      onClick={() => handleNumberClick('0')}
                      className="bg-gray-600 hover:bg-gray-500 text-white rounded-lg h-12 text-xl font-semibold transition-colors"
                    >
                      0
                    </button>
                    <button
                      onClick={handleBackspace}
                      className="bg-orange-600 hover:bg-orange-500 text-white rounded-lg h-12 text-lg font-semibold transition-colors"
                    >
                      ←
                    </button>
                    <button
                      onClick={checkAnswer}
                      disabled={!userInput}
                      className="bg-green-600 hover:bg-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg h-12 text-lg font-semibold transition-colors"
                    >
                      =
                    </button>
                  </div>
                </div>

                {selectedMode?.id === 'accuracy' && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center gap-4 bg-blue-50 rounded-lg px-4 py-2">
                      <span className="text-green-600">Correct: {score / 10}</span>
                      <span className="text-red-600">Mistakes: {mistakes}/3</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {gameState === 'result' && (
          <div className="text-center space-y-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
            
            <div className="text-2xl font-bold text-gray-800 mb-4">
              {selectedMode?.name} Complete!
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 max-w-2xl mx-auto">
              <div className="text-3xl font-bold text-blue-600 mb-4">{score} Points</div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Problems Solved:</span>
                  <div className="text-lg font-bold">{problemHistory.length}</div>
                </div>
                <div>
                  <span className="font-medium">Accuracy:</span>
                  <div className="text-lg font-bold">
                    {problemHistory.length > 0 
                      ? Math.round((problemHistory.filter(p => p.isCorrect).length / problemHistory.length) * 100)
                      : 0}%
                  </div>
                </div>
                <div>
                  <span className="font-medium">Correct Answers:</span>
                  <div className="text-lg font-bold text-green-600">
                    {problemHistory.filter(p => p.isCorrect).length}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Mistakes:</span>
                  <div className="text-lg font-bold text-red-600">{mistakes}</div>
                </div>
              </div>

              {selectedMode?.timeLimit && (
                <div className="mt-4 pt-4 border-t">
                  <div className="font-medium text-gray-700">
                    Speed: {problemHistory.length > 0 
                      ? Math.round(selectedMode.timeLimit / problemHistory.length) 
                      : 0} sec/problem
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => startGame(selectedMode)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <Play className="w-5 h-5" />
                Play Again
              </button>
              <button
                onClick={resetGame}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Choose New Mode
              </button>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="text-center mt-6">
            <button
              onClick={resetGame}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Quit Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalculatorGames;