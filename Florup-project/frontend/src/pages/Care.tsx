import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CareActionType, CareLog, PageId, UserPlant } from '../types.ts';
import { apiFetch } from '../utils/api.ts';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const PLANTS_PER_PAGE = 4;

function toDateKey(input: string | Date): string {
  const d = new Date(input);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

interface DueTask {
  action: string;
  hint: string;
}

function getDueTasksForPlant(item: UserPlant): DueTask[] {
  const tasks: DueTask[] = [];
  const logs = item.care_logs || [];
  const baseDate = new Date(item.adopted_at || item.created_at || Date.now());
  const now = Date.now();

  const checkTask = (label: string, intervalDays: number, keyword: string, hint: string) => {
    if (!intervalDays || intervalDays <= 0) return;
    const last = logs.find((l) => (l.care_action_types?.name || '').toLowerCase().includes(keyword));
    const lastDate = last ? new Date(last.action_date) : baseDate;
    const diffDays = Math.floor((now - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= intervalDays) {
      tasks.push({ action: label, hint });
    }
  };

  checkTask('Полив', item.plants?.water_interval_days ?? 7, 'полив', 'Увлажнить почву');
  checkTask('Опрыскивание', item.plants?.spray_interval_days ?? 0, 'опрыск', 'Опрыскать листья');
  checkTask(
    'Внесение удобрений',
    item.plants?.fertilize_interval_days ?? 30,
    'удобр',
    'Нужно купить: Жидкое удобрение для комнатных растений',
  );

  return tasks;
}

interface CareProps {
  go: (next: PageId) => void;
  notify: (msg: string) => void;
  refreshUser?: () => Promise<void>;
}

export default function Care({ go, notify, refreshUser }: CareProps) {
  const [userPlants, setUserPlants] = useState<UserPlant[]>([]);
  const [careActions, setCareActions] = useState<CareActionType[]>([]);
  const [logs, setLogs] = useState<CareLog[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(new Date()));
  const [plantPage, setPlantPage] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [plantToDelete, setPlantToDelete] = useState<UserPlant | null>(null);

  const loadCare = useCallback(async () => {
    setLoading(true);
    try {
      const [up, l, actions] = await Promise.all([
        apiFetch<UserPlant[]>('/api/user-plants'),
        apiFetch<CareLog[]>('/api/care-logs'),
        apiFetch<CareActionType[]>('/api/care-actions').catch(() => []),
      ]);
      setUserPlants(up);
      setLogs(l);
      setCareActions(
        Array.isArray(actions) && actions.length
          ? actions
          : [
              { id: 1, name: 'Полив' },
              { id: 2, name: 'Опрыскивание' },
              { id: 3, name: 'Внесение удобрений' },
              { id: 4, name: 'Пересадка' },
            ],
      );
      setSelectedId((prev) => (prev && up.some((p) => p.id === prev) ? prev : up[0]?.id || null));
    } catch (err) {
      notify((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadCare();
  }, [loadCare]);

  const dueByPlant = useMemo(() => {
    const map: Record<string, DueTask[]> = {};
    for (const item of userPlants) {
      map[item.id] = getDueTasksForPlant(item);
    }
    return map;
  }, [userPlants]);

  const allDueToday = useMemo(
    () =>
      userPlants.flatMap((item) =>
        (dueByPlant[item.id] || []).map((t) => ({
          plantId: item.id,
          plantName: item.nickname || item.plants?.name || 'Растение',
          ...t,
        })),
      ),
    [userPlants, dueByPlant],
  );

  const totalPlantPages = Math.max(1, Math.ceil(userPlants.length / PLANTS_PER_PAGE));
  const safePage = Math.min(plantPage, totalPlantPages - 1);
  const visiblePlants = userPlants.slice(
    safePage * PLANTS_PER_PAGE,
    safePage * PLANTS_PER_PAGE + PLANTS_PER_PAGE,
  );

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
      };
    });
  }, [weekOffset]);

  const logsByDay = useMemo(() => {
    const map: Record<string, CareLog[]> = {};
    for (const log of logs) {
      const key = toDateKey(log.action_date);
      if (!map[key]) map[key] = [];
      map[key].push(log);
    }
    return map;
  }, [logs]);

  const todayKey = toDateKey(new Date());
  const selectedDayObj = weekDays.find((d) => d.key === selectedDateKey);
  const selectedDayNum = selectedDayObj?.dayNum || Number(selectedDateKey.split('-')[2]);
  const selectedDayLogs = logsByDay[selectedDateKey] || [];
  const selectedPlantObj = userPlants.find((p) => p.id === selectedId);
  const selectedPlantDue = selectedId ? dueByPlant[selectedId] || [] : [];

  const logAction = async (actionName: string, targetPlantId = selectedId) => {
    if (!targetPlantId) {
      notify('Сначала выберите или добавьте растение.');
      return;
    }
    try {
      const [y, m, d] = selectedDateKey.split('-').map(Number);
      const now = new Date();
      const actionDate = new Date(
        y,
        m - 1,
        d,
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
      ).toISOString();

      await apiFetch('/api/care-logs', {
        method: 'POST',
        body: JSON.stringify({
          user_plant_id: targetPlantId,
          action_name: actionName,
          action_date: actionDate,
        }),
      });
      notify(`Записано на ${d} число: ${actionName}`);
      await loadCare();
    } catch (err) {
      notify((err as Error).message);
    }
  };

  const confirmDeletePlant = async () => {
    if (!plantToDelete) return;
    try {
      await apiFetch(`/api/user-plants/${plantToDelete.id}`, { method: 'DELETE' });
      if (selectedId === plantToDelete.id) setSelectedId(null);
      setPlantToDelete(null);
      await loadCare();
      await refreshUser?.();
      notify('Растение удалено.');
    } catch (err) {
      notify((err as Error).message);
    }
  };

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 md:px-10">
      <h1 className="mb-6 text-4xl font-black tracking-tight sm:text-6xl">Уход за растением</h1>

      {allDueToday.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-red-400/60 bg-red-500/10 px-5 py-4 text-xs text-red-800 dark:border-red-400/40 dark:bg-red-900/25 dark:text-red-200">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-red-600" />
            <div>
              <strong className="block text-sm font-extrabold">
                Сегодня требуется уход ({allDueToday.length})
              </strong>
              <span>
                {allDueToday
                  .slice(0, 3)
                  .map((t) => `${t.plantName}: ${t.action}`)
                  .join(' • ')}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedDateKey(todayKey);
              setWeekOffset(0);
              setSelectedId(allDueToday[0].plantId);
            }}
            className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
          >
            Перейти к задачам
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[360px_1fr]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Мои растения ({userPlants.length})</h2>
            {totalPlantPages > 1 && (
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setPlantPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="rounded-full bg-card px-2.5 py-1 disabled:opacity-40 dark:bg-[#3b3a30]"
                >
                  ←
                </button>
                <span className="text-[11px] text-ink/70 dark:text-[#f1e6d1]/70">
                  {safePage + 1}/{totalPlantPages}
                </span>
                <button
                  onClick={() => setPlantPage((p) => Math.min(totalPlantPages - 1, p + 1))}
                  disabled={safePage >= totalPlantPages - 1}
                  className="rounded-full bg-card px-2.5 py-1 disabled:opacity-40 dark:bg-[#3b3a30]"
                >
                  →
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 animate-pulse rounded-full bg-card/70 dark:bg-[#3b3a30]" />
              ))}
            </div>
          ) : visiblePlants.length > 0 ? (
            <div className="space-y-3">
              {visiblePlants.map((item) => {
                const img = item.image_url || item.plants?.image_url;
                const active = selectedId === item.id;
                const needsCare = (dueByPlant[item.id] || []).length > 0;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 rounded-full p-2 pr-4 transition ${
                      active
                        ? 'bg-olive text-cream shadow-md'
                        : 'bg-card text-ink shadow-sm hover:bg-pale dark:bg-[#3b3a30] dark:text-[#f1e6d1]'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedId(item.id)}
                      className="flex flex-1 items-center gap-3 rounded-full text-left focus-visible:ring-0"
                    >
                      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cream dark:bg-[#303129]">
                        {img ? (
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-base">🌿</span>
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <strong className="block truncate text-sm font-extrabold">
                          {item.nickname || item.plants?.name || 'Растение'}
                        </strong>
                        {needsCare && (
                          <span
                            className={`text-[10px] font-bold ${
                              active ? 'text-red-200' : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            ● Требуется уход сегодня
                          </span>
                        )}
                      </div>
                    </button>

                    {needsCare && (
                      <span title="Нужен уход" className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-600" />
                    )}

                    <button
                      onClick={() => setPlantToDelete(item)}
                      title="Удалить"
                      aria-label="Удалить растение"
                      className={`px-1.5 text-sm font-bold opacity-70 hover:opacity-100 ${
                        active ? 'text-cream' : 'text-ink dark:text-[#f1e6d1]'
                      }`}
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
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-full border-2 border-dashed border-olive bg-card/50 py-3.5 text-sm font-extrabold text-ink/80 transition hover:bg-card dark:bg-[#3b3a30]/50 dark:text-[#f1e6d1]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-olive text-base text-cream">
              ＋
            </span>
            Добавить растение
          </button>
        </div>

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
                  setSelectedDateKey(todayKey);
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

          <div className="grid grid-cols-7 gap-2.5">
            {weekDays.map((day) => {
              const isSelected = selectedDateKey === day.key;
              const hasLogs = (logsByDay[day.key] || []).length > 0;
              const isTodayDue = day.key === todayKey && allDueToday.length > 0;

              return (
                <button
                  key={day.key}
                  onClick={() => setSelectedDateKey(day.key)}
                  className={`relative flex flex-col items-center rounded-2xl py-3 shadow-sm transition ${
                    isSelected
                      ? 'bg-olive text-cream'
                      : 'bg-cream text-ink/60 hover:bg-pale dark:bg-[#303129] dark:text-[#f1e6d1]/70'
                  }`}
                >
                  {isTodayDue && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600" />
                  )}
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

          <div className="mt-5 overflow-hidden rounded-2xl bg-cream shadow-sm dark:bg-[#303129]">
            <div className="flex items-center justify-between bg-[#ebd9bb] px-5 py-3 text-sm font-extrabold dark:bg-[#3d3b30]">
              <span>Чек-лист на {selectedDayNum} число</span>
              {selectedPlantObj && (
                <span className="text-xs font-semibold text-ink/70 dark:text-[#f1e6d1]/70">
                  {selectedPlantObj.nickname || selectedPlantObj.plants?.name}
                </span>
              )}
            </div>

            <div className="p-5">
              {selectedDateKey === todayKey && selectedPlantDue.length > 0 && selectedPlantObj && (
                <div className="mb-4 space-y-2 rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-xs">
                  {selectedPlantDue.map((task) => (
                    <div key={task.action} className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <strong className="text-red-700 dark:text-red-300">
                          ● {task.action} ({selectedPlantObj.nickname || selectedPlantObj.plants?.name})
                        </strong>
                        <p className="text-[11px] text-ink/75 dark:text-[#f1e6d1]/75">{task.hint}</p>
                      </div>
                      <div className="flex gap-2">
                        {task.action.includes('удобр') && (
                          <button
                            onClick={() => go('map')}
                            className="rounded-full bg-tan px-3 py-1 text-[11px] font-bold text-cream"
                          >
                            К карте
                          </button>
                        )}
                        <button
                          onClick={() => logAction(task.action, selectedPlantObj.id)}
                          className="rounded-full bg-olive px-3 py-1 text-[11px] font-bold text-cream"
                        >
                          Выполнить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedDayLogs.length > 0 ? (
                <ul className="mb-4 space-y-2 text-xs">
                  {selectedDayLogs.map((log) => {
                    const actionTitle = log.care_action_types?.name || '';
                    const isFertilizer =
                      actionTitle.toLowerCase().includes('удобр') ||
                      actionTitle.toLowerCase().includes('прикорм');
                    return (
                      <li key={log.id} className="flex flex-wrap items-center justify-between gap-2">
                        <span>
                          ✓ <strong>{actionTitle}</strong> —{' '}
                          {log.user_plants?.nickname || log.user_plants?.plants?.name || 'Растение'}
                        </span>
                        <div className="flex items-center gap-2">
                          {isFertilizer && (
                            <button
                              type="button"
                              onClick={() => go('map')}
                              className="rounded-full bg-tan px-3 py-0.5 text-[11px] font-bold text-cream hover:opacity-90"
                            >
                              К карте →
                            </button>
                          )}
                          <span className="text-ink/55 dark:text-[#f1e6d1]/55">
                            {new Date(log.action_date).toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mb-4 text-sm font-bold text-ink/70 dark:text-[#f1e6d1]/75">
                  На этот день выполненных задач нет, растение отдыхает 🌿
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 border-t border-line/40 pt-3 dark:border-[#68644e]">
                {careActions.map((action) => {
                  const isFertilizer =
                    action.name.toLowerCase().includes('удобр') ||
                    action.name.toLowerCase().includes('прикорм');
                  return (
                    <div key={action.id} className="flex items-center gap-1.5">
                      <button
                        onClick={() => logAction(action.name)}
                        className="rounded-full bg-olive px-3.5 py-1.5 text-[11px] font-bold text-cream hover:opacity-90"
                      >
                        ＋ {action.name}
                      </button>
                      {isFertilizer && (
                        <button
                          type="button"
                          onClick={() => go('map')}
                          className="rounded-full bg-tan px-3 py-1.5 text-[11px] font-bold text-cream hover:opacity-90"
                        >
                          К карте
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2 border-t border-line/40 pt-3 dark:border-[#68644e]">
                {careActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => logAction(action.name)}
                    className="rounded-full bg-olive px-3.5 py-1.5 text-[11px] font-bold text-cream hover:opacity-90"
                  >
                    ＋ {action.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-10">
        <button
          type="button"
          onClick={() => setHistoryOpen((v) => !v)}
          className="mb-4 flex w-full items-center justify-between rounded-2xl bg-card px-6 py-4 text-left shadow-sm transition hover:bg-pale dark:bg-[#3b3a30]"
        >
          <span className="text-xl font-extrabold">История ухода ({logs.length})</span>
          <span className="text-sm font-bold text-olive">
            {historyOpen ? 'Свернуть ▲' : 'Развернуть ▼'}
          </span>
        </button>

        {historyOpen && (
          <div className="rounded-[28px] bg-card p-5 shadow-sm dark:bg-[#3b3a30]">
            <div className="max-h-[380px] divide-y divide-line/50 overflow-y-auto rounded-2xl bg-cream px-6 py-2 dark:divide-[#68644e] dark:bg-[#303129]">
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
        )}
      </section>

      {plantToDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl border-2 border-line bg-cream p-6 shadow-xl dark:border-[#68644e] dark:bg-[#3b3a30]">
            <h3 className="text-lg font-black">Удалить растение?</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink/75 dark:text-[#f1e6d1]/75">
              Вы действительно хотите удалить{' '}
              <strong>{plantToDelete.nickname || plantToDelete.plants?.name}</strong> из своего
              ухода? История ухода за этим растением также будет удалена.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setPlantToDelete(null)}
                className="rounded-full border border-line px-5 py-2 text-xs font-semibold"
              >
                Отмена
              </button>
              <button
                onClick={confirmDeletePlant}
                className="rounded-full bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}