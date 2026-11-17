import { useMemo, useState } from 'react';

export default function Diagnostics({ problems = [] }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      problems.filter((p) =>
        `${p.name} ${p.description}`.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [problems, search],
  );

  return (
    <main className="mx-auto max-w-[1430px] px-5 py-8 md:px-10">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Диагностика</h1>
        <p className="mt-3 max-w-3xl text-sm text-ink/75 dark:text-[#f1e6d1]/75">
          Загрузите фото больного растения или найдите описание проблемы в справочнике.
        </p>
      </div>

      <section className="mb-10 flex flex-col items-center rounded-3xl bg-card p-6 dark:bg-[#3b3a30]">
        <label className="flex min-h-[240px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/40 p-6 text-center text-olive dark:border-[#f1e6d1]/40">
          <span className="text-4xl font-bold">⇩</span>
          <strong className="text-base font-semibold">
            {file ? file.name : 'Загрузите фото больного растения'}
          </strong>
          <span className="text-xs">Нажмите для выбора файла (PNG, JPG)</span>
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setMessage('');
            }}
          />
        </label>

        <button
          onClick={() =>
            setMessage(
              file
                ? 'Фото загружено. Воспользуйтесь справочником симптомов ниже для подбора лечения.'
                : 'Сначала выберите фотографию растения.',
            )
          }
          className="mt-5 rounded-full bg-olive px-8 py-3 text-xs font-bold text-cream shadow hover:opacity-90"
        >
          Проанализировать
        </button>

        {message && (
          <p className="mt-4 rounded-xl bg-cream px-4 py-2 text-xs text-ink dark:bg-[#303129] dark:text-[#f1e6d1]">
            {message}
          </p>
        )}
      </section>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold">Справочник проблем ({filtered.length})</h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по симптомам…"
          className="h-11 w-full max-w-sm rounded-full border border-line bg-card px-5 text-xs dark:border-[#68644e] dark:bg-[#303129]"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((problem) => (
            <article key={problem.id} className="rounded-3xl bg-card p-6 shadow-sm dark:bg-[#3b3a30]">
              <h3 className="text-base font-bold">{problem.name}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink/80 dark:text-[#f1e6d1]/80">
                {problem.description}
              </p>
              <p className="mt-3 rounded-xl bg-cream/70 p-3 text-xs dark:bg-[#303129]">
                <strong>Лечение:</strong> {problem.treatment}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-2xl rounded-3xl bg-card p-10 text-center dark:bg-[#3b3a30]">
          <h3 className="text-lg font-extrabold">Справочник симптомов пока пуст</h3>
          <p className="mt-2 text-xs text-ink/70 dark:text-[#f1e6d1]/75">
            Добавьте материалы в панели эксперта, чтобы они появились здесь.
          </p>
        </div>
      )}
    </main>
  );
}