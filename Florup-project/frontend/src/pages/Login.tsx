import { type FormEvent, useState } from 'react';
import type { UserProfile } from '../types.ts';
import { apiFetch } from '../utils/api.ts';

interface LoginProps {
  onSuccess: (data: { token: string; user: UserProfile }) => void;
  onSwitch: () => void;
  notify?: (msg: string) => void;
}

export default function Login({ onSuccess, onSwitch, notify }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const submitLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch<{ token: string; user: UserProfile }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      onSuccess(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const sendResetCode = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const res = await apiFetch<{ message: string; devCode?: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setInfo(res.devCode ? `${res.message} (Код: ${res.devCode})` : res.message);
      setMode('reset');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const confirmReset = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch<{ message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, code, newPassword }),
      });
      notify?.(res.message);
      setMode('login');
      setPassword('');
      setCode('');
      setNewPassword('');
      setInfo('Пароль изменён! Войдите с новым паролем.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'forgot' || mode === 'reset') {
    return (
      <main className="flex min-h-[520px] items-center justify-center px-4 py-8">
        <form
          onSubmit={mode === 'forgot' ? sendResetCode : confirmReset}
          className="w-full max-w-md rounded-3xl border-2 border-line bg-cream p-8 shadow-md dark:border-[#68644e] dark:bg-[#3b3a30]"
        >
          <h1 className="mb-4 text-center text-2xl font-black">Сброс пароля</h1>

          <label className="mb-4 flex flex-col gap-2 text-xs font-semibold">
            Email аккаунта
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите email"
              className="h-11 rounded-xl border border-line bg-card px-4 text-xs dark:border-[#68644e] dark:bg-[#303129]"
            />
          </label>

          {mode === 'reset' && (
            <>
              <label className="mb-4 flex flex-col gap-2 text-xs font-semibold">
                Код подтверждения из письма
                <input
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6-значный код"
                  className="h-11 rounded-xl border border-line bg-card px-4 text-xs tracking-widest dark:border-[#68644e] dark:bg-[#303129]"
                />
              </label>

              <label className="mb-4 flex flex-col gap-2 text-xs font-semibold">
                Новый пароль
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="h-11 rounded-xl border border-line bg-card px-4 text-xs dark:border-[#68644e] dark:bg-[#303129]"
                />
              </label>
            </>
          )}

          {info && (
            <p className="mb-3 rounded-xl bg-olive/15 p-3 text-xs font-semibold text-olive">{info}</p>
          )}
          {error && <p className="mb-3 text-xs font-semibold text-red-700 dark:text-red-400">{error}</p>}

          <button
            disabled={loading}
            className="mb-4 w-full rounded-full bg-olive py-3 text-xs font-bold text-cream hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? 'Отправка…'
              : mode === 'forgot'
                ? 'Отправить код на почту'
                : 'Сохранить новый пароль'}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setInfo('');
            }}
            className="block w-full text-center text-xs font-bold text-tan hover:underline"
          >
            ← Вернуться ко входу
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="flex min-h-[520px] items-center justify-center px-4 py-8">
      <form
        onSubmit={submitLogin}
        className="w-full max-w-md rounded-3xl border-2 border-line bg-cream p-8 shadow-md dark:border-[#68644e] dark:bg-[#3b3a30]"
      >
        <h1 className="mb-6 text-center text-3xl font-black">Вход</h1>

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

        <label className="mb-2 flex flex-col gap-2 text-xs font-semibold">
          Пароль
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            className="h-11 rounded-xl border border-line bg-card px-4 text-xs dark:border-[#68644e] dark:bg-[#303129]"
          />
        </label>

        <div className="mb-4 text-right">
          <button
            type="button"
            onClick={() => {
              setMode('forgot');
              setError('');
              setInfo('');
            }}
            className="text-xs font-semibold text-tan hover:underline"
          >
            Забыли пароль?
          </button>
        </div>

        {info && (
          <p className="mb-3 rounded-xl bg-olive/15 p-3 text-xs font-semibold text-olive">{info}</p>
        )}
        {error && <p className="mb-3 text-xs font-semibold text-red-700 dark:text-red-400">{error}</p>}

        <button
          disabled={loading}
          className="mb-4 w-full rounded-full bg-olive py-3 text-xs font-bold text-cream hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Вход…' : 'Войти'}
        </button>

        <p className="text-center text-xs text-ink/70 dark:text-[#f1e6d1]/70">
          Нет аккаунта?{' '}
          <button type="button" onClick={onSwitch} className="font-bold text-olive hover:underline">
            Регистрация
          </button>
        </p>
      </form>
    </main>
  );
}