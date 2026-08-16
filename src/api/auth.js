import { supabase } from './supabase.js';

// Nettoie un numero de telephone saisi de n'importe quelle facon
// (espaces, tirets, +221, parentheses...) pour toujours obtenir les
// 9 chiffres du numero senegalais, ex: "+221 77 123 45 67" -> "771234567".
// Le numero est stocke sur le profil (utile pour livraison/contact) mais
// ne sert plus a se connecter : on utilise maintenant un vrai email.
export function normalizePhone(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('221') && digits.length > 9) digits = digits.slice(3);
  return digits;
}

export async function register(fullName, phone, email, password) {
  const digits = normalizePhone(phone);
  if (digits.length !== 9) {
    throw new Error('Numéro de téléphone invalide : entre les 9 chiffres de ton numéro sénégalais (ex: 771234567).');
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, phone: digits } },
  });
  if (error) throw error;
  return data;
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function logout() {
  await supabase.auth.signOut();
}

// Envoie un email de reinitialisation de mot de passe. Supabase gere
// entierement l'envoi (via son propre service mail) - on redirige le lien
// vers la page /reinitialiser-mot-de-passe de ce site.
export async function requestPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
  });
  if (error) throw error;
}

// Utilise une fois que le lien recu par email a cree une session de
// recuperation (Supabase le fait automatiquement via l'URL).
export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function getCurrentProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
  return profile ? { ...profile, userId: session.user.id, email: session.user.email } : null;
}
