import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Book,
  FileText,
  Download,
  Search as SearchIcon,
  Coins
} from "lucide-react";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { addPoints, hasAward, markAwarded } from '../utils/points';
import axios from 'axios';

const Assignment = ({ assignmentType, filter, setFilter }) => {
  // School assignment state
  const [schoolSearch, setSchoolSearch] = useState("");
  const [schoolSort, setSchoolSort] = useState("due_asc");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  // Flashcard state
  const [flashDeck, setFlashDeck] = useState([]);
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashFlipped, setFlashFlipped] = useState(false);
  const [flashKnown, setFlashKnown] = useState({});
  const [flashShuffle, setFlashShuffle] = useState(false);

  // EEC state
  const [selectedClass, setSelectedClass] = useState("6");
  const [eecSubject, setEecSubject] = useState("math");
  const [questionType, setQuestionType] = useState("mcq");
  const [eecAnswers, setEecAnswers] = useState({});
  const [eecFeedback, setEecFeedback] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);

  // Lab state
  const labContainerRef = useRef(null);
  const labRendererRef = useRef(null);
  const labSceneRef = useRef(null);
  const labCameraRef = useRef(null);
  const labAnimRef = useRef(null);
  const [labControls, setLabControls] = useState({
    rotation: 0,
    zoom: 1,
    lightIntensity: 1
  });

  // Fetch assignments from API
  useEffect(() => {
    if (assignmentType === 'school') {
      fetchAssignments();
    }
  }, [assignmentType]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/assignment/student/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Transform API data to match component structure
      const transformedAssignments = response.data.map(assignment => ({
        id: assignment._id,
        title: assignment.title,
        course: assignment.subject,
        dueDate: assignment.dueDate,
        status: assignment.submissionStatus === 'submitted' || assignment.submissionStatus === 'graded' ? 'completed' :
                assignment.submissionStatus === 'not_submitted' && new Date(assignment.dueDate) < new Date() ? 'overdue' : 'pending',
        priority: 'medium',
        description: assignment.description,
        submissionType: 'file',
        maxMarks: assignment.marks,
        submittedAt: assignment.submittedAt,
        score: assignment.score,
        feedback: assignment.feedback,
        teacherName: assignment.teacherId?.name,
        attachments: assignment.attachments || []
      }));

      setAssignments(transformedAssignments);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const questionData = {
    '6': {
      'math': {
        'mcq': [
          { q: 'What is 7+5?', o: ['10', '11', '12', '13'], a: '12', e: 'Simple addition' },
          { q: 'What is 8*6?', o: ['42', '48', '54', '56'], a: '48', e: 'Multiplication' }
        ],
        'blank': [
          { q: 'Fill in the blank: 9 - 4 = ___', a: '5', e: 'Simple subtraction' }
        ]
      },
      'science': {
        'mcq': [
          { q: 'What planet is closest to the Sun?', o: ['Venus', 'Mercury', 'Earth', 'Mars'], a: 'Mercury', e: 'Mercury is the closest planet to the Sun' }
        ],
        'blank': [
          { q: 'The process by which plants make food is called ___', a: 'photosynthesis', e: 'Plants use sunlight to make food' }
        ]
      }
    },
    '7': {
      'math': {
        'mcq': [
          { q: 'What is 12*7?', o: ['82', '84', '86', '88'], a: '84', e: 'Multiplication' },
          { q: 'What is 15/3?', o: ['3', '4', '5', '6'], a: '5', e: 'Division' }
        ],
        'blank': [
          { q: 'Fill in the blank: 16 + 9 = ___', a: '25', e: 'Simple addition' }
        ]
      },
      'science': {
        'mcq': [
          { q: 'What is the chemical symbol for gold?', o: ['Go', 'Gd', 'Au', 'Ag'], a: 'Au', e: 'Gold has the chemical symbol Au' }
        ],
        'blank': [
          { q: 'The largest organ in the human body is the ___', a: 'skin', e: 'Skin is the largest organ' }
        ]
      }
    }
  };

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'overdue': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filtered assignments logic
  const filteredAssignments = assignments
    .filter((assignment) => {
      const matchesSearch = assignment.title.toLowerCase().includes(schoolSearch.toLowerCase()) ||
        assignment.course.toLowerCase().includes(schoolSearch.toLowerCase()) ||
        assignment.description.toLowerCase().includes(schoolSearch.toLowerCase());
      
      if (!matchesSearch) return false;
      
      if (filter === 'all') return true;
      if (filter === 'pending') return assignment.status === 'pending';
      if (filter === 'completed') return assignment.status === 'completed';
      if (filter === 'overdue') return assignment.status === 'overdue';
      
      return true;
    })
    .sort((a, b) => {
      const weight = { high: 3, medium: 2, low: 1 };
      const order = { overdue: 3, pending: 2, completed: 1 };
      
      if (schoolSort === 'due_asc') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (schoolSort === 'due_desc') {
        return new Date(b.dueDate) - new Date(a.dueDate);
      } else if (schoolSort === 'priority') {
        return (weight[b.priority] || 0) - (weight[a.priority] || 0);
      } else if (schoolSort === 'status') {
        return (order[b.status] || 0) - (order[a.status] || 0);
      }
      return 0;
    });

  // Lab effects
  useEffect(() => {
    if (assignmentType !== 'lab') {
      if (labAnimRef.current) cancelAnimationFrame(labAnimRef.current);
      if (labRendererRef.current) {
        labRendererRef.current.dispose();
        labRendererRef.current = null;
      }
      return;
    }

    if (!labContainerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    labSceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, labContainerRef.current.clientWidth / labContainerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    labCameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(labContainerRef.current.clientWidth, labContainerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    labRendererRef.current = renderer;

    labContainerRef.current.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, labControls.lightIntensity);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add a simple cube for demonstration
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    scene.add(cube);

    // Add ground plane
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -2;
    plane.receiveShadow = true;
    scene.add(plane);

    // Animation loop
    const animate = () => {
      labAnimRef.current = requestAnimationFrame(animate);
      
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      cube.rotation.z = labControls.rotation * Math.PI / 180;
      
      camera.position.z = 10 / labControls.zoom;
      directionalLight.intensity = labControls.lightIntensity;
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      if (!labContainerRef.current) return;
      const width = labContainerRef.current.clientWidth;
      const height = labContainerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (labAnimRef.current) cancelAnimationFrame(labAnimRef.current);
      if (labRendererRef.current) {
        labContainerRef.current?.removeChild(renderer.domElement);
        labRendererRef.current.dispose();
      }
    };
  }, [assignmentType, labControls]);

  // EEC handlers
  const handleEecInput = (index, value) => {
    setEecAnswers(prev => ({ ...prev, [index]: value }));
  };

  const handleEecSubmit = () => {
    const currentQuestions = questionData[selectedClass]?.[eecSubject]?.[questionType] || [];
    let correct = 0;
    const feedback = {};

    currentQuestions.forEach((q, idx) => {
      const userAnswer = eecAnswers[idx] || '';
      const isCorrect = userAnswer.toLowerCase().trim() === q.a.toLowerCase().trim();
      feedback[idx] = isCorrect;
      if (isCorrect) correct++;
    });

    setEecFeedback(feedback);
    
    const score = Math.round((correct / currentQuestions.length) * 100);
    if (score >= 70) {
      addPoints(10);
      const el = document.createElement('div');
      el.className = 'fixed top-20 right-6 bg-emerald-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce z-50';
      el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 10.05a7 7 0 0 1 9.9 0l10 10"></path><path d="M13 13h8"></path></svg><span>+10 Points</span>';
      document.body.appendChild(el);
      setTimeout(() => document.body.removeChild(el), 1800);
    }
  };

  // Flashcard effects
  useEffect(() => {
    if (assignmentType !== 'flashcard') return;
    const onKeyDown = (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        setFlashFlipped(!flashFlipped);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [flashFlipped, assignmentType]);

  // MCQ and Blank components
  const MCQ = ({ array = [], insight, setInsight }) => {
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    return (
      <div className="space-y-6">
        {array.map((q, idx) => (
          <div key={idx} className="mb-5">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">{idx + 1}</div>
                  <div className="flex-1">
                    <div className="text-gray-900 font-medium">{q.q}</div>
                    <div className="mt-4 space-y-2">
                      {q.o.map((option, oidx) => (
                        <label key={oidx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name={`q${idx}`}
                            value={option}
                            checked={answers[idx] === option}
                            onChange={e => setAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                    {showResults && answers[idx] && (
                      <div className={`mt-3 rounded-lg border p-3 text-sm ${answers[idx] === q.a ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className={answers[idx] === q.a ? 'text-green-800' : 'text-red-800'}>
                          <span className="font-semibold">Your answer:</span> {answers[idx]} {answers[idx] === q.a ? '✓' : '✗'}
                        </div>
                        {answers[idx] !== q.a && (
                          <div className="text-green-800 mt-1">
                            <span className="font-semibold">Correct answer:</span> {q.a}
                          </div>
                        )}
                        {q.e && <div className="text-gray-700 mt-1"><span className="font-semibold">Explanation:</span> {q.e}</div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="flex gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setShowResults(!showResults)}
          >
            {showResults ? 'Hide Results' : 'Check Answers'}
          </button>
        </div>
      </div>
    );
  };

  const Blank = ({ array = [], insight, setInsight }) => {
    return (
      <div className="space-y-6">
        {array.map((q, idx) => (
          <div key={idx} className="mb-5">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">{idx + 1}</div>
                  <div className="flex-1">
                    <div className="text-gray-900 font-medium">{q.q}</div>
                    <div className="mt-3">
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Type your answer here..."
                        value={eecAnswers[idx] || ''}
                        onChange={e => handleEecInput(idx, e.target.value)}
                      />
                    </div>
                    {showAnswers && (
                      <div className="mt-3 rounded-lg bg-green-50 border border-green-200 p-3 text-sm">
                        <div className="text-green-800"><span className="font-semibold">Answer:</span> {q.a}</div>
                        {q.e && <div className="text-green-700 mt-1"><span className="font-semibold">Explanation:</span> {q.e}</div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (assignmentType === 'school') {
    return (
      <>
        {/* Controls */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px]">
              <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={schoolSearch}
                onChange={(e) => setSchoolSearch(e.target.value)}
                placeholder="Search title, course, or description..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            {/* Sort */}
            <select
              value={schoolSort}
              onChange={(e) => setSchoolSort(e.target.value)}
              className="w-full md:w-auto px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="due_asc">Sort by Due (Earliest)</option>
              <option value="due_desc">Sort by Due (Latest)</option>
              <option value="priority">Sort by Priority</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
          {/* Filter Segmented */}
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'completed', 'overdue'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize border transition ${
                  filter === filterType
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                }`}
              >
                {filterType}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {assignments.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {assignments.filter(a => a.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {assignments.filter(a => a.status === 'overdue').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Assignments Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500 text-lg">Loading assignments...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAssignments.map((assignment) => {
                const days = getDaysRemaining(assignment.dueDate);
                const daysText = days < 0 ? `${Math.abs(days)} days overdue` : `${days} days remaining`;
                const daysColor = days < 0 ? 'text-red-600 bg-red-50 border-red-200' : days <= 3 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-green-700 bg-green-50 border-green-200';
                return (
                  <div
                    key={assignment.id}
                    className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition overflow-hidden ${getPriorityColor(assignment.priority)}`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(assignment.status)}
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{assignment.title}</h3>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize border ${getStatusColor(assignment.status)}`}>
                          {assignment.status}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-700">
                        <span className="inline-flex items-center gap-1"><Book className="w-4 h-4" />{assignment.course}</span>
                        <span className="inline-flex items-center gap-1"><Calendar className="w-4 h-4" />Due: {formatDate(assignment.dueDate)}</span>
                        <span className="inline-flex items-center gap-1">Max Marks: {assignment.maxMarks}</span>
                      </div>
                      {assignment.teacherName && (
                        <p className="mt-2 text-sm text-gray-600">Teacher: {assignment.teacherName}</p>
                      )}
                      <p className="mt-3 text-gray-700 line-clamp-3">{assignment.description}</p>

                      {/* PDF Attachments */}
                      {assignment.attachments && assignment.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-gray-600">Attachments:</p>
                          {assignment.attachments.map((attachment, idx) => (
                            <a
                              key={idx}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-blue-700 truncate flex-1">{attachment.name}</span>
                              <Download className="w-4 h-4 text-blue-600" />
                            </a>
                          ))}
                        </div>
                      )}

                      {assignment.status === 'completed' && assignment.score !== undefined && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm font-semibold text-green-800">Score: {assignment.score}/{assignment.maxMarks}</p>
                          {assignment.feedback && <p className="text-sm text-green-700 mt-1">{assignment.feedback}</p>}
                        </div>
                      )}
                    </div>
                    <div className="px-5 pb-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded border text-xs font-medium ${daysColor}`}>{daysText}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {assignment.status === 'pending' && (
                            <button
                              onClick={() => alert('Submission feature coming soon!')}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              Submit
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredAssignments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No assignments found.</p>
              </div>
            )}
          </>
        )}
      </>
    );
  }

  if (assignmentType === 'flashcard') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <label htmlFor="fcClass" className="font-medium text-gray-700">Class:</label>
          <select
            id="fcClass"
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="6">Class 6</option>
            <option value="7">Class 7</option>
            <option value="8">Class 8</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
          </select>
        </div>
        <div className="text-center">
          <p className="text-gray-600">Flashcard functionality coming soon!</p>
        </div>
      </div>
    );
  }

  if (assignmentType === 'eec') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        {/* Header */}
        <div className="p-6 sm:p-7 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">EEC Practice Paper</h2>
              <p className="text-gray-600 mt-1">Challenge yourself with curated questions</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="6">Class 6</option>
                <option value="7">Class 7</option>
              </select>
              <select
                value={eecSubject}
                onChange={e => setEecSubject(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="math">Math</option>
              </select>
              <select
                value={questionType}
                onChange={e => setQuestionType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="mcq">Multiple Choice</option>
                <option value="blank">Fill in the Blank</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7">
          {questionType === "mcq" 
            ? <MCQ array={questionData[selectedClass][eecSubject]?.mcq} />
            : <Blank array={questionData[selectedClass][eecSubject]?.blank} />
          }
        </div>

        {/* Footer */}
        <div className="p-6 sm:p-7 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleEecSubmit}
          >
            Submit Answers
          </button>
          <button
            className={`px-4 py-2 rounded-lg border ${showAnswers ? 'border-green-600 text-green-700 hover:bg-green-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            onClick={() => { setEecFeedback(null); setShowAnswers(!showAnswers); }}
          >
            {showAnswers ? 'Hide Explanations' : 'Show Explanations'}
          </button>
        </div>
      </div>
    );
  }

  if (assignmentType === 'lab') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Virtual Lab</h2>
          <p className="text-gray-600 mb-6">Explore interactive 3D models and simulations for enhanced learning</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 3D Model Viewer */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">3D Model Viewer</h3>
            <div ref={labContainerRef} className="w-full h-96 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden" />
          </div>

          {/* Lab Controls */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lab Controls</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Rotation ({Math.round(labControls.rotation)}°)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={labControls.rotation}
                    onChange={e => setLabControls(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zoom Level ({labControls.zoom.toFixed(1)}x)
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={labControls.zoom}
                    onChange={e => setLabControls(prev => ({ ...prev, zoom: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Light Intensity ({labControls.lightIntensity.toFixed(1)})
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={labControls.lightIntensity}
                    onChange={e => setLabControls(prev => ({ ...prev, lightIntensity: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Lab Instructions</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use the controls to manipulate the 3D model</li>
                <li>• Adjust rotation to view from different angles</li>
                <li>• Change zoom to examine details closely</li>
                <li>• Modify lighting for better visibility</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Assignment;