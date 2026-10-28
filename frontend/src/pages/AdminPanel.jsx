import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const emptyForm = { name: '', latin_name: '', description: '', care_watering_text: '', care_lighting_text: '', care_temp_text: '' };

export default function AdminPanel({ go, notify }) {
  const [form, setForm] = useState(emptyForm);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadPlants() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/plants`);
      if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);
      const data = await response.json();
      setPlants(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(`${err.message}. Проверь, что backend запущен и подключён к БД.`);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadPlants(); }, []);

  function change(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true); setError('');
    try {
      const response = await fetch(`${API_URL}/api/plants`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `Не удалось сохранить (${response.status})`);
      setForm(emptyForm);
      await loadPlants();
      notify?.('Растение сохранено в базе данных.');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  return <main className="page">
    <button className="back-link" onClick={() => go('home')}>← На главную</button>
    <h1 className="section-title">Панель администратора</h1>
    <p>Добавление растений в каталог Florup. Записи сохраняются в базе данных.</p>
    <form onSubmit={submit} className="db-empty" style={{ textAlign: 'left', marginBottom: 28 }}>
      <h2>Новое растение</h2>
      <label>Название *<input name="name" value={form.name} onChange={change} required maxLength={255} /></label>
      <label>Латинское название<input name="latin_name" value={form.latin_name} onChange={change} maxLength={255} /></label>
      <label>Описание<textarea name="description" value={form.description} onChange={change} rows={3} /></label>
      <label>Полив<textarea name="care_watering_text" value={form.care_watering_text} onChange={change} rows={2} /></label>
      <label>Освещение<textarea name="care_lighting_text" value={form.care_lighting_text} onChange={change} rows={2} /></label>
      <label>Температура<textarea name="care_temp_text" value={form.care_temp_text} onChange={change} rows={2} /></label>
      <button className="olive-button" type="submit" disabled={saving}>{saving ? 'Сохранение…' : 'Сохранить растение'}</button>
      {error && <p role="alert">{error}</p>}
    </form>
    <h2 className="section-title">Растения в базе ({plants.length})</h2>
    {loading ? (
      <p>Загрузка списка…</p>
    ) : plants.length ? (
      <div className="catalog-grid">
        {plants.map((plant) => (
          <article className="catalog-plant-card" key={plant.id}>
            <strong>{plant.name}</strong>
            <small>{plant.latinName || plant.latin_name || ''}</small>
            <p>{plant.description || 'Описание пока не заполнено.'}</p>
          </article>
        ))}
      </div>
    ) : (
      <p>Записей пока нет.</p>
    )}
    <button className="back-link" onClick={loadPlants}>Обновить список</button>
  </main>;
}
