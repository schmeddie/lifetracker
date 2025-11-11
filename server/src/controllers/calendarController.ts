import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { createEventSchema } from '../utils/validation';

const prisma = new PrismaClient();

// UK Public Holidays 2025-2026 (can be extended or fetched from an API)
const UK_HOLIDAYS_2025 = [
  { title: "New Year's Day", date: '2025-01-01' },
  { title: 'Good Friday', date: '2025-04-18' },
  { title: 'Easter Monday', date: '2025-04-21' },
  { title: 'Early May Bank Holiday', date: '2025-05-05' },
  { title: 'Spring Bank Holiday', date: '2025-05-26' },
  { title: 'Summer Bank Holiday', date: '2025-08-25' },
  { title: 'Christmas Day', date: '2025-12-25' },
  { title: 'Boxing Day', date: '2025-12-26' },
];

const UK_HOLIDAYS_2026 = [
  { title: "New Year's Day", date: '2026-01-01' },
  { title: 'Good Friday', date: '2026-04-03' },
  { title: 'Easter Monday', date: '2026-04-06' },
  { title: 'Early May Bank Holiday', date: '2026-05-04' },
  { title: 'Spring Bank Holiday', date: '2026-05-25' },
  { title: 'Summer Bank Holiday', date: '2026-08-31' },
  { title: 'Christmas Day', date: '2026-12-25' },
  { title: 'Boxing Day', date: '2026-12-28' },
];

export const seedUKHolidays = async (): Promise<void> => {
  const allHolidays = [...UK_HOLIDAYS_2025, ...UK_HOLIDAYS_2026];

  for (const holiday of allHolidays) {
    const existingHoliday = await prisma.calendarEvent.findFirst({
      where: {
        title: holiday.title,
        date: new Date(holiday.date),
        eventType: 'UK_HOLIDAY',
        userId: null,
      },
    });

    if (!existingHoliday) {
      await prisma.calendarEvent.create({
        data: {
          title: holiday.title,
          date: new Date(holiday.date),
          eventType: 'UK_HOLIDAY',
        },
      });
    }
  }
};

export const createEvent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validatedData = createEventSchema.parse(req.body);
    const userId = req.userId!;

    const event = await prisma.calendarEvent.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        userId,
        eventType: 'CUSTOM',
      },
    });

    res.status(201).json({ event });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEvents = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { startDate, endDate } = req.query;

    const whereClause: any = {
      OR: [{ userId }, { eventType: 'UK_HOLIDAY' }],
    };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate as string);
      if (endDate) whereClause.date.lte = new Date(endDate as string);
    }

    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
    });

    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteEvent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Verify ownership (can't delete UK holidays)
    const event = await prisma.calendarEvent.findFirst({
      where: { id, userId },
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (event.eventType === 'UK_HOLIDAY') {
      res.status(403).json({ error: 'Cannot delete UK holidays' });
      return;
    }

    await prisma.calendarEvent.delete({
      where: { id },
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
