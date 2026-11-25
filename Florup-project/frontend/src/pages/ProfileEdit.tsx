import { type ChangeEvent, type FormEvent, useState } from 'react';
import Placeholder from '../components/Placeholder.tsx';
import type { PageId, UserProfile } from '../types.ts';
import { apiFetch } from '../utils/api.ts';
import { compressImage } from '../utils/image.ts';

interface ProfileEditProps {
  user: UserProfile;
  setUser: (u: UserProfile) => void;
  go: (next: PageId) => void;
  notify: (msg: string) => void;
}

export default function ProfileEdit({ user, setUser, go, notify }: ProfileEditProps) {
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handlePhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const compressed = await compressImage(file, 400, 0.8);
      setAvatarUrl(compressed);
    } catch (err) {
      notify((err as Error).message);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await apiFetch<{ user: UserProfile }>('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.slice(0, 250),
          avatar_url: avatarUrl,
        }),
      });
      setUser(res.user);
      notify('Профиль успешно обновлён!');
      go('profile');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <button className="mb-6 text-xs text-tan hover:underline" onClick={() => go('profile')}>
        ← Вернуться в профиль...
      </button>

      <form
        onSubmit={submit}
        className="rounded-3xl border-2 border-ink/25 bg-cream p-8 shadow-sm dark:border-[#68644e] dark:bg-[#3b3a30]"
      >
        <h1 className="mb-6 text-3xl font-black">Редактировать профиль</h1>

        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="h-32 w-32 overflow-hidden rounded-full bg-pale shadow-inner">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Аватар" className="h-full w-full object-cover" />
            ) : (
              <Placeholder label="" className="h-full w-full" />
            )}
          </div>
          <label className="cursor-pointer text-xs font-bold text-olive hover:underline">
            Редактировать фото
            <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </label>
        </div>

        <label className="mb-5 flex flex-col gap-2 text-xs font-bold">
          Имя
          <input
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваше имя"
            className="h-11 rounded-2xl border border-line bg-card px-4 text-xs font-medium dark:border-[#68644e] dark:bg-[#303129]"
          />
        </label>

        <label className="mb-2 flex flex-col gap-2 text-xs font-bold">
          О себе
          <textarea
            rows={4}
            maxLength={250}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Расскажите о своих любимых растениях…"
            className="rounded-2xl border border-line bg-card p-4 text-xs font-medium dark:border-[#68644e] dark:bg-[#303129]"
          />
        </label>
        <div className="mb-6 text-right text-[11px] text-ink/60 dark:text-[#f1e6d1]/60">
          {bio.length}/250
        </div>

        {error && <p className="mb-4 text-xs font-semibold text-red-700">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => go('profile')}
            className="rounded-full border border-line bg-card px-7 py-2.5 text-xs font-bold hover:bg-pale dark:border-[#68644e] dark:bg-[#303129]"
          >
            Отмена
          </button>
          <button
            disabled={saving}
            className="rounded-full bg-olive px-7 py-2.5 text-xs font-bold text-cream hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </form>
    </main>
  );
}