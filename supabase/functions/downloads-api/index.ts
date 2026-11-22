import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405, headers: corsHeaders })
  }

  const url = new URL(req.url)
  const fontId = url.searchParams.get('id')

  if (!fontId) {
    return new Response(JSON.stringify({ error: 'Falta el ID de la fuente' }), { status: 400, headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseKey = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}').default
    || Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || ''
  
  const supabaseClient = createClient(supabaseUrl, supabaseKey)

  // 1. Buscar la fuente en la base de datos
  const { data: font, error: dbError } = await supabaseClient
    .from('fonts')
    .select('price, file_url, name')
    .eq('id', fontId)
    .eq('status', 'published')
    .single()

  if (dbError || !font) {
    return new Response(JSON.stringify({ error: 'Fuente no encontrada' }), { status: 404, headers: corsHeaders })
  }

  // 2. Verificar si es de pago (por ahora bloqueamos las de pago)
  if (Number(font.price) > 0) {
    return new Response(JSON.stringify({ error: 'Esta fuente es de pago. Módulo de compras en desarrollo.' }), { status: 403, headers: corsHeaders })
  }

  // 3. Generar la URL firmada por 60 segundos (1 minuto) para descargar
  const { data: signedUrlData, error: urlError } = await supabaseClient
    .storage
    .from('font-files')
    .createSignedUrl(font.file_url, 60)

  if (urlError) {
    console.error('Error al generar URL:', urlError)
    return new Response(JSON.stringify({ error: 'Error al generar el enlace de descarga' }), { status: 500, headers: corsHeaders })
  }

  // 4. Devolver la URL
  return new Response(
    JSON.stringify({ downloadUrl: signedUrlData.signedUrl, filename: font.file_url }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})