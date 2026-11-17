1. Схема архитектуры (`Браузер -> Nginx (80/443, HTTPS) -> frontend (8080) и api (3000) -> PostgreSQL / Supabase`).
2. Таблица сервисов:
   - `frontend` | React + Vite + Tailwind (nginx) | `8080` | `nginx:1.27-alpine`
   - `api` | Node.js + Express + Prisma | `3000` | `node src/server.js`
   - `gateway` | Nginx (reverse proxy + SSL) | `80, 443` | `nginx:1.27-alpine`
   - База данных | PostgreSQL (Supabase) | — | внешняя облачная БД
   
3. Список переменных окружения (только имена: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `CLIENT_ORIGIN`, `PORT`, `NODE_ENV`).
4. Команды запуска/остановки (`docker compose up --build -d`, `docker compose ps`, `docker compose logs`, `docker compose down`).
5. Скриншоты: `docker compose ps`, сайт на `https://florup.localhost` с замком, вкладка Network (`X-Robots-Tag: noindex, nofollow`, `gzip`), Docker Desktop с открытым портом только у `gateway`.
6. Краткий ответ: для публикации на реальном сервере нужно арендовать VPS/облако (с соблюдением 152-ФЗ при работе с персональными данными), зарегистрировать реальный домен с A-записью, выпустить сертификат Let's Encrypt (Certbot) вместо `mkcert` и настроить CD-доставку образов из GHCR.