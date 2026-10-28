import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const emptyForm = { name: '', description: '', treatment: '' };

export default function ExpertPanel({ go, notify }) {
  const [form, setForm] = useState(emptyForm);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadProblems() {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API_URL}/api/problems`);
      if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);
      const data = await response.json();
      setProblems(Array.isArray(data) ? data : data.data || []);
    } catch (err) { setError(`${err.message}. Проверь backend и подключение к БД.`); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadProblems(); }, []);
  function change(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const response = await fetch(`${API_URL}/api/problems`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `Не удалось сохранить (${response.status})`);
      setForm(emptyForm); await loadProblems(); notify?.('Материал сохранён в базе данных.');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }
  return <main className="page">
    <button className="back-link" onClick={() => go('home')}>← На главную</button>
    <h1 className="section-title">Панель эксперта</h1>
    <p>Добавление проверенных материалов о болезнях и вредителях растений.</p>
    <form onSubmit={submit} className="db-empty" style={{ textAlign: 'left', marginBottom: 28 }}>
      <h2>Новый материал</h2>
      <label>Название проблемы *<input name="name" value={form.name} onChange={change} required maxLength={255} /></label>
      <label>Описание симптомов *<textarea name="description" value={form.description} onChange={change} required rows={3} /></label>
      <label>Рекомендации по лечению *<textarea name="treatment" value={form.treatment} onChange={change} required rows={3} /></label>
      <button className="olive-button" type="submit" disabled={saving}>{saving ? 'Сохранение…' : 'Сохранить материал'}</button>
      {error && <p role="alert">{error}</p>}
    </form>
    <h2 className="section-title">Материалы в базе ({problems.length})</h2>
    {loading ? (
      <p>Загрузка списка…</p>
    ) : problems.length ? (
      <div className="catalog-grid">
        {problems.map((problem) => (
          <article className="catalog-plant-card" key={problem.id}>
            <strong>{problem.name}</strong>
            <p>{problem.description}</p>
            <small>
              <b>Лечение:</b> {problem.treatment}
            </small>
          </article>
        ))}
      </div>
    ) : (
      <p>Записей пока нет.</p>
    )}
    <button className="back-link" onClick={loadProblems}>Обновить список</button>
  </main>;
}
