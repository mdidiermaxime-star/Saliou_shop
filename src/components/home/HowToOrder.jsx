import { useEffect, useState } from 'react';
import { getSetting } from '../../api/siteContent.js';

const DEFAULT_STEPS = [
  { title: 'Choisis ta taille', text: "Utilise notre guide des tailles si tu n'es pas sûr" },
  { title: 'Paye comme tu veux', text: 'Wave, Orange Money, ou à la livraison' },
  { title: 'Reçois chez toi', text: 'On te contacte pour confirmer le créneau de livraison' },
];

export default function HowToOrder() {
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  useEffect(() => {
    getSetting('how_to_order_json', JSON.stringify(DEFAULT_STEPS)).then((v) => {
      try {
        const parsed = JSON.parse(v);
        if (Array.isArray(parsed) && parsed.length) setSteps(parsed);
      } catch { /* garde la valeur par defaut */ }
    });
  }, []);

  return (
    <div className="px-4 py-6 md:py-8">
      <p className="text-lg text-center mb-4 md:mb-6">Commander, en 3 étapes simples</p>
      {/* Sur mobile : rangees horizontales compactes (icone a gauche, texte a
          droite) plutot que 3 gros blocs empiles verticalement - beaucoup
          moins de hauteur consommee. Sur desktop, on garde la mise en page
          centree en 3 colonnes. */}
      <div className="flex flex-col gap-3 md:grid md:grid-cols-3 md:gap-6 max-w-3xl mx-auto">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3 text-left md:flex-col md:text-center md:items-center">
            <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-terracotta-400 text-white flex items-center justify-center shrink-0 mb-0 md:mb-3 text-sm md:text-lg">{i + 1}</div>
            <div>
              <p className="text-sm mb-0.5 md:mb-1.5">{step.title}</p>
              <p className="text-xs text-gray-500 leading-snug md:leading-relaxed">{step.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
