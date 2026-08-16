import { useEffect, useState } from 'react';
import { createPromoCode, listPromoCodesAdmin, setPromoCodeActive } from '../../api/promoCodes.js';

export default function AdminPromoCodes() {
  const [codes, setCodes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '', discountType: 'PERCENTAGE', value: '', minOrderAmount: '', startDate: '', endDate: '', totalUsageLimit: '', perCustomerLimit: '1',
  });

  function refresh() { listPromoCodesAdmin().then(setCodes); }
  useEffect(refresh, []);

  async function handleCreate(e) {
    e.preventDefault();
    await createPromoCode({
      ...form, value: Number(form.value),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
      totalUsageLimit: form.totalUsageLimit ? Number(form.totalUsageLimit) : null,
      perCustomerLimit: Number(form.perCustomerLimit),
    });
    setShowForm(false);
    refresh();
  }

  async function handleToggle(id, active) { await setPromoCodeActive(id, !active); refresh(); }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl">Codes promo</h1>
        <button onClick={() => setShowForm((v) => !v)} className="bg-charcoal text-white px-4 py-2 text-sm">+ Créer un code</button>
      </div>
      <p className="text-xs text-gray-500 mb-5 max-w-2xl">
        « Limite totale » fixe le nombre de fois que le code peut être utilisé au total, « limite par client »
        empêche une même personne de le réutiliser plusieurs fois. Clique sur le badge « Actif » pour désactiver
        un code instantanément, sans le supprimer.
      </p>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-50 rounded-xl p-4 mb-5 grid grid-cols-2 gap-3">
          <input required placeholder="Code (ex: SALIOULANCEMENT)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
            <option value="PERCENTAGE">Pourcentage (%)</option><option value="FIXED_AMOUNT">Montant fixe (FCFA)</option>
          </select>
          <input required placeholder="Valeur" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
          <input placeholder="Commande minimum (FCFA)" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} />
          <input placeholder="Limite totale d'utilisation" value={form.totalUsageLimit} onChange={(e) => setForm({ ...form, totalUsageLimit: e.target.value })} />
          <input placeholder="Limite par client" value={form.perCustomerLimit} onChange={(e) => setForm({ ...form, perCustomerLimit: e.target.value })} />
          <input required type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <input required type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          <button type="submit" className="col-span-2 bg-charcoal text-white py-2.5 text-sm">Créer le code</button>
        </form>
      )}

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-5 px-4 py-2.5 bg-gray-50 text-xs text-gray-500 font-medium">
          <span>Code</span><span>Réduction</span><span>Utilisations</span><span>Validité</span><span>Statut</span>
        </div>
        {codes.map((c) => (
          <div key={c.id} className="grid grid-cols-5 px-4 py-3 items-center border-t border-gray-100 text-sm">
            <span className="font-medium">{c.code}</span>
            <span>{c.discount_type === 'PERCENTAGE' ? `-${c.value}%` : `-${c.value} FCFA`}</span>
            <span className="text-xs text-gray-500">{c.total_usage_limit ? `${c.total_usage_limit - (c.uses_remaining ?? 0)} / ${c.total_usage_limit}` : '—'}</span>
            <span className="text-xs text-gray-500">{c.start_date} → {c.end_date}</span>
            <button onClick={() => handleToggle(c.id, c.is_active)}>
              <span className={`text-xs px-2 py-1 rounded-full ${c.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                {c.is_active ? 'Actif' : 'Inactif'}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
