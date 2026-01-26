// FILE: types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  
  // Academic
  education_level: string;
  degree: string;
  graduation_year: number;
  gpa: number;
  
  // Goals
  target_degree: string;
  field_of_study: string;
  intake_year: number;
  preferred_countries: string[];
  
  // Budget
  budget_min: number;
  budget_max: number;
  funding_type: string;
  
  // Exams
  ielts_status: string;
  gre_status: string;
  sop_status: string;
  
  // Progress
  profile_strength: number;
  current_stage: number;
}

export interface University {
  id: string;
  name: string;
  country: string;
  degree_type: string;
  field: string;
  avg_cost: number;
  competitiveness: string;
}

export interface UserUniversity {
  id: string;
  user_id: string;
  university_id: string;
  status: 'shortlisted' | 'locked';
  risk_level: string;
  acceptance_chance: number;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  generated_by: 'AI' | 'system';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}