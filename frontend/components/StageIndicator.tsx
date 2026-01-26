// FILE: components/StageIndicator.tsx

import { stageNames } from '@/lib/dummy-data';

interface StageIndicatorProps {
  currentStage: number;
}

export default function StageIndicator({ currentStage }: StageIndicatorProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Current Stage
      </h3>
      <div className="space-y-3">
        {stageNames.map((stage, index) => {
          const stageNumber = index + 1;
          const isCompleted = stageNumber < currentStage;
          const isCurrent = stageNumber === currentStage;
          
          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                isCurrent ? 'bg-blue-50 border border-blue-200' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isCompleted ? '✓' : stageNumber}
              </div>
              <span
                className={`text-sm font-medium ${
                  isCurrent ? 'text-blue-900' : 'text-gray-700'
                }`}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}