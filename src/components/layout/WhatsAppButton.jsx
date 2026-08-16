import { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { getSetting } from '../../api/siteContent.js';

export default function WhatsAppButton() {
  const [link, setLink] = useState('https://wa.me/221770000000');
  useEffect(() => { getSetting('social_whatsapp', 'https://wa.me/221770000000').then(setLink); }, []);
  return (
    <a href={link} target="_blank" rel="noopener noreferrer"
      className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg z-50 hover:brightness-95 transition-all"
      aria-label="Contacter sur WhatsApp">
      <FaWhatsapp size={24} color="white" />
    </a>
  );
}
