import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import {
  MessageSquare, Send, Search, ChevronLeft,
  PlusCircle, X, Loader2, Eye, Mail, BookOpen,
  GraduationCap, Phone, User, Check, CheckCheck
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

/* resolve relative image paths from the server */
const resolveImg = (src) => {
  if (!src) return null;
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('blob:') || src.startsWith('data:')) return src;
  return `${API_URL}${src.startsWith('/') ? '' : '/'}${src}`;
};

/* pick whichever image field the server returns */
const pickImg = (obj) => {
  const raw = obj?.profilePic || obj?.profileImage || obj?.photo || obj?.avatar || obj?.image || null;
  if (!raw) return null;
  // Handle case where field is a Cloudinary response object
  if (typeof raw === 'object') return raw.secure_url || raw.url || raw.path || null;
  return raw;
};

// ── Avatar: shows real image or coloured initials ──────────────────────────────
const SIZES = {
  xs:  'h-7  w-7  text-xs',
  sm:  'h-9  w-9  text-sm',
  md:  'h-11 w-11 text-sm',
  lg:  'h-16 w-16 text-lg',
  xl:  'h-24 w-24 text-2xl',
};

const Avatar = ({ src, name = '', size = 'sm', ring = false, className = '' }) => {
  const [err, setErr] = useState(false);
  const url = resolveImg(src);
  const sz = SIZES[size] || SIZES.sm;
  const ringCls = ring ? 'ring-2 ring-amber-400 ring-offset-1' : '';

  if (url && !err) {
    return (
      <img
        src={url}
        alt={name}
        onError={() => setErr(true)}
        className={`rounded-full object-cover flex-shrink-0 ${sz} ${ringCls} ${className}`}
      />
    );
  }
  return (
    <div className={`rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold flex-shrink-0 ${sz} ${ringCls} ${className}`}>
      {getInitials(name)}
    </div>
  );
};

// ── Teacher Details Modal ──────────────────────────────────────────────────────
const TeacherModal = ({ teacher, onClose }) => {
  if (!teacher) return null;

  const img    = pickImg(teacher);
  const name   = teacher.name   || 'Teacher';
  const email  = teacher.email  || teacher.userId || null;
  const phone  = teacher.phone  || teacher.mobile || null;
  const subj   = Array.isArray(teacher.subjects)
    ? teacher.subjects.join(', ')
    : (teacher.subject || teacher.specialization || null);
  const dept   = teacher.department || null;
  const grade  = teacher.grade || teacher.class || null;
  const bio    = teacher.bio || teacher.about || null;
  const exp    = teacher.experience || null;
  const qual   = teacher.qualification || teacher.degree || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top banner */}
        <div className="h-24 bg-gradient-to-r from-amber-400 to-orange-400 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Avatar overlapping banner */}
        <div className="flex justify-center -mt-12 mb-3">
          <Avatar src={img} name={name} size="xl"
            className="ring-4 ring-white shadow-lg z-50" />
        </div>

        {/* Name + role */}
        <div className="text-center px-6 pb-4">
          <h2 className="text-lg font-bold text-gray-900">{name}</h2>
          <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700">
            <GraduationCap className="h-3.5 w-3.5" /> Teacher
          </span>
        </div>

        {/* Details list */}
        <div className="border-t border-gray-100 divide-y divide-gray-100 mx-4 mb-4 rounded-xl overflow-hidden border">
          {[
            subj  && { icon: BookOpen, label: 'Subject',        value: subj },
            dept  && { icon: GraduationCap, label: 'Department', value: dept },
            grade && { icon: User,     label: 'Class',          value: grade },
            qual  && { icon: GraduationCap, label: 'Qualification', value: qual },
            exp   && { icon: User,     label: 'Experience',     value: exp },
            email && { icon: Mail,     label: 'Email',          value: email },
            phone && { icon: Phone,    label: 'Phone',          value: phone },
          ].filter(Boolean).map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 px-4 py-3 bg-white">
              <div className="p-1.5 rounded-lg bg-amber-50 shrink-0">
                <Icon className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-sm text-gray-800 font-semibold truncate">{value}</p>
              </div>
            </div>
          ))}

          {/* if nothing to show */}
          {!subj && !dept && !email && !phone && !qual && !exp && !grade && (
            <div className="px-4 py-6 text-center text-sm text-gray-400 bg-white">
              No additional details available.
            </div>
          )}
        </div>

        {bio && (
          <div className="mx-4 mb-5 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">About</p>
            <p className="text-sm text-gray-700 leading-relaxed">{bio}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── ChatMessage ────────────────────────────────────────────────────────────────
const isSeenByOther = (msg, myId) =>
  Array.isArray(msg?.seenBy) &&
  msg.seenBy.some((entry) => String(entry?.userId) !== String(myId));

const ChatMessage = ({ msg, isMine, myId }) => {
  const optimistic = Boolean(msg?._optimistic);
  const seen = isMine && isSeenByOther(msg, myId);
  const delivered = isMine && !optimistic;

  return (
  <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
    <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-sm
      ${isMine ? 'bg-amber-500 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm'}`}>
      {!isMine && (
        <div className="text-xs font-semibold text-amber-600 mb-1">{msg.senderName}</div>
      )}
      <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
      <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${isMine ? 'text-amber-100' : 'text-gray-400'}`}>
        <span>{formatTime(msg.createdAt || msg.ts)}</span>
        {isMine && (
          <span className={`inline-flex items-center ${seen ? 'text-sky-300' : 'text-amber-100'}`}>
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

// ── ConversationItem ──────────────────────────────────────────────────────────
const ConversationItem = ({ thread, isActive, onClick }) => {
  const other   = thread.otherParticipant;
  const name    = other?.name || 'Unknown';
  const img     = pickImg(other);
  const unread  = thread.unreadCount || 0;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-gray-100
        ${isActive ? 'bg-amber-50 border-l-4 border-l-amber-500' : 'hover:bg-gray-50'}`}
    >
      <Avatar src={img} name={name} size="md" ring={isActive} />

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
            <span className="ml-2 flex-shrink-0 h-5 min-w-[20px] px-1.5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-semibold">
              {unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// ── ContactItem ───────────────────────────────────────────────────────────────
const ContactItem = ({ contact, onClick }) => {
  const img = pickImg(contact);
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-amber-50 transition-colors border-b border-gray-100"
    >
      <Avatar src={img} name={contact.name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800 truncate">{contact.name}</div>
        <div className="text-xs text-gray-500 truncate">{contact.subtitle || 'Teacher'}</div>
      </div>
      <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />
    </button>
  );
};

// ── Main StudentChat ───────────────────────────────────────────────────────────
const StudentChat = () => {
  const [me, setMe]                         = useState(null);
  const [threads, setThreads]               = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages]             = useState([]);
  const [draft, setDraft]                   = useState('');
  const [query, setQuery]                   = useState('');
  const [contacts, setContacts]             = useState([]);
  const [showContacts, setShowContacts]     = useState(false);
  const [contactQuery, setContactQuery]     = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingUsers, setTypingUsers]       = useState({});
  const [isMobileView, setIsMobileView]     = useState(false);
  const [teacherModal, setTeacherModal]     = useState(null); // teacher object or null

  const socketRef          = useRef(null);
  const activeThreadIdRef  = useRef(null);
  const messagesEndRef     = useRef(null);
  const typingTimers       = useRef({});
  const typingDebounce     = useRef(null);
  const isTyping           = useRef(false);
  const meRef              = useRef(null);

  const activeThread = useMemo(
    () => threads.find(t => String(t._id) === activeThreadId),
    [threads, activeThreadId]
  );

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
      } catch { /* ignore */ } finally {
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

    socket.on('new-message', (msg) => {
      const threadId = String(msg.threadId);
      const isActiveThread = String(activeThreadIdRef.current) === threadId;
      const isIncomingForMe = String(msg.senderId) !== String(meRef.current?.id);
      setMessages(prev => {
        if (activeThreadIdRef.current !== threadId) return prev;
        if (String(msg.senderId) === String(meRef.current?.id)) {
          const optIdx = prev.findLastIndex(m => m._optimistic);
          if (optIdx !== -1) {
            const next = [...prev];
            next[optIdx] = msg;
            return next;
          }
        }
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
          ? { ...t, lastMessage: msg.text, lastMessageAt: msg.createdAt, unreadCount: activeThreadIdRef.current === threadId ? 0 : (t.unreadCount || 0) + 1 }
          : t
      ));

      // Real-time seen: if this thread is open and message is incoming, mark seen immediately.
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

  useEffect(() => {
    const check = () => setIsMobileView(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Thread actions ─────────────────────────────────────────────────────────
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
    } catch { setMessages([]); } finally { setLoadingMessages(false); }
  }, []);

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
        return exists ? prev : [thread, ...prev];
      });
      selectThread(String(thread._id));
    } catch { /* ignore */ }
  }, [selectThread]);

  const openContacts = useCallback(async () => {
    if (contacts.length === 0) {
      try {
        const data = await apiFetch('/api/chat/contacts');
        setContacts(data);
      } catch { /* ignore */ }
    }
    setShowContacts(true);
  }, [contacts]);

  const sendMessage = useCallback(() => {
    const text = draft.trim();
    if (!text || !activeThreadId) return;
    setDraft('');

    const optimisticId = `opt-${Date.now()}`;
    const optimistic = {
      _id: optimisticId, threadId: activeThreadId,
      senderId: me?.id, senderType: 'student',
      senderName: me?.name || 'You', text,
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

  // ── Derived ────────────────────────────────────────────────────────────────
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
  const showMain    = !isMobileView || activeThreadId;

  const activeTeacher = activeThread?.otherParticipant || null;

  return (
    <>
      {/* Teacher Details Modal */}
      {teacherModal && (
        <TeacherModal teacher={teacherModal} onClose={() => setTeacherModal(null)} />
      )}

      <div className="h-full flex bg-gray-50 overflow-hidden">

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        {showSidebar && (
          <div className="w-full md:w-[320px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full relative">

            {/* Header */}
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h1 className="font-bold text-gray-900 text-sm">Messages</h1>
                    <p className="text-xs text-gray-500">Chat with your teachers</p>
                  </div>
                </div>
                <button
                  onClick={openContacts}
                  className="h-8 w-8 rounded-lg bg-amber-50 hover:bg-amber-100 flex items-center justify-center transition-colors"
                  title="Start new conversation"
                >
                  <PlusCircle className="h-4 w-4 text-amber-600" />
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
              <div className="absolute inset-0 w-full h-full bg-white z-50 flex flex-col shadow-xl">
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
                      placeholder="Search teachers..."
                      className="bg-transparent outline-none text-xs flex-1 placeholder-gray-400"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredContacts.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500">
                      {contacts.length === 0 ? 'No teachers found' : 'No results'}
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
                  <Loader2 className="h-5 w-5 text-amber-400 animate-spin" />
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {query ? 'No results found' : 'No conversations yet'}
                  </p>
                  {!query && (
                    <button onClick={openContacts}
                      className="mt-3 text-xs text-amber-600 hover:underline font-medium">
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

            {/* Footer — student info */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2.5">
                <Avatar src={pickImg(me)} name={me?.name || 'S'} size="xs" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate">{me?.name || 'Student'}</p>
                  <p className="text-xs text-gray-400">Student</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Online</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Main Chat Area ───────────────────────────────────────────────── */}
        {showMain && (
          <div className="flex-1 flex flex-col h-full min-w-0">
            {activeThreadId ? (
              <>
                {/* Chat header */}
                <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    {isMobileView && (
                      <button
                        onClick={() => { setActiveThreadId(null); activeThreadIdRef.current = null; }}
                        className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-500" />
                      </button>
                    )}
                    {/* Clickable avatar → opens modal */}
                    <button
                      onClick={() => setTeacherModal(activeTeacher)}
                      className="flex-shrink-0 focus:outline-none"
                      title="View teacher profile"
                    >
                      <Avatar
                        src={pickImg(activeTeacher)}
                        name={activeTeacher?.name || ''}
                        size="sm"
                        ring
                        className="hover:opacity-90 transition-opacity cursor-pointer"
                      />
                    </button>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {activeTeacher?.name || 'Teacher'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isTypingInActive ? (
                          <span className="text-amber-500 font-medium">typing...</span>
                        ) : (
                          activeTeacher?.subject || activeTeacher?.subjects?.[0] || 'Teacher'
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Eye button → teacher details modal */}
                  <button
                    onClick={() => setTeacherModal(activeTeacher)}
                    className="h-8 w-8 rounded-lg hover:bg-amber-50 flex items-center justify-center transition-colors group"
                    title="View teacher details"
                  >
                    <Eye className="h-4 w-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-5 w-5 text-amber-400 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      {/* Show teacher avatar in empty state */}
                      <Avatar src={pickImg(activeTeacher)} name={activeTeacher?.name || ''} size="lg" />
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">{activeTeacher?.name || 'Teacher'}</p>
                        <p className="text-xs text-gray-400 mt-1">No messages yet — say hello!</p>
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
                          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                        }}
                        placeholder="Type a message..."
                        className="w-full resize-none bg-transparent text-sm focus:outline-none placeholder-gray-400 min-h-[20px] max-h-28"
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!draft.trim()}
                      className="h-10 w-10 rounded-full bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
                <div className="text-center max-w-xs">
                  <div className="h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-amber-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Student Chat</h2>
                  <p className="text-sm text-gray-500 mb-5">
                    Select a conversation or start a new one with your teachers.
                  </p>
                  <button
                    onClick={openContacts}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
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

export default StudentChat;
