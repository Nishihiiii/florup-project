import { useMemo, useState } from 'react';
import type { DiagnosisCardItem, PageId, Problem, Symptom } from '../types.ts';
import { apiFetch } from '../utils/api.ts';
import { compressImage, extractLeafFeatures } from '../utils/image.ts';

interface AnalyzeResponse {
  metrics: { green: number; yellow: number; brown: number; white: number };
  symptoms: Symptom[];
}

interface DiagnosticsProps {
  symptoms: Symptom[];
  problems: Problem[];
  apiState: 'loading' | 'ready' | 'offline';
  setSelectedProblem: (item: DiagnosisCardItem) => void;
  go: (next: PageId) => void;
  notify: (msg: string) => void;
}

export default function Diagnostics({
  symptoms = [],
  problems = [],
  apiState,
  setSelectedProblem,
  go,
  notify,
}: DiagnosticsProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(null);
  const [search, setSearch] = useState('');

  const cards = useMemo<DiagnosisCardItem[]>(() => {
    const symptomCards: DiagnosisCardItem[] = symptoms.map((s) => ({
      id: `sym-${s.id}`,
      kind: 'Симптом',
      name: s.name,
      image_url: s.image_url || s.problems?.[0]?.image_url || '',
      description: s.description || s.problems?.[0]?.description || '',
      treatment: s.problems?.[0]?.treatment || '',
      problems: s.problems || [],
      plants: s.problems?.[0]?.plants || [],
    }));

    const problemCards: DiagnosisCardItem[] = problems.map((p) => ({
      id: `prob-${p.id}`,
      kind: p.problem_types?.name || 'Проблема',
      name: p.name,
      image_url: p.image_url || '',
      description: p.description,
      treatment: p.treatment,
      plants: p.plants || [],
    }));

    return symptomCards.length > 0 ? symptomCards : problemCards;
  }, [symptoms, problems]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cards.filter((c) => `${c.name} ${c.description || ''} ${c.kind}`.toLowerCase().includes(q));
  }, [cards, search]);

  const handleFile = async (selected?: File) => {
    if (!selected) return;
    setFile(selected);
    setAnalysisResult(null);
    const compressed = await compressImage(selected, 600, 0.75).catch(() => '');
    setPreview(compressed);
  };

  const analyze = async () => {
    if (!file) {
      notify('Сначала выберите фотографию растения.');
      return;
    }
    setAnalyzing(true);
    try {
      const features = await extractLeafFeatures(file);
      const res = await apiFetch<AnalyzeResponse>('/api/diagnostics/analyze', {
        method: 'POST',
        body: JSON.stringify({
          filename: file.name,
          imageDataUrl: preview,
          features,
        }),
      });
      setAnalysisResult(res);
    } catch (err) {
      notify((err as Error).message);
    } finally {
      setAnalyzing(false);
    }
  };

  const openCard = (item: DiagnosisCardItem) => {
    setSelectedProblem(item);
    go('diagnosis');
  };

  return (
    <main className="mx-auto max-w-[1430px] px-5 py-8 md:px-10">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Диагностика</h1>
        <p className="mt-3 max-w-3xl text-sm text-ink/75 dark:text-[#f1e6d1]/75">
          Загрузите фото больного растения или найдите симптомы, и наш алгоритм сверит их с базой данных.
        </p>
      </div>

      <section className="mb-10 flex flex-col items-center rounded-3xl bg-card p-6 dark:bg-[#3b3a30]">
        <label className="flex min-h-[240px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-ink/40 p-6 text-center text-olive dark:border-[#f1e6d1]/40">
          {preview ? (
            <img src={preview} alt="Загруженное фото" className="max-h-52 rounded-2xl object-contain" />
          ) : (
            <span className="text-4xl font-bold">⇩</span>
          )}
          <strong className="text-base font-semibold">
            {file ? file.name : 'Загрузите фото больного растения'}
          </strong>
          <span className="rounded-full bg-cream/80 px-4 py-1 text-xs dark:bg-[#303129]">
            PNG, JPG до 10 МБ
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>

        <button
          disabled={analyzing}
          onClick={analyze}
          className="mt-5 rounded-full bg-olive px-8 py-3 text-xs font-bold text-cream shadow hover:opacity-90 disabled:opacity-50"
        >
          {analyzing ? 'Анализируем и сверяем с БД…' : 'Проанализировать'}
        </button>

        {analysisResult && (
          <div className="mt-6 w-full rounded-2xl bg-cream p-5 dark:bg-[#303129]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-extrabold">Возможные симптомы (сверка с БД)</h2>
              <span className="text-[11px] text-ink/65 dark:text-[#f1e6d1]/65">
                Зелёный {analysisResult.metrics.green}%, жёлтый {analysisResult.metrics.yellow}%, бурый{' '}
                {analysisResult.metrics.brown}%, белый {analysisResult.metrics.white}%
              </span>
            </div>

            {analysisResult.symptoms.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {analysisResult.symptoms.map((sym) => (
                  <button
                    key={sym.id}
                    onClick={() =>
                      openCard({
                        id: `sym-${sym.id}`,
                        kind: 'Симптом',
                        name: sym.name,
                        image_url: sym.image_url,
                        description: sym.description,
                        treatment: sym.problems?.[0]?.treatment || '',
                        problems: sym.problems || [],
                        plants: sym.problems?.[0]?.plants || [],
                      })
                    }
                    className="flex flex-col rounded-2xl bg-card p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-[#3b3a30]"
                  >
                    <div className="mb-2 h-36 w-full overflow-hidden rounded-xl bg-pale dark:bg-[#292b25]">
                      {sym.image_url ? (
                        <img src={sym.image_url} alt={sym.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-tan">
                          Нет фото
                        </div>
                      )}
                    </div>
                    <strong className="text-sm font-bold">{sym.name}</strong>
                    <span className="mt-2 inline-block self-start rounded-full bg-olive px-2.5 py-0.5 text-[10px] font-bold text-cream">
                      Совпадение: {sym.confidence}%
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-ink/70">Симптомы в БД пока не добавлены.</p>
            )}
          </div>
        )}
      </section>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold">Поиск по симптомам ({filtered.length})</h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Например: листья желтеют…"
          className="h-11 w-full max-w-sm rounded-full border-2 border-line bg-card px-5 text-xs dark:border-[#68644e] dark:bg-[#303129]"
        />
      </div>

      {apiState === 'loading' ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 animate-pulse rounded-3xl bg-card/70 p-4 dark:bg-[#3b3a30]" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => openCard(item)}
              className="group flex flex-col rounded-3xl bg-card p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:bg-[#3b3a30]"
            >
              <div className="mb-3 h-48 w-full overflow-hidden rounded-2xl bg-pale dark:bg-[#303129]">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-tan">
                    Без изображения
                  </div>
                )}
              </div>
              <strong className="text-base font-extrabold">{item.name}</strong>
              <span className="mt-3 inline-block self-start rounded-full bg-olive px-3.5 py-1 text-[11px] font-semibold text-cream">
                Подробнее
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-2xl rounded-3xl bg-card p-10 text-center dark:bg-[#3b3a30]">
          <h3 className="text-lg font-extrabold">Справочник симптомов пока пуст</h3>
          <p className="mt-2 text-xs text-ink/70 dark:text-[#f1e6d1]/75">
            Добавьте записи через SQL-скрипт или панель эксперта.
          </p>
        </div>
      )}
    </main>
  );
}