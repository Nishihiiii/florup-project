import { listProblems } from '../services/problems.service.js';

export async function getProblems(_req, res, next) {
  try {
    res.json(await listProblems());
  } catch (error) {
    next(error);
  }
}
