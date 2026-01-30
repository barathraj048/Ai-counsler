// components/UnifiedTodoList.tsx

'use client';

import { useState, useTransition, useEffect } from 'react';
import { CheckCircle2, Circle, AlertCircle, Clock, Plus, Trash2 } from 'lucide-react';

interface Todo {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  createdAt?: string;
}

interface UnifiedTodoListProps {
  userId: string;
  variant?: 'dashboard' | 'counselor'; // Controls styling
  showAddButton?: boolean;
  onAddTodo?: (title: string, priority: string) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function UnifiedTodoList({ 
  userId, 
  variant = 'dashboard',
  showAddButton = true,
  onAddTodo 
}: UnifiedTodoListProps) {
  const [taskList, setTaskList] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showCompleted, setShowCompleted] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, [userId]);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/api/dashboard/todos/${userId}`);
      
      if (!response.ok) throw new Error('Failed to fetch todos');
      
      const data = await response.json();
      setTaskList(data.todos || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    // Optimistic update
    setTaskList(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );

    startTransition(async () => {
      try {
        const response = await fetch(`${API_BASE}/api/dashboard/todos/${taskId}/toggle`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) throw new Error('Failed to toggle todo');

        const data = await response.json();
        
        // Update with server response
        setTaskList(prev =>
          prev.map(task => task.id === taskId ? data.todo : task)
        );
      } catch (error) {
        // Revert on error
        setTaskList(prev =>
          prev.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        );
        console.error('Failed to update task:', error);
      }
    });
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/api/dashboard/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: newTaskTitle,
          priority: newTaskPriority,
        }),
      });

      if (!response.ok) throw new Error('Failed to create todo');

      const data = await response.json();
      setTaskList(prev => [data.todo, ...prev]);
      setNewTaskTitle('');
      setNewTaskPriority('medium');
      setShowAddForm(false);

      if (onAddTodo) {
        onAddTodo(newTaskTitle, newTaskPriority);
      }
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  const handleDeleteTodo = async (taskId: string) => {
    // Optimistic delete
    setTaskList(prev => prev.filter(task => task.id !== taskId));

    try {
      const response = await fetch(`${API_BASE}/api/dashboard/todos/${taskId}?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      // Refetch to restore on error
      fetchTodos();
    }
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

  const activeTasks = taskList.filter(t => !t.completed);
  const completedTasks = taskList.filter(t => t.completed);
  const completionRate = taskList.length > 0 
    ? Math.round((completedTasks.length / taskList.length) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Dashboard variant (with circular progress)
  if (variant === 'dashboard') {
    return (
      <div className="space-y-6">
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

          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-100" />
                <circle
                  cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none"
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

          {showAddButton && (
            <>
              {!showAddForm ? (
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add New Task
                </button>
              ) : (
                <form onSubmit={handleAddTodo} className="space-y-3">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Add Task
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewTaskTitle('');
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {activeTasks.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
              To Do ({activeTasks.length})
            </h4>
            <div className="space-y-2">
              {activeTasks.map(task => {
                const styles = getPriorityStyles(task.priority);
                return (
                  <div key={task.id} className="group relative">
                    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50/80 transition-all duration-200 border border-transparent hover:border-gray-200">
                      <button
                        onClick={() => handleToggleComplete(task.id)}
                        disabled={isPending}
                        className="flex-shrink-0 mt-0.5 disabled:opacity-50"
                      >
                        <Circle className="w-6 h-6 text-gray-300 group-hover:text-blue-400 transition-colors" />
                      </button>
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
                      <button
                        onClick={() => handleDeleteTodo(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50 shadow-sm">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="w-full flex items-center justify-between mb-4"
            >
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Completed ({completedTasks.length})
              </h4>
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${showCompleted ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showCompleted && (
              <div className="space-y-2">
                {completedTasks.map(task => (
                  <div key={task.id} className="group relative">
                    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50/80 transition-all duration-200 border border-transparent hover:border-gray-200">
                      <button
                        onClick={() => handleToggleComplete(task.id)}
                        disabled={isPending}
                        className="flex-shrink-0 mt-0.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-500 line-through">{task.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            ✓ Done
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTodo(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {taskList.length === 0 && (
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

  // Counselor variant (simplified)
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Your To-Do List
      </h3>

      {taskList.length === 0 ? (
        <p className="text-sm text-gray-500">
          No tasks yet. Tasks generated by your counselor will appear here 🎯
        </p>
      ) : (
        <div className="space-y-3">
          {taskList.map(task => {
            const isCompleted = task.completed;

            return (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => handleToggleComplete(task.id)}
                  className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300"
                />

                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      isCompleted
                        ? 'line-through text-gray-400'
                        : 'text-gray-900'
                    }`}
                  >
                    {task.title}
                  </p>

                  <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                    task.priority === 'high' 
                      ? 'bg-red-50 text-red-700'
                      : task.priority === 'medium'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-blue-50 text-blue-700'
                  }`}>
                    {task.priority} priority
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}