// app/counsellor/actions.ts

'use server';

import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface EmotionalState {
  isDistressed: boolean;
  distressLevel: 'none' | 'mild' | 'moderate' | 'high';
  indicators: string[];
}

interface CounsellorResponse {
  message: string;
  emotionalState: EmotionalState;
  suggestHumanSupport: boolean;
  generatedTasks?: Array<{ title: string; priority: string }>; // New!
}

// Detect emotional distress from user message
async function detectEmotionalDistress(
  userMessage: string,
  conversationHistory: ChatMessage[]
): Promise<EmotionalState> {
  const detectionPrompt = `You are an expert emotional analysis system. Analyze the following message for signs of emotional distress.

Look for IMPLICIT signs like:
- Exhaustion or fatigue ("I'm tired of everything", "I can't anymore")
- Emptiness or numbness ("Nothing matters", "I feel empty")
- Hopelessness ("What's the point", "Nothing will change")
- Loss of meaning ("I don't see why", "It doesn't matter")
- Reduced agency ("I can't control anything", "Everything is overwhelming")
- Withdrawal ("I just want to give up", "I don't care anymore")

DO NOT only flag explicit mentions of self-harm or suicide.

Recent conversation context:
${conversationHistory.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}

Current message:
"${userMessage}"

Respond ONLY in JSON:
{
  "isDistressed": boolean,
  "distressLevel": "none" | "mild" | "moderate" | "high",
  "indicators": ["specific phrase or pattern detected"],
  "reasoning": "brief explanation"
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a JSON-only emotional analysis API. Respond only with valid JSON.',
        },
        {
          role: 'user',
          content: detectionPrompt,
        },
      ],
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return { isDistressed: false, distressLevel: 'none', indicators: [] };
    }

    const result = JSON.parse(content);
    return {
      isDistressed: result.isDistressed || false,
      distressLevel: result.distressLevel || 'none',
      indicators: result.indicators || [],
    };
  } catch (error) {
    console.error('Emotional distress detection error:', error);
    return { isDistressed: false, distressLevel: 'none', indicators: [] };
  }
}

// Generate supportive response for distressed users
async function generateSupportiveResponse(
  userMessage: string,
  emotionalState: EmotionalState,
  conversationHistory: ChatMessage[]
): Promise<string> {
  const supportPrompt = `You are a compassionate AI counselor in emotional support mode.

CRITICAL RULES:
1. Acknowledge emotions FIRST - validate what they're feeling
2. Keep responses SHORT (2-3 sentences max)
3. Use simple, clear language
4. Ask ONE gentle, open-ended question
5. DO NOT give advice or solutions
6. DO NOT minimize their feelings ("at least...", "it could be worse...")
7. DO NOT rush to problem-solving
8. Emphasize presence: "I'm here with you"
9. Reduce cognitive load - one idea per message

Distress level: ${emotionalState.distressLevel}
Indicators detected: ${emotionalState.indicators.join(', ')}

Recent conversation:
${conversationHistory.slice(-2).map(m => `${m.role}: ${m.content}`).join('\n')}

User's message: "${userMessage}"

Generate a warm, validating response that:
- Reflects their emotion
- Shows you're listening
- Asks a gentle grounding question
- Uses simple words
- Is brief and calm

Respond with ONLY the message text, no JSON.`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are a compassionate counselor trained in crisis support. Respond with empathy and brevity.',
        },
        {
          role: 'user',
          content: supportPrompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 150,
    });

    return completion.choices[0]?.message?.content?.trim() || 
      "I hear you. That sounds really hard. I'm here with you. What's feeling most heavy right now?";
  } catch (error) {
    console.error('Supportive response generation error:', error);
    return "I'm here with you. Take your time. How are you feeling right now?";
  }
}

// Detect if AI should suggest actionable tasks
async function shouldGenerateTasks(
  userMessage: string,
  conversationHistory: ChatMessage[]
): Promise<boolean> {
  const keywords = [
    'what should i do',
    'next steps',
    'how do i',
    'where do i start',
    'help me with',
    'can you help',
    'need to do',
    'what tasks',
  ];

  const lowerMessage = userMessage.toLowerCase();
  return keywords.some(keyword => lowerMessage.includes(keyword));
}

// Generate actionable tasks based on conversation
async function generateTasks(
  userMessage: string,
  conversationHistory: ChatMessage[]
): Promise<Array<{ title: string; priority: string }>> {
  const taskPrompt = `Based on this study abroad counseling conversation, generate 2-4 specific, actionable tasks.

Recent conversation:
${conversationHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')}

Latest message: "${userMessage}"

Generate practical tasks related to:
- University research
- Application preparation
- Document gathering
- Test preparation
- Visa planning
- Financial planning

Respond ONLY in JSON:
{
  "tasks": [
    { "title": "Clear, actionable task", "priority": "high|medium|low" }
  ]
}

Keep tasks specific and achievable. 2-4 tasks max.`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a JSON-only task generation API.',
        },
        {
          role: 'user',
          content: taskPrompt,
        },
      ],
      temperature: 0.5,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return [];

    const result = JSON.parse(content);
    return result.tasks || [];
  } catch (error) {
    console.error('Task generation error:', error);
    return [];
  }
}

// Generate normal counselor response
async function generateNormalResponse(
  userMessage: string,
  conversationHistory: ChatMessage[],
  userContext?: any
): Promise<string> {
  const contextInfo = userContext
    ? `Student context: ${JSON.stringify(userContext, null, 2)}`
    : 'No profile context available yet.';

  const normalPrompt = `You are a helpful AI study abroad counselor.

${contextInfo}

Recent conversation:
${conversationHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')}

User's message: "${userMessage}"

Provide helpful, personalized guidance about their study abroad journey. Be warm, professional, and actionable.

Respond with ONLY the message text, no JSON.`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are a knowledgeable study abroad counselor. Be helpful, friendly, and specific.',
        },
        {
          role: 'user',
          content: normalPrompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content?.trim() || 
      "I'm here to help you with your study abroad journey. What would you like to know?";
  } catch (error) {
    console.error('Normal response generation error:', error);
    return "I understand. Let me help you with that. What specific aspect would you like to explore?";
  }
}

// Save tasks to database
async function saveTasks(userId: string, tasks: Array<{ title: string; priority: string }>) {
  try {
    const response = await fetch(`${API_BASE}/api/dashboard/todos/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, todos: tasks }),
    });

    if (!response.ok) {
      throw new Error('Failed to save tasks');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving tasks:', error);
    return null;
  }
}

// Main action: process counselor message
export async function processCounsellorMessage(
  userMessage: string,
  conversationHistory: ChatMessage[],
  userId: string,
  userContext?: any
): Promise<CounsellorResponse> {
  try {
    // Step 1: Detect emotional distress
    const emotionalState = await detectEmotionalDistress(
      userMessage,
      conversationHistory
    );

    // Step 2: Generate appropriate response
    let responseMessage: string;
    let suggestHumanSupport = false;
    let generatedTasks: Array<{ title: string; priority: string }> | undefined;

    if (emotionalState.isDistressed) {
      // SUPPORTIVE MODE
      responseMessage = await generateSupportiveResponse(
        userMessage,
        emotionalState,
        conversationHistory
      );

      if (emotionalState.distressLevel === 'high') {
        suggestHumanSupport = true;
      }

      const recentDistress = conversationHistory
        .slice(-3)
        .filter(m => m.role === 'user')
        .length;
      
      if (recentDistress >= 2 && emotionalState.distressLevel !== 'none') {
        suggestHumanSupport = true;
      }
    } else {
      // NORMAL MODE
      responseMessage = await generateNormalResponse(
        userMessage,
        conversationHistory,
        userContext
      );

      // Check if we should generate tasks
      const shouldGenerate = await shouldGenerateTasks(userMessage, conversationHistory);
      
      if (shouldGenerate) {
        const tasks = await generateTasks(userMessage, conversationHistory);
        
        if (tasks.length > 0) {
          // Save to database
          await saveTasks(userId, tasks);
          generatedTasks = tasks;
          
          // Add task mention to response
          responseMessage += `\n\nI've added ${tasks.length} task${tasks.length > 1 ? 's' : ''} to your to-do list to help you get started! 📋`;
        }
      }
    }

    return {
      message: responseMessage,
      emotionalState,
      suggestHumanSupport,
      generatedTasks,
    };
  } catch (error) {
    console.error('Error in processCounsellorMessage:', error);
    
    return {
      message: "I'm here to help. Could you tell me more about what's on your mind?",
      emotionalState: { isDistressed: false, distressLevel: 'none', indicators: [] },
      suggestHumanSupport: false,
    };
  }
}

// Helper: Check if conversation shows escalating distress
export async function analyzeConversationTrend(
  conversationHistory: ChatMessage[]
): Promise<{
  isEscalating: boolean;
  recommendHumanIntervention: boolean;
}> {
  if (conversationHistory.length < 4) {
    return { isEscalating: false, recommendHumanIntervention: false };
  }

  const trendPrompt = `Analyze this conversation for escalating emotional distress.

Conversation:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

Look for:
- Increasing hopelessness over time
- Repeated expressions of exhaustion
- Declining responsiveness to support
- Mentions of giving up or withdrawal

Respond ONLY in JSON:
{
  "isEscalating": boolean,
  "recommendHumanIntervention": boolean,
  "reasoning": "brief explanation"
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a JSON-only crisis trend analysis API.',
        },
        {
          role: 'user',
          content: trendPrompt,
        },
      ],
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return { isEscalating: false, recommendHumanIntervention: false };
    }

    const result = JSON.parse(content);
    return {
      isEscalating: result.isEscalating || false,
      recommendHumanIntervention: result.recommendHumanIntervention || false,
    };
  } catch (error) {
    console.error('Trend analysis error:', error);
    return { isEscalating: false, recommendHumanIntervention: false };
  }
}