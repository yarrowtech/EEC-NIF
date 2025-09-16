import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, RotateCcw, Users, Clock, CheckCircle, XCircle, Award } from 'lucide-react';

const allPeople = [
  { id: 1, name: 'Emma Thompson', age: 28, profession: 'Teacher', skinColor: 'bg-red-200', hairColor: 'bg-orange-600', eyeColor: 'bg-blue-800', likes: ['reading', 'yoga'] },
  { id: 2, name: 'Alex Rivera', age: 32, profession: 'Engineer', skinColor: 'bg-yellow-200', hairColor: 'bg-black', eyeColor: 'bg-green-700', likes: ['coding', 'hiking'] },
  { id: 3, name: 'Sam Chen', age: 25, profession: 'Designer', skinColor: 'bg-orange-200', hairColor: 'bg-yellow-800', eyeColor: 'bg-brown-800', likes: ['art', 'music'] },
  { id: 4, name: 'Maya Patel', age: 30, profession: 'Doctor', skinColor: 'bg-amber-200', hairColor: 'bg-black', eyeColor: 'bg-brown-900', likes: ['medicine', 'travel'] },
  { id: 5, name: 'Jordan Smith', age: 27, profession: 'Chef', skinColor: 'bg-stone-200', hairColor: 'bg-red-800', eyeColor: 'bg-blue-600', likes: ['cooking', 'food'] },
  { id: 6, name: 'Taylor Kim', age: 29, profession: 'Artist', skinColor: 'bg-pink-200', hairColor: 'bg-purple-600', eyeColor: 'bg-green-600', likes: ['painting', 'photography'] },
  { id: 7, name: 'Robin Martinez', age: 33, profession: 'Nurse', skinColor: 'bg-rose-200', hairColor: 'bg-gray-800', eyeColor: 'bg-amber-800', likes: ['caring', 'gardening'] },
  { id: 8, name: 'Casey Johnson', age: 26, profession: 'Writer', skinColor: 'bg-teal-200', hairColor: 'bg-indigo-600', eyeColor: 'bg-gray-600', likes: ['writing', 'cats'] }
];

const FacialRecall = ({ onBack }) => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'studying', 'testing', 'result'
  const [currentPeople, setCurrentPeople] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studyTimeLeft, setStudyTimeLeft] = useState(20);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [isCorrect, setIsCorrect] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const maxRounds = 5;
  const peoplePerRound = 4;

  const generateFace = (person, size = 'w-16 h-16') => (
    <div className={`relative ${size} rounded-full overflow-hidden shadow-lg border-3 border-white transform hover:scale-105 transition-transform duration-300`}>
      {/* Face */}
      <div className={`w-full h-full ${person.skinColor}`}></div>
      
      {/* Hair */}
      <div className={`absolute top-1 left-1/2 transform -translate-x-1/2 w-3/4 h-2/3 ${person.hairColor} rounded-t-full`}></div>
      
      {/* Eyes */}
      <div className={`absolute top-1/3 left-1/4 w-2 h-2 ${person.eyeColor} rounded-full`}></div>
      <div className={`absolute top-1/3 right-1/4 w-2 h-2 ${person.eyeColor} rounded-full`}></div>
      
      {/* Nose */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-gray-600 rounded-full"></div>
      
      {/* Mouth */}
      <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-red-600 rounded-full"></div>
    </div>
  );

  const startNewRound = () => {
    // Select random people for this round
    const shuffled = [...allPeople].sort(() => Math.random() - 0.5);
    const selectedPeople = shuffled.slice(0, peoplePerRound);
    setCurrentPeople(selectedPeople);
    setCurrentQuestionIndex(0);
    setStudyTimeLeft(20);
    setGameState('studying');
    setIsCorrect(null);
  };

  const startTesting = () => {
    setGameState('testing');
    setCurrentQuestionIndex(0);
  };

  const handleAnswer = (selectedPerson) => {
    const correctPerson = currentPeople[currentQuestionIndex];
    const correct = selectedPerson.id === correctPerson.id;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 10);
    }
    
    setGameHistory([...gameHistory, {
      round,
      question: currentQuestionIndex + 1,
      correctAnswer: correctPerson.name,
      userAnswer: selectedPerson.name,
      isCorrect: correct
    }]);

    setTimeout(() => {
      if (currentQuestionIndex < currentPeople.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setIsCorrect(null);
      } else {
        // Round completed
        if (round < maxRounds) {
          setRound(round + 1);
          startNewRound();
        } else {
          setGameState('result');
        }
      }
    }, 2000);
  };

  const resetGame = () => {
    setGameState('menu');
    setScore(0);
    setRound(1);
    setCurrentQuestionIndex(0);
    setStudyTimeLeft(20);
    setIsCorrect(null);
    setGameHistory([]);
  };

  // Study timer countdown
  useEffect(() => {
    let timer;
    if (gameState === 'studying' && studyTimeLeft > 0) {
      timer = setTimeout(() => setStudyTimeLeft(studyTimeLeft - 1), 1000);
    } else if (gameState === 'studying' && studyTimeLeft === 0) {
      startTesting();
    }
    return () => clearTimeout(timer);
  }, [gameState, studyTimeLeft]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Facial Recall</h2>
          <p className="text-gray-600">Test your ability to remember faces and names!</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        {gameState === 'menu' && (
          <div className="text-center space-y-6">
            <div className="mb-6">
              <Users className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Memory Challenge</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Study people's faces, names, and details. Then try to match them correctly!
              </p>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              {allPeople.slice(0, 4).map((person) => (
                <div key={person.id} className="text-center">
                  {generateFace(person)}
                  <div className="text-xs text-gray-600 mt-2">{person.name.split(' ')[0]}</div>
                </div>
              ))}
            </div>
            
            {score > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="text-lg font-bold text-blue-600">Final Score: {score}/{maxRounds * peoplePerRound * 10}</div>
                <div className="text-sm text-gray-600 mb-2">
                  {score >= (maxRounds * peoplePerRound * 8) ? '🏆 Memory Master!' : 
                   score >= (maxRounds * peoplePerRound * 6) ? '🧠 Great Memory!' : '💪 Keep Practicing!'}
                </div>
                <div className="text-xs text-gray-500">
                  Accuracy: {Math.round((gameHistory.filter(h => h.isCorrect).length / gameHistory.length) * 100)}%
                </div>
              </div>
            )}
            
            <button
              onClick={startNewRound}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Play className="w-5 h-5" />
              {score > 0 ? 'Play Again' : 'Start Memory Test'}
            </button>
          </div>
        )}

        {gameState === 'studying' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">Round {round}/{maxRounds}</div>
              <div className="flex items-center gap-2 text-orange-600">
                <Clock className="w-5 h-5" />
                <span className="text-xl font-bold">{studyTimeLeft}s</span>
              </div>
              <div className="text-lg font-semibold">Score: {score}</div>
            </div>

            <div className="text-center space-y-6">
              <div className="text-xl font-bold text-gray-800">
                Study these people carefully!
              </div>
              <div className="text-sm text-gray-600">
                Remember their faces, names, ages, professions, and interests
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {currentPeople.map((person) => (
                  <div key={person.id} className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 text-center">
                    <div className="mb-4 flex justify-center">
                      {generateFace(person, 'w-20 h-20')}
                    </div>
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-gray-800">{person.name}</div>
                      <div className="text-sm text-gray-600">Age: {person.age}</div>
                      <div className="text-sm text-gray-600">{person.profession}</div>
                      <div className="text-xs text-gray-500">
                        Likes: {person.likes.join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Memory Tip:</strong> Try to create associations between faces and details. 
                  Notice unique features like hair color, eye color, and profession!
                </p>
              </div>
            </div>
          </div>
        )}

        {gameState === 'testing' && currentPeople.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">
                Question {currentQuestionIndex + 1}/{currentPeople.length}
              </div>
              <div className="text-lg font-semibold">Round {round}/{maxRounds}</div>
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
                    <span className="text-xl font-bold">Incorrect!</span>
                  </div>
                )}
              </div>
            )}

            {isCorrect === null && (
              <div className="text-center space-y-6">
                <div className="text-xl font-bold text-gray-800">
                  Who is this person?
                </div>
                
                <div className="flex justify-center mb-6">
                  {generateFace(currentPeople[currentQuestionIndex], 'w-32 h-32')}
                </div>
                
                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {currentPeople.sort(() => Math.random() - 0.5).map((person) => (
                    <button
                      key={person.id}
                      onClick={() => handleAnswer(person)}
                      className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-400 text-center group"
                    >
                      <div className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 mb-2">
                        {person.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {person.profession}, Age {person.age}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Likes: {person.likes.join(', ')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {gameState === 'result' && (
          <div className="text-center space-y-6">
            <Award className="w-16 h-16 text-yellow-500 mx-auto" />
            
            <div className="text-2xl font-bold text-gray-800 mb-4">
              Memory Test Complete!
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 max-w-2xl mx-auto">
              <div className="text-3xl font-bold text-blue-600 mb-2">{score}/{maxRounds * peoplePerRound * 10}</div>
              <div className="text-lg text-gray-700 mb-4">
                Accuracy: {Math.round((gameHistory.filter(h => h.isCorrect).length / gameHistory.length) * 100)}%
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="font-medium text-gray-800">Performance Breakdown:</div>
                {Array.from({length: maxRounds}, (_, i) => {
                  const roundHistory = gameHistory.filter(h => h.round === i + 1);
                  const roundScore = roundHistory.filter(h => h.isCorrect).length;
                  return (
                    <div key={i} className="flex justify-between">
                      <span>Round {i + 1}:</span>
                      <span className={roundScore === peoplePerRound ? 'text-green-600' : roundScore >= peoplePerRound * 0.5 ? 'text-yellow-600' : 'text-red-600'}>
                        {roundScore}/{peoplePerRound} correct
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={resetGame}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Play className="w-5 h-5" />
              Play Again
            </button>
          </div>
        )}

        {gameState !== 'result' && gameState !== 'menu' && (
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

export default FacialRecall;