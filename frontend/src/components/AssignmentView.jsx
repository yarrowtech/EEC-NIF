import React, { useEffect, useState, useRef } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Book,
  FileText,
  Download,
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


const AssignmentView = () => {
  const [filter, setFilter] = useState("all"); // all, pending, completed, overdue
  const [assignmentType, setAssignmentType] = useState("school"); // 'school' or 'eec'
  const [tryoutType, setTryoutType] = useState("names"); // default tryout type


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

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    return assignment.status === filter;
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

  return (
    <div className="w-full min-h-screen bg-white px-1 sm:px-4 md:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Assignment Type Dropdown */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your assignments and submissions</p>
        </div>
        <div className="flex items-center space-x-2">
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
          </select>
        </div>
      </div>

      {/* School Assignment Section */}
      {assignmentType === 'school' && (
        <>
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-2">
            {['all', 'pending', 'completed', 'overdue'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  filter === filterType
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {filterType}
              </button>
            ))}
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

          {/* Assignments List */}
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 border-l-4 ${getPriorityColor(assignment.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(assignment.status)}
                      <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                        {assignment.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Book className="w-4 h-4" />
                        <span>{assignment.course}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {formatDate(assignment.dueDate)}</span>
                      </div>
                      <span className="text-gray-500">Max Marks: {assignment.maxMarks}</span>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{assignment.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          Submission: {assignment.submissionType}
                        </span>
                        {assignment.status === 'pending' && (
                          <span className={`text-sm font-medium ${
                            getDaysRemaining(assignment.dueDate) < 0 
                              ? 'text-red-600' 
                              : getDaysRemaining(assignment.dueDate) <= 3 
                                ? 'text-yellow-600' 
                                : 'text-green-600'
                          }`}>
                            {getDaysRemaining(assignment.dueDate) < 0 
                              ? `${Math.abs(getDaysRemaining(assignment.dueDate))} days overdue`
                              : `${getDaysRemaining(assignment.dueDate)} days remaining`
                            }
                          </span>
                        )}
                        {assignment.submittedAt && (
                          <span className="text-sm text-green-600">
                            Submitted on {formatDate(assignment.submittedAt)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {assignment.status === 'pending' && (
                          <button className="px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700 transition-colors">
                            Submit
                          </button>
                        )}
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1">
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAssignments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
              <p className="text-gray-600">No assignments match your current filter.</p>
            </div>
          )}
        </>
      )}

      {/* EEC Tryout Section */}
      {assignmentType === 'eec' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label htmlFor="classSelect" className="font-medium text-gray-700">Select Class:</label>
            <select
              id="classSelect"
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.keys(questionData).map((cls) => (
                <option key={cls} value={cls}>{`Class ${cls}`}</option>
              ))}
            </select>
            <label htmlFor="eecSubject" className="font-medium text-gray-700 ml-4">Subject:</label>
            <select
              id="eecSubject"
              value={eecSubject}
              onChange={e => setEecSubject(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.keys(questionData[selectedClass]).map((subject) => (
                <option key={subject} value={subject}>{subject.charAt(0).toUpperCase() + subject.slice(1)}</option>
              ))
              }
            </select>
            <label
              htmlFor="eecSubject"
              className="font-medium text-gray-700 ml-4"
            >
              Question Type:
            </label>
            <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" onChange={(e) => setQuestionType(e.target.value)} value={questionType}>
              <option value="mcq">MCQ</option>
              <option value="blank">Fill in the Blanks</option>
            </select>
          </div>
          <div className="space-y-4">
            {
              questionType === "mcq" ? <MCQ array={questionData[selectedClass][eecSubject]?.mcq} insight={insight} setInsight={setInsight} /> :
              <Blank array={questionData[selectedClass][eecSubject]?.blank} insight={insight} setInsight={setInsight} />
            }
          </div>
          <div>
            
          </div>
        </div>
      )}

      {/* Tryout Section */}
      {assignmentType === 'tryout' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
    setChecked(true)
  };

  return (
    <>
      {array && array.map((q, idx) => (<div
        key={idx}
        className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg"
      >
        <div className="font-semibold text-gray-800 mb-1">
          Q{idx + 1}: {q.q}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
          <div className="flex flex-col gap-2">
            {q.o &&
              q.o.map((option) => (
                <div className="flex items-center gap-2">
                  <input
                    name={q.q}
                    type="radio"
                    id={option}
                    onChange={() => handleEecInput(idx, option)}
                  />
                  <label key={option} className="cursor-pointer text-black">
                    {option}
                  </label>
                </div>
              ))}
          </div>
        </div>
        {showAnswers && (
          <>
          <div className="text-sm text-gray-400 italic mt-1">Answer: {q.a}</div>
          <div className="text-sm text-gray-400 italic mt-1">Explanation: {q.e}</div>
          </>
        )}
      {eecFeedback !== null && (
        <p
          className={`${
            eecFeedback[idx] ? "text-green-500" : "text-red-500"
          } font-bold text-lg`}
        >
          {eecFeedback[idx] ? "Correct" : "Incorrect"}
        </p>
      )}
      </div>))}
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={handleEecCheck}
        >
          Check
        </button>
        <button
          className={`px-3 py-1 ${
            showAnswers ? "bg-green-600" : "bg-red-600"
          } text-white rounded ${
            showAnswers ? "hover:bg-green-700" : "hover:bg-red-700"
          } transition-colors`}
          onClick={() => {
            setEecFeedback(null);
            setShowAnswers(!showAnswers);
          }}
        >
          {showAnswers ? "Hide Answers" : "Show Answers"}
        </button>
      </div>
    </>
  );
}

function Blank({array, insight, setInsight}) {

  const [eecFeedback, setEecFeedback] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [eecAnswers, setEecAnswers] = useState({}); // { [idx]: userInput }
  const [checked, setChecked] = useState(false)

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
    setChecked(true)
  };

  return (
    <>
      {array && array.map((q, idx) => (<div
        key={idx}
        className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg"
      >
        <div className="font-semibold text-gray-800 mb-1">
          Q{idx + 1}: {q.q}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
          <input
          type="text"
          className="border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-blue-400 focus:border-transparent w-full sm:w-auto"
          placeholder="Your answer..."
          value={eecAnswers[idx] || ''}
          onChange={e => handleEecInput(idx, e.target.value)}
        />
        </div>
        {showAnswers && (
          <>
          <div className="text-sm text-gray-400 italic mt-1">Answer: {q.a}</div>
          <div className="text-sm text-gray-400 italic mt-1">Explanation: {q.e}</div>
          </>
        )}
        {eecFeedback !== null && (
        <p
          className={`${
            eecFeedback[idx] ? "text-green-500" : "text-red-500"
          } font-bold text-lg`}
        >
          {eecFeedback[idx] ? "Correct" : "Incorrect"}
        </p>
      )}
      </div>))}
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={handleEecCheck}
        >
          Check
        </button>
        <button
          className={`px-3 py-1 ${
            showAnswers ? "bg-green-600" : "bg-red-600"
          } text-white rounded ${
            showAnswers ? "hover:bg-green-700" : "hover:bg-red-700"
          } transition-colors`}
          onClick={() => {
            setEecFeedback(null);
            setShowAnswers(!showAnswers);
          }}
        >
          {showAnswers ? "Hide Answers" : "Show Answers"}
        </button>
      </div>
    </>
  );
}


export default AssignmentView;
