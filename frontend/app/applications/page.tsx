// FILE: app/applications/page.tsx

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DocumentChecklist from '@/components/DocumentChecklist';
import { dummyUserUniversities, dummyUniversities } from '@/lib/dummy-data';
import { AlertCircle, Sparkles } from 'lucide-react';

export default function ApplicationsPage() {
  const lockedUniversities = dummyUserUniversities.filter(
    u => u.status === 'locked'
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Beta Notice Banner */}
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white">
                  BETA
                </span>
                <h3 className="text-lg font-bold text-gray-900">
                  Application Guidance (Beta Feature)
                </h3>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                This feature is currently in development. All data shown here is for demonstration purposes only.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-purple-200 text-purple-700">
                  <AlertCircle className="w-3 h-3" />
                  Demo Data
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-purple-200 text-purple-700">
                  <AlertCircle className="w-3 h-3" />
                  Not Connected to Database
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-purple-200 text-purple-700">
                  <AlertCircle className="w-3 h-3" />
                  Features Under Construction
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Application Guidance
          </h1>
          <p className="text-gray-600">
            Track your application progress and requirements
          </p>
        </div>

        {lockedUniversities.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Universities Locked Yet
            </h2>
            <p className="text-gray-600 mb-2">
              Lock universities from your shortlist to start the application process
            </p>
            <p className="text-sm text-amber-600 mb-6">
              ⚠️ Note: This is demo data. Actual locking feature coming soon!
            </p>

            <Link
              href="/universities"
              className="inline-block px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium"
            >
              Browse Universities
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Demo Data Notice */}
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    Viewing Demo Data
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    The universities and information shown below are sample data for demonstration purposes. 
                    Real application tracking will be available once you complete your profile and shortlist universities.
                  </p>
                </div>
              </div>
            </div>

            {/* Locked Universities */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Locked for Application ({lockedUniversities.length})
                </h2>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  Demo
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedUniversities.map(userUni => {
                  const university = dummyUniversities.find(
                    u => u.id === userUni.university_id
                  );
                  if (!university) return null;

                  return (
                    <div
                      key={userUni.id}
                      className="p-4 border border-green-200 rounded-lg bg-green-50 relative"
                    >
                      <div className="absolute top-2 right-2">
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">
                          DEMO
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {university.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {university.country}
                      </p>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-700">✓ Locked</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">
                          {userUni.acceptance_chance}% chance
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Application Timeline
                </h2>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  Demo
                </span>
              </div>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">
                      ✓
                    </div>
                    <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                  </div>
                  <div className="flex-1 pb-8">
                    <h3 className="font-semibold text-gray-900">
                      Profile Completed
                    </h3>
                    <p className="text-sm text-gray-600">January 15, 2025</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                      2
                    </div>
                    <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                  </div>
                  <div className="flex-1 pb-8">
                    <h3 className="font-semibold text-gray-900">
                      Document Preparation
                    </h3>
                    <p className="text-sm text-gray-600">
                      In Progress – Due March 15, 2025
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold">
                      3
                    </div>
                    <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                  </div>
                  <div className="flex-1 pb-8">
                    <h3 className="font-semibold text-gray-900">
                      Application Submission
                    </h3>
                    <p className="text-sm text-gray-600">
                      Planned – March 20, 2025
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold">
                      4
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      Wait for Results
                    </h3>
                    <p className="text-sm text-gray-600">
                      Expected April – June 2025
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Checklist */}
            <div className="relative">
              <div className="absolute top-2 right-2 z-10">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  Demo
                </span>
              </div>
              <DocumentChecklist />
            </div>

            {/* AI Tip */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <span className="text-2xl">💡</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    AI Counsellor Tip
                  </h3>
                  <p className="text-blue-800 text-sm mb-2">
                    Start working on your SOP early. A strong SOP can significantly boost your acceptance chances.
                  </p>
                  <p className="text-xs text-blue-600 italic">
                    Note: AI-powered personalized tips coming soon in the full version!
                  </p>
                </div>
              </div>
            </div>

            {/* Coming Soon Features */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border-2 border-dashed border-gray-300">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Coming Soon in Full Version
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-purple-600">✨</span>
                  <span className="text-gray-700">Real-time application status tracking</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600">✨</span>
                  <span className="text-gray-700">Automated deadline reminders</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600">✨</span>
                  <span className="text-gray-700">Document upload & management</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600">✨</span>
                  <span className="text-gray-700">AI-powered application review</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600">✨</span>
                  <span className="text-gray-700">Direct university portal integration</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600">✨</span>
                  <span className="text-gray-700">Application fee tracking</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}