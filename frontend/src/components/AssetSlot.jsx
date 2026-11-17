import { useState } from 'react';

const EXTENSIONS = ['svg', 'png', 'webp', 'jpg', 'jpeg'];

export default function AssetSlot({ name, className = '', label = '' }) {
  const [extIndex, setExtIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  return (
    <span className={className} role="img" aria-label={label}>
      <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit]">
        {!loaded && (
          <span
            className="block h-full w-full rounded-[inherit] border border-line/40 bg-card dark:border-[#68644e] dark:bg-[#3b3a30]"
            aria-hidden="true"
          />
        )}
        {extIndex < EXTENSIONS.length && (
          <img
            src={`/assets/icons/${name}.${EXTENSIONS[extIndex]}`}
            alt=""
            className="h-full w-full object-contain"
            onLoad={() => setLoaded(true)}
            onError={() => setExtIndex((i) => i + 1)}
          />
        )}
      </span>
    </span>
  );
}