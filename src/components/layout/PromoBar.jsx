import { useEffect, useState } from 'react';
import { getSetting } from '../../api/siteContent.js';

const DEFAULT_ITEMS = 'Livraison partout au Sénégal|||Wave, Orange Money ou à la livraison|||Retour sous 7 jours';

export default function PromoBar() {
  const [items, setItems] = useState(DEFAULT_ITEMS.split('|||'));

  useEffect(() => {
    getSetting('promo_bar_items', DEFAULT_ITEMS).then((v) => setItems(v.split('|||').filter(Boolean)));
  }, []);

  return (
    <div className="bg-charcoal text-terracotta-100 text-xs py-2 overflow-hidden">
      {/* Mobile : defilement continu sur une seule ligne, meme taille de
          texte que sur desktop (pas de retrecissement). La liste est
          dupliquee pour boucler sans coupure visible. */}
      <div className="md:hidden flex whitespace-nowrap animate-marquee">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="mx-5">{item}</span>
        ))}
      </div>
      {/* Desktop : centre, statique, comme avant */}
      <div className="hidden md:flex items-center justify-center gap-7 px-5">
        {items.map((item, i) => <span key={i}>{item}</span>)}
      </div>
    </div>
  );
}
