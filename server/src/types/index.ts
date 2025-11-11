import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
}

export interface JWTPayload {
  userId: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateGoalRequest {
  title: string;
  description?: string;
  type: 'HABIT' | 'METRIC' | 'TIME';
  categoryId?: string;
  targetValue?: number;
  unit?: string;
  targetMinutes?: number;
}

export interface LogProgressRequest {
  goalId: string;
  date?: string;
  completed?: boolean;
  value?: number;
  minutes?: number;
  notes?: string;
}

export interface MoodLogRequest {
  date?: string;
  mood: number; // 1-5
  journal?: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  date: string;
}
