import React, { useState } from 'react';
import {
  Brain,
  BookOpen,
  Users,
  Target,
  TrendingUp,
  Clock,
  Award,
  Lightbulb,
  BarChart3,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Star,
  Zap,
  CheckCircle,
  AlertCircle,
  Globe,
  PenTool,
  FileText,
  MessageSquare,
  Bot,
  Settings,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Copy,
  Shuffle
} from 'lucide-react';

const AIPoweredTeaching = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [teachingStats] = useState({
    studentsHelped: 156,
    quizzesCreated: 43,
    flashcardsCreated: 67,
    averageEngagement: 94
  });

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'quiz-creator', name: 'Quiz Creator', icon: Target },
    { id: 'content-summarizer', name: 'Content Summarizer', icon: PenTool },
    { id: 'flashcard-generator', name: 'Flashcard Generator', icon: Star },
    { id: 'tryout-generator', name: 'Tryout Generator', icon: FileText },
    { id: 'student-analyzer', name: 'Student Analyzer', icon: Users },
    { id: 'teaching-assistant', name: 'AI Assistant', icon: Bot }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'quiz-creator':
        return <QuizCreator />;
      case 'content-summarizer':
        return <ContentSummarizer />;
      case 'flashcard-generator':
        return <FlashcardGenerator />;
      case 'tryout-generator':
        return <TryoutGenerator />;
      case 'student-analyzer':
        return <StudentAnalyzer />;
      case 'teaching-assistant':
        return <TeachingAssistant />;
      default:
        return <TeachingDashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">AI Powered Teaching</h1>
                <p className="text-gray-600">Intelligent tools to enhance your teaching experience</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">{teachingStats.averageEngagement}%</div>
                <div className="text-sm text-gray-600">Student Engagement 📈</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">{teachingStats.studentsHelped}</div>
                  <div className="text-sm text-blue-600">Students Helped</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700">{teachingStats.flashcardsCreated}</div>
                  <div className="text-sm text-green-600">Flashcards Created</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-700">{teachingStats.quizzesCreated}</div>
                  <div className="text-sm text-purple-600">Quizzes Created</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-700">4.9</div>
                  <div className="text-sm text-yellow-600">AI Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const TeachingDashboard = ({ onNavigate }) => {
  const quickActions = [
    {
      title: 'Create Smart Quiz',
      description: 'Generate adaptive quizzes',
      icon: Target,
      color: 'bg-green-500',
      action: 'quiz-creator'
    },
    {
      title: 'Generate Flashcards',
      description: 'Interactive learning flashcards',
      icon: Star,
      color: 'bg-yellow-500',
      action: 'flashcard-generator'
    },
    {
      title: 'Create Tryouts',
      description: 'Multi-format assessment tests',
      icon: FileText,
      color: 'bg-indigo-500',
      action: 'tryout-generator'
    },
    {
      title: 'Summarize Content',
      description: 'AI-powered content summaries',
      icon: PenTool,
      color: 'bg-purple-500',
      action: 'content-summarizer'
    },
    {
      title: 'Analyze Students',
      description: 'Get insights on student performance',
      icon: Users,
      color: 'bg-orange-500',
      action: 'student-analyzer'
    }
  ];

  const recentGenerations = [
    {
      type: 'summary',
      title: 'Quadratic Equations - Key Concepts',
      subject: 'Mathematics',
      timestamp: '2 hours ago',
      status: 'completed'
    },
    {
      type: 'flashcards',
      title: 'Chemistry Periodic Table Cards',
      subject: 'Chemistry',
      timestamp: '4 hours ago',
      status: 'completed'
    },
    {
      type: 'tryout',
      title: 'History World War I Assessment',
      subject: 'History',
      timestamp: '6 hours ago',
      status: 'completed'
    },
    {
      type: 'quiz',
      title: 'Physics Motion Quiz',
      subject: 'Physics',
      timestamp: '1 day ago',
      status: 'completed'
    },
    {
      type: 'summary',
      title: 'Cell Biology Overview',
      subject: 'Biology',
      timestamp: '2 days ago',
      status: 'completed'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => onNavigate && onNavigate(action.action)}
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

      {/* Recent Generations */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-green-500" />
          Recent AI Generations
        </h2>
        <div className="space-y-3">
          {recentGenerations.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  {item.type === 'quiz' && <Target className="h-5 w-5 text-indigo-600" />}
                  {item.type === 'flashcards' && <Star className="h-5 w-5 text-indigo-600" />}
                  {item.type === 'tryout' && <FileText className="h-5 w-5 text-indigo-600" />}
                  {item.type === 'summary' && <PenTool className="h-5 w-5 text-indigo-600" />}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.subject} • {item.timestamp}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {item.status}
                </span>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Eye className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const QuizCreator = () => {
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    grade: '',
    questionCount: '10',
    difficulty: 'medium',
    questionTypes: ['multiple-choice'],
    timeLimit: '30'
  });
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [loading, setLoading] = useState(false);


  const handleGenerateQuiz = async () => {
    if (!formData.subject || !formData.topic) return;
    
    setLoading(true);
    setTimeout(() => {
      const mockQuiz = {
        title: `${formData.topic} Quiz - Grade ${formData.grade}`,
        subject: formData.subject,
        difficulty: formData.difficulty,
        timeLimit: formData.timeLimit,
        questions: Array.from({ length: parseInt(formData.questionCount) }, (_, i) => ({
          id: i + 1,
          question: `Sample question ${i + 1} about ${formData.topic}`,
          type: formData.questionTypes[0],
          options: formData.questionTypes[0] === 'multiple-choice' ? [
            'Option A',
            'Option B', 
            'Option C',
            'Option D'
          ] : null,
          correct: formData.questionTypes[0] === 'multiple-choice' ? 0 : 'Sample answer',
          explanation: 'This is the explanation for the correct answer.'
        }))
      };
      setGeneratedQuiz(mockQuiz);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-6 w-6 text-green-500" />
        <h2 className="text-2xl font-bold text-gray-800">AI Quiz Creator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz Configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Subject</option>
              <option value="mathematics">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="biology">Biology</option>
              <option value="english">English</option>
              <option value="history">History</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
              placeholder="Enter the quiz topic"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({...formData, grade: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Grade</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>Grade {i + 1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
              <select
                value={formData.questionCount}
                onChange={(e) => setFormData({...formData, questionCount: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="5">5 Questions</option>
                <option value="10">10 Questions</option>
                <option value="15">15 Questions</option>
                <option value="20">20 Questions</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)</label>
            <input
              type="number"
              value={formData.timeLimit}
              onChange={(e) => setFormData({...formData, timeLimit: e.target.value})}
              min="5"
              max="120"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            onClick={handleGenerateQuiz}
            disabled={loading || !formData.subject || !formData.topic}
            className="w-full py-3 px-6 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating Quiz...
              </>
            ) : (
              <>
                <Target className="h-4 w-4" />
                Generate Quiz
              </>
            )}
          </button>
        </div>

        {/* Generated Quiz Preview */}
        <div>
          {generatedQuiz ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{generatedQuiz.title}</h3>
                  <p className="text-gray-600">{generatedQuiz.questions.length} questions • {generatedQuiz.timeLimit} minutes</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Quiz Settings</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Subject:</span> {generatedQuiz.subject}
                  </div>
                  <div>
                    <span className="text-green-700">Difficulty:</span> {generatedQuiz.difficulty}
                  </div>
                  <div>
                    <span className="text-green-700">Time Limit:</span> {generatedQuiz.timeLimit} min
                  </div>
                  <div>
                    <span className="text-green-700">Questions:</span> {generatedQuiz.questions.length}
                  </div>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                <h4 className="font-semibold text-gray-800">Preview Questions</h4>
                {generatedQuiz.questions.slice(0, 3).map((question, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2">
                      Question {question.id}: {question.question}
                    </h5>
                    {question.options && (
                      <div className="space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className={`text-sm p-2 rounded ${optIndex === question.correct ? 'bg-green-100 text-green-800' : 'text-gray-600'}`}>
                            {String.fromCharCode(65 + optIndex)}. {option}
                            {optIndex === question.correct && <CheckCircle className="h-4 w-4 inline ml-2" />}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2 italic">{question.explanation}</p>
                  </div>
                ))}
                {generatedQuiz.questions.length > 3 && (
                  <p className="text-center text-gray-500 text-sm">
                    +{generatedQuiz.questions.length - 3} more questions...
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure your quiz settings to generate questions</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ContentSummarizer = () => {
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    grade: '',
    summaryType: 'overview',
    length: 'medium',
    inputText: ''
  });
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const summaryTypes = [
    { value: 'overview', label: 'Topic Overview', description: 'General introduction to the topic' },
    { value: 'key-points', label: 'Key Points', description: 'Main concepts and important details' },
    { value: 'study-guide', label: 'Study Guide', description: 'Structured learning material' },
    { value: 'revision', label: 'Revision Notes', description: 'Quick review material' }
  ];

  const lengthOptions = [
    { value: 'short', label: 'Short', description: '1-2 paragraphs' },
    { value: 'medium', label: 'Medium', description: '3-4 paragraphs' },
    { value: 'detailed', label: 'Detailed', description: '5+ paragraphs' }
  ];

  const handleGenerateSummary = async () => {
    if (!formData.topic) return;
    
    setLoading(true);
    setTimeout(() => {
      const mockSummary = `# ${formData.topic} Summary

## Overview
This is an AI-generated summary of ${formData.topic} in ${formData.subject} for Grade ${formData.grade} students.

## Key Concepts
• Important concept 1: Detailed explanation of the first key concept
• Important concept 2: Detailed explanation of the second key concept  
• Important concept 3: Detailed explanation of the third key concept

## Examples
Real-world applications and examples that help students understand the topic better.

## Important Points to Remember
- Critical point 1
- Critical point 2
- Critical point 3

## Practice Questions
1. Sample question about the topic
2. Another practice question
3. Advanced application question

This summary has been optimized for ${formData.length} reading and covers the essential points students need to understand about ${formData.topic}.`;
      
      setGeneratedSummary(mockSummary);
      setLoading(false);
    }, 2000);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSummary = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedSummary], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${formData.topic}_summary.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <PenTool className="h-6 w-6 text-purple-500" />
        <h2 className="text-2xl font-bold text-gray-800">Content Summarizer</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary Configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Subject</option>
              <option value="mathematics">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="biology">Biology</option>
              <option value="english">English</option>
              <option value="history">History</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
              placeholder="Enter the topic to summarize"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
            <select
              value={formData.grade}
              onChange={(e) => setFormData({...formData, grade: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Grade</option>
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>Grade {i + 1}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Summary Type</label>
            <div className="space-y-2">
              {summaryTypes.map(type => (
                <label key={type.value} className="flex items-center">
                  <input
                    type="radio"
                    value={type.value}
                    checked={formData.summaryType === type.value}
                    onChange={(e) => setFormData({...formData, summaryType: e.target.value})}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Summary Length</label>
            <select
              value={formData.length}
              onChange={(e) => setFormData({...formData, length: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {lengthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Context (Optional)</label>
            <textarea
              value={formData.inputText}
              onChange={(e) => setFormData({...formData, inputText: e.target.value})}
              placeholder="Paste content to summarize or provide additional context..."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={handleGenerateSummary}
            disabled={loading || !formData.topic}
            className="w-full py-3 px-6 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating Summary...
              </>
            ) : (
              <>
                <PenTool className="h-4 w-4" />
                Generate Summary
              </>
            )}
          </button>
        </div>

        {/* Generated Summary */}
        <div>
          {generatedSummary ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Generated Summary</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded flex items-center gap-1"
                  >
                    {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <FileText className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={downloadSummary}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-purple-700 font-medium">Type:</span> {summaryTypes.find(t => t.value === formData.summaryType)?.label}
                  </div>
                  <div>
                    <span className="text-purple-700 font-medium">Length:</span> {formData.length}
                  </div>
                  <div>
                    <span className="text-purple-700 font-medium">Subject:</span> {formData.subject}
                  </div>
                  <div>
                    <span className="text-purple-700 font-medium">Grade:</span> {formData.grade}
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">
                  {generatedSummary}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <PenTool className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure your settings to generate a summary</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StudentAnalyzer = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [analysisType, setAnalysisType] = useState('performance');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPersonalizedContent, setShowPersonalizedContent] = useState(false);
  const [contentType, setContentType] = useState('flashcards');
  const [generatingContent, setGeneratingContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  const classes = ['Grade 9A', 'Grade 9B', 'Grade 10A', 'Grade 10B', 'Grade 11A', 'Grade 11B'];
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'];

  const analysisTypes = [
    { value: 'performance', label: 'Performance Analysis', description: 'Overall academic performance insights' },
    { value: 'engagement', label: 'Engagement Patterns', description: 'Student participation and engagement levels' },
    { value: 'learning-gaps', label: 'Learning Gaps', description: 'Identify knowledge gaps and weak areas' },
    { value: 'progress', label: 'Progress Tracking', description: 'Monitor student improvement over time' },
    { value: 'weak-students', label: 'Weak Student Identification', description: 'Identify students needing intervention' }
  ];

  const personalizedContentTypes = [
    { value: 'flashcards', label: 'Personalized Flashcards', icon: Star, description: 'Custom flashcards for weak areas' },
    { value: 'quiz', label: 'Targeted Quiz', icon: Target, description: 'Quiz focusing on problem areas' },
    { value: 'summary', label: 'Concept Summary', icon: PenTool, description: 'Simplified explanations of difficult topics' }
  ];

  const handleAnalyze = async () => {
    if (!selectedClass || !selectedSubject) return;
    
    setLoading(true);
    setTimeout(() => {
      let mockResults;
      
      if (analysisType === 'weak-students') {
        mockResults = {
          classOverview: {
            totalStudents: 28,
            averageScore: 78.5,
            improvementRate: '+12%',
            atRiskStudents: 4
          },
          weakStudents: [
            { 
              id: '1',
              name: 'Alex Thompson', 
              grade: selectedClass.split(' ')[1], 
              section: selectedClass.slice(-1),
              roll: 15,
              interventionLevel: 'critical',
              consistencyScore: 25,
              focusSubject: selectedSubject,
              weakAreas: ['Basic Concepts', 'Problem Solving', 'Consistency in Performance'],
              recommendedTopics: ['Number Systems', 'Basic Operations', 'Word Problems'],
              hasAIPath: false,
              lastAssessment: '2 days ago',
              averageScore: 45
            },
            { 
              id: '2',
              name: 'Sarah Wilson', 
              grade: selectedClass.split(' ')[1], 
              section: selectedClass.slice(-1),
              roll: 8,
              interventionLevel: 'high',
              consistencyScore: 45,
              focusSubject: selectedSubject,
              weakAreas: ['Conceptual Understanding', 'Formula Application'],
              recommendedTopics: ['Fundamentals', 'Practical Applications'],
              hasAIPath: true,
              lastAssessment: '1 day ago',
              averageScore: 52
            },
            { 
              id: '3',
              name: 'Mike Johnson', 
              grade: selectedClass.split(' ')[1], 
              section: selectedClass.slice(-1),
              roll: 22,
              interventionLevel: 'medium',
              consistencyScore: 55,
              focusSubject: selectedSubject,
              weakAreas: ['Advanced Topics', 'Time Management'],
              recommendedTopics: ['Practice Problems', 'Speed Techniques'],
              hasAIPath: false,
              lastAssessment: '3 days ago',
              averageScore: 58
            }
          ],
          interventionStats: {
            critical: 1,
            high: 1,
            medium: 2,
            withAIPath: 1
          },
          insights: [
            'Critical students need immediate intervention',
            '25% of at-risk students have personalized AI learning paths',
            'Focus on foundational concepts for critical-level students',
            'Regular monitoring recommended for high-priority students'
          ]
        };
      } else {
        mockResults = {
          classOverview: {
            totalStudents: 28,
            averageScore: 78.5,
            improvementRate: '+12%',
            atRiskStudents: 4
          },
          topPerformers: [
            { name: 'Alice Johnson', score: 95, improvement: '+8%' },
            { name: 'Bob Smith', score: 92, improvement: '+5%' },
            { name: 'Carol Davis', score: 89, improvement: '+12%' }
          ],
          strugglingStudents: [
            { name: 'David Wilson', score: 45, issues: ['Algebra concepts', 'Problem solving'], recommendation: 'Extra practice sessions' },
            { name: 'Emma Brown', score: 52, issues: ['Basic operations', 'Word problems'], recommendation: 'Peer tutoring' }
          ],
          insights: [
            'Class shows strong improvement in algebraic thinking',
            '15% of students need additional support with word problems',
            'Overall engagement has increased by 18% this semester'
          ]
        };
      }
      
      setAnalysisResults(mockResults);
      setLoading(false);
    }, 2000);
  };

  const generatePersonalizedContent = async (student, type) => {
    setGeneratingContent(true);
    setContentType(type);
    
    setTimeout(() => {
      let content;
      
      switch (type) {
        case 'flashcards':
          content = {
            type: 'flashcards',
            title: `Personalized Flashcards for ${student.name}`,
            description: `Targeting weak areas: ${student.weakAreas.join(', ')}`,
            cards: student.weakAreas.slice(0, 10).map((area, index) => ({
              id: index + 1,
              front: `What is the key concept in ${area}?`,
              back: `A personalized explanation of ${area} tailored for ${student.name}'s learning level.`,
              difficulty: student.interventionLevel
            }))
          };
          break;
        case 'quiz':
          content = {
            type: 'quiz',
            title: `Targeted Assessment for ${student.name}`,
            description: `Focused on improving: ${student.weakAreas.join(', ')}`,
            questions: student.weakAreas.slice(0, 8).map((area, index) => ({
              id: index + 1,
              question: `Question ${index + 1} about ${area}`,
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correct: 0,
              difficulty: student.interventionLevel
            }))
          };
          break;
        case 'summary':
          content = {
            type: 'summary',
            title: `Concept Summary for ${student.name}`,
            description: `Simplified explanations for: ${student.weakAreas.join(', ')}`,
            content: student.weakAreas.map(area => ({
              topic: area,
              summary: `A clear, simplified explanation of ${area} designed specifically for ${student.name}'s current understanding level.`,
              keyPoints: [
                `Key point 1 about ${area}`,
                `Key point 2 about ${area}`,
                `Key point 3 about ${area}`
              ]
            }))
          };
          break;
      }
      
      setGeneratedContent(content);
      setGeneratingContent(false);
    }, 2000);
  };

  const getInterventionColor = (level) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-blue-600 bg-blue-100 border-blue-200';
    }
  };

  const getInterventionIcon = (level) => {
    switch (level) {
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 w-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-6 w-6 text-orange-500" />
        <h2 className="text-2xl font-bold text-gray-800">Student Performance Analyzer</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analysis Configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Choose Class</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Choose Subject</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Analysis Type</label>
            <div className="space-y-2">
              {analysisTypes.map(type => (
                <label key={type.value} className="flex items-start">
                  <input
                    type="radio"
                    value={type.value}
                    checked={analysisType === type.value}
                    onChange={(e) => setAnalysisType(e.target.value)}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-gray-600">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !selectedClass || !selectedSubject}
            className="w-full py-3 px-6 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4" />
                Analyze Students
              </>
            )}
          </button>
        </div>

        {/* Analysis Results */}
        <div className="lg:col-span-2">
          {analysisResults ? (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{analysisResults.classOverview.totalStudents}</div>
                  <div className="text-sm text-blue-600">Total Students</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">{analysisResults.classOverview.averageScore}</div>
                  <div className="text-sm text-green-600">Average Score</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">{analysisResults.classOverview.improvementRate}</div>
                  <div className="text-sm text-purple-600">Improvement</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-700">{analysisResults.classOverview.atRiskStudents}</div>
                  <div className="text-sm text-orange-600">At Risk</div>
                </div>
              </div>

              {/* Weak Students Analysis (when analysisType is 'weak-students') */}
              {analysisType === 'weak-students' && analysisResults.weakStudents && (
                <>
                  {/* Intervention Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                      <div className="text-2xl font-bold text-red-700">{analysisResults.interventionStats.critical}</div>
                      <div className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Critical
                      </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <div className="text-2xl font-bold text-orange-700">{analysisResults.interventionStats.high}</div>
                      <div className="text-sm text-orange-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        High Priority
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                      <div className="text-2xl font-bold text-yellow-700">{analysisResults.interventionStats.medium}</div>
                      <div className="text-sm text-yellow-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Medium Priority
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <div className="text-2xl font-bold text-blue-700">{analysisResults.interventionStats.withAIPath}</div>
                      <div className="text-sm text-blue-600 flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        With AI Path
                      </div>
                    </div>
                  </div>

                  {/* Weak Students List */}
                  <div className="bg-white border rounded-lg">
                    <div className="p-4 border-b bg-red-50">
                      <h4 className="font-bold text-red-800 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Students Needing Intervention
                      </h4>
                    </div>
                    <div className="p-4 space-y-4">
                      {analysisResults.weakStudents.map((student) => (
                        <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white font-semibold text-sm">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-800">{student.name}</h5>
                                <p className="text-sm text-gray-500">Grade {student.grade}-{student.section} • Roll {student.roll}</p>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getInterventionColor(student.interventionLevel)}`}>
                              {getInterventionIcon(student.interventionLevel)}
                              <span className="capitalize">{student.interventionLevel}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                            <div className="bg-gray-50 rounded p-3">
                              <div className="text-xs text-gray-600">Consistency Score</div>
                              <div className="text-lg font-bold text-gray-800">{student.consistencyScore}%</div>
                            </div>
                            <div className="bg-gray-50 rounded p-3">
                              <div className="text-xs text-gray-600">Average Score</div>
                              <div className="text-lg font-bold text-gray-800">{student.averageScore}%</div>
                            </div>
                            <div className="bg-gray-50 rounded p-3">
                              <div className="text-xs text-gray-600">Last Assessment</div>
                              <div className="text-sm font-medium text-gray-800">{student.lastAssessment}</div>
                            </div>
                          </div>

                          {/* Weak Areas */}
                          <div className="mb-4">
                            <div className="text-sm font-medium text-gray-700 mb-2">Weak Areas:</div>
                            <div className="flex flex-wrap gap-2">
                              {student.weakAreas.map((area, index) => (
                                <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowPersonalizedContent(true);
                              }}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors flex items-center gap-1"
                            >
                              <Star className="w-3 h-3" />
                              Generate Content
                            </button>
                            <button className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors flex items-center gap-1">
                              <Brain className="w-3 h-3" />
                              AI Learning Path
                            </button>
                            <button className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors flex items-center gap-1">
                              <BarChart3 className="w-3 h-3" />
                              Detailed Analysis
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Regular Analysis Results (for other analysis types) */}
              {analysisType !== 'weak-students' && (
                <>
                  {/* Top Performers */}
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Top Performers
                    </h4>
                    <div className="space-y-2">
                      {analysisResults.topPerformers?.map((student, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded">
                          <span className="font-medium">{student.name}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-green-600 font-bold">{student.score}%</span>
                            <span className="text-sm text-green-500">{student.improvement}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Struggling Students */}
                  <div className="bg-red-50 p-6 rounded-lg">
                    <h4 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Students Needing Support
                    </h4>
                    <div className="space-y-3">
                      {analysisResults.strugglingStudents?.map((student, index) => (
                        <div key={index} className="bg-white p-4 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{student.name}</span>
                            <span className="text-red-600 font-bold">{student.score}%</span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <strong>Issues:</strong> {student.issues.join(', ')}
                          </div>
                          <div className="text-sm text-blue-600">
                            <strong>Recommendation:</strong> {student.recommendation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* AI Insights */}
              <div className="bg-indigo-50 p-6 rounded-lg">
                <h4 className="font-bold text-indigo-800 mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  AI Insights
                </h4>
                <div className="space-y-2">
                  {analysisResults.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-indigo-500 mt-0.5" />
                      <span className="text-indigo-700">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select class and subject to analyze student performance</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Personalized Content Generation Modal */}
      {showPersonalizedContent && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Generate Personalized Content</h2>
                    <p className="text-gray-600">For {selectedStudent.name} - Grade {selectedStudent.grade}-{selectedStudent.section}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPersonalizedContent(false)}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {['flashcards', 'quiz', 'summary'].map((type) => (
                  <button
                    key={type}
                    onClick={() => generatePersonalizedContent(selectedStudent, type)}
                    disabled={generatingContent}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-2xl mb-2">
                      {type === 'flashcards' && '📚'}
                      {type === 'quiz' && '🧪'}
                      {type === 'summary' && '📄'}
                    </div>
                    <div className="text-sm font-medium capitalize">{type}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {type === 'flashcards' && 'Study cards for weak areas'}
                      {type === 'quiz' && 'Targeted assessment questions'}
                      {type === 'summary' && 'Concept explanations'}
                    </div>
                  </button>
                ))}
              </div>

              {/* Student's Weak Areas */}
              <div className="mb-6 p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Identified Weak Areas:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.weakAreas?.map((area, index) => (
                    <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Generated Content Display */}
              {generatingContent ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating personalized {contentType} for {selectedStudent.name}...</p>
                </div>
              ) : generatedContent ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">{generatedContent.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const element = document.createElement('a');
                          const file = new Blob([JSON.stringify(generatedContent, null, 2)], { type: 'text/plain' });
                          element.href = URL.createObjectURL(file);
                          element.download = `${generatedContent.title.replace(/\s+/g, '_')}.txt`;
                          document.body.appendChild(element);
                          element.click();
                          document.body.removeChild(element);
                        }}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {generatedContent.type === 'flashcards' && generatedContent.cards && (
                      <div className="grid gap-4">
                        {generatedContent.cards.map((card, index) => (
                          <div key={index} className="bg-white p-4 rounded border">
                            <div className="font-medium text-blue-800 mb-2">Card {index + 1}</div>
                            <div className="mb-2"><strong>Front:</strong> {card.front}</div>
                            <div><strong>Back:</strong> {card.back}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {generatedContent.type === 'quiz' && generatedContent.questions && (
                      <div className="space-y-4">
                        {generatedContent.questions.map((q, index) => (
                          <div key={index} className="bg-white p-4 rounded border">
                            <div className="font-medium text-green-800 mb-2">Question {index + 1}</div>
                            <div className="mb-2">{q.question}</div>
                            {q.options && (
                              <div className="ml-4 space-y-1">
                                {q.options.map((option, i) => (
                                  <div key={i} className={`text-sm ${i === q.correct ? 'font-medium text-green-700' : ''}`}>
                                    {String.fromCharCode(65 + i)}. {option} {i === q.correct && '✓'}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    
                    {generatedContent.type === 'summary' && (
                      <div className="bg-white p-4 rounded border">
                        <div className="prose max-w-none text-gray-700">
                          {generatedContent.content?.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-3">{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a content type above to generate personalized materials for {selectedStudent.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TeachingAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your AI Teaching Assistant. I can help you with student assessments, educational content creation, quiz generation, and teaching strategies. What would you like assistance with today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'Create flashcards for quadratic equations',
    'Suggest engagement activities for biology class',
    'How can I help struggling students in my chemistry class?',
    'Generate discussion questions for Shakespeare\'s Hamlet',
    'Create a rubric for project-based assessment'
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'ai',
        content: `I understand you're asking about "${inputMessage}". Here's my recommendation:

1. **Analysis**: Based on your query, I can provide specific strategies tailored to your teaching context.

2. **Suggestions**: I recommend implementing interactive elements, differentiated instruction approaches, and formative assessment techniques.

3. **Resources**: I can help you create materials, worksheets, and activities that align with your curriculum objectives.

Would you like me to elaborate on any of these points or help you develop specific materials?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 1500);
  };

  const handleQuickPrompt = (prompt) => {
    setInputMessage(prompt);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-800">AI Teaching Assistant</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Prompts */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Quick Prompts</h3>
          <div className="space-y-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleQuickPrompt(prompt)}
                className="w-full text-left p-3 text-sm bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          {/* Messages */}
          <div className="bg-white border rounded-lg h-96 overflow-y-auto p-4 mb-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      AI is thinking...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about teaching, lesson planning, or student engagement..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FlashcardGenerator = () => {
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    grade: '',
    cardCount: '10',
    difficulty: 'medium',
    cardType: 'question-answer'
  });
  const [generatedFlashcards, setGeneratedFlashcards] = useState(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);

  const cardTypes = [
    { value: 'question-answer', label: 'Question & Answer', description: 'Traditional Q&A format' },
    { value: 'term-definition', label: 'Term & Definition', description: 'Vocabulary and definitions' },
    { value: 'concept-explanation', label: 'Concept & Explanation', description: 'Complex concepts explained' },
    { value: 'formula-application', label: 'Formula & Application', description: 'Mathematical formulas with examples' }
  ];

  const handleGenerateFlashcards = async () => {
    if (!formData.subject || !formData.topic) return;
    
    setLoading(true);
    setTimeout(() => {
      const mockFlashcards = {
        title: `${formData.topic} Flashcards - Grade ${formData.grade}`,
        subject: formData.subject,
        topic: formData.topic,
        cardType: formData.cardType,
        cards: Array.from({ length: parseInt(formData.cardCount) }, (_, i) => ({
          id: i + 1,
          front: `${formData.cardType === 'question-answer' ? 'Question' : 'Term'} ${i + 1} about ${formData.topic}`,
          back: `This is the ${formData.cardType === 'question-answer' ? 'answer' : 'definition'} for card ${i + 1}. It provides detailed information about ${formData.topic} in the context of ${formData.subject}.`,
          difficulty: formData.difficulty
        }))
      };
      setGeneratedFlashcards(mockFlashcards);
      setCurrentCard(0);
      setShowAnswer(false);
      setLoading(false);
    }, 2000);
  };

  const nextCard = () => {
    if (currentCard < generatedFlashcards.cards.length - 1) {
      setCurrentCard(currentCard + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setShowAnswer(false);
    }
  };

  const shuffleCards = () => {
    const shuffled = [...generatedFlashcards.cards].sort(() => Math.random() - 0.5);
    setGeneratedFlashcards({...generatedFlashcards, cards: shuffled});
    setCurrentCard(0);
    setShowAnswer(false);
  };

  const resetSession = () => {
    setCurrentCard(0);
    setShowAnswer(false);
  };

  const downloadFlashcards = () => {
    const content = generatedFlashcards.cards.map((card, index) => 
      `Card ${index + 1}:\nFront: ${card.front}\nBack: ${card.back}\n\n`
    ).join('');
    
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${formData.topic}_flashcards.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Star className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-800">Flashcard Generator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flashcard Configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Select Subject</option>
              <option value="mathematics">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="biology">Biology</option>
              <option value="english">English</option>
              <option value="history">History</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
              placeholder="Enter the topic for flashcards"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({...formData, grade: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Select Grade</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>Grade {i + 1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Cards</label>
              <select
                value={formData.cardCount}
                onChange={(e) => setFormData({...formData, cardCount: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              >
                <option value="5">5 Cards</option>
                <option value="10">10 Cards</option>
                <option value="15">15 Cards</option>
                <option value="20">20 Cards</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Type</label>
            <div className="space-y-2">
              {cardTypes.map(type => (
                <label key={type.value} className="flex items-start">
                  <input
                    type="radio"
                    value={type.value}
                    checked={formData.cardType === type.value}
                    onChange={(e) => setFormData({...formData, cardType: e.target.value})}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-gray-600">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <button
            onClick={handleGenerateFlashcards}
            disabled={loading || !formData.subject || !formData.topic}
            className="w-full py-3 px-6 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating Flashcards...
              </>
            ) : (
              <>
                <Star className="h-4 w-4" />
                Generate Flashcards
              </>
            )}
          </button>
        </div>

        {/* Generated Flashcards Preview and Player */}
        <div className="lg:col-span-2">
          {generatedFlashcards ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{generatedFlashcards.title}</h3>
                  <p className="text-gray-600">{generatedFlashcards.cards.length} cards • {formData.difficulty} difficulty</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={shuffleCards}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded"
                    title="Shuffle cards"
                  >
                    <Shuffle className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={resetSession}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded"
                    title="Reset session"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={downloadFlashcards}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded"
                    title="Download flashcards"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Card Counter */}
              <div className="text-center">
                <span className="inline-block px-4 py-2 bg-yellow-100 rounded-full text-sm font-medium text-yellow-800">
                  Card {currentCard + 1} of {generatedFlashcards.cards.length}
                </span>
              </div>

              {/* Flashcard Display */}
              <div className="relative max-w-2xl mx-auto">
                <div 
                  className="relative w-full h-80 cursor-pointer"
                  onClick={() => setShowAnswer(!showAnswer)}
                >
                  <div className={`
                    absolute inset-0 w-full h-full rounded-xl shadow-lg transform transition-all duration-500 preserve-3d
                    ${showAnswer ? 'rotate-y-180' : ''}
                  `}>
                    {/* Front of card */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 flex items-center justify-center p-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                          {formData.cardType === 'question-answer' ? 'Question' : 'Term'}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {generatedFlashcards.cards[currentCard]?.front}
                        </p>
                        <p className="text-sm text-gray-500 mt-4">Click to reveal answer</p>
                      </div>
                    </div>

                    {/* Back of card */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 flex items-center justify-center p-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <EyeOff className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                          {formData.cardType === 'question-answer' ? 'Answer' : 'Definition'}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {generatedFlashcards.cards[currentCard]?.back}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={prevCard}
                    disabled={currentCard === 0}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAnswer(!showAnswer)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      {showAnswer ? 'Show Question' : 'Show Answer'}
                    </button>
                  </div>

                  <button
                    onClick={nextCard}
                    disabled={currentCard === generatedFlashcards.cards.length - 1}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure your settings to generate flashcards</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

const TryoutGenerator = () => {
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    grade: '',
    questionTypes: ['mcq'],
    questionCount: '10',
    difficulty: 'medium',
    timeLimit: '30'
  });
  const [generatedTryout, setGeneratedTryout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const questionTypes = [
    { value: 'mcq', label: 'Multiple Choice Questions', description: 'Traditional A, B, C, D format' },
    { value: 'true-false', label: 'True/False', description: 'Simple true or false questions' },
    { value: 'fill-blank', label: 'Fill in the Blanks', description: 'Cloze-style questions' },
    { value: 'short-answer', label: 'Short Answer', description: 'Brief written responses' },
    { value: 'match-list', label: 'Matching', description: 'Match items from two lists' },
    { value: 'drag-drop', label: 'Drag & Drop', description: 'Interactive sorting questions' }
  ];

  const handleQuestionTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter(t => t !== type)
        : [...prev.questionTypes, type]
    }));
  };

  const handleGenerateTryout = async () => {
    if (!formData.subject || !formData.topic || formData.questionTypes.length === 0) return;
    
    setLoading(true);
    setTimeout(() => {
      const mockTryout = {
        title: `${formData.topic} Tryout - Grade ${formData.grade}`,
        subject: formData.subject,
        topic: formData.topic,
        difficulty: formData.difficulty,
        timeLimit: formData.timeLimit,
        questionTypes: formData.questionTypes,
        questions: generateMockQuestions(formData)
      };
      setGeneratedTryout(mockTryout);
      setLoading(false);
    }, 2000);
  };

  const generateMockQuestions = (data) => {
    const questions = [];
    const questionsPerType = Math.ceil(parseInt(data.questionCount) / data.questionTypes.length);
    
    data.questionTypes.forEach((type, index) => {
      for (let i = 0; i < questionsPerType && questions.length < parseInt(data.questionCount); i++) {
        const questionNum = questions.length + 1;
        
        switch (type) {
          case 'mcq':
            questions.push({
              id: questionNum,
              type: 'mcq',
              question: `Multiple choice question ${questionNum} about ${data.topic}`,
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correct: 0,
              points: 1
            });
            break;
          case 'true-false':
            questions.push({
              id: questionNum,
              type: 'true-false',
              question: `True or false: Statement ${questionNum} about ${data.topic}`,
              correct: true,
              points: 1
            });
            break;
          case 'fill-blank':
            questions.push({
              id: questionNum,
              type: 'fill-blank',
              question: `Complete the following sentence about ${data.topic}: "This is a _____ concept in ${data.subject}."`,
              blanks: ['fundamental'],
              points: 1
            });
            break;
          case 'short-answer':
            questions.push({
              id: questionNum,
              type: 'short-answer',
              question: `Explain the concept ${questionNum} related to ${data.topic}`,
              answer: 'Sample short answer explanation',
              points: 2
            });
            break;
          case 'match-list':
            questions.push({
              id: questionNum,
              type: 'match-list',
              question: `Match the following items related to ${data.topic}`,
              leftItems: ['Item 1', 'Item 2', 'Item 3'],
              rightItems: ['Match A', 'Match B', 'Match C'],
              matches: {0: 0, 1: 1, 2: 2},
              points: 3
            });
            break;
          case 'drag-drop':
            questions.push({
              id: questionNum,
              type: 'drag-drop',
              question: `Arrange the following items in the correct order for ${data.topic}`,
              items: ['Step 1', 'Step 2', 'Step 3', 'Step 4'],
              correctOrder: [0, 1, 2, 3],
              points: 2
            });
            break;
        }
      }
    });
    
    return questions.slice(0, parseInt(data.questionCount));
  };

  const downloadTryout = () => {
    const content = `${generatedTryout.title}\n\nSubject: ${generatedTryout.subject}\nTopic: ${generatedTryout.topic}\nDifficulty: ${generatedTryout.difficulty}\nTime Limit: ${generatedTryout.timeLimit} minutes\nTotal Questions: ${generatedTryout.questions.length}\n\n` +
      generatedTryout.questions.map((q, index) => {
        let questionContent = `${index + 1}. ${q.question}\n`;
        if (q.type === 'mcq') {
          questionContent += q.options.map((opt, i) => `   ${String.fromCharCode(65 + i)}. ${opt}`).join('\n') + '\n';
        }
        return questionContent + '\n';
      }).join('');
    
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${formData.topic}_tryout.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderQuestionPreview = (question, index) => {
    switch (question.type) {
      case 'mcq':
        return (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-800">Q{question.id}: {question.question}</h4>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">MCQ</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className={`text-sm p-2 rounded border ${optIndex === question.correct ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200'}`}>
                  {String.fromCharCode(65 + optIndex)}. {option}
                </div>
              ))}
            </div>
          </div>
        );
      case 'true-false':
        return (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-800">Q{question.id}: {question.question}</h4>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">T/F</span>
            </div>
            <div className="flex gap-4 mt-3">
              <div className={`text-sm p-2 rounded border ${question.correct ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200'}`}>
                True
              </div>
              <div className={`text-sm p-2 rounded border ${!question.correct ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200'}`}>
                False
              </div>
            </div>
          </div>
        );
      case 'fill-blank':
        return (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-800">Q{question.id}: {question.question}</h4>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Fill Blank</span>
            </div>
            <div className="mt-3">
              <span className="text-sm text-green-700 bg-green-50 px-2 py-1 rounded">Answer: {question.blanks[0]}</span>
            </div>
          </div>
        );
      default:
        return (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-800">Q{question.id}: {question.question}</h4>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{question.type}</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-6 w-6 text-indigo-500" />
        <h2 className="text-2xl font-bold text-gray-800">Tryout Generator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tryout Configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Subject</option>
              <option value="mathematics">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="biology">Biology</option>
              <option value="english">English</option>
              <option value="history">History</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
              placeholder="Enter the tryout topic"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({...formData, grade: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Grade</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>Grade {i + 1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question Count</label>
              <select
                value={formData.questionCount}
                onChange={(e) => setFormData({...formData, questionCount: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="10">10 Questions</option>
                <option value="15">15 Questions</option>
                <option value="20">20 Questions</option>
                <option value="25">25 Questions</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question Types</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {questionTypes.map(type => (
                <label key={type.value} className="flex items-start">
                  <input
                    type="checkbox"
                    value={type.value}
                    checked={formData.questionTypes.includes(type.value)}
                    onChange={() => handleQuestionTypeChange(type.value)}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-gray-600">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit</label>
              <input
                type="number"
                value={formData.timeLimit}
                onChange={(e) => setFormData({...formData, timeLimit: e.target.value})}
                min="10"
                max="120"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateTryout}
            disabled={loading || !formData.subject || !formData.topic || formData.questionTypes.length === 0}
            className="w-full py-3 px-6 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating Tryout...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Generate Tryout
              </>
            )}
          </button>
        </div>

        {/* Generated Tryout Preview */}
        <div className="lg:col-span-2">
          {generatedTryout ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{generatedTryout.title}</h3>
                  <p className="text-gray-600">
                    {generatedTryout.questions.length} questions • {generatedTryout.timeLimit} minutes • {generatedTryout.difficulty}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={downloadTryout}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-800 mb-2">Tryout Overview</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-indigo-700">Subject:</span> {generatedTryout.subject}</div>
                  <div><span className="text-indigo-700">Topic:</span> {generatedTryout.topic}</div>
                  <div><span className="text-indigo-700">Questions:</span> {generatedTryout.questions.length}</div>
                  <div><span className="text-indigo-700">Total Points:</span> {generatedTryout.questions.reduce((sum, q) => sum + q.points, 0)}</div>
                </div>
                <div className="mt-2">
                  <span className="text-indigo-700">Question Types:</span> {formData.questionTypes.join(', ')}
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800">Questions Preview</h4>
                  <span className="text-sm text-gray-500">
                    {previewMode ? 'Detailed View' : `Showing ${Math.min(5, generatedTryout.questions.length)} of ${generatedTryout.questions.length}`}
                  </span>
                </div>
                
                {(previewMode ? generatedTryout.questions : generatedTryout.questions.slice(0, 5)).map((question, index) => 
                  renderQuestionPreview(question, index)
                )}
                
                {!previewMode && generatedTryout.questions.length > 5 && (
                  <p className="text-center text-gray-500 text-sm">
                    +{generatedTryout.questions.length - 5} more questions...
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure your settings to generate a tryout</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPoweredTeaching;