import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import Home from './pages/Home.jsx';
import ProductList from './pages/ProductList.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Login from './pages/Login.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import MyOrders from './pages/MyOrders.jsx';
import OrderTracking from './pages/OrderTracking.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';
import SearchResults from './pages/SearchResults.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import AdminCategories from './pages/admin/AdminCategories.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminPromoCodes from './pages/admin/AdminPromoCodes.jsx';
import AdminClients from './pages/admin/AdminClients.jsx';
import AdminContent from './pages/admin/AdminContent.jsx';
import AdminLinks from './pages/admin/AdminLinks.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';
import AdminFAQ from './pages/admin/AdminFAQ.jsx';
import AdminTestimonials from './pages/admin/AdminTestimonials.jsx';
import RequireAuth from './components/common/RequireAuth.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/categorie/:slug" element={<ProductList />} />
        <Route path="/produit/:slug" element={<ProductDetail />} />
        <Route path="/panier" element={<Cart />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
        <Route path="/commande/:orderNumber" element={<OrderTracking />} />
        <Route path="/commande/:orderNumber/confirmation" element={<OrderConfirmation />} />
        <Route path="/recherche" element={<SearchResults />} />
        <Route path="/mon-compte/commandes" element={<RequireAuth><MyOrders /></RequireAuth>} />
      </Route>

      <Route path="/admin" element={<RequireAuth role="ADMIN"><AdminLayout /></RequireAuth>}>
        <Route index element={<AdminDashboard />} />
        <Route path="produits" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="commandes" element={<AdminOrders />} />
        <Route path="codes-promo" element={<AdminPromoCodes />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="avis" element={<AdminTestimonials />} />
        <Route path="faq" element={<AdminFAQ />} />
        <Route path="contenu" element={<AdminContent />} />
        <Route path="liens" element={<AdminLinks />} />
        <Route path="reglages" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}
