// FILE: components/ProfileStrengthCard.tsx

interface ProfileStrengthCardProps {
  strength: number;
}

export default function ProfileStrengthCard({ strength }: ProfileStrengthCardProps) {
  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return 'text-green-600';
    if (strength >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStrengthLabel = (strength: number) => {
    if (strength >= 80) return 'Strong';
    if (strength >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Profile Strength
      </h3>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-3xl font-bold ${getStrengthColor(strength)}`}>
          {strength}%
        </span>
        <span className={`text-sm font-medium ${getStrengthColor(strength)}`}>
          {getStrengthLabel(strength)}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div
          className="bg-blue-600 h-3 rounded-full"
          style={{ width: `${strength}%` }}
        />
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Academic Details</span>
          <span className="text-green-600">✓ Complete</span>
        </div>
        <div className="flex justify-between">
          <span>Test Scores</span>
          <span className="text-yellow-600">○ In Progress</span>
        </div>
        <div className="flex justify-between">
          <span>Documents</span>
          <span className="text-yellow-600">○ In Progress</span>
        </div>
      </div>
    </div>
  );
}