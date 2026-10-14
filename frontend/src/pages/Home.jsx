import Placeholder from '../components/Placeholder.jsx';
import AssetSlot from '../components/AssetSlot.jsx';

export default function Home({ go }) {
  const steps = [
    {
      title: 'Выберите растение',
      text: 'Найдите свой цветок в нашем обширном каталоге. Узнайте всё о его потребностях в свете, воде и почве.',
      target: 'catalog',
    },
    {
      title: 'Настройте уход',
      text: 'Добавьте растение в свой профиль. Наш умный календарь напомнит вам, когда пора поливать или удобрять.',
      target: 'care',
    },
    {
      title: 'Лечите и общайтесь',
      text: 'Используйте диагностику по фото при болезнях и делитесь успехами с другими любителями растений.',
      target: 'diagnostics',
    },
  ];

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <h1>Вырасти свое<br />растение</h1>
          <p className="hero-description">
            Создайте уют дома. Интерактивные гайды для новичков, диагностика болезней растений и удобная карта магазинов в один клик.
          </p>
          <div className="fact-card">
            <strong>А вы знали...</strong>
            <p>Венерина мухоловка может захлопывать листья-ловушки, реагируя на прикосновение насекомого.</p>
          </div>
        </div>

        <div className="hero-art-wrap">
          <button
            className="hero-plant-button hero-image-placeholder"
            onClick={() => go('care')}
            aria-label="Перейти к уходу за растениями"
          >
            <span className="hero-art-bg" />
            <span className="placeholder-image-mark" aria-hidden="true">＋</span>
            <span className="placeholder-image-label">Место для изображения растения</span>
          </button>
          <AssetSlot name="hero-icon-1" className="hero-icon-placeholder icon-one" label="Место для первой иконки" />
          <AssetSlot name="hero-icon-2" className="hero-icon-placeholder icon-two" label="Место для второй иконки" />
          <AssetSlot name="hero-icon-3" className="hero-icon-placeholder icon-three" label="Место для третьей иконки" />
          <AssetSlot name="hero-icon-4" className="hero-icon-placeholder icon-four" label="Место для четвёртой иконки" />
          <AssetSlot name="hero-icon-5" className="hero-icon-placeholder icon-five" label="Место для пятой иконки" />
          <button className="hero-catalog-button" onClick={() => go('catalog')}>В каталог</button>
          <small className="hero-hint">Кликни на росток, чтобы вырастить</small>
        </div>
      </section>

      <section className="home-about">
        <div className="section-rule" />
        <div className="about-intro">
          <h2>О НАС</h2>
          <p>Интерактивный путеводитель с понятными пошаговыми гайдами от наших экспертов, который поможет каждому легко разобраться в уходе за растениями.</p>
        </div>
        <div className="team-grid">
          {[
            ['Лизавета', 'Фитодизайнер интерьеров'],
            ['Евсей', 'Главный агроном проекта'],
            ['Анфиса', 'Специалист по экобезопасности'],
          ].map(([name, role]) => (
            <article className={`team-card team-${name.toLowerCase()}`} key={name}>
              <Placeholder label="Место для фотографии" />
              <div className="team-name"><strong>{name}</strong></div>
              <div className="team-role">{role}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-help">
        <div className="section-rule" />
        <div className="help-heading">
          <h2>Как мы помогаем?</h2>
          <p>Три простых шага к здоровым и красивым растениям в вашем доме.</p>
        </div>
        <div className="steps-grid">
          {steps.map(({ title, text, target }, index) => (
            <article className="step-card" key={title}>
              <span className="step-number">{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <button onClick={() => go(target)} aria-label={title}>↗</button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
