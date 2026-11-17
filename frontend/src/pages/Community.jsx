import { useState } from 'react';
import { apiFetch } from '../utils/api.js';

export default function Community({ posts, setPosts, user, go, notify }) {
  const [creating, setCreating] = useState(false);
  const [content, setContent] = useState('');
  const [photo, setPhoto] = useState('');
  const [commentText, setCommentText] = useState({});

  const choosePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const publish = async () => {
    if (!user) return go('login');
    if (!content.trim()) return notify('Напишите текст публикации.');

    try {
      const created = await apiFetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ content, imageUrl: photo }),
      });
      setPosts([created, ...posts]);
      setContent('');
      setPhoto('');
      setCreating(false);
      notify('Публикация сохранена!');
    } catch (err) {
      notify(err.message);
    }
  };

  const toggleLike = async (postId) => {
    if (!user) return go('login');
    try {
      const res = await apiFetch(`/api/posts/${postId}/like`, { method: 'POST' });
      setPosts(
        posts.map((p) => (p.id === postId ? { ...p, likes: res.likes, likedByMe: res.likedByMe } : p)),
      );
    } catch (err) {
      notify(err.message);
    }
  };

  const addComment = async (postId) => {
    if (!user) return go('login');
    const text = (commentText[postId] || '').trim();
    if (!text) return;
    try {
      const created = await apiFetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: text }),
      });
      setPosts(
        posts.map((p) => (p.id === postId ? { ...p, comments: [...(p.comments || []), created] } : p)),
      );
      setCommentText({ ...commentText, [postId]: '' });
    } catch (err) {
      notify(err.message);
    }
  };

  return (
    <main className="mx-auto max-w-[1040px] px-5 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
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

      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <article key={post.id} className="rounded-3xl bg-card p-6 shadow-sm dark:bg-[#3b3a30]">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-olive text-sm font-bold text-cream">
                  {(post.author || 'П')[0].toUpperCase()}
                </div>
                <div>
                  <strong className="text-sm font-bold">{post.author}</strong>
                  <div className="text-[11px] text-ink/60 dark:text-[#f1e6d1]/60">
                    {new Date(post.created_at).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              </div>

              <p className="whitespace-pre-wrap text-xs leading-relaxed sm:text-sm">{post.content}</p>

              {post.imageUrl && (
                <img src={post.imageUrl} alt="Публикация" className="mt-4 max-h-[460px] w-full rounded-2xl object-cover" />
              )}

              <div className="mt-4 flex items-center gap-5">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`text-xs font-bold ${post.likedByMe ? 'text-red-600' : 'text-ink/70 dark:text-[#f1e6d1]/70'}`}
                >
                  ♥ {post.likes}
                </button>
                <span className="text-xs text-ink/70 dark:text-[#f1e6d1]/70">
                  💬 {(post.comments || []).length}
                </span>
              </div>

              <div className="mt-4 space-y-2 border-t border-line/40 pt-3 dark:border-[#68644e]">
                {(post.comments || []).map((c) => (
                  <div key={c.id} className="rounded-xl bg-cream/60 px-3 py-2 text-xs dark:bg-[#303129]">
                    <strong>{c.author}:</strong> {c.content}
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    value={commentText[post.id] || ''}
                    onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
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
            </article>
          ))
        ) : (
          <div className="rounded-3xl bg-card p-8 text-center text-xs text-ink/75 dark:bg-[#3b3a30] dark:text-[#f1e6d1]/75">
            Публикаций пока нет — станьте первым, кто поделится своим растением!
          </div>
        )}
      </div>
    </main>
  );
}