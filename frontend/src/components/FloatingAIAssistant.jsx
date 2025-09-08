import React, { useState } from 'react';
import { Bot, MessageCircle, Sparkles, X, Minimize2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import AITextbookChat from './AITextbookChat';

const FloatingAIAssistant = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const location = useLocation();

  // Show AI assistant only on Student Portal (dashboard)
  const shouldShowAssistant = () => {
    const currentPath = location.pathname;
    // Only allow on Student Dashboard routes
    return currentPath.startsWith('/dashboard');
  };

  if (!shouldShowAssistant()) {
    return null;
  }

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    setIsMinimized(false);
    if (showIntro) {
      setShowIntro(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Floating Button */}
      {!isChatOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          {/* Intro Popup */}
          {showIntro && (
            <div className="absolute bottom-16 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-64 mb-2 animate-pulse">
              <button
                onClick={() => setShowIntro(false)}
                className="absolute top-2 right-2 h-6 w-6 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="h-3 w-3 text-gray-400" />
              </button>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-800 mb-1">
                    Hi! I'm your AI Study Assistant
                  </h4>
                  <p className="text-xs text-gray-600 mb-2">
                    I can help you with:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Solve math & science problems</li>
                    <li>• Explain difficult concepts</li>
                    <li>• Analyze uploaded images</li>
                    <li>• Generate practice questions</li>
                  </ul>
                  <button
                    onClick={toggleChat}
                    className="mt-3 w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs py-2 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200"
                  >
                    Start Learning
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Floating Button */}
          <button
            onClick={toggleChat}
            className="h-16 w-16 bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group relative"
          >
            {/* Ripple Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 animate-ping opacity-20"></div>
            
            {/* Icon */}
            <Bot className="h-8 w-8 relative z-10" />
            
            {/* Sparkle Effects */}
            <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
            
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              AI Study Assistant
            </div>
          </button>
        </div>
      )}

      {/* AI Chat Component */}
      <AITextbookChat
        isOpen={isChatOpen}
        onToggle={toggleChat}
        isMinimized={isMinimized}
        onMinimize={toggleMinimize}
      />

      {/* Backdrop for mobile */}
      {isChatOpen && !isMinimized && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsChatOpen(false)}
        />
      )}
    </>
  );
};

export default FloatingAIAssistant; 