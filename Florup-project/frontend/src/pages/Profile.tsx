import { useEffect, useState } from 'react';
import Placeholder from '../components/Placeholder.tsx';
import type { CommunityPost, PageId, UserPlant, UserProfile } from '../types.ts';
import { apiFetch } from '../utils/api.ts';

interface ProfileProps {
  user: UserProfile;
  go: (next: PageId) => void;
  posts: CommunityPost[];
  refreshUser?: () => Promise<void>;
}

export default function Profile({ user, go, posts, refreshUser }: ProfileProps) {
  const [tab, setTab] = useState<'plants' | 'posts'>('plants');
  const [myPlants, setMyPlants] = useState<UserPlant[]>([]);

  useEffect(() => {
    refreshUser?.();
    apiFetch<UserPlant[]>('/api/user-plants')
      .then((data) => {
        if (Array.isArray(data)) setMyPlants(data);
      })
      .catch(() => {});
  }, [refreshUser]);

  const ownPosts = posts.filter((p) => p.user_id === user.id);
  const totalLikes = ownPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const plantsCount = myPlants.length || user.stats?.plants || 0;
  const likesCount = Math.max(totalLikes, user.stats?.likes || 0);

  const isAdmin = user.role === 'admin';
  const isExpert = user.role === 'expert' || isAdmin;

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-8">
      <button className="mb-6 text-xs text-tan hover:underline" onClick={() => go('community')}>
        ← Вернуться в сообщество
      </button>

      <section className="grid grid-cols-1 items-center gap-8 rounded-3xl border-2 border-ink/20 bg-card p-8 dark:border-[#68644e] dark:bg-[#3b3a30] md:grid-cols-[200px_1fr_auto]">
        <div className="mx-auto h-44 w-44 overflow-hidden rounded-full bg-pale">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            <Placeholder label="" className="h-full w-full" />
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black">{user.name}</h1>
            {user.role !== 'user' && (
              <span className="rounded-full bg-olive px-3 py-1 text-[10px] font-bold uppercase text-cream">
                {user.role === 'admin' ? 'Администратор' : 'Эксперт'}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-ink/70 dark:text-[#f1e6d1]/70">{user.email}</p>
          <p className="mt-4 rounded-2xl border border-tan/50 p-4 text-xs leading-relaxed">
            {user.bio || 'Расскажите о себе и своих растениях.'}
          </p>

          <div className="mt-5 flex gap-8 text-center text-xs">
            <div>
              <b className="block text-xl font-black text-tan">{plantsCount}</b>
              Растения
            </div>
            <div>
              <b className="block text-xl font-black text-tan">{ownPosts.length}</b>
              Публикации
            </div>
            <div>
              <b className="block text-xl font-black text-tan">{likesCount}</b>
              Лайки
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start">
          <button
            onClick={() => go('profile-edit')}
            className="rounded-full bg-ink px-5 py-2.5 text-xs font-bold text-cream hover:opacity-90"
          >
            Редактировать
          </button>
          <button
            onClick={() => go('settings')}
            aria-label="Настройки"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-tan text-base"
          >
            ⚙
          </button>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3 border-b border-line pb-3 dark:border-[#68644e]">
        <button
          onClick={() => setTab('plants')}
          className={`rounded-full px-5 py-2 text-xs font-bold ${tab === 'plants' ? 'bg-olive text-cream' : ''}`}
        >
          Мои растения ({plantsCount})
        </button>
        <button
          onClick={() => setTab('posts')}
          className={`rounded-full px-5 py-2 text-xs font-bold ${tab === 'posts' ? 'bg-olive text-cream' : ''}`}
        >
          Публикации ({ownPosts.length})
        </button>
      </div>

      {tab === 'plants' ? (
        <div className="mt-6 space-y-6">
          {myPlants.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {myPlants.map((item) => (
                <button
                  key={item.id}
                  onClick={() => go('care')}
                  className="flex items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-sm transition hover:bg-pale dark:bg-[#3b3a30]"
                >
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-pale">
                    {(item.image_url || item.plants?.image_url) && (
                      <img
                        src={item.image_url || item.plants?.image_url || ''}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </span>
                  <div>
                    <strong className="block text-sm font-bold">
                      {item.nickname || item.plants?.name || 'Растение'}
                    </strong>
                    <span className="mt-0.5 block text-[11px] text-ink/65 dark:text-[#f1e6d1]/65">
                      Перейти к уходу →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink/70">У вас пока нет добавленных растений.</p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => go('care')}
              className="rounded-full bg-olive px-5 py-2.5 text-xs font-bold text-cream"
            >
              Открыть «Уход и календарь»
            </button>
            {isAdmin && (
              <button
                onClick={() => go('admin')}
                className="rounded-full bg-ink px-5 py-2.5 text-xs font-bold text-cream"
              >
                Панель администратора
              </button>
            )}
            {isExpert && (
              <button
                onClick={() => go('expert')}
                className="rounded-full bg-tan px-5 py-2.5 text-xs font-bold text-cream"
              >
                Панель эксперта
              </button>
            )}
          </div>
        </div>
      ) : ownPosts.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {ownPosts.map((post) => (
            <article key={post.id} className="rounded-2xl bg-card p-5 text-xs dark:bg-[#3b3a30]">
              <p>{post.content}</p>
              <span className="mt-2 block text-ink/60">♥ {post.likes}</span>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-xs text-ink/70">У вас пока нет публикаций.</p>
      )}
    </main>
  );
}