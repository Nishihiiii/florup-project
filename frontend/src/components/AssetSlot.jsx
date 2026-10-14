import { useState } from 'react';

const EXTENSIONS = ['svg', 'png', 'webp', 'jpg', 'jpeg'];

/**
 * Пустая область под будущий ассет.
 * Положите файл в public/assets/icons/ с именем name и одним из поддерживаемых расширений.
 * Например: hero-icon-1.svg или hero-icon-1.png.
 */
export default function AssetSlot({ name, className = '', label = '' }) {
  const [extensionIndex, setExtensionIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  return (
    <span className={`asset-slot ${className} ${loaded ? 'asset-slot-loaded' : ''}`} role="img" aria-label={label}>
      {!loaded && <span className="asset-slot-fallback" aria-hidden="true" />}
      {extensionIndex < EXTENSIONS.length && (
        <img
          src={`/assets/icons/${name}.${EXTENSIONS[extensionIndex]}`}
          alt=""
          onLoad={() => setLoaded(true)}
          onError={() => setExtensionIndex(index => index + 1)}
        />
      )}
    </span>
  );
}
