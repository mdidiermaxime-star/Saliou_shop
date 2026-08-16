import { supabase } from './supabase.js';

// Produits actifs avec leurs variantes et images, pour la boutique publique
export async function getProducts({ categoryId, categoryIds, search, limit = 50 } = {}) {
  let query = supabase
    .from('products')
    .select('*, product_variants(*), product_images(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  // categoryIds (tableau) permet d'afficher les produits d'une categorie
  // principale ET de toutes ses sous-categories en une seule requete -
  // utilise par la page categorie pour ne rien laisser de cote.
  if (categoryIds?.length) query = query.in('category_id', categoryIds);
  else if (categoryId) query = query.eq('category_id', categoryId);
  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((p) => normalizeProduct(p, { publicOnly: true }));
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*), product_images(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  if (error) throw error;
  return normalizeProduct(data, { publicOnly: true });
}

// Categories imbriquees (parent + enfants) pour le mega-menu du header
export async function getCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('position').order('id');
  if (error) throw error;
  const topLevel = data.filter((c) => !c.parent_id);
  return topLevel.map((cat) => ({
    ...cat,
    imageUrl: cat.image_url || null,
    bgColor: cat.bg_color || '#F3F4F6',
    children: data.filter((c) => c.parent_id === cat.id),
  }));
}

function normalizeProduct(p, { publicOnly = false } = {}) {
  let variants = (p.product_variants || []).map((v) => ({ ...v, stockQuantity: v.stock_quantity }));
  if (publicOnly) variants = variants.filter((v) => v.is_active !== false);
  return {
    ...p,
    basePrice: Number(p.base_price),
    compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : null,
    imageUrls: (p.product_images || []).sort((a, b) => a.position - b.position).map((i) => i.url),
    variants,
  };
}

// --- Admin ---
export async function listProductsAdmin() {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*), product_images(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((p) => normalizeProduct(p, { publicOnly: false }));
}

function slugifyProduct(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') + '-' + (Date.now() % 100000);
}

export async function createProduct(form) {
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name: form.name,
      slug: slugifyProduct(form.name),
      category_id: form.categoryId,
      description: form.description || null,
      product_type: form.productType,
      base_price: form.basePrice,
      compare_at_price: form.compareAtPrice || null,
      is_active: true,
    })
    .select()
    .single();
  if (error) throw error;

  if (form.variants?.length) {
    const { error: vError } = await supabase.from('product_variants').insert(
      form.variants.map((v) => ({
        product_id: product.id, size: v.size, color: v.color, sku: v.sku, stock_quantity: v.stockQuantity,
      }))
    );
    if (vError) throw vError;
  }

  if (form.imageUrls?.length) {
    const { error: iError } = await supabase.from('product_images').insert(
      form.imageUrls.map((url, i) => ({ product_id: product.id, url, position: i }))
    );
    if (iError) throw iError;
  }

  return product;
}

// Modifie un produit deja enregistre : infos generales, photos et
// variantes (tailles/couleurs/stock). Une variante deja vendue (presente
// dans une commande) ne peut pas etre supprimee en base a cause de la
// contrainte de cle etrangere - si l'admin la retire du formulaire, elle
// est simplement desactivee (is_active = false) plutot que supprimee,
// pour ne jamais casser l'historique des commandes passees.
export async function updateProduct(id, form) {
  const { error } = await supabase
    .from('products')
    .update({
      name: form.name,
      category_id: form.categoryId,
      description: form.description || null,
      product_type: form.productType,
      base_price: form.basePrice,
      compare_at_price: form.compareAtPrice || null,
    })
    .eq('id', id);
  if (error) throw error;

  // Photos : on remplace la liste entiere (simple, pas de dependance ailleurs)
  const { error: delImgError } = await supabase.from('product_images').delete().eq('product_id', id);
  if (delImgError) throw delImgError;
  if (form.imageUrls?.length) {
    const { error: iError } = await supabase.from('product_images').insert(
      form.imageUrls.map((url, i) => ({ product_id: id, url, position: i }))
    );
    if (iError) throw iError;
  }

  // Variantes : on recupere l'existant pour savoir quoi mettre a jour,
  // creer, ou desactiver (jamais supprimer une variante deja vendue).
  const { data: existingVariants, error: exError } = await supabase
    .from('product_variants').select('id').eq('product_id', id);
  if (exError) throw exError;
  const existingIds = new Set((existingVariants || []).map((v) => v.id));
  const keptIds = new Set();

  for (const v of form.variants || []) {
    if (v.id && existingIds.has(v.id)) {
      keptIds.add(v.id);
      const { error: uError } = await supabase.from('product_variants')
        .update({ size: v.size, color: v.color, sku: v.sku, stock_quantity: v.stockQuantity, is_active: true })
        .eq('id', v.id);
      if (uError) throw uError;
    } else {
      const { error: cError } = await supabase.from('product_variants').insert({
        product_id: id, size: v.size, color: v.color, sku: v.sku, stock_quantity: v.stockQuantity,
      });
      if (cError) throw cError;
    }
  }

  const toDeactivate = [...existingIds].filter((vid) => !keptIds.has(vid));
  if (toDeactivate.length) {
    const { error: dError } = await supabase.from('product_variants')
      .update({ is_active: false }).in('id', toDeactivate);
    if (dError) throw dError;
  }
}

export async function reactivateVariant(variantId) {
  const { error } = await supabase.from('product_variants').update({ is_active: true }).eq('id', variantId);
  if (error) throw error;
}

export async function setProductActive(id, active) {
  const { error } = await supabase.from('products').update({ is_active: active }).eq('id', id);
  if (error) throw error;
}

export async function updateVariantStock(variantId, quantity) {
  const { error } = await supabase.from('product_variants').update({ stock_quantity: quantity }).eq('id', variantId);
  if (error) throw error;
}
