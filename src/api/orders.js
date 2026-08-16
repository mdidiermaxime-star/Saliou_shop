import { supabase } from './supabase.js';

export async function createOrder({ items, customerFullName, customerPhone, deliveryCity, deliveryZone, deliveryDetails, paymentMethod, promoCode, userId }) {
  const { data, error } = await supabase.rpc('create_order', {
    p_items: items.map((i) => ({ variant_id: i.productVariantId, quantity: i.quantity })),
    p_customer_full_name: customerFullName,
    p_customer_phone: customerPhone,
    p_delivery_city: deliveryCity,
    p_delivery_zone: deliveryZone,
    p_delivery_details: deliveryDetails || null,
    p_payment_method: paymentMethod,
    p_promo_code: promoCode && promoCode.trim() ? promoCode.trim() : null,
    p_user_id: userId || null,
  });
  if (error) throw error;
  return data;
}

export async function trackOrder(orderNumber) {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('order_number', orderNumber)
    .single();
  if (error) throw error;
  return order;
}

export async function getMyOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// --- Admin ---
export async function listOrdersAdmin(status) {
  let query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateOrderStatus(orderId, status, note) {
  const { error: e1 } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
  if (e1) throw e1;
  const { error: e2 } = await supabase.from('order_status_history').insert({ order_id: orderId, status, note });
  if (e2) throw e2;
}

export async function confirmOrderDelivery(orderId, deliveryFee) {
  const { error } = await supabase
    .from('orders')
    .update({ delivery_fee: deliveryFee, delivery_confirmed: true, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;
}

// order_items et order_status_history sont lies avec "on delete cascade" -
// supprimer la commande retire automatiquement tout ce qui lui est rattache.
export async function deleteOrder(orderId) {
  const { error } = await supabase.from('orders').delete().eq('id', orderId);
  if (error) throw error;
}
