import { useState } from 'react';

export default function ProfileEdit({
  go,
  profileName,
  setProfileName,
  profileBio,
  setProfileBio,
  demoUser,
}) {
  const [photoPreview, setPhotoPreview] = useState('');

  const choosePhoto = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const save = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setProfileName(
      String(formData.get('name') || demoUser?.name || '').trim(),
    );
    setProfileBio(String(formData.get('bio') || ''));
    go('profile');
  };

  return (
    <main className="page profile-edit-page">
      <button className="back-link" onClick={() => go('profile')}>
        ← Вернуться в профиль...
      </button>

      <form className="profile-edit-panel" onSubmit={save}>
        <h1>Редактировать профиль</h1>

        <label className="profile-edit-avatar-upload">
          <span
            className="profile-edit-avatar"
            style={
              photoPreview
                ? { backgroundImage: `url(${photoPreview})` }
                : undefined
            }
          >
            {photoPreview ? null : (
              <>
                <span className="avatar-upload-plus">＋</span>
                <span>Место для фотографии</span>
              </>
            )}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={choosePhoto}
            aria-label="Выбрать фотографию профиля"
          />
          <span className="choose-photo-button">Выбрать фотографию</span>
        </label>

        <label>
          Имя
          <input
            name="name"
            defaultValue={profileName || demoUser?.name || ''}
            maxLength={60}
          />
        </label>

        <label>
          О себе
          <textarea
            name="bio"
            defaultValue={profileBio || ''}
            maxLength={250}
          />
        </label>

        <div className="profile-edit-actions">
          <button
            type="button"
            className="soft-button"
            onClick={() => go('profile')}
          >
            Отмена
          </button>
          <button type="submit" className="olive-button">
            Сохранить
          </button>
        </div>
      </form>
    </main>
  );
}
