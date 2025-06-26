import express from 'express';
import { createWaybill, verifyWaybill, getWaybills, scanWaybill, getWaybillDetails } from '../controllers/waybillController.js';
import { auth } from '../middleware/auth.js';
import { validateWaybill } from '../middleware/validation.js';

const router = express.Router();

router.post('/', auth, validateWaybill, createWaybill);
router.put('/:waybillId/verify', auth, verifyWaybill);
router.post('/scan', scanWaybill); // New route for OTP-based scanning
router.get('/:waybillNumber/details', getWaybillDetails); // New route to get waybill details
router.get('/', auth, getWaybills);

export default router;
