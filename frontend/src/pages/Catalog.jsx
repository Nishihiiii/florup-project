import { useMemo } from 'react';

export default function Catalog({
  plants,
  plantSearch,
  setPlantSearch,
  setSelectedPlant,
  apiState,
  user,
  go,
}) {
  const shown = useMemo(
    () =>
      plants.filter((p) =>
        `${p.name || ''} ${p.latin_name || ''}`
          .toLowerCase()
          .includes(plantSearch.trim().toLowerCase()),
      ),
    [plants, plantSearch],
  );

  return (
    <main className="mx-auto max-w-[1430px] px-5 py-8 md:px-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Каталог</h1>
          <p className="mt-3 text-sm text-ink/70 dark:text-[#f1e6d1]/75">
            Выберите растение, чтобы узнать о его потребностях и уходе.
          </p>
        </div>
        {user && (
          <button
            onClick={() => go('admin')}
            className="rounded-full bg-olive px-5 py-2.5 text-xs font-bold text-cream hover:opacity-90"
          >
            ＋ Добавить растение в БД
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={plantSearch}
          onChange={(e) => setPlantSearch(e.target.value)}
          placeholder="Поиск растения по названию…"
          className="h-12 flex-1 rounded-full border-2 border-line bg-card px-6 text-xs text-ink placeholder:text-ink/50 dark:border-[#68644e] dark:bg-[#303129] dark:text-[#f1e6d1]"
        />
        {plantSearch && (
          <button
            className="rounded-full bg-olive px-6 py-3 text-xs font-bold text-cream hover:opacity-90"
            onClick={() => setPlantSearch('')}
          >
            Сбросить
          </button>
        )}
      </div>

      {shown.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((plant) => (
            <button
              key={plant.id}
              onClick={() => {
                setSelectedPlant(plant);
                go('plant');
              }}
              className="flex flex-col rounded-3xl bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-[#3b3a30]"
            >
              <div className="mb-3 h-48 w-full overflow-hidden rounded-2xl bg-pale dark:bg-[#303129]">
                {plant.image_url ? (
                  <img src={plant.image_url} alt={plant.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-tan">
                    Без изображения
                  </div>
                )}
              </div>
              <strong className="text-sm font-bold">{plant.name}</strong>
              {plant.latin_name && (
                <small className="mt-1 italic text-ink/65 dark:text-[#f1e6d1]/65">
                  {plant.latin_name}
                </small>
              )}
              <span className="mt-4 inline-block self-start rounded-full bg-olive px-3.5 py-1.5 text-[11px] font-semibold text-cream">
                Подробнее
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="mx-auto mt-8 max-w-2xl rounded-3xl bg-card p-10 text-center dark:bg-[#3b3a30]">
          <h2 className="text-xl font-extrabold">
            {apiState === 'offline'
              ? 'Не удалось загрузить каталог'
              : plants.length === 0
                ? 'В базе данных пока нет растений'
                : 'Ничего не найдено'}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-ink/70 dark:text-[#f1e6d1]/75">
            {apiState === 'offline'
              ? 'Проверьте, запущен ли backend и настроено ли подключение к PostgreSQL.'
              : plants.length === 0
                ? 'Войдите в аккаунт и добавьте первое растение через панель администратора — карточка сразу появится здесь.'
                : 'Попробуйте изменить поисковый запрос.'}
          </p>
        </div>
      )}
    </main>
  );
}