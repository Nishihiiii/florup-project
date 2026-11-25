import { type ChangeEvent, useMemo, useState } from 'react';
import type { CommunityPost, PageId, PostComment, UserProfile } from '../types.ts';
import { apiFetch } from '../utils/api.ts';
import { compressImage } from '../utils/image.ts';

interface CommunityProps {
  posts: CommunityPost[];
  setPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>;
  apiState: 'loading' | 'ready' | 'offline';
  user: UserProfile | null;
  go: (next: PageId) => void;
  notify: (msg: string) => void;
}

export default function Community({
  posts,
  setPosts,
  apiState,
  user,
  go,
  notify,
}: CommunityProps) {
  const [creating, setCreating] = useState(false);
  const [content, setContent] = useState('');
  const [photo, setPhoto] = useState('');
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');

  const choosePhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const compressed = await compressImage(file, 1000, 0.8);
      setPhoto(compressed);
    } catch (err) {
      notify((err as Error).message);
    }
  };

  const sortedPosts = useMemo(() => {
    const list = [...posts];
    if (sortBy === 'oldest') {
      return list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    if (sortBy === 'popular') {
      return list.sort(
        (a, b) =>
          (b.likes || 0) - (a.likes || 0) ||
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [posts, sortBy]);

  const publish = async () => {
    if (!user) return go('login');
    if (!content.trim()) return notify('Напишите текст публикации.');

    try {
      const created = await apiFetch<CommunityPost>('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ content, imageUrl: photo }),
      });
      setPosts((prev) => [created, ...prev]);
      setContent('');
      setPhoto('');
      setCreating(false);
      notify('Публикация сохранена!');
    } catch (err) {
      notify((err as Error).message);
    }
  };

  const deletePost = async (postId: string) => {
    if (!window.confirm('Удалить эту публикацию?')) return;
    try {
      await apiFetch(`/api/posts/${postId}`, { method: 'DELETE' });
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      notify('Публикация удалена.');
    } catch (err) {
      notify((err as Error).message);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return go('login');
    try {
      const res = await apiFetch<{ likes: number; likedByMe: boolean }>(`/api/posts/${postId}/like`, {
        method: 'POST',
      });
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: res.likes, likedByMe: res.likedByMe } : p)),
      );
    } catch (err) {
      notify((err as Error).message);
    }
  };

  const toggleComments = (postId: string) => {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const addComment = async (postId: string) => {
    if (!user) return go('login');
    const text = (commentText[postId] || '').trim();
    if (!text) return;
    try {
      const created = await apiFetch<PostComment>(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: text }),
      });
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments: [...(p.comments || []), created] } : p)),
      );
      setCommentText((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      notify((err as Error).message);
    }
  };

  return (
    <main className="mx-auto max-w-[1040px] px-5 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Сообщество</h1>
          <p className="mt-2 text-sm text-ink/75 dark:text-[#f1e6d1]/75">
            Делитесь успехами и вдохновляйте других любителей растений.
          </p>
        </div>
        <button
          onClick={() => (user ? setCreating((v) => !v) : go('login'))}
          className="rounded-full bg-olive px-6 py-3 text-xs font-bold text-cream hover:opacity-90"
        >
          {creating ? 'Отменить' : 'Новая запись ＋'}
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {(
          [
            ['newest', 'Сначала новые'],
            ['oldest', 'Сначала старые'],
            ['popular', 'Популярные'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSortBy(id)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              sortBy === id
                ? 'bg-olive text-cream'
                : 'border border-line bg-card text-ink/80 hover:bg-pale dark:border-[#68644e] dark:bg-[#3b3a30] dark:text-[#f1e6d1]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {creating && (
        <section className="mb-8 rounded-3xl bg-card p-6 dark:bg-[#3b3a30]">
          <h2 className="mb-3 text-lg font-bold">Создать публикацию</h2>
          <textarea
            value={content}
            maxLength={500}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Напишите здесь вашу публикацию..."
            className="min-h-[130px] w-full rounded-2xl border border-line bg-cream p-4 text-xs dark:border-[#68644e] dark:bg-[#303129]"
          />
          <div className="my-3 flex items-center justify-between gap-3">
            <span className="text-xs text-ink/60">{content.length}/500</span>
            <label className="cursor-pointer rounded-full bg-olive px-4 py-2 text-xs font-semibold text-cream">
              ＋ Добавить фотографию
              <input type="file" accept="image/*" onChange={choosePhoto} className="hidden" />
            </label>
          </div>
          {photo && <img src={photo} alt="Предпросмотр" className="mb-4 max-h-72 rounded-2xl object-contain" />}
          <button onClick={publish} className="rounded-full bg-ink px-6 py-2.5 text-xs font-bold text-cream">
            Опубликовать
          </button>
        </section>
      )}

      {apiState === 'loading' ? (
        <div className="space-y-6" aria-hidden="true">
          {[1, 2].map((n) => (
            <div key={n} className="h-52 animate-pulse rounded-3xl bg-card/70 dark:bg-[#3b3a30]" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedPosts.length > 0 ? (
            sortedPosts.map((post) => {
              const canDelete = user && (user.id === post.user_id || user.role === 'admin');
              const isCommentsOpen = Boolean(openComments[post.id]);
              const commentsCount = (post.comments || []).length;

              return (
                <article key={post.id} className="rounded-3xl bg-card p-6 shadow-sm dark:bg-[#3b3a30]">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {post.authorAvatar ? (
                        <img
                          src={post.authorAvatar}
                          alt={post.author}
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-olive text-sm font-bold text-cream">
                          {(post.author || 'П')[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <strong className="text-sm font-bold">{post.author}</strong>
                        <div className="text-[11px] text-ink/60 dark:text-[#f1e6d1]/60">
                          {new Date(post.created_at).toLocaleString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => deletePost(post.id)}
                        className="rounded-full border border-red-400/50 px-3 py-1 text-[11px] font-bold text-red-700 hover:bg-red-500/10 dark:text-red-300"
                      >
                        Удалить
                      </button>
                    )}
                  </div>

                  <p className="whitespace-pre-wrap text-xs leading-relaxed sm:text-sm">{post.content}</p>

                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Публикация"
                      className="mt-4 max-h-[460px] w-full rounded-2xl object-cover"
                    />
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-base font-extrabold transition ${
                        post.likedByMe
                          ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                          : 'bg-cream/80 text-ink/80 hover:bg-cream dark:bg-[#303129] dark:text-[#f1e6d1]'
                      }`}
                    >
                      <span className="text-2xl leading-none">{post.likedByMe ? '♥' : '♡'}</span>
                      <span>{post.likes}</span>
                    </button>

                    <button
                      onClick={() => toggleComments(post.id)}
                      className="inline-flex items-center gap-2 rounded-full bg-cream/70 px-4 py-2.5 text-xs font-bold text-ink/80 hover:bg-cream dark:bg-[#303129] dark:text-[#f1e6d1]"
                    >
                      <span>💬 {commentsCount}</span>
                      <span>{isCommentsOpen ? 'Скрыть ▲' : 'Комментарии ▼'}</span>
                    </button>
                  </div>

                  {isCommentsOpen && (
                    <div className="mt-4 space-y-2 border-t border-line/40 pt-3 dark:border-[#68644e]">
                      {(post.comments || []).length > 0 ? (
                        post.comments.map((c) => (
                          <div key={c.id} className="rounded-xl bg-cream/60 px-3 py-2 text-xs dark:bg-[#303129]">
                            <strong>{c.author}:</strong> {c.content}
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-ink/60 dark:text-[#f1e6d1]/60">
                          Пока нет комментариев.
                        </p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <input
                          value={commentText[post.id] || ''}
                          onChange={(e) =>
                            setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          placeholder="Написать комментарий…"
                          className="h-9 flex-1 rounded-full border border-line bg-cream px-4 text-xs dark:border-[#68644e] dark:bg-[#303129]"
                        />
                        <button
                          onClick={() => addComment(post.id)}
                          className="rounded-full bg-olive px-4 text-xs font-bold text-cream"
                        >
                          Отправить
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          ) : (
            <div className="rounded-3xl bg-card p-8 text-center text-xs text-ink/75 dark:bg-[#3b3a30] dark:text-[#f1e6d1]/75">
              Публикаций пока нет — станьте первым, кто поделится своим растением!
            </div>
          )}
        </div>
      )}
    </main>
  );
}