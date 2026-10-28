import { Router } from 'express';
import { getProblems, postProblem } from '../controllers/problems.controller.js';

const router = Router();
router.get('/', getProblems);
router.post('/', postProblem);
export default router;
