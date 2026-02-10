import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Filter, Search as SearchIcon, Star, MessageSquare, Calendar as CalendarIcon, Layers, Users, Award, TrendingUp, Send, Heart, ThumbsUp, User, PlusCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

export default function AcademicAlcove() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null); // selected post for modal
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  // Wall of chats state
  const [viewMode, setViewMode] = useState('problems'); // 'problems' | 'wall'
  const [wallPosts, setWallPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [newPostSubject, setNewPostSubject] = useState('');
  const [newPostDifficulty, setNewPostDifficulty] = useState('medium');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [postingWall, setPostingWall] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      if (chapter) params.append('chapter', chapter);
      if (difficulty) params.append('difficulty', difficulty);
      if (q) params.append('q', q);
      params.append('page', String(page));
      params.append('limit', String(limit));
      const res = await fetch(`${API}/api/alcove/posts?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load posts');
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, chapter, difficulty, q, page, limit]);

  const uniqueSubjects = useMemo(() => Array.from(new Set(items.map(i => i.subject))).filter(Boolean), [items]);
  const uniqueChapters = useMemo(() => Array.from(new Set(items.map(i => i.chapter))).filter(Boolean), [items]);

  const openPost = async (post) => {
    setSelected(post);
    setComments([]);
    try {
      const res = await fetch(`${API}/api/alcove/posts/${post._id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (_) { }
  };

  const submitComment = async () => {
    if (!selected || !commentText.trim()) return;
    setPostingComment(true);
    try {
      const res = await fetch(`${API}/api/alcove/posts/${selected._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // If auth is available in localStorage, include it
          ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
        },
        body: JSON.stringify({ text: commentText, authorName: localStorage.getItem('username') || undefined }),
      });
      if (!res.ok) throw new Error('Failed to post comment');
      const data = await res.json();
      setComments((prev) => [...prev, data]);
      setCommentText('');
    } catch (e) {
      alert(e.message || 'Could not post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Mock wall posts data - would be fetched from API in real implementation
  useEffect(() => {
    if (viewMode === 'wall') {
      setWallPosts([
        {
          id: 1,
          teacherName: "Prof. Sarah Johnson",
          teacherAvatar: "SJ",
          subject: "Mathematics",
          difficulty: "hard",
          content: "Looking for creative ways to explain quadratic equations to my Grade 10 students. Anyone have interactive methods that worked well? The traditional approach isn't clicking with this batch.",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          likes: 12,
          comments: 5,
          isLiked: false
        },
        {
          id: 2,
          teacherName: "Dr. Michael Chen",
          teacherAvatar: "MC",
          subject: "Physics",
          difficulty: "medium",
          content: "Just solved an interesting projectile motion problem involving a basketball shot. The trajectory calculation shows some beautiful parabolic curves. Would love to share this with the community!",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          likes: 18,
          comments: 8,
          isLiked: true
        },
        {
          id: 3,
          teacherName: "Ms. Emily Rodriguez",
          teacherAvatar: "ER",
          subject: "Chemistry",
          difficulty: "easy",
          content: "Created a simple experiment to demonstrate chemical reactions using household items. Students were amazed by the color changes! Perfect for remote learning setups.",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          likes: 25,
          comments: 12,
          isLiked: false
        },
        {
          id: 4,
          teacherName: "Prof. David Kumar",
          teacherAvatar: "DK",
          subject: "Biology",
          difficulty: "medium",
          content: "Working on a challenging genetics problem involving multiple alleles and inheritance patterns. The Punnett squares are getting complex, but the results are fascinating!",
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          likes: 15,
          comments: 6,
          isLiked: true
        },
        {
          id: 5,
          teacherName: "Ms. Lisa Thompson",
          teacherAvatar: "LT",
          subject: "English",
          difficulty: "hard",
          content: "Exploring Shakespeare's use of metaphors in Hamlet. Found some incredible linguistic patterns that connect to modern literature. Anyone interested in collaborating on a cross-curricular approach?",
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          likes: 20,
          comments: 15,
          isLiked: false
        }
      ]);
    }
  }, [viewMode]);

  const handleLikePost = (postId) => {
    setWallPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleNewWallPost = () => {
    if (!newPostText.trim()) return;
    setPostingWall(true);

    const newPost = {
      id: Date.now(),
      teacherName: localStorage.getItem('username') || 'Anonymous Teacher',
      teacherAvatar: (localStorage.getItem('username') || 'AT')[0].toUpperCase() + (localStorage.getItem('username') || 'AT')[1]?.toUpperCase() || '',
      subject: newPostSubject || 'General',
      difficulty: newPostDifficulty,
      content: newPostText,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      isLiked: false
    };

    setTimeout(() => {
      setWallPosts(prev => [newPost, ...prev]);
      setNewPostText('');
      setNewPostSubject('');
      setNewPostDifficulty('medium');
      setShowNewPostForm(false);
      setPostingWall(false);
    }, 1000);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <>
      {/* <div className="w-full min-h-screen px-2 sm:px-4 md:px-8 py-4 sm:py-6" style={{ background: 'linear-gradient(135deg, #f3e8d7 0%, #e8dcc6 50%, #ddd0bb 100%)' }}>
        <div className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 mb-6 overflow-hidden" style={{ backgroundColor: '#fefcf8', border: '3px solid #8B7355' }}>
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>

          <div className="relative">
            <div className="text-center mb-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3" style={{ color: '#8B4513', fontFamily: 'Georgia, serif' }}>
                Academic Alcove
              </h1>
              <div className="w-32 h-1 bg-amber-600 mx-auto mb-4 rounded"></div>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed" style={{ color: '#8B7355' }}>
                {viewMode === 'problems'
                  ? 'Discover challenging problems and detailed solutions curated by expert educators.'
                  : 'Connect with fellow educators, share insights, and collaborate on academic challenges.'
                }
              </p>

              <div className="flex justify-center mt-6">
                <div className="bg-white rounded-full p-2 shadow-lg border-2" style={{ borderColor: '#D97706' }}>
                  <button
                    onClick={() => setViewMode('problems')}
                    className={`px-6 py-2 rounded-full font-semibold transition-all ${viewMode === 'problems'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                        : 'text-amber-700 hover:bg-amber-50'
                      }`}
                  >
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Problem Library
                  </button>
                  <button
                    onClick={() => setViewMode('wall')}
                    className={`px-6 py-2 rounded-full font-semibold transition-all ${viewMode === 'wall'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                        : 'text-amber-700 hover:bg-amber-50'
                      }`}
                  >
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Teacher's Wall
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2" style={{ borderColor: '#F59E0B' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-800">Total Problems</p>
                    <p className="text-2xl font-bold text-amber-900">{total || '---'}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-amber-600" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border-2" style={{ borderColor: '#EAB308' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Expert Solutions</p>
                    <p className="text-2xl font-bold text-yellow-900">{items.length || '---'}</p>
                  </div>
                  <Award className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border-2" style={{ borderColor: '#F97316' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-800">Active Discussions</p>
                    <p className="text-2xl font-bold text-orange-900">{Math.floor(total * 0.3) || '---'}</p>
                  </div>
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'problems' && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border-2" style={{ backgroundColor: '#fefcf8', borderColor: '#B8860B' }}>
            <div className="flex flex-col space-y-4">

              <div className="relative">
                <SearchIcon className="w-5 h-5 text-amber-600 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  value={q}
                  onChange={(e) => { setPage(1); setQ(e.target.value); }}
                  placeholder="Search for problems, solutions, or topics..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 text-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  style={{
                    borderColor: '#D97706',
                    backgroundColor: '#fffbeb',
                    color: '#8B4513'
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-2 rounded-full border-2" style={{ borderColor: '#F59E0B' }}>
                  <BookOpen className="w-4 h-4 text-amber-700" />
                  <select
                    value={subject}
                    onChange={(e) => { setPage(1); setSubject(e.target.value) }}
                    className="bg-transparent border-0 text-amber-800 font-medium focus:ring-0 cursor-pointer"
                  >
                    <option value="">All Subjects</option>
                    {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-2 rounded-full border-2" style={{ borderColor: '#F97316' }}>
                  <Layers className="w-4 h-4 text-orange-700" />
                  <select
                    value={chapter}
                    onChange={(e) => { setPage(1); setChapter(e.target.value) }}
                    className="bg-transparent border-0 text-orange-800 font-medium focus:ring-0 cursor-pointer"
                  >
                    <option value="">All Chapters</option>
                    {uniqueChapters.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-2 rounded-full border-2" style={{ borderColor: '#EAB308' }}>
                  <TrendingUp className="w-4 h-4 text-yellow-700" />
                  <select
                    value={difficulty}
                    onChange={(e) => { setPage(1); setDifficulty(e.target.value) }}
                    className="bg-transparent border-0 text-yellow-800 font-medium focus:ring-0 cursor-pointer"
                  >
                    <option value="">All Levels</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'wall' && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border-2" style={{ backgroundColor: '#fefcf8', borderColor: '#B8860B' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-amber-800" style={{ fontFamily: 'Georgia, serif' }}>Teacher's Discussion Wall</h3>
              <button
                onClick={() => setShowNewPostForm(!showNewPostForm)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full hover:from-amber-600 hover:to-orange-600 transition-all font-medium shadow-lg hover:scale-105"
              >
                <PlusCircle className="w-4 h-4" />
                Share Problem
              </button>
            </div>

            {showNewPostForm && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border-2 mb-4" style={{ borderColor: '#F59E0B' }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-amber-800 mb-2">Subject</label>
                      <input
                        value={newPostSubject}
                        onChange={(e) => setNewPostSubject(e.target.value)}
                        placeholder="e.g., Mathematics, Physics..."
                        className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        style={{ borderColor: '#F59E0B', backgroundColor: '#fffbeb' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-amber-800 mb-2">Difficulty</label>
                      <select
                        value={newPostDifficulty}
                        onChange={(e) => setNewPostDifficulty(e.target.value)}
                        className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        style={{ borderColor: '#F59E0B', backgroundColor: '#fffbeb' }}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-amber-800 mb-2">Problem or Discussion</label>
                    <textarea
                      value={newPostText}
                      onChange={(e) => setNewPostText(e.target.value)}
                      placeholder="Share an interesting problem, ask for help, or start a discussion..."
                      rows={4}
                      className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                      style={{ borderColor: '#F59E0B', backgroundColor: '#fffbeb' }}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowNewPostForm(false)}
                      className="px-4 py-2 rounded-lg border-2 border-amber-300 text-amber-800 hover:bg-amber-50 font-medium transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleNewWallPost}
                      disabled={postingWall || !newPostText.trim()}
                      className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${postingWall || !newPostText.trim()
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:scale-105'
                        }`}
                    >
                      {postingWall ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Post to Wall
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-800 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              {error}
            </div>
          </div>
        )}


        {viewMode === 'problems' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl border-2 animate-pulse" style={{ backgroundColor: '#f3e8d7', borderColor: '#D97706' }} />
            ))}

            {!loading && items.map((p) => (
              <div key={p._id} className="group bg-white rounded-2xl border-2 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" style={{ backgroundColor: '#fefcf8', borderColor: '#D97706' }}>

                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/5"></div>
                  <div className="relative flex items-start justify-between gap-2">
                    <h3 className="font-bold text-white text-lg line-clamp-2 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>{p.title}</h3>
                    {p.highlighted && (
                      <div className="flex-shrink-0 bg-yellow-300 rounded-full p-1">
                        <Star className="w-4 h-4 text-yellow-800" title="Highlighted" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">{p.subject}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300">{p.chapter}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${p.difficulty === 'easy' ? 'bg-green-100 text-green-800 border-green-300' :
                        p.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                          'bg-red-100 text-red-800 border-red-300'
                      }`}>{p.difficulty}</span>
                  </div>

                  <p className="text-gray-700 line-clamp-4 leading-relaxed mb-4 text-sm">{p.problemText}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-amber-200">
                    <div className="flex items-center gap-2 text-xs text-amber-700">
                      <CalendarIcon className="w-3 h-3" />
                      {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => openPost(p)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full hover:from-amber-600 hover:to-orange-600 transition-all font-medium text-sm group-hover:scale-105"
                    >
                      Explore Solution
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'wall' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {wallPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300" style={{ backgroundColor: '#fefcf8', borderColor: '#D97706' }}>

                <div className="p-6 border-b border-amber-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {post.teacherAvatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-amber-800 text-lg" style={{ fontFamily: 'Georgia, serif' }}>
                            {post.teacherName}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                              {post.subject}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${post.difficulty === 'easy' ? 'bg-green-100 text-green-800 border-green-300' :
                                post.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                  'bg-red-100 text-red-800 border-red-300'
                              }`}>
                              {post.difficulty}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(post.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base">
                    {post.content}
                  </p>
                </div>

                <div className="px-6 pb-6 flex items-center justify-between border-t border-amber-200 pt-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all font-medium ${post.isLiked
                          ? 'bg-red-100 text-red-600 border-2 border-red-300'
                          : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-red-50 hover:text-red-500'
                        }`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                      {post.likes}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-600 border-2 border-blue-300 hover:bg-blue-50 transition-all font-medium">
                      <MessageSquare className="w-4 h-4" />
                      {post.comments}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    <CalendarIcon className="w-3 h-3 inline mr-1" />
                    {post.timestamp.toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}

            {wallPosts.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600">Be the first to share a problem or start a discussion!</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'problems' && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className={`px-6 py-3 rounded-full font-medium transition-all ${page <= 1
                  ? 'text-gray-400 border-2 border-gray-200 bg-gray-50'
                  : 'text-amber-800 border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 hover:scale-105'
                }`}
            >
              Previous
            </button>
            <div className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg">
              Page {page} of {totalPages}
            </div>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className={`px-6 py-3 rounded-full font-medium transition-all ${page >= totalPages
                  ? 'text-gray-400 border-2 border-gray-200 bg-gray-50'
                  : 'text-amber-800 border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 hover:scale-105'
                }`}
            >
              Next
            </button>
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden border-4" style={{ backgroundColor: '#fefcf8', borderColor: '#8B7355' }} onClick={(e) => e.stopPropagation()}>

              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>{selected.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-amber-200 text-amber-800 border border-amber-400">{selected.subject}</span>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-orange-200 text-orange-800 border border-orange-400">{selected.chapter}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize border ${selected.difficulty === 'easy' ? 'bg-green-200 text-green-800 border-green-400' :
                          selected.difficulty === 'medium' ? 'bg-yellow-200 text-yellow-800 border-yellow-400' :
                            'bg-red-200 text-red-800 border-red-400'
                        }`}>{selected.difficulty}</span>
                    </div>
                  </div>
                  {selected.highlighted && (
                    <div className="flex-shrink-0 bg-yellow-300 rounded-full p-2 shadow-lg">
                      <Star className="w-6 h-6 text-yellow-800" />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border-2" style={{ borderColor: '#F59E0B' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <h4 className="text-lg font-bold text-amber-800" style={{ fontFamily: 'Georgia, serif' }}>Problem Statement</h4>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
                    {selected.problemText}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2" style={{ borderColor: '#10B981' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h4 className="text-lg font-bold text-green-800" style={{ fontFamily: 'Georgia, serif' }}>Expert Solution</h4>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                    {selected.solutionText}
                  </div>
                </div>
              </div>

              <div className="border-t-4 border-amber-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-6 h-6 text-orange-600" />
                  <h4 className="text-xl font-bold text-orange-800" style={{ fontFamily: 'Georgia, serif' }}>Discussion Forum</h4>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-3 mb-4 bg-white rounded-xl p-4 border-2 border-orange-200">
                  {comments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p>No comments yet. Be the first to ask or share insight!</p>
                    </div>
                  )}
                  {comments.map(c => (
                    <div key={c._id} className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {(c.authorName || 'A')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-amber-800">{c.authorName || 'Anonymous'}</div>
                          <div className="text-xs text-amber-600">{new Date(c.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">{c.text}</div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts or ask a question..."
                    className="flex-1 px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-lg"
                    style={{ borderColor: '#F59E0B', backgroundColor: '#fffbeb' }}
                  />
                  <button
                    disabled={postingComment || !commentText.trim()}
                    onClick={submitComment}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${postingComment || !commentText.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:scale-105'
                      }`}
                  >
                    {postingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="px-6 py-3 rounded-xl border-2 border-amber-300 text-amber-800 hover:bg-amber-50 font-semibold transition-all hover:scale-105"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div> */}
      <div className="bg-white shadow-sm p-6 h-[90vh]">
        <div className="text-center flex justify-center items-center h-full">
          <p className="text-gray-600">Study Hub comming soon!</p>
        </div>
      </div>
    </>
  );
}