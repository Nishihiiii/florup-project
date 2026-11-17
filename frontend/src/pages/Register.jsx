import { useState } from 'react';
import { apiFetch } from '../utils/api.js';

export default function Register({ onSuccess, onSwitch }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Пароль должен быть не короче 6 символов.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[520px] items-center justify-center px-4 py-8">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-3xl border-2 border-line bg-cream p-8 shadow-md dark:border-[#68644e] dark:bg-[#3b3a30]"
      >
        <h1 className="mb-6 text-center text-3xl font-black">Регистрация</h1>

        <label className="mb-4 flex flex-col gap-2 text-xs font-semibold">
          Имя
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите имя"
            className="h-11 rounded-xl border border-line bg-card px-4 text-xs dark:border-[#68644e] dark:bg-[#303129]"
          />
        </label>

        <label className="mb-4 flex flex-col gap-2 text-xs font-semibold">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Введите email"
            className="h-11 rounded-xl border border-line bg-card px-4 text-xs dark:border-[#68644e] dark:bg-[#303129]"
          />
        </label>

        <label className="mb-4 flex flex-col gap-2 text-xs font-semibold">
          Пароль
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Минимум 6 символов"
            className="h-11 rounded-xl border border-line bg-card px-4 text-xs dark:border-[#68644e] dark:bg-[#303129]"
          />
        </label>

        {error && <p className="mb-3 text-xs font-semibold text-red-700 dark:text-red-400">{error}</p>}

        <button
          disabled={loading}
          className="mb-4 w-full rounded-full bg-olive py-3 text-xs font-bold text-cream hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Создание аккаунта…' : 'Зарегистрироваться'}
        </button>

        <p className="text-center text-xs text-ink/70 dark:text-[#f1e6d1]/70">
          Есть аккаунт?{' '}
          <button type="button" onClick={onSwitch} className="font-bold text-olive hover:underline">
            Войти
          </button>
        </p>
      </form>
    </main>
  );
}