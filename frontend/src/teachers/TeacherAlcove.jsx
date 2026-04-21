import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Search as SearchIcon, 
  MessageSquare, 
  Heart, 
  PlusCircle,
  Edit3,
  Eye,
  Share2,
  Save,
  FileText,
  Target,
  Lightbulb,
  Brain,
  CheckCircle,
  Clock,
  Tag,
  Bookmark,
  MoreVertical,
  Download,
  Users,
  X,
  Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';

const API = import.meta.env.VITE_API_URL;

const emptyProblem = {
  title: '',
  subject: '',
  chapter: '',
  difficulty: 'medium',
  problemText: '',
  solutionText: '',
  hints: [''],
  tags: [],
  estimatedTime: 30
};

const TeacherAlcove = () => {
  const [problems, setProblems] = useState([]);
  const [myProblems, setMyProblems] = useState([]);
  const [viewMode, setViewMode] = useState('wall'); // 'wall' | 'my-problems' | 'create'
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newProblem, setNewProblem] = useState(emptyProblem);
  const [editingProblemId, setEditingProblemId] = useState(null);
  
  const [filters, setFilters] = useState({
    subject: '',
    difficulty: '',
    search: ''
  });
  const [detailProblem, setDetailProblem] = useState(null);
  const [detailComments, setDetailComments] = useState([]);
  const [detailViewers, setDetailViewers] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailCommentText, setDetailCommentText] = useState('');
  const [postingDetailComment, setPostingDetailComment] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const mapApiPostToUi = (post) => {
    const teacherName = post?.authorName || post?.author?.name || post?.author?.username || 'Teacher';
    const nameParts = teacherName.trim().split(/\s+/).filter(Boolean);
    const teacherAvatar = (nameParts[0]?.[0] || 'T') + (nameParts[1]?.[0] || '');

    return {
      id: post._id,
      title: post.title || '',
      teacherName,
      authorUserId: post?.authorUserId || '',
      authorName: post?.authorName || teacherName,
      authorType: post?.authorType || 'teacher',
      authorGrade: post?.authorGrade || '',
      authorSection: post?.authorSection || '',
      teacherAvatar: teacherAvatar.toUpperCase(),
      subject: post.subject || '',
      chapter: post.chapter || '',
      difficulty: post.difficulty || 'medium',
      problemText: post.problemText || '',
      solutionText: post.solutionText || '',
      hints: [],
      tags: Array.isArray(post.tags) ? post.tags : [],
      estimatedTime: Number(post.estimatedTime) || 30,
      timestamp: post.createdAt ? new Date(post.createdAt) : new Date(),
      likes: Number(post.likeCount) || 0,
      comments: Number(post.commentCount) || 0,
      saves: 0,
      isLiked: Boolean(post.isLiked),
      isSaved: false,
      views: Number(post.viewCount) || 0
    };
  };

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.search) params.append('q', filters.search);
      params.append('page', '1');
      params.append('limit', '60');

      const res = await fetch(`${API}/api/alcove/posts?${params.toString()}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to load problems');
      const data = await res.json();
      setProblems((data.items || []).map(mapApiPostToUi));
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Load failed',
        text: err.message || 'Could not load problem wall',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProblems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('mine', 'true');
      params.append('page', '1');
      params.append('limit', '80');
      const res = await fetch(`${API}/api/alcove/posts?${params.toString()}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to load your problems');
      const data = await res.json();
      setMyProblems((data.items || []).map(mapApiPostToUi));
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Load failed',
        text: err.message || 'Could not load your problems',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'my-problems') {
      fetchMyProblems();
      return;
    }
    fetchProblems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, filters.subject, filters.difficulty, filters.search]);

  const handleCreateProblem = async () => {
    if (!newProblem.title || !newProblem.subject || !newProblem.problemText) return;

    setSubmitting(true);
    try {
      const payload = {
        title: newProblem.title.trim(),
        subject: newProblem.subject.trim(),
        chapter: (newProblem.chapter || 'General').trim(),
        difficulty: newProblem.difficulty,
        problemText: newProblem.problemText.trim(),
        solutionText: (newProblem.solutionText || 'Solution will be updated soon.').trim(),
        tags: (newProblem.tags || []).filter(Boolean).map((tag) => String(tag).trim())
      };

      const url = editingProblemId
        ? `${API}/api/alcove/posts/${editingProblemId}`
        : `${API}/api/alcove/posts`;
      const method = editingProblemId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Save failed');
      }

      await Swal.fire({
        icon: 'success',
        title: editingProblemId ? 'Problem updated' : 'Problem created',
        timer: 1200,
        showConfirmButton: false,
      });
      setNewProblem(emptyProblem);
      setEditingProblemId(null);
      setViewMode('wall');
      fetchProblems();
      fetchMyProblems();
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Save failed',
        text: err.message || 'Could not save problem',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeProblem = async (problemId) => {
    try {
      const res = await fetch(`${API}/api/alcove/posts/${problemId}/like`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Like failed');
      }
      const data = await res.json();
      const applyLike = (problem) => (
        problem.id === problemId
          ? { ...problem, isLiked: Boolean(data.liked), likes: Number(data.likeCount) || 0 }
          : problem
      );
      setProblems((prev) => prev.map(applyLike));
      setMyProblems((prev) => prev.map(applyLike));
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Like failed',
        text: err.message || 'Could not update like',
      });
    }
  };

  const handleSaveProblem = (problemId) => {
    setProblems(prev => prev.map(problem => 
      problem.id === problemId 
        ? { ...problem, isSaved: !problem.isSaved, saves: problem.isSaved ? problem.saves - 1 : problem.saves + 1 }
        : problem
    ));
  };

  const openProblemDetails = async (problem) => {
    setDetailProblem(problem);
    setDetailComments([]);
    setDetailViewers([]);
    setDetailCommentText('');
    setDetailLoading(true);
    try {
      const [postRes, commentsRes, viewersRes] = await Promise.all([
        fetch(`${API}/api/alcove/posts/${problem.id}`, { headers: authHeaders() }),
        fetch(`${API}/api/alcove/posts/${problem.id}/comments`, { headers: authHeaders() }),
        fetch(`${API}/api/alcove/posts/${problem.id}/viewers`, { headers: authHeaders() }),
      ]);

      if (postRes.ok) {
        const post = await postRes.json();
        setDetailProblem((prev) => prev ? {
          ...prev,
          comments: Number(post.commentCount) || 0,
          views: Number(post.viewCount) || 0,
          likes: Number(post.likeCount) || 0,
        } : prev);
      }
      if (commentsRes.ok) {
        const comments = await commentsRes.json();
        setDetailComments(Array.isArray(comments) ? comments : []);
      }
      if (viewersRes.ok) {
        const data = await viewersRes.json();
        setDetailViewers(Array.isArray(data?.viewers) ? data.viewers : []);
      }
    } catch {
      setDetailComments([]);
      setDetailViewers([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const submitDetailComment = async () => {
    if (!detailProblem || !detailCommentText.trim()) return;
    setPostingDetailComment(true);
    try {
      const res = await fetch(`${API}/api/alcove/posts/${detailProblem.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ text: detailCommentText.trim() }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to post comment');
      }
      const newComment = await res.json();
      setDetailComments((prev) => [...prev, newComment]);
      setDetailCommentText('');
      setProblems((prev) => prev.map((p) => (
        p.id === detailProblem.id ? { ...p, comments: (Number(p.comments) || 0) + 1 } : p
      )));
      setMyProblems((prev) => prev.map((p) => (
        p.id === detailProblem.id ? { ...p, comments: (Number(p.comments) || 0) + 1 } : p
      )));
      setDetailProblem((prev) => (prev ? { ...prev, comments: (Number(prev.comments) || 0) + 1 } : prev));
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Comment failed',
        text: err.message || 'Could not post comment',
      });
    } finally {
      setPostingDetailComment(false);
    }
  };

  const startEditProblem = (problem) => {
    setEditingProblemId(problem.id);
    setNewProblem({
      title: problem.title || '',
      subject: problem.subject || '',
      chapter: problem.chapter || '',
      difficulty: problem.difficulty || 'medium',
      problemText: problem.problemText || '',
      solutionText: problem.solutionText || '',
      hints: Array.isArray(problem.hints) && problem.hints.length ? problem.hints : [''],
      tags: Array.isArray(problem.tags) ? problem.tags : [],
      estimatedTime: Number(problem.estimatedTime) || 30,
    });
    setViewMode('create');
  };

  const handleDeleteProblem = async (problemId) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete problem?',
      text: 'This action cannot be undone.',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API}/api/alcove/posts/${problemId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Delete failed');
      }
      setProblems((prev) => prev.filter((problem) => problem.id !== problemId));
      setMyProblems((prev) => prev.filter((problem) => problem.id !== problemId));
      await Swal.fire({
        icon: 'success',
        title: 'Problem deleted',
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Delete failed',
        text: err.message || 'Could not delete problem',
      });
    }
  };

  const addHint = () => {
    setNewProblem(prev => ({
      ...prev,
      hints: [...prev.hints, '']
    }));
  };

  const updateHint = (index, value) => {
    setNewProblem(prev => ({
      ...prev,
      hints: prev.hints.map((hint, i) => i === index ? value : hint)
    }));
  };

  const removeHint = (index) => {
    setNewProblem(prev => ({
      ...prev,
      hints: prev.hints.filter((_, i) => i !== index)
    }));
  };

  const addTag = (tag) => {
    if (tag && !newProblem.tags.includes(tag)) {
      setNewProblem(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setNewProblem(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredProblems = problems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 p-6">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl mb-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full transform -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full transform translate-x-48 translate-y-48"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-yellow-300 rounded-full transform -translate-x-20 -translate-y-20"></div>
        </div>
        
        <div className="relative z-10 p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">Teacher's Problem Alcove</h1>
              <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                <span className="text-white text-xs font-bold">EDUCATOR SPACE</span>
              </div>
            </div>
            <p className="text-white/90 text-lg max-w-3xl mx-auto">
              Create, share, and collaborate on challenging problems with fellow educators. Build a repository of quality educational content.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('wall')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    viewMode === 'wall'
                      ? 'bg-white text-indigo-600 shadow-lg transform scale-105'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Problem Wall</span>
                </button>
                <button
                  onClick={() => {
                    setEditingProblemId(null);
                    setNewProblem(emptyProblem);
                    setViewMode('create');
                  }}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    viewMode === 'create'
                      ? 'bg-white text-purple-600 shadow-lg transform scale-105'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Problem</span>
                </button>
                <button
                  onClick={() => setViewMode('my-problems')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    viewMode === 'my-problems'
                      ? 'bg-white text-pink-600 shadow-lg transform scale-105'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>My Problems</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Problems</p>
              <p className="text-3xl font-bold text-indigo-600">{problems.length}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Likes</p>
              <p className="text-3xl font-bold text-pink-600">{problems.reduce((sum, p) => sum + p.likes, 0)}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-pink-500 to-red-600 rounded-xl">
              <Heart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-3xl font-bold text-purple-600">{problems.reduce((sum, p) => sum + p.views, 0)}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saved Problems</p>
              <p className="text-3xl font-bold text-green-600">{problems.filter(p => p.isSaved).length}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <Bookmark className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters for Wall View */}
      {viewMode === 'wall' && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="w-5 h-5 text-purple-600 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search problems, solutions, or tags..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all bg-purple-50"
              />
            </div>
            
            <div className="flex gap-3">
              <select 
                value={filters.subject}
                onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                className="px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-indigo-50"
              >
                <option value="">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
              </select>
              
              <select 
                value={filters.difficulty}
                onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                className="px-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 bg-pink-50"
              >
                <option value="">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Problem Wall View */}
      {viewMode === 'wall' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {loading && Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-56 rounded-2xl bg-white/70 border border-white/30 animate-pulse" />
          ))}

          {!loading && filteredProblems.map((problem) => (
            <div key={problem.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              {/* Problem Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {problem.teacherAvatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{problem.title}</h3>
                        <p className="text-purple-600 font-medium">{problem.teacherName}</p>
                        {problem.authorType === 'student' && (problem.authorGrade || problem.authorSection) && (
                          <p className="text-xs text-indigo-700 font-semibold mt-1">
                            Class {problem.authorGrade || '-'} • Section {problem.authorSection || '-'}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                            {problem.subject}
                          </span>
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                            {problem.chapter}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            problem.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {problem.difficulty}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {problem.estimatedTime} min
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{formatTimeAgo(problem.timestamp)}</span>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Problem Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    Problem Statement
                  </h4>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200">
                    <p className="text-gray-800 leading-relaxed">{problem.problemText}</p>
                  </div>
                </div>

                {problem.solutionText && (
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Solution Approach
                    </h4>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-line">{problem.solutionText}</p>
                    </div>
                  </div>
                )}

                {problem.hints && problem.hints.length > 0 && problem.hints[0] && (
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      Hints
                    </h4>
                    <div className="space-y-2">
                      {problem.hints.filter(hint => hint.trim()).map((hint, index) => (
                        <div key={index} className="bg-gradient-to-r from-yellow-50 to-amber-50 p-3 rounded-lg border border-yellow-200">
                          <p className="text-gray-700 text-sm">💡 {hint}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {problem.tags && problem.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {problem.tags.map((tag, index) => (
                        <span key={index} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Problem Actions */}
              <div className="px-6 pb-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLikeProblem(problem.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      problem.isLiked 
                        ? 'bg-pink-100 text-pink-600 border-2 border-pink-300' 
                        : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-pink-50 hover:text-pink-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${problem.isLiked ? 'fill-current' : ''}`} />
                    {problem.likes}
                  </button>
                  
                  <button
                    onClick={() => openProblemDetails(problem)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-600 border-2 border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {problem.comments}
                  </button>
                  
                  <button
                    onClick={() => handleSaveProblem(problem.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      problem.isSaved 
                        ? 'bg-green-100 text-green-600 border-2 border-green-300' 
                        : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-green-50 hover:text-green-500'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${problem.isSaved ? 'fill-current' : ''}`} />
                    {problem.saves}
                  </button>
                  
                  <button
                    onClick={() => openProblemDetails(problem)}
                    className="flex items-center gap-1 text-gray-500 text-sm hover:text-indigo-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    {problem.views}
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!loading && filteredProblems.length === 0 && (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No problems found</h3>
              <p className="text-gray-600">Try adjusting your filters or create a new problem!</p>
            </div>
          )}
        </div>
      )}

      {/* Create Problem View */}
      {viewMode === 'create' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <Edit3 className="w-6 h-6 text-purple-600" />
                {editingProblemId ? 'Edit Problem' : 'Create New Problem'}
              </h2>
              <p className="text-gray-600">Share your expertise by creating challenging problems for fellow educators.</p>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Problem Title *</label>
                  <input
                    value={newProblem.title}
                    onChange={(e) => setNewProblem(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter a descriptive title..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Time (minutes)</label>
                  <input
                    type="number"
                    value={newProblem.estimatedTime}
                    onChange={(e) => setNewProblem(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 30 }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                  <input
                    value={newProblem.subject}
                    onChange={(e) => setNewProblem(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g., Mathematics, Physics..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Chapter/Topic</label>
                  <input
                    value={newProblem.chapter}
                    onChange={(e) => setNewProblem(prev => ({ ...prev, chapter: e.target.value }))}
                    placeholder="e.g., Algebra, Mechanics..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty Level</label>
                  <select
                    value={newProblem.difficulty}
                    onChange={(e) => setNewProblem(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Problem Statement */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Problem Statement *</label>
                <textarea
                  value={newProblem.problemText}
                  onChange={(e) => setNewProblem(prev => ({ ...prev, problemText: e.target.value }))}
                  placeholder="Describe the problem clearly and provide all necessary information..."
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                />
              </div>

              {/* Solution */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Solution Approach (Optional)</label>
                <textarea
                  value={newProblem.solutionText}
                  onChange={(e) => setNewProblem(prev => ({ ...prev, solutionText: e.target.value }))}
                  placeholder="Provide step-by-step solution or approach..."
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                />
              </div>

              {/* Hints */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hints (Optional)</label>
                <div className="space-y-3">
                  {newProblem.hints.map((hint, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        value={hint}
                        onChange={(e) => updateHint(index, e.target.value)}
                        placeholder={`Hint ${index + 1}...`}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all"
                      />
                      {newProblem.hints.length > 1 && (
                        <button
                          onClick={() => removeHint(index)}
                          className="px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addHint}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Hint
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (Optional)</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {newProblem.tags.map((tag, index) => (
                    <span key={index} className="flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-indigo-500 hover:text-indigo-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  placeholder="Type a tag and press Enter..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setEditingProblemId(null);
                    setNewProblem(emptyProblem);
                    setViewMode('wall');
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProblem}
                  disabled={submitting || !newProblem.title || !newProblem.subject || !newProblem.problemText}
                  className={`px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                    submitting || !newProblem.title || !newProblem.subject || !newProblem.problemText
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg hover:scale-105'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {submitting ? 'Saving...' : editingProblemId ? 'Update Problem' : 'Create Problem'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Problems View */}
      {viewMode === 'my-problems' && (
        <div className="max-w-6xl mx-auto">
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-48 rounded-2xl bg-white/70 border border-white/30 animate-pulse" />
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!loading && myProblems.map((problem) => (
              <div key={problem.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-2">{problem.title}</h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditProblem(problem)}
                        className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProblem(problem.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                      {problem.subject}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      problem.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">{problem.problemText}</p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {problem.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {problem.views}
                      </span>
                    </div>
                    <span>{formatTimeAgo(problem.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {!loading && myProblems.length === 0 && (
              <div className="col-span-full text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No problems created yet</h3>
                <p className="text-gray-600 mb-4">Start creating problems to build your educational content library!</p>
                <button
                  onClick={() => setViewMode('create')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all font-medium"
                >
                  Create Your First Problem
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {detailProblem && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 flex items-center justify-center"
          onClick={() => setDetailProblem(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-4 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{detailProblem.title}</h3>
                <p className="text-xs text-white/85 mt-1">
                  {detailProblem.subject} • {detailProblem.chapter} • {detailProblem.teacherName}
                </p>
              </div>
              <button
                onClick={() => setDetailProblem(null)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-center">
                  <p className="text-xs text-blue-700 font-semibold">Comments</p>
                  <p className="text-xl font-black text-blue-900">{detailComments.length}</p>
                </div>
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-center">
                  <p className="text-xs text-indigo-700 font-semibold">Viewers</p>
                  <p className="text-xl font-black text-indigo-900">{detailViewers.length}</p>
                </div>
                <div className="rounded-xl border border-pink-200 bg-pink-50 p-3 text-center">
                  <p className="text-xs text-pink-700 font-semibold">Likes</p>
                  <p className="text-xl font-black text-pink-900">{detailProblem.likes}</p>
                </div>
              </div>

              {detailLoading ? (
                <div className="py-12 flex items-center justify-center text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading details...
                </div>
              ) : (
                <>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">Comments</h4>
                    <div className="space-y-2 max-h-56 overflow-y-auto border border-gray-200 rounded-xl p-3">
                      {detailComments.length === 0 ? (
                        <p className="text-sm text-gray-500">No comments yet.</p>
                      ) : detailComments.map((comment) => {
                        const byId = comment?.authorId && detailProblem?.authorUserId && String(comment.authorId) === String(detailProblem.authorUserId);
                        const byType = String(comment?.authorType || '').toLowerCase() === String(detailProblem?.authorType || '').toLowerCase();
                        const byName = String(comment?.authorName || '').trim().toLowerCase() === String(detailProblem?.authorName || detailProblem?.teacherName || '').trim().toLowerCase();
                        const isPostAuthor = (byId && byType) || byName;
                        return (
                        <div key={comment._id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-800">
                                {comment.authorName || 'User'}
                                {isPostAuthor && <span className="ml-1 text-[11px] text-amber-700 font-bold">(Author)</span>}
                              </p>
                              {String(comment.authorType || '').toLowerCase() === 'student' && (comment.authorGrade || comment.authorSection) && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                                  Class {comment.authorGrade || '-'} • Sec {comment.authorSection || '-'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                        </div>
                      )})}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <input
                        value={detailCommentText}
                        onChange={(e) => setDetailCommentText(e.target.value)}
                        placeholder="Write a comment as teacher..."
                        className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                      <button
                        onClick={submitDetailComment}
                        disabled={postingDetailComment || !detailCommentText.trim()}
                        className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${postingDetailComment || !detailCommentText.trim()
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {postingDetailComment ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </div>

                  {/* <div>
                    <h4 className="font-bold text-gray-800 mb-2">Viewers</h4>
                    <div className="space-y-2 max-h-56 overflow-y-auto border border-gray-200 rounded-xl p-3">
                      {detailViewers.length === 0 ? (
                        <p className="text-sm text-gray-500">No viewers yet.</p>
                      ) : detailViewers.map((viewer) => (
                        <div key={`${viewer.userType}-${viewer.id}`} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <p className="text-sm font-semibold text-gray-800">{viewer.name}</p>
                          <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 capitalize">{viewer.userType}</span>
                        </div>
                      ))}
                    </div>
                  </div> */}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAlcove;
