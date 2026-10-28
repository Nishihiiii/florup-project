export default function Header({ page, go, demoUser }) {
  const items = [
    ['catalog', 'Каталог'],
    ['care', 'Уход за растением'],
    ['diagnostics', 'Диагностика'],
    ['map', 'Карта магазинов'],
    ['community', 'Сообщество'],
  ];

  return (
    <header className="site-header">
      <button
        className="brand"
        onClick={() => go('home')}
        aria-label="Florup — главная"
      >
        <span className="brand-icon-placeholder" />
        <span>FLORUP</span>
      </button>

      <nav className="main-nav" aria-label="Основная навигация">
        {items.map(([id, label]) => (
          <button
            key={id}
            className={page === id ? 'nav-link active' : 'nav-link'}
            onClick={() => go(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <button
        className="header-account"
        onClick={() => go(demoUser ? 'profile' : 'login')}
      >
        {demoUser ? 'Профиль' : 'Войти'}
      </button>

      {demoUser && (
        <button
          className="header-avatar-placeholder"
          title="Открыть профиль"
          onClick={() => go('profile')}
          aria-label="Профиль"
        />
      )}
    </header>
  );
}
