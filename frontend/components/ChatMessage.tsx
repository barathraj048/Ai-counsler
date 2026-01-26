// FILE: components/TodoList.tsx

'use client';

import { Task } from '@/types';
import { useState } from 'react';

interface TodoListProps {
  tasks: Task[];
}

export default function TodoList({ tasks }: TodoListProps) {
  const [taskStates, setTaskStates] = useState(
    tasks.map(task => ({ id: task.id, status: task.status }))
  );

  const toggleTask = (taskId: string) => {
    setTaskStates(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
          : task
      )
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Your To-Do List
      </h3>
      <div className="space-y-3">
        {tasks.map(task => {
          const taskState = taskStates.find(t => t.id === task.id);
          const isCompleted = taskState?.status === 'completed';
          
          return (
            <div
              key={task.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={() => toggleTask(task.id)}
                className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    isCompleted ? 'line-through text-gray-400' : 'text-gray-900'
                  }`}
                >
                  {task.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {task.description}
                </p>
                <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                  {task.generated_by === 'AI' ? '🤖 AI Generated' : '📋 System'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}