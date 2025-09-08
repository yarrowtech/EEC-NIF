import React, { useState } from 'react';
import { 
  Calculator, 
  BookOpen, 
  Lightbulb, 
  Target, 
  FileText, 
  Image, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Brain,
  Zap,
  Search,
  Download,
  Share2
} from 'lucide-react';

const AIProblemSolver = ({ isVisible, onClose }) => {
  const [problemType, setProblemType] = useState('math');
  const [problemText, setProblemText] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [solution, setSolution] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');

  const problemTypes = [
    { id: 'math', name: 'Mathematics', icon: Calculator, color: 'blue' },
    { id: 'physics', name: 'Physics', icon: Target, color: 'purple' },
    { id: 'chemistry', name: 'Chemistry', icon: BookOpen, color: 'green' },
    { id: 'biology', name: 'Biology', icon: FileText, color: 'emerald' },
  ];

  const difficultyLevels = [
    { id: 'easy', name: 'Easy', color: 'green' },
    { id: 'medium', name: 'Medium', color: 'yellow' },
    { id: 'hard', name: 'Hard', color: 'red' },
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage({
          file: file,
          dataURL: e.target.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const solveProblem = async () => {
    if (!problemText.trim() && !uploadedImage) return;

    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      const mockSolution = generateMockSolution();
      setSolution(mockSolution);
      setIsProcessing(false);
    }, 2000 + Math.random() * 2000);
  };

  const generateMockSolution = () => {
    const solutions = {
      math: {
        problem: problemText || "Find the derivative of f(x) = x² + 3x + 2",
        steps: [
          {
            step: 1,
            title: "Identify the function",
            content: "f(x) = x² + 3x + 2",
            explanation: "We have a polynomial function with three terms."
          },
          {
            step: 2,
            title: "Apply differentiation rules",
            content: "f'(x) = d/dx(x²) + d/dx(3x) + d/dx(2)",
            explanation: "Use the power rule and constant rule."
          },
          {
            step: 3,
            title: "Calculate each derivative",
            content: "f'(x) = 2x + 3 + 0",
            explanation: "The derivative of x² is 2x, 3x is 3, and constant 2 is 0."
          },
          {
            step: 4,
            title: "Final answer",
            content: "f'(x) = 2x + 3",
            explanation: "This is the derivative of the original function."
          }
        ],
        confidence: 95,
        timeToSolve: "2.3 seconds",
        difficulty: "Medium",
        concepts: ["Differentiation", "Power Rule", "Polynomial Functions"],
        relatedProblems: [
          "Find the derivative of f(x) = x³ + 2x",
          "Solve the equation 2x + 3 = 0",
          "Find the critical points of f(x) = x² + 3x + 2"
        ]
      },
      physics: {
        problem: problemText || "A ball is thrown vertically upward with initial velocity 20 m/s. Find the maximum height.",
        steps: [
          {
            step: 1,
            title: "Given information",
            content: "Initial velocity (u) = 20 m/s, Final velocity at max height (v) = 0 m/s, Acceleration (a) = -9.8 m/s²",
            explanation: "At maximum height, velocity becomes zero due to gravity."
          },
          {
            step: 2,
            title: "Choose the appropriate equation",
            content: "v² = u² + 2as",
            explanation: "This kinematic equation relates velocity, acceleration, and displacement."
          },
          {
            step: 3,
            title: "Substitute the values",
            content: "0² = 20² + 2(-9.8)s",
            explanation: "Solving for displacement 's' which represents maximum height."
          },
          {
            step: 4,
            title: "Calculate the result",
            content: "0 = 400 - 19.6s ⟹ s = 400/19.6 = 20.4 m",
            explanation: "The ball reaches a maximum height of 20.4 meters."
          }
        ],
        confidence: 92,
        timeToSolve: "1.8 seconds",
        difficulty: "Medium",
        concepts: ["Kinematics", "Projectile Motion", "Gravity"],
        relatedProblems: [
          "Find the time to reach maximum height",
          "Calculate total flight time",
          "Find velocity after 2 seconds"
        ]
      }
    };

    return solutions[problemType] || solutions.math;
  };

  const clearAll = () => {
    setProblemText('');
    setUploadedImage(null);
    setSolution(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Problem Solver</h2>
                <p className="text-sm opacity-90">Get step-by-step solutions with explanations</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <span className="text-xl">×</span>
            </button>
          </div>

          {/* Problem Type Selection */}
          <div className="mt-4 flex flex-wrap gap-2">
            {problemTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setProblemType(type.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  problemType === type.id
                    ? 'bg-white text-purple-600'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <type.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Text Input */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Problem Statement</h3>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {difficultyLevels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <textarea
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder={`Enter your ${problemTypes.find(t => t.id === problemType)?.name.toLowerCase()} problem here...`}
                className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />

              {/* Image Upload */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                {uploadedImage ? (
                  <div className="space-y-3">
                    <img 
                      src={uploadedImage.dataURL} 
                      alt="Problem" 
                      className="max-h-32 mx-auto rounded-lg shadow-sm"
                    />
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {uploadedImage.name}
                    </div>
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="text-sm text-red-600 hover:text-red-800 transition-colors"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Image className="h-8 w-8 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Upload an image of your problem
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors text-sm"
                      >
                        <Upload className="h-4 w-4" />
                        Choose Image
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={solveProblem}
                  disabled={(!problemText.trim() && !uploadedImage) || isProcessing}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Solving...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Solve Problem
                    </>
                  )}
                </button>
                <button
                  onClick={clearAll}
                  className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Solution Display */}
            <div className="space-y-4">
              {solution ? (
                <div className="space-y-4">
                  {/* Solution Header */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">Solution Found</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Confidence:</span>
                        <div className="font-semibold text-green-700">{solution.confidence}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Time:</span>
                        <div className="font-semibold text-green-700">{solution.timeToSolve}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Difficulty:</span>
                        <div className="font-semibold text-green-700">{solution.difficulty}</div>
                      </div>
                    </div>
                  </div>

                  {/* Step-by-Step Solution */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      Step-by-Step Solution
                    </h4>
                    <div className="space-y-4">
                      {solution.steps.map((step, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center flex-shrink-0">
                              {step.step}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-800 mb-1">{step.title}</h5>
                              <div className="bg-gray-50 rounded-lg p-3 mb-2 font-mono text-sm">
                                {step.content}
                              </div>
                              <p className="text-sm text-gray-600">{step.explanation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Concepts and Related Problems */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Key Concepts
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {solution.concepts.map((concept, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-4">
                      <h5 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Related Problems
                      </h5>
                      <div className="space-y-2">
                        {solution.relatedProblems.map((problem, index) => (
                          <button
                            key={index}
                            onClick={() => setProblemText(problem)}
                            className="w-full text-left p-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-sm text-purple-800 transition-colors"
                          >
                            {problem}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                      <Download className="h-4 w-4" />
                      Save Solution
                    </button>
                    <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center p-8">
                  <div>
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calculator className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-gray-800 mb-2">Ready to Solve</h4>
                    <p className="text-sm text-gray-600">
                      Enter your problem or upload an image to get started
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIProblemSolver;