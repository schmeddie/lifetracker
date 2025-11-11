import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

const escapeCSV = (value: any): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const exportData = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;

    // Fetch all user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    const goals = await prisma.goal.findMany({
      where: { userId },
      include: {
        category: true,
        progress: true,
      },
    });

    const moodLogs = await prisma.dailyLog.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    const rewards = await prisma.userReward.findMany({
      where: { userId },
      orderBy: { awardedAt: 'desc' },
    });

    // Build CSV content
    let csv = '';

    // User Info Section
    csv += 'USER INFORMATION\n';
    csv += 'Email,Name\n';
    csv += `${escapeCSV(user?.email)},${escapeCSV(user?.name)}\n\n`;

    // Goals Section
    csv += 'GOALS\n';
    csv +=
      'Title,Type,Category,Description,Target Value,Unit,Target Minutes,Current Streak,Longest Streak,Total Progress,Active,Created At\n';
    goals.forEach((goal) => {
      csv += `${escapeCSV(goal.title)},${escapeCSV(goal.type)},${escapeCSV(
        goal.category?.name
      )},${escapeCSV(goal.description)},${escapeCSV(
        goal.targetValue
      )},${escapeCSV(goal.unit)},${escapeCSV(
        goal.targetMinutes
      )},${escapeCSV(goal.currentStreak)},${escapeCSV(
        goal.longestStreak
      )},${escapeCSV(goal.totalProgress)},${escapeCSV(
        goal.isActive
      )},${escapeCSV(goal.createdAt.toISOString())}\n`;
    });
    csv += '\n';

    // Goal Progress Section
    csv += 'GOAL PROGRESS\n';
    csv += 'Goal Title,Date,Completed,Value,Minutes,Notes\n';
    goals.forEach((goal) => {
      goal.progress.forEach((p) => {
        csv += `${escapeCSV(goal.title)},${escapeCSV(
          p.date.toISOString().split('T')[0]
        )},${escapeCSV(p.completed)},${escapeCSV(p.value)},${escapeCSV(
          p.minutes
        )},${escapeCSV(p.notes)}\n`;
      });
    });
    csv += '\n';

    // Mood Logs Section
    csv += 'MOOD LOGS\n';
    csv += 'Date,Mood,Journal\n';
    moodLogs.forEach((log) => {
      csv += `${escapeCSV(log.date.toISOString().split('T')[0])},${escapeCSV(
        log.mood
      )},${escapeCSV(log.journal)}\n`;
    });
    csv += '\n';

    // Rewards Section
    csv += 'REWARDS\n';
    csv += 'Badge Type,Goal Title,Streak Days,Awarded At\n';
    rewards.forEach((reward) => {
      csv += `${escapeCSV(reward.badgeType)},${escapeCSV(
        reward.goalTitle
      )},${escapeCSV(reward.streakDays)},${escapeCSV(
        reward.awardedAt.toISOString()
      )}\n`;
    });

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="lifetracker-export-${new Date().toISOString().split('T')[0]}.csv"`
    );

    res.send(csv);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
