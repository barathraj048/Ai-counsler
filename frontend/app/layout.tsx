// FILE: app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}