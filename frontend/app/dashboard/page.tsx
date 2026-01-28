// frontend/app/dashboard/page.tsx

import Navbar from '@/components/Navbar';
import ProfileStrengthCard from '@/components/ProfileStrengthCard';
import StageIndicator from '@/components/StageIndicator';
import TodoList from '@/components/TodoList';
import { fetchDashboard } from '@/lib/api';

export default async function DashboardPage() {
  const userId = 'user_123'; // 🔁 replace later with auth

  const response = await fetchDashboard(userId);
  const dashboard = response.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back 👋
          </h1>
          <p className="text-gray-600">
            Here's your study abroad journey progress
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="space-y-6">
            <ProfileStrengthCard strength={dashboard.profileStrength} />

            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Profile Summary</h3>

              <div className="space-y-3 text-sm">
                <Row label="Target Degree" value={dashboard.summary.targetDegree} />
                <Row label="Field" value={dashboard.summary.field} />
                <Row label="Intake" value={dashboard.summary.intake} />
                <Row label="Budget" value={dashboard.summary.budget} />

                <div className="pt-3 border-t">
                  <span className="text-gray-600">Preferred Countries:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dashboard.summary.preferredCountries.map((c: string) => (
                      <span
                        key={c}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle */}
          <StageIndicator currentStage={dashboard.currentStage} />

          {/* Right */}
          <TodoList tasks={dashboard.todos} userId={userId} />
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}