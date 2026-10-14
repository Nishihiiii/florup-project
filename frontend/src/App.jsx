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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const NAV = [
  ['catalog', 'Каталог'], ['care', 'Уход за растением'], ['diagnostics', 'Диагностика'],
  ['map', 'Карта магазинов'], ['community', 'Сообщество']
];

export default function App() {
  const [page, setPage] = useState('home');
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
    setPage('profile');
    notify('Демонстрационный вход выполнен. Данные аккаунта не отправлялись на сервер.');
  };
  const logout = () => {
    setDemoUser(null);
    go('home');
    notify('Вы вышли из демонстрационного аккаунта.');
  };
  const pageProps = { go, plants, problems, apiState, selectedPlant, setSelectedPlant, demoUser, notify, posts, setPosts, plantSearch, setPlantSearch, symptomSearch, setSymptomSearch, diagnosticFile, setDiagnosticFile, diagnosticMessage, setDiagnosticMessage, city, setCity, profileName, setProfileName, profileBio, setProfileBio, logout };
  const content = {
    home: <Home {...pageProps} />,
    catalog: <Catalog {...pageProps} />,
    plant: <PlantDetails {...pageProps} />,
    care: demoUser ? <Care {...pageProps} /> : <main className="page care-locked"><div className="db-empty"><h2>Войдите, чтобы открыть уход за растениями</h2><p>Ваш календарь, список растений и история ухода появятся после входа в аккаунт.</p><button className="olive-button" onClick={() => go('login')}>Войти</button></div></main>,
    diagnostics: <Diagnostics {...pageProps} />,
    map: <MapPage {...pageProps} />,
    community: <Community {...pageProps} />,
    profile: <Profile {...pageProps} />,
    'profile-edit': demoUser ? <ProfileEdit {...pageProps} /> : <main className="page"><div className="db-empty"><h2>Войдите, чтобы редактировать профиль</h2><button className="olive-button" onClick={() => go('login')}>Войти</button></div></main>,
    settings: <Settings {...pageProps} />,
    login: <Login {...pageProps} onLogin={demoLogin} onRegister={() => go('register')} />,
    register: <Register {...pageProps} onRegister={demoLogin} onLogin={() => go('login')} />,
  }[page] || <Home {...pageProps} />;

  return <div className="app-shell">
    <Header page={page} go={go} demoUser={demoUser} />
    {content}
    <Footer go={go} />
    {authModal && <div className="auth-overlay" role="dialog" aria-modal="true" onMouseDown={e=>{if(e.target===e.currentTarget)setAuthModal(null)}}><button className="auth-overlay-close" onClick={()=>setAuthModal(null)} aria-label="Закрыть">×</button>{authModal==='login' ? <Login onLogin={demoLogin} onRegister={()=>setAuthModal('register')} go={go} /> : <Register onRegister={demoLogin} onLogin={()=>setAuthModal('login')} go={go} />}</div>}
    {toast && <div className="toast" role="status">{toast}</div>}

  </div>;
}
