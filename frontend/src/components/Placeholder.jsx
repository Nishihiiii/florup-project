export default function Placeholder({ label = 'Место для изображения', className = '' }) {
  return <div className={`image-placeholder ${className}`}><span className="placeholder-circle"></span><small>{label}</small></div>;
}
