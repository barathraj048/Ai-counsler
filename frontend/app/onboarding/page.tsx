// FILE: app/onboarding/page.tsx

'use client';

import { useEffect, useState } from 'react';
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

export default function DynamicOnboarding() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(15);
  const [error, setError] = useState<string | null>(null);

  // Mock user ID - in production, get from auth session
  const userId = 'user_123';

  useEffect(() => {
    // Load initial question
    const loadInitialQuestion = async () => {
      const initialQ = await getInitialQuestion();
      setCurrentQuestion(initialQ);
    };
    loadInitialQuestion();
  }, []);

  const handleSubmit = async (answer: any) => {
    if (!currentQuestion) return;

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
        // Onboarding complete - redirect to dashboard
        router.push('/dashboard');
        return;
      }

      // Update state with new question and answers
      setAnswers(result.updatedAnswers);
      setCurrentQuestion(result.nextQuestion);
      
      if (result.totalQuestions) {
        setTotalQuestions(result.totalQuestions);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Failed to process your answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized onboarding...</p>
        </div>
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

      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Message (show only on first question) */}
          {answeredCount === 0 && (
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Welcome to AI Counsellor
              </h1>
              <p className="text-gray-600 text-lg">
                I'll ask you a few personalized questions to understand your study abroad goals. 
                This should take about 5-10 minutes.
              </p>
            </div>
          )}

          {/* Question Card */}
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <QuestionRenderer
              question={currentQuestion}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />

            {/* Progress Indicator */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                💡 Your answers help us personalize your university recommendations
              </p>
            </div>
          </div>

          {/* Answer History (Optional - can be removed) */}
          {answeredCount > 0 && (
            <div className="mt-6">
              <button
                onClick={() => {
                  const confirmed = window.confirm('Are you sure you want to start over?');
                  if (confirmed) {
                    setAnswers({});
                    getInitialQuestion().then(setCurrentQuestion);
                  }
                }}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Start over
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}