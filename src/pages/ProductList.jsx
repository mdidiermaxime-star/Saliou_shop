import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiChevronRight, FiPackage } from 'react-icons/fi';
import { getCategories, getProducts } from '../api/products.js';
import ProductCard from '../components/product/ProductCard.jsx';

export default function ProductList() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [parent, setParent] = useState(null);
  const [activeChild, setActiveChild] = useState(null); // filtre sous-categorie, null = toutes
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setActiveChild(null);
    getCategories().then((categories) => {
      const flat = categories.flatMap((c) => [c, ...(c.children || [])]);
      const match = flat.find((c) => c.slug === slug);
      if (!match) { setCategory(null); setLoading(false); return; }

      const isParent = !match.parent_id;
      const parentCategory = isParent ? match : categories.find((c) => c.id === match.parent_id);
      setCategory(match);
      setParent(isParent ? null : parentCategory);

      // Sur une categorie principale, on regroupe ses propres produits ET
      // ceux de toutes ses sous-categories (une paire de Crocs rangee dans
      // "Sandales femme" doit quand meme apparaitre sous "Femme").
      const idsToShow = isParent ? [match.id, ...(match.children || []).map((c) => c.id)] : [match.id];
      getProducts({ categoryIds: idsToShow, limit: 60 }).then((p) => { setProducts(p); setLoading(false); });
    });
  }, [slug]);

  const displayedProducts = activeChild
    ? products.filter((p) => p.category_id === activeChild)
    : products;

  if (!loading && !category) {
    return <p className="px-4 py-10 text-center text-sm text-gray-400">Catégorie introuvable.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Fil d'ariane */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
        <Link to="/" className="hover:text-charcoal">Accueil</Link>
        {parent && (
          <>
            <FiChevronRight size={12} />
            <Link to={`/categorie/${parent.slug}`} className="hover:text-charcoal">{parent.name}</Link>
          </>
        )}
        <FiChevronRight size={12} />
        <span className="text-charcoal">{category?.name || slug}</span>
      </div>

      <h1 className="font-display font-extrabold uppercase text-2xl md:text-3xl tracking-tight mb-1">{category?.name}</h1>
      <p className="text-xs text-gray-500 mb-5">{displayedProducts.length} produit{displayedProducts.length > 1 ? 's' : ''}</p>

      {/* Chips de sous-categories, uniquement sur une categorie principale qui en a */}
      {category?.children?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setActiveChild(null)}
            className={`text-xs px-3.5 py-1.5 rounded-full transition-colors ${!activeChild ? 'bg-charcoal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Tout
          </button>
          {category.children.map((c) => (
            <button key={c.id} onClick={() => setActiveChild(c.id)}
              className={`text-xs px-3.5 py-1.5 rounded-full transition-colors ${activeChild === c.id ? 'bg-charcoal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : displayedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center text-center py-20 text-gray-400">
          <FiPackage size={32} className="mb-3 text-gray-300" />
          <p className="text-sm">Aucun produit dans cette catégorie pour le moment.</p>
          <Link to="/" className="text-xs text-terracotta-600 underline mt-2">Retour à l'accueil</Link>
        </div>
      )}
    </div>
  );
}
