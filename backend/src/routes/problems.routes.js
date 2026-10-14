import { Router } from 'express';
import { getProblems } from '../controllers/problems.controller.js';

const router = Router();
router.get('/', getProblems);
export default router;
