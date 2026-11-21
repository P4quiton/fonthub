import { createClient } from 'npm:@supabase/supabase-js@2'

// 1. Definimos los headers CORS manualmente (es más seguro en Deno)
// Eliminamos el import de @supabase/supabase-js/cors porque causaba conflictos
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Manejo de CORS preflight (muy importante para que el navegador no bloquee la petición)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // 2. Solo permitir GET para el catálogo (¡Tu validación!)
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Método no permitido' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // 3. Leer los parámetros de búsqueda de la URL (ej. ?search=Arial)
  const url = new URL(req.url)
  const searchTerm = url.searchParams.get('search') || ''

  // 4. Crear el cliente de Supabase usando las variables de entorno
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  
  // Extraemos la publishable key (con todos los fallbacks de seguridad que agregaste)
  const supabaseKey = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}').default 
    || Deno.env.get('SUPABASE_PUBLISHABLE_KEY') 
    || Deno.env.get('SUPABASE_ANON_KEY') 
    || ''
    
  const supabaseClient = createClient(supabaseUrl, supabaseKey)

  // 5. Construir la consulta base
  let query = supabaseClient
    .from('fonts')
    .select(`
      id, name, description, category, price, preview_url,
      profiles (name),
      licenses (name)
    `)
    .eq('status', 'published')

  // 6. Si el usuario escribió algo en el buscador, filtramos por nombre
  if (searchTerm) {
    // ilike ignora mayúsculas y minúsculas, y los % buscan coincidencias parciales
    query = query.ilike('name', `%${searchTerm}%`)
  }

  // 7. Ejecutar la consulta
  const { data, error } = await query

  // 8. Manejar errores de la consulta
  if (error) {
    console.error('Error de base de datos:', error)
    return new Response(
      JSON.stringify({ error: 'Error al consultar el catálogo', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // 9. Devolver la respuesta exitosa con los encabezados CORS
  return new Response(
    JSON.stringify({ fonts: data }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})