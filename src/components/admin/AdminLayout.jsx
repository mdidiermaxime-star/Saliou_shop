import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiGrid, FiShoppingBag, FiPackage, FiTag, FiUsers, FiImage, FiSettings, FiFolder, FiLink, FiHelpCircle, FiStar, FiLogOut, FiExternalLink } from 'react-icons/fi';
import Logo from '../common/Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/admin', label: 'Tableau de bord', Icon: FiGrid, end: true },
  { to: '/admin/produits', label: 'Produits', Icon: FiShoppingBag },
  { to: '/admin/categories', label: 'Catégories', Icon: FiFolder },
  { to: '/admin/commandes', label: 'Commandes', Icon: FiPackage },
  { to: '/admin/codes-promo', label: 'Codes promo', Icon: FiTag },
  { to: '/admin/avis', label: 'Avis clients', Icon: FiStar },
  { to: '/admin/faq', label: 'FAQ', Icon: FiHelpCircle },
  { to: '/admin/clients', label: 'Clients', Icon: FiUsers },
  { to: '/admin/contenu', label: 'Contenu du site', Icon: FiImage },
  { to: '/admin/liens', label: 'Liens', Icon: FiLink },
  { to: '/admin/reglages', label: 'Réglages', Icon: FiSettings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/connexion');
  }

  return (
    <div className="grid grid-cols-[190px_1fr] min-h-screen">
      <aside className="bg-charcoal p-5 flex flex-col">
        <div className="mb-6"><Logo variant="light" to="/admin" /></div>
        <nav className="flex flex-col gap-0.5 text-sm flex-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `flex items-center gap-2.5 px-2.5 py-2 rounded-lg ${isActive ? 'bg-white/10 text-white font-medium' : 'text-gray-300'}`}>
              <item.Icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="pt-3 mt-3 border-t border-white/10 flex flex-col gap-0.5 text-sm">
          {user?.full_name && (
            <p className="px-2.5 pb-1.5 text-xs text-gray-400 truncate">Connecté : {user.full_name}</p>
          )}
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-gray-300 hover:bg-white/5">
            <FiExternalLink size={16} /> Voir le site
          </a>
          <button onClick={handleLogout}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white text-left">
            <FiLogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="p-6 overflow-y-auto"><Outlet /></main>
    </div>
  );
}
