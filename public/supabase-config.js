/* ============================================================
   supabase-config.js  —  Data Access Layer
   Replace SUPABASE_URL and SUPABASE_ANON_KEY with your values
   from: Supabase → Project Settings → API
============================================================ */

const SUPABASE_URL      = 'https://rhmvyjcljojursvhdxhr.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_pGQcgvdD3FjwKUk_AuznEg_ZNqlF2g5'

let sb = null

function initSupabase() {
  if (
    typeof window.supabase !== 'undefined' &&
    SUPABASE_URL !== 'YOUR_SUPABASE_URL'
  ) {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    console.log('✦ Supabase connected')
    return true
  }
  console.warn('⚠ Supabase not configured — using localStorage fallback')
  return false
}

/* ── PRODUCTS ─────────────────────────────────────────── */
async function sbGetProducts() {
  if (!sb) return null
  const { data, error } = await sb.from('products').select('*').order('id')
  return error ? null : data
}
async function sbAddProduct(p) {
  if (!sb) return null
  const { data, error } = await sb
    .from('products').insert([{ name:p.name, price:p.price, image:p.image||'' }]).select()
  return error ? null : data[0]
}
async function sbDeleteProduct(id) {
  if (!sb) return
  await sb.from('products').delete().eq('id', id)
}

/* ── BILLS ────────────────────────────────────────────── */
async function sbSaveBill(bill) {
  if (!sb) return null
  const { data, error } = await sb.from('bills').insert([{
    bill_no:  bill.bill_no,
    items:    bill.items,
    subtotal: bill.subtotal,
    tax:      bill.tax,
    total:    bill.total,
    currency: bill.currency || '₹'
  }]).select()
  return error ? null : data[0]
}
async function sbGetBills() {
  if (!sb) return null
  const { data, error } = await sb
    .from('bills').select('*').order('created_at', { ascending: false })
  return error ? null : data
}

/* ── MANAGER AUTH ─────────────────────────────────────── */
async function sbGetCredentials() {
  if (!sb) return null
  const { data, error } = await sb.from('manager_auth').select('*').limit(1).single()
  return error ? null : data
}
async function sbUpdateCredentials(username, password) {
  if (!sb) return false
  const { error } = await sb.from('manager_auth')
    .update({ username, password, updated_at: new Date().toISOString() })
    .eq('id', 1)
  return !error
}

/* ── APP SETTINGS (manager global) ───────────────────── */
async function sbSaveSetting(key, value) {
  if (!sb) return
  await sb.from('app_settings').upsert({
    key, value: JSON.stringify(value), updated_at: new Date().toISOString()
  })
}
async function sbGetSetting(key) {
  if (!sb) return null
  const { data, error } = await sb
    .from('app_settings').select('value').eq('key', key).single()
  if (error || !data) return null
  try { return JSON.parse(data.value) } catch { return data.value }
}
async function sbGetAllSettings() {
  if (!sb) return null
  const { data, error } = await sb.from('app_settings').select('*')
  if (error || !data) return null
  const out = {}
  data.forEach(r => { try { out[r.key] = JSON.parse(r.value) } catch { out[r.key] = r.value } })
  return out
}
