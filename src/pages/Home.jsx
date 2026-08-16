import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../api/products.js';
import { getBanners } from '../api/siteContent.js';
import ProductCard from '../components/product/ProductCard.jsx';
import HowToOrder from '../components/home/HowToOrder.jsx';
import Testimonials from '../components/home/Testimonials.jsx';
import FAQSection from '../components/home/FAQSection.jsx';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    getProducts({ limit: 8 }).then(setProducts);
    getCategories().then(setCategories);
    getBanners('HERO_SLIDE').then(setBanners);
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => setSlideIndex((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners]);

  const activeBanner = banners[slideIndex];

  return (
    <div>
      {/* Hero compact : assez grand pour avoir de l'impact, mais sans forcer
          a scroller longtemps avant de voir les produits (retour explicite
          du client : la version precedente prenait trop de place a l'ecran) */}
      {activeBanner ? (
        <div className="relative w-full h-[42vh] min-h-[300px] max-h-[440px] overflow-hidden text-white flex items-end md:items-center"
          style={{
            backgroundColor: '#D85A30',
            backgroundImage: activeBanner.imageUrl ? `url(${activeBanner.imageUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent md:bg-gradient-to-r md:from-black/55 md:via-black/15 md:to-transparent" />
          <div className="relative max-w-7xl mx-auto w-full px-6 md:px-12 pb-8 md:pb-0">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-2 md:mb-3 opacity-90">Nouvelle collection</p>
            <h1 className="font-display font-extrabold uppercase text-3xl sm:text-4xl md:text-5xl tracking-tight mb-3 md:mb-4 leading-[0.95] max-w-2xl">
              {activeBanner.title}
            </h1>
            {activeBanner.subtitle && (
              <p className="text-sm md:text-base mb-5 md:mb-6 max-w-md opacity-95">{activeBanner.subtitle}</p>
            )}
            {activeBanner.ctaText && (
              <Link to={activeBanner.ctaLink || '/'} className="inline-block bg-white text-charcoal px-6 py-3 text-sm font-medium tracking-wide hover:bg-terracotta-50 transition-colors">
                {activeBanner.ctaText}
              </Link>
            )}
          </div>
          {banners.length > 1 && (
            <div className="absolute bottom-5 md:bottom-8 right-6 md:right-12 flex gap-2 z-10">
              {banners.map((_, i) => (
                <button key={i} onClick={() => setSlideIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${i === slideIndex ? 'bg-white w-8' : 'bg-white/40 w-1.5'}`}
                  aria-label={`Bannière ${i + 1}`} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-[30vh] min-h-[220px] flex items-center justify-center bg-gray-50 text-gray-400 text-sm px-6 text-center">
          Aucune bannière configurée — ajoutez-en une depuis Admin &gt; Contenu du site.
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <HowToOrder />

        <div className="px-6 pb-10">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-terracotta-600 mb-3">Univers</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((c) => (
              <Link key={c.slug} to={`/categorie/${c.slug}`}
                className="group relative h-36 md:h-44 rounded-xl overflow-hidden flex items-end p-4 bg-cover bg-center"
                style={{
                  backgroundColor: c.bgColor || '#F3F4F6',
                  backgroundImage: c.imageUrl ? `url(${c.imageUrl})` : undefined,
                }}>
                <div className={`absolute inset-0 transition-colors ${c.imageUrl ? 'bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:from-black/70' : 'bg-charcoal/0 group-hover:bg-charcoal/10'}`} />
                <span className={`relative font-display font-bold uppercase text-lg tracking-tight ${c.imageUrl ? 'text-white' : 'text-charcoal'}`}>{c.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="px-6 pb-14">
          <div className="flex items-end justify-between mb-5">
            <h3 className="font-display font-extrabold uppercase text-2xl md:text-3xl tracking-tight">Produits populaires</h3>
            <Link to="/recherche?q=" className="text-sm text-terracotta-600 font-medium hidden md:block">Tout voir</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
            {products.length === 0 && <p className="col-span-full text-sm text-gray-400">Aucun produit pour le moment.</p>}
          </div>
        </div>
      </div>

      <Testimonials />

      <div className="max-w-7xl mx-auto">
        <FAQSection />
      </div>
    </div>
  );
}
