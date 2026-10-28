import { Router } from 'express';
import { getPlant, getPlants, postPlant } from '../controllers/plants.controller.js';

const router = Router();
router.get('/', getPlants);
router.post('/', postPlant);
router.get('/:id', getPlant);
export default router;
