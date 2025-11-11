import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

export const getRewards = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;

    const rewards = await prisma.userReward.findMany({
      where: { userId },
      orderBy: { awardedAt: 'desc' },
    });

    res.json({ rewards });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
