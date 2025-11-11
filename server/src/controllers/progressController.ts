import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { logProgressSchema } from '../utils/validation';

const prisma = new PrismaClient();

// Helper function to check and award badges
const checkAndAwardBadge = async (
  userId: string,
  goalId: string,
  goalTitle: string,
  streak: number
) => {
  const badgeMilestones = [
    { days: 7, type: 'BRONZE' as const },
    { days: 30, type: 'SILVER' as const },
    { days: 100, type: 'GOLD' as const },
    { days: 365, type: 'PLATINUM' as const },
  ];

  for (const milestone of badgeMilestones) {
    if (streak === milestone.days) {
      await prisma.userReward.create({
        data: {
          userId,
          badgeType: milestone.type,
          goalTitle,
          streakDays: streak,
        },
      });
    }
  }
};

export const logProgress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validatedData = logProgressSchema.parse(req.body);
    const userId = req.userId!;
    const { goalId, date, completed, value, minutes, notes } = validatedData;

    // Verify goal ownership
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const progressDate = date ? new Date(date) : new Date();
    progressDate.setHours(0, 0, 0, 0); // Normalize to start of day

    // Check if progress already exists for this date
    const existingProgress = await prisma.goalProgress.findUnique({
      where: {
        goalId_date: {
          goalId,
          date: progressDate,
        },
      },
    });

    let progress;
    if (existingProgress) {
      progress = await prisma.goalProgress.update({
        where: { id: existingProgress.id },
        data: {
          completed,
          value,
          minutes,
          notes,
        },
      });
    } else {
      progress = await prisma.goalProgress.create({
        data: {
          goalId,
          date: progressDate,
          completed,
          value,
          minutes,
          notes,
        },
      });
    }

    // Update goal statistics
    let newStreak = goal.currentStreak;
    let newLongestStreak = goal.longestStreak;
    let totalProgress = goal.totalProgress;

    if (goal.type === 'HABIT' && completed) {
      // Calculate streak for habit goals
      const yesterday = new Date(progressDate);
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdayProgress = await prisma.goalProgress.findUnique({
        where: {
          goalId_date: {
            goalId,
            date: yesterday,
          },
        },
      });

      if (yesterdayProgress?.completed || goal.currentStreak === 0) {
        newStreak = goal.currentStreak + 1;
      } else {
        newStreak = 1; // Reset streak
      }

      newLongestStreak = Math.max(newLongestStreak, newStreak);

      // Check for badge awards
      await checkAndAwardBadge(userId, goalId, goal.title, newStreak);
    } else if (goal.type === 'METRIC' && value !== undefined) {
      totalProgress = goal.totalProgress + value;
    } else if (goal.type === 'TIME' && minutes !== undefined) {
      totalProgress = goal.totalProgress + minutes;
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        totalProgress,
      },
    });

    res.json({ progress, goal: updatedGoal });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors });
      return;
    }
    console.error('Error logging progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProgress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { goalId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify goal ownership
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const whereClause: any = { goalId };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate as string);
      if (endDate) whereClause.date.lte = new Date(endDate as string);
    }

    const progress = await prisma.goalProgress.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    res.json({ progress });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
