export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type GoalType = 'HABIT' | 'METRIC' | 'TIME';

export interface Category {
  id: string;
  name: string;
  color?: string;
  userId: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: GoalType;
  userId: string;
  categoryId?: string;
  category?: Category;
  targetValue?: number;
  unit?: string;
  targetMinutes?: number;
  isActive: boolean;
  currentStreak: number;
  longestStreak: number;
  totalProgress: number;
  createdAt: string;
  updatedAt: string;
  progress?: GoalProgress[];
}

export interface GoalProgress {
  id: string;
  goalId: string;
  date: string;
  completed?: boolean;
  value?: number;
  minutes?: number;
  notes?: string;
  createdAt: string;
}

export interface DailyLog {
  id: string;
  userId: string;
  date: string;
  mood?: number;
  journal?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  date: string;
  eventType: 'UK_HOLIDAY' | 'CUSTOM' | 'MILESTONE';
  createdAt: string;
}

export type BadgeType = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface UserReward {
  id: string;
  userId: string;
  badgeType: BadgeType;
  goalTitle: string;
  streakDays: number;
  awardedAt: string;
}

export interface InsightData {
  date: string;
  mood: number | null;
  completionRate: number;
}
