import { Router } from 'express';
import { logProgress, getProgress } from '../controllers/progressController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', logProgress);
router.get('/:goalId', getProgress);

export default router;
