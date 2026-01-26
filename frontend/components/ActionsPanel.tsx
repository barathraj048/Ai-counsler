// FILE: components/ActionsPanel.tsx

import { UserUniversity, University, Task } from '@/types';

interface ActionsPanelProps {
  userUniversities: UserUniversity[];
  universities: University[];
  tasks: Task[];
}

export default function ActionsPanel({ userUniversities, universities, tasks }: ActionsPanelProps) {
  const shortlisted = userUniversities.filter(u => u.status === 'shortlisted');
  const locked = userUniversities.filter(u => u.status === 'locked');
  
  const getUniversityName = (id: string) => {
    return universities.find(u => u.id === id)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Shortlisted Universities */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Shortlisted ({shortlisted.length})
        </h3>
        <div className="space-y-2">
          {shortlisted.map(uni => (
            <div key={uni.id} className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
              {getUniversityName(uni.university_id)}
            </div>
          ))}
          {shortlisted.length === 0 && (
            <p className="text-sm text-gray-500">No universities shortlisted yet</p>
          )}
        </div>
      </div>

      {/* Locked Universities */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Locked for Application ({locked.length})
        </h3>
        <div className="space-y-2">
          {locked.map(uni => (
            <div key={uni.id} className="text-sm text-gray-700 p-2 bg-green-50 rounded border border-green-200">
              {getUniversityName(uni.university_id)}
            </div>
          ))}
          {locked.length === 0 && (
            <p className="text-sm text-gray-500">No universities locked yet</p>
          )}
        </div>
      </div>

      {/* AI Tasks */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          AI-Generated Tasks
        </h3>
        <div className="space-y-2">
          {tasks.filter(t => t.generated_by === 'AI').slice(0, 3).map(task => (
            <div key={task.id} className="text-sm p-2 bg-blue-50 rounded">
              <p className="font-medium text-gray-900">{task.title}</p>
              <p className="text-xs text-gray-600 mt-1">{task.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}