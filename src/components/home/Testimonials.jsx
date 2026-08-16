import { useEffect, useState } from 'react';
import { FiStar } from 'react-icons/fi';
import { getTestimonials } from '../../api/siteContent.js';

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5 text-terracotta-500 mb-2.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <FiStar key={i} size={13} fill={i <= rating ? 'currentColor' : 'none'} />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => { getTestimonials().then(setTestimonials); }, []);

  if (testimonials.length === 0) return null;

  return (
    <div className="bg-gray-50 py-14">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-xs font-semibold tracking-[0.15em] uppercase text-terracotta-600 mb-3">Avis clients</p>
        <h3 className="font-display font-extrabold uppercase text-2xl md:text-3xl tracking-tight mb-6">Ce qu'ils en disent</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white rounded-xl p-5 border border-gray-100">
              <Stars rating={t.rating} />
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">« {t.comment} »</p>
              <div className="flex items-center gap-2.5">
                {t.image_url ? (
                  <img src={t.image_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-terracotta-100 text-terracotta-700 flex items-center justify-center text-xs font-semibold">
                    {t.customer_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-charcoal">{t.customer_name}</p>
                  {t.city && <p className="text-xs text-gray-400">{t.city}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
