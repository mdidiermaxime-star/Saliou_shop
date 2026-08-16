import { Outlet } from 'react-router-dom';
import PromoBar from './PromoBar.jsx';
import WelcomeBanner from './WelcomeBanner.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import WhatsAppButton from './WhatsAppButton.jsx';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <PromoBar />
      <WelcomeBanner />
      <Header />
      <main className="flex-1"><Outlet /></main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
