import { prisma } from '../config/prisma.js';

export async function listProblems() {
  const rows = await prisma.plant_problems.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      treatment: true,
      problem_types: { select: { name: true } },
      problem_symptom_relations: {
        select: { symptoms: { select: { name: true } } },
      },
    },
    orderBy: { name: 'asc' },
    take: 100,
  });

  return rows.map((problem) => ({
    id: problem.id,
    name: problem.name,
    description: problem.description,
    treatment: problem.treatment,
    type: problem.problem_types?.name ?? 'Проблема растения',
    symptoms: problem.problem_symptom_relations.map((item) => item.symptoms.name),
  }));
}

export async function createProblem(data) {
  const name = String(data.name || '').trim();
  const description = String(data.description || '').trim();
  const treatment = String(data.treatment || '').trim();
  if (!name || !description || !treatment) { const error = new Error('Заполни название, описание и рекомендации по лечению'); error.status = 400; throw error; }
  const type = await prisma.problem_types.findFirst({ orderBy: { id: 'asc' } });
  if (!type) { const error = new Error('В таблице problem_types нет типов проблем. Добавь хотя бы один тип в БД и повтори попытку.'); error.status = 400; throw error; }
  return prisma.plant_problems.create({ data: { name, description, treatment, problem_type_id: type.id }, select: { id: true, name: true, description: true, treatment: true, problem_type_id: true } });
}
