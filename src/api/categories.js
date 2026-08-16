import { supabase } from './supabase.js';

export async function listCategoriesAdmin() {
  const { data, error } = await supabase.from('categories').select('*, parent:parent_id(id, name)').order('position').order('id');
  if (error) throw error;
  return data.map((c) => ({
    id: c.id, name: c.name, slug: c.slug, position: c.position,
    parentId: c.parent_id,
    parentName: c.parent?.name || null,
    imageUrl: c.image_url || null,
    bgColor: c.bg_color || '#F3F4F6',
  }));
}

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') + '-' + (Date.now() % 100000);
}

export async function createCategory({ name, parentId, position = 0, imageUrl, bgColor }) {
  const { error } = await supabase.from('categories').insert({
    name, slug: slugify(name), parent_id: parentId || null, position,
    image_url: imageUrl || null, bg_color: bgColor || '#F3F4F6',
  });
  if (error) throw error;
}

// Modifie l'apparence (image / couleur de fond) d'une categorie deja creee -
// utilise pour les cartes "Univers" de la page d'accueil.
export async function updateCategoryVisual(id, { imageUrl, bgColor }) {
  const { error } = await supabase.from('categories').update({
    image_url: imageUrl || null, bg_color: bgColor || '#F3F4F6',
  }).eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// Echange la position de deux categories (utilise pour les fleches monter/descendre)
export async function swapCategoryPositions(categoryA, categoryB) {
  await supabase.from('categories').update({ position: categoryB.position }).eq('id', categoryA.id);
  await supabase.from('categories').update({ position: categoryA.position }).eq('id', categoryB.id);
}
