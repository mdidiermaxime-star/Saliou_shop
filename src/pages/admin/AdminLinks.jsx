import { useEffect, useState } from 'react';
import { createLink, deleteLink, getLinks } from '../../api/siteContent.js';

const SECTIONS = [
  { value: 'FOOTER_BOUTIQUE', label: 'Colonne "Boutique"' },
  { value: 'FOOTER_AIDE', label: 'Colonne "Aide"' },
  { value: 'FOOTER_PAIEMENT', label: 'Colonne "Paiement"' },
];

export default function AdminLinks() {
  const [section, setSection] = useState('FOOTER_BOUTIQUE');
  const [links, setLinks] = useState([]);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');

  function refresh() { getLinks(section).then(setLinks); }
  useEffect(refresh, [section]);

  async function handleCreate(e) {
    e.preventDefault();
    await createLink({ section, label, url, position: links.length });
    setLabel(''); setUrl('');
    refresh();
  }

  async function handleDelete(id) {
    await deleteLink(id);
    refresh();
  }

  return (
    <div>
      <h1 className="text-xl mb-1">Liens du footer</h1>
      <p className="text-xs text-gray-500 mb-5">Ce qui s'affiche en bas du site, dans chaque colonne — modifiable ici sans toucher au code</p>

      <div className="flex gap-2 mb-5">
        {SECTIONS.map((s) => (
          <button key={s.value} onClick={() => setSection(s.value)} className={`text-sm px-3 py-1.5 rounded-full ${section === s.value ? 'bg-charcoal text-white' : 'bg-gray-100 text-gray-600'}`}>
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleCreate} className="bg-gray-50 rounded-xl p-4 mb-6 flex gap-3 items-end max-w-lg">
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1.5">Texte affiché</p>
          <input required placeholder="ex: Suivi de commande" value={label} onChange={(e) => setLabel(e.target.value)} className="w-full" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1.5">Lien (URL)</p>
          <input required placeholder="ex: /faq ou https://..." value={url} onChange={(e) => setUrl(e.target.value)} className="w-full" />
        </div>
        <button type="submit" className="bg-charcoal text-white px-4 py-2 text-sm">Ajouter</button>
      </form>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-3 px-4 py-2.5 bg-gray-50 text-xs text-gray-500 font-medium">
          <span>Texte</span><span>Lien</span><span></span>
        </div>
        {links.map((l) => (
          <div key={l.id} className="grid grid-cols-3 px-4 py-3 items-center border-t border-gray-100 text-sm">
            <span>{l.label}</span>
            <span className="text-gray-500 truncate">{l.url}</span>
            <button onClick={() => handleDelete(l.id)} className="text-xs text-red-600 text-right">Supprimer</button>
          </div>
        ))}
        {links.length === 0 && <p className="p-4 text-sm text-gray-400">Aucun lien dans cette colonne pour le moment.</p>}
      </div>
    </div>
  );
}
