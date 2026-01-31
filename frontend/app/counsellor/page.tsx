// app/counsellor/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ChatMessage from '@/components/ChatMessage';
import ActionsPanel from '@/components/ActionsPanel';
import { dummyTasks } from '@/lib/dummy-data';
import { ChatMessage as ChatMessageType } from '@/types';
import { processCounsellorMessage, analyzeConversationTrend } from './actions';
import { UniversityProvider, useUniversities } from '@/components/contexts/UniversityContext';

function CounsellorContent() {
  const { discoveredUniversities, shortlistedUniversities, isLoading: universitiesLoading } = useUniversities();
  
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI study abroad counselor. I'm here to help you navigate your journey. How are you feeling about your plans today?",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSupportBanner, setShowSupportBanner] = useState(false);
  const [isInSupportiveMode, setIsInSupportiveMode] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkTrend = async () => {
      if (messages.length >= 6) {
        const trend = await analyzeConversationTrend(messages);
        if (trend.recommendHumanIntervention && !showSupportBanner) {
          setShowSupportBanner(true);
        }
      }
    };
    checkTrend();
  }, [messages, showSupportBanner]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessageText = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    const newUserMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await processCounsellorMessage(
        userMessageText,
        [...messages, newUserMessage],
        undefined
      );

      setIsInSupportiveMode(response.emotionalState.isDistressed);

      if (response.suggestHumanSupport) {
        setShowSupportBanner(true);
      }

      const aiResponse: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const fallbackResponse: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm here with you. Could you tell me a bit more about what's on your mind?",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert universities to ActionsPanel format
  const userUniversities = shortlistedUniversities.map(uni => ({
    id: uni.id,
    universityId: uni.id,
    university_id: uni.id,
    university: {
      id: uni.id,
      name: uni.name,
      country: uni.country,
      ranking: uni.ranking
    },
    status: 'shortlisted' as const,
    applicationDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
  }));

  const allUniversities = discoveredUniversities.map(uni => ({
    id: uni.id,
    name: uni.name,
    country: uni.country,
    ranking: uni.ranking,
    programs: uni.programs || [],
    tuitionFee: uni.tuitionFee
  }));

  console.log('🔍 CounsellorContent Debug:', {
    discoveredCount: discoveredUniversities.length,
    shortlistedCount: shortlistedUniversities.length,
    userUniversitiesCount: userUniversities.length,
    allUniversitiesCount: allUniversities.length,
    sampleUserUniversity: userUniversities[0],
    sampleAllUniversity: allUniversities[0]
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Counsellor
          </h1>
          <p className="text-gray-900">
            Get personalized guidance for your study abroad journey
          </p>
        </div>

        {showSupportBanner && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-900 mb-1">
                  You're Not Alone
                </h3>
                <p className="text-sm text-amber-800 mb-3">
                  It seems like you might be going through a difficult time. While I'm here to listen, speaking with a human counselor or trusted person could be really helpful.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a href="tel:988" className="inline-flex items-center px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded hover:bg-amber-700">
                    📞 Crisis Helpline: 988
                  </a>
                  <a href="https://988lifeline.org/chat/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1.5 bg-white text-amber-900 text-sm font-medium rounded border border-amber-300 hover:bg-amber-50">
                    💬 Online Chat Support
                  </a>
                  <button onClick={() => setShowSupportBanner(false)} className="inline-flex items-center px-3 py-1.5 text-amber-700 text-sm font-medium hover:text-amber-900">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isInSupportiveMode && !showSupportBanner && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>I'm in listening mode. Take your time.</span>
            </div>
          </div>
        )}

        {/* Real-time data sync indicator */}
        {!universitiesLoading && (discoveredUniversities.length > 0 || shortlistedUniversities.length > 0) && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2 text-green-800">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>
                Synced: {discoveredUniversities.length} discovered, {shortlistedUniversities.length} shortlisted
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border text-gray-900 border-gray-200 flex flex-col" style={{ height: '600px' }}>
              <div className="flex-1 overflow-y-auto p-6">
                {messages.map(message => (
                  <ChatMessage 
                    key={message.id}
                    message={message}
                    tasks={dummyTasks}
                  />
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-4 text-gray-900">
                    <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span className="text-xs text-gray-900">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-200 p-4 text-gray-900">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={
                      isInSupportiveMode 
                        ? "I'm here. Share what feels right..." 
                        : "Ask me anything about your study abroad journey..."
                    }
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Sending...' : 'Send'}
                  </button>
                </form>
                <p className="text-xs text-gray-900 mt-2 text-center">
                  {isInSupportiveMode 
                    ? "Take your time. There's no rush."
                    : "Your counselor is here to help 24/7"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions Panel - Now uses shared context data */}
          <div>
            <ActionsPanel
              userUniversities={userUniversities}
              universities={allUniversities}
              tasks={dummyTasks}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CounsellorPage() {
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Get userId from localStorage/sessionStorage
    const id = localStorage.getItem('userId') || 
               sessionStorage.getItem('userId') || 
               'user_123';
    setUserId(id);
    console.log('🆔 CounsellorPage userId:', id);
  }, []);

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900">Loading...</p>
        </div>
      </div>
    );
  }

  // ⚠️ CRITICAL FIX: Use the actual userId, not hardcoded value
  return (
    <UniversityProvider userId={userId}>
      <CounsellorContent />
    </UniversityProvider>
  );
}