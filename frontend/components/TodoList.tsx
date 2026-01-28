'use client';

interface Todo {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export default function TodoList({ tasks }: { tasks: Todo[] }) {
  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="font-semibold mb-4">Next Steps</h3>
      <ul className="space-y-3">
        {tasks.map((t) => (
          <li key={t.id} className="flex gap-3">
            <input type="checkbox" checked={t.completed} readOnly />
            <span>{t.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
