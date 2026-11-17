import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../utils/api.js';

const DEFAULT_CATEGORIES = ['Все', 'Грунты', 'Удобрения', 'Горшки'];

export default function MapPage() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Все');
  const [selectedStore, setSelectedStore] = useState(null);
  const [detailTab, setDetailTab] = useState('contacts');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/stores')
      .then((data) => {
        if (Array.isArray(data)) setStores(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const fromDb = stores.flatMap((s) => s.categories || []);
    return fromDb.length ? ['Все', ...new Set(fromDb)] : DEFAULT_CATEGORIES;
  }, [stores]);

  const filteredStores = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stores.filter((s) => {
      const matchQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        (s.categories || []).some((c) => c.toLowerCase().includes(q));
      const matchCat = category === 'Все' || (s.categories || []).includes(category);
      return matchQuery && matchCat;
    });
  }, [stores, search, category]);

  const mapLat = selectedStore?.latitude || 55.0302;
  const mapLon = selectedStore?.longitude || 82.9204;

  return (
    <main className="mx-auto max-w-[1430px] px-5 py-8 md:px-10">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Карта магазинов</h1>
        <p className="mt-2 text-sm text-ink/75 dark:text-[#f1e6d1]/75">
          Поиск товаров, магазинов и информации о них.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[360px_1fr]">
        {/* Левая колонка: поиск + список ИЛИ карточка магазина с 3 вкладками */}
        {!selectedStore ? (
          <aside className="space-y-5">
            <section className="rounded-3xl bg-card p-6 shadow-sm dark:bg-[#3b3a30]">
              <h2 className="text-lg font-extrabold">Поиск товаров</h2>
              <div className="my-3 h-px bg-line/70 dark:bg-[#68644e]" />

              <label className="flex h-11 items-center gap-3 rounded-full border border-line bg-cream px-4 dark:border-[#68644e] dark:bg-[#303129]">
                <span className="text-sm text-olive">🔍</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск товара..."
                  className="w-full bg-transparent text-xs text-ink placeholder:text-ink/50 focus:outline-none focus:ring-0 dark:text-[#f1e6d1]"
                />
              </label>

              <h3 className="mb-3 mt-5 text-sm font-extrabold">Категории товаров</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                      category === cat
                        ? 'bg-olive text-cream'
                        : 'border border-line bg-cream/70 text-ink/80 hover:bg-pale dark:border-[#68644e] dark:bg-[#303129] dark:text-[#f1e6d1]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-card p-6 shadow-sm dark:bg-[#3b3a30]">
              <h2 className="text-lg font-extrabold">Список магазинов</h2>
              <div className="my-3 h-px bg-line/70 dark:bg-[#68644e]" />
              <p className="mb-3 text-[11px] text-ink/60 dark:text-[#f1e6d1]/60">
                {loading ? 'Загрузка…' : `Найдено магазинов: ${filteredStores.length}`}
              </p>

              {filteredStores.length > 0 ? (
                <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
                  {filteredStores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => {
                        setSelectedStore(store);
                        setDetailTab('contacts');
                      }}
                      className="w-full rounded-2xl border border-line bg-cream/70 p-4 text-left transition hover:border-olive hover:bg-cream dark:border-[#68644e] dark:bg-[#303129]"
                    >
                      <strong className="block text-sm font-extrabold text-olive">
                        {store.name}
                      </strong>
                      <span className="mt-0.5 block text-[11px] text-ink/70 dark:text-[#f1e6d1]/70">
                        {store.type}
                      </span>
                      <div className="mt-2 space-y-1 text-[11px] text-ink/75 dark:text-[#f1e6d1]/75">
                        <div>📍 {store.address}</div>
                        <div>🕒 {store.working_hours}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-line/60 bg-cream/60 p-4 text-xs leading-relaxed text-ink/70 dark:border-[#68644e] dark:bg-[#303129] dark:text-[#f1e6d1]/70">
                  В базе данных пока нет добавленных магазинов. На карте справа показан город
                  Новосибирск.
                </div>
              )}
            </section>
          </aside>
        ) : (
          <aside className="overflow-hidden rounded-3xl bg-card shadow-sm dark:bg-[#3b3a30]">
            <div className="bg-pale/80 p-6 dark:bg-[#303129]">
              <button
                onClick={() => setSelectedStore(null)}
                className="mb-3 text-xs font-medium text-tan hover:underline"
              >
                ← Вернуться к списку магазинов
              </button>
              <h2 className="text-2xl font-black">{selectedStore.name}</h2>
              <p className="text-xs text-ink/70 dark:text-[#f1e6d1]/70">{selectedStore.type}</p>

              <div className="mt-5 flex gap-5 border-b border-line/60 text-xs font-bold dark:border-[#68644e]">
                {[
                  ['contacts', 'Контакты'],
                  ['assortment', 'Ассортимент'],
                  ['reviews', 'Отзывы'],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setDetailTab(id)}
                    className={`pb-2.5 ${
                      detailTab === id
                        ? 'border-b-2 border-olive text-ink dark:text-[#f1e6d1]'
                        : 'text-ink/60 dark:text-[#f1e6d1]/60'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 p-6 text-xs">
              {detailTab === 'contacts' && (
                <>
                  <div className="rounded-2xl border border-line/60 bg-cream/60 p-4 dark:border-[#68644e] dark:bg-[#303129]">
                    <span className="block text-[11px] font-bold text-ink/60 dark:text-[#f1e6d1]/60">
                      Адрес
                    </span>
                    <strong className="mt-1 block text-sm">{selectedStore.address}</strong>
                  </div>
                  <div className="rounded-2xl border border-line/60 bg-cream/60 p-4 dark:border-[#68644e] dark:bg-[#303129]">
                    <span className="block text-[11px] font-bold text-ink/60 dark:text-[#f1e6d1]/60">
                      Режим работы
                    </span>
                    <strong className="mt-1 block text-sm">{selectedStore.working_hours}</strong>
                  </div>
                  {selectedStore.contact_info && (
                    <div className="rounded-2xl border border-line/60 bg-cream/60 p-4 dark:border-[#68644e] dark:bg-[#303129]">
                      <span className="block text-[11px] font-bold text-ink/60 dark:text-[#f1e6d1]/60">
                        Контакты
                      </span>
                      <strong className="mt-1 block text-sm">{selectedStore.contact_info}</strong>
                    </div>
                  )}
                </>
              )}

              {detailTab === 'assortment' && (
                <div>
                  <h3 className="mb-3 text-sm font-extrabold">✓ Доступные категории</h3>
                  {selectedStore.categories?.length ? (
                    <div className="space-y-2">
                      {selectedStore.categories.map((cat) => (
                        <div
                          key={cat}
                          className="rounded-2xl border border-line/60 bg-cream/60 px-4 py-3 font-semibold dark:border-[#68644e] dark:bg-[#303129]"
                        >
                          • {cat}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-ink/70">Ассортимент пока не указан.</p>
                  )}
                </div>
              )}

              {detailTab === 'reviews' && (
                <div>
                  <h3 className="mb-3 text-sm font-extrabold">
                    Отзывы ({selectedStore.reviews?.length || 0})
                  </h3>
                  {selectedStore.reviews?.length ? (
                    <div className="space-y-3">
                      {selectedStore.reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="rounded-2xl border border-line/60 bg-cream/60 p-4 dark:border-[#68644e] dark:bg-[#303129]"
                        >
                          <div className="flex justify-between font-bold">
                            <span>{rev.author}</span>
                            <span>★ {rev.rating}</span>
                          </div>
                          {rev.text && <p className="mt-1.5 text-ink/80 dark:text-[#f1e6d1]/80">{rev.text}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-ink/70">Отзывов пока нет.</p>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Правая колонка: карта Новосибирска в рамке как в прототипе */}
        <div className="overflow-hidden rounded-[28px] border-4 border-line/80 bg-card p-1 shadow-sm dark:border-[#68644e] dark:bg-[#3b3a30]">
          <iframe
            title="Карта Новосибирска"
            className="h-[560px] w-full rounded-[22px] border-0"
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=82.7800%2C54.9300%2C83.0700%2C55.1100&layer=mapnik&marker=${mapLat}%2C${mapLon}`}
          />
        </div>
      </div>
    </main>
  );
}