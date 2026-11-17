import { useCallback, useEffect, useState } from 'react';
import Home from './pages/Home.jsx';
import Catalog from './pages/Catalog.jsx';
import PlantDetails from './pages/PlantDetails.jsx';
import Care from './pages/Care.jsx';
import Diagnostics from './pages/Diagnostics.jsx';
import MapPage from './pages/MapPage.jsx';
import Community from './pages/Community.jsx';
import Profile from './pages/Profile.jsx';
import ProfileEdit from './pages/ProfileEdit.jsx';
import Settings from './pages/Settings.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import ExpertPanel from './pages/ExpertPanel.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { apiFetch, getToken, setToken } from './utils/api.js';

const PAGE_BY_PATH = {
  '/': 'home',
  '/catalog': 'catalog',
  '/plant': 'plant',
  '/care': 'care',
  '/diagnostics': 'diagnostics',
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
);

const SEO_BY_PAGE = {
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
    description: 'Справочник болезней и вредителей комнатных растений.',
  },
  map: {
    title: 'Карта Новосибирска — Florup',
    description: 'Карта города Новосибирск в Florup.',
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

const PRIVATE_PAGES = new Set([
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
  const [page, setPage] = useState(PAGE_BY_PATH[window.location.pathname] || 'home');
  const [authModal, setAuthModal] = useState(null);
  const [plants, setPlants] = useState([]);
  const [problems, setProblems] = useState([]);
  const [posts, setPosts] = useState([]);
  const [apiState, setApiState] = useState('loading');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState('');
  const [plantSearch, setPlantSearch] = useState('');

  const notify = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3200);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [plantsData, problemsData, postsData] = await Promise.all([
        apiFetch('/api/plants').catch(() => null),
        apiFetch('/api/problems').catch(() => null),
        apiFetch('/api/posts').catch(() => null),
      ]);
      if (Array.isArray(plantsData)) setPlants(plantsData);
      if (Array.isArray(problemsData)) setProblems(problemsData);
      if (Array.isArray(postsData)) setPosts(postsData);
      setApiState(plantsData || problemsData ? 'ready' : 'offline');
    } catch {
      setApiState('offline');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getToken()) return;
    try {
      const res = await apiFetch('/api/auth/me');
      setUser(res.user);
    } catch {
      setToken('');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshData();
    if (getToken()) {
      apiFetch('/api/auth/me')
        .then((res) => setUser(res.user))
        .catch(() => {
          setToken('');
          setUser(null);
        });
    }
  }, [refreshData]);

  const go = (next) => {
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

  const handleAuthSuccess = (data) => {
    setToken(data.token);
    setUser(data.user);
    setAuthModal(null);
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
    const setMeta = (selector, attr, name, content) => {
      let el = document.querySelector(selector);
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

  const shared = {
    go,
    plants,
    problems,
    posts,
    setPosts,
    apiState,
    selectedPlant,
    setSelectedPlant,
    user,
    setUser,
    notify,
    plantSearch,
    setPlantSearch,
    refreshData,
    refreshUser,
    logout,
  };

  const renderAuthGate = (title, description) => (
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

  const pages = {
    home: <Home {...shared} />,
    catalog: <Catalog {...shared} />,
    plant: <PlantDetails {...shared} />,
    diagnostics: <Diagnostics {...shared} />,
    map: <MapPage />,
    community: <Community {...shared} />,
    care: user
      ? <Care {...shared} />
      : renderAuthGate('Уход за растением', 'Войдите, чтобы вести свой календарь и список растений.'),
    profile: user
      ? <Profile {...shared} />
      : renderAuthGate('Профиль', 'Войдите, чтобы открыть личный профиль.'),
    'profile-edit': user
      ? <ProfileEdit {...shared} />
      : renderAuthGate('Редактирование профиля', 'Войдите, чтобы редактировать профиль.'),
    settings: <Settings {...shared} />,
    admin: user
      ? <AdminPanel {...shared} />
      : renderAuthGate('Панель администратора', 'Войдите, чтобы добавлять растения в каталог.'),
    expert: user
      ? <ExpertPanel {...shared} />
      : renderAuthGate('Панель эксперта', 'Войдите, чтобы добавлять материалы по болезням.'),
    login: <Login onSuccess={handleAuthSuccess} onSwitch={() => go('register')} />,
    register: <Register onSuccess={handleAuthSuccess} onSwitch={() => go('login')} />,
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col">
      <Header page={page} go={go} user={user} />
      <div className="flex-1">{pages[page] || <Home {...shared} />}</div>
      <Footer go={go} />

      {authModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
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
            <Login onSuccess={handleAuthSuccess} onSwitch={() => setAuthModal('register')} />
          ) : (
            <Register onSuccess={handleAuthSuccess} onSwitch={() => setAuthModal('login')} />
          )}
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl bg-ink px-5 py-3 text-xs font-medium text-cream shadow-xl"
        >
          {toast}
        </div>
      )}
    </div>
  );
}