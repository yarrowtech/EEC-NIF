import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import {
  MessageSquare, Send, Search, ChevronLeft,
  Info, PlusCircle, X, Loader2, GraduationCap, Check, CheckCheck, User, Users
} from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeader(), ...(options.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000 && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diff < 172800000) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const dayKey = (ts) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

const formatDaySeparator = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const todayKey = dayKey(now);
  const msgKey = dayKey(d);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = dayKey(yesterday);
  if (msgKey === todayKey) return 'Today';
  if (msgKey === yesterdayKey) return 'Yesterday';
  return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
};

const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

const resolveImg = (src) => {
  if (!src) return null;
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('blob:') || src.startsWith('data:')) {
    return src;
  }
  return `${API_URL}${src.startsWith('/') ? '' : '/'}${src}`;
};

// ── Chat wallpaper (WhatsApp-style doodle background) ─────────────────────────
const _WALLPAPER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
  <rect width="300" height="300" fill="#f5f0e8"/>
  <g opacity="0.45">
    <rect x="15" y="18" width="58" height="30" rx="8" fill="#c9ad88"/>
    <path d="M22,48 L13,62 L33,48" fill="#c9ad88"/>
    <line x1="22" y1="28" x2="60" y2="28" stroke="#f5f0e8" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="22" y1="36" x2="52" y2="36" stroke="#f5f0e8" stroke-width="2.5" stroke-linecap="round"/>
  </g>
  <g opacity="0.38">
    <rect x="216" y="22" width="52" height="26" rx="7" fill="#c9ad88"/>
    <path d="M258,48 L266,61 L250,48" fill="#c9ad88"/>
    <line x1="224" y1="31" x2="258" y2="31" stroke="#f5f0e8" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="224" y1="39" x2="246" y2="39" stroke="#f5f0e8" stroke-width="2.5" stroke-linecap="round"/>
  </g>
  <path d="M148,25 L140,17 C137,14 137,9 140,6 C143,3 148,4.5 148,8 C148,4.5 153,3 156,6 C159,9 159,14 156,17 Z" fill="#e8a87c" opacity="0.42"/>
  <g transform="translate(243,68)" fill="#c9ad88" opacity="0.45">
    <path d="M11,0 L13.5,8 L22,8 L15,13 L17.5,21 L11,16 L4.5,21 L7,13 L0,8 L8.5,8 Z"/>
  </g>
  <g opacity="0.45">
    <rect x="18" y="148" width="56" height="32" rx="12" fill="#c9ad88"/>
    <path d="M24,180 L13,195 L35,180" fill="#c9ad88"/>
    <circle cx="34" cy="164" r="4" fill="#f5f0e8"/>
    <circle cx="46" cy="164" r="4" fill="#f5f0e8"/>
    <circle cx="58" cy="164" r="4" fill="#f5f0e8"/>
  </g>
  <g transform="translate(152,132)" opacity="0.38">
    <rect x="1" y="11" width="20" height="14" rx="3" fill="#c9ad88"/>
    <path d="M4,11 L4,7 C4,2 18,2 18,7 L18,11" fill="none" stroke="#c9ad88" stroke-width="2.5"/>
    <circle cx="11" cy="18" r="3" fill="#f5f0e8"/>
  </g>
  <g transform="translate(237,183)" opacity="0.38">
    <circle cx="14" cy="14" r="13" fill="none" stroke="#c9ad88" stroke-width="2"/>
    <circle cx="9" cy="11" r="2" fill="#c9ad88"/>
    <circle cx="19" cy="11" r="2" fill="#c9ad88"/>
    <path d="M8,18 Q14,24 20,18" fill="none" stroke="#c9ad88" stroke-width="2" stroke-linecap="round"/>
  </g>
  <g opacity="0.42">
    <rect x="196" y="240" width="72" height="36" rx="8" fill="#c9ad88"/>
    <path d="M258,276 L268,290 L254,276" fill="#c9ad88"/>
    <line x1="206" y1="253" x2="256" y2="253" stroke="#f5f0e8" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="206" y1="264" x2="244" y2="264" stroke="#f5f0e8" stroke-width="2.5" stroke-linecap="round"/>
  </g>
  <g transform="translate(86,207)" opacity="0.38">
    <circle cx="10" cy="10" r="10" fill="none" stroke="#c9ad88" stroke-width="1.8" stroke-dasharray="4 3"/>
    <line x1="10" y1="3" x2="10" y2="17" stroke="#c9ad88" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="3" y1="10" x2="17" y2="10" stroke="#c9ad88" stroke-width="1.8" stroke-linecap="round"/>
  </g>
  <g transform="translate(100,92)" fill="#e8a87c" opacity="0.35">
    <path d="M12,3 L14,9 L20,9 L15.5,12.5 L17.5,18.5 L12,15 L6.5,18.5 L8.5,12.5 L4,9 L10,9 Z"/>
  </g>
  <g transform="translate(178,148)" opacity="0.35">
    <rect x="0" y="8" width="34" height="22" rx="6" fill="#c9ad88"/>
    <path d="M5,8 L5,5 C5,1 29,1 29,5 L29,8" fill="none" stroke="#c9ad88" stroke-width="2.5"/>
  </g>
  <g fill="#c9ad88" opacity="0.22">
    <circle cx="104" cy="58" r="3"/>
    <circle cx="174" cy="96" r="3"/>
    <circle cx="278" cy="154" r="3"/>
    <circle cx="122" cy="270" r="3"/>
    <circle cx="70" cy="112" r="3"/>
    <circle cx="202" cy="116" r="3"/>
    <circle cx="142" cy="212" r="3"/>
    <circle cx="56" cy="240" r="3"/>
    <circle cx="290" cy="60" r="3"/>
  </g>
</svg>`;
const CHAT_BG_STYLE = {
  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(_WALLPAPER_SVG)}")`,
  backgroundRepeat: 'repeat',
  backgroundSize: '300px 300px',
};

// ── ChatMessage component ──────────────────────────────────────────────────────
const isSeenByOther = (msg, myId) => {
  if (!myId) return false;
  return (
    Array.isArray(msg?.seenBy) &&
    msg.seenBy.some((entry) => String(entry?.userId) !== String(myId))
  );
};

const ChatMessage = ({ msg, isMine, myId }) => {
  const optimistic = Boolean(msg?._optimistic);
  const delivered = isMine && !optimistic;
  const seen = isMine && delivered && isSeenByOther(msg, myId);
  const LONG_MESSAGE_LIMIT = 260;
  const fullText = String(msg?.text || '');
  const isLongMessage = fullText.length > LONG_MESSAGE_LIMIT;
  const [expanded, setExpanded] = useState(false);
  const visibleText = isLongMessage && !expanded
    ? `${fullText.slice(0, LONG_MESSAGE_LIMIT)}...`
    : fullText;

  return (
  <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
    <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-sm
      ${isMine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm'}`}>
      {!isMine && (
        <div className="text-xs font-semibold text-blue-600 mb-1">{msg.senderName}</div>
      )}
      <div className="whitespace-pre-wrap leading-relaxed">{visibleText}</div>
      {isLongMessage && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className={`mt-1 text-xs font-semibold ${isMine ? 'text-blue-200' : 'text-blue-600'} hover:underline`}
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      )}
      <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
        <span>{formatTime(msg.createdAt || msg.ts)}</span>
        {isMine && (
          <span className={`inline-flex items-center ${seen ? 'text-cyan-300' : 'text-blue-200'}`}>
            {seen ? (
              <CheckCheck className="h-3.5 w-3.5" />
            ) : delivered ? (
              <CheckCheck className="h-3.5 w-3.5" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
          </span>
        )}
      </div>
    </div>
  </div>
  );
};

// ── ConversationItem component ─────────────────────────────────────────────────
const ConversationItem = ({ thread, isActive, onClick }) => {
  const other = thread.otherParticipant;
  const name = other?.name || 'Unknown';
  const initials = getInitials(name);
  const unread = thread.unreadCount || 0;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-gray-100
        ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'}`}
    >
      <div className="relative flex-shrink-0">
        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
          {initials}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-sm truncate ${unread > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
            {name}
          </span>
          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{formatTime(thread.lastMessageAt)}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-xs text-gray-500 truncate">{thread.lastMessage || 'No messages yet'}</span>
          {unread > 0 && (
            <span className="ml-2 flex-shrink-0 h-5 min-w-[20px] px-1.5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
              {unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// ── ContactItem ────────────────────────────────────────────────────────────────
const ContactItem = ({ contact, onClick }) => {
  const initials = getInitials(contact.name);
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors border-b border-gray-100"
    >
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate">{contact.name}</div>
        <div className="text-xs text-gray-500">{contact.subtitle}</div>
      </div>
      <GraduationCap className="h-4 w-4 text-gray-400 flex-shrink-0" />
    </button>
  );
};

const UserAvatar = ({ src, name, className = '' }) => {
  const [error, setError] = useState(false);
  const resolved = resolveImg(src);
  if (resolved && !error) {
    return (
      <img
        src={resolved}
        alt={name || 'User'}
        onError={() => setError(true)}
        className={`h-7 w-7 rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <div className={`h-7 w-7 rounded-full bg-blue-200 flex items-center justify-center text-xs font-semibold text-blue-800 ${className}`}>
      {getInitials(name || 'T')}
    </div>
  );
};

const ParticipantProfileModal = ({ open, loading, error, profile, profileType, onClose }) => {
  if (!open) return null;
  const isParentProfile = profileType === 'parent';
  const studentRows = [
    { icon: User, label: 'Student Name', value: profile?.studentName || 'N/A' },
    { icon: Users, label: 'Parent Name', value: profile?.parentName || 'N/A' },
    {
      icon: GraduationCap,
      label: 'Class & Section',
      value: `${profile?.className || 'N/A'}${profile?.section && profile?.section !== 'N/A' ? ` - ${profile.section}` : ''}`
    },
    { icon: Info, label: 'Roll Number', value: profile?.rollNumber || 'N/A' },
  ];
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            {isParentProfile ? 'Parent Profile' : 'Student Profile'}
          </h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="py-8 flex items-center justify-center text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading profile...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-100 bg-rose-50 text-rose-700 px-4 py-3 text-sm">
              {error}
            </div>
          ) : (
            <div className="space-y-3">
              {isParentProfile ? (
                <>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                        <Users className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Parent Name</p>
                        <p className="text-sm text-gray-900 font-medium break-words">{profile?.parentName || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">Student Details</p>
                    {Array.isArray(profile?.students) && profile.students.length > 0 ? (
                      <div className="space-y-2">
                        {profile.students.map((student) => (
                          <div key={student.id} className="rounded-lg bg-white border border-gray-100 px-3 py-2">
                            <p className="text-sm font-semibold text-gray-900">{student.studentName || 'Student'}</p>
                            <p className="text-xs text-gray-600">
                              {student.className || 'N/A'}{student.section && student.section !== 'N/A' ? ` - ${student.section}` : ''}
                            </p>
                            <p className="text-xs text-gray-500">Roll: {student.rollNumber || 'N/A'}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No linked students found.</p>
                    )}
                  </div>
                </>
              ) : studentRows.map((item) => (
                <div key={item.label} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                      <item.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{item.label}</p>
                      <p className="text-sm text-gray-900 font-medium break-words">{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main TeacherChat ───────────────────────────────────────────────────────────
const TeacherChat = () => {
  const [me, setMe] = useState(null);
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [contacts, setContacts] = useState([]);
  const [showContacts, setShowContacts] = useState(false);
  const [contactQuery, setContactQuery] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showStudentProfileModal, setShowStudentProfileModal] = useState(false);
  const [studentProfileLoading, setStudentProfileLoading] = useState(false);
  const [studentProfileError, setStudentProfileError] = useState('');
  const [studentProfile, setStudentProfile] = useState(null);
  const [profileType, setProfileType] = useState('student');
  const [typingUsers, setTypingUsers] = useState({});
  const [isMobileView, setIsMobileView] = useState(false);

  const socketRef = useRef(null);
  const activeThreadIdRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimers = useRef({});
  const typingDebounce = useRef(null);
  const isTyping = useRef(false);
  const meRef = useRef(null);

  const activeThread = useMemo(() => threads.find(t => String(t._id) === activeThreadId), [threads, activeThreadId]);

  const openStudentProfile = useCallback(async () => {
    const participantId = activeThread?.otherParticipant?.userId;
    const participantType = String(activeThread?.otherParticipant?.userType || 'student').toLowerCase();
    if (!participantId) return;
    setShowStudentProfileModal(true);
    setStudentProfileLoading(true);
    setStudentProfileError('');
    setStudentProfile(null);
    setProfileType(participantType === 'parent' ? 'parent' : 'student');
    try {
      const endpoint =
        participantType === 'parent'
          ? `/api/chat/parents/${participantId}/profile`
          : `/api/chat/students/${participantId}/profile`;
      const profile = await apiFetch(endpoint);
      setStudentProfile(profile);
    } catch (error) {
      setStudentProfileError(error?.message || 'Unable to load profile');
    } finally {
      setStudentProfileLoading(false);
    }
  }, [activeThread]);

  useEffect(() => {
    setShowStudentProfileModal(false);
    setStudentProfile(null);
    setStudentProfileError('');
    setStudentProfileLoading(false);
    setProfileType('student');
  }, [activeThreadId]);

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let mounted = true;

    const init = async () => {
      try {
        const [meData, threadsData] = await Promise.all([
          apiFetch('/api/chat/me'),
          apiFetch('/api/chat/threads'),
        ]);
        if (!mounted) return;
        setMe(meData);
        meRef.current = meData;
        setThreads(threadsData);
      } catch {
        // ignore
      } finally {
        if (mounted) setLoadingThreads(false);
      }
    };

    init();

    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      if (activeThreadIdRef.current) {
        socket.emit('join-thread', { threadId: activeThreadIdRef.current });
      }
    });

    socket.on('new-message', (msg) => {
      const threadId = String(msg.threadId);
      const isActiveThread = String(activeThreadIdRef.current) === threadId;
      const isIncomingForMe = String(msg.senderId) !== String(meRef.current?.id);
      setMessages(prev => {
        if (activeThreadIdRef.current !== threadId) return prev;
        // Sender already has an optimistic copy — replace it, don't append
        if (String(msg.senderId) === String(meRef.current?.id)) {
          const optIdx = prev.findLastIndex(m => m._optimistic);
          if (optIdx !== -1) {
            const next = [...prev];
            next[optIdx] = msg;
            return next;
          }
        }
        // Message from someone else — guard against duplicates
        if (prev.find(m => String(m._id) === String(msg._id))) return prev;
        const hydratedMsg = isIncomingForMe
          ? {
              ...msg,
              seenBy: [
                ...(Array.isArray(msg.seenBy) ? msg.seenBy : []),
                { userId: meRef.current?.id, seenAt: new Date().toISOString() }
              ]
            }
          : msg;
        return [...prev, hydratedMsg];
      });
      setThreads(prev => prev.map(t =>
        String(t._id) === threadId
          ? {
              ...t,
              lastMessage: msg.text,
              lastMessageAt: msg.createdAt,
              unreadCount: activeThreadIdRef.current === threadId ? 0 : (t.unreadCount || 0) + 1,
            }
          : t
      ));

      if (isActiveThread && isIncomingForMe) {
        socket.emit('mark-seen', { threadId });
      }
    });

    socket.on('thread-updated', ({ threadId, lastMessage, lastMessageAt }) => {
      setThreads(prev => prev.map(t =>
        String(t._id) === threadId
          ? { ...t, lastMessage, lastMessageAt, unreadCount: activeThreadIdRef.current === threadId ? 0 : (t.unreadCount || 0) + 1 }
          : t
      ));
    });

    socket.on('typing', ({ threadId, isTyping: typing, userName }) => {
      if (String(activeThreadIdRef.current) !== String(threadId)) return;
      const key = String(threadId);
      if (typing) {
        setTypingUsers(prev => ({ ...prev, [key]: userName }));
        clearTimeout(typingTimers.current[key]);
        typingTimers.current[key] = setTimeout(() => {
          setTypingUsers(prev => { const n = { ...prev }; delete n[key]; return n; });
        }, 3000);
      } else {
        setTypingUsers(prev => { const n = { ...prev }; delete n[key]; return n; });
      }
    });

    socket.on('message-seen', ({ threadId, userId }) => {
      if (String(activeThreadIdRef.current) !== String(threadId)) return;
      setMessages((prev) =>
        prev.map((msg) => {
          if (String(msg.senderId) !== String(meRef.current?.id)) return msg;
          if (Array.isArray(msg.seenBy) && msg.seenBy.some((entry) => String(entry?.userId) === String(userId))) {
            return msg;
          }
          return {
            ...msg,
            seenBy: [...(Array.isArray(msg.seenBy) ? msg.seenBy : []), { userId, seenAt: new Date().toISOString() }]
          };
        })
      );
    });

    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, []);

  // ── Resize ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobileView(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Select thread ─────────────────────────────────────────────────────────
  const selectThread = useCallback(async (threadId) => {
    const socket = socketRef.current;
    if (activeThreadIdRef.current && activeThreadIdRef.current !== threadId) {
      socket?.emit('leave-thread', { threadId: activeThreadIdRef.current });
    }
    activeThreadIdRef.current = threadId;
    setActiveThreadId(threadId);
    setMessages([]);
    setLoadingMessages(true);
    setThreads(prev => prev.map(t => String(t._id) === threadId ? { ...t, unreadCount: 0 } : t));
    socket?.emit('join-thread', { threadId });
    socket?.emit('mark-seen', { threadId });
    try {
      const msgs = await apiFetch(`/api/chat/threads/${threadId}/messages`);
      setMessages(msgs);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // ── Start new conversation ─────────────────────────────────────────────────
  const startConversation = useCallback(async (contact) => {
    setShowContacts(false);
    setContactQuery('');
    try {
      const thread = await apiFetch('/api/chat/threads/direct', {
        method: 'POST',
        body: JSON.stringify({ targetId: contact._id, targetType: contact.userType }),
      });
      setThreads(prev => {
        const exists = prev.find(t => String(t._id) === String(thread._id));
        if (exists) return prev;
        return [thread, ...prev];
      });
      selectThread(String(thread._id));
    } catch { /* ignore */ }
  }, [selectThread]);

  // ── Load contacts ─────────────────────────────────────────────────────────
  const openContacts = useCallback(async () => {
    if (contacts.length === 0) {
      try {
        const data = await apiFetch('/api/chat/contacts');
        setContacts(data);
      } catch { /* ignore */ }
    }
    setShowContacts(true);
  }, [contacts]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    const text = draft.trim();
    if (!text || !activeThreadId) return;
    setDraft('');

    const optimisticId = `opt-${Date.now()}`;
    const optimistic = {
      _id: optimisticId,
      threadId: activeThreadId,
      senderId: me?.id,
      senderType: 'teacher',
      senderName: me?.name || 'Teacher',
      text,
      createdAt: new Date().toISOString(),
      seenBy: [{ userId: me?.id, seenAt: new Date().toISOString() }],
      _optimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);

    if (socketRef.current?.connected) {
      socketRef.current.emit('send-message', { threadId: activeThreadId, text });
    } else {
      apiFetch(`/api/chat/threads/${activeThreadId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      }).then(msg => {
        setMessages(prev => prev.map(m => m._id === optimisticId ? msg : m));
      }).catch(() => {
        setMessages(prev => prev.filter(m => m._id !== optimisticId));
      });
    }

    setThreads(prev => prev.map(t =>
      String(t._id) === activeThreadId
        ? { ...t, lastMessage: text, lastMessageAt: new Date().toISOString() }
        : t
    ));

    if (isTyping.current) {
      isTyping.current = false;
      socketRef.current?.emit('typing-stop', { threadId: activeThreadId });
    }
  }, [draft, activeThreadId, me]);

  // ── Typing indicators ─────────────────────────────────────────────────────
  const handleDraftChange = useCallback((val) => {
    setDraft(val);
    if (!activeThreadId || !socketRef.current) return;
    if (!isTyping.current) {
      isTyping.current = true;
      socketRef.current.emit('typing-start', { threadId: activeThreadId });
    }
    clearTimeout(typingDebounce.current);
    typingDebounce.current = setTimeout(() => {
      isTyping.current = false;
      socketRef.current?.emit('typing-stop', { threadId: activeThreadId });
    }, 2000);
  }, [activeThreadId]);

  // ── Filtered data ─────────────────────────────────────────────────────────
  const filteredThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(t => {
      const name = t.otherParticipant?.name || '';
      return name.toLowerCase().includes(q) || t.lastMessage?.toLowerCase().includes(q);
    });
  }, [threads, query]);

  const filteredContacts = useMemo(() => {
    const q = contactQuery.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(c => c.name.toLowerCase().includes(q) || c.subtitle?.toLowerCase().includes(q));
  }, [contacts, contactQuery]);

  const isTypingInActive = activeThreadId ? typingUsers[activeThreadId] : null;
  const showSidebar = !isMobileView || !activeThreadId;
  const showMain = !isMobileView || activeThreadId;
  const activeParticipantType = String(activeThread?.otherParticipant?.userType || '').toLowerCase();
  const activeParticipantLabel =
    activeParticipantType === 'parent'
      ? 'Parent'
      : activeParticipantType === 'student'
      ? 'Student'
      : 'Participant';

  return (
    <>
      <ParticipantProfileModal
        open={showStudentProfileModal}
        loading={studentProfileLoading}
        error={studentProfileError}
        profile={studentProfile}
        profileType={profileType}
        onClose={() => setShowStudentProfileModal(false)}
      />
      <div className="h-full flex bg-gray-50 overflow-hidden">
      {/* ── Sidebar ── */}
      {showSidebar && (
        <div className="w-full md:w-[320px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full relative">
          {/* Header */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900 text-sm">Messages</h1>
                  <p className="text-xs text-gray-500">Chat with your students</p>
                </div>
              </div>
              <button
                onClick={openContacts}
                className="h-8 w-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors"
                title="Start new conversation"
              >
                <PlusCircle className="h-4 w-4 text-blue-600" />
              </button>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <Search className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search conversations..."
                className="bg-transparent outline-none text-xs flex-1 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Contacts overlay */}
          {showContacts && (
            <div className="absolute left-0 top-0 w-full h-full bg-white z-50 flex flex-col shadow-xl">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 text-sm">New Conversation</h2>
                <button onClick={() => { setShowContacts(false); setContactQuery(''); }}
                  className="h-7 w-7 rounded-full hover:bg-gray-100 flex items-center justify-center">
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              <div className="px-4 py-2 border-b">
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5">
                  <Search className="h-3.5 w-3.5 text-gray-400" />
                  <input
                    autoFocus
                    value={contactQuery}
                    onChange={e => setContactQuery(e.target.value)}
                    placeholder="Search students..."
                    className="bg-transparent outline-none text-xs flex-1 placeholder-gray-400"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredContacts.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500">
                    {contacts.length === 0 ? 'No students found' : 'No results'}
                  </div>
                ) : (
                  filteredContacts.map(c => (
                    <ContactItem key={c._id} contact={c} onClick={() => startConversation(c)} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Thread list */}
          <div className="flex-1 overflow-y-auto">
            {loadingThreads ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {query ? 'No results found' : 'No conversations yet'}
                </p>
                {!query && (
                  <button onClick={openContacts}
                    className="mt-3 text-xs text-blue-600 hover:underline font-medium">
                    Start a conversation
                  </button>
                )}
              </div>
            ) : (
              filteredThreads.map(t => (
                <ConversationItem
                  key={t._id}
                  thread={t}
                  isActive={String(t._id) === activeThreadId}
                  onClick={() => selectThread(String(t._id))}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2.5">
              <UserAvatar src={me?.avatar} name={me?.name || 'Teacher'} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">{me?.name || 'Teacher'}</p>
                <p className="text-xs text-gray-400">Teacher</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Online</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Chat Area ── */}
      {showMain && (
        <div className="flex-1 flex flex-col h-full min-w-0">
          {activeThreadId ? (
            <>
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  {isMobileView && (
                    <button onClick={() => { setActiveThreadId(null); activeThreadIdRef.current = null; }}
                      className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                      <ChevronLeft className="h-5 w-5 text-gray-500" />
                    </button>
                  )}
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {getInitials(activeThread?.otherParticipant?.name || '')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {activeThread?.otherParticipant?.name || activeParticipantLabel}
                    </div>
                    <div className="text-xs text-gray-500">
                      {isTypingInActive ? (
                        <span className="text-blue-500 font-medium">typing...</span>
                      ) : activeParticipantLabel}
                    </div>
                  </div>
                </div>
                <button
                  onClick={openStudentProfile}
                  className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                  title="View student profile"
                >
                  <Info className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4" style={CHAT_BG_STYLE}>
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No messages yet. Say hello!</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const currentTs = msg.createdAt || msg.ts;
                      const prevTs = index > 0 ? (messages[index - 1].createdAt || messages[index - 1].ts) : null;
                      const showDateSeparator = index === 0 || dayKey(currentTs) !== dayKey(prevTs);
                      return (
                        <React.Fragment key={msg._id}>
                          {showDateSeparator && (
                            <div className="flex justify-center my-3">
                              <span className="text-[11px] px-3 py-1 rounded-full bg-gray-200 text-gray-600 font-medium">
                                {formatDaySeparator(currentTs)}
                              </span>
                            </div>
                          )}
                          <ChatMessage
                            msg={msg}
                            isMine={String(msg.senderId) === String(me?.id)}
                            myId={me?.id}
                          />
                        </React.Fragment>
                      );
                    })}
                    {isTypingInActive && (
                      <div className="flex justify-start mb-3">
                        <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                          <div className="flex gap-1 items-center h-4">
                            <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 bg-white px-4 py-3 flex-shrink-0">
                <div className="flex items-end gap-2">
                  <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5">
                    <textarea
                      rows={1}
                      value={draft}
                      onChange={e => handleDraftChange(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="w-full resize-none bg-transparent text-sm focus:outline-none placeholder-gray-400 min-h-[20px] max-h-28"
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!draft.trim()}
                    className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
              <div className="text-center max-w-xs">
                <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Teacher Chat</h2>
                <p className="text-sm text-gray-500 mb-5">
                  Select a conversation or start a new one with your students.
                </p>
                <button
                  onClick={openContacts}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  New Conversation
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
};

export default TeacherChat;
