import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(['HABIT', 'METRIC', 'TIME']),
  categoryId: z.string().uuid().optional(),
  targetValue: z.number().positive().optional(),
  unit: z.string().max(20).optional(),
  targetMinutes: z.number().positive().optional(),
});

export const logProgressSchema = z.object({
  goalId: z.string().uuid(),
  date: z.string().datetime().optional(),
  completed: z.boolean().optional(),
  value: z.number().optional(),
  minutes: z.number().positive().optional(),
  notes: z.string().max(500).optional(),
});

export const moodLogSchema = z.object({
  date: z.string().datetime().optional(),
  mood: z.number().int().min(1).max(5),
  journal: z.string().max(500).optional(),
});

export const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  date: z.string().datetime(),
});
