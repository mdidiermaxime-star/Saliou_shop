import { useEffect, useState } from 'react';
import { listOrdersAdmin } from '../../api/orders.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pendingDelivery: 0, preparing: 0 });

  useEffect(() => {
    listOrdersAdmin().then((orders) => {
      setStats({
        total: orders.length,
        pendingDelivery: orders.filter((o) => !o.delivery_confirmed && o.status !== 'CANCELLED').length,
        preparing: orders.filter((o) => o.status === 'PREPARING').length,
      });
    });
  }, []);

  return (
    <div>
      <h1 className="text-xl mb-1">Tableau de bord</h1>
      <p className="text-xs text-gray-500 mb-6 max-w-2xl">
        Vue d'ensemble rapide en arrivant. Si des commandes attendent une confirmation de tarif de livraison,
        un rappel apparaît ci-dessous — c'est la première chose à traiter chaque jour.
      </p>
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1.5">Commandes totales</p>
          <p className="text-2xl font-medium">{stats.total}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1.5">Livraison à confirmer</p>
          <p className="text-2xl font-medium text-terracotta-600">{stats.pendingDelivery}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1.5">En préparation</p>
          <p className="text-2xl font-medium">{stats.preparing}</p>
        </div>
      </div>
      {stats.pendingDelivery > 0 && (
        <div className="bg-terracotta-50 border border-terracotta-100 rounded-xl p-4 text-sm text-terracotta-800">
          {stats.pendingDelivery} commande(s) attendent qu'on leur confirme un tarif de livraison —
          <a href="/admin/commandes" className="underline ml-1">voir les commandes</a>
        </div>
      )}
    </div>
  );
}
