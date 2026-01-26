// FILE: app/dashboard/page.tsx

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProfileStrengthCard from '@/components/ProfileStrengthCard';
import StageIndicator from '@/components/StageIndicator';
import TodoList from '@/components/TodoList';
import { dummyProfile, dummyUser, dummyTasks } from '@/lib/dummy-data';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {dummyUser.name}
          </h1>
          <p className="text-gray-600">
            Here's your study abroad journey progress
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column – Profile & Stage */}
          <div className="space-y-6">
            <ProfileStrengthCard strength={dummyProfile.profile_strength} />

            {/* Profile Summary */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Profile Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Degree:</span>
                  <span className="font-medium text-gray-900">{dummyProfile.target_degree}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Field:</span>
                  <span className="font-medium text-gray-900">{dummyProfile.field_of_study}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Intake:</span>
                  <span className="font-medium text-gray-900">{dummyProfile.intake_year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-medium text-gray-900">
                    ${dummyProfile.budget_min.toLocaleString()} - ${dummyProfile.budget_max.toLocaleString()}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <span className="text-gray-600">Preferred Countries:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dummyProfile.preferred_countries.map(country => (
                      <span key={country} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column – Stage Progress */}
          <div>
            <StageIndicator currentStage={dummyProfile.current_stage} />
          </div>

          {/* Right Column – To-Do List */}
          <div>
            <TodoList tasks={dummyTasks} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <Link
              href="/counsellor"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="text-2xl mb-2">💬</div>
              <h4 className="font-medium text-gray-900 mb-1">Talk to AI Counsellor</h4>
              <p className="text-sm text-gray-600">Get personalized guidance</p>
            </Link>

            <Link
              href="/universities"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="text-2xl mb-2">🎓</div>
              <h4 className="font-medium text-gray-900 mb-1">Discover Universities</h4>
              <p className="text-sm text-gray-600">Find your perfect match</p>
            </Link>

            <Link
              href="/applications"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="text-2xl mb-2">📝</div>
              <h4 className="font-medium text-gray-900 mb-1">Application Guide</h4>
              <p className="text-sm text-gray-600">Track your progress</p>
            </Link>

          </div>
        </div>
      </main>
    </div>
  );
}
