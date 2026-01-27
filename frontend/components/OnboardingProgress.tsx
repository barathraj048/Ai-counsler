// FILE: components/OnboardingProgressBar.tsx

interface OnboardingProgressBarProps {
  current: number;
  total: number;
  answeredCount: number;
}

export default function OnboardingProgressBar({ current, total, answeredCount }: OnboardingProgressBarProps) {
  const percentage = Math.min(Math.round((answeredCount / total) * 100), 100);

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900">AI Counsellor</span>
            <span className="text-sm text-gray-500">|</span>
            <span className="text-sm font-medium text-gray-600">Onboarding</span>
          </div>
          <div className="text-sm font-medium text-gray-700">
            {answeredCount} of ~{total} questions
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}