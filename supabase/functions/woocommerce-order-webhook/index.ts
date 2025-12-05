import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok')
  try {
    const payload = await req.json()
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return new Response('ok')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const orderId = payload?.id
    const status = payload?.status
    const externalId = orderId ? String(orderId) : null
    if (externalId) {
      await supabase.from('orders').update({ status }).eq('external_order_id', externalId)
    }
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch {
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }
})

