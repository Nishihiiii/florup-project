export default function Header({ page, go, user }) {
  const items = [
    ['catalog', 'Каталог'],
    ['care', 'Уход за растением'],
    ['diagnostics', 'Диагностика'],
    ['map', 'Карта'],
    ['community', 'Сообщество'],
  ];

  return (
    <header className="sticky top-2 z-20 mx-auto mt-2 flex w-[calc(100%-24px)] max-w-[1396px] flex-wrap items-center justify-between gap-4 rounded-[28px] border-4 border-line/80 bg-olive px-5 py-3 shadow-md md:flex-nowrap md:px-7">
      <button
        className="flex items-center gap-2 text-2xl font-black tracking-tight text-[#ecdfc0]"
        onClick={() => go('home')}
        aria-label="Florup — главная"
      >
        <span className="inline-block h-5 w-5 rounded-full border border-dashed border-[#ecdfc0]/60" />
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
        <button
          className="rounded-xl bg-cream px-5 py-2 text-xs font-bold text-ink transition hover:bg-card"
          onClick={() => go(user ? 'profile' : 'login')}
        >
          {user ? 'Профиль' : 'Войти'}
        </button>
      </div>
    </header>
  );
}