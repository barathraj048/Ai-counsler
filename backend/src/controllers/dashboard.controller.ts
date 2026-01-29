// backend/src/controllers/dashboard.controller.ts

import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

/**
 * Get or generate dashboard
 * GET /api/dashboard?userId=xxx
 */
export async function getDashboard(req: Request, res: Response) {
  try {
    const { userId } = req.query as { userId?: string };

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const existing = await prisma.dashboardSnapshot.findUnique({
      where: { userId },
    });

    if (existing) {
      const todos = await prisma.dashboardTodo.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      const dashboardData = existing.dashboardJson as any;
      return res.json({ 
        success: true, 
        data: {
          ...dashboardData,
          todos: todos.length > 0 ? todos : dashboardData.todos || []
        }
      });
    }

    const answers = await prisma.onboardingAnswer.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    if (answers.length === 0) {
      return res.status(404).json({ error: 'No onboarding data found' });
    }

    const profile: Record<string, any> = {};
    for (const a of answers) {
      try {
        profile[a.questionId] = JSON.parse(a.answer);
      } catch {
        profile[a.questionId] = a.answer;
      }
    }

    const prompt = `
You are an AI study abroad advisor.

Based on the onboarding profile, generate a DASHBOARD STATE.

Profile:
${JSON.stringify(profile, null, 2)}

Respond ONLY in valid JSON.

Schema:
{
  "profileStrength": number,
  "currentStage": "profile-setup" | "university-discovery" | "test-preparation" | "application" | "visa-process" | "pre-departure",
  "allStages": [
    {
      "id": "profile-setup" | "university-discovery" | "test-preparation" | "application" | "visa-process" | "pre-departure",
      "name": string,
      "description": string,
      "status": "completed" | "current" | "upcoming",
      "order": number
    }
  ],
  "summary": {
    "targetDegree": string,
    "field": string,
    "intake": string,
    "budget": string,
    "preferredCountries": string[]
  },
  "todos": [
    {
      "id": string,
      "title": string,
      "priority": "high" | "medium" | "low",
      "completed": false
    }
  ]
}

Rules:
- profileStrength between 20–80
- Generate all 6 stages with appropriate status based on current progress
- Mark stages as "completed", "current", or "upcoming"
- currentStage should match the stage marked as "current"
- Generate 3–5 todos
- Todos must be actionable and specific to current stage
`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'JSON only. No markdown.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty LLM response');

    const dashboard = JSON.parse(content);

    await prisma.dashboardSnapshot.create({
      data: {
        userId,
        dashboardJson: dashboard,
        profileStrength: dashboard.profileStrength,
        currentStage: dashboard.currentStage,
      },
    });

    if (dashboard.todos && dashboard.todos.length > 0) {
      await prisma.dashboardTodo.createMany({
        data: dashboard.todos.map((todo: any) => ({
          id: todo.id,
          userId,
          title: todo.title,
          priority: todo.priority,
          completed: todo.completed || false,
        })),
        skipDuplicates: true,
      });
    }

    return res.json({ success: true, data: dashboard });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Dashboard generation failed' });
  }
}

/**
 * Discover universities based on user profile
 * POST /api/dashboard/discover-universities
 */
export async function discoverUniversities(req: Request, res: Response) {
  try {
    const { userId, userProfile } = req.body;

    if (!userId || !userProfile) {
      return res.status(400).json({ error: 'userId and userProfile are required' });
    }

    const prompt = `
You are a university discovery system. Based on the user's profile, discover a broad pool of universities.

User Profile:
${JSON.stringify(userProfile, null, 2)}

Generate 15-20 universities across different countries and tiers (top-tier, mid-tier, safety schools).

For each university, provide:
- id: unique identifier
- name: full university name
- country: country location
- ranking: global ranking (number)
- tuitionFee: annual tuition in USD format
- programs: array of relevant program names
- matchReason: why this university matches the user's profile (1-2 sentences)
- programRelevance: how programs align with user's field (1-2 sentences)

Include universities from:
- USA (Ivy League, state universities, private colleges)
- UK (Russell Group and others)
- Canada (top research universities)
- Australia (Group of Eight)
- Germany (technical universities)
- Other European countries

Respond ONLY in valid JSON:
{
  "universities": [
    {
      "id": string,
      "name": string,
      "country": string,
      "ranking": number,
      "tuitionFee": string,
      "programs": string[],
      "matchReason": string,
      "programRelevance": string
    }
  ]
}
`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'JSON only. No markdown.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty LLM response');

    const result = JSON.parse(content);

    return res.json({ success: true, universities: result.universities });
  } catch (error) {
    console.error('Error discovering universities:', error);
    return res.status(500).json({ error: 'Failed to discover universities' });
  }
}

/**
 * Shortlist universities based on user priorities
 * POST /api/dashboard/shortlist-universities
 */
export async function shortlistUniversities(req: Request, res: Response) {
  try {
    const { userId, universities, priorities, userProfile } = req.body;

    if (!userId || !universities || !priorities || !userProfile) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const prompt = `
You are a university shortlisting system. Apply strict filtering to reduce options to 3-6 universities.

User Profile:
${JSON.stringify(userProfile, null, 2)}

User Priorities (0-100):
- Cost sensitivity: ${priorities.cost}
- Ranking importance: ${priorities.ranking}
- Location preference: ${priorities.location}
- Career outcomes focus: ${priorities.career}

Available Universities:
${JSON.stringify(universities, null, 2)}

Filter based on:
1. Eligibility (GPA, test scores if available)
2. Budget fit (based on cost sensitivity)
3. Priority alignment
4. Feasibility (acceptance rates, competitiveness)

Rank the shortlist by user priority order. Return 3-6 universities.

For each shortlisted university, explain:
- Why it's shortlisted
- Key trade-offs
- Fit score (0-100)

Respond ONLY in valid JSON:
{
  "shortlist": [
    {
      "id": string,
      "name": string,
      "country": string,
      "ranking": number,
      "tuitionFee": string,
      "programs": string[],
      "matchReason": string (why shortlisted),
      "programRelevance": string (key advantages),
      "fitScore": number,
      "tradeoffs": string
    }
  ],
  "reasoning": string (overall explanation)
}
`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'JSON only. No markdown.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty LLM response');

    const result = JSON.parse(content);

    return res.json({ 
      success: true, 
      shortlist: result.shortlist,
      reasoning: result.reasoning 
    });
  } catch (error) {
    console.error('Error shortlisting universities:', error);
    return res.status(500).json({ error: 'Failed to shortlist universities' });
  }
}

/**
 * AI Counselor with emotional distress detection
 * POST /api/dashboard/counselor
 */
export async function aiCounselor(req: Request, res: Response) {
  try {
    const { userId, message, conversationHistory } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    // Emotional distress detection keywords
    const distressKeywords = [
      'tired of everything', 'nothing matters', 'give up', 'hopeless',
      'exhausted', 'empty', 'no point', 'meaningless', 'can\'t anymore',
      'overwhelmed', 'lost', 'don\'t care', 'why bother'
    ];

    const isDistressed = distressKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    const systemPrompt = isDistressed
      ? `You are an empathetic AI counselor. The user is showing signs of emotional distress.

PRIORITY: Emotional safety over usefulness.

Rules:
- Acknowledge emotions FIRST
- Respond slowly, briefly, calmly (2-3 sentences max)
- Ask ONE gentle, open-ended, grounding question
- Use phrases like "I'm here with you", "That sounds really hard"
- DO NOT give advice or solutions immediately
- DO NOT minimize feelings ("it's not that bad", "others have it worse")
- DO NOT diagnose or use clinical language
- Reduce cognitive load - one idea per message

If distress persists after 2-3 exchanges, gently suggest:
"It sounds like you might benefit from talking to someone who can provide more support. Would you like me to share some resources?"`
      : `You are a helpful AI study abroad counselor. Provide supportive, practical advice while being warm and encouraging.

Keep responses concise and actionable. If the user seems confused or stressed, slow down and break things into smaller steps.`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory);
    }

    messages.push({ role: 'user', content: message });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: isDistressed ? 0.7 : 0.5,
      max_tokens: isDistressed ? 150 : 500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('Empty LLM response');

    return res.json({ 
      success: true, 
      response,
      isDistressed,
      suggestion: isDistressed ? 'Consider professional support if needed' : null
    });
  } catch (error) {
    console.error('Error in AI counselor:', error);
    return res.status(500).json({ error: 'Counselor service unavailable' });
  }
}

/**
 * Toggle todo completion status
 * PATCH /api/dashboard/todos/:id/toggle
 */
export async function toggleTodo(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid todo id' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const todo = await prisma.dashboardTodo.findUnique({
      where: { id }
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (todo.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedTodo = await prisma.dashboardTodo.update({
      where: { id },
      data: {
        completed: !todo.completed
      }
    });

    res.json({
      success: true,
      data: updatedTodo
    });
  } catch (error) {
    console.error('Error toggling todo:', error);
    res.status(500).json({ error: 'Failed to toggle todo' });
  }
}

/**
 * Create a new todo
 * POST /api/dashboard/todos
 */
export async function createTodo(req: Request, res: Response) {
  try {
    const { userId, title, priority } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ error: 'userId and title are required' });
    }

    const todo = await prisma.dashboardTodo.create({
      data: {
        userId,
        title,
        priority: priority || 'medium',
        completed: false
      }
    });

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
}

/**
 * Delete a todo
 * DELETE /api/dashboard/todos/:id
 */
export async function deleteTodo(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid todo id' });
    }

    const todo = await prisma.dashboardTodo.findUnique({
      where: { id }
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (todo.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.dashboardTodo.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
}

/**
 * Get all todos for a user
 * GET /api/dashboard/todos?userId=xxx
 */
export async function getTodos(req: Request, res: Response) {
  try {
    const { userId } = req.query as { userId?: string };

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const todos = await prisma.dashboardTodo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: todos
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
}