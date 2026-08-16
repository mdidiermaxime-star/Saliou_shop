import { useEffect, useState } from 'react';
import { FiArrowUp, FiArrowDown, FiImage } from 'react-icons/fi';
import { createCategory, deleteCategory, listCategoriesAdmin, swapCategoryPositions, updateCategoryVisual } from '../../api/categories.js';
import ColorPicker from '../../components/admin/ColorPicker.jsx';
import ImageUploader from '../../components/admin/ImageUploader.jsx';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [error, setError] = useState(null);
  const [editingVisualId, setEditingVisualId] = useState(null);
  const [visualDraft, setVisualDraft] = useState({ imageUrl: null, bgColor: '#F3F4F6' });

  function refresh() { listCategoriesAdmin().then(setCategories); }
  useEffect(refresh, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    try {
      // Nouvelle categorie placee en dernier de son groupe par defaut
      const siblings = categories.filter((c) => (c.parentId || null) === (parentId ? Number(parentId) : null));
      const nextPosition = siblings.length ? Math.max(...siblings.map((s) => s.position)) + 1 : 0;
      await createCategory({ name, parentId: parentId ? Number(parentId) : null, position: nextPosition });
      setName(''); setParentId(''); setShowForm(false);
      refresh();
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    }
  }

  async function handleDelete(id) {
    setError(null);
    try { await deleteCategory(id); refresh(); }
    catch (err) { setError(err.message || 'Une erreur est survenue'); }
  }

  async function handleMove(category, direction, siblings) {
    const index = siblings.findIndex((s) => s.id === category.id);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= siblings.length) return;
    await swapCategoryPositions(siblings[index], siblings[targetIndex]);
    refresh();
  }

  function openVisualEditor(category) {
    setEditingVisualId(category.id);
    setVisualDraft({ imageUrl: category.imageUrl, bgColor: category.bgColor || '#F3F4F6' });
  }

  async function handleSaveVisual(id) {
    await updateCategoryVisual(id, visualDraft);
    setEditingVisualId(null);
    refresh();
  }

  const topLevelCategories = categories.filter((c) => !c.parentId);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl">Catégories</h1>
        <button onClick={() => setShowForm((v) => !v)} className="bg-charcoal text-white px-4 py-2 text-sm">+ Ajouter une catégorie</button>
      </div>
      <p className="text-xs text-gray-500 mb-5 max-w-2xl">
        Une catégorie « principale » apparaît dans le menu du haut du site, et sous forme de carte sur la page
        d'accueil (section « Univers »). Une catégorie créée avec un « parent »
        devient une sous-catégorie visible au survol de sa catégorie principale. Utilise les flèches ↑↓ pour
        décider de l'ordre d'affichage. Clique sur l'icône image d'une catégorie principale pour lui ajouter
        une photo ou une couleur de fond sur la page d'accueil.
      </p>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-50 rounded-xl p-4 mb-6 flex flex-col gap-3 max-w-md">
          <input required placeholder="Nom (ex: Chemises)" value={name} onChange={(e) => setName(e.target.value)} />
          <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">Catégorie principale (visible dans le menu du haut)</option>
            {topLevelCategories.map((c) => <option key={c.id} value={c.id}>Sous-catégorie de « {c.name} »</option>)}
          </select>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" className="bg-charcoal text-white py-2.5 text-sm">Créer la catégorie</button>
        </form>
      )}
      {error && !showForm && <p className="text-xs text-red-600 mb-3">{error}</p>}

      <div className="flex flex-col gap-3">
        {topLevelCategories.length === 0 && (
          <p className="text-sm text-gray-400 border border-gray-200 rounded-xl p-4">Aucune catégorie pour le moment.</p>
        )}

        {topLevelCategories.map((parent) => {
          const children = categories.filter((c) => c.parentId === parent.id);
          return (
            <div key={parent.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                <span className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-md bg-cover bg-center border border-gray-200 shrink-0"
                    style={{ backgroundColor: parent.bgColor, backgroundImage: parent.imageUrl ? `url(${parent.imageUrl})` : undefined }} />
                  <span className="font-medium text-sm">{parent.name}</span>
                </span>
                <div className="flex items-center gap-3">
                  <button onClick={() => openVisualEditor(parent)} title="Image / couleur d'accueil" className="text-gray-400 hover:text-charcoal">
                    <FiImage size={15} />
                  </button>
                  <div className="flex flex-col">
                    <button onClick={() => handleMove(parent, 'up', topLevelCategories)} className="text-gray-400 hover:text-charcoal"><FiArrowUp size={13} /></button>
                    <button onClick={() => handleMove(parent, 'down', topLevelCategories)} className="text-gray-400 hover:text-charcoal"><FiArrowDown size={13} /></button>
                  </div>
                  <button onClick={() => handleDelete(parent.id)} className="text-xs text-red-600">Supprimer</button>
                </div>
              </div>

              {editingVisualId === parent.id && (
                <div className="px-4 py-3 border-t border-gray-100 bg-white flex flex-col gap-3">
                  <p className="text-xs font-medium text-gray-600">Apparence de la carte « {parent.name} » sur la page d'accueil</p>
                  <ImageUploader imageUrls={visualDraft.imageUrl ? [visualDraft.imageUrl] : []}
                    onChange={(urls) => setVisualDraft((d) => ({ ...d, imageUrl: urls[urls.length - 1] || null }))} />
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">Couleur de fond (utilisée si aucune image, ou visible sous l'image)</p>
                    <ColorPicker value={visualDraft.bgColor} onChange={(hex) => setVisualDraft((d) => ({ ...d, bgColor: hex }))} />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleSaveVisual(parent.id)} className="bg-charcoal text-white px-4 py-2 text-xs">Enregistrer</button>
                    <button type="button" onClick={() => setEditingVisualId(null)} className="text-xs text-gray-500">Annuler</button>
                  </div>
                </div>
              )}

              {children.map((child) => (
                <div key={child.id} className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 pl-8 text-sm">
                  <span className="text-gray-600">↳ {child.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <button onClick={() => handleMove(child, 'up', children)} className="text-gray-400 hover:text-charcoal"><FiArrowUp size={13} /></button>
                      <button onClick={() => handleMove(child, 'down', children)} className="text-gray-400 hover:text-charcoal"><FiArrowDown size={13} /></button>
                    </div>
                    <button onClick={() => handleDelete(child.id)} className="text-xs text-red-600">Supprimer</button>
                  </div>
                </div>
              ))}
              {children.length === 0 && <p className="px-4 py-2.5 pl-8 text-xs text-gray-400 border-t border-gray-100">Aucune sous-catégorie</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
