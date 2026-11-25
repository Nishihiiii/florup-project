import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { City, Store, StoreReview } from '../types.ts';
import { apiFetch } from '../utils/api.ts';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface OverpassElement {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const DEFAULT_CATEGORIES = [
  'Комнатные растения',
  'Удобрения',
  'Грунт и субстраты',
  'Горшки и кашпо',
  'Средства защиты',
];

async function fetchStoresFromOverpass(city: City): Promise<Store[]> {
  if (city.latitude === null || city.longitude === null) return [];
  const query = `
    [out:json][timeout:12];
    (
      node["shop"~"florist|garden_centre"](around:12000,${city.latitude},${city.longitude});
      way["shop"~"florist|garden_centre"](around:12000,${city.latitude},${city.longitude});
    );
    out center 40;
  `;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: `data=${encodeURIComponent(query)}`,
  });
  if (!res.ok) throw new Error('Overpass API error');
  const json = (await res.json()) as { elements?: OverpassElement[] };
  const elements = json.elements || [];

  return elements
    .map((el): Store | null => {
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (lat === undefined || lon === undefined) return null;
      const tags = el.tags || {};
      const isGarden = tags.shop === 'garden_centre';
      const street = tags['addr:street'] || '';
      const house = tags['addr:housenumber'] || '';
      const fullAddr = [street, house].filter(Boolean).join(', ') || tags['addr:full'] || city.name;

      return {
        id: `osm-${el.type}-${el.id}`,
        city_id: city.id,
        name: tags.name || tags['name:ru'] || (isGarden ? 'Садовый центр' : 'Цветочный магазин'),
        city: tags['addr:city'] || city.name,
        type: isGarden ? 'Садовый центр' : 'Цветочный магазин',
        address: fullAddr,
        latitude: lat,
        longitude: lon,
        working_hours: tags.opening_hours || 'Уточняйте по телефону',
        contact_info: tags.phone || tags['contact:phone'] || tags.website || '',
        categories: isGarden
          ? ['Комнатные растения', 'Удобрения', 'Грунт и субстраты', 'Горшки и кашпо']
          : ['Комнатные растения', 'Горшки и кашпо', 'Средства защиты'],
        products: [],
        reviews: [],
      };
    })
    .filter((s): s is Store => s !== null && s.address !== city.name);
}

interface MapPageProps {
  notify: (msg: string) => void;
}

export default function MapPage({ notify }: MapPageProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Все');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [detailTab, setDetailTab] = useState<'contacts' | 'assortment' | 'reviews'>('contacts');
  const [loading, setLoading] = useState(true);
  const [geoStatus, setGeoStatus] = useState('Определяем город…');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    apiFetch<City[]>('/api/cities')
      .catch(() => [
        { id: 1, name: 'Новосибирск', latitude: 55.0302, longitude: 82.9204 },
        { id: 2, name: 'Москва', latitude: 55.7558, longitude: 37.6173 },
        { id: 3, name: 'Санкт-Петербург', latitude: 59.9343, longitude: 30.3351 },
      ])
      .then((citiesData) => {
        setCities(citiesData);
        if (!citiesData.length) return;

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              let nearest = citiesData[0];
              let bestDist = Infinity;
              for (const c of citiesData) {
                if (c.latitude !== null && c.longitude !== null) {
                  const d = haversineKm(latitude, longitude, c.latitude, c.longitude);
                  if (d < bestDist) {
                    bestDist = d;
                    nearest = c;
                  }
                }
              }
              setSelectedCityId(nearest.id);
              setGeoStatus(`Ваш город: ${nearest.name}`);
            },
            () => {
              const def = citiesData.find((c) => c.name === 'Новосибирск') || citiesData[0];
              setSelectedCityId(def.id);
              setGeoStatus(`Город по умолчанию: ${def.name}`);
            },
            { timeout: 5000 },
          );
        } else {
          const def = citiesData.find((c) => c.name === 'Новосибирск') || citiesData[0];
          setSelectedCityId(def.id);
          setGeoStatus(`Город: ${def.name}`);
        }
      });
  }, []);

  const activeCity = useMemo(
    () => cities.find((c) => c.id === selectedCityId) || null,
    [cities, selectedCityId],
  );

  useEffect(() => {
    if (!activeCity) return;
    let cancelled = false;
    setLoading(true);
    fetchStoresFromOverpass(activeCity)
      .then((osmStores) => {
        if (!cancelled) setStores(osmStores);
      })
      .catch(() => {
        if (!cancelled) {
          apiFetch<Store[]>('/api/stores')
            .then((dbStores) => !cancelled && setStores(dbStores.filter((s) => s.city_id === activeCity.id)))
            .catch(() => !cancelled && setStores([]));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCity]);

  const visibleCategories = useMemo(() => ['Все', ...DEFAULT_CATEGORIES], []);

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

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([55.0302, 82.9204], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(mapInstanceRef.current);
      markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current!;
    layer.clearLayers();

    if (selectedStore) {
      map.setView([selectedStore.latitude, selectedStore.longitude], 15);
    } else if (activeCity?.latitude && activeCity?.longitude) {
      map.setView([activeCity.latitude, activeCity.longitude], 12);
    }

    filteredStores.forEach((store) => {
      const pinIcon = L.divIcon({
        className: 'florup-pin',
        html: `<div style="width:28px;height:28px;border-radius:50%;background:#908e55;border:3px solid #fff0d3;box-shadow:0 2px 6px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;color:#fff0d3;font-size:13px;">🌿</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([store.latitude, store.longitude], { icon: pinIcon }).addTo(layer);
      marker.bindPopup(`<strong>${store.name}</strong><br/>${store.address}`);
      marker.on('click', () => {
        setSelectedStore(store);
        setDetailTab('contacts');
      });
      if (selectedStore?.id === store.id) {
        marker.openPopup();
      }
    });
  }, [filteredStores, selectedStore, activeCity]);

  const submitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStore || !reviewText.trim()) return;
    const newReview: StoreReview = {
      id: String(Date.now()),
      author: 'Вы',
      rating: reviewRating,
      text: reviewText.trim(),
    };
    const updated: Store = {
      ...selectedStore,
      reviews: [newReview, ...(selectedStore.reviews || [])],
    };
    setSelectedStore(updated);
    setStores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setReviewText('');
    notify('Отзыв добавлен!');
  };

  const avgRating = selectedStore?.reviews?.length
    ? (
        selectedStore.reviews.reduce((sum, r) => sum + (r.rating || 5), 0) /
        selectedStore.reviews.length
      ).toFixed(1)
    : '5.0';

  return (
    <main className="mx-auto max-w-[1430px] px-5 py-8 md:px-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Карта магазинов</h1>
          <p className="mt-2 text-sm text-ink/75 dark:text-[#f1e6d1]/75">
            Актуальные магазины растений из OpenStreetMap.{' '}
            <span className="font-bold text-olive">{geoStatus}</span>
          </p>
        </div>

        {cities.length > 0 && (
          <select
            aria-label="Выбор города"
            value={selectedCityId || ''}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelectedCityId(id);
              setSelectedStore(null);
              const c = cities.find((x) => x.id === id);
              if (c) setGeoStatus(`Выбран город: ${c.name}`);
            }}
            className="h-11 rounded-full border-2 border-line bg-card px-5 text-xs font-bold dark:border-[#68644e] dark:bg-[#3b3a30]"
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                📍 {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[360px_1fr]">
        {!selectedStore ? (
          <aside className="space-y-5">
            <section className="rounded-3xl bg-card p-6 shadow-sm dark:bg-[#3b3a30]">
              <h2 className="text-lg font-extrabold">Поиск товаров и магазинов</h2>
              <div className="my-3 h-px bg-line/70 dark:bg-[#68644e]" />

              <label className="flex h-11 items-center gap-3 rounded-full border border-line bg-cream px-4 dark:border-[#68644e] dark:bg-[#303129]">
                <span className="text-sm text-olive">🔍</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Товар, категория или магазин..."
                  className="w-full bg-transparent text-xs text-ink placeholder:text-ink/50 focus:outline-none focus:ring-0 dark:text-[#f1e6d1]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="text-xs font-bold opacity-60 hover:opacity-100"
                  >
                    ✕
                  </button>
                )}
              </label>

              <h3 className="mb-3 mt-5 text-sm font-extrabold">Категории товаров</h3>
              <div className="flex flex-wrap gap-2">
                {visibleCategories.map((cat) => (
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
                {loading ? 'Загружаем данные с карт…' : `Найдено магазинов: ${filteredStores.length}`}
              </p>

              {filteredStores.length > 0 ? (
                <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
                  {filteredStores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => {
                        setSelectedStore(store);
                        setDetailTab('contacts');
                      }}
                      className="w-full rounded-2xl border border-line bg-cream/70 p-4 text-left transition hover:border-olive hover:bg-cream dark:border-[#68644e] dark:bg-[#303129]"
                    >
                      <strong className="block text-sm font-extrabold text-olive">{store.name}</strong>
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
                  {loading ? 'Ищем магазины поблизости…' : 'По вашему запросу магазинов не найдено.'}
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
                {(
                  [
                    ['contacts', 'О магазине'],
                    ['assortment', 'Ассортимент'],
                    ['reviews', 'Отзывы'],
                  ] as const
                ).map(([id, label]) => (
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
                  <a
                    href={`https://yandex.ru/maps/?pt=${selectedStore.longitude},${selectedStore.latitude}&z=17&l=map&text=${encodeURIComponent(
                      `${selectedStore.city}, ${selectedStore.address} ${selectedStore.name}`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl border border-line/60 bg-cream/60 p-4 transition hover:border-olive dark:border-[#68644e] dark:bg-[#303129]"
                  >
                    <span className="block text-[11px] font-bold text-ink/60 dark:text-[#f1e6d1]/60">
                      Адрес (открыть маршрут ↗)
                    </span>
                    <strong className="mt-1 block text-sm">{selectedStore.address}</strong>
                  </a>
                  <div className="rounded-2xl border border-line/60 bg-cream/60 p-4 dark:border-[#68644e] dark:bg-[#303129]">
                    <span className="block text-[11px] font-bold text-ink/60 dark:text-[#f1e6d1]/60">
                      Режим работы
                    </span>
                    <strong className="mt-1 block text-sm">{selectedStore.working_hours}</strong>
                  </div>
                  {selectedStore.contact_info && (
                    <a
                      href={
                        selectedStore.contact_info.startsWith('http')
                          ? selectedStore.contact_info
                          : `tel:${selectedStore.contact_info.replace(/[^+\d]/g, '')}`
                      }
                      target={selectedStore.contact_info.startsWith('http') ? '_blank' : undefined}
                      rel="noreferrer"
                      className="block rounded-2xl border border-line/60 bg-cream/60 p-4 transition hover:border-olive dark:border-[#68644e] dark:bg-[#303129]"
                    >
                      <span className="block text-[11px] font-bold text-ink/60 dark:text-[#f1e6d1]/60">
                        Контакты
                      </span>
                      <strong className="mt-1 block text-sm">{selectedStore.contact_info}</strong>
                    </a>
                  )}
                </>
              )}

              {detailTab === 'assortment' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-sm font-extrabold">Категории</h3>
                    <div className="flex flex-wrap gap-2">
                      {(selectedStore.categories || []).map((cat) => (
                        <span
                          key={cat}
                          className="rounded-full bg-olive px-3 py-1 text-[11px] font-bold text-cream"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-ink/70">Наличие конкретных позиций уточняйте в магазине.</p>
                </div>
              )}

              {detailTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold">
                      Отзывы ({selectedStore.reviews?.length || 0})
                    </h3>
                    <span className="font-black text-olive">{avgRating} ★</span>
                  </div>

                  {selectedStore.reviews?.length ? (
                    <div className="max-h-56 space-y-2.5 overflow-y-auto pr-1">
                      {selectedStore.reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="rounded-2xl border border-line/60 bg-cream/60 p-3 dark:border-[#68644e] dark:bg-[#303129]"
                        >
                          <div className="flex justify-between font-bold">
                            <span>{rev.author}</span>
                            <span>★ {rev.rating}</span>
                          </div>
                          {rev.text && (
                            <p className="mt-1 text-ink/80 dark:text-[#f1e6d1]/80">{rev.text}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-ink/70">Отзывов пока нет.</p>
                  )}

                  <form onSubmit={submitReview} className="space-y-2 border-t border-line/40 pt-3">
                    <div className="flex items-center gap-2">
                      <span>Оценка:</span>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="rounded-lg border border-line bg-cream px-2 py-1 dark:bg-[#303129]"
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {n} ★
                          </option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={2}
                      placeholder="Оставьте отзыв…"
                      className="w-full rounded-xl border border-line bg-cream p-3 dark:bg-[#303129]"
                    />
                    <button className="rounded-full bg-olive px-4 py-2 font-bold text-cream">
                      Отправить отзыв
                    </button>
                  </form>
                </div>
              )}
            </div>
          </aside>
        )}

        <div className="overflow-hidden rounded-[28px] border-4 border-line/80 bg-card p-1 shadow-sm dark:border-[#68644e] dark:bg-[#3b3a30]">
          <div ref={mapContainerRef} className="z-0 h-[560px] w-full rounded-[22px]" />
        </div>
      </div>
    </main>
  );
}