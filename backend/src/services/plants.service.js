import { prisma } from '../config/prisma.js';

export async function listPlants() {
  const rows = await prisma.plants.findMany({
    select: {
      id: true,
      name: true,
      latin_name: true,
      description: true,
      care_watering_text: true,
      care_lighting_text: true,
      care_temp_text: true,
      water_interval_days: true,
      fertilize_interval_days: true,
      image_url: true,
      difficulty_levels: { select: { name: true } },
      light_types: { select: { name: true } },
    },
    orderBy: { name: 'asc' },
    take: 100,
  });

  return rows.map((plant) => ({
    id: plant.id,
    name: plant.name,
    latinName: plant.latin_name,
    description: plant.description,
    watering: plant.care_watering_text,
    lighting: plant.care_lighting_text,
    temperature: plant.care_temp_text,
    waterIntervalDays: plant.water_interval_days,
    fertilizeIntervalDays: plant.fertilize_interval_days,
    imageUrl: plant.image_url,
    difficulty: plant.difficulty_levels?.name ?? 'Не указана',
    light: plant.light_types?.name ?? 'Не указано',
  }));
}

export async function getPlantById(id) {
  const plant = await prisma.plants.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      latin_name: true,
      description: true,
      care_watering_text: true,
      care_lighting_text: true,
      care_temp_text: true,
      water_interval_days: true,
      fertilize_interval_days: true,
      image_url: true,
      difficulty_levels: { select: { name: true } },
      light_types: { select: { name: true } },
    },
  });

  if (!plant) return null;
  return {
    id: plant.id,
    name: plant.name,
    latinName: plant.latin_name,
    description: plant.description,
    watering: plant.care_watering_text,
    lighting: plant.care_lighting_text,
    temperature: plant.care_temp_text,
    waterIntervalDays: plant.water_interval_days,
    fertilizeIntervalDays: plant.fertilize_interval_days,
    imageUrl: plant.image_url,
    difficulty: plant.difficulty_levels?.name ?? 'Не указана',
    light: plant.light_types?.name ?? 'Не указано',
  };
}

export async function createPlant(data) {
  const name = String(data.name || '').trim();
  if (!name) { const error = new Error('Укажи название растения'); error.status = 400; throw error; }
  const plant = await prisma.plants.create({ data: {
    name,
    latin_name: data.latin_name?.trim() || null,
    description: data.description?.trim() || null,
    care_watering_text: data.care_watering_text?.trim() || null,
    care_lighting_text: data.care_lighting_text?.trim() || null,
    care_temp_text: data.care_temp_text?.trim() || null,
  }, select: { id: true, name: true, latin_name: true, description: true, care_watering_text: true, care_lighting_text: true, care_temp_text: true } });
  return plant;
}
