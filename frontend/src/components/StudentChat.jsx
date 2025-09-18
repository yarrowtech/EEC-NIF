import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Users, 
  Paperclip, 
  Mic, 
  Smile, 
  MoreVertical,
  ChevronLeft,
  Video,
  Phone,
  Info
} from 'lucide-react';

const STORAGE_KEY = 'eec_student_chat_v2';

const defaultConversations = [
  { 
    id: 'class-group', 
    name: 'Class 10-A Group', 
    type: 'class', 
    unread: 1,
    lastMessage: 'Anyone finished Q5 of the assignment?',
    lastTime: Date.now() - 3400_000,
    members: 32,
    avatarColor: 'bg-amber-500'
  },
  { 
    id: 'math-teacher', 
    name: 'Ms. Johnson - Math', 
    type: 'teacher', 
    unread: 0,
    lastMessage: 'Reminder: submit by 6 PM today.',
    lastTime: Date.now() - 7200_000,
    members: 2,
    avatarColor: 'bg-blue-500',
    isOnline: true
  },
  { 
    id: 'office', 
    name: 'School Office', 
    type: 'admin', 
    unread: 0,
    lastMessage: 'PTM next Monday at 10 AM.',
    lastTime: Date.now() - 5400_000,
    members: 4,
    avatarColor: 'bg-purple-500'
  },
  { 
    id: 'study-group', 
    name: 'Science Study Group', 
    type: 'group', 
    unread: 3,
    lastMessage: "Let's meet at the library tomorrow",
    lastTime: Date.now() - 1800_000,
    members: 5,
    avatarColor: 'bg-green-500'
  },
];

const defaultMessages = {
  'class-group': [
    { id: 'm1', sender: 'student-other', senderName: 'Alex Kim', text: 'Anyone finished Q5 of the assignment?', ts: Date.now() - 3600_000 },
    { id: 'm2', sender: 'student-other', senderName: 'Maria Lopez', text: "Still working on it. It's tricky!", ts: Date.now() - 3400_000 },
    { id: 'm3', sender: 'student-other', senderName: 'James Wilson', text: "I think I got it. The answer should be 42.", ts: Date.now() - 3200_000 },
    { id: 'm4', sender: 'student', senderName: 'You', text: "Thanks James! That helps a lot.", ts: Date.now() - 3000_000 },
  ],
  'math-teacher': [
    { id: 'm5', sender: 'teacher', senderName: 'Ms. Johnson', text: 'Reminder: Assignment due by 6 PM today.', ts: Date.now() - 7200_000 },
    { id: 'm6', sender: 'student', senderName: 'You', text: "Understood, I'll submit it soon.", ts: Date.now() - 7000_000 },
  ],
  'office': [
    { id: 'm7', sender: 'admin', senderName: 'School Office', text: 'Parent-Teacher Meeting next Monday at 10 AM.', ts: Date.now() - 5400_000 },
    { id: 'm8', sender: 'student', senderName: 'You', text: "Noted, I'll inform my parents.", ts: Date.now() - 5200_000 },
  ],
  'study-group': [
    { id: 'm9', sender: 'student-other', senderName: 'Tom Chen', text: "Does anyone understand Newton's Third Law?", ts: Date.now() - 10800_000 },
    { id: 'm10', sender: 'student-other', senderName: 'Lisa Park', text: "I can explain it during our study session.", ts: Date.now() - 10600_000 },
    { id: 'm11', sender: 'student', senderName: 'You', text: "When are we meeting next?", ts: Date.now() - 10400_000 },
    { id: 'm12', sender: 'student-other', senderName: 'Tom Chen', text: "Let's meet at the library tomorrow after school", ts: Date.now() - 10200_000 },
    { id: 'm13', sender: 'student-other', senderName: 'Maria Lopez', text: "Works for me! I'll bring snacks.", ts: Date.now() - 10000_000 },
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

const ChatMessage = ({ message, isMine, showSender }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
        {!isMine && showSender && (
          <span className="text-xs text-gray-500 mb-1 ml-1">{message.senderName}</span>
        )}
        <div className={`rounded-2xl px-4 py-2 text-sm ${isMine ? 'bg-amber-600 text-white rounded-br-md' : 'bg-white text-gray-800 rounded-bl-md shadow-sm'}`}>
          {message.type === 'file' ? (
            <div className="flex items-center gap-2">
              <Paperclip className={`h-4 w-4 ${isMine ? 'text-amber-100' : 'text-gray-600'}`} />
              <span className="underline break-all">{message.fileName || 'Attachment'}</span>
            </div>
          ) : message.type === 'voice' ? (
            <div className="flex items-center gap-2">
              <Mic className={`h-4 w-4 ${isMine ? 'text-amber-100' : 'text-gray-600'}`} />
              <span>Voice message</span>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{message.text}</div>
          )}
          <div className={`text-xs mt-1 ${isMine ? 'text-amber-100' : 'text-gray-500'} text-right`}>
            {formatTime(message.ts)}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConversationItem = ({ conversation, isActive, onClick }) => {
  const formatTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else {
      return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 flex items-center gap-3 transition-colors ${isActive ? 'bg-amber-50' : 'hover:bg-gray-50'} border-b`}
    >
      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white ${conversation.avatarColor}`}>
        {conversation.type === 'class' || conversation.type === 'group' ? (
          <Users className="h-5 w-5" />
        ) : (
          <MessageSquare className="h-5 w-5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-800 truncate">{conversation.name}</span>
          {conversation.unread > 0 && (
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-500 text-white text-xs">
              {conversation.unread}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 truncate">{conversation.lastMessage}</div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400">{formatTime(conversation.lastTime)}</span>
          {conversation.type === 'teacher' && conversation.isOnline && (
            <span className="text-xs text-green-500 flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
              Online
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

const StudentChat = () => {
  const [{ conversations, messages }, setStore] = useState(loadState);
  const [activeId, setActiveId] = useState(conversations[0]?.id || null);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [messageType, setMessageType] = useState('text'); // 'text' | 'voice' | 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const [recording, setRecording] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

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

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [activeMessages]);

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(c => c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q));
  }, [conversations, query]);

  const sendMessage = () => {
    if (!activeId) return;
    let newMsg;
    if (messageType === 'text') {
      const text = draft.trim();
      if (!text) return;
      newMsg = { id: crypto.randomUUID(), sender: 'student', senderName: 'You', text, ts: Date.now(), type: 'text' };
    } else if (messageType === 'file') {
      if (!selectedFile) return;
      newMsg = { id: crypto.randomUUID(), sender: 'student', senderName: 'You', ts: Date.now(), type: 'file', fileName: selectedFile.name };
    } else if (messageType === 'voice') {
      newMsg = { id: crypto.randomUUID(), sender: 'student', senderName: 'You', ts: Date.now(), type: 'voice' };
    }
    const lastPreview = newMsg.type === 'text' ? (newMsg.text || '') : (newMsg.type === 'file' ? `[File] ${newMsg.fileName}` : '[Voice message]');

    setStore(prev => ({
      conversations: prev.conversations.map(c => 
        c.id === activeId ? { 
          ...c, 
          lastMessage: lastPreview,
          lastTime: Date.now() 
        } : c
      ),
      messages: { 
        ...prev.messages, 
        [activeId]: [...(prev.messages[activeId] || []), newMsg] 
      }
    }));
    setDraft('');
    setSelectedFile(null);
    setRecording(false);
  };

  // Check if we should show mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="h-full min-h-0 bg-gray-50 flex w-full">
      {/* Sidebar - Hidden on mobile when conversation is active */}
      <div className={`w-full md:w-80 bg-white border-r flex flex-col h-full min-h-0 ${isMobileView && activeId ? 'hidden' : 'flex'}`}>
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">Student Chat</h1>
              <p className="text-xs text-gray-500">Connect with classmates and teachers</p>
            </div>
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
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 py-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 mb-1">Conversations</div>
            {filteredConversations.map(c => (
              <ConversationItem 
                key={c.id} 
                conversation={c} 
                isActive={activeId === c.id} 
                onClick={() => {
                  setActiveId(c.id);
                  if (isMobileView) {
                    // In mobile view, we'll hide the sidebar when a conversation is selected
                  }
                }}
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
              <div className="h-8 w-8 rounded-full bg-amber-200 flex items-center justify-center">
                <span className="text-xs font-medium text-amber-800">You</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Student</span>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Online</span>
          </div>
        </div>
      </div>
      
      {/* Main Chat Area - Hidden on mobile when no conversation is selected */}
      <div className={`flex-1 flex flex-col h-full min-h-0 ${isMobileView && !activeId ? 'hidden' : 'flex'}`}>
        {activeId ? (
          <>
            <div className="px-6 py-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isMobileView && (
                  <button 
                    onClick={() => setActiveId(null)}
                    className="md:hidden h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                )}
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  {activeConversation.type === 'class' || activeConversation.type === 'group' ? (
                    <Users className="h-5 w-5 text-amber-600" />
                  ) : (
                    <MessageSquare className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{activeConversation.name}</div>
                  <div className="text-xs text-gray-500 capitalize">
                    {activeConversation.type === 'teacher' && activeConversation.isOnline ? (
                      <span className="text-green-500 flex items-center">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                        Online
                      </span>
                    ) : (
                      `${activeConversation.members} members`
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeConversation.type === 'teacher' && (
                  <>
                    <button className="h-9 w-9 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-gray-600" />
                    </button>
                    <button className="h-9 w-9 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                      <Video className="h-5 w-5 text-gray-600" />
                    </button>
                  </>
                )}
                <button className="h-9 w-9 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                  <Info className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col-reverse custom-scrollbar"
              style={{ display: 'flex', flexDirection: 'column-reverse' }}
            >
              {activeMessages.length ? (
                <div>
                  {activeMessages.map((message, index) => {
                    const isMine = message.sender === 'student';
                    const showSender = !isMine && (
                      index === 0 || 
                      activeMessages[index - 1].sender !== message.sender ||
                      message.ts - activeMessages[index - 1].ts > 600000 // 10 minutes
                    );
                    
                    return (
                      <ChatMessage 
                        key={message.id} 
                        message={message} 
                        isMine={isMine}
                        showSender={showSender}
                      />
                    );
                  })}
                </div>
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
                <div className="flex-1 bg-gray-100 rounded-2xl">
                  <div className="flex items-center justify-between px-3 pt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">Type:</span>
                      <div className="inline-flex rounded-md overflow-hidden border border-gray-300">
                        {['text','voice','file'].map(t => (
                          <button
                            key={t}
                            onClick={() => setMessageType(t)}
                            className={`px-2 py-1 ${messageType===t ? 'bg-white text-gray-800' : 'text-gray-600 hover:bg-white/60'}`}
                          >
                            {t.charAt(0).toUpperCase()+t.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {messageType === 'voice' && (
                        <button
                          onClick={() => setRecording(r=>!r)}
                          className={`px-2 py-1 rounded-md ${recording ? 'bg-red-500 text-white' : 'bg-white text-gray-700'}`}
                        >
                          {recording ? 'Stop Recording' : 'Record'}
                        </button>
                      )}
                      {messageType === 'file' && (
                        <label className="px-2 py-1 rounded-md bg-white text-gray-700 cursor-pointer">
                          <input type="file" className="hidden" onChange={(e)=>setSelectedFile(e.target.files?.[0]||null)} />
                          Choose File
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="flex items-end">
                    {messageType === 'text' && (
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
                        className="flex-1 resize-none bg-transparent px-3 py-3 text-sm focus:outline-none min-h-[44px] max-h-32"
                      />
                    )}
                    {messageType === 'file' && (
                      <div className="flex-1 px-3 py-3 text-sm text-gray-700">
                        {selectedFile ? `Selected: ${selectedFile.name}` : 'No file selected'}
                      </div>
                    )}
                    {messageType === 'voice' && (
                      <div className="flex-1 px-3 py-3 text-sm text-gray-700">
                        {recording ? 'Recording...' : 'Press Record to capture voice message'}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={(messageType==='text' && !draft.trim()) || (messageType==='file' && !selectedFile)}
                  className="h-12 w-12 rounded-full bg-amber-600 text-white flex items-center justify-center hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome to Student Chat</h2>
              <p className="text-gray-500 mb-6">
                Select a conversation from the sidebar to start messaging with your classmates, teachers, or school administration.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentChat;
