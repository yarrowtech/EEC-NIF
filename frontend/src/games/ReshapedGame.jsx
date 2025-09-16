import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, RotateCcw, Clock, CheckCircle, XCircle } from 'lucide-react';

const shapes = [
  { 
    id: 'cube', 
    name: 'Cube',
    description: 'A 3D shape with 6 square faces',
    color: 'bg-yellow-400',
    render: (size = 'w-12 h-12') => <div className={`${size} bg-yellow-400 transform rotate-12 shadow-lg`}></div>
  },
  { 
    id: 'sphere', 
    name: 'Sphere',
    description: 'A perfectly round 3D shape',
    color: 'bg-red-500',
    render: (size = 'w-12 h-12') => <div className={`${size} bg-red-500 rounded-full shadow-lg`}></div>
  },
  { 
    id: 'cone', 
    name: 'Cone',
    description: 'A 3D shape with a circular base and pointed top',
    color: 'border-b-blue-400',
    render: (size = 'w-0 h-0') => <div className={`${size} border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-blue-400 shadow-lg`}></div>
  },
  { 
    id: 'torus', 
    name: 'Torus',
    description: 'A donut-shaped 3D object',
    color: 'bg-purple-500',
    render: (size = 'w-12 h-12') => (
      <div className={`${size} bg-purple-500 rounded-full shadow-lg relative`}>
        <div className="w-4 h-4 bg-gray-200 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    )
  },
  { 
    id: 'cylinder', 
    name: 'Cylinder',
    description: 'A 3D shape with circular ends and straight sides',
    color: 'bg-green-500',
    render: (size = 'w-12 h-12') => <div className={`${size} bg-green-500 rounded-lg shadow-lg`}></div>
  },
  { 
    id: 'pyramid', 
    name: 'Pyramid',
    description: 'A 3D shape with a square base and triangular sides',
    color: 'border-b-orange-400',
    render: (size = 'w-0 h-0') => <div className={`${size} border-l-6 border-r-6 border-b-10 border-l-transparent border-r-transparent border-b-orange-400 shadow-lg`}></div>
  }
];

const ReshapedGame = ({ onBack }) => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'result'
  const [targetShape, setTargetShape] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(8);
  const [isCorrect, setIsCorrect] = useState(null);
  const maxRounds = 10;

  const startGame = () => {
    // Pick a random shape
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    
    // Create 4 options including the correct one
    const wrongOptions = shapes.filter(s => s.id !== randomShape.id);
    const shuffledWrong = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 3);
    const allOptions = [...shuffledWrong, randomShape].sort(() => Math.random() - 0.5);
    
    setTargetShape(randomShape);
    setOptions(allOptions);
    setGameState('playing');
    setTimeLeft(8);
    setIsCorrect(null);
  };

  const handleAnswer = (selectedShape) => {
    const correct = selectedShape.id === targetShape.id;
    setIsCorrect(correct);
    if (correct) {
      setScore(score + 10);
    }
    setGameState('result');
    
    setTimeout(() => {
      if (round < maxRounds) {
        setRound(round + 1);
        startGame();
      } else {
        setGameState('menu');
        setRound(1);
      }
    }, 2000);
  };

  const resetGame = () => {
    setGameState('menu');
    setScore(0);
    setRound(1);
    setTimeLeft(8);
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
        if (round < maxRounds) {
          setRound(round + 1);
          startGame();
        } else {
          setGameState('menu');
          setRound(1);
        }
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft, round, maxRounds]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-2xl font-bold text-gray-800">RESHAPED</h2>
      </div>

      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8">
        {gameState === 'menu' && (
          <div className="text-center space-y-6">
            <h3 className="text-xl font-bold text-gray-800">3D Shape Recognition</h3>
            <p className="text-gray-600">
              Learn about geometric shapes! Look at the shape and choose the correct name.
            </p>
            
            <div className="flex justify-center gap-4 my-6">
              {shapes.slice(0, 4).map((shape) => (
                <div key={shape.id} className="flex flex-col items-center">
                  {shape.render()}
                  <div className="text-xs text-gray-600 mt-2">{shape.name}</div>
                </div>
              ))}
            </div>
            
            {score > 0 && (
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="text-lg font-bold text-blue-600">Final Score: {score}/{maxRounds * 10}</div>
                <div className="text-sm text-gray-600">
                  {score >= (maxRounds * 8) ? '🏆 Shape Master!' : score >= (maxRounds * 6) ? '👍 Great job!' : '💪 Keep learning!'}
                </div>
              </div>
            )}
            
            <button
              onClick={startGame}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Play className="w-5 h-5" />
              {score > 0 ? 'Play Again' : 'Start Learning'}
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">Round {round}/{maxRounds}</div>
              <div className="flex items-center gap-2 text-orange-600">
                <Clock className="w-5 h-5" />
                <span className="text-xl font-bold">{timeLeft}s</span>
              </div>
              <div className="text-lg font-semibold">Score: {score}</div>
            </div>

            <div className="text-center space-y-6">
              <div className="text-xl font-bold text-gray-800">
                What shape is this?
              </div>
              
              <div className="w-32 h-32 bg-white rounded-xl border-4 border-gray-300 flex items-center justify-center mx-auto shadow-lg">
                {targetShape?.render('w-16 h-16')}
              </div>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {options.map((shape) => (
                  <button
                    key={shape.id}
                    onClick={() => handleAnswer(shape)}
                    className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-400 text-center"
                  >
                    <div className="text-lg font-semibold text-gray-800">{shape.name}</div>
                    <div className="text-sm text-gray-600">{shape.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="text-center space-y-4">
            {isCorrect ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            )}
            
            <div className="text-2xl font-bold">
              {isCorrect ? 'Correct! +10 points' : 'Time\'s up or wrong answer!'}
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <div className="text-lg">The correct answer was:</div>
              <div className="flex items-center justify-center gap-4 mt-3">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  {targetShape?.render('w-12 h-12')}
                </div>
                <div className="text-left">
                  <div className="text-xl font-semibold">{targetShape?.name}</div>
                  <div className="text-sm text-gray-600">{targetShape?.description}</div>
                </div>
              </div>
            </div>
            
            <div className="text-gray-600">
              {round < maxRounds ? `Round ${round + 1} starting...` : 'Game completed!'}
            </div>
          </div>
        )}

        {gameState !== 'result' && (
          <div className="text-center mt-6">
            <button
              onClick={resetGame}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReshapedGame;