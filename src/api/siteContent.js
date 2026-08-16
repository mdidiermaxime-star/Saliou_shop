import { supabase } from './supabase.js';

export async function getBanners(section) {
  const { data, error } = await supabase
    .from('site_banners')
    .select('*')
    .eq('section', section)
    .eq('is_active', true)
    .order('position');
  if (error) throw error;
  return (data || []).map((b) => ({
    id: b.id, title: b.title, subtitle: b.subtitle, imageUrl: b.image_url,
    ctaText: b.cta_text, ctaLink: b.cta_link,
  }));
}

export async function createBanner(payload) {
  const { error } = await supabase.from('site_banners').insert({
    section: payload.section, title: payload.title, subtitle: payload.subtitle || null,
    image_url: payload.imageUrl || null, cta_text: payload.ctaText || null, cta_link: payload.ctaLink || null,
    position: payload.position || 0, is_active: true,
  });
  if (error) throw error;
}

// --- Admin (voit aussi les bannieres desactivees, pour pouvoir les reactiver) ---
export async function listBannersAdmin(section) {
  const { data, error } = await supabase.from('site_banners').select('*').eq('section', section).order('position');
  if (error) throw error;
  return (data || []).map((b) => ({
    id: b.id, title: b.title, subtitle: b.subtitle, imageUrl: b.image_url,
    ctaText: b.cta_text, ctaLink: b.cta_link, position: b.position, isActive: b.is_active,
  }));
}

export async function updateBanner(id, payload) {
  const { error } = await supabase.from('site_banners').update({
    title: payload.title, subtitle: payload.subtitle || null,
    image_url: payload.imageUrl || null, cta_text: payload.ctaText || null, cta_link: payload.ctaLink || null,
  }).eq('id', id);
  if (error) throw error;
}

export async function setBannerActive(id, active) {
  const { error } = await supabase.from('site_banners').update({ is_active: active }).eq('id', id);
  if (error) throw error;
}

export async function deleteBanner(id) {
  const { error } = await supabase.from('site_banners').delete().eq('id', id);
  if (error) throw error;
}

export async function swapBannerPositions(bannerA, bannerB) {
  await supabase.from('site_banners').update({ position: bannerB.position }).eq('id', bannerA.id);
  await supabase.from('site_banners').update({ position: bannerA.position }).eq('id', bannerB.id);
}

export async function getSetting(key, fallback = '') {
  const { data, error } = await supabase.from('site_settings').select('setting_value').eq('setting_key', key).maybeSingle();
  if (error || !data) return fallback;
  return data.setting_value ?? fallback;
}

export async function setSetting(key, value) {
  const { error } = await supabase.from('site_settings').upsert({ setting_key: key, setting_value: value }, { onConflict: 'setting_key' });
  if (error) throw error;
}

// --- FAQ (page d'accueil) ---
export async function getFaqs() {
  const { data, error } = await supabase.from('site_faqs').select('*').eq('is_active', true).order('position');
  if (error) throw error;
  return data || [];
}

export async function listFaqsAdmin() {
  const { data, error } = await supabase.from('site_faqs').select('*').order('position');
  if (error) throw error;
  return data || [];
}

export async function createFaq({ question, answer, position = 0 }) {
  const { error } = await supabase.from('site_faqs').insert({ question, answer, position });
  if (error) throw error;
}

export async function updateFaq(id, { question, answer }) {
  const { error } = await supabase.from('site_faqs').update({ question, answer }).eq('id', id);
  if (error) throw error;
}

export async function deleteFaq(id) {
  const { error } = await supabase.from('site_faqs').delete().eq('id', id);
  if (error) throw error;
}

export async function swapFaqPositions(faqA, faqB) {
  await supabase.from('site_faqs').update({ position: faqB.position }).eq('id', faqA.id);
  await supabase.from('site_faqs').update({ position: faqA.position }).eq('id', faqB.id);
}

// --- Avis clients (temoignages, page d'accueil) ---
export async function getTestimonials() {
  const { data, error } = await supabase.from('site_testimonials').select('*').eq('is_active', true).order('position');
  if (error) throw error;
  return data || [];
}

export async function listTestimonialsAdmin() {
  const { data, error } = await supabase.from('site_testimonials').select('*').order('position');
  if (error) throw error;
  return data || [];
}

export async function createTestimonial({ customerName, rating, comment, imageUrl, city, position = 0 }) {
  const { error } = await supabase.from('site_testimonials').insert({
    customer_name: customerName, rating, comment, image_url: imageUrl || null, city: city || null, position,
  });
  if (error) throw error;
}

export async function setTestimonialActive(id, active) {
  const { error } = await supabase.from('site_testimonials').update({ is_active: active }).eq('id', id);
  if (error) throw error;
}

export async function deleteTestimonial(id) {
  const { error } = await supabase.from('site_testimonials').delete().eq('id', id);
  if (error) throw error;
}

// --- Liens du footer, editables depuis l'admin ---
export async function getLinks(section) {
  const { data, error } = await supabase.from('site_links').select('*').eq('section', section).order('position');
  if (error) throw error;
  return data || [];
}

export async function createLink({ section, label, url, position = 0 }) {
  const { error } = await supabase.from('site_links').insert({ section, label, url, position });
  if (error) throw error;
}

export async function deleteLink(id) {
  const { error } = await supabase.from('site_links').delete().eq('id', id);
  if (error) throw error;
}
