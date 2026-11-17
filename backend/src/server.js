import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'florup-dev-secret-change-in-env';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'https://florup.localhost';

app.set('trust proxy', 1);

app.use(
  cors({
    origin: (origin, cb) => {
      if (
        !origin ||
        origin === CLIENT_ORIGIN ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('https://florup.localhost')
      ) {
        return cb(null, true);
      }
      return cb(null, true);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '5mb' }));

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, originalHex] = stored.split(':');
  const candidate = crypto.scryptSync(password, salt, 64);
  const original = Buffer.from(originalHex, 'hex');
  if (candidate.length !== original.length) return false;
  return crypto.timingSafeEqual(candidate, original);
}

const b64url = (input) => Buffer.from(input).toString('base64url');

function signToken(payload, expiresInSeconds = 60 * 60 * 24 * 7) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSeconds }),
  );
  const sig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${sig}`;
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  if (sig !== expectedSig) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  req.user = payload;
  next();
}

async function ensureDefaultRole() {
  return prisma.roles.upsert({
    where: { name: 'user' },
    update: {},
    create: { name: 'user' },
  });
}

async function formatUser(profileId) {
  const profile = await prisma.profiles.findUnique({
    where: { id: profileId },
    include: {
      users: { select: { email: true } },
      roles: { select: { name: true } },
      _count: { select: { user_plants: true, posts: true } },
    },
  });
  if (!profile) return null;

  const receivedLikes = await prisma.post_likes.count({
    where: { posts: { user_id: profileId } },
  });

  return {
    id: profile.id,
    email: profile.users?.email || '',
    username: profile.username,
    name: profile.full_name || profile.username,
    bio: profile.bio || '',
    avatar_url: profile.avatar_url || '',
    push_notifications: Boolean(profile.push_notifications),
    email_notifications: Boolean(profile.email_notifications),
    role: profile.roles?.name || 'user',
    stats: {
      plants: profile._count.user_plants,
      posts: profile._count.posts,
      likes: receivedLikes,
    },
  };
}

// --- Healthcheck ---
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// --- Авторизация и профиль ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const fullName = String(req.body.name || '').trim();

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Введите корректный email' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен быть не короче 6 символов' });
    }

    const existing = await prisma.users.findFirst({
      where: { email, deleted_at: null },
    });
    if (existing) {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    }

    const role = await ensureDefaultRole();
    const userId = crypto.randomUUID();
    const baseUsername = (fullName || email.split('@')[0])
      .replace(/[^a-zA-Zа-яА-Я0-9_]/g, '_')
      .slice(0, 30);
    const username = `${baseUsername || 'user'}_${crypto.randomBytes(2).toString('hex')}`;
    const passwordHash = hashPassword(password);
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.users.create({
        data: {
          id: userId,
          email,
          encrypted_password: passwordHash,
          raw_user_meta_data: { full_name: fullName || baseUsername },
          created_at: now,
          updated_at: now,
        },
      });
      await tx.profiles.create({
        data: {
          id: userId,
          role_id: role.id,
          username,
          full_name: fullName || email.split('@')[0],
          bio: 'Люблю комнатные растения и делюсь опытом выращивания.',
        },
      });
    });

    const user = await formatUser(userId);
    const token = signToken({ sub: userId, email, role: user.role });
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const authUser = await prisma.users.findFirst({
      where: { email, deleted_at: null },
    });
    if (!authUser || !verifyPassword(password, authUser.encrypted_password)) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const role = await ensureDefaultRole();
    let profile = await prisma.profiles.findUnique({ where: { id: authUser.id } });
    if (!profile) {
      profile = await prisma.profiles.create({
        data: {
          id: authUser.id,
          role_id: role.id,
          username: `${email.split('@')[0]}_${crypto.randomBytes(2).toString('hex')}`,
          full_name: email.split('@')[0],
        },
      });
    }

    const user = await formatUser(authUser.id);
    const token = signToken({ sub: authUser.id, email, role: user.role });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const user = await formatUser(req.user.sub);
    if (!user) return res.status(404).json({ error: 'Профиль не найден' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/auth/profile', requireAuth, async (req, res) => {
  try {
    const data = { updated_at: new Date() };
    if (req.body.name !== undefined) data.full_name = String(req.body.name).trim().slice(0, 255);
    if (req.body.bio !== undefined) data.bio = String(req.body.bio).slice(0, 500);
    if (req.body.avatar_url !== undefined) data.avatar_url = String(req.body.avatar_url);
    if (req.body.push_notifications !== undefined)
      data.push_notifications = Boolean(req.body.push_notifications);
    if (req.body.email_notifications !== undefined)
      data.email_notifications = Boolean(req.body.email_notifications);

    await prisma.profiles.update({
      where: { id: req.user.sub },
      data,
    });
    const user = await formatUser(req.user.sub);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Каталог растений ---
app.get('/api/plants', async (_req, res) => {
  try {
    const plants = await prisma.plants.findMany({
      orderBy: { created_at: 'desc' },
    });
    res.json(plants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/plants', requireAuth, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Название растения обязательно' });

    const plant = await prisma.plants.create({
      data: {
        name,
        latin_name: req.body.latin_name ? String(req.body.latin_name).trim() : null,
        description: req.body.description ? String(req.body.description).trim() : null,
        care_watering_text: req.body.care_watering_text
          ? String(req.body.care_watering_text).trim()
          : null,
        care_lighting_text: req.body.care_lighting_text
          ? String(req.body.care_lighting_text).trim()
          : null,
        care_temp_text: req.body.care_temp_text ? String(req.body.care_temp_text).trim() : null,
        water_interval_days: Number(req.body.water_interval_days) || 7,
        fertilize_interval_days: Number(req.body.fertilize_interval_days) || 30,
        spray_interval_days: Number(req.body.spray_interval_days) || 0,
        image_url: req.body.image_url ? String(req.body.image_url).trim() : null,
        is_verified: true,
      },
    });
    res.status(201).json(plant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Проблемы и диагностика ---
app.get('/api/problems', async (_req, res) => {
  try {
    const problems = await prisma.plant_problems.findMany({
      include: { problem_types: true },
      orderBy: { created_at: 'desc' },
    });
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/problems', requireAuth, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const description = String(req.body.description || '').trim();
    const treatment = String(req.body.treatment || '').trim();
    const typeName = String(req.body.type || 'Болезнь').trim();

    if (!name || !description || !treatment) {
      return res.status(400).json({ error: 'Заполните название, описание и лечение' });
    }

    const problemType = await prisma.problem_types.upsert({
      where: { name: typeName },
      update: {},
      create: { name: typeName },
    });

    const problem = await prisma.plant_problems.create({
      data: {
        name,
        description,
        treatment,
        problem_type_id: problemType.id,
      },
      include: { problem_types: true },
    });
    res.status(201).json(problem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/user-plants', requireAuth, async (req, res) => {
  try {
    const items = await prisma.user_plants.findMany({
      where: { user_id: req.user.sub },
      include: {
        plants: true,
        care_logs: {
          include: { care_action_types: true },
          orderBy: { action_date: 'desc' },
          take: 10,
        },
      },
      orderBy: { created_at: 'desc' },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user-plants', requireAuth, async (req, res) => {
  try {
    const plantId = req.body.plant_id || null;
    const nickname = String(req.body.nickname || '').trim() || null;

    const item = await prisma.user_plants.create({
      data: {
        user_id: req.user.sub,
        plant_id: plantId,
        nickname,
      },
      include: {
        plants: true,
        care_logs: { include: { care_action_types: true } },
      },
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/user-plants/:id', requireAuth, async (req, res) => {
  try {
    const existing = await prisma.user_plants.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.user_id !== req.user.sub) {
      return res.status(404).json({ error: 'Растение не найдено' });
    }
    await prisma.user_plants.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/care-logs', requireAuth, async (req, res) => {
  try {
    const logs = await prisma.care_logs.findMany({
      where: { user_plants: { user_id: req.user.sub } },
      include: {
        care_action_types: true,
        user_plants: { include: { plants: true } },
      },
      orderBy: { action_date: 'desc' },
      take: 30,
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/care-logs', requireAuth, async (req, res) => {
  try {
    const { user_plant_id, action_name, notes } = req.body;
    const userPlant = await prisma.user_plants.findUnique({ where: { id: user_plant_id } });
    if (!userPlant || userPlant.user_id !== req.user.sub) {
      return res.status(404).json({ error: 'Растение пользователя не найдено' });
    }

    const actionType = await prisma.care_action_types.upsert({
      where: { name: String(action_name || 'Полив') },
      update: {},
      create: { name: String(action_name || 'Полив') },
    });

    const log = await prisma.care_logs.create({
      data: {
        user_plant_id,
        action_type_id: actionType.id,
        notes: notes ? String(notes).trim() : null,
      },
      include: {
        care_action_types: true,
        user_plants: { include: { plants: true } },
      },
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/posts', async (req, res) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const currentUser = verifyToken(token);

    const posts = await prisma.posts.findMany({
      include: {
        profiles: { select: { id: true, full_name: true, username: true, avatar_url: true } },
        post_images: { orderBy: { sort_order: 'asc' } },
        post_likes: { select: { user_id: true } },
        post_comments: {
          include: { profiles: { select: { full_name: true, username: true } } },
          orderBy: { created_at: 'asc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(
      posts.map((p) => ({
        id: p.id,
        user_id: p.user_id,
        author: p.profiles?.full_name || p.profiles?.username || 'Пользователь',
        authorAvatar: p.profiles?.avatar_url || '',
        content: p.content,
        imageUrl: p.post_images?.[0]?.image_url || '',
        likes: p.post_likes.length,
        likedByMe: currentUser ? p.post_likes.some((l) => l.user_id === currentUser.sub) : false,
        comments: p.post_comments.map((c) => ({
          id: c.id,
          author: c.profiles?.full_name || c.profiles?.username || 'Пользователь',
          content: c.content,
          created_at: c.created_at,
        })),
        created_at: p.created_at,
      })),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts', requireAuth, async (req, res) => {
  try {
    const content = String(req.body.content || '').trim();
    const imageUrl = req.body.imageUrl ? String(req.body.imageUrl) : '';
    if (!content) return res.status(400).json({ error: 'Текст публикации обязателен' });

    const created = await prisma.posts.create({
      data: {
        user_id: req.user.sub,
        content,
        post_images: imageUrl ? { create: [{ image_url: imageUrl, sort_order: 0 }] } : undefined,
      },
      include: {
        profiles: { select: { id: true, full_name: true, username: true, avatar_url: true } },
        post_images: true,
      },
    });

    res.status(201).json({
      id: created.id,
      user_id: created.user_id,
      author: created.profiles?.full_name || created.profiles?.username || 'Пользователь',
      authorAvatar: created.profiles?.avatar_url || '',
      content: created.content,
      imageUrl: created.post_images?.[0]?.image_url || '',
      likes: 0,
      likedByMe: false,
      comments: [],
      created_at: created.created_at,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts/:id/like', requireAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.sub;
    const existing = await prisma.post_likes.findUnique({
      where: { post_id_user_id: { post_id: postId, user_id: userId } },
    });

    if (existing) {
      await prisma.post_likes.delete({
        where: { post_id_user_id: { post_id: postId, user_id: userId } },
      });
    } else {
      await prisma.post_likes.create({ data: { post_id: postId, user_id: userId } });
    }

    const likes = await prisma.post_likes.count({ where: { post_id: postId } });
    res.json({ likes, likedByMe: !existing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts/:id/comments', requireAuth, async (req, res) => {
  try {
    const content = String(req.body.content || '').trim();
    if (!content) return res.status(400).json({ error: 'Комментарий не может быть пустым' });

    const comment = await prisma.post_comments.create({
      data: {
        post_id: req.params.id,
        user_id: req.user.sub,
        content,
      },
      include: { profiles: { select: { full_name: true, username: true } } },
    });

    res.status(201).json({
      id: comment.id,
      author: comment.profiles?.full_name || comment.profiles?.username || 'Пользователь',
      content: comment.content,
      created_at: comment.created_at,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Магазины для карты ---
app.get('/api/stores', async (_req, res) => {
  try {
    const stores = await prisma.stores.findMany({
      include: {
        cities: true,
        store_types: true,
        store_inventory: {
          include: { product_categories: true },
        },
        store_reviews: {
          include: {
            profiles: { select: { full_name: true, username: true } },
          },
          orderBy: { created_at: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(
      stores.map((s) => ({
        id: s.id,
        name: s.name,
        city: s.cities?.name || 'Новосибирск',
        type: s.store_types?.name || 'Магазин растений',
        address: s.address,
        latitude: Number(s.latitude),
        longitude: Number(s.longitude),
        working_hours: s.working_hours || 'Уточняйте по телефону',
        contact_info: s.contact_info || '',
        categories: s.store_inventory.map((i) => i.product_categories.name),
        reviews: s.store_reviews.map((r) => ({
          id: r.id,
          author: r.profiles?.full_name || r.profiles?.username || 'Пользователь',
          rating: r.rating || 5,
          text: r.review_text || '',
        })),
      })),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Florup API listening on http://0.0.0.0:${PORT}`);
});