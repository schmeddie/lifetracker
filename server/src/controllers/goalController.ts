import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { createGoalSchema } from '../utils/validation';

const prisma = new PrismaClient();

export const createGoal = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validatedData = createGoalSchema.parse(req.body);
    const userId = req.userId!;

    const goal = await prisma.goal.create({
      data: {
        ...validatedData,
        userId,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json({ goal });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGoals = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { active } = req.query;

    const goals = await prisma.goal.findMany({
      where: {
        userId,
        ...(active !== undefined && { isActive: active === 'true' }),
      },
      include: {
        category: true,
        progress: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ goals });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGoal = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        category: true,
        progress: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    res.json({ goal });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateGoal = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Verify ownership
    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existingGoal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const goal = await prisma.goal.update({
      where: { id },
      data: req.body,
      include: {
        category: true,
      },
    });

    res.json({ goal });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteGoal = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Verify ownership
    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existingGoal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    await prisma.goal.delete({
      where: { id },
    });

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
