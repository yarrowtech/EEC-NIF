import React, { useState } from 'react';
import {
  Bot,
  Brain,
  BookOpen,
  Calculator,
  Target,
  Lightbulb,
  FileText,
  Image,
  Mic,
  Search,
  Clock,
  Award,
  TrendingUp,
  Users,
  MessageSquare,
  Zap,
  Star,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

const AIStudyDashboard = () => {
  const [activeSession, setActiveSession] = useState(null);
  const [studyStats, setStudyStats] = useState({
    problemsSolved: 247,
    conceptsLearned: 89,
    studyStreak: 15,
    totalHours: 142
  });

  const quickActions = [
    {
      id: 'solve-problem',
      title: 'Solve Problem',
      description: 'Get step-by-step solutions',
      icon: Calculator,
      color: 'bg-blue-500',
      action: 'problem-solver'
    },
    {
      id: 'explain-concept',
      title: 'Explain Concept',
      description: 'Understand difficult topics',
      icon: Lightbulb,
      color: 'bg-yellow-500',
      action: 'concept-explainer'
    },
    {
      id: 'practice-quiz',
      title: 'Practice Quiz',
      description: 'Test your knowledge',
      icon: Target,
      color: 'bg-green-500',
      action: 'quiz-generator'
    },
    {
      id: 'study-plan',
      title: 'Study Plan',
      description: 'Personalized learning path',
      icon: Brain,
      color: 'bg-purple-500',
      action: 'study-planner'
    }
  ];

  const recentSessions = [
    {
      id: 1,
      subject: 'Mathematics',
      topic: 'Calculus - Derivatives',
      duration: '45 min',
      problemsSolved: 8,
      timestamp: '2 hours ago',
      confidence: 92,
      status: 'completed'
    },
    {
      id: 2,
      subject: 'Physics',
      topic: 'Mechanics - Motion',
      duration: '32 min',
      problemsSolved: 5,
      timestamp: '1 day ago',
      confidence: 87,
      status: 'completed'
    },
    {
      id: 3,
      subject: 'Chemistry',
      topic: 'Organic Chemistry',
      duration: '28 min',
      problemsSolved: 6,
      timestamp: '2 days ago',
      confidence: 94,
      status: 'completed'
    }
  ];

  const availableTextbooks = [
    {
      id: 'ncert-math-12',
      title: 'NCERT Mathematics Class 12',
      subject: 'Mathematics',
      chapters: 13,
      progress: 78,
      lastAccessed: '2 hours ago',
      cover: 'bg-blue-100',
      color: 'text-blue-600'
    },
    {
      id: 'ncert-physics-12',
      title: 'NCERT Physics Class 12',
      subject: 'Physics',
      chapters: 15,
      progress: 65,
      lastAccessed: '1 day ago',
      cover: 'bg-purple-100',
      color: 'text-purple-600'
    },
    {
      id: 'ncert-chemistry-12',
      title: 'NCERT Chemistry Class 12',
      subject: 'Chemistry',
      chapters: 16,
      progress: 45,
      lastAccessed: '3 days ago',
      cover: 'bg-green-100',
      color: 'text-green-600'
    },
    {
      id: 'ncert-biology-12',
      title: 'NCERT Biology Class 12',
      subject: 'Biology',
      chapters: 16,
      progress: 32,
      lastAccessed: '5 days ago',
      cover: 'bg-emerald-100',
      color: 'text-emerald-600'
    }
  ];

  const studyRecommendations = [
    {
      id: 1,
      type: 'weakness',
      title: 'Focus on Integration',
      description: 'You\'ve been struggling with integration problems. Let\'s practice more!',
      action: 'Start Practice',
      icon: AlertCircle,
      color: 'bg-orange-100 text-orange-600 border-orange-200'
    },
    {
      id: 2,
      type: 'strength',
      title: 'Great at Differentiation!',
      description: 'You\'re doing excellent with derivatives. Keep it up!',
      action: 'Advanced Topics',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600 border-green-200'
    },
    {
      id: 3,
      type: 'reminder',
      title: 'Review Periodic Table',
      description: 'It\'s been a while since you studied chemistry fundamentals.',
      action: 'Quick Review',
      icon: Clock,
      color: 'bg-blue-100 text-blue-600 border-blue-200'
    }
  ];

  const handleQuickAction = (action) => {
    // This would integrate with the main application routing/state
    console.log('Quick action:', action);
    setActiveSession({ action, startTime: Date.now() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">AI Study Center</h1>
                <p className="text-gray-600">Your intelligent learning companion</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">{studyStats.studyStreak}</div>
                <div className="text-sm text-gray-600">Day Streak 🔥</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">{studyStats.problemsSolved}</div>
                  <div className="text-sm text-blue-600">Problems Solved</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700">{studyStats.conceptsLearned}</div>
                  <div className="text-sm text-green-600">Concepts Learned</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-700">{studyStats.totalHours}</div>
                  <div className="text-sm text-purple-600">Study Hours</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-700">4.8</div>
                  <div className="text-sm text-yellow-600">AI Confidence</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map(action => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.action)}
                className="p-6 rounded-xl border-2 border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-200 group text-left"
              >
                <div className={`h-12 w-12 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Textbooks */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              My Textbooks
            </h2>
            <div className="space-y-4">
              {availableTextbooks.map(book => (
                <div key={book.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className={`h-12 w-12 ${book.cover} rounded-lg flex items-center justify-center`}>
                    <BookOpen className={`h-6 w-6 ${book.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{book.title}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-600">{book.chapters} chapters</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-600">Last: {book.lastAccessed}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500`}
                          style={{ width: `${book.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{book.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              Recent Sessions
            </h2>
            <div className="space-y-4">
              {recentSessions.map(session => (
                <div key={session.id} className="p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-800">{session.subject}</h3>
                      <p className="text-sm text-gray-600">{session.topic}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      session.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">
                        <Clock className="h-4 w-4 inline mr-1" />
                        {session.duration}
                      </span>
                      <span className="text-gray-600">
                        <Target className="h-4 w-4 inline mr-1" />
                        {session.problemsSolved} problems
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Confidence:</span>
                      <span className="font-semibold text-indigo-600">{session.confidence}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Study Recommendations */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {studyRecommendations.map(rec => (
              <div key={rec.id} className={`p-6 rounded-xl border-2 ${rec.color}`}>
                <div className="flex items-start gap-3">
                  <rec.icon className="h-5 w-5 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{rec.title}</h3>
                    <p className="text-sm mb-4 opacity-80">{rec.description}</p>
                    <button className="text-sm font-medium hover:underline">
                      {rec.action} →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Session Indicator */}
        {activeSession && (
          <div className="fixed bottom-6 left-6 bg-white rounded-xl shadow-2xl border border-indigo-200 p-4 flex items-center gap-3 min-w-64">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="font-medium text-gray-800">AI Session Active</div>
              <div className="text-sm text-gray-600">
                {Math.floor((Date.now() - activeSession.startTime) / 60000)} minutes
              </div>
            </div>
            <button
              onClick={() => setActiveSession(null)}
              className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
            >
              <Pause className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIStudyDashboard;