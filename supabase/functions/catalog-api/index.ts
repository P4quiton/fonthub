import { createClient } from 'npm:@supabase/supabase-js@2'

// Extraemos la publishable key de supabase.
const supabaseKey = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}').default || Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || ''

// Al ser una ruta pública, usamos la publsihable key que extraímos anteriormente
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  supabaseKey ?? ''
)

Deno.serve(async (req) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405 })
  }

  // Consultamos la base de datos (RLS se encargará de mostrar solo las 'published')
  const { data, error } = await supabaseClient
    .from('fonts')
    .select(`
      *,
      profiles (name),
      licenses (name)
    `)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ fonts: data }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
})