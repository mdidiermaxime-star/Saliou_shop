import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiTruck, FiShield, FiBell, FiCheck } from 'react-icons/fi';
import { getProductBySlug } from '../api/products.js';
import { supabase } from '../api/supabase.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [notifyPhone, setNotifyPhone] = useState('');
  const [notifySent, setNotifySent] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    getProductBySlug(slug).then((p) => {
      setProduct(p);
      const firstAvailable = p.variants?.find((v) => v.stockQuantity > 0) || p.variants?.[0];
      setSelectedColor(firstAvailable?.color ?? null);
      setSelectedSize(firstAvailable?.size ?? null);
      setActiveImage(0);
    });
  }, [slug]);

  // Couleurs disponibles pour ce produit, dans leur ordre d'apparition -
  // on affiche une pastille par couleur (pas par variante), c'est la couleur
  // qu'on choisit en premier, comme sur la plupart des sites marchands.
  const colors = useMemo(() => {
    if (!product) return [];
    const seen = new Map();
    for (const v of product.variants || []) {
      if (!seen.has(v.color)) {
        seen.set(v.color, { hex: v.color, inStock: v.stockQuantity > 0 });
      } else if (v.stockQuantity > 0) {
        seen.get(v.color).inStock = true;
      }
    }
    return [...seen.values()];
  }, [product]);

  // Tailles disponibles pour la couleur actuellement selectionnee uniquement
  const sizesForColor = useMemo(() => {
    if (!product) return [];
    return (product.variants || []).filter((v) => v.color === selectedColor);
  }, [product, selectedColor]);

  const selectedVariant = useMemo(
    () => sizesForColor.find((v) => v.size === selectedSize) || null,
    [sizesForColor, selectedSize]
  );

  useEffect(() => {
    setNotifySent(false);
    setNotifyPhone('');
    setJustAdded(false);
  }, [selectedVariant]);

  if (!product) return <p className="px-4 py-6 text-sm text-gray-400">Chargement...</p>;

  const outOfStock = selectedVariant && selectedVariant.stockQuantity === 0;
  const images = product.imageUrls?.length ? product.imageUrls : [];

  function handleSelectColor(hex) {
    setSelectedColor(hex);
    // Garde la meme taille si elle existe dans cette couleur, sinon prend
    // la premiere taille disponible en stock, sinon la premiere tout court.
    const variantsForColor = (product.variants || []).filter((v) => v.color === hex);
    const sameSize = variantsForColor.find((v) => v.size === selectedSize);
    const fallback = variantsForColor.find((v) => v.stockQuantity > 0) || variantsForColor[0];
    setSelectedSize((sameSize || fallback)?.size ?? null);
  }

  function handleAddToCart() {
    if (!selectedVariant || outOfStock) return;
    addItem(selectedVariant, product, 1);
    setJustAdded(true);
  }

  async function handleNotifyRequest(e) {
    e.preventDefault();
    if (!notifyPhone.trim()) return;
    await supabase.from('stock_notification_requests').insert({ product_variant_id: selectedVariant.id, phone_number: notifyPhone.trim() });
    setNotifySent(true);
  }

  return (
    <div className="grid md:grid-cols-[3fr_2fr] gap-10 px-4 py-6 max-w-7xl mx-auto">
      <div>
        {/* Format carre (1:1), plus adapte a des chaussures qu'un format
            portrait, et une hauteur plafonnee pour rester elegant meme sur
            grand ecran maintenant que la colonne est plus large. */}
        <div className="aspect-square max-h-[560px] bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center mb-3 mx-auto">
          {images[activeImage] ? (
            <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-300 text-6xl">👕</span>
          )}
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {images.map((url, i) => (
              <button key={i} onClick={() => setActiveImage(i)}
                className={`aspect-square rounded-lg overflow-hidden border-2 ${activeImage === i ? 'border-charcoal' : 'border-transparent'}`}>
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs text-terracotta-600 font-medium mb-1">{product.product_type}</p>
        <h1 className="text-xl mb-3">{product.name}</h1>
        <p className="text-2xl font-medium mb-1">{product.basePrice.toLocaleString('fr-FR')} FCFA</p>
        <p className="text-sm text-gray-500 mb-6">{product.description}</p>

        {colors.length > 0 && (
          <div className="mb-5">
            <p className="text-sm font-medium mb-2.5">Couleur</p>
            <div className="flex flex-wrap gap-2.5">
              {colors.map((c) => (
                <button key={c.hex} type="button" onClick={() => handleSelectColor(c.hex)}
                  title={!c.inStock ? 'Rupture de stock' : undefined}
                  className={`relative w-9 h-9 rounded-full transition-shadow ${selectedColor === c.hex ? 'ring-2 ring-charcoal ring-offset-2' : 'ring-1 ring-gray-200 ring-offset-1'}`}
                  style={{ backgroundColor: c.hex }}>
                  {!c.inStock && (
                    <span className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(to top right, transparent 46%, #d1d5db 48%, #d1d5db 52%, transparent 54%)' }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {sizesForColor.length > 0 && (
          <div className="mb-2">
            <p className="text-sm font-medium mb-2.5">Taille</p>
            <div className="flex flex-wrap gap-2">
              {sizesForColor.map((v) => (
                <button key={v.id} type="button" disabled={v.stockQuantity === 0} onClick={() => setSelectedSize(v.size)}
                  className={`min-w-[2.75rem] h-10 px-3 rounded-lg border text-sm transition-colors
                    ${selectedSize === v.size ? 'border-2 border-charcoal font-medium bg-charcoal/5' : 'border-gray-300 bg-white hover:border-gray-400'}
                    ${v.stockQuantity === 0 ? 'text-gray-300 line-through bg-gray-50 border-gray-200 hover:border-gray-200' : ''}`}>
                  {v.size}
                </button>
              ))}
            </div>
          </div>
        )}
        {selectedVariant && !outOfStock && selectedVariant.stockQuantity <= 3 && (
          <p className="text-xs text-terracotta-600 mt-2 mb-5">Plus que {selectedVariant.stockQuantity} en stock</p>
        )}
        {(!selectedVariant || outOfStock || selectedVariant.stockQuantity > 3) && <div className="mb-5" />}

        {outOfStock ? (
          notifySent ? (
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 flex items-center gap-2">
              <FiBell size={16} className="text-terracotta-400" />
              On te préviendra dès que cette taille sera de nouveau disponible.
            </div>
          ) : (
            <form onSubmit={handleNotifyRequest} className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm flex items-center gap-2 mb-3">
                <FiBell size={16} className="text-terracotta-400" />
                Taille {selectedVariant.size} en rupture — on te prévient dès qu'elle revient
              </p>
              <div className="flex gap-2">
                <input type="text" placeholder="Ton numéro" value={notifyPhone} onChange={(e) => setNotifyPhone(e.target.value)} className="flex-1" />
                <button type="submit" className="bg-charcoal text-white px-4 text-sm">Me prévenir</button>
              </div>
            </form>
          )
        ) : (
          <div>
            <button onClick={handleAddToCart} disabled={!selectedVariant} className="w-full bg-charcoal text-white py-3 text-sm disabled:opacity-40">Ajouter au panier</button>
            {justAdded && (
              <div className="mt-3 bg-green-50 text-green-700 text-sm rounded-lg p-3 flex items-center justify-between animate-fade-in-up">
                <span className="flex items-center gap-2"><FiCheck size={16} /> Ajouté au panier</span>
                <Link to="/panier" className="underline font-medium">Voir le panier</Link>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-gray-200 text-xs text-gray-500 flex flex-col gap-2">
          <span className="flex items-center gap-2"><FiTruck size={15} /> Livraison partout au Sénégal — tarif confirmé après commande</span>
          <span className="flex items-center gap-2"><FiShield size={15} /> Paiement Wave, Orange Money ou à la livraison</span>
        </div>
      </div>
    </div>
  );
}
