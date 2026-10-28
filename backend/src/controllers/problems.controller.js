import { createProblem, listProblems } from '../services/problems.service.js';

export async function getProblems(_req, res, next) {
  try {
    res.json(await listProblems());
  } catch (error) {
    next(error);
  }
}

export async function postProblem(req, res, next) {
  try { res.status(201).json(await createProblem(req.body || {})); }
  catch (error) { next(error); }
}
