// FILE: components/Navbar.tsx

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-semibold text-gray-900">
              AI Counsellor
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-gray-900 text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/counsellor"
              className="text-gray-700 hover:text-gray-900 text-sm font-medium"
            >
              AI Counsellor
            </Link>
            <Link
              href="/universities"
              className="text-gray-700 hover:text-gray-900 text-sm font-medium"
            >
              Universities
            </Link>
            <Link
              href="/applications"
              className="text-gray-700 hover:text-gray-900 text-sm font-medium"
            >
              Applications
            </Link>
            <button className="text-gray-700 hover:text-gray-900 text-sm font-medium">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}