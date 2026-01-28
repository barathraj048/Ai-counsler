import { prisma } from '../lib/prisma.js';
import Groq from 'groq-sdk';
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});
export async function getDashboard(req, res) {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }
        // 1️⃣ Return cached dashboard if exists
        const existing = await prisma.dashboardSnapshot.findUnique({
            where: { userId },
        });
        if (existing) {
            return res.json({ success: true, data: existing.dashboardJson });
        }
        // 2️⃣ Fetch onboarding answers
        const answers = await prisma.onboardingAnswer.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });
        if (answers.length === 0) {
            return res.status(404).json({ error: 'No onboarding data found' });
        }
        // 3️⃣ Normalize answers
        const profile = {};
        for (const a of answers) {
            try {
                profile[a.questionId] = JSON.parse(a.answer);
            }
            catch {
                profile[a.questionId] = a.answer;
            }
        }
        // 4️⃣ LLM Prompt
        const prompt = `
You are an AI study abroad advisor.

Based on the onboarding profile, generate a DASHBOARD STATE.

Profile:
${JSON.stringify(profile, null, 2)}

Respond ONLY in valid JSON.

Schema:
{
  "profileStrength": number,
  "currentStage": "Profile Building" | "Shortlisting" | "Tests" | "Applications" | "Visa" | "Done",
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
- Generate 3–5 todos
- Todos must be actionable
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
        if (!content)
            throw new Error('Empty LLM response');
        const dashboard = JSON.parse(content);
        // 5️⃣ Persist snapshot
        await prisma.dashboardSnapshot.create({
            data: {
                userId,
                dashboardJson: dashboard,
                profileStrength: dashboard.profileStrength,
                currentStage: dashboard.currentStage,
            },
        });
        return res.json({ success: true, data: dashboard });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Dashboard generation failed' });
    }
}
//# sourceMappingURL=dashboard.controller.js.map