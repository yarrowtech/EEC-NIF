import React, { useEffect, useState, useRef } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  Smile,
  Coins,
  Search as SearchIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Book,
  Calendar,
  Download
} from "lucide-react";
import PointsBadge from './PointsBadge';
import QuillEditor from '../utils/quill';
import { addPoints, hasAward, markAwarded, getPoints } from '../utils/points';
import Assignment from './Assignment';
import Tryout from './Tryout';


const AssignmentView = ({ defaultType = "school" }) => {
  const [filter, setFilter] = useState("all"); // all, pending, completed, overdue
  const [assignmentType, setAssignmentType] = useState(defaultType); // 'school' | 'eec' | 'journal' | ...

  // Journal state
  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [journalTags, setJournalTags] = useState(""); // comma-separated
  const [journalMood, setJournalMood] = useState("Neutral");
  const [journalEntries, setJournalEntries] = useState([]);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [entrySearch, setEntrySearch] = useState("");
  const [autosaveLabel, setAutosaveLabel] = useState("Saved");

  // EEC and FlashCard state
  const [selectedClass, setSelectedClass] = useState('9');
  const [eecSubject, setEecSubject] = useState('math');
  const [questionType, setQuestionType] = useState('mcq');
  const [insight, setInsight] = useState({});
  const [flashDeck, setFlashDeck] = useState([]);
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashKnown, setFlashKnown] = useState({});
  const [flashFlipped, setFlashFlipped] = useState(false);
  const [flashShuffle, setFlashShuffle] = useState(false);

  // School assignments state
  const [schoolSearch, setSchoolSearch] = useState("");
  const [schoolSort, setSchoolSort] = useState("due_asc");
  const [assignments, setAssignments] = useState([]);

  // Tryout state
  const [tryoutType, setTryoutType] = useState('names');
  const [tryoutDifficulty, setTryoutDifficulty] = useState('easy');

  // Lab state
  const [labControls, setLabControls] = useState({
    rotation: 0,
    zoom: 1,
    animationSpeed: 1,
    isAnimating: false
  });
  const labContainerRef = useRef(null);
  const labCameraRef = useRef(null);
  const labInitialCamPosRef = useRef(null);
  const labModelRef = useRef(null);

  // Mock data
  const questionData = {
    '9': {
      'math': {
        'mcq': [
          { q: 'What is 2+2?', o: ['3', '4', '5', '6'], a: '4', e: 'Simple addition' },
          { q: 'What is 5*3?', o: ['10', '15', '20', '25'], a: '15', e: 'Multiplication' }
        ],
        'blank': [
          { q: 'Fill in the blank: 2 + 2 = ___', a: '4', e: 'Simple addition' }
        ]
      },
      'science': {
        'mcq': [
          { q: 'What is H2O?', o: ['Water', 'Hydrogen', 'Oxygen', 'Salt'], a: 'Water', e: 'Chemical formula for water' }
        ],
        'blank': [
          { q: 'H2O is the chemical formula for ___', a: 'water', e: 'Chemical formula' }
        ]
      }
    }
  };

  // Tryout difficulty options
  const tryoutDifficultyOptions = [
    { value: 'easy', label: 'Easy', className: 'border-green-300 text-green-700', activeClass: 'bg-green-50 ring-green-500' },
    { value: 'medium', label: 'Medium', className: 'border-yellow-300 text-yellow-700', activeClass: 'bg-yellow-50 ring-yellow-500' },
    { value: 'hard', label: 'Hard', className: 'border-red-300 text-red-700', activeClass: 'bg-red-50 ring-red-500' }
  ];
  const baseDifficultyButtonClasses = 'px-4 py-2 rounded-lg border text-sm font-medium transition-colors';




  // Keep local type in sync if parent changes default
  useEffect(() => {
    setAssignmentType(defaultType);
  }, [defaultType]);

  // Load persisted journal entries
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('journalEntries') || '[]');
      if (Array.isArray(saved)) setJournalEntries(saved);
    } catch (_) {}
  }, []);

  const persistJournal = (next) => {
    setJournalEntries(next);
    try { localStorage.setItem('journalEntries', JSON.stringify(next)); } catch (_) {}
  };

  const resetJournalForm = () => {
    setSelectedEntryId(null);
    setJournalTitle("");
    setJournalContent("");
    setJournalTags("");
    setJournalMood("Neutral");
  };

  const handleSaveDraft = () => {
    const now = new Date();
    if (!journalTitle.trim() && !journalContent.trim()) return;
    if (selectedEntryId) {
      const next = journalEntries.map(e => e.id === selectedEntryId ? {
        ...e,
        title: journalTitle.trim() || 'Untitled',
        content: journalContent,
        tags: (journalTags || '').split(',').map(t => t.trim()).filter(Boolean),
        mood: journalMood,
        updatedAt: now.toISOString(),
      } : e);
      persistJournal(next);
    } else {
      const entry = {
        id: Date.now(),
        title: journalTitle.trim() || 'Untitled',
        content: journalContent,
        tags: (journalTags || '').split(',').map(t => t.trim()).filter(Boolean),
        mood: journalMood,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      persistJournal([entry, ...journalEntries]);
      setSelectedEntryId(entry.id);
    }
    setAutosaveLabel('Saved');
  };

  const handleNewEntry = () => {
    resetJournalForm();
  };

  const handleDeleteEntry = (id) => {
    const next = journalEntries.filter(e => e.id !== id);
    persistJournal(next);
    if (selectedEntryId === id) resetJournalForm();
  };

  const loadEntry = (entry) => {
    setSelectedEntryId(entry.id);
    setJournalTitle(entry.title || '');
    setJournalContent(entry.content || '');
    setJournalTags((entry.tags || []).join(', '));
    setJournalMood(entry.mood || 'Neutral');
  };

  // Simple autosave debounce
  useEffect(() => {
    if (assignmentType !== 'journal') return;
    setAutosaveLabel('Saving…');
    const t = setTimeout(() => {
      handleSaveDraft();
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalTitle, journalContent, journalTags, journalMood, assignmentType]);

  // Initialize EEC state
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

  // Helper functions for school assignments
  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'border-l-4 border-l-red-500';
      case 'medium': return 'border-l-4 border-l-yellow-500';
      case 'low': return 'border-l-4 border-l-green-500';
      default: return 'border-l-4 border-l-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'overdue': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  // Filter and sort assignments
  const filteredAssignments = assignments
    .filter(assignment => {
      const searchTerm = schoolSearch.toLowerCase();
      const matchesSearch = assignment.title.toLowerCase().includes(searchTerm) ||
                           assignment.course.toLowerCase().includes(searchTerm) ||
                           assignment.description.toLowerCase().includes(searchTerm);
      
      if (filter === 'all') return matchesSearch;
      return matchesSearch && assignment.status === filter;
    })
    .sort((a, b) => {
      switch(schoolSort) {
        case 'due_asc': return new Date(a.dueDate) - new Date(b.dueDate);
        case 'due_desc': return new Date(b.dueDate) - new Date(a.dueDate);
        case 'priority': {
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        case 'status': return a.status.localeCompare(b.status);
        default: return 0;
      }
    });

  return (
    <div className="w-full min-h-screen bg-white px-1 sm:px-4 md:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Assignment Type Dropdown */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-4">
        {assignmentType !== 'journal' && (
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Assignments</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage your assignments and submissions</p>
          </div>
        )}
        <div className="flex items-center space-x-3">
          {assignmentType !== 'journal' && <PointsBadge />}
          {assignmentType !== 'journal' && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Journal Section */}
      {assignmentType === 'journal' && (
        <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-2 sm:p-4 lg:p-6 rounded-2xl shadow-2xl max-w-7xl mx-auto" style={{background: 'linear-gradient(135deg, #f3e8d7 0%, #e8dcc6 50%, #ddd0bb 100%)'}}>
          {/* Notebook Header */}
          <div className="text-center mb-3 sm:mb-4 lg:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brown-800" style={{color: '#8B4513', fontFamily: 'Georgia, serif'}}>My Learning Journal</h1>
            <div className="w-20 sm:w-24 lg:w-32 h-0.5 sm:h-1 bg-brown-400 mx-auto mt-1 sm:mt-2 rounded" style={{backgroundColor: '#D2691E'}}></div>
          </div>

          {/* Notebook Layout */}
          <div className="relative bg-white border-2 sm:border-3 lg:border-4 border-gray-300 rounded-lg shadow-inner overflow-hidden" style={{backgroundColor: '#fefcf8', borderColor: '#8B7355', height: 'calc(100vh - 200px)', minHeight: '500px', maxHeight: '800px'}}>
            
            {/* Spiral Binding */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-4 sm:w-6 lg:w-8 z-10" style={{background: 'linear-gradient(to right, #666 0%, #999 50%, #666 100%)'}}>
              {[...Array(Math.min(20, Math.floor(window.innerHeight / 40)))].map((_, i) => (
                <div key={i} className="absolute w-3 h-2 sm:w-4 sm:h-2 lg:w-6 lg:h-3 border border-gray-500 rounded-full left-1/2 transform -translate-x-1/2" style={{top: `${i * 5 + 2}%`, borderColor: '#555'}}></div>
              ))}
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-2 h-full relative">
              
              {/* Timeline Section */}
              <div className="border-b lg:border-b-0 lg:border-r-2 border-gray-300 p-3 sm:p-4 lg:p-6 relative overflow-hidden flex-1 lg:flex-none" style={{borderColor: '#8B7355'}}>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-center mb-3 sm:mb-4 lg:mb-6 underline" style={{color: '#8B4513', fontFamily: 'Georgia, serif'}}>Timeline</h2>
                
                {/* New Entry Button */}
                <div className="mb-3 sm:mb-4">
                  <button 
                    onClick={handleNewEntry} 
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 border-2 border-dashed border-gray-400 rounded-lg hover:bg-yellow-50 transition-colors text-sm sm:text-base"
                    style={{borderColor: '#B8860B', color: '#8B4513'}}
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" /> Add New Day
                  </button>
                </div>

                {/* Timeline Entries */}
                <div className="space-y-2 sm:space-y-3 overflow-y-auto pr-1 sm:pr-2 lg:max-h-none lg:h-auto lg:flex-1" style={{height: 'calc(100% - 100px)', maxHeight: '300px'}}>
                  {journalEntries.map((entry, index) => (
                    <div 
                      key={entry.id}
                      onClick={() => loadEntry(entry)}
                      className={`p-2 sm:p-3 rounded-lg cursor-pointer transition-all border ${
                        selectedEntryId === entry.id 
                          ? 'bg-yellow-100 border-yellow-400' 
                          : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                      }`}
                      style={{
                        backgroundColor: selectedEntryId === entry.id ? '#fef3c7' : '#fffbeb',
                        borderColor: selectedEntryId === entry.id ? '#f59e0b' : '#fbbf24'
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold text-sm sm:text-base text-brown-800" style={{color: '#8B4513'}}>
                            Day {journalEntries.length - index}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 mt-1">
                            {new Date(entry.updatedAt || entry.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {entry.title || 'Untitled'}
                          </div>
                        </div>
                        <button
                          title="Delete"
                          onClick={(ev) => { ev.stopPropagation(); handleDeleteEntry(entry.id); }}
                          className="p-1 rounded hover:bg-red-100 text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {journalEntries.length === 0 && (
                    <div className="text-center py-6 sm:py-8 text-gray-500" style={{color: '#8B7355'}}>
                      <p className="text-sm sm:text-base">No entries yet.</p>
                      <p className="text-xs sm:text-sm mt-2">Start by adding your first day!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes Section */}
              <div className="p-3 sm:p-4 lg:p-6 relative overflow-hidden flex flex-col flex-1">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-center mb-3 sm:mb-4 lg:mb-6 underline" style={{color: '#8B4513', fontFamily: 'Georgia, serif'}}>Notes</h2>
                
                {/* Current Date */}
                <div className="text-center text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4" style={{color: '#8B7355'}}>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: window.innerWidth > 640 ? 'long' : 'short',
                    year: 'numeric', 
                    month: window.innerWidth > 640 ? 'long' : 'short', 
                    day: 'numeric' 
                  })}
                </div>

                {/* Entry Form */}
                <div className="flex-1 flex flex-col space-y-2 sm:space-y-3 lg:space-y-4 overflow-hidden min-h-0">
                  
                  {/* Title Input */}
                  <div className="flex-shrink-0">
                    <input
                      type="text"
                      value={journalTitle}
                      onChange={(e) => setJournalTitle(e.target.value)}
                      placeholder="Today I learned..."
                      className="w-full bg-transparent border-0 border-b border-gray-300 px-0 py-1 sm:py-2 text-base sm:text-lg placeholder-gray-400 focus:ring-0 focus:border-brown-500"
                      style={{
                        borderBottomColor: '#B8860B',
                        color: '#8B4513',
                        fontFamily: 'Georgia, serif'
                      }}
                    />
                  </div>

                  {/* Content Editor */}
                  <div className="flex-1 min-h-0">
                    <textarea
                      value={journalContent.replace(/<[^>]*>/g, '')}
                      onChange={(e) => setJournalContent(e.target.value)}
                      placeholder="Today Susan hit me with her car but she claimed I hit her car with my body.

Before the lights went out, I saw a deer near the headlight. Seems like it wasn't her first time.

Should she still have a license?

My head hurts, too."
                      className="w-full h-full bg-transparent border-0 resize-none p-0 text-gray-700 placeholder-gray-400 focus:ring-0 text-sm sm:text-base leading-5 sm:leading-6"
                      style={{
                        color: '#4B5563',
                        fontFamily: 'Georgia, serif',
                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 19px, #e5e7eb 19px, #e5e7eb 20px)',
                        lineHeight: '20px'
                      }}
                    />
                  </div>

                  {/* Tags and Mood */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 flex-shrink-0">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1" style={{color: '#8B7355'}}>Tags</label>
                      <input
                        type="text"
                        value={journalTags}
                        onChange={(e) => setJournalTags(e.target.value)}
                        placeholder="learning, reflection"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
                        style={{backgroundColor: '#fffbeb'}}
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1" style={{color: '#8B7355'}}>Mood</label>
                      <select
                        value={journalMood}
                        onChange={(e) => setJournalMood(e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
                        style={{backgroundColor: '#fffbeb'}}
                      >
                        <option>Happy</option>
                        <option>Neutral</option>
                        <option>Curious</option>
                        <option>Challenged</option>
                        <option>Excited</option>
                      </select>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="text-right pt-2 sm:pt-4 flex-shrink-0">
                    <button 
                      onClick={handleSaveDraft} 
                      className="px-4 py-1.5 sm:px-6 sm:py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 shadow-lg text-sm sm:text-base font-medium transition-colors"
                      style={{backgroundColor: '#D97706'}}
                    >
                      Save Entry
                    </button>
                    <div className="text-xs text-gray-500 mt-1 sm:mt-2">{autosaveLabel}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notebook Bottom Edge */}
            <div className="absolute bottom-0 left-0 right-0 h-2 sm:h-3 lg:h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" style={{backgroundColor: '#E5E5E5'}}>
              <div className="absolute bottom-0 left-0 right-0 h-1 sm:h-2" style={{background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 8px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.1) 12px)'}}></div>
            </div>

          </div>

          {/* Paper texture overlay */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl opacity-30 sm:opacity-50" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.02'%3E%3Cpath d='m20 20v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
      )}

      {/* Assignment Section (School, EEC, Lab, Flashcard) */}
      {(['school', 'eec', 'lab', 'flashcard'].includes(assignmentType)) && (
        <Assignment assignmentType={assignmentType} filter={filter} setFilter={setFilter} />
      )}



      {/* Tryout Section */}
      {assignmentType === 'tryout' && (
        <Tryout />
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