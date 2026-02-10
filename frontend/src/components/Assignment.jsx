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
  Coins,
  X,
  ChevronRight,
  User,
  Star,
  SendHorizonal,
  Paperclip,
  Award,
  Upload
} from "lucide-react";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { addPoints, hasAward, markAwarded } from '../utils/points';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const Assignment = ({ assignmentType, filter, setFilter }) => {
  const location = useLocation();
  // School assignment state
  const [schoolSearch, setSchoolSearch] = useState("");
  const [schoolSort, setSchoolSort] = useState("due_asc");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFileUrl, setSubmissionFileUrl] = useState('');
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [uploadingSubmissionFile, setUploadingSubmissionFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000')
    .replace(/\/$/, '')
    .replace(/\/api$/, '');
  const API_BASE_URL = `${API_BASE}`;

  // Flashcard state
  const [flashDeck, setFlashDeck] = useState([]);
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashFlipped, setFlashFlipped] = useState(false);
  const [flashKnown, setFlashKnown] = useState({});
  const [flashShuffle, setFlashShuffle] = useState(false);

  // EEC / Practice state
  const [selectedClass, setSelectedClass] = useState("6");
  const [practiceMeta, setPracticeMeta] = useState(null);
  const [practiceSubjectId, setPracticeSubjectId] = useState("");
  const [practiceType, setPracticeType] = useState("mcq");
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [practiceResults, setPracticeResults] = useState(null);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [practiceSubmitting, setPracticeSubmitting] = useState(false);
  const [practiceError, setPracticeError] = useState("");
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

  useEffect(() => {
    if (assignmentType !== 'school') return;
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q && q.trim() && q !== schoolSearch) {
      setSchoolSearch(q);
    }
  }, [assignmentType, location.search, schoolSearch]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/assignment/student/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Transform API data to match component structure
      const assignmentsPayload = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.assignments)
          ? response.data.assignments
          : [];
      const transformedAssignments = assignmentsPayload.map(assignment => ({
        id: assignment._id,
        title: assignment.title,
        course: assignment.subject,
        dueDate: assignment.dueDate,
        status: assignment.submissionStatus === 'submitted' || assignment.submissionStatus === 'graded' ? 'completed' :
                assignment.submissionStatus === 'not_submitted' && new Date(assignment.dueDate) < new Date() ? 'overdue' : 'pending',
        priority: 'medium',
        description: assignment.description,
        submissionFormat: assignment.submissionFormat === 'pdf' ? 'pdf' : 'text',
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

const openDetail = (assignment) => {
  setSelectedAssignment(assignment);
  setSubmissionText('');
  setSubmitSuccess(false);
  setSubmissionFileUrl('');
  setSubmissionFileName('');
};

const closeDetail = () => {
  setSelectedAssignment(null);
  setSubmissionText('');
  setSubmitSuccess(false);
  setSubmissionFileUrl('');
  setSubmissionFileName('');
};

  const handleSubmit = async () => {
    const requiresPdfUpload = selectedAssignment?.submissionFormat === 'pdf';
    if (!requiresPdfUpload && !submissionText.trim()) {
      alert('Please write something before submitting.');
      return;
    }
    if (requiresPdfUpload && !submissionFileUrl) {
      alert('Please upload your PDF before submitting.');
      return;
    }
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/assignment/submit`,
        {
          assignmentId: selectedAssignment.id,
          submissionText,
          attachmentUrl: requiresPdfUpload ? submissionFileUrl : undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitSuccess(true);
      setSubmissionFileUrl('');
      setSubmissionFileName('');
      // Refresh list so card status updates
      await fetchAssignments();
      // Update the open modal card too
      setSelectedAssignment(prev => ({ ...prev, status: 'completed' }));
    } catch (err) {
      console.error('Submit error:', err);
      alert(err.response?.data?.error || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmissionFileUpload = async (event) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      input.value = '';
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert('File size must be under 20MB.');
      input.value = '';
      return;
    }

    setUploadingSubmissionFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/uploads/cloudinary/single`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      const uploaded = response.data.files?.[0];
      if (!uploaded?.secure_url) {
        throw new Error('Upload failed');
      }
      setSubmissionFileUrl(uploaded.secure_url);
      setSubmissionFileName(uploaded.originalName || file.name);
    } catch (error) {
      console.error('Assignment submission upload failed:', error);
      alert('Failed to upload PDF. Please try again.');
      setSubmissionFileUrl('');
      setSubmissionFileName('');
    } finally {
      input.value = '';
      setUploadingSubmissionFile(false);
    }
  };

  const removeSubmissionFile = () => {
    setSubmissionFileUrl('');
    setSubmissionFileName('');
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
      const title = String(assignment.title || '');
      const course = String(assignment.course || '');
      const description = String(assignment.description || '');
      const needle = schoolSearch.toLowerCase();
      const matchesSearch = title.toLowerCase().includes(needle) ||
        course.toLowerCase().includes(needle) ||
        description.toLowerCase().includes(needle);
      
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

  // Practice handlers
  const handlePracticeAnswer = (questionId, value) => {
    setPracticeAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handlePracticeSubmit = async () => {
    if (!practiceQuestions.length) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setPracticeError('Login required');
      return;
    }
    setPracticeSubmitting(true);
    setPracticeError('');
    try {
      const payload = {
        answers: practiceQuestions.map((q) => ({
          questionId: q.id,
          answer: practiceAnswers[q.id] || '',
        })),
      };
      const res = await fetch(`${API_BASE}/api/practice/student/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || 'Unable to submit answers');
      }
      const data = await res.json();
      const resultMap = {};
      (data?.results || []).forEach((r) => {
        resultMap[String(r.questionId)] = r;
      });
      setPracticeResults(resultMap);
      setShowAnswers(true);

      const total = data?.total || 0;
      const correct = data?.correct || 0;
      const score = total > 0 ? Math.round((correct / total) * 100) : 0;
      if (score >= 70) {
        const awardKey = `practice_${practiceSubjectId}_${practiceType}`;
        if (!hasAward(awardKey)) {
          addPoints(10);
          markAwarded(awardKey);
        }
      }
    } catch (err) {
      console.error('Practice submit error:', err);
      setPracticeError(err.message || 'Failed to submit answers');
    } finally {
      setPracticeSubmitting(false);
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

  const loadPracticeMeta = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setPracticeError('Login required');
      return;
    }
    setPracticeLoading(true);
    setPracticeError('');
    try {
      const res = await fetch(`${API_BASE}/api/practice/student/meta`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || 'Unable to load practice metadata');
      }
      const data = await res.json();
      const subjects = Array.isArray(data?.subjects) ? data.subjects : [];
      setPracticeMeta({
        classId: data?.class?.id || null,
        className: data?.class?.name || '',
        sectionId: data?.section?.id || null,
        sectionName: data?.section?.name || '',
        subjects,
      });
      const firstSubjectId = subjects[0]?.id || '';
      setPracticeSubjectId(firstSubjectId);
    } catch (err) {
      console.error('Practice meta error:', err);
      setPracticeError(err.message || 'Failed to load practice metadata');
    } finally {
      setPracticeLoading(false);
    }
  };

  const loadPracticeQuestions = async (subjectId, type) => {
    if (!subjectId) {
      setPracticeQuestions([]);
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setPracticeError('Login required');
      return;
    }
    setPracticeLoading(true);
    setPracticeError('');
    try {
      const params = new URLSearchParams({ subjectId, type });
      const res = await fetch(`${API_BASE}/api/practice/student/questions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || 'Unable to load practice questions');
      }
      const data = await res.json();
      setPracticeQuestions(Array.isArray(data?.questions) ? data.questions : []);
      setPracticeAnswers({});
      setPracticeResults(null);
      setShowAnswers(false);
    } catch (err) {
      console.error('Practice load error:', err);
      setPracticeError(err.message || 'Failed to load practice questions');
    } finally {
      setPracticeLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentType !== 'eec') return;
    loadPracticeMeta();
  }, [assignmentType]);

  useEffect(() => {
    if (assignmentType !== 'eec') return;
    if (!practiceSubjectId) return;
    loadPracticeQuestions(practiceSubjectId, practiceType);
  }, [assignmentType, practiceSubjectId, practiceType]);

  // MCQ and Blank components
  const MCQ = ({ questions = [] }) => {
    return (
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const answer = practiceAnswers[q.id] || '';
          const result = practiceResults?.[String(q.id)] || null;
          return (
          <div key={q.id || idx} className="mb-5">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-sm font-semibold text-slate-800">Question {idx + 1}</p>
                </div>
                {result && (
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${result.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {result.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                )}
              </div>
              <div className="p-4 sm:p-6">
                <div className="text-slate-900 font-medium">{q.question}</div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {(q.options || []).map((option, oidx) => {
                    const selected = answer === option;
                    const isCorrect = result?.correctAnswer === option;
                    const showState = showAnswers && result;
                    const borderColor = showState
                      ? isCorrect
                        ? 'border-emerald-400 bg-emerald-50'
                        : selected
                        ? 'border-rose-300 bg-rose-50'
                        : 'border-slate-200'
                      : selected
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50';
                    return (
                      <label
                        key={oidx}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${borderColor}`}
                      >
                        <input
                          type="radio"
                          name={`q${idx}`}
                          value={option}
                          checked={selected}
                          onChange={(e) => handlePracticeAnswer(q.id, e.target.value)}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-slate-700">{option}</span>
                      </label>
                    );
                  })}
                </div>
                {showAnswers && result && (
                  <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${result.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
                    <div className={result.isCorrect ? 'text-emerald-800' : 'text-rose-700'}>
                      <span className="font-semibold">Your answer:</span> {answer || '-'} {result.isCorrect ? '✓' : '✗'}
                    </div>
                    {!result.isCorrect && (
                      <div className="mt-1 text-emerald-700">
                        <span className="font-semibold">Correct answer:</span> {result.correctAnswer}
                      </div>
                    )}
                    {result.explanation && (
                      <div className="mt-2 text-slate-700">
                        <span className="font-semibold">Explanation:</span> {result.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        })}
      </div>
    );
  };

  const Blank = ({ questions = [] }) => {
    return (
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const answer = practiceAnswers[q.id] || '';
          const result = practiceResults?.[String(q.id)] || null;
          return (
          <div key={q.id || idx} className="mb-5">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">{idx + 1}</div>
                  <div className="flex-1">
                    <div className="text-gray-900 font-medium">{q.question}</div>
                    <div className="mt-3">
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Type your answer here..."
                        value={answer}
                        onChange={(e) => handlePracticeAnswer(q.id, e.target.value)}
                      />
                    </div>
                    {showAnswers && result && (
                      <div className={`mt-3 rounded-lg border p-3 text-sm ${result.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className={result.isCorrect ? 'text-green-800' : 'text-red-800'}>
                          <span className="font-semibold">Your answer:</span> {answer || '-'} {result.isCorrect ? '✓' : '✗'}
                        </div>
                        {!result.isCorrect && (
                          <div className="text-green-800 mt-1">
                            <span className="font-semibold">Correct answer:</span> {result.correctAnswer}
                          </div>
                        )}
                        {result.explanation && <div className="text-gray-700 mt-1"><span className="font-semibold">Explanation:</span> {result.explanation}</div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        })}
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
                const daysText = days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? 'Due today' : `${days} days remaining`;
                const daysColor = days < 0 ? 'text-red-600 bg-red-50 border-red-200' : days <= 3 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-green-700 bg-green-50 border-green-200';
                const requiresPdf = assignment.submissionFormat === 'pdf';
                return (
                  <div
                    key={assignment.id}
                    onClick={() => openDetail(assignment)}
                    className={`bg-white rounded-xl border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden ${getPriorityColor(assignment.priority)}`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          {getStatusIcon(assignment.status)}
                          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-snug">{assignment.title}</h3>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusColor(assignment.status)}`}>
                          {assignment.status}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        {assignment.course && (
                          <span className="inline-flex items-center gap-1"><Book className="w-3.5 h-3.5" />{assignment.course}</span>
                        )}
                        {assignment.dueDate && (
                          <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Due {formatDate(assignment.dueDate)}</span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${requiresPdf ? 'border-purple-200 bg-purple-50 text-purple-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
                          {requiresPdf ? 'PDF Required' : 'Text Submission'}
                        </span>
                      </div>
                      {assignment.teacherName && (
                        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />{assignment.teacherName}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{assignment.description}</p>
                    </div>
                    <div className="px-5 pb-4 flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded border text-xs font-medium ${daysColor}`}>{daysText}</span>
                      <div className="flex items-center gap-2">
                        {assignment.maxMarks && (
                          <span className="text-xs text-gray-400">{assignment.maxMarks} marks</span>
                        )}
                        {assignment.attachments?.length > 0 && (
                          <span className="text-xs text-blue-500 flex items-center gap-0.5">
                            <Paperclip className="w-3 h-3" />{assignment.attachments.length}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-400" />
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

        {/* ── Detail Modal ── */}
        {selectedAssignment && (() => {
          const a = selectedAssignment;
          const days = getDaysRemaining(a.dueDate);
          const daysText = days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? 'Due today' : `${days} days remaining`;
          const daysColor = days < 0 ? 'text-red-600 bg-red-50 border-red-200' : days <= 3 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-green-700 bg-green-50 border-green-200';
          const isSubmitted = a.status === 'completed';
          const isOverdue = a.status === 'overdue';
          const requiresPdfUpload = a.submissionFormat === 'pdf';
          const uploadInputId = `assignment-upload-${a.id}`;
          const canSubmitAssignment = requiresPdfUpload ? Boolean(submissionFileUrl) : Boolean(submissionText.trim());

          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
              onClick={closeDetail}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className={`p-6 border-b border-gray-100 ${a.status === 'completed' ? 'bg-green-50' : a.status === 'overdue' ? 'bg-red-50' : 'bg-blue-50'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`shrink-0 p-2 rounded-lg ${a.status === 'completed' ? 'bg-green-100' : a.status === 'overdue' ? 'bg-red-100' : 'bg-blue-100'}`}>
                        {getStatusIcon(a.status)}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">{a.title}</h2>
                        {a.course && (
                          <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
                            <Book className="w-3.5 h-3.5" />{a.course}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={closeDetail}
                      className="shrink-0 p-1.5 rounded-lg hover:bg-white/60 transition-colors text-gray-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Meta pills */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(a.status)}`}>
                      {getStatusIcon(a.status)}
                      <span className="capitalize ml-0.5">{a.status}</span>
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${daysColor}`}>
                      <Clock className="w-3 h-3 mr-1" />{daysText}
                    </span>
                    {a.maxMarks && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        <Star className="w-3 h-3" />{a.maxMarks} marks
                      </span>
                    )}
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">

                  {/* Info grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {a.teacherName && (
                      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Teacher</p>
                          <p className="text-sm font-semibold text-gray-800 truncate">{a.teacherName}</p>
                        </div>
                      </div>
                    )}
                    {a.dueDate && (
                      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Due Date</p>
                          <p className="text-sm font-semibold text-gray-800">{formatDate(a.dueDate)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                    <div className={`w-9 h-9 rounded-full ${requiresPdfUpload ? 'bg-purple-100' : 'bg-green-100'} flex items-center justify-center shrink-0`}>
                      {requiresPdfUpload ? (
                        <Upload className="w-4 h-4 text-purple-600" />
                      ) : (
                        <FileText className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Submission Format</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {requiresPdfUpload ? 'Upload PDF file' : 'Write directly in portal'}
                      </p>
                      <p className="text-xs text-gray-500">{requiresPdfUpload ? 'Attach a single PDF up to 20MB.' : 'Type your response and submit online.'}</p>
                    </div>
                  </div>

                  {/* Description */}
                  {a.description && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Instructions</h3>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line bg-gray-50 rounded-xl p-4">
                        {a.description}
                      </p>
                    </div>
                  )}

                  {/* Attachments */}
                  {a.attachments?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Attachments</h3>
                      <div className="space-y-2">
                        {a.attachments.map((att, i) => (
                          <a
                            key={i}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm text-blue-700 font-medium truncate flex-1">{att.name || `Attachment ${i + 1}`}</span>
                            <Download className="w-4 h-4 text-blue-500 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grade / Feedback */}
                  {isSubmitted && a.score !== undefined && a.score !== null && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-green-600" />
                        <h3 className="text-sm font-semibold text-green-800">Result</h3>
                      </div>
                      <p className="text-2xl font-bold text-green-700">{a.score} <span className="text-base font-normal text-green-600">/ {a.maxMarks}</span></p>
                      {a.feedback && (
                        <p className="mt-2 text-sm text-green-700 bg-white/60 rounded-lg p-3">
                          <span className="font-medium">Feedback: </span>{a.feedback}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Submitted (no score yet) */}
                  {isSubmitted && (a.score === undefined || a.score === null) && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">Submitted</p>
                        {a.submittedAt && (
                          <p className="text-xs text-green-600">on {formatDate(a.submittedAt)}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submit section */}
                  {!isSubmitted && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                        {isOverdue ? 'Submit (Late)' : requiresPdfUpload ? 'Upload Your PDF' : 'Your Answer'}
                      </h3>
                      {submitSuccess ? (
                        <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                          <p className="text-sm font-semibold text-green-800">Submitted successfully!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {requiresPdfUpload ? (
                            <>
                              <div className="border-2 border-dashed border-purple-200 rounded-xl p-6 text-center bg-purple-50/40">
                                {uploadingSubmissionFile ? (
                                  <p className="text-sm text-purple-600">Uploading your file...</p>
                                ) : (
                                  <>
                                    <Upload className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                                    <p className="text-sm text-purple-800 mb-3">Drop your PDF here or use the button below.</p>
                                    <input
                                      type="file"
                                      accept="application/pdf"
                                      id={uploadInputId}
                                      className="hidden"
                                      onChange={handleSubmissionFileUpload}
                                    />
                                    <label
                                      htmlFor={uploadInputId}
                                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm cursor-pointer hover:bg-purple-700 transition-colors"
                                    >
                                      <Upload className="w-4 h-4" />
                                      Select PDF
                                    </label>
                                    <p className="text-xs text-purple-500 mt-2">Maximum file size: 20MB</p>
                                  </>
                                )}
                              </div>
                              {submissionFileUrl && (
                                <div className="flex items-center justify-between bg-white border border-purple-200 rounded-xl p-3">
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-purple-600" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-800">{submissionFileName || 'Uploaded PDF'}</p>
                                      <a
                                        href={submissionFileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-purple-600 hover:underline"
                                      >
                                        Preview file
                                      </a>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={removeSubmissionFile}
                                    className="text-xs text-red-600 hover:text-red-700"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                              <textarea
                                value={submissionText}
                                onChange={e => setSubmissionText(e.target.value)}
                                rows={3}
                                placeholder="Add any notes for your teacher (optional)..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                              />
                            </>
                          ) : (
                            <textarea
                              value={submissionText}
                              onChange={e => setSubmissionText(e.target.value)}
                              rows={5}
                              placeholder="Write your answer or submission notes here..."
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                            />
                          )}
                          <button
                            onClick={handleSubmit}
                            disabled={submitting || !canSubmitAssignment}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                              isOverdue
                                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                : requiresPdfUpload
                                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <SendHorizonal className="w-4 h-4" />
                            {submitting ? 'Submitting…' : isOverdue ? 'Submit Late' : 'Submit Assignment'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
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
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Hero Header */}
        <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-r from-sky-50 via-indigo-50 to-violet-50 p-6 sm:p-8">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #93c5fd 0, transparent 40%), radial-gradient(circle at 80% 30%, #a5b4fc 0, transparent 40%)' }} />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">EEC Practice Paper</h2>
              <p className="mt-1 text-sm text-slate-600">Challenge yourself with curated questions</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700">
                Class: {practiceMeta ? `${practiceMeta.className}${practiceMeta.sectionName ? ` - ${practiceMeta.sectionName}` : ''}` : 'Loading...'}
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
                <span className="text-[10px] uppercase tracking-wide text-slate-400">Subject</span>
                <select
                  value={practiceSubjectId}
                  onChange={(e) => setPracticeSubjectId(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  {(practiceMeta?.subjects || []).map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
                <span className="text-[10px] uppercase tracking-wide text-slate-400">Type</span>
                <select
                  value={practiceType}
                  onChange={(e) => setPracticeType(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="mcq">Multiple Choice</option>
                  <option value="blank">Fill in the Blank</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Bar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-6 py-4 text-sm text-slate-600">
          <div className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
            Questions: {practiceQuestions.length}
          </div>
          {practiceResults && (
            <div className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              Score: {Object.values(practiceResults).filter((r) => r.isCorrect).length}/{practiceQuestions.length}
            </div>
          )}
          <div className="ml-auto text-xs text-slate-500">
            Tip: Read carefully before selecting an answer.
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7">
          {practiceError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {practiceError}
            </div>
          )}
          {practiceLoading && (
            <div className="text-sm text-slate-500">Loading questions...</div>
          )}
          {!practiceLoading && practiceQuestions.length === 0 && (
            <div className="text-sm text-slate-500">No questions available for this subject.</div>
          )}
          {!practiceLoading && practiceQuestions.length > 0 && (
            practiceType === "mcq" 
              ? <MCQ questions={practiceQuestions} />
              : <Blank questions={practiceQuestions} />
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handlePracticeSubmit}
            disabled={practiceSubmitting || practiceQuestions.length === 0}
          >
            {practiceSubmitting ? 'Submitting...' : 'Submit Answers'}
          </button>
          <button
            className={`rounded-lg border px-4 py-2 text-sm font-medium ${showAnswers ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
            onClick={() => setShowAnswers(!showAnswers)}
            disabled={!practiceResults}
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
