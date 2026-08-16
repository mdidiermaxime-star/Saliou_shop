import { supabase } from './supabase.js';

export async function validatePromoCode(code, phoneNumber, orderSubtotal) {
  const { data: promo, error } = await supabase
    .from('promo_codes')
    .select('*')
    .ilike('code', code)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  if (!promo) return { valid: false, message: "Ce code promo n'existe pas ou n'est plus actif" };

  const today = new Date().toISOString().slice(0, 10);
  if (today < promo.start_date || today > promo.end_date) {
    return { valid: false, message: "Ce code promo n'est plus valide" };
  }
  if (promo.min_order_amount && orderSubtotal < promo.min_order_amount) {
    return { valid: false, message: `Ce code necessite un minimum de ${promo.min_order_amount} FCFA d'achat` };
  }
  if (promo.uses_remaining !== null && promo.uses_remaining <= 0) {
    return { valid: false, message: 'Ce code promo a atteint sa limite d\'utilisation' };
  }

  const { count } = await supabase
    .from('promo_code_usages')
    .select('*', { count: 'exact', head: true })
    .eq('promo_code_id', promo.id)
    .eq('phone_number', phoneNumber);

  if ((count || 0) >= promo.per_customer_limit) {
    return { valid: false, message: 'Vous avez déjà utilisé ce code promo' };
  }

  const discount = promo.discount_type === 'PERCENTAGE'
    ? (orderSubtotal * promo.value) / 100
    : Math.min(promo.value, orderSubtotal);

  return { valid: true, message: 'Code appliqué', discountAmount: discount, newTotal: orderSubtotal - discount };
}

export async function listPromoCodesAdmin() {
  const { data, error } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createPromoCode(payload) {
  const { error } = await supabase.from('promo_codes').insert({
    code: payload.code.toUpperCase(),
    discount_type: payload.discountType,
    value: payload.value,
    min_order_amount: payload.minOrderAmount || null,
    start_date: payload.startDate,
    end_date: payload.endDate,
    total_usage_limit: payload.totalUsageLimit || null,
    uses_remaining: payload.totalUsageLimit || null,
    per_customer_limit: payload.perCustomerLimit || 1,
  });
  if (error) throw error;
}

export async function setPromoCodeActive(id, active) {
  const { error } = await supabase.from('promo_codes').update({ is_active: active }).eq('id', id);
  if (error) throw error;
}
