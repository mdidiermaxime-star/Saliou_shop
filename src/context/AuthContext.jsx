import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../api/supabase.js';
import * as authApi from '../api/auth.js';

const AuthContext = createContext(null);

// Deconnexion automatique apres ce delai d'inactivite (en millisecondes).
// Protege un compte admin reste ouvert sur un ordinateur partage.
const IDLE_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const idleTimer = useRef(null);

  useEffect(() => {
    authApi.getCurrentProfile().then((p) => {
      setUser(p);
      setLoading(false);
    });

    // Ecoute les changements d'etat Supabase. Pour une deconnexion, on met
    // a jour l'etat directement (pas d'appel asynchrone supplementaire) pour
    // eviter toute course avec logout() qui pourrait sinon reconnecter
    // l'utilisateur par erreur juste apres qu'il se soit deconnecte.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        return;
      }
      authApi.getCurrentProfile().then(setUser);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function login(email, password) {
    await authApi.login(email, password);
    const profile = await authApi.getCurrentProfile();
    setUser(profile);
    return profile;
  }

  async function register(fullName, phone, email, password) {
    await authApi.register(fullName, phone, email, password);
    const profile = await authApi.getCurrentProfile();
    setUser(profile);
    return profile;
  }

  async function requestPasswordReset(email) {
    await authApi.requestPasswordReset(email);
  }

  async function updatePassword(newPassword) {
    await authApi.updatePassword(newPassword);
    const profile = await authApi.getCurrentProfile();
    setUser(profile);
  }

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      // Le "finally" garantit que l'utilisateur est bien deconnecte cote
      // interface meme si l'appel reseau a Supabase echoue pour une raison
      // quelconque (ex: connexion coupee) - sinon le bouton semble ne rien faire.
      setUser(null);
    }
  }

  // Deconnexion automatique apres une longue inactivite
  useEffect(() => {
    if (!user) return;

    function resetTimer() {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        logout();
      }, IDLE_TIMEOUT_MS);
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(idleTimer.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, requestPasswordReset, updatePassword, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
