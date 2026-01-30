// FILE: app/counsellor/page.tsx

'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import ChatMessage from '@/components/ChatMessage';
import ActionsPanel from '@/components/ActionsPanel';
import { dummyChatMessages, dummyUserUniversities, dummyUniversities, dummyTasks } from '@/lib/dummy-data';
import { ChatMessage as ChatMessageType } from '@/types';

export default function CounsellorPage() {
  const [messages, setMessages] = useState<ChatMessageType[]>(dummyChatMessages);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newUserMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    const aiResponse: ChatMessageType = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'I understand. Let me help you with that. Based on your profile and preferences, I can provide more specific recommendations or guidance. What aspect would you like to explore further?',
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, newUserMessage, aiResponse]);
    setInputMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Counsellor
          </h1>
          <p className="text-gray-600">
            Get personalized guidance for your study abroad journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 flex flex-col" style={{ height: '600px' }}>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6">
                {messages.map(message => (
                  <ChatMessage tasks={dummyTasks} />
                ))}
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me anything about your study abroad journey..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Actions Panel */}
          <div>
            <ActionsPanel
              userUniversities={dummyUserUniversities}
              universities={dummyUniversities}
              tasks={dummyTasks}
            />
          </div>
        </div>
      </main>
    </div>
  );
}