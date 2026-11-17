import { useState } from 'react';
import { apiFetch } from '../utils/api.js';

const emptyForm = {
  name: '',
  latin_name: '',
  description: '',
  image_url: '',
  care_watering_text: '',
  care_lighting_text: '',
  care_temp_text: '',
};

export default function AdminPanel({ go, plants, refreshData, notify }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const change = (e) => setForm((cur) => ({ ...cur, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiFetch('/api/plants', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm(emptyForm);
      await refreshData();
      notify('Растение сохранено в базе данных и добавлено в каталог!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-8">
      <button className="mb-6 text-xs text-tan hover:underline" onClick={() => go('catalog')}>
        ← Перейти в каталог
      </button>
      <h1 className="text-3xl font-black">Панель администратора</h1>
      <p className="mt-2 text-xs text-ink/70 dark:text-[#f1e6d1]/70">
        Добавление растений в каталог Florup (таблица public.plants).
      </p>

      <form onSubmit={submit} className="my-6 space-y-4 rounded-3xl bg-card p-6 dark:bg-[#3b3a30]">
        <h2 className="text-lg font-bold">Новое растение</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            name="name"
            value={form.name}
            onChange={change}
            required
            placeholder="Название *"
            className="h-11 rounded-xl border border-line bg-cream px-4 text-xs dark:border-[#68644e] dark:bg-[#303129]"
          />
          <input
            name="latin_name"
            value={form.latin_name}
            onChange={change}
            placeholder="Латинское название"
            className="h-11 rounded-xl border border-line bg-cream px-4 text-xs dark:border-[#68644e] dark:bg-[#303129]"
          />
        </div>
        <input
          name="image_url"
          value={form.image_url}
          onChange={change}
          placeholder="Ссылка на фото (https://...)"
          className="h-11 w-full rounded-xl border border-line bg-cream px-4 text-xs dark:border-[#68644e] dark:bg-[#303129]"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={change}
          rows={3}
          placeholder="Описание"
          className="w-full rounded-xl border border-line bg-cream p-4 text-xs dark:border-[#68644e] dark:bg-[#303129]"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <textarea
            name="care_watering_text"
            value={form.care_watering_text}
            onChange={change}
            rows={2}
            placeholder="Полив"
            className="rounded-xl border border-line bg-cream p-3 text-xs dark:border-[#68644e] dark:bg-[#303129]"
          />
          <textarea
            name="care_lighting_text"
            value={form.care_lighting_text}
            onChange={change}
            rows={2}
            placeholder="Освещение"
            className="rounded-xl border border-line bg-cream p-3 text-xs dark:border-[#68644e] dark:bg-[#303129]"
          />
          <textarea
            name="care_temp_text"
            value={form.care_temp_text}
            onChange={change}
            rows={2}
            placeholder="Температура"
            className="rounded-xl border border-line bg-cream p-3 text-xs dark:border-[#68644e] dark:bg-[#303129]"
          />
        </div>
        {error && <p className="text-xs font-semibold text-red-700">{error}</p>}
        <button
          disabled={saving}
          className="rounded-full bg-olive px-6 py-3 text-xs font-bold text-cream disabled:opacity-50"
        >
          {saving ? 'Сохранение…' : 'Сохранить растение'}
        </button>
      </form>

      <h2 className="mb-4 text-xl font-bold">Растения в базе ({plants.length})</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {plants.map((p) => (
          <div key={p.id} className="rounded-2xl bg-card p-4 text-xs dark:bg-[#3b3a30]">
            <strong className="block text-sm">{p.name}</strong>
            <span className="italic text-ink/60">{p.latin_name}</span>
          </div>
        ))}
      </div>
    </main>
  );
}