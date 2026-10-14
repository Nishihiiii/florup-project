import { useMemo } from 'react';

export default function Catalog({ plants, plantSearch, setPlantSearch, setSelectedPlant, apiState, go }) {
  const shown = useMemo(
    () => plants.filter((plant) => `${plant.name || ''} ${plant.latinName || plant.latin_name || ''}`.toLowerCase().includes(plantSearch.toLowerCase())),
    [plants, plantSearch],
  );

  const openPreview = () => {
    setSelectedPlant({
      id: 'preview-plant',
      name: 'Растение',
      latin_name: '',
      description: '',
      image_url: null,
      care_watering_text: '',
      care_lighting_text: '',
      care_temp_text: '',
      __preview: true,
    });
    go('plant');
  };

  return (
    <main className="page catalog-page">
      <div className="page-heading">
        <h1>Каталог</h1>
        <p>Выберите растение, чтобы узнать о его потребностях и уходе.</p>
      </div>
      <div className="catalog-search">
        <input value={plantSearch} onChange={(event) => setPlantSearch(event.target.value)} placeholder="Поиск растения по названию…" />
        <button className="olive-button" onClick={() => setPlantSearch('')}>Сбросить поиск</button>
      </div>
      <div className="catalog-chips">
        <button className="selected" onClick={() => setPlantSearch('')}>Все растения</button>
      </div>
      {shown.length > 0 ? (
        <div className="catalog-grid">
          {shown.map((plant) => (
            <button className="catalog-plant-card" key={plant.id} onClick={() => { setSelectedPlant(plant); go('plant'); }}>
              <div className="catalog-plant-image">
                {plant.image_url || plant.imageUrl
                  ? <img src={plant.image_url || plant.imageUrl} alt={plant.name} />
                  : <div className="db-image-placeholder" aria-label="Место для фотографии" />}
              </div>
              <strong>{plant.name}</strong>
              <small>{plant.latin_name || plant.latinName || ''}</small>
              <span className="plant-card-pill">Подробнее</span>
            </button>
          ))}
        </div>
      ) : !plantSearch.trim() ? (
        <div className="catalog-grid catalog-preview-grid">
          <button className="catalog-plant-card catalog-preview-card" onClick={openPreview} aria-label="Открыть пример подробной карточки растения">
            <div className="catalog-plant-image"><div className="db-image-placeholder" aria-label="Место для фотографии растения" /></div>
            <strong aria-hidden="true">&nbsp;</strong>
            <small aria-hidden="true">&nbsp;</small>
            <span className="plant-card-pill">Подробнее</span>
          </button>
        </div>
      ) : (
        <div className="db-empty">
          <h2>{apiState === 'offline' ? 'Не удалось загрузить каталог' : 'Ничего не найдено'}</h2>
          <p>Попробуйте изменить поисковый запрос.</p>
        </div>
      )}
    </main>
  );
}
