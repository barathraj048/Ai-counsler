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

    if (!Array.isArray(universities) || universities.length === 0) {
      return res.status(400).json({ error: 'Universities must be a non-empty array' });
    }

    // Determine primary priority
    const priorityList = [
      { name: 'cost', value: priorities.cost },
      { name: 'ranking', value: priorities.ranking },
      { name: 'location', value: priorities.location },
      { name: 'career', value: priorities.career }
    ].sort((a, b) => b.value - a.value);

    const primaryPriority = priorityList[0] || { name: 'cost', value: 0 };
    const secondaryPriority = priorityList[1] || { name: 'ranking', value: 0 };

    const prompt = `
You are a university shortlisting AI. You MUST filter and rank based on user priorities.

USER PROFILE:
- Field: ${userProfile.field}
- Budget: ${userProfile.budget}
- Target Degree: ${userProfile.targetDegree}
- Intake: ${userProfile.intake}
${userProfile.gpa ? `- GPA: ${userProfile.gpa}` : ''}
${userProfile.testScores ? `- Test Scores: ${JSON.stringify(userProfile.testScores)}` : ''}

PRIORITY WEIGHTS (0-100, HIGHER = MORE IMPORTANT):
- Cost Sensitivity: ${priorities.cost}/100 ${priorities.cost > 70 ? '⚠️ CRITICAL FACTOR' : ''}
- Ranking Importance: ${priorities.ranking}/100 ${priorities.ranking > 70 ? '⚠️ CRITICAL FACTOR' : ''}
- Location Preference: ${priorities.location}/100 ${priorities.location > 70 ? '⚠️ CRITICAL FACTOR' : ''}
- Career Outcomes: ${priorities.career}/100 ${priorities.career > 70 ? '⚠️ CRITICAL FACTOR' : ''}

PRIMARY PRIORITY: ${primaryPriority.name.toUpperCase()} (${primaryPriority.value}/100)
SECONDARY PRIORITY: ${secondaryPriority.name.toUpperCase()} (${secondaryPriority.value}/100)

AVAILABLE UNIVERSITIES:
${JSON.stringify(universities, null, 2)}

FILTERING RULES (APPLY STRICTLY):

1. **IF cost sensitivity ≥ 70**: 
   - ONLY include universities with tuition ≤ $40,000/year
   - Prioritize cheapest options first
   - Reject expensive universities regardless of ranking

2. **IF ranking importance ≥ 70**:
   - ONLY include universities ranked ≤ 100
   - Prioritize top-ranked universities first
   - Reject lower-ranked universities regardless of cost

3. **IF location preference ≥ 70**:
   - Prioritize diverse locations or specific regions mentioned
   - Consider climate, culture, proximity preferences

4. **IF career outcomes ≥ 70**:
   - Prioritize universities with strong placement rates
   - Focus on industry connections and internship opportunities

MATCHING ALGORITHM:
- Weight each university by PRIMARY priority first (${primaryPriority.name})
- Then by SECONDARY priority (${secondaryPriority.name})
- Return 3-6 universities that BEST match the priority distribution
- Each university must score ≥ 60 fit score to be included

OUTPUT FORMAT (JSON ONLY):
{
  "shortlist": [
    {
      "id": "string",
      "name": "string",
      "country": "string",
      "ranking": number,
      "tuitionFee": "string",
      "programs": ["string"],
      "matchReason": "Explain how this university aligns with PRIMARY priority: ${primaryPriority.name}",
      "programRelevance": "Key program advantages",
      "fitScore": number (0-100, weighted by priorities),
      "tradeoffs": "What user sacrifices by choosing this"
    }
  ],
  "reasoning": "Explain why these universities match the priority profile: ${primaryPriority.name}=${primaryPriority.value}, ${secondaryPriority.name}=${secondaryPriority.value}"
}

IMPORTANT: 
- If cost=100, ranking should be IGNORED unless universities are equally cheap
- If ranking=100, cost should be IGNORED unless universities are equally ranked
- The shortlist MUST differ based on priority changes
- Higher priority value = stronger filter weight
`;

    console.log('🎯 Request ID:', userId);
    console.log('📊 Priorities:', priorities);
    console.log('🏆 Primary:', primaryPriority.name, primaryPriority.value);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { 
          role: 'system', 
          content: 'You are a university ranking system. Follow priority weights EXACTLY. Return ONLY valid JSON.' 
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5, // Increased for variation
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty LLM response');
    }

    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/```\n?/g, '');
    }

    let result;
    try {
      result = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw LLM Response:', content);
      throw new Error('Invalid JSON response from LLM');
    }

    if (!result.shortlist || !Array.isArray(result.shortlist)) {
      throw new Error('Invalid response structure: missing shortlist array');
    }

    console.log('✅ Shortlisted:', result.shortlist.length, 'universities');
    console.log('📝 Reasoning:', result.reasoning);

    return res.json({ 
      success: true, 
      shortlist: result.shortlist,
      reasoning: result.reasoning || 'No reasoning provided',
      appliedPriorities: {
        primary: primaryPriority.name,
        secondary: secondaryPriority.name
      }
    });

  } catch (error) {
    console.error('❌ Error shortlisting universities:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = process.env.NODE_ENV === 'development' 
      ? { error: errorMessage, stack: error instanceof Error ? error.stack : undefined }
      : { error: 'Failed to shortlist universities' };
    
    return res.status(500).json(errorDetails);
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