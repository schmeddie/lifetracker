import { Router } from 'express';
import { getRewards } from '../controllers/rewardController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getRewards);

export default router;
