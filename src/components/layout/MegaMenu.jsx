import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export default function MegaMenu({ categories }) {
  const [openSlug, setOpenSlug] = useState(null);
  const closeTimer = useRef(null);

  function handleEnter(slug) {
    clearTimeout(closeTimer.current);
    setOpenSlug(slug);
  }
  function handleLeave() {
    closeTimer.current = setTimeout(() => setOpenSlug(null), 120);
  }

  const activeCategory = categories.find((c) => c.slug === openSlug);
  const hasChildren = activeCategory?.children?.length > 0;

  return (
    <nav className="hidden md:flex gap-7 text-sm relative" onMouseLeave={handleLeave}>
      {categories.map((cat) => (
        <div key={cat.slug} onMouseEnter={() => handleEnter(cat.slug)}>
          <Link to={`/categorie/${cat.slug}`}
            className={`py-2 inline-block border-b-2 transition-colors ${openSlug === cat.slug ? 'border-terracotta-400 text-charcoal' : 'border-transparent text-gray-600 hover:text-charcoal'}`}>
            {cat.name}
          </Link>
        </div>
      ))}

      {hasChildren && (
        <div onMouseEnter={() => handleEnter(openSlug)}
          className="absolute left-0 top-full w-[420px] bg-white border border-gray-200 shadow-lg rounded-b-xl py-5 px-6 grid grid-cols-2 gap-x-8 gap-y-2 z-40">
          <p className="col-span-2 text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{activeCategory.name}</p>
          <Link to={`/categorie/${activeCategory.slug}`} className="col-span-2 text-sm font-medium text-terracotta-600 mb-2">
            Tout {activeCategory.name.toLowerCase()}
          </Link>
          {activeCategory.children.map((sub) => (
            <Link key={sub.slug} to={`/categorie/${sub.slug}`} className="text-sm text-gray-600 hover:text-charcoal py-1">
              {sub.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
