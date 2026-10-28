import { useEffect, useMemo, useState } from 'react';
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
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import ExpertPanel from './pages/ExpertPanel.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
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
      'Florup — интерактивный путеводитель по комнатным растениям. ' +
      'Изучайте каталог, разбирайтесь в уходе и диагностируйте проблемы растений.',
  },
  catalog: {
    title: 'Каталог комнатных растений — Florup',
    description:
      'Изучайте комнатные растения, их особенности, требования к поливу, ' +
      'освещению и температуре в каталоге Florup.',
  },
  plant: {
    title: 'Карточка растения — Florup',
    description:
      'Подробная информация о комнатном растении и рекомендации по уходу: ' +
      'полив, освещение, температура и влажность.',
  },
  care: {
    title: 'Уход за растениями — Florup',
    description:
      'Планируйте уход за комнатными растениями, просматривайте календарь ' +
      'и отмечайте регулярные задачи.',
  },
  diagnostics: {
    title: 'Диагностика растений — Florup',
    description:
      'Изучайте симптомы заболеваний комнатных растений и находите ' +
      'рекомендации по уходу и восстановлению.',
  },
  map: {
    title: 'Карта магазинов для растений — Florup',
    description:
      'Раздел Florup для поиска магазинов, грунтов, удобрений и других ' +
      'товаров для комнатных растений.',
  },
  community: {
    title: 'Сообщество любителей растений — Florup',
    description:
      'Делитесь успехами в выращивании растений, публикуйте фотографии ' +
      'и общайтесь с другими цветоводами.',
  },
  profile: {
    title: 'Профиль пользователя — Florup',
    description: 'Личный профиль пользователя Florup.',
  },
  'profile-edit': {
    title: 'Редактирование профиля — Florup',
    description: 'Настройте имя, описание и фотографию профиля Florup.',
  },
  settings: {
    title: 'Настройки — Florup',
    description: 'Настройки пользовательского аккаунта Florup.',
  },
  admin: {
    title: 'Панель администратора — Florup',
    description: 'Управление каталогом растений Florup.',
  },
  expert: {
    title: 'Панель эксперта — Florup',
    description: 'Управление экспертными материалами Florup.',
  },
  login: {
    title: 'Вход — Florup',
    description: 'Войдите в демонстрационный аккаунт Florup.',
  },
  register: {
    title: 'Регистрация — Florup',
    description: 'Создайте демонстрационный аккаунт Florup.',
  },
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
  const initialPath = window.location.pathname;
  const initialPage = PAGE_BY_PATH[initialPath] || 'home';
  const [page, setPage] = useState(initialPage);
  const [authModal, setAuthModal] = useState(null);
  const [authReturnPage, setAuthReturnPage] = useState('home');
  const [previousPage, setPreviousPage] = useState('home');
  const [plants, setPlants] = useState([]);
  const [problems, setProblems] = useState([]);
  const [apiState, setApiState] = useState('loading');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [demoUser, setDemoUser] = useState(null);
  const [toast, setToast] = useState('');
  const [posts, setPosts] = useState([]);
  const [plantSearch, setPlantSearch] = useState('');
  const [symptomSearch, setSymptomSearch] = useState('');
  const [diagnosticFile, setDiagnosticFile] = useState(null);
  const [diagnosticMessage, setDiagnosticMessage] = useState('');
  const [city, setCity] = useState('');
  const [profileName, setProfileName] = useState('Никитация😎');
  const [profileBio, setProfileBio] = useState('Люблю комнатные растения и делюсь опытом выращивания.');

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch(`${API_URL}/api/plants`).then(r => r.ok ? r.json() : Promise.reject()).catch(() => null),
      fetch(`${API_URL}/api/problems`).then(r => r.ok ? r.json() : Promise.reject()).catch(() => null),
    ]).then(([p, d]) => {
      if (!alive) return;
      const pData = Array.isArray(p) ? p : p?.data || p?.plants || [];
      const dData = Array.isArray(d) ? d : d?.data || d?.problems || [];
      setPlants(pData);
      setProblems(dData);
      setApiState(p || d ? 'ready' : 'offline');
    });
    return () => { alive = false; };
  }, []);

  const go = (next) => {
    if (next === 'login' || next === 'register') { setAuthReturnPage(page); setAuthModal(next); return; }
    setAuthModal(null);
    const route = PATH_BY_PAGE[next] || '/';
    if (window.location.pathname !== route) {
      window.history.pushState({ page: next }, '', route);
    }
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3200);
  };
  const demoLogin = (data) => {
    setDemoUser({ email: data.email, name: data.name || data.email.split('@')[0] || 'Пользователь' });
    if (data.name) setProfileName(data.name);
    setAuthModal(null);
    window.history.pushState({ page: 'profile' }, '', PATH_BY_PAGE.profile);
    setPage('profile');
    notify('Демонстрационный вход выполнен. Данные аккаунта не отправлялись на сервер.');
  };
  const logout = () => {
    setDemoUser(null);
    go('home');
    notify('Вы вышли из демонстрационного аккаунта.');
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

    let description = document.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement('meta');
      description.name = 'description';
      document.head.appendChild(description);
    }
    description.content = metadata.description;

    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = authModal || PRIVATE_PAGES.has(page) ? 'noindex, nofollow' : 'index, follow';

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.content = metadata.title;

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.content = metadata.description;
  }, [page, authModal]);
  const pageProps = {
    go,
    plants,
    problems,
    apiState,
    selectedPlant,
    setSelectedPlant,
    demoUser,
    notify,
    posts,
    setPosts,
    plantSearch,
    setPlantSearch,
    symptomSearch,
    setSymptomSearch,
    diagnosticFile,
    setDiagnosticFile,
    diagnosticMessage,
    setDiagnosticMessage,
    city,
    setCity,
    profileName,
    setProfileName,
    profileBio,
    setProfileBio,
    logout,
  };
  const content = {
    home: <Home {...pageProps} />,
    admin: demoUser ? (
      <AdminPanel {...pageProps} />
    ) : (
      <main className="page">
        <div className="db-empty">
          <h1>Панель администратора</h1>
          <p>Войдите, чтобы открыть этот раздел.</p>
          <button className="olive-button" onClick={() => go('login')}>
            Войти
          </button>
        </div>
      </main>
    ),
    expert: demoUser ? (
      <ExpertPanel {...pageProps} />
    ) : (
      <main className="page">
        <div className="db-empty">
          <h1>Панель эксперта</h1>
          <p>Войдите, чтобы открыть этот раздел.</p>
          <button className="olive-button" onClick={() => go('login')}>
            Войти
          </button>
        </div>
      </main>
    ),
    catalog: <Catalog {...pageProps} />,
    plant: <PlantDetails {...pageProps} />,
    care: demoUser ? (
      <Care {...pageProps} />
    ) : (
      <main className="page care-locked">
        <div className="db-empty">
          <h1>Уход за растением</h1>
          <h2>Войдите, чтобы открыть уход за растениями</h2>
          <p>
            Ваш календарь, список растений и история ухода появятся после входа
            в аккаунт.
          </p>
          <button className="olive-button" onClick={() => go('login')}>
            Войти
          </button>
        </div>
      </main>
    ),
    diagnostics: <Diagnostics {...pageProps} />,
    map: <MapPage {...pageProps} />,
    community: <Community {...pageProps} />,
    profile: <Profile {...pageProps} />,
    'profile-edit': demoUser ? (
      <ProfileEdit {...pageProps} />
    ) : (
      <main className="page">
        <div className="db-empty">
          <h1>Редактирование профиля</h1>
          <h2>Войдите, чтобы редактировать профиль</h2>
          <button className="olive-button" onClick={() => go('login')}>
            Войти
          </button>
        </div>
      </main>
    ),
    settings: <Settings {...pageProps} />,
    login: <Login {...pageProps} onLogin={demoLogin} onRegister={() => go('register')} />,
    register: <Register {...pageProps} onRegister={demoLogin} onLogin={() => go('login')} />,
  }[page] || <Home {...pageProps} />;

  return <div className="app-shell">
    <Header page={page} go={go} demoUser={demoUser} />
    {content}
    <Footer go={go} />
    {authModal && (
      <div
        className="auth-overlay"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setAuthModal(null);
        }}
      >
        <button
          className="auth-overlay-close"
          onClick={() => setAuthModal(null)}
          aria-label="Закрыть"
        >
          ×
        </button>
        {authModal === 'login' ? (
          <Login
            onLogin={demoLogin}
            onRegister={() => setAuthModal('register')}
            go={go}
          />
        ) : (
          <Register
            onRegister={demoLogin}
            onLogin={() => setAuthModal('login')}
            go={go}
          />
        )}
      </div>
    )}
    {toast && <div className="toast" role="status">{toast}</div>}

  </div>;
}
