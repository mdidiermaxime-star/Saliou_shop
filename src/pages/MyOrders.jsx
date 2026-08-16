import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyOrders } from '../api/orders.js';

const STATUS_STYLES = {
  RECEIVED: 'bg-gray-100 text-gray-600', PAID: 'bg-blue-50 text-blue-600',
  PREPARING: 'bg-amber-50 text-amber-700', SHIPPED: 'bg-purple-50 text-purple-600',
  DELIVERED: 'bg-green-50 text-green-600', CANCELLED: 'bg-red-50 text-red-600',
};
const STATUS_LABELS = {
  RECEIVED: 'Reçue', PAID: 'Payée', PREPARING: 'En préparation', SHIPPED: 'En livraison', DELIVERED: 'Livrée', CANCELLED: 'Annulée',
};

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => { if (user?.userId) getMyOrders(user.userId).then(setOrders); }, [user]);

  return (
    <div className="px-4 py-6 max-w-2xl">
      <h1 className="text-xl mb-1">Mes commandes</h1>
      <p className="text-xs text-gray-500 mb-5">{orders.length} commandes</p>
      {orders.map((order) => (
        <div key={order.order_number} className="border border-gray-200 rounded-xl p-4 mb-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium">Commande #{order.order_number}</p>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status]}`}>{STATUS_LABELS[order.status]}</span>
          </div>
          <p className="text-xs text-gray-400">
            {new Date(order.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      ))}
      {orders.length === 0 && <p className="text-sm text-gray-400">Aucune commande pour le moment.</p>}
    </div>
  );
}
