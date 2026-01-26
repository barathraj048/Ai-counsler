// FILE: lib/dummy-data.ts

import { User, Profile, University, UserUniversity, Task, ChatMessage } from '@/types';

export const dummyUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  created_at: '2024-01-15T10:00:00Z'
};

export const dummyProfile: Profile = {
  id: '1',
  user_id: '1',
  
  education_level: 'Bachelor',
  degree: 'Computer Science',
  graduation_year: 2024,
  gpa: 3.7,
  
  target_degree: 'Master',
  field_of_study: 'Artificial Intelligence',
  intake_year: 2025,
  preferred_countries: ['USA', 'Canada', 'UK'],
  
  budget_min: 30000,
  budget_max: 60000,
  funding_type: 'Self-funded',
  
  ielts_status: 'completed',
  gre_status: 'planned',
  sop_status: 'not_started',
  
  profile_strength: 75,
  current_stage: 3
};

export const dummyUniversities: University[] = [
  {
    id: '1',
    name: 'Stanford University',
    country: 'USA',
    degree_type: 'Master',
    field: 'Computer Science',
    avg_cost: 55000,
    competitiveness: 'Very High'
  },
  {
    id: '2',
    name: 'University of Toronto',
    country: 'Canada',
    degree_type: 'Master',
    field: 'Computer Science',
    avg_cost: 35000,
    competitiveness: 'High'
  },
  {
    id: '3',
    name: 'Imperial College London',
    country: 'UK',
    degree_type: 'Master',
    field: 'Computer Science',
    avg_cost: 42000,
    competitiveness: 'High'
  },
  {
    id: '4',
    name: 'University of Waterloo',
    country: 'Canada',
    degree_type: 'Master',
    field: 'Computer Science',
    avg_cost: 32000,
    competitiveness: 'Medium'
  },
  {
    id: '5',
    name: 'Carnegie Mellon University',
    country: 'USA',
    degree_type: 'Master',
    field: 'Computer Science',
    avg_cost: 58000,
    competitiveness: 'Very High'
  },
  {
    id: '6',
    name: 'University of Edinburgh',
    country: 'UK',
    degree_type: 'Master',
    field: 'Computer Science',
    avg_cost: 38000,
    competitiveness: 'Medium'
  }
];

export const dummyUserUniversities: UserUniversity[] = [
  {
    id: '1',
    user_id: '1',
    university_id: '2',
    status: 'shortlisted',
    risk_level: 'Low',
    acceptance_chance: 75
  },
  {
    id: '2',
    user_id: '1',
    university_id: '4',
    status: 'locked',
    risk_level: 'Low',
    acceptance_chance: 80
  },
  {
    id: '3',
    user_id: '1',
    university_id: '1',
    status: 'shortlisted',
    risk_level: 'High',
    acceptance_chance: 30
  }
];

export const dummyTasks: Task[] = [
  {
    id: '1',
    user_id: '1',
    title: 'Complete GRE registration',
    description: 'Register for GRE exam before March 2025',
    status: 'pending',
    generated_by: 'AI'
  },
  {
    id: '2',
    user_id: '1',
    title: 'Draft Statement of Purpose',
    description: 'Write first draft of SOP for review',
    status: 'pending',
    generated_by: 'AI'
  },
  {
    id: '3',
    user_id: '1',
    title: 'Request Letter of Recommendation',
    description: 'Contact Professor Smith for LOR',
    status: 'completed',
    generated_by: 'system'
  },
  {
    id: '4',
    user_id: '1',
    title: 'Prepare financial documents',
    description: 'Gather bank statements and sponsor letters',
    status: 'pending',
    generated_by: 'AI'
  }
];

export const dummyChatMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! I\'m your AI counsellor. I can help you discover universities, build your shortlist, and guide you through the application process. What would you like to work on today?',
    timestamp: '2024-01-20T10:00:00Z'
  },
  {
    id: '2',
    role: 'user',
    content: 'I want to find universities that match my profile',
    timestamp: '2024-01-20T10:01:00Z'
  },
  {
    id: '3',
    role: 'assistant',
    content: 'Based on your profile, I recommend starting with universities in Canada and the UK that have strong AI programs within your budget. I\'ve added University of Toronto and University of Waterloo to your shortlist. Would you like me to find more options?',
    timestamp: '2024-01-20T10:02:00Z'
  }
];

export const stageNames = [
  'Profile Setup',
  'AI Counselling',
  'University Discovery',
  'Shortlisting',
  'University Locking',
  'Application Preparation',
  'Document Submission',
  'Application Complete'
];

export const documentChecklist = [
  {
    id: '1',
    name: 'Statement of Purpose',
    status: 'pending',
    deadline: '2025-03-15'
  },
  {
    id: '2',
    name: 'Letters of Recommendation (2)',
    status: 'pending',
    deadline: '2025-03-15'
  },
  {
    id: '3',
    name: 'Official Transcripts',
    status: 'completed',
    deadline: '2025-03-01'
  },
  {
    id: '4',
    name: 'IELTS Score Report',
    status: 'completed',
    deadline: '2025-03-01'
  },
  {
    id: '5',
    name: 'Financial Documents',
    status: 'pending',
    deadline: '2025-03-20'
  },
  {
    id: '6',
    name: 'Resume/CV',
    status: 'pending',
    deadline: '2025-03-10'
  }
];