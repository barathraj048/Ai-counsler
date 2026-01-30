// FILE: components/ChatMessage.tsx

'use client';

import { ChatMessage as ChatMessageType, Task } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  message: ChatMessageType;
  tasks?: Task[];
}

export default function ChatMessage({ message, tasks = [] }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  // Detect if this is a supportive/empathetic message
  const isSupportiveMessage = 
    !isUser && 
    (message.content.toLowerCase().includes("i'm here") ||
     message.content.toLowerCase().includes("i hear you") ||
     message.content.toLowerCase().includes("that sounds") ||
     message.content.length < 150); // Short, focused responses

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Message Bubble */}
        <div
          className={`rounded-lg px-4 py-3 ${
            isUser
              ? 'bg-blue-600 text-white'
              : isSupportiveMessage
              ? 'bg-blue-50 text-gray-900 border border-blue-200'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {/* Message Content */}
          <p className={`text-sm whitespace-pre-wrap ${isSupportiveMessage ? 'leading-relaxed' : ''}`}>
            {message.content}
          </p>

          {/* Timestamp */}
          <p
            className={`text-xs mt-2 ${
              isUser ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </p>
        </div>

        {/* AI Avatar & Label for assistant messages */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-1.5 ml-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">AI</span>
            </div>
            <span className="text-xs text-gray-500">
              {isSupportiveMessage ? 'Support Mode' : 'Study Abroad Counselor'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}