import { useState } from 'react';
import { apiFetch } from '../utils/api.js';

export default function Settings({ user, setUser, go, logout, notify }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  const toggleNotifications = async () => {
    if (!user) return;
    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ push_notifications: !user.push_notifications }),
      });
      setUser(res.user);
    } catch (err) {
      notify(err.message);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <button className="mb-6 text-xs text-tan hover:underline" onClick={() => go('profile')}>
        ← Вернуться в профиль
      </button>

      <div className="rounded-3xl border border-line bg-card p-8 dark:border-[#68644e] dark:bg-[#3b3a30]">
        <h1 className="mb-6 text-3xl font-black">Настройки</h1>

        {user && (
          <div className="flex items-center justify-between border-b border-line/40 py-5 dark:border-[#68644e]">
            <div>
              <strong className="block text-sm">Уведомления</strong>
              <span className="text-xs text-ink/70 dark:text-[#f1e6d1]/70">
                Напоминания об уходе за растениями
              </span>
            </div>
            <button
              role="switch"
              aria-checked={user.push_notifications}
              onClick={toggleNotifications}
              className={`flex h-7 w-12 items-center rounded-full p-1 transition ${
                user.push_notifications ? 'justify-end bg-olive' : 'justify-start bg-line'
              }`}
            >
              <span className="h-5 w-5 rounded-full bg-cream" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-line/40 py-5 dark:border-[#68644e]">
          <div>
            <strong className="block text-sm">Тёмная тема</strong>
            <span className="text-xs text-ink/70 dark:text-[#f1e6d1]/70">
              Переключение светлого и тёмного оформления
            </span>
          </div>
          <button
            role="switch"
            aria-checked={dark}
            onClick={toggleTheme}
            className={`flex h-7 w-12 items-center rounded-full p-1 transition ${
              dark ? 'justify-end bg-olive' : 'justify-start bg-line'
            }`}
          >
            <span className="h-5 w-5 rounded-full bg-cream" />
          </button>
        </div>

        {user && (
          <button
            onClick={logout}
            className="mt-6 w-full rounded-full bg-ink py-3 text-xs font-bold text-cream hover:opacity-90"
          >
            Выйти из аккаунта ({user.email})
          </button>
        )}
      </div>
    </main>
  );
}