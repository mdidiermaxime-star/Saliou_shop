import { useEffect, useState } from 'react';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { createFaq, deleteFaq, listFaqsAdmin, swapFaqPositions, updateFaq } from '../../api/siteContent.js';

export default function AdminFAQ() {
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState({ question: '', answer: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  function refresh() { listFaqsAdmin().then(setFaqs); }
  useEffect(refresh, []);

  function startEdit(faq) {
    setEditingId(faq.id);
    setForm({ question: faq.question, answer: faq.answer });
  }
  function resetForm() { setEditingId(null); setForm({ question: '', answer: '' }); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await updateFaq(editingId, form);
      } else {
        const nextPosition = faqs.length ? Math.max(...faqs.map((f) => f.position)) + 1 : 0;
        await createFaq({ ...form, position: nextPosition });
      }
      resetForm();
      refresh();
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    }
  }

  async function handleDelete(id) {
    await deleteFaq(id);
    if (editingId === id) resetForm();
    refresh();
  }

  async function handleMove(faq, direction) {
    const index = faqs.findIndex((f) => f.id === faq.id);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;
    await swapFaqPositions(faqs[index], faqs[targetIndex]);
    refresh();
  }

  return (
    <div>
      <h1 className="text-xl mb-1">FAQ</h1>
      <p className="text-xs text-gray-500 mb-5 max-w-2xl">
        Ces questions/réponses apparaissent sur la page d'accueil. Utile pour rassurer les visiteurs sur la
        livraison, les retours ou les tailles avant qu'ils commandent — et pour éviter de répéter les mêmes
        réponses sur WhatsApp.
      </p>

      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 mb-6 flex flex-col gap-3 max-w-xl">
        <p className="text-sm font-medium">{editingId ? 'Modifier la question' : 'Ajouter une question'}</p>
        <input required placeholder="Question (ex: Combien de temps prend la livraison ?)" value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })} />
        <textarea required rows={3} placeholder="Réponse" value={form.answer}
          onChange={(e) => setForm({ ...form, answer: e.target.value })} />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" className="bg-charcoal text-white px-4 py-2 text-sm">
            {editingId ? 'Enregistrer' : '+ Ajouter'}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="text-sm text-gray-500">Annuler</button>}
        </div>
      </form>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {faqs.length === 0 && <p className="p-4 text-sm text-gray-400">Aucune question pour le moment.</p>}
        {faqs.map((faq, i) => (
          <div key={faq.id} className="flex items-start justify-between gap-3 px-4 py-3 border-t border-gray-100 first:border-t-0 text-sm">
            <div className="flex-1">
              <p className="font-medium text-charcoal mb-1">{faq.question}</p>
              <p className="text-xs text-gray-500">{faq.answer}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex flex-col">
                <button onClick={() => handleMove(faq, 'up')} disabled={i === 0} className="text-gray-400 hover:text-charcoal disabled:opacity-30"><FiArrowUp size={13} /></button>
                <button onClick={() => handleMove(faq, 'down')} disabled={i === faqs.length - 1} className="text-gray-400 hover:text-charcoal disabled:opacity-30"><FiArrowDown size={13} /></button>
              </div>
              <button onClick={() => startEdit(faq)} className="text-xs text-charcoal font-medium">Modifier</button>
              <button onClick={() => handleDelete(faq.id)} className="text-xs text-red-600">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
