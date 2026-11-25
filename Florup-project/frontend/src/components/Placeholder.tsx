interface PlaceholderProps {
  label?: string;
  className?: string;
}

export default function Placeholder({ label = 'Место для изображения', className = '' }: PlaceholderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-card to-pale text-tan dark:from-[#3b3a30] dark:to-[#303129] ${className}`}
    >
      <span className="h-12 w-12 rounded-full border border-dashed border-tan/70 bg-cream/50 dark:bg-black/20" />
      {label && <small className="px-3 text-center text-[11px]">{label}</small>}
    </div>
  );
}