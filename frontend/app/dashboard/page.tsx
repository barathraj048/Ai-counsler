'use client';

import { useEffect, useState } from 'react';

import Navbar from '@/components/Navbar';
import ProfileStrengthCard from '@/components/ProfileStrengthCard';
import StageIndicator from '@/components/StageIndicator';
import AICounselor from '@/components/AICounselor';

import { fetchDashboard } from '@/lib/api';
import { Lock, Sparkles, AlertCircle, CheckCircle2, Clock, FileText } from 'lucide-react';
import Link from 'next/link';

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

          <ApplicationLocking />
        </div>
      </main>

      <AICounselor userId={userId} />
    </div>
  );
}

function ApplicationLocking() {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
      {/* Header with Badge */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-200 p-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-600 text-white">
                COMING SOON
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Application Locking
            </h3>
            <p className="text-xs text-gray-700">
              Lock universities and streamline your applications
            </p>
          </div>
        </div>
      </div>

      {/* Feature List */}
      <div className="p-5">
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            What This Will Do
          </h4>
          <div className="space-y-2.5">
            <FeatureItem
              icon={<Lock className="w-3.5 h-3.5" />}
              title="Lock Your Selections"
              description="Commit to your top 5-8 university choices"
            />
            <FeatureItem
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              title="Custom Checklists"
              description="Get tailored document requirements per university"
            />
            <FeatureItem
              icon={<Clock className="w-3.5 h-3.5" />}
              title="Deadline Tracking"
              description="Automated reminders for important dates"
            />
            <FeatureItem
              icon={<FileText className="w-3.5 h-3.5" />}
              title="Application Status"
              description="Track submissions and university responses"
            />
          </div>
        </div>

        {/* Development Notice */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-900">
                Feature Under Development
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Once complete, you'll be able to lock universities from your shortlist, receive AI-powered application guides, and track all your submissions in one place.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          className="block w-full text-center px-4 py-2.5 bg-gray-600 text-white hover:bg-gray-600 rounded-lg font-medium text-sm transition-colors"
        >
          Build Your Shortlist Now 
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0 w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-semibold text-gray-900 mb-0.5">
          {title}
        </h5>
        <p className="text-xs text-gray-600">
          {description}
        </p>
      </div>
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