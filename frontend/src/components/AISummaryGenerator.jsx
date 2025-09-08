import React, { useState, useEffect } from 'react';
import {
  PenTool,
  Loader2,
  Copy,
  Download,
  RefreshCw,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Zap,
  Brain,
  FileText,
  Volume2,
  VolumeX
} from 'lucide-react';

const AISummaryGenerator = ({ subject }) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const difficulties = [
    { id: 'basic', name: 'Basic', description: 'Simple explanations for beginners', color: 'green' },
    { id: 'medium', name: 'Intermediate', description: 'Balanced depth and clarity', color: 'blue' },
    { id: 'advanced', name: 'Advanced', description: 'Comprehensive and detailed', color: 'red' }
  ];

  const generateSummary = async () => {
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
          contentType: 'summary',
          difficulty
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedSummary(data.content);
        
        // Log learning activity
        logActivity('summary');
      } else {
        setGeneratedSummary(mockSummaries[selectedTopic] || `AI-generated summary for ${selectedTopic} in ${subject.name} at ${difficulty} level.`);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      setGeneratedSummary(mockSummaries[selectedTopic] || `AI-generated summary for ${selectedTopic} in ${subject.name} at ${difficulty} level.`);
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
          timeSpent: Math.floor(Math.random() * 20) + 5,
          completed: true
        })
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const downloadSummary = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedSummary], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedTopic}_summary.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const readAloud = () => {
    if (isReading) {
      speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(generatedSummary);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.onend = () => setIsReading(false);
      speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };

  const getDifficultyColor = (diff) => {
    const colors = {
      basic: 'text-green-600 bg-green-100 border-green-200',
      medium: 'text-blue-600 bg-blue-100 border-blue-200',
      advanced: 'text-red-600 bg-red-100 border-red-200'
    };
    return colors[diff] || colors.medium;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <PenTool className="w-7 h-7 mr-3" />
                AI Summary Generator
              </h2>
              <p className="text-green-100 mt-1">
                Get intelligent summaries tailored to your learning level
              </p>
            </div>
            <div className="bg-green-400 p-3 rounded-xl">
              <Brain className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Topic Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Topic
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Choose a topic...</option>
                {subject.topics.map((topic, index) => (
                  <option key={index} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {difficulties.map((diff) => (
                  <button
                    key={diff.id}
                    onClick={() => setDifficulty(diff.id)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      difficulty === diff.id
                        ? getDifficultyColor(diff.id)
                        : 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold">{diff.name}</div>
                      <div className="text-xs mt-1 opacity-75">{diff.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-6">
            <button
              onClick={generateSummary}
              disabled={!selectedTopic || loading}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating AI Summary...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Generate Summary</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Summary */}
        {generatedSummary && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-600" />
                Summary: {selectedTopic}
                <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}>
                  {difficulty}
                </span>
              </h3>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={readAloud}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title={isReading ? 'Stop reading' : 'Read aloud'}
                >
                  {isReading ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                </button>
                <button
                  onClick={downloadSummary}
                  className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Download as text file"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={generateSummary}
                  className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  title="Regenerate summary"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="prose prose-green max-w-none">
                <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {generatedSummary}
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Word Count</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {generatedSummary.split(' ').length}
                    </p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Reading Time</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {Math.ceil(generatedSummary.split(' ').length / 200)} min
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Difficulty</p>
                    <p className="text-2xl font-bold text-orange-800 capitalize">
                      {difficulty}
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Learning Tips */}
            <div className="mt-6 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">Learning Tips</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Read the summary multiple times for better retention</li>
                    <li>• Try explaining the concepts in your own words</li>
                    <li>• Use the mind map feature to visualize connections</li>
                    <li>• Test your understanding with the AI quiz</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No content state */}
        {!generatedSummary && !loading && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PenTool className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Ready to Generate</h3>
            <p className="text-gray-600 mb-4">
              Select a topic and difficulty level, then click "Generate Summary" to get started.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
              <h4 className="font-medium text-gray-800 mb-2">AI Summary Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li>✨ Personalized difficulty levels</li>
                <li>🎯 Topic-specific content</li>
                <li>🔊 Text-to-speech support</li>
                <li>📥 Download and share options</li>
                <li>🧠 Learning progress tracking</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mock summaries for development
const mockSummaries = {
  'Algebra': `Algebra is a branch of mathematics that uses symbols and letters to represent numbers and quantities in formulas and equations. It's like arithmetic with unknown values that we need to find.

Key Concepts:
- Variables: Letters (like x, y, z) that represent unknown numbers
- Equations: Mathematical statements showing that two expressions are equal
- Operations: Addition, subtraction, multiplication, and division with variables

Basic Rules:
1. Whatever you do to one side of an equation, you must do to the other side
2. Combine like terms (terms with the same variable)
3. Use inverse operations to isolate variables

Applications:
Algebra is used in everyday life for calculating costs, determining distances, solving word problems, and forms the foundation for advanced mathematics like calculus and statistics.`,

  'Quadratic Equations': `Quadratic equations are mathematical expressions of the form ax² + bx + c = 0, where a, b, and c are constants and a ≠ 0. They represent parabolic curves when graphed.

Key Components:
- The term ax² makes it quadratic (second-degree)
- These equations can have 0, 1, or 2 real solutions
- The graph is always a parabola

Solving Methods:
1. Factoring: Breaking down the equation into simpler parts
2. Quadratic Formula: x = (-b ± √(b² - 4ac)) / 2a
3. Completing the Square: Converting to perfect square form
4. Graphing: Finding x-intercepts visually

The Discriminant (b² - 4ac):
- Positive: Two different real solutions
- Zero: One repeated real solution  
- Negative: Two complex solutions

Real-world applications include projectile motion, optimization problems, and modeling parabolic shapes in architecture and engineering.`
};

export default AISummaryGenerator;