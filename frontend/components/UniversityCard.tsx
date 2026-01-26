// FILE: components/UniversityCard.tsx

'use client';

import { University, UserUniversity } from '@/types';
import { useState } from 'react';

interface UniversityCardProps {
  university: University;
  userUniversity?: UserUniversity;
}

export default function UniversityCard({ university, userUniversity }: UniversityCardProps) {
  const [status, setStatus] = useState(userUniversity?.status || null);
  
  const handleShortlist = () => {
    setStatus('shortlisted');
  };
  
  const handleLock = () => {
    if (status === 'shortlisted') {
      setStatus('locked');
    }
  };

  const getRiskColor = (risk?: string) => {
    if (!risk) return 'bg-gray-100 text-gray-700';
    if (risk === 'Low') return 'bg-green-100 text-green-700';
    if (risk === 'Medium') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {university.name}
          </h3>
          <p className="text-sm text-gray-600">{university.country}</p>
        </div>
        {status && (
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              status === 'locked'
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {status === 'locked' ? '🔒 Locked' : '⭐ Shortlisted'}
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Degree:</span>
          <span className="font-medium text-gray-900">{university.degree_type}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Field:</span>
          <span className="font-medium text-gray-900">{university.field}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Avg. Cost:</span>
          <span className="font-medium text-gray-900">${university.avg_cost.toLocaleString()}/year</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Competitiveness:</span>
          <span className="font-medium text-gray-900">{university.competitiveness}</span>
        </div>
        {userUniversity && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Acceptance Chance:</span>
              <span className="font-medium text-gray-900">{userUniversity.acceptance_chance}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Risk Level:</span>
              <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(userUniversity.risk_level)}`}>
                {userUniversity.risk_level}
              </span>
            </div>
          </>
        )}
      </div>

      {userUniversity && userUniversity.risk_level === 'High' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700">
            ⚠️ High risk: This university has a low acceptance probability based on your profile
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {!status && (
          <button
            onClick={handleShortlist}
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
          >
            Shortlist
          </button>
        )}
        {status === 'shortlisted' && (
          <button
            onClick={handleLock}
            className="flex-1 bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md text-sm font-medium"
          >
            Lock for Application
          </button>
        )}
        {status === 'locked' && (
          <button
            disabled
            className="flex-1 bg-gray-300 text-gray-600 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
          >
            Locked ✓
          </button>
        )}
      </div>
    </div>
  );
}