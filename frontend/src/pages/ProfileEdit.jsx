import { useState } from 'react';
import { apiFetch } from '../utils/api.js';

export default function ProfileEdit({ go, user, setUser, notify }) {
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
  const [saving, setSaving] = useState(false);

  const choosePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name, bio, avatar_url: avatarUrl }),
      });
      setUser(res.user);
      notify('Профиль сохранён!');
      go('profile');
    } catch (err) {
      notify(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <button className="mb-6 text-xs text-tan hover:underline" onClick={() => go('profile')}>
        ← Вернуться в профиль
      </button>

      <form
        onSubmit={save}
        className="rounded-3xl border-2 border-line bg-cream p-8 shadow-sm dark:border-[#68644e] dark:bg-[#3b3a30]"
      >
        <h1 className="mb-6 text-2xl font-black">Редактировать профиль</h1>

        <label className="mb-6 flex cursor-pointer flex-col items-center gap-3">
          <div
            className="flex h-32 w-32 items-center justify-center rounded-full border border-dashed border-tan bg-card bg-cover bg-center text-xs text-tan"
            style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
          >
            {!avatarUrl && '＋ Фото'}
          </div>
          <input type="file" accept="image/*" onChange={choosePhoto} className="hidden" />
          <span className="rounded-full border border-tan px-4 py-1.5 text-xs">Выбрать фотографию</span>
        </label>

        <label className="mb-4 flex flex-col gap-2 text-xs font-semibold">
          Имя
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            className="h-11 rounded-xl border border-line bg-card px-4 text-xs dark:border-[#68644e] dark:bg-[#303129]"
          />
        </label>

        <label className="mb-6 flex flex-col gap-2 text-xs font-semibold">
          О себе
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={250}
            rows={4}
            className="rounded-xl border border-line bg-card p-4 text-xs dark:border-[#68644e] dark:bg-[#303129]"
          />
        </label>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => go('profile')}
            className="rounded-full border border-line px-5 py-2.5 text-xs"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-olive px-6 py-2.5 text-xs font-bold text-cream"
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </form>
    </main>
  );
}