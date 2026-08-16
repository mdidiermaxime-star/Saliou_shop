import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../api/products.js';
import { getBanners } from '../api/siteContent.js';
import ProductCard from '../components/product/ProductCard.jsx';
import HowToOrder from '../components/home/HowToOrder.jsx';
import Testimonials from '../components/home/Testimonials.jsx';
import FAQSection from '../components/home/FAQSection.jsx';
import Reveal from '../components/common/Reveal.jsx';

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
      {/* Hero plus compact sur mobile specifiquement (h-[30vh]) qu'avant :
          l'impact visuel vient maintenant du fondu entre slides et de
          l'animation du texte plutot que de la taille brute du bloc.
          Chaque slide est superposee (position absolute) avec une opacite
          animee : la transition entre bannieres est un fondu doux au lieu
          d'un changement brutal. */}
      {banners.length > 0 ? (
        <div className="relative w-full h-[26vh] min-h-[200px] sm:h-[32vh] sm:min-h-[260px] md:h-[42vh] md:min-h-[300px] max-h-[440px] overflow-hidden text-white">
          {banners.map((banner, i) => (
            <div key={banner.id ?? i}
              className={`absolute inset-0 flex items-end md:items-center transition-opacity duration-1000 ease-in-out ${i === slideIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              style={{
                backgroundColor: '#D85A30',
                backgroundImage: banner.imageUrl ? `url(${banner.imageUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent md:bg-gradient-to-r md:from-black/55 md:via-black/15 md:to-transparent" />
              <div className="relative max-w-7xl mx-auto w-full px-6 md:px-12 pb-6 sm:pb-8 md:pb-0">
                {i === slideIndex && (
                  <div key={slideIndex} className="animate-fade-in-up">
                    <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase mb-1 sm:mb-2 md:mb-3 opacity-90">Nouvelle collection</p>
                    <h1 className="font-display font-extrabold uppercase text-xl sm:text-3xl md:text-5xl tracking-tight mb-1.5 sm:mb-3 md:mb-4 leading-[0.95] max-w-2xl">
                      {banner.title}
                    </h1>
                    {banner.subtitle && (
                      <p className="text-xs sm:text-sm md:text-base mb-3 sm:mb-5 md:mb-6 max-w-md opacity-95 hidden sm:block">{banner.subtitle}</p>
                    )}
                    {banner.ctaText && (
                      <Link to={banner.ctaLink || '/'} className="inline-block bg-white text-charcoal px-4 sm:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-medium tracking-wide hover:bg-terracotta-50 active:scale-95 transition-all">
                        {banner.ctaText}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {banners.length > 1 && (
            <div className="absolute bottom-4 sm:bottom-5 md:bottom-8 right-6 md:right-12 flex gap-2 z-10">
              {banners.map((_, i) => (
                <button key={i} onClick={() => setSlideIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === slideIndex ? 'bg-white w-8' : 'bg-white/40 w-1.5'}`}
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
        <Reveal><HowToOrder /></Reveal>

        <Reveal className="px-6 pb-10">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-terracotta-600 mb-3">Univers</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((c) => (
              <Link key={c.slug} to={`/categorie/${c.slug}`}
                className="group relative h-36 md:h-44 rounded-xl overflow-hidden flex items-end p-4 bg-cover bg-center">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-110"
                  style={{ backgroundColor: c.bgColor || '#F3F4F6', backgroundImage: c.imageUrl ? `url(${c.imageUrl})` : undefined }} />
                <div className={`absolute inset-0 transition-colors ${c.imageUrl ? 'bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:from-black/70' : 'bg-charcoal/0 group-hover:bg-charcoal/10'}`} />
                <span className={`relative font-display font-bold uppercase text-lg tracking-tight transition-transform duration-300 group-hover:-translate-y-0.5 ${c.imageUrl ? 'text-white' : 'text-charcoal'}`}>{c.name}</span>
              </Link>
            ))}
          </div>
        </Reveal>

        <Reveal className="px-6 pb-14">
          <div className="flex items-end justify-between mb-5">
            <h3 className="font-display font-extrabold uppercase text-2xl md:text-3xl tracking-tight">Produits populaires</h3>
            <Link to="/recherche?q=" className="text-sm text-terracotta-600 font-medium hidden md:block">Tout voir</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {products.map((p, i) => (
              <div key={p.id} className="reveal reveal-visible" style={{ transitionDelay: `${Math.min(i, 4) * 70}ms` }}>
                <ProductCard product={p} />
              </div>
            ))}
            {products.length === 0 && <p className="col-span-full text-sm text-gray-400">Aucun produit pour le moment.</p>}
          </div>
        </Reveal>
      </div>

      <Reveal><Testimonials /></Reveal>

      <div className="max-w-7xl mx-auto">
        <Reveal><FAQSection /></Reveal>
      </div>
    </div>
  );
}
