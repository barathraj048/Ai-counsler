// FILE: app/applications/page.tsx

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DocumentChecklist from '@/components/DocumentChecklist';
import { dummyUserUniversities, dummyUniversities } from '@/lib/dummy-data';

export default function ApplicationsPage() {
  const lockedUniversities = dummyUserUniversities.filter(
    u => u.status === 'locked'
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <p className="text-gray-600 mb-6">
              Lock universities from your shortlist to start the application
              process
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

            {/* Locked Universities */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Locked for Application ({lockedUniversities.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedUniversities.map(userUni => {
                  const university = dummyUniversities.find(
                    u => u.id === userUni.university_id
                  );
                  if (!university) return null;

                  return (
                    <div
                      key={userUni.id}
                      className="p-4 border border-green-200 rounded-lg bg-green-50"
                    >
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Application Timeline
              </h2>

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
            <DocumentChecklist />

            {/* AI Tip */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">💡 AI Counsellor Tip</h3>
              <p className="text-blue-800 text-sm">
                Start working on your SOP early. A strong SOP can significantly boost your acceptance chances.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
