'use client';

import { useEffect, useState } from 'react';

import Navbar from '@/components/Navbar';
import ProfileStrengthCard from '@/components/ProfileStrengthCard';
import StageIndicator from '@/components/StageIndicator';
import UnifiedTodoList from '@/components/UnifiedTodoList';
import AICounselor from '@/components/AICounselor';

import { fetchDashboard } from '@/lib/api';

interface DashboardData {
  summary: any;
  allStages: any[];
  todos: any[];
  profileStrength: number;
  currentStage: string;
}

export default function DashboardPage() {
  const userId = 'user_123'; // 🔁 replace later with real auth

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchDashboard(userId);
        setDashboard(res.data);
      } catch (err) {
        console.error('Dashboard load failed:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-gray-600">Loading dashboard...</p>
        </main>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Error Loading Dashboard
            </h2>
            <p className="text-red-700 mb-4">
              Unable to load your dashboard data.
            </p>
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

  const {
    summary = {},
    allStages = [],
    todos = [],
    profileStrength = 0,
    currentStage = 'profile-setup',
  } = dashboard;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-semibold text-gray-900 mb-2">
            Welcome back 👋
          </h1>
          <p className="text-gray-600">
            Track your study abroad journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <ProfileStrengthCard
              strength={profileStrength}
              userId={userId}
              currentProfile={summary}
            />

            <ProfileSummary summary={summary} />
          </div>

          <StageIndicator
            currentStage={currentStage}
            allStages={allStages}
            userId={userId}
            userProfile={summary}
          />

          <UnifiedTodoList
            userId={userId}
            variant="dashboard"
            showAddButton
            initialTodos={todos}
          />
        </div>
      </main>

      <AICounselor userId={userId} />
    </div>
  );
}

function ProfileSummary({ summary }: { summary: any }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        Profile Summary
      </h3>

      <div className="space-y-3 text-sm">
        <Row label="Target Degree" value={summary?.targetDegree || 'Not set'} />
        <Row label="Field" value={summary?.field || 'Not set'} />
        <Row label="Intake" value={summary?.intake || 'Not set'} />
        <Row label="Budget" value={summary?.budget || 'Not set'} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-600">{label}:</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}
