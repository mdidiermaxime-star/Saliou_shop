import { useEffect, useState } from 'react';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';
import { getLinks, getSetting } from '../../api/siteContent.js';
import Logo from '../common/Logo.jsx';

// Toutes les colonnes de liens (Boutique, Aide, Paiement) viennent de la
// table site_links, editable depuis Admin > Contenu du site > Liens -
// plus rien n'est ecrit en dur ici.
export default function Footer() {
  const [social, setSocial] = useState({ instagram: '', tiktok: '', whatsapp: '' });
  const [boutiqueLinks, setBoutiqueLinks] = useState([]);
  const [aideLinks, setAideLinks] = useState([]);
  const [paiementLinks, setPaiementLinks] = useState([]);

  useEffect(() => {
    Promise.all([
      getSetting('social_instagram', 'https://instagram.com/salioushop'),
      getSetting('social_tiktok', 'https://tiktok.com/@salioushop'),
      getSetting('social_whatsapp', 'https://wa.me/221770000000'),
    ]).then(([instagram, tiktok, whatsapp]) => setSocial({ instagram, tiktok, whatsapp }));

    getLinks('FOOTER_BOUTIQUE').then(setBoutiqueLinks);
    getLinks('FOOTER_AIDE').then(setAideLinks);
    getLinks('FOOTER_PAIEMENT').then(setPaiementLinks);
  }, []);

  const socialLinks = [
    { href: social.instagram, label: 'Instagram', Icon: FaInstagram },
    { href: social.tiktok, label: 'TikTok', Icon: FaTiktok },
    { href: social.whatsapp, label: 'WhatsApp', Icon: FaWhatsapp },
  ];

  return (
    <footer className="bg-charcoal text-gray-300 px-6 py-7 mt-10">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
        <div className="col-span-2 md:col-span-1">
          <div className="mb-3"><Logo variant="light" /></div>
          <p className="text-xs">Mode, chaussures et parfums, livrés partout au Sénégal.</p>
        </div>

        <div className="text-xs flex flex-col gap-1.5">
          <p className="text-white font-medium mb-1">Boutique</p>
          {boutiqueLinks.map((l) => <a key={l.id} href={l.url} className="hover:text-white">{l.label}</a>)}
          {boutiqueLinks.length === 0 && <span className="text-gray-500">Aucun lien configuré</span>}
        </div>

        <div className="text-xs flex flex-col gap-1.5">
          <p className="text-white font-medium mb-1">Aide</p>
          {aideLinks.map((l) => <a key={l.id} href={l.url} className="hover:text-white">{l.label}</a>)}
          {aideLinks.length === 0 && <span className="text-gray-500">Aucun lien configuré</span>}
        </div>

        <div className="text-xs flex flex-col gap-1.5">
          <p className="text-white font-medium mb-1">Paiement</p>
          {paiementLinks.map((l) => <a key={l.id} href={l.url} className="hover:text-white">{l.label}</a>)}
          {paiementLinks.length === 0 && <span className="text-gray-500">Aucun lien configuré</span>}
        </div>

        <div className="text-xs flex flex-col gap-2">
          <p className="text-white font-medium mb-1">Suis-nous</p>
          {socialLinks.map(({ href, label, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white">
              <Icon size={15} /> {label}
            </a>
          ))}
        </div>
      </div>
      <div className="pt-5 border-t border-white/10">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} Saliou Shop</p>
      </div>
    </footer>
  );
}
