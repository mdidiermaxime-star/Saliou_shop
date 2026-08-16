import { useEffect, useState } from 'react';
import { getSetting, setSetting } from '../../api/siteContent.js';

const DEFAULT_STEPS = [
  { title: 'Choisis ta taille', text: "Utilise notre guide des tailles si tu n'es pas sûr" },
  { title: 'Paye comme tu veux', text: 'Wave, Orange Money, ou à la livraison' },
  { title: 'Reçois chez toi', text: 'On te contacte pour confirmer le créneau de livraison' },
];

export default function AdminSettings() {
  const [promoBarItems, setPromoBarItems] = useState(['', '', '']);
  const [social, setSocial] = useState({ instagram: '', tiktok: '', whatsapp: '' });
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [payment, setPayment] = useState({ waveNumber: '', orangeMoneyNumber: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSetting('promo_bar_items', '').then((v) => { if (v) setPromoBarItems(v.split('|||')); });
    getSetting('social_instagram', '').then((v) => setSocial((s) => ({ ...s, instagram: v })));
    getSetting('social_tiktok', '').then((v) => setSocial((s) => ({ ...s, tiktok: v })));
    getSetting('social_whatsapp', '').then((v) => setSocial((s) => ({ ...s, whatsapp: v })));
    getSetting('payment_wave_number', '').then((v) => setPayment((p) => ({ ...p, waveNumber: v })));
    getSetting('payment_orange_money_number', '').then((v) => setPayment((p) => ({ ...p, orangeMoneyNumber: v })));
    getSetting('how_to_order_json', '').then((v) => {
      try { const parsed = JSON.parse(v); if (Array.isArray(parsed) && parsed.length) setSteps(parsed); }
      catch { /* garde la valeur par defaut */ }
    });
  }, []);

  function updateStepField(index, field, value) {
    const next = [...steps];
    next[index] = { ...next[index], [field]: value };
    setSteps(next);
  }

  async function handleSaveAll() {
    await setSetting('promo_bar_items', promoBarItems.filter(Boolean).join('|||'));
    await setSetting('social_instagram', social.instagram);
    await setSetting('social_tiktok', social.tiktok);
    await setSetting('social_whatsapp', social.whatsapp);
    await setSetting('how_to_order_json', JSON.stringify(steps));
    await setSetting('payment_wave_number', payment.waveNumber);
    await setSetting('payment_orange_money_number', payment.orangeMoneyNumber);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl mb-1">Réglages</h1>
      <p className="text-xs text-gray-500 mb-6">Contenu affiché sur le site, modifiable sans toucher au code</p>

      <div className="bg-gray-50 rounded-xl p-4 mb-5">
        <p className="text-sm font-medium mb-3">Bandeau du haut (3 messages)</p>
        {promoBarItems.map((item, i) => (
          <input key={i} value={item} onChange={(e) => { const next = [...promoBarItems]; next[i] = e.target.value; setPromoBarItems(next); }}
            placeholder={`Message ${i + 1}`} className="w-full mb-2" />
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-5">
        <p className="text-sm font-medium mb-3">Réseaux sociaux</p>
        <input value={social.instagram} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} placeholder="Lien Instagram" className="w-full mb-2" />
        <input value={social.tiktok} onChange={(e) => setSocial({ ...social, tiktok: e.target.value })} placeholder="Lien TikTok" className="w-full mb-2" />
        <input value={social.whatsapp} onChange={(e) => setSocial({ ...social, whatsapp: e.target.value })} placeholder="Lien WhatsApp (https://wa.me/221...)" className="w-full" />
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-5">
        <p className="text-sm font-medium mb-3">Numéros de paiement mobile</p>
        <p className="text-xs text-gray-500 mb-3">
          Affichés au client pendant le paiement quand il choisit Wave ou Orange Money, pour qu'il sache
          immédiatement où envoyer l'argent.
        </p>
        <input value={payment.waveNumber} onChange={(e) => setPayment({ ...payment, waveNumber: e.target.value })}
          placeholder="Numéro Wave (ex: 77 000 00 00)" className="w-full mb-2" />
        <input value={payment.orangeMoneyNumber} onChange={(e) => setPayment({ ...payment, orangeMoneyNumber: e.target.value })}
          placeholder="Numéro Orange Money (ex: 77 000 00 00)" className="w-full" />
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-5">
        <p className="text-sm font-medium mb-3">Guide "Commander en 3 étapes" (accueil)</p>
        {steps.map((step, i) => (
          <div key={i} className="mb-3 pb-3 border-b border-gray-200 last:border-0">
            <p className="text-xs text-gray-500 mb-1.5">Étape {i + 1}</p>
            <input value={step.title} onChange={(e) => updateStepField(i, 'title', e.target.value)} placeholder="Titre" className="w-full mb-2" />
            <input value={step.text} onChange={(e) => updateStepField(i, 'text', e.target.value)} placeholder="Description" className="w-full" />
          </div>
        ))}
      </div>

      <button onClick={handleSaveAll} className="bg-charcoal text-white px-5 py-2.5 text-sm">Enregistrer tout</button>
      {saved && <span className="ml-3 text-xs text-green-600">Enregistré ✓</span>}
    </div>
  );
}
