import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/common/Logo.jsx';

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setSubmitting(true);
    try {
      await updatePassword(password);
      navigate('/');
    } catch (err) {
      setError(err.message || "Le lien a expiré ou n'est plus valide, redemande un nouveau lien depuis la page de connexion.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex justify-center py-10 px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6"><Logo /></div>
        <p className="text-sm font-medium mb-1">Nouveau mot de passe</p>
        <p className="text-xs text-gray-500 mb-5">Choisis un nouveau mot de passe pour ton compte.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input required type="password" placeholder="Nouveau mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input required type="password" placeholder="Confirme le mot de passe" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={submitting} className="bg-charcoal text-white py-2.5 text-sm mt-1 disabled:opacity-60">
            {submitting ? '...' : 'Valider le nouveau mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}
