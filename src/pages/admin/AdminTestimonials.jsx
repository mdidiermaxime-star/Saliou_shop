import { useEffect, useState } from 'react';
import { FiStar } from 'react-icons/fi';
import { createTestimonial, deleteTestimonial, listTestimonialsAdmin, setTestimonialActive } from '../../api/siteContent.js';
import ImageUploader from '../../components/admin/ImageUploader.jsx';

const EMPTY_FORM = { customerName: '', city: '', rating: 5, comment: '', imageUrl: null };

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [error, setError] = useState(null);

  function refresh() { listTestimonialsAdmin().then(setTestimonials); }
  useEffect(refresh, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const nextPosition = testimonials.length ? Math.max(...testimonials.map((t) => t.position)) + 1 : 0;
      await createTestimonial({ ...form, position: nextPosition });
      setForm({ ...EMPTY_FORM });
      setShowForm(false);
      refresh();
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    }
  }

  async function handleToggleActive(t) { await setTestimonialActive(t.id, !t.is_active); refresh(); }
  async function handleDelete(id) { await deleteTestimonial(id); refresh(); }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl">Avis clients</h1>
        <button onClick={() => setShowForm((v) => !v)} className="bg-charcoal text-white px-4 py-2 text-sm">+ Ajouter un avis</button>
      </div>
      <p className="text-xs text-gray-500 mb-5 max-w-2xl">
        Ajoute les avis que tes clients t'envoient sur WhatsApp ou en commentaire TikTok/Instagram — ils
        s'affichent sur la page d'accueil et aident à rassurer les nouveaux visiteurs.
      </p>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 mb-6 flex flex-col gap-3 max-w-xl">
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Nom du client" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            <input placeholder="Ville (optionnel)" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Note</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })} className="text-terracotta-500">
                  <FiStar size={20} fill={n <= form.rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>
          <textarea required rows={3} placeholder="Commentaire du client" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
          <ImageUploader imageUrls={form.imageUrl ? [form.imageUrl] : []}
            onChange={(urls) => setForm({ ...form, imageUrl: urls[urls.length - 1] || null })} />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" className="bg-charcoal text-white py-2.5 text-sm">Ajouter l'avis</button>
        </form>
      )}

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {testimonials.length === 0 && <p className="p-4 text-sm text-gray-400">Aucun avis pour le moment.</p>}
        {testimonials.map((t) => (
          <div key={t.id} className="flex items-start justify-between gap-3 px-4 py-3 border-t border-gray-100 first:border-t-0 text-sm">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-charcoal">{t.customer_name}</p>
                {t.city && <span className="text-xs text-gray-400">· {t.city}</span>}
                <span className="text-xs text-terracotta-600">{'★'.repeat(t.rating)}</span>
              </div>
              <p className="text-xs text-gray-500">{t.comment}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-xs px-2 py-1 rounded-full ${t.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                {t.is_active ? 'Visible' : 'Masqué'}
              </span>
              <button onClick={() => handleToggleActive(t)} className="text-xs text-terracotta-600">
                {t.is_active ? 'Masquer' : 'Afficher'}
              </button>
              <button onClick={() => handleDelete(t.id)} className="text-xs text-red-600">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
