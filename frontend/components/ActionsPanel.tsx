// components/ActionsPanel.tsx
import { UserUniversity, University, Task } from '@/types';
import CounsellorTodoList from './CounsellorTodoList';

interface ActionsPanelProps {
  userUniversities: UserUniversity[];
  universities: University[];
  tasks: Task[];
}

export default function ActionsPanel({ userUniversities, universities }: ActionsPanelProps) {
  // Debug logging
  console.log('📋 ActionsPanel received:', {
    userUniversitiesCount: userUniversities.length,
    universitiesCount: universities.length,
    userUniversitiesSample: userUniversities[0],
    universitiesSample: universities[0]
  });

  const shortlisted = userUniversities.filter(u => u.status === 'shortlisted');
  const locked = userUniversities.filter(u => u.status === 'locked');
  
  const getUniversityName = (id: string) => {
    // First try to find in the universities array
    const foundUniversity = universities.find(u => u.id === id);
    if (foundUniversity) {
      return foundUniversity.name;
    }
    
    // If not found, try to get from the userUniversity object itself
    //@ts-ignore
    const userUni = userUniversities.find(u => u.universityId === id || u.university_id === id);
    //@ts-ignore
    if (userUni && userUni.university) {
      //@ts-ignore
      return userUni.university.name;
    }
    
    return id; // Return the ID itself as fallback so we can see what's happening
  };

  return (
    <div className="space-y-6">
      {/* Debug panel - remove in production */}

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Shortlisted ({shortlisted.length})
        </h3>
        <div className="space-y-2">
          {shortlisted.length === 0 ? (
            <p className="text-sm text-gray-500">No universities shortlisted yet</p>
          ) : (
            shortlisted.map(uni => {
              const name = getUniversityName(uni.university_id || uni.university_id);
              console.log('🏫 Rendering shortlisted university:', { 
                id: uni.id, 
                universityId: uni.university_id || uni.university_id,
                name,
                hasUniversity: !!uni.university_id
              });
              
              return (
                <div key={uni.id} className="text-sm text-gray-700 p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="font-medium">{name}</div>
                  {uni.university_id && (
                    <div className="text-xs text-gray-500 mt-1">
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

<div className="bg-white p-4 rounded-lg border border-gray-200 relative opacity-70">
  {/* Coming Soon Badge */}
  <div className="absolute top-3 right-3">
    <span className="text-xs font-semibold px-2 py-1 bg-gray-900 text-white rounded-full">
      Coming Soon
    </span>
  </div>

  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
    🔒 Locked for Application
  </h3>

  <div className="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded p-4 text-center">
    This feature is currently under development.
    <br />
    You’ll be able to lock universities once applications open.
  </div>
</div>

    </div>
  );
}