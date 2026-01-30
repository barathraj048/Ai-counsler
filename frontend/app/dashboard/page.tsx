// frontend/app/dashboard/page.tsx

import Navbar from '@/components/Navbar';
import ProfileStrengthCard from '@/components/ProfileStrengthCard';
import StageIndicator from '@/components/StageIndicator';
import TodoList from '@/components/DashboardTodoList';
import AICounselor from '@/components/AICounselor';
import { fetchDashboard } from '@/lib/api';

export default async function DashboardPage() {
  const userId = 'user_123'; // 🔁 replace later with auth

  try {
    const response = await fetchDashboard(userId);
    const dashboard = response.data;

    // Debug logging (remove in production)
    console.log('Dashboard data:', dashboard);
    console.log('All stages:', dashboard.allStages);
    console.log('Current stage:', dashboard.currentStage);

    // Safer data access with fallbacks
    const userProfile = dashboard?.summary || {};
    const allStages = dashboard?.allStages || [];
    const todos = dashboard?.todos || [];
    const profileStrength = dashboard?.profileStrength || 0;
    const currentStage = dashboard?.currentStage || 'profile-setup';

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-semibold text-gray-900 mb-3 tracking-tight">
              Welcome back 👋
            </h1>
            <p className="text-lg text-gray-600">
              Here's your study abroad journey progress
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <ProfileStrengthCard 
                strength={profileStrength} 
                userId={userId}
                currentProfile={userProfile}
              />

              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <h3 className="text-xl font-semibold mb-6 text-gray-900">Profile Summary</h3>

                <div className="space-y-4 text-sm">
                  <Row label="Target Degree" value={userProfile?.targetDegree || 'Not set'} />
                  <Row label="Field" value={userProfile?.field || 'Not set'} />
                  <Row label="Intake" value={userProfile?.intake || 'Not set'} />
                  <Row label="Budget" value={userProfile?.budget || 'Not set'} />

                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <span className="text-gray-600 font-medium">Preferred Countries:</span>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(userProfile?.preferredCountries || []).map((c: string) => (
                        <span
                          key={c}
                          className="px-3 py-1.5 bg-blue-50/80 text-blue-700 rounded-full text-xs font-medium"
                        >
                          {c}
                        </span>
                      ))}
                      {(!userProfile?.preferredCountries || userProfile.preferredCountries.length === 0) && (
                        <span className="text-xs text-gray-500">None selected</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column */}
            <StageIndicator 
              currentStage={currentStage} 
              allStages={allStages}
              userId={userId}
              userProfile={userProfile}
            />

            {/* Right Column */}
            <TodoList tasks={todos} userId={userId} />
          </div>
        </main>

        {/* AI Counselor (floating chat) */}
        <AICounselor userId={userId} />
      </div>
    );
  } catch (error) {
    console.error('Error loading dashboard:', error);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-red-700 mb-4">Unable to load your dashboard data. Please try refreshing the page.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Refresh Page
            </button>
          </div>
        </main>
      </div>
    );
  }
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-gray-600">{label}:</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}