'use server';

import { prisma } from '@/lib/prisma';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function getDashboardForUser(userId: string) {
  // 1️⃣ Try cached snapshot first
  const existing = await prisma.dashboardSnapshot.findUnique({
    where: { userId },
  });

  if (existing) {
    return existing.dashboardJson;
  }

  // 2️⃣ Fetch onboarding answers
  const answers = await prisma.onboardingAnswer.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });

  if (answers.length === 0) {
    throw new Error('No onboarding data found');
  }

  // 3️⃣ Normalize answers
  const profile: Record<string, any> = {};
  for (const a of answers) {
    try {
      profile[a.questionId] = JSON.parse(a.answer);
    } catch {
      profile[a.questionId] = a.answer;
    }
  }

  // 4️⃣ LLM prompt (STRICT JSON)
  const prompt = `
You are an AI study abroad advisor.

Based on the onboarding profile, generate a DASHBOARD STATE.

Profile:
${JSON.stringify(profile, null, 2)}

Respond ONLY in JSON.

Schema:
{
  "profileStrength": number,
  "currentStage": "Profile Building | Shortlisting | Tests | Applications | Visa | Done",
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
      "priority": "high|medium|low"
    }
  ]
}

Rules:
- Be conservative, realistic
- Todos must be actionable
- Stage must reflect readiness
`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'JSON only. No markdown.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty LLM response');

  const dashboard = JSON.parse(content);

  // 5️⃣ Persist snapshot (VERY IMPORTANT)
  await prisma.dashboardSnapshot.create({
    data: {
      userId,
      dashboardJson: dashboard,
      profileStrength: dashboard.profileStrength,
      currentStage: dashboard.currentStage,
    },
  });

  return dashboard;
}
