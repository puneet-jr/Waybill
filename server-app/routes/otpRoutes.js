import express from 'express';
import { sendOTP, verifyOTP } from '../controllers/otpController.js';
import { validateOTP } from '../middleware/validation.js';

const router = express.Router();

router.post('/send', validateOTP, sendOTP);
router.post('/verify', validateOTP, verifyOTP);

export default router;
