import { useEffect, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { getFaqs } from '../../api/siteContent.js';

export default function FAQSection() {
  const [faqs, setFaqs] = useState([]);
  const [openId, setOpenId] = useState(null);

  useEffect(() => { getFaqs().then(setFaqs); }, []);

  if (faqs.length === 0) return null;

  return (
    <div className="px-6 pb-14">
      <p className="text-xs font-semibold tracking-[0.15em] uppercase text-terracotta-600 mb-3">Questions fréquentes</p>
      <h3 className="font-display font-extrabold uppercase text-2xl md:text-3xl tracking-tight mb-6">On répond à vos questions</h3>
      <div className="max-w-2xl border-t border-gray-200">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id} className="border-b border-gray-200">
              <button type="button" onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full flex items-center justify-between gap-4 py-4 text-left">
                <span className="text-sm font-medium text-charcoal">{faq.question}</span>
                <FiChevronDown className={`shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && <p className="text-sm text-gray-500 pb-4 pr-8 whitespace-pre-line">{faq.answer}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
