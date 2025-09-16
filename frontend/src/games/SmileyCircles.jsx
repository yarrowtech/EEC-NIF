import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Clock, CheckCircle, XCircle } from 'lucide-react';

const emotions = [
  { emoji: '😊', name: 'Happy', description: 'Feeling joyful and cheerful' },
  { emoji: '😠', name: 'Angry', description: 'Feeling mad or frustrated' },
  { emoji: '😢', name: 'Sad', description: 'Feeling down or disappointed' },
  { emoji: '😲', name: 'Surprised', description: 'Feeling shocked or amazed' },
  { emoji: '😴', name: 'Sleepy', description: 'Feeling tired or drowsy' },
  { emoji: '😱', name: 'Scared', description: 'Feeling frightened or worried' },
  { emoji: '🤔', name: 'Thinking', description: 'Feeling contemplative or puzzled' },
  { emoji: '😎', name: 'Cool', description: 'Feeling confident and relaxed' }
];

const SmileyCircles = () => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'result'
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isCorrect, setIsCorrect] = useState(null);
  const maxRounds = 8;

  const startGame = () => {
    // Pick a random emotion
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    
    // Create 4 options including the correct one
    const wrongOptions = emotions.filter(e => e.emoji !== randomEmotion.emoji);
    const shuffledWrong = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 3);
    const allOptions = [...shuffledWrong, randomEmotion].sort(() => Math.random() - 0.5);
    
    setCurrentEmotion(randomEmotion);
    setOptions(allOptions);
    setGameState('playing');
    setTimeLeft(10);
    setIsCorrect(null);
  };

  const handleAnswer = (selectedEmotion) => {
    const correct = selectedEmotion.emoji === currentEmotion.emoji;
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
    }, 1500);
  };

  const resetGame = () => {
    setGameState('menu');
    setScore(0);
    setRound(1);
    setTimeLeft(10);
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
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft, round, maxRounds]);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Smiley Circles</h2>
      <p className="text-gray-600 mb-6">Guess the emotions of the emojis!</p>

      <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-8">
        {gameState === 'menu' && (
          <div className="text-center space-y-6">
            <div className="flex justify-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-purple-300 flex items-center justify-center text-3xl">😊</div>
              <div className="w-16 h-16 rounded-full bg-purple-300 flex items-center justify-center text-3xl">😠</div>
              <div className="w-16 h-16 rounded-full bg-purple-300 flex items-center justify-center text-3xl">😲</div>
              <div className="w-16 h-16 rounded-full bg-purple-300 flex items-center justify-center text-3xl">😢</div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800">Emotion Recognition Challenge</h3>
            <p className="text-gray-600">
              Look at the emoji and choose the correct emotion name. You have 10 seconds per round!
            </p>
            
            {score > 0 && (
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="text-lg font-bold text-purple-600">Final Score: {score}/{maxRounds * 10}</div>
                <div className="text-sm text-gray-600">
                  {score >= (maxRounds * 8) ? '🏆 Emotion Master!' : score >= (maxRounds * 6) ? '👍 Great job!' : '💪 Keep practicing!'}
                </div>
              </div>
            )}
            
            <button
              onClick={startGame}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              <Play className="w-5 h-5" />
              {score > 0 ? 'Play Again' : 'Start Game'}
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
              <div className="text-xl font-bold text-gray-800 mb-4">
                What emotion is this?
              </div>
              
              <div className="w-32 h-32 rounded-full bg-white border-4 border-purple-300 flex items-center justify-center text-6xl mx-auto mb-6 shadow-lg">
                {currentEmotion?.emoji}
              </div>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {options.map((emotion) => (
                  <button
                    key={emotion.emoji}
                    onClick={() => handleAnswer(emotion)}
                    className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-400 text-center"
                  >
                    <div className="text-lg font-semibold text-gray-800">{emotion.name}</div>
                    <div className="text-sm text-gray-600">{emotion.description}</div>
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
              <div className="flex items-center justify-center gap-3 mt-2">
                <span className="text-3xl">{currentEmotion?.emoji}</span>
                <div className="text-left">
                  <div className="font-semibold">{currentEmotion?.name}</div>
                  <div className="text-sm text-gray-600">{currentEmotion?.description}</div>
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

export default SmileyCircles;

