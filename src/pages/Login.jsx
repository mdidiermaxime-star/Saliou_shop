import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/common/Logo.jsx';

export default function Login() {
  const { login, register, requestPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // login | register | forgot
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        navigate('/');
      } else if (mode === 'register') {
        await register(form.fullName, form.phone, form.email, form.password);
        navigate('/');
      } else if (mode === 'forgot') {
        await requestPasswordReset(form.email);
        setInfo('Un lien de réinitialisation vient de t\'être envoyé par email. Vérifie ta boîte de réception (et les spams).');
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex justify-center py-10 px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6"><Logo /></div>

        {mode !== 'forgot' && (
          <div className="flex bg-gray-50 rounded-lg p-1 mb-5">
            <button type="button" className={`flex-1 py-2 text-sm rounded-md ${mode === 'login' ? 'bg-white font-medium' : 'text-gray-500'}`} onClick={() => { setMode('login'); setError(null); setInfo(null); }}>Connexion</button>
            <button type="button" className={`flex-1 py-2 text-sm rounded-md ${mode === 'register' ? 'bg-white font-medium' : 'text-gray-500'}`} onClick={() => { setMode('register'); setError(null); setInfo(null); }}>Créer un compte</button>
          </div>
        )}

        {mode === 'forgot' && (
          <div className="mb-5">
            <button type="button" onClick={() => { setMode('login'); setError(null); setInfo(null); }} className="text-xs text-gray-500">← Retour à la connexion</button>
            <p className="text-sm font-medium mt-3">Mot de passe oublié</p>
            <p className="text-xs text-gray-500 mt-1">Entre ton email, on t'envoie un lien pour choisir un nouveau mot de passe.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'register' && (
            <>
              <input required placeholder="Nom complet" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              <input required placeholder="Numéro de téléphone (ex: 77 123 45 67)" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="numeric" />
            </>
          )}
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {mode !== 'forgot' && (
            <input required type="password" placeholder="Mot de passe" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          )}

          {mode === 'login' && (
            <button type="button" onClick={() => { setMode('forgot'); setError(null); setInfo(null); }} className="text-xs text-terracotta-600 text-left -mt-1">
              Mot de passe oublié ?
            </button>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}
          {info && <p className="text-xs text-green-600">{info}</p>}

          <button type="submit" disabled={submitting} className="bg-charcoal text-white py-2.5 text-sm mt-1 disabled:opacity-60">
            {submitting
              ? '...'
              : mode === 'login' ? 'Se connecter'
              : mode === 'register' ? 'Créer mon compte'
              : 'Envoyer le lien'}
          </button>
        </form>
      </div>
    </div>
  );
}
