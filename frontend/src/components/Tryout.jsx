import React, { useState, useMemo } from 'react';
import { BookOpen, Check, X, Brain, ArrowLeft, ArrowRight, RefreshCw, Award, Sparkles } from 'lucide-react';
import { questionPaper } from './questionPaper.js';
import { addPoints, hasAward, markAwarded } from '../utils/points';

const QuizQuestion = ({ question, questionIndex, totalQuestions, userAnswer, onAnswer, onNext, onPrev }) => {
  const isMCQ = Array.isArray(question.o);

  return (
    <div className="p-6">
      <p className="text-sm text-gray-500 mb-2">Question {questionIndex + 1} of {totalQuestions}</p>
      <p className="text-lg font-semibold text-gray-800 mb-6">{question.q}</p>

      {isMCQ ? (
        <div className="space-y-3">
          {question.o.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswer(option)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                userAnswer === option
                  ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-200'
                  : 'bg-white border-gray-200 hover:border-blue-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <input
          type="text"
          value={userAnswer || ''}
          onChange={(e) => onAnswer(e.target.value)}
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Type your answer here..."
        />
      )}

      <div className="flex justify-between mt-8">
        <button onClick={onPrev} disabled={questionIndex === 0} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2">
          <ArrowLeft size={16} /> Prev
        </button>
        <button onClick={onNext} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
          {questionIndex === totalQuestions - 1 ? 'Finish' : 'Next'} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

const QuizResults = ({ questions, userAnswers, onTryAgain }) => {
  const score = useMemo(() => {
    return userAnswers.reduce((correct, answer, index) => {
      return answer === questions[index].a ? correct + 1 : correct;
    }, 0);
  }, [questions, userAnswers]);

  const percentage = (score / questions.length) * 100;

  useEffect(() => {
    if (percentage >= 80) {
      const awardKey = `tryout_high_score_${new Date().toISOString().slice(0, 10)}`;
      if (!hasAward(awardKey)) {
        addPoints(10);
        markAwarded(awardKey);
        toast.success('High score! +10 points!');
      }
    }
  }, [percentage]);

  return (
    <div className="p-6 text-center">
      <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-800">Tryout Complete!</h2>
      <p className="text-gray-600 mt-2">You scored</p>
      <p className="text-5xl font-bold text-blue-600 my-4">{score} / {questions.length}</p>
      <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
        <div
          className="bg-blue-600 h-4 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="space-y-4 text-left max-h-80 overflow-y-auto p-4 bg-gray-50 rounded-lg">
        {questions.map((q, i) => {
          const isCorrect = userAnswers[i] === q.a;
          return (
            <div key={i} className={`p-3 rounded-lg border-l-4 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <p className="font-semibold text-gray-700">{i + 1}. {q.q}</p>
              <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                Your answer: {userAnswers[i] || 'No answer'} {isCorrect ? <Check className="inline w-4 h-4" /> : <X className="inline w-4 h-4" />}
              </p>
              {!isCorrect && <p className="text-sm text-green-700">Correct answer: {q.a}</p>}
              <p className="text-xs text-gray-500 mt-1">Explanation: {q.e}</p>
            </div>
          );
        })}
      </div>

      <button onClick={onTryAgain} className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto">
        <RefreshCw size={16} /> Try Again
      </button>
    </div>
  );
};

const Tryout = () => {
  const [quizState, setQuizState] = useState('selection'); // 'selection', 'active', 'finished'
  const [selectedGrade, setSelectedGrade] = useState('4');
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [selectedType, setSelectedType] = useState('mcq');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);

  const handleTryoutComplete = () => {
    const awardKey = `tryout_${selectedGrade}_${selectedSubject}_${selectedType}`;
    if (!hasAward(awardKey)) {
      addPoints(5);
      markAwarded(awardKey);
      toast.success('Tryout complete! +5 points!');
    }
  };

  const startQuiz = () => {
    const selectedQuestions = questionPaper[selectedGrade]?.[selectedSubject]?.[selectedType] || [];
    if (selectedQuestions.length > 0) {
      setQuestions(selectedQuestions);
      setUserAnswers(new Array(selectedQuestions.length).fill(null));
      setCurrentQuestion(0);
      setQuizState('active');
    } else {
      alert('No questions available for this selection.');
    }
  };

  const handleAnswer = (answer) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answer;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizState('finished');
      handleTryoutComplete();
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleTryAgain = () => {
    setQuizState('selection');
    setQuestions([]);
    setCurrentQuestion(0);
    setUserAnswers([]);
  };

  const availableSubjects = useMemo(() => {
    return Object.keys(questionPaper[selectedGrade] || {});
  }, [selectedGrade]);

  useEffect(() => {
    if (!availableSubjects.includes(selectedSubject)) {
      setSelectedSubject(availableSubjects[0] || '');
    }
  }, [selectedGrade, availableSubjects, selectedSubject]);

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-3"><Brain className="w-8 h-8" /> Tryouts & Practice</h1>
          <p className="text-blue-100 mt-1">Test your knowledge with interactive quizzes.</p>
        </div>

        {quizState === 'selection' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg">
                  {Object.keys(questionPaper).map(grade => <option key={grade} value={grade}>Grade {grade}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg">
                  {availableSubjects.map(subject => <option key={subject} value={subject}>{subject.charAt(0).toUpperCase() + subject.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg">
                  <option value="mcq">Multiple Choice</option>
                  <option value="blank">Fill in the Blanks</option>
                </select>
              </div>
            </div>
            <button onClick={startQuiz} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
              <Sparkles size={18} /> Start Tryout
            </button>
          </div>
        )}

        {quizState === 'active' && (
          <QuizQuestion
            question={questions[currentQuestion]}
            questionIndex={currentQuestion}
            totalQuestions={questions.length}
            userAnswer={userAnswers[currentQuestion]}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )}

        {quizState === 'finished' && (
          <QuizResults
            questions={questions}
            userAnswers={userAnswers}
            onTryAgain={handleTryAgain}
          />
        )}
      </div>
    </div>
  );
};

export default Tryout;