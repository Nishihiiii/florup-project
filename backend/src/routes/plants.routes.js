import { Router } from 'express';
import { getPlant, getPlants } from '../controllers/plants.controller.js';

const router = Router();
router.get('/', getPlants);
router.get('/:id', getPlant);
export default router;
