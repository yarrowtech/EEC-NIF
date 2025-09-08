import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  X,
  Clock,
  Target,
  Award,
  RotateCcw,
  Brain,
  Loader2,
  Zap,
  AlertCircle,
  Star,
  ChevronRight,
  ChevronLeft,
  Trophy,
  BookOpen
} from 'lucide-react';

const AIQuizGenerator = ({ subject }) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');

  useEffect(() => {
    let timer;
    if (quizStarted && timeRemaining > 0 && !showResults) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleQuizSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, timeRemaining, showResults]);

  const generateQuiz = async () => {
    if (!selectedTopic) return;

    setLoading(true);
    try {
      const response = await fetch('/api/student-ai-learning/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: selectedTopic,
          subject: subject.name,
          contentType: 'quiz',
          difficulty,
          questionCount: 10
        })
      });

      if (response.ok) {
        const data = await response.json();
        setQuiz(data.content);
      } else {
        setQuiz(mockQuizzes[selectedTopic] || generateDefaultQuiz(selectedTopic));
      }
      
      setCurrentQuestion(0);
      setUserAnswers({});
      setShowResults(false);
      setQuizStarted(false);
      setTimeRemaining(0);
      
      // Log activity
      logActivity('quiz');
    } catch (error) {
      console.error('Error generating quiz:', error);
      setQuiz(mockQuizzes[selectedTopic] || generateDefaultQuiz(selectedTopic));
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (activityType) => {
    try {
      await fetch('/api/student-ai-learning/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: 'mock-student-id',
          topic: selectedTopic,
          subject: subject.name,
          activityType,
          timeSpent: Math.floor(Math.random() * 30) + 15,
          completed: showResults
        })
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowResults(false);
  };

  const selectAnswer = (questionIndex, answerIndex) => {
    if (showResults) return;
    
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleQuizSubmit = () => {
    setShowResults(true);
    setQuizStarted(false);
    setTimeRemaining(0);
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: quiz.questions.length,
      percentage: Math.round((correct / quiz.questions.length) * 100)
    };
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowResults(false);
    setQuizStarted(false);
    setTimeRemaining(0);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const generateDefaultQuiz = (topic) => ({
    title: `${topic} Quiz`,
    description: `Test your knowledge on ${topic}`,
    timeLimit: 15,
    questions: [
      {
        id: 1,
        question: `What is the main concept behind ${topic}?`,
        options: [
          'Option A - Basic understanding',
          'Option B - Advanced application',
          'Option C - Fundamental principles',
          'Option D - Complex theories'
        ],
        correctAnswer: 2,
        explanation: `${topic} is based on fundamental principles that form the foundation of the subject.`
      }
    ]
  });

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 75) return 'text-blue-600 bg-blue-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  <CheckCircle className="w-7 h-7 mr-3" />
                  AI Quiz Generator
                </h2>
                <p className="text-red-100 mt-1">
                  Test your knowledge with AI-generated questions
                </p>
              </div>
              <div className="bg-red-400 p-3 rounded-xl">
                <Brain className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Quiz Setup */}
          <div className="p-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Create Your Quiz</h3>
                <p className="text-gray-600">
                  Select a topic and difficulty level to generate a personalized quiz
                </p>
              </div>

              <div className="space-y-6">
                {/* Topic Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Topic
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Choose a topic...</option>
                    {subject.topics.map((topic, index) => (
                      <option key={index} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['easy', 'medium', 'hard'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`p-3 rounded-lg border-2 font-medium capitalize transition-colors ${
                          difficulty === level
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateQuiz}
                  disabled={!selectedTopic || loading}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating Quiz...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Generate Quiz</span>
                    </>
                  )}
                </button>
              </div>

              {/* Features */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-red-600" />
                  </div>
                  <h4 className="font-medium text-gray-800 mb-1">Adaptive Questions</h4>
                  <p className="text-sm text-gray-600">Questions tailored to your learning level</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-800 mb-1">Timed Challenges</h4>
                  <p className="text-sm text-gray-600">Improve your speed and accuracy</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-800 mb-1">Instant Feedback</h4>
                  <p className="text-sm text-gray-600">Detailed explanations for each answer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Results Header */}
          <div className={`p-6 text-white ${score.percentage >= 75 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'}`}>
            <div className="text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
              <p className="text-lg opacity-90">
                {score.percentage >= 90 ? 'Excellent work!' : 
                 score.percentage >= 75 ? 'Great job!' : 
                 score.percentage >= 60 ? 'Good effort!' : 'Keep practicing!'}
              </p>
            </div>
          </div>

          {/* Score Summary */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`text-center p-6 rounded-xl ${getScoreColor(score.percentage)}`}>
                <div className="text-3xl font-bold mb-2">{score.percentage}%</div>
                <p className="font-medium">Final Score</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-blue-50">
                <div className="text-3xl font-bold mb-2 text-blue-600">{score.correct}</div>
                <p className="font-medium text-blue-800">Correct Answers</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gray-50">
                <div className="text-3xl font-bold mb-2 text-gray-600">{score.total - score.correct}</div>
                <p className="font-medium text-gray-800">Incorrect Answers</p>
              </div>
            </div>

            {/* Question Review */}
            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Review Your Answers</h3>
              {quiz.questions.map((question, qIndex) => {
                const userAnswer = userAnswers[qIndex];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div key={qIndex} className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-start space-x-3">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      ) : (
                        <X className="w-5 h-5 text-red-600 mt-1" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-2">
                          {qIndex + 1}. {question.question}
                        </h4>
                        <div className="space-y-1 mb-3">
                          {question.options.map((option, oIndex) => (
                            <div
                              key={oIndex}
                              className={`text-sm p-2 rounded ${
                                oIndex === question.correctAnswer
                                  ? 'bg-green-100 text-green-800 font-medium'
                                  : oIndex === userAnswer && !isCorrect
                                  ? 'bg-red-100 text-red-800'
                                  : 'text-gray-600'
                              }`}
                            >
                              {option} 
                              {oIndex === question.correctAnswer && ' ✓'}
                              {oIndex === userAnswer && oIndex !== question.correctAnswer && ' ✗'}
                            </div>
                          ))}
                        </div>
                        {question.explanation && (
                          <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetQuiz}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={() => setQuiz(null)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>New Topic</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Quiz Preview Header */}
          <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
            <p className="text-red-100">{quiz.description}</p>
          </div>

          {/* Quiz Info */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="font-bold text-lg text-blue-800">{quiz.questions.length}</div>
                <p className="text-blue-600 text-sm">Questions</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-bold text-lg text-green-800">{quiz.timeLimit}</div>
                <p className="text-green-600 text-sm">Minutes</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="font-bold text-lg text-purple-800 capitalize">{difficulty}</div>
                <p className="text-purple-600 text-sm">Difficulty</p>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Ready to Start?</h3>
              <p className="text-gray-600 mb-6">
                You'll have {quiz.timeLimit} minutes to complete {quiz.questions.length} questions. 
                Make sure you're in a quiet environment and ready to focus.
              </p>
              
              <button
                onClick={startQuiz}
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-pink-700 transition-colors flex items-center justify-center space-x-2 mx-auto"
              >
                <Star className="w-5 h-5" />
                <span>Start Quiz</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz View
  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Quiz Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">{quiz.title}</h2>
              <p className="text-red-100 text-sm">Question {currentQuestion + 1} of {quiz.questions.length}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatTime(timeRemaining)}</div>
              <p className="text-red-100 text-sm">Time Remaining</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-red-400 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="p-8">
          <div className="mb-8">
            <h3 className="text-xl font-medium text-gray-800 mb-6">
              {currentQ.question}
            </h3>
            
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => selectAnswer(currentQuestion, index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    userAnswers[currentQuestion] === index
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      userAnswers[currentQuestion] === index
                        ? 'border-red-500 bg-red-500'
                        : 'border-gray-300'
                    }`}>
                      {userAnswers[currentQuestion] === index && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-4">
              {currentQuestion === quiz.questions.length - 1 ? (
                <button
                  onClick={handleQuizSubmit}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Question Navigation Dots */}
          <div className="flex justify-center mt-6 space-x-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentQuestion
                    ? 'bg-red-500'
                    : userAnswers[index] !== undefined
                    ? 'bg-green-500'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock quiz data with comprehensive questions
const mockQuizzes = {
  'Algebra': {
    title: 'Algebra Mastery Quiz',
    description: 'Test your understanding of algebraic concepts',
    timeLimit: 15,
    questions: [
      {
        id: 1,
        question: 'What is the value of x in the equation 2x + 5 = 15?',
        options: ['x = 5', 'x = 10', 'x = 7.5', 'x = 20'],
        correctAnswer: 0,
        explanation: 'Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5'
      },
      {
        id: 2,
        question: 'Which property is demonstrated by a(b + c) = ab + ac?',
        options: ['Commutative Property', 'Associative Property', 'Distributive Property', 'Identity Property'],
        correctAnswer: 2,
        explanation: 'The distributive property allows you to multiply a term by each term inside parentheses'
      },
      {
        id: 3,
        question: 'What are like terms?',
        options: ['Terms with the same coefficient', 'Terms with the same variables and exponents', 'Terms that are equal', 'Terms in the same equation'],
        correctAnswer: 1,
        explanation: 'Like terms have identical variables raised to the same powers, allowing them to be combined'
      },
      {
        id: 4,
        question: 'Solve for y: 3y - 7 = 2y + 5',
        options: ['y = 12', 'y = -2', 'y = 2', 'y = -12'],
        correctAnswer: 0,
        explanation: 'Subtract 2y from both sides: y - 7 = 5, then add 7: y = 12'
      },
      {
        id: 5,
        question: 'What is the slope of the line y = -3x + 4?',
        options: ['3', '-3', '4', '-4'],
        correctAnswer: 1,
        explanation: 'In slope-intercept form y = mx + b, the coefficient of x (m) is the slope'
      }
    ]
  },
  'Geometry': {
    title: 'Geometry Knowledge Quiz',
    description: 'Test your spatial reasoning and geometric principles',
    timeLimit: 20,
    questions: [
      {
        id: 1,
        question: 'In a right triangle with legs of 3 and 4, what is the length of the hypotenuse?',
        options: ['5', '7', '25', '12'],
        correctAnswer: 0,
        explanation: 'Using Pythagorean theorem: 3² + 4² = 9 + 16 = 25, so c = √25 = 5'
      },
      {
        id: 2,
        question: 'What is the sum of interior angles in any triangle?',
        options: ['90°', '180°', '360°', '270°'],
        correctAnswer: 1,
        explanation: 'The sum of interior angles in any triangle is always 180°'
      },
      {
        id: 3,
        question: 'What is the area of a circle with radius 6?',
        options: ['36π', '12π', '6π', '18π'],
        correctAnswer: 0,
        explanation: 'Area = πr² = π(6)² = 36π'
      },
      {
        id: 4,
        question: 'How many sides does a hexagon have?',
        options: ['5', '6', '7', '8'],
        correctAnswer: 1,
        explanation: 'A hexagon is a polygon with 6 sides'
      },
      {
        id: 5,
        question: 'What makes two triangles congruent?',
        options: ['Same area', 'Same perimeter', 'Same corresponding sides and angles', 'Same shape'],
        correctAnswer: 2,
        explanation: 'Congruent triangles have all corresponding sides and angles equal'
      }
    ]
  },
  'Trigonometry': {
    title: 'Trigonometry Challenge',
    description: 'Master the relationships between angles and sides',
    timeLimit: 25,
    questions: [
      {
        id: 1,
        question: 'What does SOH in SOH-CAH-TOA stand for?',
        options: ['Sine = Opposite/Hypotenuse', 'Sine = Opposite/Height', 'Side = Opposite/Hypotenuse', 'Sum = Opposite/Hypotenuse'],
        correctAnswer: 0,
        explanation: 'SOH means Sine = Opposite/Hypotenuse in a right triangle'
      },
      {
        id: 2,
        question: 'What is sin(30°)?',
        options: ['1/2', '√3/2', '√2/2', '1'],
        correctAnswer: 0,
        explanation: 'sin(30°) = 1/2, one of the common angle values'
      },
      {
        id: 3,
        question: 'What is the Pythagorean identity?',
        options: ['sin²θ + cos²θ = 1', 'sin²θ - cos²θ = 1', 'sinθ + cosθ = 1', 'sinθ × cosθ = 1'],
        correctAnswer: 0,
        explanation: 'The fundamental trigonometric identity: sin²θ + cos²θ = 1'
      },
      {
        id: 4,
        question: 'What is the period of the sine function?',
        options: ['π', '2π', 'π/2', '4π'],
        correctAnswer: 1,
        explanation: 'The sine function repeats every 2π radians (360°)'
      },
      {
        id: 5,
        question: 'In which quadrant are both sine and cosine positive?',
        options: ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'],
        correctAnswer: 0,
        explanation: 'In Quadrant I (0° to 90°), both sine and cosine values are positive'
      }
    ]
  },
  'Mechanics': {
    title: 'Physics Mechanics Quiz',
    description: 'Test your knowledge of motion and forces',
    timeLimit: 18,
    questions: [
      {
        id: 1,
        question: 'What is Newton\'s First Law of Motion?',
        options: ['F = ma', 'Objects at rest stay at rest unless acted upon by force', 'For every action, there is an equal and opposite reaction', 'Energy cannot be created or destroyed'],
        correctAnswer: 1,
        explanation: 'Newton\'s First Law states that objects at rest stay at rest, and objects in motion stay in motion, unless acted upon by a net external force'
      },
      {
        id: 2,
        question: 'What is the formula for kinetic energy?',
        options: ['KE = mgh', 'KE = ½mv²', 'KE = mv', 'KE = ½mv'],
        correctAnswer: 1,
        explanation: 'Kinetic energy is the energy of motion: KE = ½mv²'
      },
      {
        id: 3,
        question: 'What is acceleration?',
        options: ['Rate of change of position', 'Rate of change of velocity', 'Rate of change of force', 'Rate of change of energy'],
        correctAnswer: 1,
        explanation: 'Acceleration is the rate of change of velocity with respect to time'
      },
      {
        id: 4,
        question: 'What is the difference between mass and weight?',
        options: ['No difference', 'Mass is heavier than weight', 'Mass is constant, weight depends on gravity', 'Weight is constant, mass depends on gravity'],
        correctAnswer: 2,
        explanation: 'Mass is the amount of matter (constant), while weight is the gravitational force acting on that mass'
      },
      {
        id: 5,
        question: 'What is the acceleration due to gravity on Earth?',
        options: ['9.8 m/s²', '10 m/s²', '8.9 m/s²', '9.8 m/s'],
        correctAnswer: 0,
        explanation: 'The acceleration due to gravity on Earth is approximately 9.8 m/s²'
      }
    ]
  },
  'Photosynthesis': {
    title: 'Photosynthesis Quiz',
    description: 'Understand how plants convert light into energy',
    timeLimit: 15,
    questions: [
      {
        id: 1,
        question: 'What is the overall equation for photosynthesis?',
        options: ['6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂', 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP', 'CO₂ + H₂O → glucose', 'Light + water → oxygen'],
        correctAnswer: 0,
        explanation: 'The complete photosynthesis equation shows reactants (CO₂ + H₂O + light energy) producing glucose and oxygen'
      },
      {
        id: 2,
        question: 'Where do the light reactions occur?',
        options: ['Stroma', 'Thylakoid membranes', 'Cell wall', 'Nucleus'],
        correctAnswer: 1,
        explanation: 'Light reactions occur in the thylakoid membranes of chloroplasts'
      },
      {
        id: 3,
        question: 'What is produced in the Calvin cycle?',
        options: ['Oxygen', 'Water', 'Glucose', 'Light energy'],
        correctAnswer: 2,
        explanation: 'The Calvin cycle (dark reactions) produces glucose using CO₂ and energy from light reactions'
      },
      {
        id: 4,
        question: 'What pigment is primarily responsible for photosynthesis?',
        options: ['Chlorophyll a', 'Chlorophyll b', 'Carotenoids', 'Anthocyanins'],
        correctAnswer: 0,
        explanation: 'Chlorophyll a is the primary pigment that captures light energy for photosynthesis'
      },
      {
        id: 5,
        question: 'Which factor does NOT directly affect photosynthesis rate?',
        options: ['Light intensity', 'CO₂ concentration', 'Temperature', 'Soil pH'],
        correctAnswer: 3,
        explanation: 'While soil pH affects plant health, it doesn\'t directly impact the rate of photosynthesis like light, CO₂, and temperature do'
      }
    ]
  },
  'Poetry Analysis': {
    title: 'Literature & Poetry Quiz',
    description: 'Test your understanding of literary analysis and poetry',
    timeLimit: 20,
    questions: [
      {
        id: 1,
        question: 'What is the difference between a metaphor and a simile?',
        options: ['No difference', 'Metaphors use "like" or "as", similes don\'t', 'Similes use "like" or "as", metaphors don\'t', 'Metaphors are longer than similes'],
        correctAnswer: 2,
        explanation: 'Similes make comparisons using "like" or "as" (e.g., "brave as a lion"), while metaphors make direct comparisons without these words (e.g., "he is a lion")'
      },
      {
        id: 2,
        question: 'How many lines does a traditional sonnet have?',
        options: ['12', '14', '16', '18'],
        correctAnswer: 1,
        explanation: 'A sonnet is a 14-line poem with specific rhyme schemes, popularized by Shakespeare and Petrarch'
      },
      {
        id: 3,
        question: 'What is iambic pentameter?',
        options: ['5 stressed syllables per line', '10 syllables with unstressed-stressed pattern', '5 rhyming words per line', '10 lines per stanza'],
        correctAnswer: 1,
        explanation: 'Iambic pentameter has 10 syllables per line in an unstressed-stressed pattern, creating 5 iambic feet'
      },
      {
        id: 4,
        question: 'What literary device gives human characteristics to non-human things?',
        options: ['Metaphor', 'Alliteration', 'Personification', 'Symbolism'],
        correctAnswer: 2,
        explanation: 'Personification attributes human qualities to non-human entities, like "the wind whispered"'
      }
    ]
  },
  'World War I': {
    title: 'World War I History Quiz',
    description: 'Test your knowledge of the Great War',
    timeLimit: 18,
    questions: [
      {
        id: 1,
        question: 'What event is considered the immediate trigger of World War I?',
        options: ['Sinking of Lusitania', 'German invasion of Belgium', 'Assassination of Archduke Franz Ferdinand', 'Russian Revolution'],
        correctAnswer: 2,
        explanation: 'The assassination of Archduke Franz Ferdinand of Austria-Hungary in Sarajevo on June 28, 1914, triggered the war'
      },
      {
        id: 2,
        question: 'What were the MAIN causes of WWI?',
        options: ['Militarism, Alliances, Imperialism, Nationalism', 'Money, Arms, Industry, Nations', 'Monarchy, Artillery, Infantry, Navy', 'Markets, Agriculture, Immigration, Navy'],
        correctAnswer: 0,
        explanation: 'MAIN stands for Militarism, Alliances, Imperialism, and Nationalism - the four main underlying causes of WWI'
      },
      {
        id: 3,
        question: 'What characterized trench warfare?',
        options: ['Quick decisive battles', 'Stalemate and high casualties', 'Naval supremacy', 'Aerial combat'],
        correctAnswer: 1,
        explanation: 'Trench warfare led to stalemate on the Western Front, with high casualties for minimal territorial gains'
      },
      {
        id: 4,
        question: 'When did World War I end?',
        options: ['November 11, 1917', 'November 11, 1918', 'December 25, 1918', 'January 1, 1919'],
        correctAnswer: 1,
        explanation: 'The armistice was signed on November 11, 1918, at 11 AM, ending the fighting in WWI'
      }
    ]
  },
  'Physical Geography': {
    title: 'Physical Geography Quiz',
    description: 'Test your knowledge of Earth\'s physical features and processes',
    timeLimit: 16,
    questions: [
      {
        id: 1,
        question: 'What theory explains continental drift?',
        options: ['Plate tectonics', 'Rock cycle', 'Water cycle', 'Climate theory'],
        correctAnswer: 0,
        explanation: 'Plate tectonics theory explains how Earth\'s lithosphere moves, causing continental drift, earthquakes, and volcanism'
      },
      {
        id: 2,
        question: 'What are the three main types of rocks?',
        options: ['Hard, soft, medium', 'Igneous, sedimentary, metamorphic', 'Old, new, recycled', 'Surface, underground, underwater'],
        correctAnswer: 1,
        explanation: 'The three rock types are igneous (from magma), sedimentary (from layers), and metamorphic (changed by heat/pressure)'
      },
      {
        id: 3,
        question: 'What primarily determines climate zones?',
        options: ['Ocean currents', 'Mountain ranges', 'Latitude', 'Vegetation'],
        correctAnswer: 2,
        explanation: 'Latitude (distance from equator) primarily determines climate by affecting the angle and intensity of solar radiation'
      },
      {
        id: 4,
        question: 'What is the difference between weathering and erosion?',
        options: ['No difference', 'Weathering breaks down rock, erosion moves it', 'Erosion breaks down rock, weathering moves it', 'Weathering is faster than erosion'],
        correctAnswer: 1,
        explanation: 'Weathering breaks down rocks in place, while erosion transports the weathered material to new locations'
      }
    ]
  },
  'Supply and Demand': {
    title: 'Economics: Supply & Demand Quiz',
    description: 'Test your understanding of market forces',
    timeLimit: 15,
    questions: [
      {
        id: 1,
        question: 'According to the law of demand, what happens when price increases?',
        options: ['Quantity demanded increases', 'Quantity demanded decreases', 'Demand increases', 'Supply decreases'],
        correctAnswer: 1,
        explanation: 'The law of demand states that as price increases, quantity demanded decreases, all else being equal'
      },
      {
        id: 2,
        question: 'What is market equilibrium?',
        options: ['When supply equals zero', 'When demand equals zero', 'When quantity supplied equals quantity demanded', 'When prices are fixed'],
        correctAnswer: 2,
        explanation: 'Market equilibrium occurs where quantity supplied equals quantity demanded, determining the market price'
      },
      {
        id: 3,
        question: 'What does elastic demand mean?',
        options: ['Demand changes little with price changes', 'Demand changes significantly with price changes', 'Demand never changes', 'Demand is unpredictable'],
        correctAnswer: 1,
        explanation: 'Elastic demand means consumers are very responsive to price changes, causing large changes in quantity demanded'
      },
      {
        id: 4,
        question: 'What shifts the demand curve to the right?',
        options: ['Decrease in consumer income', 'Increase in price', 'Increase in consumer income', 'Decrease in population'],
        correctAnswer: 2,
        explanation: 'An increase in consumer income typically shifts the demand curve right, increasing demand at all price levels'
      }
    ]
  },
  'Programming Basics': {
    title: 'Computer Science Fundamentals Quiz',
    description: 'Test your basic programming knowledge',
    timeLimit: 17,
    questions: [
      {
        id: 1,
        question: 'What is the difference between = and == in programming?',
        options: ['No difference', '= assigns, == compares', '= compares, == assigns', 'Both assign values'],
        correctAnswer: 1,
        explanation: '= is the assignment operator (assigns values), while == is the comparison operator (checks equality)'
      },
      {
        id: 2,
        question: 'What is a loop in programming?',
        options: ['A bug in code', 'A repeated block of code', 'A type of variable', 'A programming language'],
        correctAnswer: 1,
        explanation: 'A loop is a programming construct that repeats a block of code multiple times based on conditions'
      },
      {
        id: 3,
        question: 'What are the main data types in most programming languages?',
        options: ['Big, small, medium', 'Integer, string, boolean, float', 'Fast, slow, normal', 'Input, output, process'],
        correctAnswer: 1,
        explanation: 'Common data types include integer (whole numbers), string (text), boolean (true/false), and float (decimals)'
      },
      {
        id: 4,
        question: 'What is debugging?',
        options: ['Writing new code', 'Deleting code', 'Finding and fixing errors', 'Running code'],
        correctAnswer: 2,
        explanation: 'Debugging is the process of finding, analyzing, and fixing bugs (errors) in computer programs'
      }
    ]
  },
  'Cognitive Psychology': {
    title: 'Psychology: Cognitive Processes Quiz',
    description: 'Test your knowledge of how the mind works',
    timeLimit: 19,
    questions: [
      {
        id: 1,
        question: 'What is working memory?',
        options: ['Long-term storage of memories', 'Temporary storage and processing system', 'Muscle memory', 'Subconscious memory'],
        correctAnswer: 1,
        explanation: 'Working memory temporarily holds and manipulates information for cognitive tasks, with limited capacity (~7±2 items)'
      },
      {
        id: 2,
        question: 'What is selective attention?',
        options: ['Paying attention to everything', 'Focusing on specific information while filtering distractions', 'Short attention span', 'Inability to focus'],
        correctAnswer: 1,
        explanation: 'Selective attention is the ability to focus on relevant information while ignoring irrelevant stimuli'
      },
      {
        id: 3,
        question: 'What is the difference between recognition and recall?',
        options: ['No difference', 'Recognition identifies, recall retrieves from memory', 'Recall identifies, recognition retrieves', 'Both are the same process'],
        correctAnswer: 1,
        explanation: 'Recognition involves identifying previously learned information when presented; recall involves retrieving information from memory without cues'
      },
      {
        id: 4,
        question: 'What are schemas in psychology?',
        options: ['Memory disorders', 'Mental frameworks for organizing knowledge', 'Types of therapy', 'Brain structures'],
        correctAnswer: 1,
        explanation: 'Schemas are cognitive frameworks that help organize and interpret information based on prior knowledge and experience'
      }
    ]
  }
};

export default AIQuizGenerator;