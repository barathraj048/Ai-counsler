// frontend/components/TodoList.tsx
'use client';

import { useState, useTransition ,useEffect} from 'react';
import { CheckCircle2, Circle, AlertCircle, Clock, Plus } from 'lucide-react';

interface Todo {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface TodoListProps {
  tasks: Todo[];
  userId: string;
}

// Based on your app.ts: app.use('/api/dashboard', dashboardRoutes)
// Your endpoints are: /api/dashboard/todos/:id/toggle
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const TODO_ENDPOINT = `${API_BASE}/api/dashboard/todos`;

export default function TodoList({ tasks: initialTasks, userId }: TodoListProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isPending, startTransition] = useTransition();
  const [showCompleted, setShowCompleted] = useState(true);

useEffect(() => {
  setTasks(initialTasks);
}, [initialTasks]);

const handleToggleComplete = async (taskId: string) => {
  // optimistic update
  setTasks(prev =>
    prev.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    )
  );

  startTransition(async () => {
    try {
      const res = await fetch(`${TODO_ENDPOINT}/${taskId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error();

      const json = await res.json();

      // 🔥 sync with DB truth
      setTasks(prev =>
        prev.map(t =>
          t.id === taskId ? json.data : t
        )
      );
    } catch {
      // rollback
      setTasks(prev =>
        prev.map(t =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        )
      );
    }
  });
};


  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          icon: <AlertCircle className="w-4 h-4" />
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
          icon: <Clock className="w-4 h-4" />
        };
      case 'low':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          icon: <Circle className="w-4 h-4" />
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
          icon: <Circle className="w-4 h-4" />
        };
    }
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const completionRate = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Todo Header Card */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Your Tasks</h3>
            <p className="text-sm text-gray-600 mt-1">
              {activeTasks.length} active • {completedTasks.length} completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{completionRate}%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-100"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - completionRate / 100)}`}
                className="text-blue-500 transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{activeTasks.length}</div>
                <div className="text-xs text-gray-500">tasks left</div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Task Button */}
        <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Task
        </button>
      </div>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
            To Do ({activeTasks.length})
          </h4>
          <div className="space-y-2">
            {activeTasks.map(task => {
              const styles = getPriorityStyles(task.priority);
              return (
                <div
                  key={task.id}
                  className="group relative"
                >
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    disabled={isPending}
                    className="w-full text-left p-4 rounded-xl hover:bg-gray-50/80 transition-all duration-200 border border-transparent hover:border-gray-200 disabled:opacity-50"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-0.5">
                        <Circle className="w-6 h-6 text-gray-300 group-hover:text-blue-400 transition-colors" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${styles.bg} ${styles.text} ${styles.border} border`}>
                            {styles.icon}
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50 shadow-sm">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full flex items-center justify-between mb-4"
          >
            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Completed ({completedTasks.length})
            </h4>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                showCompleted ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showCompleted && (
            <div className="space-y-2">
              {completedTasks.map(task => (
                <div
                  key={task.id}
                  className="group relative"
                >
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    disabled={isPending}
                    className="w-full text-left p-4 rounded-xl hover:bg-gray-50/80 transition-all duration-200 border border-transparent hover:border-gray-200 disabled:opacity-50"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-500 line-through">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            ✓ Done
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="bg-white/80 backdrop-blur-xl p-12 rounded-2xl border border-gray-200/50 shadow-sm text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h4>
          <p className="text-gray-600 text-sm">No tasks to display. Add a new task to get started.</p>
        </div>
      )}
    </div>
  );
}