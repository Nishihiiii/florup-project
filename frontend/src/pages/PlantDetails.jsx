import { useState } from 'react';
import Placeholder from '../components/Placeholder.jsx';
import { apiFetch } from '../utils/api.js';

export default function PlantDetails({ selectedPlant, setSelectedPlant, go, plants, user, notify }) {
  const plant = selectedPlant || plants[0];
  const [adding, setAdding] = useState(false);

  if (!plant) {
    return (
      <main className="mx-auto max-w-[1430px] px-5 py-8 md:px-10">
        <button className="mb-6 text-xs text-tan hover:underline" onClick={() => go('catalog')}>
          ← Вернуться в каталог
        </button>
        <div className="mx-auto max-w-xl rounded-3xl bg-card p-10 text-center dark:bg-[#3b3a30]">
          <h1 className="text-2xl font-black">Карточка растения пока недоступна</h1>
          <p className="mt-2 text-xs text-ink/70 dark:text-[#f1e6d1]/75">
            Подробная информация появится после добавления растений в базу данных.
          </p>
          <button
            className="mt-6 rounded-full bg-olive px-6 py-2.5 text-xs font-bold text-cream"
            onClick={() => go('catalog')}
          >
            В каталог
          </button>
        </div>
      </main>
    );
  }

  const similarPlants = plants.filter((item) => item.id !== plant.id).slice(0, 3);

  const addToMyCare = async () => {
    if (!user) {
      go('login');
      return;
    }
    setAdding(true);
    try {
      await apiFetch('/api/user-plants', {
        method: 'POST',
        body: JSON.stringify({ plant_id: plant.id, nickname: plant.name }),
      });
      notify('Растение добавлено в ваш раздел «Уход»!');
    } catch (err) {
      notify(err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <main className="mx-auto max-w-[1430px] px-5 py-8 md:px-10">
      <button className="mb-6 text-xs text-tan hover:underline" onClick={() => go('catalog')}>
        ← Вернуться в каталог
      </button>

      <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[360px_1fr]">
        <div className="aspect-[4/5] w-full overflow-hidden rounded-3xl bg-card dark:bg-[#3b3a30]">
          {plant.image_url ? (
            <img src={plant.image_url} alt={plant.name} className="h-full w-full object-cover" />
          ) : (
            <Placeholder label="Фотография растения" className="h-full w-full" />
          )}
        </div>

        <div>
          <h1 className="text-4xl font-black sm:text-5xl">{plant.name}</h1>
          {plant.latin_name && (
            <p className="mt-2 text-sm italic text-ink/70 dark:text-[#f1e6d1]/70">
              {plant.latin_name}
            </p>
          )}
          <p className="mt-5 text-sm leading-relaxed text-ink/80 dark:text-[#f1e6d1]/85">
            {plant.description || 'Описание пока не заполнено.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-olive px-4 py-1.5 text-xs font-semibold text-cream">
              Полив: раз в {plant.water_interval_days || 7} дн.
            </span>
            <span className="rounded-full bg-olive px-4 py-1.5 text-xs font-semibold text-cream">
              Подкормка: раз в {plant.fertilize_interval_days || 30} дн.
            </span>
          </div>

          <button
            disabled={adding}
            onClick={addToMyCare}
            className="mt-8 rounded-full bg-ink px-7 py-3 text-xs font-bold text-cream hover:opacity-90 disabled:opacity-50"
          >
            {adding ? 'Добавление…' : '＋ Добавить в мой уход'}
          </button>
        </div>
      </div>

      <h2 className="mb-4 mt-12 text-2xl font-extrabold">Требования к уходу</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          ['Полив', plant.care_watering_text],
          ['Освещение', plant.care_lighting_text],
          ['Температура', plant.care_temp_text],
        ].map(([title, text]) => (
          <article key={title} className="rounded-3xl bg-card p-6 dark:bg-[#3b3a30]">
            <h3 className="mb-2 text-base font-bold">{title}</h3>
            <p className="text-xs leading-relaxed text-ink/75 dark:text-[#f1e6d1]/80">
              {text || 'Информация будет дополнена.'}
            </p>
          </article>
        ))}
      </div>

      {similarPlants.length > 0 && (
        <>
          <h2 className="mb-4 mt-12 text-2xl font-extrabold">Похожие растения</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {similarPlants.map((similar) => (
              <button
                key={similar.id}
                onClick={() => {
                  setSelectedPlant(similar);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className="flex flex-col rounded-3xl bg-card p-4 text-left shadow-sm dark:bg-[#3b3a30]"
              >
                <strong className="text-sm font-bold">{similar.name}</strong>
                <small className="mt-1 italic text-ink/60 dark:text-[#f1e6d1]/60">
                  {similar.latin_name || ''}
                </small>
                <span className="mt-3 self-start rounded-full bg-olive px-3 py-1 text-[11px] text-cream">
                  Открыть
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </main>
  );
}