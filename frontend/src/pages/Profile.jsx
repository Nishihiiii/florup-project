import { useState } from 'react';
import Placeholder from '../components/Placeholder.jsx';

export default function Profile({demoUser,go,profileName,setProfileName,profileBio,setProfileBio,posts}) {
 const [tab,setTab]=useState('plants');
 if(!demoUser) return <main className="page profile-page"><div className="db-empty"><h2>Войдите, чтобы открыть профиль</h2><p>Можно использовать демонстрационный вход — серверная авторизация пока не подключена.</p><button className="olive-button" onClick={()=>go('login')}>Войти</button></div></main>;
 const ownPosts=posts.filter(p=>p.author===demoUser.name || p.author===profileName);
 return <main className="page profile-page"><button className="back-link" onClick={()=>go('community')}>← Вернуться в сообщество...</button><section className="profile-top"><Placeholder label="" className="profile-photo"/><div className="profile-info"><h1>{profileName||demoUser.name}</h1><p className="profile-email">{demoUser.email}</p><p className="profile-bio">{profileBio||'Расскажите немного о себе и своих растениях.'}</p><div className="profile-stats"><span><b>0</b> Растения</span><span><b>{ownPosts.length}</b> Публикации</span><span><b>{ownPosts.reduce((n,p)=>n+(p.likes||0),0)}</b> Лайки</span></div></div><div className="profile-actions"><button className="profile-settings-placeholder" onClick={()=>go('settings')} aria-label="Открыть настройки" title="Настройки"></button><button className="olive-button profile-edit-button" onClick={()=>go('profile-edit')}>Редактировать</button></div></section>

 <div className="profile-tabs"><button className={tab==='plants'?'active':''} onClick={()=>setTab('plants')}>Мои растения</button><button className={tab==='posts'?'active':''} onClick={()=>setTab('posts')}>Публикации</button></div>
 {tab==='plants'?<div className="db-empty"><h2>Пока нет растений</h2><p>Добавьте первое растение из каталога, чтобы начать вести свою коллекцию.</p><button className="olive-button" onClick={()=>go('catalog')}>Открыть каталог</button></div>:ownPosts.length?<div className="profile-post-grid">{ownPosts.map(post=><article className="post-card" key={post.id}><p>{post.text}</p><div className="post-actions"><span>♡ {post.likes||0}</span></div></article>)}</div>:<div className="db-empty profile-posts-empty"><span className="sad-face-placeholder" aria-hidden="true">☹</span><p>Пока у вас нет публикаций, но вы можете создать их в разделе сообщества.</p></div>}
 </main>;
}
