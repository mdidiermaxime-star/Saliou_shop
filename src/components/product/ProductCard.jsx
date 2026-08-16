import { Link } from 'react-router-dom';
import { FiImage } from 'react-icons/fi';

export default function ProductCard({ product }) {
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.basePrice;
  const imageCount = product.imageUrls?.length || 0;

  // Pastilles de couleur dedupliquees (pas une par variante) : plus lisible
  // qu'une pastille repetee pour chaque taille de chaque couleur.
  const colors = [...new Map((product.variants || []).map((v) => [v.color, v.color])).values()].slice(0, 5);

  return (
    <Link to={`/produit/${product.slug}`} className="card card-hover overflow-hidden block group">
      {/* Meme format que la fiche produit (4:5) pour une grille homogene,
          quelle que soit la taille reelle des photos televersees. */}
      <div className="aspect-[4/5] bg-gray-50 flex items-center justify-center relative overflow-hidden">
        {product.imageUrls?.[0] ? (
          <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="text-gray-300 text-3xl">👕</span>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-terracotta-100 text-terracotta-800 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
            -{Math.round((1 - product.basePrice / product.compareAtPrice) * 100)}%
          </span>
        )}
        {imageCount > 1 && (
          <span className="absolute top-2 right-2 bg-black/55 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
            <FiImage size={10} /> {imageCount}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm mb-1 truncate">{product.name}</p>
        <p className="text-sm font-medium mb-1.5">
          {product.basePrice.toLocaleString('fr-FR')} FCFA
          {hasDiscount && <span className="text-gray-400 font-normal line-through text-xs ml-1">{product.compareAtPrice.toLocaleString('fr-FR')}</span>}
        </p>
        {colors.length > 0 && (
          <div className="flex items-center gap-1">
            {colors.map((hex) => (
              <span key={hex} className="w-3 h-3 rounded-full inline-block ring-1 ring-gray-200" style={{ backgroundColor: hex }} />
            ))}
            {(product.variants?.length || 0) > colors.length && (
              <span className="text-[10px] text-gray-400 ml-0.5">+{new Set((product.variants || []).map((v) => v.color)).size - colors.length}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
