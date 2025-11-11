import { Router } from 'express';
import { logMood, getMoodLogs, getInsights } from '../controllers/moodController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', logMood);
router.get('/', getMoodLogs);
router.get('/insights/data', getInsights);

export default router;
