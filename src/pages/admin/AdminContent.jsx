import { useEffect, useState } from 'react';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { createBanner, deleteBanner, listBannersAdmin, setBannerActive, swapBannerPositions, updateBanner } from '../../api/siteContent.js';
import ImageUploader from '../../components/admin/ImageUploader.jsx';

const SECTIONS = [
  { value: 'HERO_SLIDE', label: 'Hero (accueil)' },
  { value: 'PROMO_BAR', label: 'Bandeau promo' },
  { value: 'ANNOUNCEMENT', label: 'Annonce' },
];
const EMPTY_FORM = { title: '', subtitle: '', ctaText: '', ctaLink: '', imageUrls: [] };

export default function AdminContent() {
  const [section, setSection] = useState('HERO_SLIDE');
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  function refresh() { listBannersAdmin(section).then(setBanners); }
  useEffect(refresh, [section]);

  function resetForm() { setForm({ ...EMPTY_FORM }); setEditingId(null); setError(null); }

  function startEdit(b) {
    setEditingId(b.id);
    setForm({ title: b.title, subtitle: b.subtitle || '', ctaText: b.ctaText || '', ctaLink: b.ctaLink || '', imageUrls: b.imageUrl ? [b.imageUrl] : [] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const payload = { ...form, imageUrl: form.imageUrls[form.imageUrls.length - 1] || null };
      if (editingId) {
        await updateBanner(editingId, payload);
      } else {
        await createBanner({ ...payload, section, position: banners.length });
      }
      resetForm();
      refresh();
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    }
  }

  async function handleToggleActive(b) { await setBannerActive(b.id, !b.isActive); refresh(); }
  async function handleDelete(b) {
    await deleteBanner(b.id);
    if (editingId === b.id) resetForm();
    refresh();
  }
  async function handleMove(b, direction) {
    const index = banners.findIndex((x) => x.id === b.id);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;
    await swapBannerPositions(banners[index], banners[targetIndex]);
    refresh();
  }

  return (
    <div>
      <h1 className="text-xl mb-1">Contenu du site</h1>
      <p className="text-xs text-gray-500 mb-5">Modifie le hero et les bandeaux sans toucher au code</p>

      <div className="flex gap-2 mb-5">
        {SECTIONS.map((s) => (
          <button key={s.value} onClick={() => { setSection(s.value); resetForm(); }} className={`text-sm px-3 py-1.5 rounded-full ${section === s.value ? 'bg-charcoal text-white' : 'bg-gray-100 text-gray-600'}`}>
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 mb-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{editingId ? 'Modifier' : 'Ajouter'} — {SECTIONS.find((s) => s.value === section)?.label}</p>
          {editingId && <button type="button" onClick={resetForm} className="text-xs text-gray-500">Annuler</button>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input placeholder="Sous-titre" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Texte du bouton" value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} />
          <input placeholder="Lien du bouton" value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} />
        </div>
        <ImageUploader imageUrls={form.imageUrls} onChange={(imageUrls) => setForm({ ...form, imageUrls })} />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button type="submit" className="bg-charcoal text-white py-2.5 text-sm">{editingId ? 'Enregistrer les modifications' : 'Ajouter'}</button>
      </form>

      <div className="flex flex-col gap-2">
        {banners.map((b, i) => (
          <div key={b.id} className={`border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-3 ${!b.isActive ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3 min-w-0">
              {b.imageUrl && <img src={b.imageUrl} alt="" className="w-10 h-10 rounded object-cover shrink-0" />}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{b.title}</p>
                <p className="text-xs text-gray-500 truncate">{b.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-xs px-2 py-1 rounded-full ${b.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                {b.isActive ? 'Actif' : 'Inactif'}
              </span>
              <div className="flex flex-col">
                <button onClick={() => handleMove(b, 'up')} disabled={i === 0} className="text-gray-400 hover:text-charcoal disabled:opacity-30"><FiArrowUp size={13} /></button>
                <button onClick={() => handleMove(b, 'down')} disabled={i === banners.length - 1} className="text-gray-400 hover:text-charcoal disabled:opacity-30"><FiArrowDown size={13} /></button>
              </div>
              <button onClick={() => startEdit(b)} className="text-xs text-charcoal font-medium">Modifier</button>
              <button onClick={() => handleToggleActive(b)} className="text-xs text-terracotta-600">{b.isActive ? 'Désactiver' : 'Activer'}</button>
              <button onClick={() => handleDelete(b)} className="text-xs text-red-600">Supprimer</button>
            </div>
          </div>
        ))}
        {banners.length === 0 && <p className="text-sm text-gray-400">Aucun contenu pour cette section.</p>}
      </div>
    </div>
  );
}
