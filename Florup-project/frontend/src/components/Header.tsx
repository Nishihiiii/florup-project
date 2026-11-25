import type { PageId, UserProfile } from '../types.ts';
import Logo from './Logo.js';

interface HeaderProps {
  page: PageId;
  go: (next: PageId) => void;
  user: UserProfile | null;
}

export default function Header({ page, go, user }: HeaderProps) {
  const items: [PageId, string][] = [
    ['catalog', 'Каталог'],
    ['care', 'Уход за растением'],
    ['diagnostics', 'Диагностика'],
    ['map', 'Карта магазинов'],
    ['community', 'Сообщество'],
  ];

  return (
    <header className="sticky top-2 z-50 mx-auto mt-2 flex w-[calc(100%-24px)] max-w-[1396px] flex-wrap items-center justify-between gap-4 rounded-[28px] border-4 border-line/80 bg-olive px-5 py-3 shadow-md transition-colors dark:border-[#5b5a46] dark:bg-[#23251f] md:flex-nowrap md:px-7">
      <button
        className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-[#ecdfc0]"
        onClick={() => go('home')}
        aria-label="Florup — главная"
      >
        <Logo className="h-8 w-8 text-[#ecdfc0]" />
        <span>FLORUP</span>
      </button>

      <nav className="order-3 flex w-full items-center gap-5 overflow-x-auto py-1 md:order-2 md:w-auto md:justify-center">
        {items.map(([id, label]) => (
          <button
            key={id}
            onClick={() => go(id)}
            className={`whitespace-nowrap text-xs font-semibold text-[#ecdfc0] transition hover:underline hover:underline-offset-4 ${
              page === id ? 'underline underline-offset-4' : ''
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="order-2 flex items-center gap-2 md:order-3">
        {user ? (
          <button
            onClick={() => go('profile')}
            title={user.name}
            className="flex items-center gap-2 rounded-full border-2 border-[#ecdfc0]/60 bg-cream/15 p-0.5 pr-3 text-xs font-bold text-[#ecdfc0] transition hover:bg-cream/25"
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-xs font-black text-ink">
                {(user.name || 'П')[0].toUpperCase()}
              </span>
            )}
            <span className="hidden sm:inline">Профиль</span>
          </button>
        ) : (
          <button
            className="rounded-xl bg-cream px-5 py-2 text-xs font-bold text-ink transition hover:bg-card dark:bg-[#3b3a30] dark:text-[#f1e6d1]"
            onClick={() => go('login')}
          >
            Войти
          </button>
        )}
      </div>
    </header>
  );
}