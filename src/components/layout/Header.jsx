import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiShoppingBag, FiMenu, FiLogOut } from 'react-icons/fi';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getCategories } from '../../api/products.js';
import Logo from '../common/Logo.jsx';
import MegaMenu from './MegaMenu.jsx';
import MobileDrawer from './MobileDrawer.jsx';

export default function Header() {
  const { items } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const [categories, setCategories] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => { getCategories().then(setCategories); }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/recherche?q=${encodeURIComponent(searchTerm.trim())}`);
    setSearchOpen(false);
  }

  async function handleLogout() {
    await logout();
    setAccountMenuOpen(false);
    navigate('/');
  }

  return (
    <header className="border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-8">
          <Logo />
          <MegaMenu categories={categories} />
        </div>

        <div className="flex items-center gap-5">
          <form onSubmit={handleSearchSubmit} className="hidden md:block w-64 relative">
            <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher un produit" value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 rounded-full bg-gray-50" />
          </form>

          <div className="flex items-center gap-5 text-charcoal">
            <button aria-label="Rechercher" className="md:hidden hover:text-terracotta-400 transition-colors" onClick={() => setSearchOpen((v) => !v)}>
              <FiSearch size={19} />
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen((v) => !v)}
                  className="flex items-center gap-2 hover:text-terracotta-400 transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-terracotta-100 text-terracotta-800 text-xs flex items-center justify-center font-medium">
                    {user.full_name?.[0]?.toUpperCase() || <FiUser size={14} />}
                  </span>
                  <span className="hidden md:inline text-sm">{user.full_name?.split(' ')[0] || 'Compte'}</span>
                </button>
                {accountMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-40">
                    <p className="px-3 py-2 text-xs text-gray-400 border-b border-gray-100">Connecté</p>
                    <button onClick={() => { setAccountMenuOpen(false); navigate('/mon-compte/commandes'); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">
                      Mes commandes
                    </button>
                    {user.role === 'ADMIN' && (
                      <button onClick={() => { setAccountMenuOpen(false); navigate('/admin'); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">
                        Site de gestion
                      </button>
                    )}
                    <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600">
                      <FiLogOut size={14} /> Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button aria-label="Mon compte" onClick={() => navigate('/connexion')} className="hover:text-terracotta-400 transition-colors">
                <FiUser size={19} />
              </button>
            )}

            <button aria-label="Panier" onClick={() => navigate('/panier')} className="relative hover:text-terracotta-400 transition-colors">
              <FiShoppingBag size={19} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-terracotta-400 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {itemCount}
                </span>
              )}
            </button>
            <button aria-label="Ouvrir le menu" className="md:hidden hover:text-terracotta-400 transition-colors" onClick={() => setDrawerOpen(true)}>
              <FiMenu size={20} />
            </button>
          </div>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={handleSearchSubmit} className="md:hidden absolute left-0 right-0 top-full bg-white border-b border-gray-200 p-3 z-30">
          <div className="relative">
            <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" autoFocus placeholder="Rechercher un produit" value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 rounded-full bg-gray-50" />
          </div>
        </form>
      )}

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} categories={categories} />
    </header>
  );
}
