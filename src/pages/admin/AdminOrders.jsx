import { useEffect, useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { confirmOrderDelivery, deleteOrder, listOrdersAdmin, updateOrderStatus } from '../../api/orders.js';

const STATUSES = ['RECEIVED', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const STATUS_LABELS = { RECEIVED: 'Reçue', PAID: 'Payée', PREPARING: 'En préparation', SHIPPED: 'En livraison', DELIVERED: 'Livrée', CANCELLED: 'Annulée' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [deliveryDrafts, setDeliveryDrafts] = useState({});
  const [confirmingDelete, setConfirmingDelete] = useState(null);

  function refresh() { listOrdersAdmin(filter || undefined).then(setOrders); }
  useEffect(refresh, [filter]);

  async function handleStatusChange(order, status) { await updateOrderStatus(order.id, status); refresh(); }
  async function handleConfirmDelivery(order) {
    const fee = Number(deliveryDrafts[order.id]);
    if (!fee && fee !== 0) return;
    await confirmOrderDelivery(order.id, fee);
    refresh();
  }

  // Deux clics necessaires (bouton -> confirmation) pour eviter de supprimer
  // une vraie commande client par erreur en un seul clic maladroit.
  async function handleDelete(orderId) {
    if (confirmingDelete !== orderId) {
      setConfirmingDelete(orderId);
      return;
    }
    await deleteOrder(orderId);
    setConfirmingDelete(null);
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl">Commandes</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="text-sm">
          <option value="">Tous les statuts</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>
      <p className="text-xs text-gray-500 mb-5 max-w-2xl">
        Le tarif de livraison n'est jamais inclus dans le paiement du client — une fois que tu connais la zone,
        tape le montant et clique « Confirmer ». Change le statut au fil de la préparation (Reçue → Payée →
        En préparation → En livraison → Livrée). La corbeille supprime définitivement une commande (double clic pour confirmer).
      </p>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 px-4 py-2.5 bg-gray-50 text-xs text-gray-500 font-medium">
          <span>Commande</span><span>Date et heure</span><span>Total</span><span>Statut</span><span>Livraison</span><span></span><span></span>
        </div>
        {orders.map((order) => (
          <div key={order.id} className="grid grid-cols-7 px-4 py-3 items-center border-t border-gray-100 text-sm">
            <span className="font-medium">#{order.order_number}</span>
            <span className="text-xs text-gray-500">
              {new Date(order.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span>{(order.subtotal - order.discount_amount).toLocaleString('fr-FR')} FCFA</span>
            <select value={order.status} onChange={(e) => handleStatusChange(order, e.target.value)} className="text-xs">
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            {order.delivery_confirmed ? (
              <span className="text-xs text-green-600">{Number(order.delivery_fee).toLocaleString('fr-FR')} FCFA confirmé</span>
            ) : (
              <div className="flex gap-1">
                <input placeholder="Tarif FCFA" className="text-xs w-20 px-2 py-1" value={deliveryDrafts[order.id] || ''}
                  onChange={(e) => setDeliveryDrafts({ ...deliveryDrafts, [order.id]: e.target.value })} />
                <button onClick={() => handleConfirmDelivery(order)} className="text-xs border border-gray-300 px-2 py-1">Confirmer</button>
              </div>
            )}
            <a href={`/commande/${order.order_number}`} target="_blank" rel="noreferrer" className="text-xs text-terracotta-600 text-right">Détails</a>
            <div className="text-right">
              {confirmingDelete === order.id ? (
                <button onClick={() => handleDelete(order.id)} className="text-xs text-white bg-red-600 px-2 py-1 rounded">
                  Confirmer ?
                </button>
              ) : (
                <button onClick={() => handleDelete(order.id)} aria-label="Supprimer" className="text-gray-400 hover:text-red-600">
                  <FiTrash2 size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="p-4 text-sm text-gray-400">Aucune commande.</p>}
      </div>
    </div>
  );
}
