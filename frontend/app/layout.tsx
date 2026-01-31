// FILE: app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';
import { UniversityProvider, useUniversities } from '@/components/contexts/UniversityContext';

export const metadata: Metadata = {
  title: 'AI Counsellor - Plan Your Study Abroad Journey',
  description: 'Get personalized university recommendations and application guidance with AI-powered counselling',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UniversityProvider userId="user_123">
      <html lang="en">
        <body className="antialiased bg-gray-50">
          {children}
        </body>
      </html>
    </UniversityProvider>
  );
}