import { Link } from 'react-router-dom';
import { FiX, FiUser } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function MobileDrawer({ open, onClose, categories }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/45 z-50 flex justify-end md:hidden" onClick={onClose}>
      <div className="w-64 bg-white h-full p-5 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm text-charcoal">Menu</span>
          <button onClick={onClose} aria-label="Fermer le menu"><FiX size={20} className="text-gray-500" /></button>
        </div>
        <nav className="flex flex-col">
          {categories.map((cat) => (
            <Link key={cat.slug} to={`/categorie/${cat.slug}`} onClick={onClose} className="flex items-center justify-between py-3 border-b border-gray-100 text-sm text-charcoal">
              {cat.name}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
          <Link to="/connexion" onClick={onClose} className="flex items-center gap-2 text-sm text-gray-600"><FiUser size={16} /> Mon compte</Link>
          <a href="https://wa.me/221770000000" className="flex items-center gap-2 text-sm text-gray-600"><FaWhatsapp size={16} /> Nous contacter</a>
        </div>
      </div>
    </div>
  );
}
