'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import QuestionRenderer from '@/components/QuestionRenderer';
import OnboardingProgressBar from '@/components/OnboardingProgress';
import { submitAnswerAction, getInitialQuestion } from './actions';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'select' | 'multiselect' | 'number';
  options?: string[];
  placeholder?: string;
}

const MAX_QUESTIONS = 18;

export default function DynamicOnboarding() {
  const router = useRouter();
  const hasCompletedRef = useRef(false);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(MAX_QUESTIONS);
  const [error, setError] = useState<string | null>(null);

  // ⚠️ Replace with real auth user id
  const userId = 'user_123';

  useEffect(() => {
    getInitialQuestion().then(setCurrentQuestion);
  }, []);

  const handleSubmit = async (answer: any) => {
    if (!currentQuestion || hasCompletedRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await submitAnswerAction({
        question: currentQuestion,
        answer,
        answersSoFar: answers,
        userId,
      });

      if (result.completed) {
        hasCompletedRef.current = true;
        setIsLoading(false);
        router.replace('/dashboard');
        return;
      }

      setAnswers(result.updatedAnswers);
      setCurrentQuestion(result.nextQuestion);

      if (result.totalQuestions) {
        setTotalQuestions(result.totalQuestions);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to process your answer. Please try again.');
    } finally {
      if (!hasCompletedRef.current) {
        setIsLoading(false);
      }
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <>
      <OnboardingProgressBar
        current={answeredCount + 1}
        total={totalQuestions}
        answeredCount={answeredCount}
      />

      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-2xl mx-auto">
          {answeredCount === 0 && (
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-3 text-gray-900">
                Welcome to AI Counsellor
              </h1>
              <p className="text-gray-600">
                This will take about 5–10 minutes.
              </p>
            </div>
          )}

          <div className="bg-white p-8 rounded-lg shadow border">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
                {error}
              </div>
            )}

            <QuestionRenderer
              question={currentQuestion}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </>
  );
}
