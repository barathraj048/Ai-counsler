// FILE: app/page.tsx

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-gray-900">
                AI Counsellor
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Plan your study-abroad journey with a guided AI counsellor
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Get personalized university recommendations, application guidance, and step-by-step support throughout your study abroad journey.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-md text-lg font-medium"
              >
                Get Started
              </Link>
              <Link
                href="/auth/login"
                className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 px-8 py-3 rounded-md text-lg font-medium"
              >
                Login
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Guided Journey
              </h3>
              <p className="text-gray-600">
                Follow a structured, stage-based approach from planning to application submission.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI-Powered Recommendations
              </h3>
              <p className="text-gray-600">
                Get personalized university suggestions based on your profile and preferences.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Application Support
              </h3>
              <p className="text-gray-600">
                Receive guidance on documents, timelines, and tasks for each application.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 AI Counsellor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}