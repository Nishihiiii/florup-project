import { useState } from 'react';

export default function Settings({demoUser,go,logout,notify}) {
 const [notifications,setNotifications]=useState(true);
 const [dark,setDark]=useState(()=>document.documentElement.classList.contains('theme-dark'));
 return <main className="page settings-page"><button className="back-link" onClick={()=>go('profile')}>← Вернуться в профиль...</button><div className="settings-panel"><h1>Настройки</h1>
 <div className="setting-row"><div><strong>Уведомления</strong><span>Напоминания об уходе за растениями</span></div><button className={`toggle-switch ${notifications?'on':''}`} role="switch" aria-checked={notifications} onClick={()=>setNotifications(v=>!v)}><span/></button></div>
 <div className="setting-row"><div><strong>Тема оформления</strong><span>Светлая или тёмная тема</span></div><button className={`toggle-switch ${dark?'on':''}`} role="switch" aria-checked={dark} onClick={()=>{setDark(v=>!v);document.documentElement.classList.toggle('theme-dark',!dark);}}><span/></button></div>
 <div className="setting-row"><div><strong>Аккаунт</strong><span>{demoUser?.email||'Демонстрационный аккаунт'}</span></div><button className="setting-chevron" onClick={()=>notify('Это демонстрационный аккаунт.')}>›</button></div>
 {demoUser&&<button className="setting-row logout-setting" onClick={logout}><div><strong>Выйти из аккаунта</strong><span>Завершить текущий сеанс</span></div><span className="setting-chevron">›</span></button>}
 </div></main>;
}
