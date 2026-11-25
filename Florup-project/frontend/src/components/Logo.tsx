import { useId } from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = 'h-8 w-8' }: LogoProps) {
  const maskId = useId();
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="40" height="40" fill="white" />
          <path
            d="M12.5 27.5C15.5 24.5 18.8 21.2 22.8 17.2"
            stroke="black"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
        </mask>
      </defs>
      <circle cx="20" cy="20" r="18" fill="currentColor" fillOpacity="0.28" />
      <path
        d="M13 27.2C12.8 18.5 18.2 12.2 27.2 12C27.2 21 21.2 27 13 27.2Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}