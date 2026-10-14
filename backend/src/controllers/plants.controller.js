import { getPlantById, listPlants } from '../services/plants.service.js';

export async function getPlants(_req, res, next) {
  try {
    res.json(await listPlants());
  } catch (error) {
    next(error);
  }
}

export async function getPlant(req, res, next) {
  try {
    const plant = await getPlantById(req.params.id);
    if (!plant) return res.status(404).json({ error: 'Растение не найдено' });
    return res.json(plant);
  } catch (error) {
    next(error);
  }
}
