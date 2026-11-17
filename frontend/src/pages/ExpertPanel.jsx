import { useState } from 'react';
import { apiFetch } from '../utils/api.js';

const emptyForm = { name: '', description: '', treatment: '' };

export default function ExpertPanel({ go, problems, refreshData, notify }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const change = (e) => setForm((cur) => ({ ...cur, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiFetch('/api/problems', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm(emptyForm);
      await refreshData();
      notify('Материал сохранён в базе данных!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-8">
      <button className="mb-6 text-xs text-tan hover:underline" onClick={() => go('diagnostics')}>
        ← Перейти к диагностике
      </button>
      <h1 className="text-3xl font-black">Панель эксперта</h1>

      <form onSubmit={submit} className="my-6 space-y-4 rounded-3xl bg-card p-6 dark:bg-[#3b3a30]">
        <input
          name="name"
          value={form.name}
          onChange={change}
          required
          placeholder="Название проблемы *"
          className="h-11 w-full rounded-xl border border-line bg-cream px-4 text-xs dark:border-[#68644e] dark:bg-[#303129]"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={change}
          required
          rows={3}
          placeholder="Описание симптомов *"
          className="w-full rounded-xl border border-line bg-cream p-4 text-xs dark:border-[#68644e] dark:bg-[#303129]"
        />
        <textarea
          name="treatment"
          value={form.treatment}
          onChange={change}
          required
          rows={3}
          placeholder="Рекомендации по лечению *"
          className="w-full rounded-xl border border-line bg-cream p-4 text-xs dark:border-[#68644e] dark:bg-[#303129]"
        />
        {error && <p className="text-xs font-semibold text-red-700">{error}</p>}
        <button
          disabled={saving}
          className="rounded-full bg-olive px-6 py-3 text-xs font-bold text-cream disabled:opacity-50"
        >
          {saving ? 'Сохранение…' : 'Сохранить материал'}
        </button>
      </form>

      <h2 className="mb-4 text-xl font-bold">Материалы в базе ({problems.length})</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {problems.map((p) => (
          <div key={p.id} className="rounded-2xl bg-card p-4 text-xs dark:bg-[#3b3a30]">
            <strong className="block text-sm">{p.name}</strong>
            <p className="mt-1 text-ink/75 dark:text-[#f1e6d1]/75">{p.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}