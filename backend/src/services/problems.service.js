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
