import { Link } from 'react-router-dom';

export default function Logo({ variant = 'dark', to = '/' }) {
  const isLight = variant === 'light';
  return (
    <Link to={to} className="inline-flex items-center gap-2.5 group">
      <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D85A30' }}>
        <span className="text-white text-lg italic leading-none" style={{ fontFamily: 'Georgia, serif' }}>S</span>
      </span>
      <span className={`text-lg tracking-wide leading-none ${isLight ? 'text-white' : 'text-charcoal'}`} style={{ fontWeight: 500 }}>
        SALIOU <span style={{ color: '#D85A30' }}>SHOP</span>
      </span>
    </Link>
  );
}
