import { Router } from 'express';
import { 
  getAllTrucks, 
  createTruck, 
  getTruckById, 
  updateTruck, 
  deleteTruck,
  downloadAllTrucks,
  downloadDailyTrucks,
  downloadTrucksByDate
} from '../controllers/truckController.js';

const router = Router();

router.get('/', getAllTrucks);
router.post('/', createTruck);
router.get('/download/all', downloadAllTrucks);
router.get('/download/daily', downloadDailyTrucks);
router.get('/download/:date', downloadTrucksByDate);
router.get('/:id', getTruckById);
router.put('/:id', updateTruck);
router.delete('/:id', deleteTruck);

export default router;
