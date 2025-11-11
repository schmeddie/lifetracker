import { Router } from 'express';
import { createEvent, getEvents, deleteEvent } from '../controllers/calendarController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createEvent);
router.get('/', getEvents);
router.delete('/:id', deleteEvent);

export default router;
