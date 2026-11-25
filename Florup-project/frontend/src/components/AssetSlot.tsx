interface AssetSlotProps {
  name: 'hero-icon-1' | 'hero-icon-2' | 'hero-icon-3' | 'hero-icon-4' | 'hero-icon-5';
  className?: string;
  label?: string;
}

function DefaultIcon({ name }: { name: AssetSlotProps['name'] }) {
  const iconClass = 'h-7 w-7 sm:h-8 sm:w-8 text-olive dark:text-[#d5d19b]';

  switch (name) {
    case 'hero-icon-1': // Лейка
      return (
        <svg viewBox="5 10 30 22" className={iconClass} fill="currentColor">
          <rect x="16" y="15" width="12" height="13" rx="2" />
          <path d="M28 18c3 0 5 2 5 5s-2 5-5 5v-2c1.8 0 3-1.2 3-3s-1.2-3-3-3v-2z" />
          <path d="M16 22l-8-5-1.5 2 9.5 6z" />
          <circle cx="7" cy="16" r="2" />
        </svg>
      );
    case 'hero-icon-2': // Ножницы
      return (
        <svg viewBox="8 9 24 22" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <circle cx="13" cy="14" r="3.5" />
          <circle cx="13" cy="26" r="3.5" />
          <path d="M16 16l13 9M16 24l13-9" />
        </svg>
      );
    case 'hero-icon-3': // Солнце
      return (
        <svg viewBox="5 5 30 30" className={iconClass} fill="currentColor">
          <circle cx="20" cy="20" r="6" />
          <path
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            d="M20 7v4M20 29v4M7 20h4M29 20h4M11 11l2.8 2.8M26.2 26.2L29 29M29 11l-2.8 2.8M13.8 26.2L11 29"
          />
        </svg>
      );
    case 'hero-icon-4': // Рыхлитель/грабли
      return (
        <svg viewBox="9 9 22 22" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <path d="M13 27l9-9M20 13l7 7M22 11l3 3M26 15l3 3M24 19l3 3" />
        </svg>
      );
    case 'hero-icon-5': // Термометр
      return (
        <svg viewBox="10 7 20 28" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <path d="M20 9a3 3 0 0 0-3 3v11.5a5 5 0 1 0 6 0V12a3 3 0 0 0-3-3z" />
          <circle cx="20" cy="27.5" r="2.2" fill="currentColor" />
        </svg>
      );
  }
}

export default function AssetSlot({ name, className = '', label = '' }: AssetSlotProps) {
  return (
    <span
      className={`flex items-center justify-center rounded-full border border-line/40 bg-card shadow-sm dark:border-[#68644e] dark:bg-[#3b3a30] ${className}`}
      role="img"
      aria-label={label}
    >
      <DefaultIcon name={name} />
    </span>
  );
}