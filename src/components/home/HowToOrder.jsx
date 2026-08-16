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
    <div className="px-4 py-8">
      <p className="text-lg text-center mb-6">Commander, en 3 étapes simples</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {steps.map((step, i) => (
          <div key={i} className="text-center">
            <div className="w-12 h-12 rounded-full bg-terracotta-400 text-white flex items-center justify-center mx-auto mb-3 text-lg">{i + 1}</div>
            <p className="text-sm mb-1.5">{step.title}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{step.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
