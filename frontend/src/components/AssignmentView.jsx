import React, { useEffect, useState, useRef } from "react";
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
import { questionPaper } from "./questionPaper";
import ChoiceMatrix from '../tryout/choice_matrix';
import ClozeDragDrop from '../tryout/cloze_drag_drop';
import ClozeDropDown from '../tryout/cloze_drop_down';
import ClozeText from '../tryout/cloze_text';
import FileUpload from '../tryout/file_upload';
import ImageHighlighter from '../tryout/image_highlighter';
import MatchList from '../tryout/match_list';
import MCQTryout from '../tryout/mcq';
import TextEditor from '../tryout/plain_txt';
import SortList from '../tryout/sort_list';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import PointsBadge from './PointsBadge';
import { addPoints, hasAward, markAwarded, getPoints } from '../utils/points';


const AssignmentView = () => {
  const [filter, setFilter] = useState("all"); // all, pending, completed, overdue
  const [assignmentType, setAssignmentType] = useState("school"); // 'school' or 'eec'
  const [tryoutType, setTryoutType] = useState("names"); // default tryout type
  // Flashcard state
  const [flashDeck, setFlashDeck] = useState([]); // [{front, back}]
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashFlipped, setFlashFlipped] = useState(false);
  const [flashKnown, setFlashKnown] = useState({}); // {idx: true}
  const [flashShuffle, setFlashShuffle] = useState(false);


  // Sample assignment data
  const assignments = [
  {
    id: 1,
    title: "Geometry Project",
    course: "Mathematics",
    dueDate: "2025-06-20",
    status: "pending",
    priority: "high",
    description: "Design and explain properties of different types of triangles",
    submissionType: "file",
    maxMarks: 100
  },
  {
    id: 2,
    title: "Essay Writing Assignment",
    course: "English",
    dueDate: "2025-06-18",
    status: "completed",
    priority: "medium",
    description: "Write an essay on the importance of environmental conservation",
    submissionType: "link",
    maxMarks: 75,
    submittedAt: "2025-06-15"
  },
  {
    id: 3,
    title: "Science Lab Report",
    course: "Science",
    dueDate: "2025-06-12",
    status: "overdue",
    priority: "high",
    description: "Prepare a report on chemical reactions observed in the lab",
    submissionType: "file",
    maxMarks: 50
  },
  {
    id: 4,
    title: "History Presentation",
    course: "History",
    dueDate: "2025-06-25",
    status: "pending",
    priority: "medium",
    description: "Create a presentation on India’s freedom struggle",
    submissionType: "presentation",
    maxMarks: 80
  }
];

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

  const [schoolSearch, setSchoolSearch] = useState("");
  const [schoolSort, setSchoolSort] = useState("due_asc"); // due_asc | due_desc | priority | status

  const filteredAssignments = assignments
    .filter((assignment) => (filter === 'all' ? true : assignment.status === filter))
    .filter((a) => {
      if (!schoolSearch.trim()) return true;
      const q = schoolSearch.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.course.toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (schoolSort === 'due_asc' || schoolSort === 'due_desc') {
        const da = new Date(a.dueDate).getTime();
        const db = new Date(b.dueDate).getTime();
        return schoolSort === 'due_asc' ? da - db : db - da;
      }
      if (schoolSort === 'priority') {
        const weight = { high: 3, medium: 2, low: 1 };
        return (weight[b.priority] || 0) - (weight[a.priority] || 0);
      }
      if (schoolSort === 'status') {
        const order = { overdue: 3, pending: 2, completed: 1 };
        return (order[b.status] || 0) - (order[a.status] || 0);
      }
      return 0;
    });

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

  // State for EEC Tryout answers and feedback
  const [questionType, setQuestionType] = useState("mcq");
  // EEC Tryout questions and brain games
  const [selectedClass, setSelectedClass] = useState("5");
  const [eecSubject, setEecSubject] = useState("science"); // 'science', 'math', 'game'
  const [questionData, setQuestionData] = useState(questionPaper);
  const [insight, setInsight] = useState({studentClass: selectedClass, subject: eecSubject, startTime: new Date(), questionType: questionType, endTime: null, correct: 0, incorrect: 0});

  // Lab controls state
  const [labControls, setLabControls] = useState({
    rotation: 0,
    zoom: 1,
    animationSpeed: 1,
    isAnimating: false
  });
  // Lab Three.js viewer refs
  const labContainerRef = useRef(null);
  const labSceneRef = useRef(null);
  const labRendererRef = useRef(null);
  const labCameraRef = useRef(null);
  const labModelRef = useRef(null);
  const labAnimRef = useRef(null);
  const labInitialCamPosRef = useRef(null);
  const labControlsRef = useRef(labControls);

  useEffect(() => { labControlsRef.current = labControls; }, [labControls]);

  useEffect(() => {
    if (assignmentType !== 'lab') {
      if (labAnimRef.current) cancelAnimationFrame(labAnimRef.current);
      if (labRendererRef.current) {
        labRendererRef.current.dispose();
        labRendererRef.current = null;
      }
      labSceneRef.current = null;
      labCameraRef.current = null;
      labModelRef.current = null;
      labInitialCamPosRef.current = null;
      return;
    }

    if (!labContainerRef.current) return;

    const container = labContainerRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xf8f9fa, 1);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 5, 5);
    scene.add(dir);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const loader = new GLTFLoader();
    loader.load(
      '/complex-h2o.glb',
      (gltf) => {
        const model = gltf.scene || gltf.scenes?.[0];
        if (!model) return;

        // Ensure the canvas fills the container
        if (renderer.domElement) {
          renderer.domElement.style.width = '100%';
          renderer.domElement.style.height = '100%';
          renderer.domElement.style.display = 'block';
        }

        // Center model at origin and compute fit
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Wrap model to re-center
        const wrapper = new THREE.Group();
        wrapper.add(model);
        scene.add(wrapper);
        labModelRef.current = wrapper;
        model.position.sub(center); // center at origin

        // Frame the model so it fits inside the viewer
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const fov = (camera.fov * Math.PI) / 180;
        const cameraZ = (maxDim / 2) / Math.tan(fov / 2) * 1.5; // 1.5 margin
        camera.position.set(0, 0, cameraZ);
        camera.near = cameraZ / 100;
        camera.far = cameraZ * 100;
        camera.updateProjectionMatrix();
        camera.lookAt(0, 0, 0);
        labInitialCamPosRef.current = camera.position.clone();

        let baseRotation = 0;
        const animate = () => {
          labAnimRef.current = requestAnimationFrame(animate);
          const c = labControlsRef.current;
          if (labInitialCamPosRef.current) {
            const base = labInitialCamPosRef.current.clone();
            const zoom = Math.max(0.5, Math.min(3, c.zoom || 1));
            camera.position.copy(base.multiplyScalar(1 / zoom));
          }
          if (c.isAnimating && (c.animationSpeed || 0) > 0) {
            baseRotation += 0.01 * c.animationSpeed;
            wrapper.rotation.y = baseRotation;
          } else {
            wrapper.rotation.y = ((c.rotation || 0) * Math.PI) / 180;
            baseRotation = wrapper.rotation.y;
          }
          renderer.render(scene, camera);
        };
        animate();
      },
      undefined,
      (err) => {
        console.error('Failed to load GLB:', err);
      }
    );

    labSceneRef.current = scene;
    labRendererRef.current = renderer;
    labCameraRef.current = camera;

    const onResize = () => {
      if (!labRendererRef.current || !labCameraRef.current || !labContainerRef.current) return;
      const w = labContainerRef.current.clientWidth || 400;
      const h = labContainerRef.current.clientHeight || 400;
      labRendererRef.current.setSize(w, h);
      labCameraRef.current.aspect = w / h;
      labCameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (labAnimRef.current) cancelAnimationFrame(labAnimRef.current);
      if (labSceneRef.current) {
        labSceneRef.current.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose?.();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose?.());
            else obj.material.dispose?.();
          }
        });
      }
      if (labRendererRef.current) labRendererRef.current.dispose();
      labSceneRef.current = null;
      labRendererRef.current = null;
      labCameraRef.current = null;
      labModelRef.current = null;
      labInitialCamPosRef.current = null;
    };
  }, [assignmentType]);

  useEffect(() => {
    if(!selectedClass || !questionData[selectedClass]) return;
    setEecSubject(Object.keys(questionData[selectedClass])[0])
  }, [selectedClass])

  useEffect(() => {
    setInsight({studentClass: selectedClass, subject: eecSubject, questionType: questionType, startTime: new Date(), endTime: null, correct: 0, incorrect: 0});
  }, [selectedClass, eecSubject, questionType])

  // Build flashcard deck from questionPaper (MCQ -> front: question, back: answer + explanation)
  useEffect(() => {
    if (!questionData[selectedClass] || !questionData[selectedClass][eecSubject]) {
      setFlashDeck([]);
      setFlashIndex(0);
      setFlashKnown({});
      setFlashFlipped(false);
      return;
    }
    const mcq = questionData[selectedClass][eecSubject]?.mcq || [];
    let deck = mcq.map((q) => ({
      front: q.q,
      back: `${q.a ? `Answer: ${q.a}` : ''}${q.e ? `\n${q.e}` : ''}`.trim(),
    }));
    if (flashShuffle) {
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
    }
    setFlashDeck(deck);
    setFlashIndex(0);
    setFlashKnown({});
    setFlashFlipped(false);
  }, [questionData, selectedClass, eecSubject, flashShuffle]);

  // Keyboard controls for FlashCard mode
  useEffect(() => {
    if (assignmentType !== 'flashcard') return;
    const onKeyDown = (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        setFlashFlipped((f) => !f);
      } else if (e.key === 'ArrowRight') {
        setFlashFlipped(false);
        setFlashIndex((i) => (flashDeck.length ? Math.min(i + 1, flashDeck.length - 1) : 0));
      } else if (e.key === 'ArrowLeft') {
        setFlashFlipped(false);
        setFlashIndex((i) => (i > 0 ? i - 1 : 0));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [assignmentType, flashDeck.length]);

  return (
    <div className="w-full min-h-screen bg-white px-1 sm:px-4 md:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Assignment Type Dropdown */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your assignments and submissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <PointsBadge />
          <label htmlFor="assignmentType" className="font-medium text-gray-700">Type:</label>
          <select
            id="assignmentType"
            value={assignmentType}
            onChange={e => setAssignmentType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="school">School Assignment</option>
            <option value="eec">Practice Paper</option>
            <option value="tryout">Tryout</option>
            <option value="lab">Lab</option>
            <option value="flashcard">FlashCard</option>
          </select>
        </div>
      </div>

      {/* School Assignment Section */}
      {assignmentType === 'school' && (
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
                    <p className="mt-3 text-gray-700 line-clamp-3">{assignment.description}</p>
                  </div>
                  <div className="px-5 pb-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded border text-xs font-medium ${daysColor}`}>{daysText}</span>
                        <span className="text-xs text-gray-500">Submission: {assignment.submissionType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {assignment.status === 'pending' && (
                          <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">Submit</button>
                        )}
                        <button className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm inline-flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAssignments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
              <p className="text-gray-600">Try adjusting the search, filter, or sort options.</p>
            </div>
          )}
        </>
      )}

      {/* FlashCard Section */}
      {assignmentType === 'flashcard' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <label htmlFor="fcClass" className="font-medium text-gray-700">Class:</label>
            <select
              id="fcClass"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.keys(questionData).map((cls) => (
                <option key={cls} value={cls}>{`Class ${cls}`}</option>
              ))}
            </select>

            <label htmlFor="fcSubject" className="font-medium text-gray-700">Subject:</label>
            <select
              id="fcSubject"
              value={eecSubject}
              onChange={(e) => setEecSubject(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.keys(questionData[selectedClass] || {}).map((subject) => {
                let displayName = subject;
                if (subject.toLowerCase() === 'eng') displayName = 'English';
                else if (subject.toLowerCase() === 'math') displayName = 'Mathematics';
                else displayName = subject.charAt(0).toUpperCase() + subject.slice(1);
                return <option key={subject} value={subject}>{displayName}</option>;
              })}
            </select>

            <label className="inline-flex items-center gap-2 ml-auto cursor-pointer select-none">
              <input
                type="checkbox"
                checked={flashShuffle}
                onChange={(e) => setFlashShuffle(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 text-sm">Shuffle</span>
            </label>
          </div>

          {/* Context + Progress */}
          <div className="mb-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{`Class ${selectedClass}`}</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">{eecSubject}</span>
              </div>
              <div className="flex items-center gap-3">
                <span>Card {flashDeck.length ? flashIndex + 1 : 0} / {flashDeck.length}</span>
                <span>Known {Object.values(flashKnown).filter(Boolean).length}/{flashDeck.length}</span>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${flashDeck.length ? ((flashIndex + 1) / flashDeck.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Card */}
          <div className="flex justify-center items-center">
            <div
              role="button"
              tabIndex={0}
              aria-label="Flashcard. Press to flip."
              onClick={() => setFlashFlipped((f) => !f)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  setFlashFlipped((f) => !f);
                }
              }}
              className="relative w-full max-w-3xl aspect-[4/3] sm:aspect-[5/3] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-gray-200 shadow-xl overflow-hidden cursor-pointer transition-transform duration-200 hover:shadow-2xl"
              style={{ perspective: '1000px' }}
            >
              {/* Subject background illustration */}
              <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                {(['math'].includes(eecSubject)) && (
                  <svg viewBox="0 0 600 400" className="w-full h-full opacity-20" aria-hidden="true">
                    <defs>
                      <linearGradient id="mg" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                    <rect x="-10" y="-10" width="620" height="420" fill="url(#mg)" opacity="0.06" />
                    <circle cx="100" cy="90" r="60" fill="none" stroke="#2563eb" strokeWidth="2" />
                    <circle cx="120" cy="110" r="20" fill="none" stroke="#2563eb" strokeWidth="2" />
                    <path d="M350,300 l120,-200 l-240,0 z" fill="none" stroke="#7c3aed" strokeWidth="2" />
                    <path d="M345,300 A40,40 0 0 0 390,260" fill="none" stroke="#0ea5e9" strokeWidth="2" />
                    <line x1="60" y1="320" x2="540" y2="320" stroke="#0ea5e9" strokeDasharray="6 6" strokeWidth="2" />
                    <text x="70" y="335" fontSize="14" fill="#2563eb">x</text>
                    <line x1="80" y1="330" x2="80" y2="80" stroke="#0ea5e9" strokeDasharray="6 6" strokeWidth="2" />
                    <text x="90" y="95" fontSize="14" fill="#2563eb">y</text>
                  </svg>
                )}
                {(['biology','science'].includes(eecSubject)) && (
                  <svg viewBox="0 0 600 400" className="w-full h-full opacity-20" aria-hidden="true">
                    <defs>
                      <linearGradient id="bio" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    <rect x="-10" y="-10" width="620" height="420" fill="url(#bio)" opacity="0.06" />
                    {/* DNA double helix */}
                    <path d="M200,60 C260,100 260,140 200,180 C140,220 140,260 200,300" fill="none" stroke="#059669" strokeWidth="3" />
                    <path d="M240,60 C180,100 180,140 240,180 C300,220 300,260 240,300" fill="none" stroke="#10b981" strokeWidth="3" />
                    {Array.from({length: 6}).map((_,i)=>{
                      const y=80+i*40;return (
                        <g key={i}>
                          <line x1="200" y1={y} x2="240" y2={y} stroke="#34d399" strokeWidth="2" />
                          <circle cx="200" cy={y} r="3" fill="#34d399" />
                          <circle cx="240" cy={y} r="3" fill="#34d399" />
                        </g>
                      )})}
                    {/* Leaf */}
                    <path d="M420,120 C470,110 510,140 520,180 C480,200 440,190 420,160 Z" fill="#a7f3d0" stroke="#10b981" strokeWidth="2" />
                    <path d="M420,120 C455,145 480,165 520,180" fill="none" stroke="#059669" strokeWidth="2" />
                  </svg>
                )}
                {(['chemistry','chem'].includes(eecSubject)) && (
                  <svg viewBox="0 0 600 400" className="w-full h-full opacity-20" aria-hidden="true">
                    <defs>
                      <linearGradient id="chem" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                    <rect x="-10" y="-10" width="620" height="420" fill="url(#chem)" opacity="0.06" />
                    {/* Erlenmeyer flask */}
                    <path d="M120,80 l40,0 l10,80 c20,20 40,80 -60,80 c-100,0 -80,-60 -60,-80 l10,-80 z" fill="#fde68a" stroke="#f59e0b" strokeWidth="2" opacity="0.7" />
                    <path d="M135,80 l50,0" stroke="#9ca3af" strokeWidth="3" />
                    <circle cx="150" cy="70" r="4" fill="#fbbf24" />
                    <circle cx="165" cy="65" r="3" fill="#f87171" />
                    {/* Test tube */}
                    <rect x="480" y="80" width="20" height="120" rx="10" fill="#fecaca" stroke="#ef4444" strokeWidth="2" />
                    <rect x="475" y="70" width="30" height="10" rx="5" fill="#fca5a5" />
                    {/* Bubbles */}
                    <circle cx="490" cy="60" r="3" fill="#ef4444" />
                    <circle cx="500" cy="50" r="2" fill="#ef4444" />
                    {/* Molecule hexagon */}
                    <g stroke="#f59e0b" fill="none" strokeWidth="2">
                      <polygon points="300,150 330,170 330,205 300,225 270,205 270,170" />
                      <line x1="330" y1="170" x2="360" y2="150" />
                      <circle cx="360" cy="150" r="4" fill="#f59e0b" />
                      <line x1="270" y1="170" x2="245" y2="150" />
                      <circle cx="245" cy="150" r="4" fill="#f59e0b" />
                    </g>
                  </svg>
                )}
                {(['physics','phy'].includes(eecSubject)) && (
                  <svg viewBox="0 0 600 400" className="w-full h-full opacity-20" aria-hidden="true">
                    <defs>
                      <linearGradient id="phys" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                    <rect x="-10" y="-10" width="620" height="420" fill="url(#phys)" opacity="0.06" />
                    {/* Sine wave */}
                    <path d="M20,260 C60,220 100,300 140,260 C180,220 220,300 260,260 C300,220 340,300 380,260 C420,220 460,300 500,260 C540,220 580,300 620,260" fill="none" stroke="#22d3ee" strokeWidth="2" />
                    {/* Pendulum */}
                    <line x1="460" y1="40" x2="520" y2="120" stroke="#0ea5e9" strokeWidth="3" />
                    <circle cx="520" cy="120" r="14" fill="#0ea5e9" opacity="0.6" />
                    <rect x="440" y="28" width="60" height="6" rx="3" fill="#38bdf8" />
                    {/* Vector arrows */}
                    <g stroke="#6366f1" strokeWidth="2">
                      <line x1="90" y1="320" x2="150" y2="320" />
                      <polygon points="150,320 140,315 140,325" fill="#6366f1" />
                      <line x1="90" y1="320" x2="90" y2="260" />
                      <polygon points="90,260 85,270 95,270" fill="#6366f1" />
                    </g>
                    {/* Atom orbits */}
                    <g stroke="#60a5fa" fill="none">
                      <ellipse cx="310" cy="120" rx="30" ry="14" />
                      <ellipse cx="310" cy="120" rx="30" ry="14" transform="rotate(60 310 120)" />
                      <ellipse cx="310" cy="120" rx="30" ry="14" transform="rotate(-60 310 120)" />
                      <circle cx="310" cy="120" r="3" fill="#60a5fa" />
                    </g>
                  </svg>
                )}
              </div>
              <div
                className={`absolute inset-0 transition-transform duration-500`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flashFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-center backface-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="text-xs sm:text-sm text-blue-700 font-medium mb-2">Question</div>
                  <div className="text-gray-900 text-lg sm:text-2xl leading-relaxed max-h-full overflow-y-auto pr-1">
                    {flashDeck[flashIndex]?.front || 'No cards available for this selection.'}
                  </div>
                </div>
                {/* Back */}
                <div
                  className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-center bg-white/90 backdrop-blur backface-hidden rounded-2xl border border-blue-200"
                  style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                >
                  <div className="text-xs sm:text-sm text-green-700 font-medium mb-2">Answer</div>
                  <pre className="text-gray-900 whitespace-pre-wrap text-base sm:text-xl leading-relaxed max-h-full overflow-y-auto pr-1">
                    {flashDeck[flashIndex]?.back || '—'}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex flex-wrap items-center gap-3 justify-center">
            <button
              onClick={() => setFlashFlipped((f) => !f)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {flashFlipped ? 'Show Question' : 'Show Answer'}
            </button>
            <button
              onClick={() => {
                setFlashIndex(0);
                setFlashKnown({});
                setFlashFlipped(false);
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Restart
            </button>
            <button
              onClick={() => {
                setFlashKnown((prev) => ({ ...prev, [flashIndex]: true }));
                setFlashFlipped(false);
                if (flashIndex < flashDeck.length - 1) setFlashIndex(flashIndex + 1);
              }}
              className="px-4 py-2 rounded-lg border border-green-600 text-green-700 hover:bg-green-50"
            >
              Mark Known
            </button>
            <button
              onClick={() => {
                setFlashKnown((prev) => ({ ...prev, [flashIndex]: false }));
                setFlashFlipped(false);
                if (flashIndex < flashDeck.length - 1) setFlashIndex(flashIndex + 1);
              }}
              className="px-4 py-2 rounded-lg border border-amber-600 text-amber-700 hover:bg-amber-50"
            >
              Mark Unknown
            </button>
            <div className="w-full sm:w-auto flex justify-center gap-3 mt-2">
              <button
                onClick={() => {
                  setFlashFlipped(false);
                  setFlashIndex((i) => (i > 0 ? i - 1 : 0));
                }}
                disabled={flashIndex === 0}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  setFlashFlipped(false);
                  setFlashIndex((i) => (flashDeck.length ? Math.min(i + 1, flashDeck.length - 1) : 0));
                }}
                disabled={flashDeck.length === 0 || flashIndex === flashDeck.length - 1}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-xs text-blue-700">Total Cards</div>
              <div className="text-lg font-semibold text-blue-900">{flashDeck.length}</div>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="text-xs text-green-700">Known</div>
              <div className="text-lg font-semibold text-green-900">{Object.values(flashKnown).filter(Boolean).length}</div>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="text-xs text-amber-700">Unknown</div>
              <div className="text-lg font-semibold text-amber-900">{Object.values(flashKnown).filter((v) => v === false).length}</div>
            </div>
          </div>

          {/* Empty state */}
          {flashDeck.length === 0 && (
            <div className="mt-6 text-center text-gray-600">
              No flashcards found for this Class and Subject. Try a different selection.
            </div>
          )}
        </div>
      )}

      {/* EEC Tryout Section */}
      {assignmentType === 'eec' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
          {/* Header */}
          <div className="p-6 sm:p-7 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Practice Paper</h2>
                <p className="text-gray-600 mt-1">Answer the questions below and review instant feedback</p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Class {selectedClass}</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">{eecSubject}</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  {questionType === 'mcq' ? (questionData[selectedClass][eecSubject]?.mcq?.length || 0) : (questionData[selectedClass][eecSubject]?.blank?.length || 0)} questions
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="classSelect" className="text-sm font-medium text-gray-700 whitespace-nowrap">Class</label>
                <select
                  id="classSelect"
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.keys(questionData).map((cls) => (
                    <option key={cls} value={cls}>{`Class ${cls}`}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="eecSubject" className="text-sm font-medium text-gray-700 whitespace-nowrap">Subject</label>
                <select
                  id="eecSubject"
                  value={eecSubject}
                  onChange={e => setEecSubject(e.target.value)}
                  className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
                >
                      {Object.keys(questionData[selectedClass]).map((subject) => {
                        let displayName = subject;
                        if (subject.toLowerCase() === 'eng') displayName = 'English';
                        else if (subject.toLowerCase() === 'math') displayName = 'Mathematics';
                        else displayName = subject.charAt(0).toUpperCase() + subject.slice(1);
                        return <option key={subject} value={subject}>{displayName}</option>;
                      })}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Question Type</label>
                <select
                  className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => setQuestionType(e.target.value)}
                  value={questionType}
                >
                  <option value="mcq">MCQ</option>
                  <option value="blank">Fill in the Blanks</option>
                </select>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="p-6 sm:p-7">
            {
              questionType === "mcq"
                ? <MCQ array={questionData[selectedClass][eecSubject]?.mcq} insight={insight} setInsight={setInsight} />
                : <Blank array={questionData[selectedClass][eecSubject]?.blank} insight={insight} setInsight={setInsight} />
          }
          </div>
        </div>
      )}

      {/* Tryout Section */}
      {assignmentType === 'tryout' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
          <div className="mb-6 flex flex-wrap items-center gap-3 justify-left">
            <label htmlFor="tryoutType" className="font-medium text-gray-700">Tryout Type:</label>
            <select
              id="tryoutType"
              value={tryoutType}
              onChange={e => setTryoutType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="choice_matrix">Choice Matrix</option>
              <option value="cloze_drag_drop">Cloze Drag Drop</option>
              <option value="cloze_drop_down">Cloze Drop Down</option>
              <option value="cloze_text">Cloze Text</option>
              <option value="file_upload">File Upload</option>
              <option value="image_highlighter">Image Highlighter</option>
              <option value="match_list">Match List</option>
              <option value="mcq">MCQ</option>
              <option value="plain_txt">Plain Text</option>
              <option value="sort_list">Sort List</option>
            </select>
          </div>
          <div>
            {tryoutType === 'choice_matrix' && <ChoiceMatrix />}
            {tryoutType === 'cloze_drag_drop' && <ClozeDragDrop />}
            {tryoutType === 'cloze_drop_down' && <ClozeDropDown />}
            {tryoutType === 'cloze_text' && <ClozeText />}
            {tryoutType === 'file_upload' && <FileUpload />}
            {tryoutType === 'image_highlighter' && <ImageHighlighter />}
            {tryoutType === 'match_list' && <MatchList />}
            {tryoutType === 'mcq' && <MCQTryout />}
            {tryoutType === 'plain_txt' && <TextEditor />}
            {tryoutType === 'sort_list' && <SortList />}
            {tryoutType === 'names' && (
              <div className="text-gray-500 text-center py-8">Select The Tryout From The Drop Down Menu.</div>
            )}
            {tryoutType === 'rich_text' && (
              <div className="text-gray-500 text-center py-8">Rich Text tryout is not available. Please check the file name or implementation.</div>
            )}
            {![
              'choice_matrix','cloze_drag_drop','cloze_drop_down','cloze_text','file_upload','image_highlighter','match_list','mcq','plain_txt','rich_text','sort_list','names'
            ].includes(tryoutType) && (
              <div className="text-gray-500 text-center py-8">Select a tryout type to begin.</div>
            )}
          </div>
          <div className="mt-6">
            <button
              onClick={() => {
                const awardKey = `tryout_${tryoutType}`;
                if (!hasAward(awardKey)) {
                  addPoints(5);
                  markAwarded(awardKey);
                  const el = document.createElement('div');
                  el.className = 'fixed top-20 right-6 bg-emerald-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce z-50';
                  el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 10.05a7 7 0 0 1 9.9 0l10 10"></path><path d="M13 13h8"></path></svg><span>+5 Points</span>';
                  document.body.appendChild(el);
                  setTimeout(() => document.body.removeChild(el), 1800);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow"
            >
              <Coins className="w-4 h-4" />
              Mark Tryout Completed & Collect +5
            </button>
          </div>
        </div>
      )}

      {/* Lab Section */}
      {assignmentType === 'lab' && (
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
                      onChange={(e) => setLabControls(prev => ({...prev, rotation: parseFloat(e.target.value)}))}
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
                      onChange={(e) => setLabControls(prev => ({...prev, zoom: parseFloat(e.target.value)}))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Animation Speed ({labControls.animationSpeed.toFixed(1)}x)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={labControls.animationSpeed}
                      onChange={(e) => setLabControls(prev => ({...prev, animationSpeed: parseFloat(e.target.value)}))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Model Name:</span>
                    <span className="font-medium">H2O Molecule</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">File Size:</span>
                    <span className="font-medium">2.4 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium">GLB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Atoms:</span>
                    <span className="font-medium">3 (2 Hydrogen, 1 Oxygen)</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => setLabControls(prev => ({...prev, isAnimating: !prev.isAnimating}))}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                    labControls.isAnimating 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {labControls.isAnimating ? 'Stop Simulation' : 'Start Simulation'}
                </button>
                <button 
                  onClick={() => {
                    setLabControls({ rotation: 0, zoom: 1, animationSpeed: 1, isAnimating: false });
                    if (labCameraRef.current && labInitialCamPosRef.current) {
                      labCameraRef.current.position.copy(labInitialCamPosRef.current);
                      labCameraRef.current.lookAt(0, 0, 0);
                    }
                    if (labModelRef.current) labModelRef.current.rotation.set(0, 0, 0);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset View
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Learning Objectives</h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Understand the molecular structure of water (H2O)
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Visualize bond angles and molecular geometry
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Explore atomic interactions and properties
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

function MCQ({array, insight, setInsight}) {
  const [eecFeedback, setEecFeedback] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [eecAnswers, setEecAnswers] = useState({}); // { [idx]: userInput }
  const [checked, setChecked] = useState(false)
  const [showPointPopup, setShowPointPopup] = useState(false);


  useEffect(() => {
    setShowAnswers(false);
    setEecFeedback(null);
  }, [array])

  useEffect(() => {
    if (!checked) return
    fetch(`${import.meta.env.VITE_API_URL}/api/behaviour/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(insight)
    }).then(res => {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    }).then(data => {
      console.log(data)
    }).catch(error => {
      console.error(error);
    })
    setChecked(false)
  }, [checked])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [showAnswers])

  // Handler for answer input
  const handleEecInput = (idx, value) => {
    setEecAnswers((prev) => ({ ...prev, [idx]: value }));
    setEecFeedback(null);
  };
  // Handler for answer check
  const handleEecCheck = () => {
    let correction = []
    array.forEach((q, idx) => {
      const userAns = (eecAnswers[idx] || "").trim().toLowerCase();
      const correct = (q.a || "").trim().toLowerCase();
      correction.push(userAns === correct)
    });
    setEecFeedback(correction);
    setShowAnswers(true);
    setInsight((prev) => {
      return {...prev, endTime: new Date(), correct: correction.filter(c => c).length, incorrect: correction.filter(c => !c).length}
    })
    // Award points if all correct and not previously awarded for this paper
    try {
      const allCorrect = correction.length > 0 && correction.every(Boolean);
      const awardKey = `${insight?.studentClass || 'cls'}_${insight?.subject || 'sub'}_${insight?.questionType || 'type'}`;
      if (allCorrect && !hasAward(awardKey)) {
        addPoints(10);
        markAwarded(awardKey);
        setShowPointPopup(true);
        setTimeout(() => setShowPointPopup(false), 2000);
      }
    } catch (_) {}
    setChecked(true)
  };

  return (
    <>
      {array && array.map((q, idx) => (
        <div key={idx} className="mb-5">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">{idx + 1}</div>
                <div className="flex-1">
                  <div className="text-gray-900 font-medium">{q.q}</div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.o && q.o.map((option, oi) => {
                      const selected = (eecAnswers[idx] || '') === option;
                      return (
                        <label key={oi} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                          <input
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            name={`q-${idx}`}
                            type="radio"
                            checked={selected}
                            onChange={() => handleEecInput(idx, option)}
                          />
                          <span className="text-gray-800">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                  {showAnswers && (
                    <div className="mt-3 rounded-lg bg-green-50 border border-green-200 p-3 text-sm">
                      <div className="text-green-800"><span className="font-semibold">Answer:</span> {q.a}</div>
                      {q.e && <div className="text-green-700 mt-1"><span className="font-semibold">Explanation:</span> {q.e}</div>}
                    </div>
                  )}
                  {eecFeedback !== null && (
                    <div className={`mt-2 text-sm font-semibold ${eecFeedback[idx] ? 'text-green-600' : 'text-red-600'}`}>
                      {eecFeedback[idx] ? 'Correct' : 'Incorrect'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button onClick={handleEecCheck} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          Check Answers
        </button>
        <button
          className={`px-4 py-2 rounded-lg border ${showAnswers ? 'border-green-600 text-green-700 hover:bg-green-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          onClick={() => { setEecFeedback(null); setShowAnswers(!showAnswers); }}
        >
          {showAnswers ? 'Hide Explanations' : 'Show Explanations'}
        </button>
      </div>
      {showPointPopup && (
        <div className="fixed top-20 right-6 bg-emerald-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce z-50">
          <Coins className="w-4 h-4 text-yellow-300" />
          <span>+10 Points</span>
        </div>
      )}
    </>
  );
}

function Blank({array, insight, setInsight}) {

  const [eecFeedback, setEecFeedback] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [eecAnswers, setEecAnswers] = useState({}); // { [idx]: userInput }
  const [checked, setChecked] = useState(false)
  const [showPointPopup, setShowPointPopup] = useState(false);

  useEffect(() => {
    setShowAnswers(false);
    setEecFeedback(null);
  }, [array])

    useEffect(() => {
    window.scrollTo(0, 0)
  }, [showAnswers])

  useEffect(() => {
    if (!checked) return
    fetch(`${import.meta.env.VITE_API_URL}/api/behaviour/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(insight)
    }).then(res => {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    }).then(data => {
      console.log(data)
    }).catch(error => {
      console.error(error);
    })
    setChecked(false)
  }, [checked])

  // Handler for answer input
  const handleEecInput = (idx, value) => {
    setEecAnswers((prev) => ({ ...prev, [idx]: value }));
    setEecFeedback(null);
  };
  // Handler for answer check
  const handleEecCheck = () => {
    let correction = []
    array.forEach((q, idx) => {
      const userAns = (eecAnswers[idx] || "").trim().toLowerCase();
      const correct = (q.a || "").trim().toLowerCase();
      correction.push(userAns === correct)
    });
    setEecFeedback(correction);
    setShowAnswers(true);
    setInsight((prev) => {
      return {...prev, endTime: new Date(), correct: correction.filter(c => c).length, incorrect: correction.filter(c => !c).length}
    })
    // Award points if all correct and not previously awarded for this paper
    try {
      const allCorrect = correction.length > 0 && correction.every(Boolean);
      const awardKey = `${insight?.studentClass || 'cls'}_${insight?.subject || 'sub'}_${insight?.questionType || 'type'}`;
      if (allCorrect && !hasAward(awardKey)) {
        addPoints(10);
        markAwarded(awardKey);
        setShowPointPopup(true);
        setTimeout(() => setShowPointPopup(false), 2000);
      }
    } catch (_) {}
    setChecked(true)
  };

  return (
    <>
      {array && array.map((q, idx) => (
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
                  {eecFeedback !== null && (
                    <div className={`mt-2 text-sm font-semibold ${eecFeedback[idx] ? 'text-green-600' : 'text-red-600'}`}>
                      {eecFeedback[idx] ? 'Correct' : 'Incorrect'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button onClick={handleEecCheck} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          Check Answers
        </button>
        <button
          className={`px-4 py-2 rounded-lg border ${showAnswers ? 'border-green-600 text-green-700 hover:bg-green-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          onClick={() => { setEecFeedback(null); setShowAnswers(!showAnswers); }}
        >
          {showAnswers ? 'Hide Explanations' : 'Show Explanations'}
        </button>
      </div>
      {showPointPopup && (
        <div className="fixed top-20 right-6 bg-emerald-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce z-50">
          <Coins className="w-4 h-4 text-yellow-300" />
          <span>+10 Points</span>
        </div>
      )}
    </>
  );
}


export default AssignmentView;
