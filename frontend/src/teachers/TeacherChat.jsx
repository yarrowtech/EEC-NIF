import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import {
  MessageSquare, Send, Search, ChevronLeft,
  Info, PlusCircle, X, Loader2, GraduationCap
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

const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

// ── ChatMessage component ──────────────────────────────────────────────────────
const ChatMessage = ({ msg, isMine }) => (
  <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
    <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-sm
      ${isMine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm'}`}>
      {!isMine && (
        <div className="text-xs font-semibold text-blue-600 mb-1">{msg.senderName}</div>
      )}
      <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
      <div className={`text-xs mt-1 text-right ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
        {formatTime(msg.createdAt || msg.ts)}
      </div>
    </div>
  </div>
);

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
        return [...prev, msg];
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

  return (
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
              <div className="h-7 w-7 rounded-full bg-blue-200 flex items-center justify-center text-xs font-semibold text-blue-800">
                {getInitials(me?.name || 'T')}
              </div>
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
                      {activeThread?.otherParticipant?.name || 'Student'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {isTypingInActive ? (
                        <span className="text-blue-500 font-medium">typing...</span>
                      ) : 'Student'}
                    </div>
                  </div>
                </div>
                <button className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                  <Info className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
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
                    {messages.map(msg => (
                      <ChatMessage
                        key={msg._id}
                        msg={msg}
                        isMine={String(msg.senderId) === String(me?.id)}
                      />
                    ))}
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
  );
};

export default TeacherChat;
