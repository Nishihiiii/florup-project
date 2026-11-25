import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import Footer from './components/Footer.tsx';
import Header from './components/Header.tsx';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import type {
  CommunityPost,
  DiagnosisCardItem,
  Fact,
  PageId,
  Plant,
  Problem,
  Symptom,
  UserPlant,
  UserProfile,
} from './types.ts';
import { apiFetch, getToken, setToken } from './utils/api.ts';

const Catalog = lazy(() => import('./pages/Catalog.tsx'));
const PlantDetails = lazy(() => import('./pages/PlantDetails.tsx'));
const Care = lazy(() => import('./pages/Care.tsx'));
const Diagnostics = lazy(() => import('./pages/Diagnostics.tsx'));
const DiagnosisDetails = lazy(() => import('./pages/DiagnosisDetails.tsx'));
const MapPage = lazy(() => import('./pages/MapPage.tsx'));
const Community = lazy(() => import('./pages/Community.tsx'));
const Profile = lazy(() => import('./pages/Profile.tsx'));
const ProfileEdit = lazy(() => import('./pages/ProfileEdit.tsx'));
const Settings = lazy(() => import('./pages/Settings.tsx'));
const AdminPanel = lazy(() => import('./pages/AdminPanel.tsx'));
const ExpertPanel = lazy(() => import('./pages/ExpertPanel.tsx'));

const PAGE_BY_PATH: Record<string, PageId> = {
  '/': 'home',
  '/catalog': 'catalog',
  '/plant': 'plant',
  '/care': 'care',
  '/diagnostics': 'diagnostics',
  '/diagnosis': 'diagnosis',
  '/map': 'map',
  '/community': 'community',
  '/profile': 'profile',
  '/profile-edit': 'profile-edit',
  '/settings': 'settings',
  '/admin': 'admin',
  '/expert': 'expert',
  '/login': 'login',
  '/register': 'register',
};

const PATH_BY_PAGE = Object.fromEntries(
  Object.entries(PAGE_BY_PATH).map(([path, page]) => [page, path]),
) as Record<PageId, string>;

const SEO_BY_PAGE: Record<PageId, { title: string; description: string }> = {
  home: {
    title: 'Florup — уход за комнатными растениями',
    description:
      'Florup — интерактивный путеводитель по комнатным растениям. Изучайте каталог, разбирайтесь в уходе и диагностируйте проблемы растений.',
  },
  catalog: {
    title: 'Каталог комнатных растений — Florup',
    description: 'Изучайте комнатные растения, требования к поливу, освещению и температуре.',
  },
  plant: {
    title: 'Карточка растения — Florup',
    description: 'Подробная информация о комнатном растении и рекомендации по уходу.',
  },
  care: {
    title: 'Уход за растениями — Florup',
    description: 'Планируйте уход за комнатными растениями и отмечайте регулярные задачи.',
  },
  diagnostics: {
    title: 'Диагностика растений — Florup',
    description: 'Справочник болезней, симптомов и вредителей комнатных растений.',
  },
  diagnosis: {
    title: 'Симптом и лечение — Florup',
    description: 'Подробная информация о симптомах, причинах и лечении растения.',
  },
  map: {
    title: 'Карта магазинов — Florup',
    description: 'Поиск товаров и цветочных магазинов на карте вашего города.',
  },
  community: {
    title: 'Сообщество любителей растений — Florup',
    description: 'Делитесь успехами в выращивании растений и общайтесь с цветоводами.',
  },
  profile: { title: 'Профиль — Florup', description: 'Личный профиль пользователя Florup.' },
  'profile-edit': { title: 'Редактирование профиля — Florup', description: 'Настройка профиля.' },
  settings: { title: 'Настройки — Florup', description: 'Настройки аккаунта Florup.' },
  admin: { title: 'Панель администратора — Florup', description: 'Управление каталогом Florup.' },
  expert: { title: 'Панель эксперта — Florup', description: 'Экспертные материалы Florup.' },
  login: { title: 'Вход — Florup', description: 'Вход в аккаунт Florup.' },
  register: { title: 'Регистрация — Florup', description: 'Регистрация аккаунта Florup.' },
};

const PRIVATE_PAGES = new Set<PageId>([
  'care',
  'profile',
  'profile-edit',
  'settings',
  'admin',
  'expert',
  'login',
  'register',
]);

export default function App() {
  const [page, setPage] = useState<PageId>(PAGE_BY_PATH[window.location.pathname] || 'home');
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [apiState, setApiState] = useState<'loading' | 'ready' | 'offline'>('loading');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<DiagnosisCardItem | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [toast, setToast] = useState('');
  const [plantSearch, setPlantSearch] = useState('');

  useEffect(() => {
    if (localStorage.getItem('florup_theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3600);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [plantsData, problemsData, symptomsData, postsData, factsData] = await Promise.all([
        apiFetch<Plant[]>('/api/plants').catch(() => null),
        apiFetch<Problem[]>('/api/problems').catch(() => null),
        apiFetch<Symptom[]>('/api/symptoms').catch(() => null),
        apiFetch<CommunityPost[]>('/api/posts').catch(() => null),
        apiFetch<Fact[]>('/api/facts').catch(() => null),
      ]);
      if (Array.isArray(plantsData)) setPlants(plantsData);
      if (Array.isArray(problemsData)) setProblems(problemsData);
      if (Array.isArray(symptomsData)) setSymptoms(symptomsData);
      if (Array.isArray(postsData)) setPosts(postsData);
      if (Array.isArray(factsData)) setFacts(factsData);
      setApiState(plantsData || problemsData || postsData ? 'ready' : 'offline');
    } catch {
      setApiState('offline');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getToken()) return;
    try {
      const res = await apiFetch<{ user: UserProfile }>('/api/auth/me');
      setUser(res.user);
    } catch {
      setToken('');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshData();
    if (getToken()) {
      apiFetch<{ user: UserProfile }>('/api/auth/me')
        .then((res) => setUser(res.user))
        .catch(() => {
          setToken('');
          setUser(null);
        });
    }
  }, [refreshData]);

  useEffect(() => {
    if (!user || !user.push_notifications) return;
    const todayKey = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem('florup_care_notified') === todayKey) return;

    apiFetch<UserPlant[]>('/api/user-plants')
      .then((items) => {
        if (!Array.isArray(items) || !items.length) return;
        const due = items.filter((up) => {
          const interval = up.plants?.water_interval_days || 7;
          const lastWater = (up.care_logs || []).find((l) =>
            (l.care_action_types?.name || '').toLowerCase().includes('полив'),
          );
          const base = lastWater
            ? new Date(lastWater.action_date)
            : new Date(up.adopted_at || up.created_at || Date.now());
          const diffDays = Math.floor((Date.now() - base.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays >= interval;
        });

        if (due.length > 0) {
          localStorage.setItem('florup_care_notified', todayKey);
          const names = due.map((d) => d.nickname || d.plants?.name || 'Растение').join(', ');
          const text = `Сегодня нужен уход: ${names}`;
          notify(text);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Florup — напоминание об уходе', { body: text });
          }
        }
      })
      .catch(() => {});
  }, [user, notify]);

  const go = (next: PageId) => {
    if (next === 'login' || next === 'register') {
      setAuthModal(next);
      return;
    }
    setAuthModal(null);
    const route = PATH_BY_PAGE[next] || '/';
    if (window.location.pathname !== route) {
      window.history.pushState({ page: next }, '', route);
    }
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleAuthSuccess = (data: { token: string; user: UserProfile }) => {
    setToken(data.token);
    setUser(data.user);
    setAuthModal(null);
    refreshData();
    go('profile');
    notify(`Добро пожаловать, ${data.user.name}!`);
  };

  const logout = () => {
    setToken('');
    setUser(null);
    go('home');
    notify('Вы вышли из аккаунта.');
  };

  useEffect(() => {
    const onPopState = () => {
      setPage(PAGE_BY_PATH[window.location.pathname] || 'home');
      setAuthModal(null);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const metadata = SEO_BY_PAGE[authModal || page] || SEO_BY_PAGE.home;
    document.title = metadata.title;
    const setMeta = (selector: string, attr: string, name: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setMeta('meta[name="description"]', 'name', 'description', metadata.description);
    setMeta(
      'meta[name="robots"]',
      'name',
      'robots',
      authModal || PRIVATE_PAGES.has(page) ? 'noindex, nofollow' : 'index, follow',
    );
    setMeta('meta[property="og:title"]', 'property', 'og:title', metadata.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', metadata.description);
  }, [page, authModal]);

  const renderAuthGate = (title: string, description: string) => (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-3xl bg-card p-10 text-center shadow-sm dark:bg-[#3b3a30]">
        <h1 className="mb-3 text-3xl font-black">{title}</h1>
        <p className="mb-6 text-sm text-ink/70 dark:text-[#f1e6d1]/75">{description}</p>
        <button
          className="rounded-full bg-olive px-7 py-3 text-sm font-bold text-cream hover:opacity-90"
          onClick={() => go('login')}
        >
          Войти
        </button>
      </div>
    </main>
  );

  const renderRoleDenied = (panelName: string, requiredRole: string) => (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-3xl bg-card p-10 text-center shadow-sm dark:bg-[#3b3a30]">
        <h1 className="mb-3 text-3xl font-black">{panelName}</h1>
        <p className="mb-6 text-sm text-ink/70 dark:text-[#f1e6d1]/75">
          Доступ разрешён только для аккаунтов с ролью «{requiredRole}».
        </p>
        <button
          className="rounded-full bg-olive px-7 py-3 text-sm font-bold text-cream hover:opacity-90"
          onClick={() => go('profile')}
        >
          Вернуться в профиль
        </button>
      </div>
    </main>
  );

  const isAdmin = user?.role === 'admin';
  const isExpert = user?.role === 'expert' || isAdmin;

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <Home go={go} facts={facts} user={user} />;
      case 'catalog':
        return (
          <Catalog
            plants={plants}
            plantSearch={plantSearch}
            setPlantSearch={setPlantSearch}
            setSelectedPlant={setSelectedPlant}
            apiState={apiState}
            user={user}
            go={go}
          />
        );
      case 'plant':
        return (
          <PlantDetails
            selectedPlant={selectedPlant}
            setSelectedPlant={setSelectedPlant}
            go={go}
            plants={plants}
            user={user}
            notify={notify}
          />
        );
      case 'diagnostics':
        return (
          <Diagnostics
            symptoms={symptoms}
            problems={problems}
            apiState={apiState}
            setSelectedProblem={setSelectedProblem}
            go={go}
            notify={notify}
          />
        );
      case 'diagnosis':
        return (
          <DiagnosisDetails
            selectedProblem={selectedProblem}
            problems={problems}
            setSelectedPlant={setSelectedPlant}
            go={go}
          />
        );
      case 'map':
        return <MapPage notify={notify} />;
      case 'community':
        return (
          <Community
            posts={posts}
            setPosts={setPosts}
            apiState={apiState}
            user={user}
            go={go}
            notify={notify}
          />
        );
      case 'care':
        return user
          ? <Care go={go} notify={notify} refreshUser={refreshUser} />
          : renderAuthGate('Уход за растением', 'Войдите, чтобы вести свой календарь и список растений.');
      case 'profile':
        return user
          ? <Profile user={user} go={go} posts={posts} refreshUser={refreshUser} />
          : renderAuthGate('Профиль', 'Войдите, чтобы открыть личный профиль.');
      case 'profile-edit':
        return user
          ? <ProfileEdit user={user} setUser={setUser} go={go} notify={notify} />
          : renderAuthGate('Редактирование профиля', 'Войдите, чтобы редактировать профиль.');
      case 'settings':
        return <Settings user={user} setUser={setUser} go={go} logout={logout} notify={notify} />;
      case 'admin':
        if (!user) return renderAuthGate('Панель администратора', 'Войдите, чтобы открыть панель.');
        return isAdmin
          ? <AdminPanel go={go} plants={plants} refreshData={refreshData} notify={notify} />
          : renderRoleDenied('Панель администратора', 'Администратор');
      case 'expert':
        if (!user) return renderAuthGate('Панель эксперта', 'Войдите, чтобы открыть панель.');
        return isExpert
          ? <ExpertPanel go={go} problems={problems} refreshData={refreshData} notify={notify} />
          : renderRoleDenied('Панель эксперта', 'Эксперт');
      case 'login':
        return <Login onSuccess={handleAuthSuccess} onSwitch={() => go('register')} notify={notify} />;
      case 'register':
        return <Register onSuccess={handleAuthSuccess} onSwitch={() => go('login')} />;
      default:
        return <Home go={go} facts={facts} user={user} />;
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col">
      <Header page={page} go={go} user={user} />
      <div className="min-h-[60vh] flex-1">
        <Suspense
          fallback={
            <div className="mx-auto max-w-[1430px] px-5 py-16 text-center text-xs text-ink/60">
              Загрузка страницы…
            </div>
          }
        >
          {renderPage()}
        </Suspense>
      </div>
      <Footer go={go} />

      {authModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => e.target === e.currentTarget && setAuthModal(null)}
        >
          <button
            className="fixed right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border-2 border-line bg-cream text-2xl text-ink dark:bg-[#3b3a30] dark:text-[#f1e6d1]"
            onClick={() => setAuthModal(null)}
            aria-label="Закрыть"
          >
            ×
          </button>
          {authModal === 'login' ? (
            <Login
              onSuccess={handleAuthSuccess}
              onSwitch={() => setAuthModal('register')}
              notify={notify}
            />
          ) : (
            <Register onSuccess={handleAuthSuccess} onSwitch={() => setAuthModal('login')} />
          )}
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[60] max-w-sm rounded-2xl bg-ink px-5 py-3 text-xs font-medium text-cream shadow-xl dark:bg-olive"
        >
          {toast}
        </div>
      )}
    </div>
  );
}