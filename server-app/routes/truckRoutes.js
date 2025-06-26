import express from 'express';
import { registerTruck, getTrucks, getTruckByNumber } from '../controllers/truckController.js';
import { auth } from '../middleware/auth.js';
import { validateTruck } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', auth, validateTruck, registerTruck);
router.post('/add', validateTruck, registerTruck); // New public route for adding trucks
router.get('/', auth, getTrucks);
router.get('/:truckNumber', auth, getTruckByNumber);

export default router;
