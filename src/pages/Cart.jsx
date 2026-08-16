import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTruck, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { createOrder } from '../api/orders.js';
import { validatePromoCode } from '../api/promoCodes.js';
import { getSetting } from '../api/siteContent.js';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customerFullName: '', customerPhone: '', deliveryCity: '', deliveryZone: '', deliveryDetails: '', paymentMethod: 'CASH_ON_DELIVERY',
  });
  const [paymentNumbers, setPaymentNumbers] = useState({ wave: '', orangeMoney: '' });

  useEffect(() => {
    getSetting('payment_wave_number', '').then((v) => setPaymentNumbers((p) => ({ ...p, wave: v })));
    getSetting('payment_orange_money_number', '').then((v) => setPaymentNumbers((p) => ({ ...p, orangeMoney: v })));
  }, []);
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const discount = promoResult?.valid ? promoResult.discountAmount : 0;
  const totalToPayNow = subtotal - discount;

  async function handleApplyPromo() {
    if (!promoCode || !form.customerPhone) {
      setError('Renseigne ton numéro de téléphone avant d\'appliquer un code');
      return;
    }
    const result = await validatePromoCode(promoCode, form.customerPhone, subtotal);
    setPromoResult(result);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const order = await createOrder({
        items: items.map((i) => ({ productVariantId: i.productVariantId, quantity: i.quantity })),
        ...form,
        promoCode: promoResult?.valid ? promoCode : undefined,
        userId: user?.userId,
      });
      clear();
      navigate(`/commande/${order.order_number}/confirmation`, { state: { paymentMethod: form.paymentMethod } });
    } catch (err) {
      setError(err.message || 'Une erreur est survenue, réessaie.');
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <p className="text-lg mb-2">Votre panier est vide</p>
        <p className="text-sm text-gray-500 mb-5">Découvrez nos nouveautés</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-10 px-4 py-8 max-w-6xl mx-auto">
      <div>
        <h2 className="text-lg font-medium mb-4">Votre panier</h2>
        <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 mb-6">
          {items.map((item) => (
            <div key={item.productVariantId} className="flex gap-3 p-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.productName}</p>
                <p className="text-xs text-gray-500 mt-0.5 mb-2.5 flex items-center gap-1.5">
                  Taille {item.size}
                  {item.color && (
                    <span className="flex items-center gap-1.5">
                      <span className="text-gray-300">·</span>
                      <span className="w-2.5 h-2.5 rounded-full inline-block ring-1 ring-gray-200" style={{ backgroundColor: item.color }} />
                    </span>
                  )}
                </p>
                <div className="inline-flex items-center gap-3 bg-gray-50 rounded-lg px-1 py-1">
                  <button type="button" onClick={() => updateQuantity(item.productVariantId, item.quantity - 1)}
                    className="w-6 h-6 rounded-md bg-white shadow-sm flex items-center justify-center text-sm">−</button>
                  <span className="text-xs w-4 text-center font-medium">{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.productVariantId, item.quantity + 1)}
                    className="w-6 h-6 rounded-md bg-white shadow-sm flex items-center justify-center text-sm">+</button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium">{(item.unitPrice * item.quantity).toLocaleString('fr-FR')} FCFA</p>
                <button type="button" onClick={() => removeItem(item.productVariantId)} className="text-xs text-gray-400 mt-2 hover:text-red-500">Retirer</button>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-medium mb-3">Où livrer votre commande</h3>
        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
          <input required placeholder="Nom complet" value={form.customerFullName} onChange={(e) => setForm({ ...form, customerFullName: e.target.value })} />
          <input required placeholder="Téléphone" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
          <input required placeholder="Ville" value={form.deliveryCity} onChange={(e) => setForm({ ...form, deliveryCity: e.target.value })} />
          <input required placeholder="Quartier / zone" value={form.deliveryZone} onChange={(e) => setForm({ ...form, deliveryZone: e.target.value })} />
        </div>
        <input placeholder="Détails (repère, étage...)" className="w-full mb-3" value={form.deliveryDetails} onChange={(e) => setForm({ ...form, deliveryDetails: e.target.value })} />

        <div className="bg-gray-50 rounded-lg p-3.5 text-xs text-gray-500 flex gap-2.5">
          <FiTruck size={15} className="text-terracotta-500 shrink-0 mt-0.5" />
          <span>Le montant de la livraison dépend de votre zone et vous sera confirmé après la commande. Vous pourrez annuler sans frais si le tarif ne vous convient pas.</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Moyen de paiement</h3>
        <div className="flex flex-col gap-2 mb-5">
          {[
            { value: 'WAVE', label: 'Wave', dot: '#4FA9E8' },
            { value: 'ORANGE_MONEY', label: 'Orange Money', dot: '#FF7900' },
            { value: 'CASH_ON_DELIVERY', label: 'Paiement à la livraison', dot: '#6B7280' },
          ].map(({ value, label, dot }) => {
            const isSelected = form.paymentMethod === value;
            return (
              <label key={value}
                className={`relative flex items-center gap-3 border rounded-xl p-3.5 cursor-pointer transition-colors overflow-hidden ${isSelected ? 'border-charcoal bg-charcoal/[0.03]' : 'border-gray-200 hover:border-gray-300'}`}>
                {isSelected && <span className="absolute left-0 top-0 bottom-0 w-1 bg-charcoal" />}
                <input type="radio" name="paymentMethod" checked={isSelected} onChange={() => setForm({ ...form, paymentMethod: value })} className="sr-only" />
                <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${dot}1A` }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dot }} />
                </span>
                <span className="text-sm font-medium">{label}</span>
                <span className={`ml-auto w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-charcoal' : 'border-gray-300'}`}>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-charcoal" />}
                </span>
              </label>
            );
          })}
        </div>

        {form.paymentMethod === 'WAVE' && (
          <div className="bg-terracotta-50 text-terracotta-800 text-xs rounded-lg p-3 mb-4">
            {paymentNumbers.wave ? (
              <>📲 Envoyez le montant sur Wave au <strong>{paymentNumbers.wave}</strong>, puis gardez la capture d'écran — on vous la demandera pour confirmer.</>
            ) : (
              <>📲 Le numéro Wave vous sera communiqué par notre équipe juste après votre commande.</>
            )}
          </div>
        )}
        {form.paymentMethod === 'ORANGE_MONEY' && (
          <div className="bg-terracotta-50 text-terracotta-800 text-xs rounded-lg p-3 mb-4">
            {paymentNumbers.orangeMoney ? (
              <>📲 Envoyez le montant sur Orange Money au <strong>{paymentNumbers.orangeMoney}</strong>, puis gardez la capture d'écran — on vous la demandera pour confirmer.</>
            ) : (
              <>📲 Le numéro Orange Money vous sera communiqué par notre équipe juste après votre commande.</>
            )}
          </div>
        )}

        <p className="text-xs text-gray-500 mb-2">Code promo (facultatif)</p>
        <div className="flex gap-2 mb-4">
          <input placeholder="Ex: SALIOU10" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="flex-1" />
          <button type="button" onClick={handleApplyPromo} className="border border-gray-300 px-4 text-sm rounded-lg hover:border-gray-400">Appliquer</button>
        </div>
        {promoResult && (
          <p className={`text-xs mb-4 flex items-center gap-1.5 ${promoResult.valid ? 'text-green-600' : 'text-red-600'}`}>
            {promoResult.valid ? <FiCheck size={13} /> : <FiAlertCircle size={13} />}
            {promoResult.message}
          </p>
        )}

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Sous-total produits</span>
            <span>{subtotal.toLocaleString('fr-FR')} FCFA</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm mb-2 text-green-600">
              <span>Réduction</span><span>-{discount.toLocaleString('fr-FR')} FCFA</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-gray-400 mb-3">
            <span>Livraison</span><span>Confirmée après commande</span>
          </div>
          <div className="flex justify-between text-base font-medium border-t border-gray-200 pt-3 mb-4">
            <span>À payer maintenant</span><span>{totalToPayNow.toLocaleString('fr-FR')} FCFA</span>
          </div>
          {error && (
            <div className="bg-red-50 text-red-700 text-xs rounded-lg p-3 mb-3 flex items-start gap-2">
              <FiAlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <button type="submit" disabled={submitting} className="w-full bg-charcoal text-white py-3.5 text-sm rounded-lg disabled:opacity-60">
            {submitting ? 'Traitement...' : 'Valider ma commande'}
          </button>
        </div>
      </div>
    </form>
  );
}
