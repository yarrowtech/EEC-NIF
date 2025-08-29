import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, Send, Search, Circle, Users, Paperclip, Mic, MoreVertical, ArrowLeft, CheckCheck } from 'lucide-react';

const STORAGE_KEY = 'eec_parent_chat_v2';

const defaultConversations = [
  { id: 'class-teacher', name: 'Ms. Johnson', type: 'teacher', unread: 1, lastMessage: "PTM is scheduled for Monday 10 AM", lastTime: "10:30 AM" },
  { id: 'office', name: 'School Office', type: 'admin', unread: 0, lastMessage: "Fee due date extended to 15th", lastTime: "Yesterday" },
  { id: 'transport', name: 'Transport Desk', type: 'support', unread: 0, lastMessage: "Route 3 will be 10 mins late today", lastTime: "09:15 AM" },
  { id: 'art-teacher', name: 'Mr. Williams', type: 'teacher', unread: 0, lastMessage: "Art supplies needed by Friday", lastTime: "Monday" },
  { id: 'pta', name: 'PTA Coordinator', type: 'admin', unread: 3, lastMessage: "Volunteers needed for spring fair", lastTime: "Sunday" },
];

const defaultMessages = {
  'class-teacher': [
    { id: 'm1', sender: 'teacher', text: "Hello! PTM is scheduled for Monday 10 AM.", ts: Date.now() - 7200_000, read: true },
    { id: 'm2', sender: 'parent', text: 'Thanks for the update. Will be there.', ts: Date.now() - 7000_000, read: true },
    { id: 'm3', sender: 'teacher', text: 'Great! Please bring your child\'s portfolio.', ts: Date.now() - 6800_000, read: false },
  ],
  office: [
    { id: 'm4', sender: 'admin', text: 'Fee due date extended to 15th.', ts: Date.now() - 5400_000, read: true },
  ],
  transport: [
    { id: 'm5', sender: 'support', text: 'Route 3 will be 10 mins late today.', ts: Date.now() - 3600_000, read: true },
  ],
  'art-teacher': [
    { id: 'm6', sender: 'teacher', text: "Please ensure your child brings art supplies by Friday.", ts: Date.now() - 86400000, read: true },
  ],
  pta: [
    { id: 'm7', sender: 'admin', text: "We need volunteers for the spring fair next month.", ts: Date.now() - 172800000, read: false },
    { id: 'm8', sender: 'admin', text: "Please sign up using the form sent yesterday.", ts: Date.now() - 172700000, read: false },
    { id: 'm9', sender: 'admin', text: "Reminder: PTA meeting this Friday at 4 PM.", ts: Date.now() - 172600000, read: false },
  ],
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { conversations: defaultConversations, messages: defaultMessages };
    const parsed = JSON.parse(raw);
    return {
      conversations: parsed.conversations?.length ? parsed.conversations : defaultConversations,
      messages: parsed.messages || defaultMessages,
    };
  } catch {
    return { conversations: defaultConversations, messages: defaultMessages };
  }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

const ChatMessage = ({ mine, text, ts, read }) => {
  const timeString = new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${mine ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white text-gray-800 rounded-bl-md shadow-sm'}`}>
        <div className="whitespace-pre-wrap text-[15px]">{text}</div>
        <div className={`flex items-center justify-end mt-1 ${mine ? 'text-blue-100' : 'text-gray-500'}`}>
          <span className="text-xs mr-1">{timeString}</span>
          {mine && (
            <CheckCheck className={`h-3 w-3 ${read ? 'text-blue-200' : 'text-blue-200/70'}`} />
          )}
        </div>
      </div>
    </div>
  );
};

const ParentChat = () => {
  const [{ conversations, messages }, setStore] = useState(loadState);
  const [activeId, setActiveId] = useState(conversations[0]?.id || null);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'chat'
  const scrollRef = useRef(null);

  const activeMessages = useMemo(() => messages[activeId] || [], [messages, activeId]);
  const activeConversation = useMemo(() => conversations.find(c => c.id === activeId), [conversations, activeId]);

  useEffect(() => { saveState({ conversations, messages }); }, [conversations, messages]);
  
  useEffect(() => { 
    if (!activeId) return; 
    setStore(prev => ({ 
      ...prev, 
      conversations: prev.conversations.map(c => c.id === activeId ? { ...c, unread: 0 } : c) 
    })); 
  }, [activeId]);

  useEffect(() => {
    if (scrollRef.current && activeMessages.length) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessages]);

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(c => c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q));
  }, [conversations, query]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text || !activeId) return;
    const newMsg = { id: crypto.randomUUID(), sender: 'parent', text, ts: Date.now(), read: false };
    setStore(prev => ({
      conversations: prev.conversations.map(c => 
        c.id === activeId ? { ...c, lastMessage: text, lastTime: "Just now" } : c
      ),
      messages: { 
        ...prev.messages, 
        [activeId]: [...(prev.messages[activeId] || []), newMsg] 
      }
    }));
    setDraft('');
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-amber-100 text-amber-600',
      'bg-pink-100 text-pink-600'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  return (
    <div className="h-full min-h-[70vh] bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <MessageSquare className="h-5 w-5 text-blue-600"/>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">Parent Chat</h1>
              <p className="text-xs text-gray-500">Connect with school staff</p>
            </div>
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="flex h-[60vh]">
        {/* Conversation List - Hidden on mobile when in chat view */}
        <div className={`bg-white border-r border-gray-100 w-full md:w-96 flex flex-col ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
              <Search className="h-4 w-4 text-gray-500" />
              <input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="Search conversations..." 
                className="bg-transparent outline-none text-sm flex-1 placeholder-gray-400" 
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {filteredConversations.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  setActiveId(c.id);
                  setMobileView('chat');
                }}
                className={`w-full text-left p-3 flex items-center gap-3 hover:bg-gray-50 border-b border-gray-100 transition-colors ${activeId === c.id ? 'bg-blue-50' : ''}`}
              >
                <div className={`h-12 w-12 rounded-full flex items-center justify-center font-medium ${getAvatarColor(c.name)}`}>
                  {getInitials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 truncate">{c.name}</span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{c.lastTime}</span>
                  </div>
                  <div className="text-sm text-gray-500 truncate flex items-center gap-1">
                    {c.unread > 0 && (
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-xs text-white">
                        {c.unread}
                      </span>
                    )}
                    <span>{c.lastMessage}</span>
                  </div>
                </div>
              </button>
            ))}
            
            {filteredConversations.length === 0 && (
              <div className="p-6 text-center">
                <div className="text-gray-400 mb-2">No conversations found</div>
                <div className="text-xs text-gray-400">Try a different search term</div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area - Hidden on mobile when in list view */}
        <div className={`flex-1 flex flex-col ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
          {activeConversation ? (
            <>
              <div className="px-4 py-3 border-b border-gray-100 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setMobileView('list')}
                    className="md:hidden p-1 rounded-lg hover:bg-gray-100"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-500" />
                  </button>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-medium ${getAvatarColor(activeConversation.name)}`}>
                    {getInitials(activeConversation.name)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{activeConversation.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{activeConversation.type}</div>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                {activeMessages.length ? (
                  <>
                    <div className="text-center text-xs text-gray-500 mb-4">
                      Today
                    </div>
                    {activeMessages.map(m => (
                      <ChatMessage 
                        key={m.id} 
                        mine={m.sender === 'parent'} 
                        text={m.text} 
                        ts={m.ts} 
                        read={m.read} 
                      />
                    ))}
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <MessageSquare className="h-12 w-12 mb-2 opacity-30" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-1">Say hello to start the conversation</p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 bg-white p-3">
                <div className="flex items-end gap-2">
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Paperclip className="h-5 w-5 text-gray-500" />
                  </button>
                  <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
                    <textarea
                      rows={1}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                      }}
                      placeholder="Type a message..."
                      className="w-full resize-none bg-transparent outline-none text-sm placeholder-gray-500 max-h-32"
                    />
                  </div>
                  {draft.trim() ? (
                    <button
                      onClick={sendMessage}
                      className="p-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  ) : (
                    <button className="p-2.5 rounded-full hover:bg-gray-100 transition-colors">
                      <Mic className="h-5 w-5 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 p-4 text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="font-medium text-gray-500 mb-1">No conversation selected</h3>
              <p className="text-sm text-gray-400">Choose a conversation from the list to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentChat;