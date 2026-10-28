export default function Footer({ go }) {
  const link = (label, target) => (
    <button key={label} onClick={() => go(target)}>
      {label}
    </button>
  );

  return (
    <footer className="site-footer">
      <div className="footer-brand-block">
        <div className="footer-logo-row">
          <span className="footer-logo-placeholder" />
          <strong>FLORUP</strong>
        </div>
        <p>
          Ваш персональный интерактивный путеводитель по выращиванию и уходу за
          комнатными растениями.
        </p>
      </div>

      <div className="footer-column">
        <h3>Навигация</h3>
        {link('Главная страница', 'home')}
        {link('Каталог растений', 'catalog')}
        {link('Диагностика болезней', 'diagnostics')}
        {link('Карта магазинов', 'map')}
      </div>

      <div className="footer-column">
        <h3>Контакты</h3>
        <a href="tel:+79533452434">Телефон: +7 (953)-345-24-34</a>
        <a href="mailto:fporUp@gmail.com">Почта: fporUp@gmail.com</a>
        <span>Адрес офиса: г. Новосибирск, Красный проспект, д. 72</span>
      </div>

      <div className="footer-column">
        <h3>Соцсети</h3>
        <a href="https://vk.com" target="_blank" rel="noreferrer">
          Вконтакте
        </a>
        <a href="https://telegram.org" target="_blank" rel="noreferrer">
          Телеграм
        </a>
        <a href="https://youtube.com" target="_blank" rel="noreferrer">
          YouTube
        </a>
      </div>
    </footer>
  );
}
