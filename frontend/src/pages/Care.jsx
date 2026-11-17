import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../utils/api.js';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function toDateKey(input) {
  const d = new Date(input);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getMonday(date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export default function Care({ go, notify, refreshUser }) {
  const [userPlants, setUserPlants] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(new Date()));

  const loadCare = useCallback(async () => {
    setLoading(true);
    try {
      const [up, l] = await Promise.all([
        apiFetch('/api/user-plants'),
        apiFetch('/api/care-logs'),
      ]);
      setUserPlants(up);
      setLogs(l);
      setSelectedId((prev) => prev || up[0]?.id || null);
    } catch (err) {
      notify(err.message);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadCare();
  }, [loadCare]);

  const weekDays = useMemo(() => {
    const monday = getMonday(new Date());
    monday.setDate(monday.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        label: WEEKDAYS[i],
        dayNum: d.getDate(),
        key: toDateKey(d),
        dateObj: d,
      };
    });
  }, [weekOffset]);

  const logsByDay = useMemo(() => {
    const map = {};
    for (const log of logs) {
      const key = toDateKey(log.action_date);
      if (!map[key]) map[key] = [];
      map[key].push(log);
    }
    return map;
  }, [logs]);

  const selectedDayObj = weekDays.find((d) => d.key === selectedDateKey);
  const selectedDayNum =
    selectedDayObj?.dayNum || Number(selectedDateKey.split('-')[2]);
  const selectedDayLogs = logsByDay[selectedDateKey] || [];

  const logAction = async (actionName) => {
    if (!selectedId) {
      notify('Сначала выберите или добавьте растение.');
      return;
    }
    try {
      const [y, m, d] = selectedDateKey.split('-').map(Number);
      const isoDate = new Date(y, m - 1, d, 12, 0, 0).toISOString();

      await apiFetch('/api/care-logs', {
        method: 'POST',
        body: JSON.stringify({
          user_plant_id: selectedId,
          action_name: actionName,
          action_date: isoDate,
        }),
      });
      notify(`Записано на ${d} число: ${actionName}`);
      loadCare();
    } catch (err) {
      notify(err.message);
    }
  };

  const removePlant = async (id) => {
    try {
      await apiFetch(`/api/user-plants/${id}`, { method: 'DELETE' });
      if (selectedId === id) setSelectedId(null);
      await loadCare();
      await refreshUser?.();
      notify('Растение удалено.');
    } catch (err) {
      notify(err.message);
    }
  };

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 md:px-10">
      <h1 className="mb-8 text-4xl font-black tracking-tight sm:text-6xl">Уход за растением</h1>

      {/* Верхний блок: слева Мои растения, справа Календарь ухода + Чек-лист */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[360px_1fr]">
        {/* Мои растения */}
        <div>
          <h2 className="mb-4 text-xl font-extrabold">Мои растения</h2>

          {loading ? (
            <p className="text-xs text-ink/60">Загрузка…</p>
          ) : userPlants.length > 0 ? (
            <div className="max-h-[260px] space-y-3 overflow-y-auto pr-2">
              {userPlants.map((item) => {
                const img = item.image_url || item.plants?.image_url;
                const active = selectedId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 rounded-2xl bg-card p-2.5 shadow-sm transition dark:bg-[#3b3a30] ${
                      active ? 'ring-2 ring-olive' : ''
                    }`}
                  >
                    <button
                      onClick={() => setSelectedId(item.id)}
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pale dark:bg-[#303129]">
                        {img ? (
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-base">🌿</span>
                        )}
                      </span>
                      <strong className="text-sm font-extrabold">
                        {item.nickname || item.plants?.name || 'Растение'}
                      </strong>
                    </button>
                    <button
                      onClick={() => removePlant(item.id)}
                      title="Удалить"
                      className="px-2 text-xs opacity-60 hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-card p-5 text-xs text-ink/75 dark:bg-[#3b3a30] dark:text-[#f1e6d1]/75">
              У вас пока нет растений. Добавьте из каталога.
            </div>
          )}

          <button
            onClick={() => go('catalog')}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-olive bg-card/50 py-3.5 text-sm font-extrabold text-ink/80 transition hover:bg-card dark:bg-[#3b3a30]/50 dark:text-[#f1e6d1]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-olive text-base text-cream">
              ＋
            </span>
            Добавить растение
          </button>
        </div>

        {/* Календарь ухода */}
        <section className="rounded-[28px] bg-card p-6 shadow-md dark:bg-[#3b3a30]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold">Календарь ухода</h2>
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <button
                onClick={() => setWeekOffset((w) => w - 1)}
                className="rounded-full bg-cream px-2.5 py-1 hover:bg-pale dark:bg-[#303129]"
              >
                ←
              </button>
              <button
                onClick={() => {
                  setWeekOffset(0);
                  setSelectedDateKey(toDateKey(new Date()));
                }}
                className="rounded-full bg-cream px-3 py-1 hover:bg-pale dark:bg-[#303129]"
              >
                Сегодня
              </button>
              <button
                onClick={() => setWeekOffset((w) => w + 1)}
                className="rounded-full bg-cream px-2.5 py-1 hover:bg-pale dark:bg-[#303129]"
              >
                →
              </button>
            </div>
          </div>

          {/* 7 дней */}
          <div className="grid grid-cols-7 gap-2.5">
            {weekDays.map((day) => {
              const isSelected = selectedDateKey === day.key;
              const hasLogs = (logsByDay[day.key] || []).length > 0;

              return (
                <button
                  key={day.key}
                  onClick={() => setSelectedDateKey(day.key)}
                  className={`flex flex-col items-center rounded-2xl py-3 shadow-sm transition ${
                    isSelected
                      ? 'bg-olive text-cream'
                      : 'bg-cream text-ink/55 hover:bg-pale dark:bg-[#303129] dark:text-[#f1e6d1]/70'
                  }`}
                >
                  <span className="text-xs font-bold">{day.label}</span>
                  <strong className="mt-1 text-lg font-black">{day.dayNum}</strong>
                  <span
                    className={`mt-1 h-1.5 w-1.5 rounded-full ${
                      hasLogs ? (isSelected ? 'bg-cream' : 'bg-olive') : 'bg-transparent'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Чек-лист на выбранное число */}
          <div className="mt-5 overflow-hidden rounded-2xl bg-cream shadow-sm dark:bg-[#303129]">
            <div className="bg-[#ebd9bb] px-5 py-3 text-sm font-extrabold dark:bg-[#3d3b30]">
              Чек-лист на {selectedDayNum} число
            </div>

            <div className="p-5">
              {selectedDayLogs.length > 0 ? (
                <ul className="mb-4 space-y-2 text-xs">
                  {selectedDayLogs.map((log) => (
                    <li key={log.id} className="flex items-center justify-between">
                      <span>
                        ✓ <strong>{log.care_action_types?.name}</strong> —{' '}
                        {log.user_plants?.nickname || log.user_plants?.plants?.name || 'Растение'}
                      </span>
                      <span className="text-ink/55 dark:text-[#f1e6d1]/55">
                        {new Date(log.action_date).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-4 text-sm font-bold text-ink/70 dark:text-[#f1e6d1]/75">
                  На этот день задач нет, растение отдыхает 🌿
                </p>
              )}

              <div className="flex flex-wrap gap-2 border-t border-line/40 pt-3 dark:border-[#68644e]">
                {['Полив', 'Опрыскивание', 'Внесение удобрений', 'Пересадка'].map((action) => (
                  <button
                    key={action}
                    onClick={() => logAction(action)}
                    className="rounded-full bg-olive px-3.5 py-1.5 text-[11px] font-bold text-cream hover:opacity-90"
                  >
                    ＋ {action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Нижний блок: История ухода */}
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-extrabold">История ухода</h2>
        <div className="rounded-[28px] bg-card p-5 shadow-sm dark:bg-[#3b3a30]">
          <div className="divide-y divide-line/50 rounded-2xl bg-cream px-6 py-2 dark:divide-[#68644e] dark:bg-[#303129]">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                  <strong className="font-extrabold">
                    {log.care_action_types?.name}
                    <span className="ml-2 text-xs font-medium text-ink/60 dark:text-[#f1e6d1]/60">
                      ({log.user_plants?.nickname || log.user_plants?.plants?.name || 'Растение'})
                    </span>
                  </strong>
                  <span className="text-xs font-semibold text-ink/55 dark:text-[#f1e6d1]/55">
                    {new Date(log.action_date).toLocaleString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-ink/65 dark:text-[#f1e6d1]/65">
                История появится после выполнения первых задач по уходу.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}