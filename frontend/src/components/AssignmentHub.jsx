import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

/* ═══════════════ SUBJECT ICON MAPPING ═══════════════ */
const SUBJECT_ICONS = {
  'mathematics': { emoji: '🧮', bg: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)', color: '#6C63FF', colorBg: '#EEEDFF' },
  'math': { emoji: '🧮', bg: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)', color: '#6C63FF', colorBg: '#EEEDFF' },
  'english': { emoji: '📖', bg: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', color: '#D97706', colorBg: '#FEF3C7' },
  'science': { emoji: '🔬', bg: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', color: '#059669', colorBg: '#D1FAE5' },
  'physics': { emoji: '⚡', bg: 'linear-gradient(135deg, #E0F2FE, #BAE6FD)', color: '#0284C7', colorBg: '#E0F2FE' },
  'chemistry': { emoji: '🧪', bg: 'linear-gradient(135deg, #FCE7F3, #FBCFE8)', color: '#DB2777', colorBg: '#FCE7F3' },
  'biology': { emoji: '🌿', bg: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', color: '#059669', colorBg: '#D1FAE5' },
  'history': { emoji: '📜', bg: 'linear-gradient(135deg, #FFEDD5, #FED7AA)', color: '#EA580C', colorBg: '#FFEDD5' },
  'geography': { emoji: '🌍', bg: 'linear-gradient(135deg, #E0F2FE, #BAE6FD)', color: '#0284C7', colorBg: '#E0F2FE' },
  'computer': { emoji: '💻', bg: 'linear-gradient(135deg, #E0F2FE, #BAE6FD)', color: '#0284C7', colorBg: '#E0F2FE' },
  'hindi': { emoji: '📝', bg: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', color: '#D97706', colorBg: '#FEF3C7' },
  'social': { emoji: '🏛️', bg: 'linear-gradient(135deg, #FFEDD5, #FED7AA)', color: '#EA580C', colorBg: '#FFEDD5' },
  'default': { emoji: '📚', bg: 'linear-gradient(135deg, #FCE7F3, #FBCFE8)', color: '#DB2777', colorBg: '#FCE7F3' }
};

const getSubjectIcon = (subject = '') => {
  const normalized = subject.toLowerCase();
  for (const key in SUBJECT_ICONS) {
    if (normalized.includes(key)) {
      return SUBJECT_ICONS[key];
    }
  }
  return SUBJECT_ICONS.default;
};

/* ═══════════════ HELPER FUNCTIONS ═══════════════ */
const getDaysAgo = (date) => {
  if (!date) return 0;
  const now = new Date();
  const then = new Date(date);
  const diff = now - then;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const options = { month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
};

const getStatus = (assignment, submission) => {
  if (submission?.status === 'submitted' || submission?.status === 'graded') {
    return 'completed';
  }
  if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
    return 'overdue';
  }
  return 'pending';
};

/* ═══════════════ MAIN COMPONENT ═══════════════ */
const AssignmentHub = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      // Fetch assignments and student profile in parallel
      const [assignmentsRes, profileRes] = await Promise.all([
        axios.get(`${API_BASE}/api/assignment/student/assignments`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/api/student/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setAssignments(assignmentsRes.data || []);
      setStudentInfo(profileRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ═══════════════ COMPUTED VALUES ═══════════════ */
  const filteredAssignments = assignments.filter(a => {
    const status = getStatus(a, a.submission);
    if (filter === 'pending' && status !== 'pending') return false;
    if (filter === 'completed' && status !== 'completed') return false;
    if (filter === 'overdue' && status !== 'overdue') return false;
    if (searchQuery && !a.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: assignments.length,
    completed: assignments.filter(a => getStatus(a, a.submission) === 'completed').length,
    pending: assignments.filter(a => getStatus(a, a.submission) === 'pending').length,
    overdue: assignments.filter(a => getStatus(a, a.submission) === 'overdue').length
  };

  const oldestOverdue = assignments
    .filter(a => getStatus(a, a.submission) === 'overdue')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];

  const progressPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  /* ═══════════════ GREETING ═══════════════ */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    return `📅 ${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FEF6EE' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: '#FEF6EE', minHeight: '100vh' }}>
      {/* Background gradients */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 600px 400px at 10% 20%, rgba(108,99,255,0.06), transparent),
          radial-gradient(ellipse 500px 500px at 90% 70%, rgba(255,140,66,0.06), transparent),
          radial-gradient(ellipse 400px 300px at 50% 90%, rgba(255,107,138,0.05), transparent)
        `
      }} />

      {/* Top Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(254,246,238,0.88)',
        backdropFilter: 'blur(20px) saturate(1.5)',
        borderBottom: '1.5px solid rgba(44,24,16,0.06)',
        padding: '14px 40px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px'
      }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: "'Baloo 2', cursive", fontSize: '20px', fontWeight: 700, lineHeight: 1.2 }}>
            {getGreeting()}, <span style={{ color: '#6C63FF' }}>{studentInfo?.name || 'Student'}</span> 👋
          </h2>
          <div style={{ fontSize: '12.5px', color: '#B0A098', fontWeight: 600, marginTop: '1px' }}>
            {getDate()} &nbsp;·&nbsp; Class {studentInfo?.grade || ''}-{studentInfo?.section || ''} &nbsp;·&nbsp; Roll {studentInfo?.roll || ''}
          </div>
        </div>
        <div style={{ position: 'relative', width: '320px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#B0A098' }}>🔍</span>
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px 10px 42px',
              borderRadius: '16px',
              border: '1.5px solid rgba(44,24,16,0.08)',
              background: 'white',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              color: '#2C1810',
              outline: 'none'
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '28px 40px 60px' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '24px', animation: 'fadeIn 0.5s ease forwards', opacity: 0 }}>
          <h1 style={{ fontFamily: "'Baloo 2', cursive", fontSize: '32px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            📋 Assignments
          </h1>
          <p style={{ fontSize: '15px', color: '#7A6960', fontWeight: 600, marginTop: '2px' }}>
            Your workspace for all assignments and submissions
          </p>
        </div>

        {/* Nudge Card for Overdue */}
        {oldestOverdue && (
          <div style={{
            background: 'linear-gradient(135deg, #FFF1F1 0%, #FFE4EC 50%, #FFF0F6 100%)',
            border: '2px solid rgba(248,113,113,0.2)',
            borderRadius: '28px',
            padding: '22px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '24px',
            animation: 'fadeIn 0.5s ease 0.1s forwards, nudgePulse 3s ease-in-out infinite',
            opacity: 0
          }}>
            <div style={{ fontSize: '42px', flexShrink: 0 }}>⏰</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: "'Baloo 2', cursive", fontSize: '18px', fontWeight: 700, color: '#B91C1C', marginBottom: '2px' }}>
                {stats.overdue} assignment{stats.overdue > 1 ? 's' : ''} need{stats.overdue === 1 ? 's' : ''} your attention!
              </h3>
              <p style={{ fontSize: '13.5px', color: '#9A3412', fontWeight: 600 }}>
                "{oldestOverdue.title}" is still pending — it was assigned {getDaysAgo(oldestOverdue.createdAt)} days ago.
              </p>
            </div>
            <button
              onClick={() => navigate('/student/assignments')}
              style={{
                padding: '11px 28px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #F87171, #EF4444)',
                color: 'white',
                border: 'none',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
                flexShrink: 0
              }}
            >
              Start Now →
            </button>
          </div>
        )}

        {/* Progress Summary */}
        <div style={{
          background: 'white',
          borderRadius: '28px',
          padding: '24px 30px',
          display: 'flex',
          alignItems: 'center',
          gap: '28px',
          boxShadow: '0 2px 8px rgba(44,24,16,0.05)',
          marginBottom: '28px',
          border: '1.5px solid rgba(44,24,16,0.04)',
          animation: 'fadeIn 0.5s ease 0.2s forwards',
          opacity: 0
        }}>
          {/* Circular Progress */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6C63FF" />
                  <stop offset="100%" stopColor="#A78BFA" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="45" fill="none" stroke="#F3EEEA" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * progressPercent) / 100}
                style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontFamily: "'Baloo 2', cursive", fontSize: '28px', fontWeight: 800, lineHeight: 1, color: '#6C63FF' }}>
                {stats.completed}/{stats.total}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#B0A098' }}>done</span>
            </div>
          </div>

          {/* Message */}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: "'Baloo 2', cursive", fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
              {progressPercent === 100 ? 'Perfect! 🎉' : progressPercent > 70 ? 'Almost there! 🎉' : 'Keep going! 💪'}
            </h3>
            <p style={{ fontSize: '14px', color: '#7A6960', fontWeight: 600, lineHeight: 1.5 }}>
              {progressPercent === 100
                ? "You've completed all assignments. Great work!"
                : `You've completed ${stats.completed} out of ${stats.total} assignments. ${stats.pending > 0 ? `Just ${stats.pending} more to go — you're doing great!` : ''}`
              }
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '14px', flexShrink: 0 }}>
            <div style={{ textAlign: 'center', padding: '12px 18px', borderRadius: '16px', minWidth: '80px', background: '#FFFBEB' }}>
              <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: '24px', fontWeight: 800, lineHeight: 1, color: '#D97706' }}>
                {stats.pending}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px', color: '#B45309' }}>
                Pending
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px 18px', borderRadius: '16px', minWidth: '80px', background: '#ECFDF5' }}>
              <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: '24px', fontWeight: 800, lineHeight: 1, color: '#059669' }}>
                {stats.completed}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px', color: '#047857' }}>
                Done
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px 18px', borderRadius: '16px', minWidth: '80px', background: '#FFF1F1' }}>
              <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: '24px', fontWeight: 800, lineHeight: 1, color: '#DC2626' }}>
                {stats.overdue}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px', color: '#B91C1C' }}>
                Overdue
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '22px',
          animation: 'fadeIn 0.5s ease 0.3s forwards',
          opacity: 0
        }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'pending', 'completed', 'overdue'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  border: `2px solid ${filter === f ? '#6C63FF' : 'rgba(44,24,16,0.08)'}`,
                  background: filter === f ? '#6C63FF' : 'white',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: '13px',
                  color: filter === f ? 'white' : '#7A6960',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: filter === f ? '0 3px 10px rgba(108,99,255,0.25)' : 'none'
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Assignment Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredAssignments.map((assignment, idx) => {
            const status = getStatus(assignment, assignment.submission);
            const subjectIcon = getSubjectIcon(assignment.subject || assignment.title);
            const daysAgo = getDaysAgo(assignment.createdAt);

            return (
              <div
                key={assignment._id}
                style={{
                  background: status === 'overdue' ? 'linear-gradient(90deg, #FFF5F5 0%, white 15%)' : 'white',
                  borderRadius: '16px',
                  padding: '22px 26px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  boxShadow: '0 2px 8px rgba(44,24,16,0.05)',
                  border: '2px solid transparent',
                  borderLeft: `5px solid ${status === 'completed' ? '#34D399' : status === 'overdue' ? '#F87171' : '#FBBF24'}`,
                  cursor: 'pointer',
                  transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `fadeIn 0.5s ease ${0.4 + idx * 0.05}s forwards`,
                  opacity: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(44,24,16,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(44,24,16,0.05)';
                }}
              >
                {/* Subject Icon */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                  flexShrink: 0,
                  background: subjectIcon.bg,
                  transition: 'transform 0.3s'
                }}>
                  {subjectIcon.emoji}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'Baloo 2', cursive",
                    fontSize: '18px',
                    fontWeight: 700,
                    marginBottom: '6px',
                    lineHeight: 1.2
                  }}>
                    {assignment.title}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#7A6960',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '7px',
                      fontWeight: 700,
                      fontSize: '12px',
                      background: subjectIcon.colorBg,
                      color: subjectIcon.color
                    }}>
                      {assignment.subject || 'General'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      👨‍🏫 {assignment.teacherId?.name || 'Teacher'}
                    </span>
                  </div>
                  {assignment.description && (
                    <div style={{
                      marginTop: '8px',
                      fontSize: '13px',
                      color: '#B0A098',
                      fontWeight: 600,
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {assignment.description}
                    </div>
                  )}
                </div>

                {/* Right Side */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '10px',
                  flexShrink: 0
                }}>
                  <span style={{
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    letterSpacing: '0.3px',
                    background: status === 'completed' ? '#34D399' : status === 'overdue' ? '#F87171' : '#FBBF24',
                    color: status === 'completed' ? 'white' : status === 'overdue' ? 'white' : '#78350F',
                    animation: status === 'overdue' ? 'overdueP 2s ease-in-out infinite' : 'none'
                  }}>
                    {status === 'completed' ? '✓ Completed' : status === 'overdue' ? '⚠️ Overdue' : '⏳ Pending'}
                  </span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#B0A098'
                  }}>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: status === 'overdue' ? '#F87171' : '#B0A098'
                    }}>
                      {status === 'overdue' ? '⚠️' : '📅'} {daysAgo}d ago
                    </span>
                    {assignment.dueDate && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📅 Due: {formatDate(assignment.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredAssignments.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(44,24,16,0.05)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <h3 style={{ fontFamily: "'Baloo 2', cursive", fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                No assignments found
              </h3>
              <p style={{ fontSize: '14px', color: '#7A6960', fontWeight: 600 }}>
                {filter === 'all'
                  ? "You don't have any assignments yet."
                  : `You don't have any ${filter} assignments.`
                }
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap');

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes nudgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(248,113,113,0); }
          50% { box-shadow: 0 0 0 6px rgba(248,113,113,0.08); }
        }

        @keyframes overdueP {
          0%, 100% { box-shadow: 0 0 0 0 rgba(248,113,113,0); }
          50% { box-shadow: 0 0 0 5px rgba(248,113,113,0.2); }
        }
      `}</style>
    </div>
  );
};

export default AssignmentHub;
