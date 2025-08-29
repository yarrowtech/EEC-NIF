import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, Send, Search, Circle, Users, MoreVertical, Paperclip, Mic, Smile, Calendar, BookOpen, UserCheck } from 'lucide-react';

// Simple localStorage-backed chat for demo purposes
const STORAGE_KEY = 'eec_teacher_chat_v2';

const defaultConversations = [
  { id: 'class-10a', name: 'Class 10-A', type: 'class', unread: 2, lastMessage: 'Yes, submit by 6 PM.', lastTime: Date.now() - 3400_000 },
  { id: 'parent-emma', name: "Emma's Parents", type: 'parent', unread: 0, lastMessage: 'Can we reschedule the PTM?', lastTime: Date.now() - 7200_000 },
  { id: 'staff-math', name: 'Math Department', type: 'staff', unread: 1, lastMessage: 'Department meeting at 3 PM.', lastTime: Date.now() - 5400_000 },
  { id: 'class-9b', name: 'Class 9-B', type: 'class', unread: 0, lastMessage: 'Homework submitted', lastTime: Date.now() - 86400_000 },
  { id: 'parent-liam', name: "Liam's Father", type: 'parent', unread: 3, lastMessage: 'About the science project...', lastTime: Date.now() - 10800_000 },
];

const defaultMessages = {
  'class-10a': [
    { id: 'm1', sender: 'student', text: 'Sir, is the assignment due today?', ts: Date.now() - 3600_000 },
    { id: 'm2', sender: 'teacher', text: 'Yes, submit by 6 PM.', ts: Date.now() - 3400_000 },
  ],
  'parent-emma': [
    { id: 'm3', sender: 'parent', text: 'Can we reschedule the PTM?', ts: Date.now() - 7200_000 },
  ],
  'staff-math': [
    { id: 'm4', sender: 'staff', text: 'Department meeting at 3 PM.', ts: Date.now() - 5400_000 },
  ],
  'class-9b': [
    { id: 'm5', sender: 'teacher', text: 'Remember to submit your homework by Friday', ts: Date.now() - 86400_000 },
    { id: 'm6', sender: 'student', text: 'Homework submitted', ts: Date.now() - 83200_000 },
  ],
  'parent-liam': [
    { id: 'm7', sender: 'parent', text: 'Hello, I wanted to discuss Liam\'s science project', ts: Date.now() - 10800_000 },
    { id: 'm8', sender: 'parent', text: 'He seems to be struggling with the research part', ts: Date.now() - 10700_000 },
    { id: 'm9', sender: 'parent', text: 'Could you provide some guidance?', ts: Date.now() - 10600_000 },
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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

const ChatMessage = ({ mine, text, ts, senderType }) => (
  <div className={`flex ${mine ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${mine ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white text-gray-800 rounded-bl-md shadow-sm'}`}>
      {!mine && senderType !== 'teacher' && (
        <div className="text-xs font-medium mb-1 opacity-80">
          {senderType === 'student' ? 'Student' : senderType === 'parent' ? 'Parent' : 'Staff'}
        </div>
      )}
      <div className="whitespace-pre-wrap">{text}</div>
      <div className={`text-xs mt-1 ${mine ? 'text-blue-100' : 'text-gray-500'} text-right`}>
        {new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  </div>
);

const ConversationItem = ({ conversation, isActive, onClick, hasUnread }) => {
  const getIcon = () => {
    switch(conversation.type) {
      case 'class': return <BookOpen className="h-4 w-4 text-blue-600" />;
      case 'parent': return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'staff': return <Users className="h-4 w-4 text-purple-600" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getBadgeColor = () => {
    switch(conversation.type) {
      case 'class': return 'bg-blue-100 text-blue-800';
      case 'parent': return 'bg-green-100 text-green-800';
      case 'staff': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 flex items-center gap-3 transition-colors ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'} border-b`}
    >
      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-800 truncate">{conversation.name}</span>
          {hasUnread && (
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs">
              {conversation.unread}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 truncate">{conversation.lastMessage}</div>
        <div className="flex items-center justify-between mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full ${getBadgeColor()}`}>
            {conversation.type}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(conversation.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </button>
  );
};

const TeacherChat = () => {
  const [{ conversations, messages }, setStore] = useState(loadState);
  const [activeId, setActiveId] = useState(conversations[0]?.id || null);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  const activeMessages = useMemo(() => messages[activeId] || [], [messages, activeId]);
  const activeConversation = useMemo(() => conversations.find(c => c.id === activeId), [conversations, activeId]);

  useEffect(() => {
    saveState({ conversations, messages });
  }, [conversations, messages]);

  useEffect(() => {
    // Clear unread when opening
    if (!activeId) return;
    setStore(prev => ({
      ...prev,
      conversations: prev.conversations.map(c => c.id === activeId ? { ...c, unread: 0 } : c)
    }));
  }, [activeId]);

  // Removed auto-scroll to bottom to keep view at previous position

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(c => c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q));
  }, [conversations, query]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text || !activeId) return;
    const newMsg = { id: crypto.randomUUID(), sender: 'teacher', text, ts: Date.now() };
    
    setStore(prev => ({
      conversations: prev.conversations.map(c => 
        c.id === activeId ? { 
          ...c, 
          lastMessage: text, 
          lastTime: Date.now() 
        } : c
      ),
      messages: { 
        ...prev.messages, 
        [activeId]: [...(prev.messages[activeId] || []), newMsg] 
      }
    }));
    
    setDraft('');
  };

  return (
    <div className="h-full min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col h-screen">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800">Teacher Chat</h1>
                <p className="text-xs text-gray-500">Messages</p>
              </div>
            </div>
            <button className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          <div className="mt-4 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations..."
              className="bg-transparent outline-none text-sm flex-1 placeholder-gray-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 mb-1">Conversations</div>
            {filteredConversations.map(c => (
              <ConversationItem 
                key={c.id} 
                conversation={c} 
                isActive={activeId === c.id} 
                onClick={() => setActiveId(c.id)}
                hasUnread={c.unread > 0}
              />
            ))}
            {filteredConversations.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">
                No conversations found
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center">
                <span className="text-xs font-medium text-blue-800">JD</span>
              </div>
              <span className="text-sm font-medium text-gray-700">John Doe</span>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Teacher</span>
          </div>
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        {activeId ? (
          <>
            <div className="px-6 py-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  {activeConversation.type === 'class' ? (
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  ) : activeConversation.type === 'parent' ? (
                    <UserCheck className="h-5 w-5 text-green-600" />
                  ) : (
                    <Users className="h-5 w-5 text-purple-600" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{activeConversation.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{activeConversation.type}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="h-9 w-9 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </button>
                <button className="h-9 w-9 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                  <MoreVertical className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {activeMessages.length ? (
                <>
                  <div className="text-center text-xs text-gray-500 mb-6">
                    Today
                  </div>
                  {activeMessages.map(m => (
                    <ChatMessage 
                      key={m.id} 
                      mine={m.sender === 'teacher'} 
                      senderType={m.sender}
                      text={m.text} 
                      ts={m.ts} 
                    />
                  ))}
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="font-medium">No messages yet</p>
                    <p className="text-sm mt-1">Send a message to start the conversation</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="border-t bg-white p-4">
              <div className="flex items-end gap-2">
                <div className="flex-1 bg-gray-100 rounded-2xl flex items-end">
                  <div className="flex items-center px-3 py-2">
                    <button className="p-1.5 rounded-lg hover:bg-gray-200">
                      <Paperclip className="h-4 w-4 text-gray-600" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-200 ml-1">
                      <Calendar className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  <textarea
                    rows={1}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 resize-none bg-transparent px-0 py-3 text-sm focus:outline-none min-h-[44px] max-h-32"
                  />
                  <div className="flex items-center px-3 py-2">
                    <button className="p-1.5 rounded-lg hover:bg-gray-200">
                      <Smile className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!draft.trim()}
                  className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6">
            <div className="text-center max-w-md">
              <MessageSquare className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome to Teacher Chat</h2>
              <p className="text-gray-500 mb-6">
                Select a conversation from the sidebar to start messaging with students, parents, or staff members.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Classes</span>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Parents</span>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Staff</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherChat;
