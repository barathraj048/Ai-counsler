// backend/src/services/llm.service.ts

import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface ImprovementTask {
  id: string;
  title: string;
  description: string;
  impact: number;
  category: 'academic' | 'experience' | 'tests' | 'documents';
  actionable: string;
}

/**
 * Generate personalized improvement tasks based on user profile
 */
export async function generateImprovementTasks(
  userProfile: any
): Promise<ImprovementTask[]> {
  try {
    const prompt = `You are an expert study abroad counselor. Analyze this student profile and generate specific, actionable improvement tasks.

STUDENT PROFILE:
${JSON.stringify(userProfile, null, 2)}

Generate 3-6 improvement tasks that would most significantly boost their application strength. For each task:

1. Provide a clear, specific title
2. Write a detailed description explaining WHY this matters
3. Estimate the impact (percentage points 1-20)
4. Categorize as: academic, experience, tests, or documents
5. Provide a specific actionable step

Respond ONLY with a valid JSON array in this exact format:
[
  {
    "id": "unique-task-id",
    "title": "Task Title",
    "description": "Why this matters and how it helps",
    "impact": 15,
    "category": "academic",
    "actionable": "Specific next step to take"
  }
]

Rules:
- Focus on gaps in their profile
- Impact should reflect realistic gains (5-20 points)
- Make descriptions motivating and specific to their goals
- Prioritize high-impact items first
- Only suggest achievable improvements`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful study abroad advisor. Always respond with valid JSON only, no markdown or explanations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || '[]';
    
    // Clean up response (remove markdown code blocks if present)
    const cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const tasks: ImprovementTask[] = JSON.parse(cleanedResponse);

    // Validate and sanitize tasks
    return tasks.map((task, index) => ({
      id: task.id || `task-${index + 1}`,
      title: task.title || 'Improvement Task',
      description: task.description || 'No description provided',
      impact: Math.min(20, Math.max(1, task.impact || 10)),
      category: ['academic', 'experience', 'tests', 'documents'].includes(task.category)
        ? task.category
        : 'academic',
      actionable: task.actionable || 'Take action to improve',
    }));
  } catch (error) {
    console.error('Error generating improvement tasks:', error);
    
    // Fallback to default tasks if LLM fails
    return getDefaultImprovementTasks(userProfile);
  }
}

/**
 * Fallback improvement tasks when LLM is unavailable
 */
function getDefaultImprovementTasks(userProfile: any): ImprovementTask[] {
  const tasks: ImprovementTask[] = [];

  // GPA Check
  if (!userProfile?.gpa || userProfile.gpa < 3.0) {
    tasks.push({
      id: 'improve-gpa',
      title: 'Improve Academic Performance',
      description:
        'A strong GPA (3.5+) significantly boosts your profile for competitive programs. Consider retaking key courses or focusing on upcoming semester performance.',
      impact: 15,
      category: 'academic',
      actionable: 'Review your transcript and identify courses to strengthen',
    });
  }

  // Test Scores Check
  const hasTestScores =
    userProfile?.testScores?.gre ||
    userProfile?.testScores?.gmat ||
    userProfile?.testScores?.toefl ||
    userProfile?.testScores?.ielts;

  if (!hasTestScores) {
    tasks.push({
      id: 'add-test-scores',
      title: 'Complete Standardized Tests',
      description:
        'GRE/GMAT and English proficiency tests (TOEFL/IELTS) are required by most universities. Strong scores can offset other weaknesses in your application.',
      impact: 20,
      category: 'tests',
      actionable: 'Register for GRE/GMAT and TOEFL/IELTS exams',
    });
  }

  // Work Experience Check
  if (!userProfile?.workExperience || userProfile.workExperience.length === 0) {
    tasks.push({
      id: 'add-experience',
      title: 'Gain Relevant Experience',
      description:
        'Work experience, internships, or research projects demonstrate practical skills and commitment to your field. Quality matters more than quantity.',
      impact: 15,
      category: 'experience',
      actionable: 'Apply for internships or research positions in your field',
    });
  }

  // Statement of Purpose Check
  if (!userProfile?.sop) {
    tasks.push({
      id: 'add-sop',
      title: 'Draft Statement of Purpose',
      description:
        'Your SOP is your chance to tell your unique story. It should connect your background, goals, and why this program is the perfect fit.',
      impact: 12,
      category: 'documents',
      actionable: 'Start with an outline of your academic journey and goals',
    });
  }

  // Letters of Recommendation Check
  const lorCount = userProfile?.lors?.length || 0;
  if (lorCount < 2) {
    tasks.push({
      id: 'add-lors',
      title: 'Secure Recommendation Letters',
      description:
        lorCount === 0
          ? 'Most programs require 2-3 strong letters from professors or supervisors who know your work well.'
          : `You have ${lorCount} letter(s). Aim for 2-3 recommendations from people who can speak to your strengths.`,
      impact: 10,
      category: 'documents',
      actionable: 'Identify potential recommenders and reach out early',
    });
  }

  // Extracurriculars Check
  if (!userProfile?.extracurriculars || userProfile.extracurriculars.length === 0) {
    tasks.push({
      id: 'add-activities',
      title: 'Showcase Leadership & Activities',
      description:
        'Extracurriculars, volunteer work, and leadership roles demonstrate well-roundedness and soft skills valued by universities.',
      impact: 8,
      category: 'experience',
      actionable: 'Document your leadership roles and community involvement',
    });
  }

  return tasks;
}

export default {
  generateImprovementTasks,
};