// FILE: components/QuestionRenderer.tsx

'use client';

import { useState } from 'react';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'select' | 'multiselect' | 'number';
  options?: string[];
  placeholder?: string;
}

interface QuestionRendererProps {
  question: Question;
  onSubmit: (answer: any) => Promise<void>;
  isLoading: boolean;
}

export default function QuestionRenderer({ question, onSubmit, isLoading }: QuestionRendererProps) {
  const [answer, setAnswer] = useState<any>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (question.type === 'multiselect') {
      if (selectedOptions.length === 0) return;
      await onSubmit(selectedOptions);
    } else {
      if (!answer || answer.toString().trim() === '') return;
      await onSubmit(answer);
    }
    
    // Reset form
    setAnswer('');
    setSelectedOptions([]);
  };

  const toggleMultiselect = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(o => o !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-lg font-medium text-gray-900 mb-4">
          {question.text}
        </label>

        {question.type === 'text' && (
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={question.placeholder || 'Type your answer...'}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            autoFocus
          />
        )}

        {question.type === 'number' && (
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={question.placeholder || 'Enter a number...'}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            autoFocus
          />
        )}

        {question.type === 'select' && (
          <select
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            autoFocus
          >
            <option value="">Select an option...</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}

        {question.type === 'multiselect' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options?.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleMultiselect(option)}
                disabled={isLoading}
                className={`px-4 py-3 rounded-md border text-left font-medium transition-colors ${
                  selectedOptions.includes(option)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || (question.type === 'multiselect' ? selectedOptions.length === 0 : !answer)}
        className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed px-6 py-3 rounded-md font-medium text-base transition-colors"
      >
        {isLoading ? 'Processing...' : 'Continue'}
      </button>
    </form>
  );
}