import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { trackOrder } from '../api/orders.js';

const STEPS = ['RECEIVED', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'];
const STEP_LABELS = { RECEIVED: 'Reçue', PAID: 'Payée', PREPARING: 'Préparation', SHIPPED: 'En route', DELIVERED: 'Livrée' };

export default function OrderTracking() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => { trackOrder(orderNumber).then(setOrder); }, [orderNumber]);

  if (!order) return <p className="px-4 py-6 text-sm text-gray-400">Chargement...</p>;

  const currentStepIndex = STEPS.indexOf(order.status);

  return (
    <div className="px-4 py-6 max-w-xl">
      <h1 className="text-lg mb-1">Commande #{order.order_number}</h1>
      <p className="text-xs text-gray-500 mb-6">
        Passée le {new Date(order.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </p>

      <div className="flex justify-between relative mb-6">
        <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-gray-200" />
        {STEPS.map((step, i) => (
          <div key={step} className="relative text-center w-1/5">
            <div className={`w-7 h-7 rounded-full mx-auto mb-1.5 flex items-center justify-center text-xs ${i <= currentStepIndex ? 'bg-charcoal text-white' : 'bg-white border border-gray-300 text-gray-400'}`}>
              {i <= currentStepIndex ? '✓' : ''}
            </div>
            <p className="text-[10px] text-gray-500">{STEP_LABELS[step]}</p>
          </div>
        ))}
      </div>

      {!order.delivery_confirmed && order.status !== 'CANCELLED' && (
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 mb-6">
          Notre équipe vous contacte prochainement pour confirmer le tarif et le créneau de livraison.
        </div>
      )}

      <h3 className="text-sm font-medium mb-2">Articles</h3>
      {order.order_items.map((item, i) => (
        <div key={i} className="flex justify-between text-sm py-2 border-b border-gray-100">
          <span>{item.product_name} · {item.size} × {item.quantity}</span>
          <span>{(item.unit_price * item.quantity).toLocaleString('fr-FR')} FCFA</span>
        </div>
      ))}
    </div>
  );
}
