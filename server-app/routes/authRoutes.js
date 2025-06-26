import express from 'express';
import { register, login } from '../controllers/authController.js';
import { validateAuth } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validateAuth, register);
router.post('/login', validateAuth, login);

export default router;
