import { useEffect, useState } from 'react';
import { getSetting } from '../../api/siteContent.js';

const DEFAULT_ITEMS = 'Livraison partout au Sénégal|||Wave, Orange Money ou à la livraison|||Retour sous 7 jours';

export default function PromoBar() {
  const [items, setItems] = useState(DEFAULT_ITEMS.split('|||'));

  useEffect(() => {
    getSetting('promo_bar_items', DEFAULT_ITEMS).then((v) => setItems(v.split('|||').filter(Boolean)));
  }, []);

  return (
    <div className="bg-charcoal text-terracotta-100 text-xs py-2 px-5 flex items-center justify-center gap-7 flex-wrap">
      {items.map((item, i) => <span key={i}>{item}</span>)}
    </div>
  );
}
