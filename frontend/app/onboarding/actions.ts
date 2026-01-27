// FILE: app/onboarding/actions.ts

'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

    // 2️⃣ Store Q+A in backend (localhost:4000)
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
    } catch (error) {
      console.error('Failed to store answer in backend:', error);
      // Continue even if backend fails (for demo purposes)
    }

    // 3️⃣ Ask Gemini for next question
    const geminiResponse = await getNextQuestionFromGemini(updatedAnswers);

    // 4️⃣ Gemini says onboarding done
    if (geminiResponse.completed) {
      try {
        await fetch('http://localhost:4000/api/onboarding/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
      } catch (error) {
        console.error('Failed to mark onboarding complete:', error);
      }

      return { completed: true, updatedAnswers };
    }

    // 5️⃣ Return next question to frontend
    return {
      completed: false,
      nextQuestion: geminiResponse.nextQuestion,
      updatedAnswers,
      totalQuestions: geminiResponse.estimatedTotal || 15,
      currentQuestionNumber: Object.keys(updatedAnswers).length + 1,
    };
  } catch (error) {
    console.error('Error in submitAnswerAction:', error);
    throw new Error('Failed to process answer');
  }
}

async function getNextQuestionFromGemini(answers: Record<string, any>) {
  const prompt = `You are an AI study abroad counselor conducting a dynamic onboarding interview.

Collected answers so far:
${JSON.stringify(answers, null, 2)}

Your task:
1. Analyze the answers collected
2. Decide the single most important next question to ask
3. Avoid asking redundant questions
4. Ask follow-up questions based on previous answers
5. If you have collected sufficient information (academic background, study goals, budget, test scores, preferred countries), respond with completed: true

Essential information to collect:
- Current education level and major
- GPA/grades
- Target degree and field of study
- Preferred countries
- Budget range
- Test scores status (IELTS/TOEFL, GRE/GMAT)
- Intake year
- Funding type

Respond ONLY in this exact JSON format:
{
  "completed": false,
  "nextQuestion": {
    "id": "unique_question_id",
    "text": "Your question here?",
    "type": "text|select|multiselect|number",
    "options": ["option1", "option2"] // only if type is select or multiselect
  },
  "estimatedTotal": 15
}

OR if onboarding is complete:
{
  "completed": true
}
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response (remove markdown code blocks if present)
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Fallback: Return a default question if Gemini fails
    const answeredCount = Object.keys(answers).length;
    
    if (answeredCount >= 10) {
      return { completed: true };
    }
    
    // Return fallback question
    return {
      completed: false,
      nextQuestion: {
        id: `fallback_${answeredCount}`,
        text: 'Please tell us more about your study abroad goals',
        type: 'text',
      },
      estimatedTotal: 15,
    };
  }
}

export async function getInitialQuestion() {
  return {
    id: 'welcome',
    text: "Let's start with the basics. What is your current level of education?",
    type: 'select',
    options: ['High School', 'Undergraduate (Bachelor)', 'Graduate (Master)', 'Doctoral (PhD)'],
  };
}