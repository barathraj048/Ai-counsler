// FILE: app/universities/page.tsx

import Navbar from '@/components/Navbar';
import UniversityCard from '@/components/UniversityCard';
import { dummyUniversities, dummyUserUniversities } from '@/lib/dummy-data';

export default function UniversitiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Universities
          </h1>
          <p className="text-gray-600">
            Filter and explore universities based on your preferences
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="">All Countries</option>
                <option value="USA">USA</option>
                <option value="Canada">Canada</option>
                <option value="UK">UK</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Degree Type
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="">All Types</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="">All Fields</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="">Any Budget</option>
                <option value="low">Under $30k</option>
                <option value="medium">$30k - $50k</option>
                <option value="high">Over $50k</option>
              </select>
            </div>
          </div>
        </div>

        {/* University Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyUniversities.map(university => {
            const userUniversity = dummyUserUniversities.find(
              u => u.university_id === university.id
            );

            return (
              <UniversityCard
                key={university.id}
                university={university}
                userUniversity={userUniversity}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}
