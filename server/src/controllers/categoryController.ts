import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { z } from 'zod';

const prisma = new PrismaClient();

const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().max(20).optional(),
});

export const createCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validatedData = createCategorySchema.parse(req.body);
    const userId = req.userId!;

    const category = await prisma.category.create({
      data: {
        ...validatedData,
        userId,
      },
    });

    res.status(201).json({ category });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors });
      return;
    }
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Category name already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCategories = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;

    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: { goals: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Verify ownership
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    await prisma.category.delete({
      where: { id },
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
