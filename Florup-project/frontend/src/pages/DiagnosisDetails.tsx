import Placeholder from '../components/Placeholder.tsx';
import type { DiagnosisCardItem, PageId, Plant, Problem } from '../types.ts';

interface DiagnosisDetailsProps {
  selectedProblem: DiagnosisCardItem | null;
  problems: Problem[];
  setSelectedPlant: (p: Plant) => void;
  go: (next: PageId) => void;
}

export default function DiagnosisDetails({
  selectedProblem,
  problems = [],
  setSelectedPlant,
  go,
}: DiagnosisDetailsProps) {
  const fallback = problems[0];
  const item: DiagnosisCardItem | null =
    selectedProblem ||
    (fallback
      ? {
          id: fallback.id,
          kind: fallback.problem_types?.name || 'Диагностика',
          name: fallback.name,
          image_url: fallback.image_url || '',
          description: fallback.description,
          treatment: fallback.treatment,
          plants: fallback.plants || [],
        }
      : null);

  if (!item) {
    return (
      <main className="mx-auto max-w-[1430px] px-5 py-8 md:px-10">
        <button className="mb-6 text-xs text-tan hover:underline" onClick={() => go('diagnostics')}>
          ← Вернуться к диагностике
        </button>
        <div className="mx-auto max-w-xl rounded-3xl bg-card p-10 text-center dark:bg-[#3b3a30]">
          <h1 className="text-2xl font-black">Информация пока недоступна</h1>
        </div>
      </main>
    );
  }

  const relatedProblems = item.problems || [];
  const treatmentText = item.treatment || relatedProblems[0]?.treatment;
  const affectedPlants = item.plants || [];

  return (
    <main className="mx-auto max-w-[1430px] px-5 py-8 md:px-10">
      <button className="mb-6 text-xs text-tan hover:underline" onClick={() => go('diagnostics')}>
        ← Вернуться к диагностике
      </button>

      <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[360px_1fr]">
        <div className="aspect-[4/5] w-full overflow-hidden rounded-3xl bg-card dark:bg-[#3b3a30]">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <Placeholder label="Фотография симптома" className="h-full w-full" />
          )}
        </div>

        <div>
          <span className="inline-block rounded-full bg-olive px-4 py-1 text-xs font-bold text-cream">
            {item.kind || item.problem_types?.name || 'Диагностика'}
          </span>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">{item.name}</h1>
          <p className="mt-5 text-sm leading-relaxed text-ink/80 dark:text-[#f1e6d1]/85">
            {item.description || 'Подробное описание симптома будет дополнено.'}
          </p>

          <button
            onClick={() => go('map')}
            className="mt-8 rounded-full bg-ink px-7 py-3 text-xs font-bold text-cream hover:opacity-90"
          >
            Найти средства защиты на карте →
          </button>
        </div>
      </div>

      <h2 className="mb-4 mt-12 text-2xl font-extrabold">Рекомендации и лечение</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article className="rounded-3xl bg-card p-6 dark:bg-[#3b3a30]">
          <h3 className="mb-2 text-base font-bold">Что делать</h3>
          <p className="text-xs leading-relaxed text-ink/75 dark:text-[#f1e6d1]/80">
            {treatmentText ||
              'Изолируйте растение, осмотрите корни и листья и при необходимости примените профильный препарат.'}
          </p>
        </article>

        <article className="rounded-3xl bg-card p-6 dark:bg-[#3b3a30]">
          <h3 className="mb-2 text-base font-bold">Возможные причины / болезни</h3>
          {relatedProblems.length > 0 ? (
            <ul className="space-y-2 text-xs text-ink/80 dark:text-[#f1e6d1]/80">
              {relatedProblems.map((p) => (
                <li key={p.id}>
                  <strong>• {p.name}:</strong> {p.description}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-ink/75 dark:text-[#f1e6d1]/80">
              Проверьте режим полива, влажность воздуха и отсутствие вредителей.
            </p>
          )}
        </article>
      </div>

      {affectedPlants.length > 0 && (
        <>
          <h2 className="mb-4 mt-12 text-2xl font-extrabold">Часто встречается у растений</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {affectedPlants.map((plant) => (
              <button
                key={plant.id}
                onClick={() => {
                  setSelectedPlant(plant);
                  go('plant');
                }}
                className="flex flex-col rounded-3xl bg-card p-4 text-left shadow-sm dark:bg-[#3b3a30]"
              >
                <strong className="text-sm font-bold">{plant.name}</strong>
                <span className="mt-3 self-start rounded-full bg-olive px-3 py-1 text-[11px] text-cream">
                  Открыть карточку
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </main>
  );
}