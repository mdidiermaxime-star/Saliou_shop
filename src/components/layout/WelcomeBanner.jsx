import { useState } from 'react';
import { FiShield, FiX } from 'react-icons/fi';

const STORAGE_KEY = 'saliou_welcome_dismissed';

export default function WelcomeBanner() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');
  if (dismissed) return null;
  return (
    <div className="bg-gray-50 px-4 md:px-6 py-3 flex items-center gap-3">
      <FiShield size={18} className="text-terracotta-400 flex-shrink-0" />
      <p className="text-xs flex-1">
        Ce site accepte <strong>Wave</strong> et <strong>Orange Money</strong> en toute sécurité, ou le paiement en espèces à la livraison si tu préfères.
      </p>
      <button onClick={() => { localStorage.setItem(STORAGE_KEY, 'true'); setDismissed(true); }} aria-label="Fermer">
        <FiX size={16} className="text-gray-400" />
      </button>
    </div>
  );
}
