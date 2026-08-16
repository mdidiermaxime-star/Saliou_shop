import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getSetting } from '../api/siteContent.js';

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const paymentMethod = location.state?.paymentMethod;
  const [paymentNumbers, setPaymentNumbers] = useState({ wave: '', orangeMoney: '' });

  useEffect(() => {
    if (paymentMethod === 'WAVE' || paymentMethod === 'ORANGE_MONEY') {
      getSetting('payment_wave_number', '').then((v) => setPaymentNumbers((p) => ({ ...p, wave: v })));
      getSetting('payment_orange_money_number', '').then((v) => setPaymentNumbers((p) => ({ ...p, orangeMoney: v })));
    }
  }, [paymentMethod]);

  const paymentNumber = paymentMethod === 'WAVE' ? paymentNumbers.wave
    : paymentMethod === 'ORANGE_MONEY' ? paymentNumbers.orangeMoney
    : null;

  return (
    <div className="flex justify-center py-12 px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
        <h1 className="text-lg mb-2">Commande confirmée</h1>
        <p className="text-sm text-gray-500 mb-6">Merci ! Votre commande <strong className="text-charcoal">#{orderNumber}</strong> a bien été enregistrée.</p>

        {paymentNumber && (
          <div className="bg-terracotta-50 text-terracotta-800 rounded-xl p-4 text-left text-xs mb-5">
            📲 Il ne reste qu'à envoyer le paiement au <strong>{paymentNumber}</strong> ({paymentMethod === 'WAVE' ? 'Wave' : 'Orange Money'}),
            puis gardez la capture d'écran — notre équipe vous la demandera pour confirmer votre commande.
          </div>
        )}
        {(paymentMethod === 'WAVE' || paymentMethod === 'ORANGE_MONEY') && !paymentNumber && (
          <div className="bg-terracotta-50 text-terracotta-800 rounded-xl p-4 text-left text-xs mb-5">
            📲 Notre équipe vous enverra le numéro {paymentMethod === 'WAVE' ? 'Wave' : 'Orange Money'} pour finaliser le paiement.
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-4 text-left text-xs text-gray-500 mb-5">
          🚚 Notre équipe vous contacte sous 24h pour confirmer le tarif et le créneau de livraison.
        </div>
        <div className="flex gap-2">
          <Link to={`/commande/${orderNumber}`} className="flex-1 bg-charcoal text-white py-2.5 text-sm">Suivre ma commande</Link>
          <Link to="/" className="flex-1 border border-gray-300 py-2.5 text-sm">Continuer mes achats</Link>
        </div>
      </div>
    </div>
  );
}
