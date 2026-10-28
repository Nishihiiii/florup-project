import { useState } from 'react';

export default function Register({ onRegister, onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();

    if (password.length < 4) {
      setError('Для демонстрации введите пароль не короче 4 символов.');
      return;
    }

    onRegister({
      name: name.trim() || email.split('@')[0],
      email,
    });
  };

  return (
    <main className="auth-page">
      <form className="auth-card register-card" onSubmit={submit}>
        <h1>Регистрация</h1>

        <label>
          Имя
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Введите имя"
            required
          />
        </label>

        <label>
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="Введите email"
            required
          />
        </label>

        <label>
          Пароль
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Введите пароль"
            required
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button className="olive-button auth-submit">Зарегистрироваться</button>

        <small>
          Есть аккаунт?{' '}
          <button type="button" onClick={onLogin}>
            Войти
          </button>
        </small>

        <p className="demo-note">
          Демонстрационная регистрация, без подключения к базе данных.
        </p>
      </form>
    </main>
  );
}
