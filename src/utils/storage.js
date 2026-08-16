import { supabase } from '../api/supabase.js';

// Televersement direct vers Supabase Storage (bucket "product-images" cree
// par le script SQL) - l'admin choisit un fichier sur son ordinateur, on
// recupere une URL publique a stocker sur le produit.
export async function uploadProductImage(file) {
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const { error } = await supabase.storage.from('product-images').upload(fileName, file);
  if (error) throw error;
  const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
  return data.publicUrl;
}
