import type { PageId } from '../types.ts';
import Logo from './Logo.js';

interface FooterProps {
  go: (next: PageId) => void;
}

export default function Footer({ go }: FooterProps) {
  const nav: [string, PageId][] = [
    ['Главная страница', 'home'],
    ['Каталог растений', 'catalog'],
    ['Диагностика болезней', 'diagnostics'],
    ['Карта магазинов', 'map'],
  ];

  return (
    <footer className="mt-12 grid grid-cols-1 gap-8 rounded-t-[28px] border-t-8 border-[#e0d2b8] bg-olive px-8 py-8 text-[#ecdfc0] transition-colors dark:border-[#4b4c3d] dark:bg-[#23251f] dark:text-[#f1e6d1] sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <div className="flex items-center gap-2.5">
          <Logo className="h-8 w-8 text-[#ecdfc0]" />
          <strong className="text-2xl font-black">FLORUP</strong>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-[#ecdfc0]/90 dark:text-[#f1e6d1]/75">
          Ваш персональный интерактивный путеводитель по выращиванию и уходу за комнатными растениями.
        </p>
      </div>

      <div className="flex flex-col items-start gap-3">
        <p className="text-sm font-extrabold">Навигация</p>
        {nav.map(([label, target]) => (
          <button
            key={target}
            onClick={() => go(target)}
            className="text-left text-xs text-[#ecdfc0]/90 hover:underline dark:text-[#f1e6d1]/80"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-start gap-3">
        <p className="text-sm font-extrabold">Контакты</p>
        <a
          href="tel:+79533452434"
          className="text-xs text-[#ecdfc0]/90 hover:underline dark:text-[#f1e6d1]/80"
        >
          Телефон: +7 (953)-345-24-34
        </a>
        <a
          href="mailto:fporUp@gmail.com"
          className="text-xs text-[#ecdfc0]/90 hover:underline dark:text-[#f1e6d1]/80"
        >
          Почта: fporUp@gmail.com
        </a>
        <span className="text-xs text-[#ecdfc0]/90 dark:text-[#f1e6d1]/80">
          Адрес офиса: г. Новосибирск, Красный проспект, д. 72
        </span>
      </div>

      <div className="flex flex-col items-start gap-3">
        <p className="text-sm font-extrabold">Соцсети</p>
        <a href="https://vk.com" target="_blank" rel="noreferrer" className="text-xs hover:underline">
          Вконтакте
        </a>
        <a href="https://telegram.org" target="_blank" rel="noreferrer" className="text-xs hover:underline">
          Телеграм
        </a>
        <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-xs hover:underline">
          YouTube
        </a>
      </div>
    </footer>
  );
}