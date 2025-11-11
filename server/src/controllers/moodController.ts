import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { moodLogSchema } from '../utils/validation';

const prisma = new PrismaClient();

export const logMood = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validatedData = moodLogSchema.parse(req.body);
    const userId = req.userId!;
    const { date, mood, journal } = validatedData;

    const logDate = date ? new Date(date) : new Date();
    logDate.setHours(0, 0, 0, 0); // Normalize to start of day

    // Check if log exists for this date
    const existingLog = await prisma.dailyLog.findUnique({
      where: {
        userId_date: {
          userId,
          date: logDate,
        },
      },
    });

    let dailyLog;
    if (existingLog) {
      dailyLog = await prisma.dailyLog.update({
        where: { id: existingLog.id },
        data: { mood, journal },
      });
    } else {
      dailyLog = await prisma.dailyLog.create({
        data: {
          userId,
          date: logDate,
          mood,
          journal,
        },
      });
    }

    res.json({ dailyLog });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMoodLogs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { startDate, endDate } = req.query;

    const whereClause: any = { userId };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate as string);
      if (endDate) whereClause.date.lte = new Date(endDate as string);
    }

    const logs = await prisma.dailyLog.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInsights = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const days = parseInt(req.query.days as string) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get mood logs
    const moodLogs = await prisma.dailyLog.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    // Get all goals progress
    const goals = await prisma.goal.findMany({
      where: { userId, isActive: true },
      include: {
        progress: {
          where: { date: { gte: startDate } },
          orderBy: { date: 'asc' },
        },
      },
    });

    // Calculate daily completion rates
    const insights = [];
    const currentDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];

      // Find mood for this day
      const moodLog = moodLogs.find(
        (log) => log.date.toISOString().split('T')[0] === dateStr
      );

      // Calculate completion rate for this day
      let completedGoals = 0;
      let totalGoals = goals.length;

      goals.forEach((goal) => {
        const progress = goal.progress.find(
          (p) => p.date.toISOString().split('T')[0] === dateStr
        );

        if (progress) {
          if (goal.type === 'HABIT' && progress.completed) {
            completedGoals++;
          } else if (goal.type === 'METRIC' && progress.value) {
            completedGoals++;
          } else if (goal.type === 'TIME' && progress.minutes) {
            completedGoals++;
          }
        }
      });

      const completionRate =
        totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

      insights.push({
        date: dateStr,
        mood: moodLog?.mood || null,
        completionRate: Math.round(completionRate),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({ insights });
  } catch (error) {
    console.error('Error getting insights:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
