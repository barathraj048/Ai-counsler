import { UserUniversity, University, Task } from '@/types';
import CounsellorTodoList from './CounsellorTodoList';

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

      <CounsellorTodoList tasks={tasks} />
    </div>
  );
}