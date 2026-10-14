import Placeholder from '../components/Placeholder.jsx';
import AssetSlot from '../components/AssetSlot.jsx';

export default function MapPage({city,setCity,notify}) {
 return <main className="page map-page"><div className="page-heading"><h1>Карта магазинов</h1><p>Поиск товаров, локаций и магазинов рядом с вами.</p></div><div className="map-layout"><aside className="map-filters"><h2>Поиск товаров</h2><label className="field-search"><AssetSlot name="search" className="search-icon-placeholder" label="Место для иконки поиска" /><input value={city} onChange={e=>setCity(e.target.value)} placeholder="Поиск по товарам..."/></label><h3>Список магазинов</h3><div className="shop-empty"><strong>Магазинов пока нет</strong><p>Список появится после подключения реальных данных.</p></div></aside><div className="map-placeholder"><Placeholder label="Здесь будет карта магазинов"/><p>Карта и отметки магазинов будут добавлены позже.</p></div></div></main>;
}
