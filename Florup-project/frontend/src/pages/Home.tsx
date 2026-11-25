import { useEffect, useState } from 'react';
import AssetSlot from '../components/AssetSlot.tsx';
import type { Fact, PageId, UserProfile } from '../types.ts';

interface HomeProps {
  go: (next: PageId) => void;
  facts: Fact[];
  user: UserProfile | null;
}

export default function Home({ go, facts, user }: HomeProps) {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    if (facts.length > 0) {
      setFactIndex(Math.floor(Math.random() * facts.length));
    }
  }, [facts.length, user?.id]);

  const currentFact = facts[factIndex];

  const steps: { title: string; text: string; target: PageId }[] = [
    {
      title: 'Выберите растение',
      text: 'Найдите свой цветок в нашем каталоге и узнайте всё о его потребностях в свете, воде и почве.',
      target: 'catalog',
    },
    {
      title: 'Настройте уход',
      text: 'Добавьте растение в свой профиль и ведите удобный журнал поливов, подкормок и пересадок.',
      target: 'care',
    },
    {
      title: 'Лечите и общайтесь',
      text: 'Используйте справочник болезней и делитесь успехами с другими любителями растений.',
      target: 'diagnostics',
    },
  ];

  return (
    <main className="relative z-0 mx-auto max-w-[1430px] px-5 py-8 md:px-10">
      <section className="grid grid-cols-1 items-center gap-10 py-6 lg:grid-cols-[46%_54%]">
        <div>
          <h1 className="text-4xl font-black leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            Вырасти свое <br /> растение
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-ink/75 dark:text-[#f1e6d1]/75 sm:text-base">
            Создайте уют дома. Интерактивные гайды для новичков, диагностика болезней растений и
            удобная карта магазинов в один клик.
          </p>

          <div className="mt-10 max-w-md">
            <div className="flex items-center justify-between rounded-t-3xl bg-tan px-6 pb-8 pt-5 text-xl font-bold text-[#ecdfc0]">
              <span>{currentFact?.title || 'А вы знали...'}</span>
              {facts.length > 1 && (
                <button
                  type="button"
                  onClick={() => setFactIndex((i) => (i + 1) % facts.length)}
                  className="rounded-full bg-cream/20 px-3 py-1 text-[11px] font-semibold text-cream hover:bg-cream/30"
                >
                  Ещё факт ↻
                </button>
              )}
            </div>
            <div className="-mt-4 min-h-[96px] rounded-3xl bg-[#e3c8aa] p-6 text-xs leading-relaxed text-ink shadow-sm dark:bg-[#3d3b30] dark:text-[#f1e6d1] sm:text-sm">
              {currentFact?.content ||
                'Большинство комнатных растений гибнет не от засухи, а от переувлажнения и загнивания корней.'}
            </div>
          </div>
        </div>

        {/* Изоляция z-0: кружки всегда ПОД шапкой (z-50) */}
        <div className="relative z-0 flex flex-col items-center">
          <div className="relative flex h-[480px] w-full max-w-[520px] items-center justify-center">
            <button
              onClick={() => go('care')}
              className="relative z-10 flex h-[390px] w-[250px] items-center justify-center overflow-visible rounded-[52px] bg-card shadow-sm transition hover:scale-[1.02] dark:bg-[#3b3a30] sm:w-[280px]"
              aria-label="Перейти к уходу за растением"
            >
              <img
                src="/assets/images/hero-plant.png"
                alt="Комнатное растение"
                fetchPriority="high"
                className="pointer-events-none h-[440px] w-[320px] max-w-none -translate-y-2 object-contain drop-shadow-sm"
              />
            </button>

            <AssetSlot
              name="hero-icon-1"
              label="Полив"
              className="pointer-events-none absolute right-8 top-4 z-20 h-12 w-12 sm:h-14 sm:w-14"
            />
            <AssetSlot
              name="hero-icon-2"
              label="Обрезка"
              className="pointer-events-none absolute right-2 top-[44%] z-20 h-12 w-12 -translate-y-1/2 sm:h-14 sm:w-14"
            />
            <AssetSlot
              name="hero-icon-3"
              label="Освещение"
              className="pointer-events-none absolute bottom-8 right-10 z-20 h-12 w-12 sm:h-14 sm:w-14"
            />
            <AssetSlot
              name="hero-icon-4"
              label="Грунт"
              className="pointer-events-none absolute left-2 top-[52%] z-20 h-12 w-12 -translate-y-1/2 sm:h-14 sm:w-14"
            />
            <AssetSlot
              name="hero-icon-5"
              label="Температура"
              className="pointer-events-none absolute bottom-6 left-10 z-20 h-12 w-12 sm:h-14 sm:w-14"
            />
          </div>

          <small className="mt-1 text-[11px] text-ink/60 dark:text-[#f1e6d1]/60">
            Кликни на росток, чтобы вырастить
          </small>
          <button
            className="mt-2.5 rounded-full bg-olive px-8 py-3 text-sm font-bold text-[#ecdfc0] shadow hover:opacity-90"
            onClick={() => go('catalog')}
          >
            В каталог
          </button>
        </div>
      </section>

      <div className="my-14 h-px bg-line/70 dark:bg-[#68644e]" />

      {/* О НАС */}
      <section className="py-4">
        <div className="mb-12">
          <h2 className="text-4xl font-black tracking-tight sm:text-6xl">О НАС</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink/75 dark:text-[#f1e6d1]/75 sm:text-base">
            Интерактивный путеводитель с понятными пошаговыми гайдами от наших экспертов, который
            поможет каждому легко разобраться в уходе за растениями.
          </p>
        </div>

        <div className="mx-auto grid max-w-[1040px] grid-cols-1 items-start gap-8 md:grid-cols-3">
          <article className="mx-auto flex w-full max-w-[290px] flex-col items-center">
            <div className="relative flex h-[340px] w-full items-end justify-center overflow-visible">
              <div className="absolute inset-x-0 bottom-0 h-[290px] rounded-t-3xl bg-card dark:bg-[#3b3a30]" />
              <img
                src="/assets/images/team-lizaveta.jpg"
                alt="Лизавета — Фитодизайнер интерьеров"
                className="relative z-10 h-[330px] w-full rounded-t-3xl object-cover object-top"
              />
            </div>
            <div className="relative z-20 w-full rounded-b-2xl bg-olive py-4 text-center text-xl font-extrabold text-[#ecdfc0]">
              Лизавета
            </div>
            <p className="mt-3 text-center text-sm font-medium">Фитодизайнер интерьеров</p>
          </article>

          <article className="mx-auto flex w-full max-w-[290px] flex-col items-center md:mt-12">
            <p className="mb-3 text-center text-sm font-medium">Главный агроном проекта</p>
            <div className="relative flex h-[340px] w-full items-end justify-center overflow-visible">
              <div className="absolute inset-x-0 bottom-0 h-[290px] rounded-t-3xl bg-card dark:bg-[#3b3a30]" />
              <img
                src="/assets/images/team-evsey.jpg"
                alt="Евсей — Главный агроном проекта"
                className="relative z-10 h-[330px] w-full rounded-t-3xl object-cover object-[50%_10%]"
              />
            </div>
            <div className="relative z-20 w-full rounded-b-2xl bg-olive py-4 text-center text-xl font-extrabold text-[#ecdfc0]">
              Евсей
            </div>
          </article>

          <article className="mx-auto flex w-full max-w-[290px] flex-col items-center">
            <div className="relative flex h-[340px] w-full items-end justify-center overflow-visible">
              <div className="absolute inset-x-0 bottom-0 h-[290px] rounded-t-3xl bg-card dark:bg-[#3b3a30]" />
              <img
                src="/assets/images/team-anfisa.jpg"
                alt="Анфиса — Специалист по экобезопасности"
                className="relative z-10 h-[335px] w-full rounded-t-3xl object-contain object-bottom"
              />
            </div>
            <div className="relative z-20 w-full rounded-b-2xl bg-olive py-4 text-center text-xl font-extrabold text-[#ecdfc0]">
              Анфиса
            </div>
            <p className="mt-3 text-center text-sm font-medium">Специалист по экобезопасности</p>
          </article>
        </div>
      </section>

      <div className="my-14 h-px bg-line/70 dark:bg-[#68644e]" />

      {/* Как мы помогаем? */}
      <section className="py-4">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">Как мы помогаем?</h2>
          <p className="mt-3 text-sm text-ink/75 dark:text-[#f1e6d1]/75 sm:text-base">
            Три простых шага к здоровым и красивым растениям в вашем доме.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map(({ title, text, target }, idx) => (
            <article
              key={title}
              className="relative flex min-h-[280px] flex-col justify-between rounded-3xl bg-card p-8 pt-12 shadow dark:bg-[#3b3a30]"
            >
              <span className="absolute -top-6 right-5 flex h-14 w-14 items-center justify-center rounded-full border-4 border-cream bg-olive text-2xl font-black text-[#ecdfc0] dark:border-[#292b25]">
                {idx + 1}
              </span>
              <div>
                <h3 className="mb-4 text-xl font-extrabold">{title}</h3>
                <p className="text-xs leading-relaxed text-ink/80 dark:text-[#f1e6d1]/80 sm:text-sm">
                  {text}
                </p>
              </div>
              <button
                onClick={() => go(target)}
                aria-label={title}
                className="mt-6 self-end text-2xl font-bold text-olive hover:translate-x-1"
              >
                ↗
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}