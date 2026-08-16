import { useEffect, useState } from 'react';
import {
  createProduct, listProductsAdmin, setProductActive, updateVariantStock,
  updateProduct, reactivateVariant,
} from '../../api/products.js';
import { listCategoriesAdmin } from '../../api/categories.js';
import ColorPicker from '../../components/admin/ColorPicker.jsx';
import ImageUploader from '../../components/admin/ImageUploader.jsx';

const EMPTY_VARIANT = { size: '', color: '#1A1A1A', sku: '', stockQuantity: '' };
const EMPTY_FORM = {
  name: '', categoryId: '', productType: 'VETEMENT', basePrice: '', compareAtPrice: '',
  description: '', imageUrls: [], variants: [{ ...EMPTY_VARIANT }],
};
const GENERATOR_COLORS = [
  { name: 'Noir', hex: '#1A1A1A' }, { name: 'Blanc', hex: '#FFFFFF' },
  { name: 'Gris', hex: '#9CA3AF' }, { name: 'Bleu marine', hex: '#1E3A5F' },
  { name: 'Bleu ciel', hex: '#85B7EB' }, { name: 'Rouge', hex: '#C0392B' },
  { name: 'Vert', hex: '#3E7C4A' }, { name: 'Beige', hex: '#D8C3A5' },
  { name: 'Marron', hex: '#6B4226' }, { name: 'Rose', hex: '#E8A0BF' },
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = creation, sinon id du produit modifie
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // --- Generateur de variantes (tailles x couleurs) ---
  const [genSizes, setGenSizes] = useState('');
  const [genColors, setGenColors] = useState([]);
  const [genSkuPrefix, setGenSkuPrefix] = useState('');

  function refresh() { listProductsAdmin().then(setProducts); }
  useEffect(() => { refresh(); listCategoriesAdmin().then(setCategories); }, []);

  function resetForm() {
    setForm({ ...EMPTY_FORM, variants: [{ ...EMPTY_VARIANT }] });
    setEditingId(null);
    setError(null);
    setGenSizes(''); setGenColors([]); setGenSkuPrefix('');
  }

  function openCreateForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      categoryId: String(product.category_id),
      productType: product.product_type,
      basePrice: String(product.basePrice),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '',
      description: product.description || '',
      imageUrls: product.imageUrls || [],
      variants: (product.variants || []).map((v) => ({
        id: v.id, size: v.size, color: v.color || '#1A1A1A', sku: v.sku,
        stockQuantity: String(v.stockQuantity), isActive: v.is_active !== false,
      })),
    });
    setError(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateVariantField(index, field, value) {
    const variants = [...form.variants];
    variants[index] = { ...variants[index], [field]: value };
    setForm({ ...form, variants });
  }
  function addVariant() { setForm({ ...form, variants: [...form.variants, { ...EMPTY_VARIANT }] }); }
  function removeVariant(index) { setForm({ ...form, variants: form.variants.filter((_, i) => i !== index) }); }

  // Cree en un clic toutes les combinaisons taille x couleur choisies.
  // Pratique quand une meme taille existe dans plusieurs couleurs (le cas
  // le plus penible a saisir variante par variante).
  function toggleGenColor(hex) {
    setGenColors((prev) => (prev.includes(hex) ? prev.filter((c) => c !== hex) : [...prev, hex]));
  }
  function handleGenerateVariants() {
    const sizes = genSizes.split(',').map((s) => s.trim()).filter(Boolean);
    if (sizes.length === 0 || genColors.length === 0) {
      setError('Renseigne au moins une taille et une couleur pour générer les variantes.');
      return;
    }
    const generated = [];
    for (const size of sizes) {
      for (const hex of genColors) {
        const colorName = GENERATOR_COLORS.find((c) => c.hex === hex)?.name || hex;
        generated.push({
          size, color: hex,
          sku: `${genSkuPrefix ? genSkuPrefix + '-' : ''}${size}-${colorName}`.toUpperCase().replace(/\s+/g, ''),
          stockQuantity: '',
        });
      }
    }
    // Remplace les lignes vides du formulaire par les combinaisons generees,
    // et garde celles deja remplies (utile en mode edition).
    const existingFilled = form.variants.filter((v) => v.size || v.sku);
    setForm({ ...form, variants: [...existingFilled, ...generated] });
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        ...form,
        categoryId: Number(form.categoryId),
        basePrice: Number(form.basePrice),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
        variants: form.variants.map((v) => ({ ...v, stockQuantity: Number(v.stockQuantity) || 0 })),
      };
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      setShowForm(false);
      resetForm();
      refresh();
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(product) { await setProductActive(product.id, !product.is_active); refresh(); }
  async function handleStockChange(variantId, value) { await updateVariantStock(variantId, Number(value)); refresh(); }
  async function handleReactivateVariant(variantId) { await reactivateVariant(variantId); refresh(); }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl">Produits</h1>
        {!showForm && (
          <button onClick={openCreateForm} className="bg-charcoal text-white px-4 py-2 text-sm">+ Ajouter un produit</button>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-5 max-w-2xl">
        Crée un produit avec ses tailles, couleurs et photos. Le stock de chaque taille se modifie directement dans
        le tableau ci-dessous en cliquant sur le chiffre. Clique sur « Modifier » pour changer nom, prix, photos ou
        variantes d'un produit déjà enregistré. « Désactiver » retire un produit de la boutique sans le
        supprimer (utile en rupture prolongée), tu peux le réactiver à tout moment.
      </p>

      {categories.length === 0 && (
        <div className="bg-terracotta-50 text-terracotta-800 text-sm rounded-lg p-3 mb-5">
          Aucune catégorie n'existe encore — crée-en au moins une dans <a href="/admin/categories" className="underline font-medium">Catégories</a> avant de pouvoir ajouter un produit.
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 mb-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{editingId ? `Modifier « ${form.name} »` : 'Nouveau produit'}</p>
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="text-xs text-gray-500">Annuler</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Nom du produit" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Catégorie</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.parentName ? `${c.parentName} › ${c.name}` : c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <select value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })}>
              <option value="VETEMENT">Vêtement</option><option value="CHAUSSURE">Chaussure</option><option value="PARFUM">Parfum</option>
            </select>
            <input required placeholder="Prix (FCFA)" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
            <input placeholder="Prix barré (optionnel)" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} />
          </div>
          <textarea placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <ImageUploader imageUrls={form.imageUrls} onChange={(imageUrls) => setForm({ ...form, imageUrls })} />

          <div className="bg-terracotta-50/60 border border-terracotta-100 rounded-lg p-3 mt-1">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Générateur rapide — crée toutes les combinaisons taille × couleur d'un coup
            </p>
            <input placeholder="Tailles séparées par une virgule (ex: 38, 39, 40, 41)" value={genSizes}
              onChange={(e) => setGenSizes(e.target.value)} className="w-full mb-2" />
            <div className="flex flex-wrap gap-1.5 mb-2">
              {GENERATOR_COLORS.map((c) => (
                <button key={c.hex} type="button" title={c.name} onClick={() => toggleGenColor(c.hex)}
                  className={`w-6 h-6 rounded-full border-2 ${genColors.includes(c.hex) ? 'border-charcoal' : 'border-transparent'}`}
                  style={{ backgroundColor: c.hex, boxShadow: c.hex === '#FFFFFF' ? 'inset 0 0 0 1px #E5E7EB' : undefined }} />
              ))}
            </div>
            <div className="flex gap-2">
              <input placeholder="Préfixe SKU (optionnel, ex: CROC)" value={genSkuPrefix} onChange={(e) => setGenSkuPrefix(e.target.value)} className="flex-1" />
              <button type="button" onClick={handleGenerateVariants} className="bg-charcoal text-white px-3 text-xs whitespace-nowrap">
                Générer les variantes
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">
              Ex : 3 tailles × 2 couleurs = 6 variantes créées automatiquement, il ne reste qu'à indiquer le stock de chacune.
            </p>
          </div>

          <p className="text-xs font-medium text-gray-500 mt-1">Tailles / couleurs / stock ({form.variants.length})</p>
          {form.variants.map((v, i) => (
            <div key={v.id ?? `new-${i}`} className={`grid grid-cols-[1fr_1.3fr_1fr_0.8fr_auto] gap-2 items-start bg-white rounded-lg p-2.5 border ${v.isActive === false ? 'border-gray-200 opacity-50' : 'border-gray-200'}`}>
              <input required placeholder="Taille (ex: M)" value={v.size} onChange={(e) => updateVariantField(i, 'size', e.target.value)} />
              <ColorPicker value={v.color} onChange={(hex) => updateVariantField(i, 'color', hex)} />
              <input required placeholder="SKU" value={v.sku} onChange={(e) => updateVariantField(i, 'sku', e.target.value)} />
              <input required placeholder="Stock" value={v.stockQuantity} onChange={(e) => updateVariantField(i, 'stockQuantity', e.target.value)} />
              {v.isActive === false ? (
                <span className="text-[10px] text-gray-400 self-center">Désactivée</span>
              ) : (
                form.variants.length > 1 && <button type="button" onClick={() => removeVariant(i)} className="text-xs text-red-600 self-center">Retirer</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addVariant} className="text-xs text-terracotta-600 text-left">+ Ajouter une variante manuellement</button>
          {editingId && (
            <p className="text-[11px] text-gray-400">
              Retirer une variante déjà vendue ne la supprime pas (l'historique des commandes reste intact) — elle est simplement masquée de la boutique.
            </p>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="bg-charcoal text-white py-2.5 text-sm mt-2 disabled:opacity-60">
            {saving ? 'Enregistrement...' : editingId ? 'Enregistrer les modifications' : 'Créer le produit'}
          </button>
        </form>
      )}

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-6 px-4 py-2.5 bg-gray-50 text-xs text-gray-500 font-medium">
          <span>Produit</span><span>Prix</span><span>Stock par taille</span><span>Statut</span><span></span><span></span>
        </div>
        {products.map((p) => (
          <div key={p.id} className="grid grid-cols-6 px-4 py-3 items-center border-t border-gray-100 text-sm">
            <span className="flex items-center gap-2">
              {p.imageUrls?.[0] && <img src={p.imageUrls[0]} alt="" className="w-8 h-8 rounded object-cover" />}
              {p.name}
            </span>
            <span>{p.basePrice.toLocaleString('fr-FR')} FCFA</span>
            <div className="flex flex-wrap gap-1.5">
              {p.variants?.filter((v) => v.is_active !== false).map((v) => (
                <span key={v.id} className="text-xs flex items-center gap-1 bg-gray-50 rounded px-1.5 py-0.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: v.color }} />
                  {v.size}
                  <input type="number" defaultValue={v.stockQuantity} onBlur={(e) => handleStockChange(v.id, e.target.value)} className="w-10 text-xs px-1 py-0" />
                </span>
              ))}
              {p.variants?.some((v) => v.is_active === false) && (
                <span className="text-[10px] text-gray-400">
                  + {p.variants.filter((v) => v.is_active === false).length} masquée(s) —{' '}
                  {p.variants.filter((v) => v.is_active === false).map((v) => (
                    <button key={v.id} type="button" onClick={() => handleReactivateVariant(v.id)} className="underline text-terracotta-600 mr-1">
                      réactiver {v.size}
                    </button>
                  ))}
                </span>
              )}
            </div>
            <span className={`text-xs px-2 py-1 rounded-full w-fit ${p.is_active !== false ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
              {p.is_active !== false ? 'Actif' : 'Inactif'}
            </span>
            <button onClick={() => openEditForm(p)} className="text-xs text-charcoal font-medium text-right">Modifier</button>
            <button onClick={() => handleToggleActive(p)} className="text-xs text-terracotta-600 text-right">
              {p.is_active !== false ? 'Désactiver' : 'Activer'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
