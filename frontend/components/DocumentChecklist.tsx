// FILE: components/DocumentChecklist.tsx

'use client';

import { documentChecklist } from '@/lib/dummy-data';
import { useState } from 'react';

export default function DocumentChecklist() {
  const [documents, setDocuments] = useState(documentChecklist);

  const toggleDocument = (id: string) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === id
          ? { ...doc, status: doc.status === 'completed' ? 'pending' : 'completed' }
          : doc
      )
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Required Documents
      </h3>
      <div className="space-y-3">
        {documents.map(doc => {
          const isCompleted = doc.status === 'completed';
          const deadline = new Date(doc.deadline);
          
          return (
            <div
              key={doc.id}
              className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={() => toggleDocument(doc.id)}
                className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    isCompleted ? 'line-through text-gray-400' : 'text-gray-900'
                  }`}
                >
                  {doc.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Deadline: {deadline.toLocaleDateString()}
                </p>
              </div>
              {isCompleted ? (
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                  ✓ Complete
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                  Pending
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}