import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiUser, FiChevronDown } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function MobileDrawer({ open, onClose, categories }) {
  const [openSlug, setOpenSlug] = useState(null);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/45 z-50 flex justify-end md:hidden" onClick={onClose}>
      <div className="w-72 bg-white h-full p-5 flex flex-col overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm text-charcoal">Menu</span>
          <button onClick={onClose} aria-label="Fermer le menu"><FiX size={20} className="text-gray-500" /></button>
        </div>
        <nav className="flex flex-col">
          {categories.map((cat) => {
            const hasChildren = cat.children?.length > 0;
            const isOpen = openSlug === cat.slug;
            return (
              <div key={cat.slug} className="border-b border-gray-100">
                <div className="flex items-center justify-between py-3">
                  <Link to={`/categorie/${cat.slug}`} onClick={onClose} className="text-sm text-charcoal flex-1">
                    {cat.name}
                  </Link>
                  {hasChildren && (
                    <button onClick={() => setOpenSlug(isOpen ? null : cat.slug)} aria-label={`Sous-catégories de ${cat.name}`} className="p-1 -mr-1 text-gray-400">
                      <FiChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
                {hasChildren && isOpen && (
                  <div className="flex flex-col pb-2 pl-3">
                    {cat.children.map((sub) => (
                      <Link key={sub.slug} to={`/categorie/${sub.slug}`} onClick={onClose} className="py-2 text-sm text-gray-500">
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
          <Link to="/connexion" onClick={onClose} className="flex items-center gap-2 text-sm text-gray-600"><FiUser size={16} /> Mon compte</Link>
          <a href="https://wa.me/221770000000" className="flex items-center gap-2 text-sm text-gray-600"><FaWhatsapp size={16} /> Nous contacter</a>
        </div>
      </div>
    </div>
  );
}
