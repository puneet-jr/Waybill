import { Router } from 'express';
import { 
  verifyTruck, 
  getVerificationHistory, 
  getDailyVerifications, 
  getStats,
  downloadAllVerifications,
  downloadDailyVerifications
} from '../controllers/verificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/verify', authenticate, verifyTruck);
router.get('/history', getVerificationHistory);
router.get('/daily', getDailyVerifications);
router.get('/stats', getStats);
router.get('/download/all', downloadAllVerifications);
router.get('/download/daily', downloadDailyVerifications);

export default router;
