'use server';

import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

// 🎯 Product rules
const MIN_QUESTIONS = 12;
const MAX_QUESTIONS = 18;

interface Question {
  id: string;
  text: string;
  type: 'text' | 'select' | 'multiselect' | 'number';
  options?: string[];
  placeholder?: string;
}

interface SubmitAnswerParams {
  question: Question;
  answer: any;
  answersSoFar: Record<string, any>;
  userId: string;
}

export async function submitAnswerAction({
  question,
  answer,
  answersSoFar,
  userId,
}: SubmitAnswerParams) {
  try {
    // 1️⃣ Merge answers
    const updatedAnswers = {
      ...answersSoFar,
      [question.id]: answer,
    };

    const answeredCount = Object.keys(updatedAnswers).length;

    // 2️⃣ Persist answer (best-effort)
    try {
      await fetch('http://localhost:4000/api/onboarding/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          questionId: question.id,
          questionText: question.text,
          answer,
        }),
      });
    } catch (err) {
      console.error('Failed to store onboarding answer:', err);
    }

    // 🛑 HARD STOP — never exceed MAX_QUESTIONS
    if (answeredCount >= MAX_QUESTIONS) {
      await markOnboardingComplete(userId);
      return {
        completed: true,
        updatedAnswers,
      };
    }

    // 3️⃣ Ask Groq for next step
    const groqResponse = await getNextQuestionFromGroq(
      updatedAnswers,
      answeredCount
    );

    // 4️⃣ LLM says onboarding is complete
    if (groqResponse.completed) {
      await markOnboardingComplete(userId);
      return {
        completed: true,
        updatedAnswers,
      };
    }

    // 5️⃣ Continue onboarding
    return {
      completed: false,
      nextQuestion: groqResponse.nextQuestion,
      updatedAnswers,
      totalQuestions: MAX_QUESTIONS,
      currentQuestionNumber: answeredCount + 1,
    };
  } catch (error) {
    console.error('Error in submitAnswerAction:', error);
    throw new Error('Failed to process answer');
  }
}

/* ----------------------------- */
/* --------- HELPERS ----------- */
/* ----------------------------- */

async function markOnboardingComplete(userId: string) {
  try {
    await fetch('http://localhost:4000/api/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  } catch (err) {
    console.error('Failed to mark onboarding complete:', err);
  }
}

async function getNextQuestionFromGroq(
  answers: Record<string, any>,
  answeredCount: number
) {
  const prompt = `You are an AI study abroad counselor conducting a structured onboarding interview.

Progress:
- Questions answered so far: ${answeredCount}
- Minimum required questions: ${MIN_QUESTIONS}
- Maximum allowed questions: ${MAX_QUESTIONS}

Collected answers:
${JSON.stringify(answers, null, 2)}

RULES (STRICT):
1. Ask ONLY high-signal questions
2. Avoid nice-to-have or redundant questions
3. If core information is collected AND answeredCount >= ${MIN_QUESTIONS}, respond with completed: true
4. NEVER exceed ${MAX_QUESTIONS} questions
5. If answeredCount >= ${MAX_QUESTIONS}, respond with completed: true immediately

Core information required:
- Education level & major
- GPA / grades
- Target degree & field
- Preferred countries
- Budget range
- Test scores (IELTS/TOEFL, GRE/GMAT)
- Intake year
- Funding type

Respond ONLY in JSON.

If asking a question:
{
  "completed": false,
  "nextQuestion": {
    "id": "unique_question_id",
    "text": "Question text?",
    "type": "text|select|multiselect|number",
    "options": ["option1", "option2"]
  }
}

If finished:
{
  "completed": true
}
`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are a strict JSON-only API. Do not include markdown or explanations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('Empty response from Groq');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Groq API error:', error);

    // 🔒 Absolute safety fallback
    if (answeredCount >= MIN_QUESTIONS) {
      return { completed: true };
    }

    return {
      completed: false,
      nextQuestion: {
        id: `fallback_${answeredCount}`,
        text: 'Please tell us more about your study abroad goals.',
        type: 'text',
      },
    };
  }
}

export async function getInitialQuestion(): Promise<Question> {
  return {
    id: 'education_level',
    text: "Let's start with the basics. What is your current level of education?",
    type: 'select',
    options: [
      'High School',
      'Undergraduate (Bachelor)',
      'Graduate (Master)',
      'Doctoral (PhD)',
    ],
  };
}
