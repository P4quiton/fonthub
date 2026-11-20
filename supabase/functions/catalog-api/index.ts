import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@^2/cors' // v2.95.0+


// 1. Definimos los headers CORS manualmente (es más seguro en Deno)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}


Deno.serve(async (req) => {
  // Manejo de CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }


  // 2. Solo permitir GET para el catálogo
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Método no permitido' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }


  // 3. Crear el cliente de Supabase usando las variables de entorno

  //Extraemos la URL del proyecto de supabase
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  // Extraemos la publishable key de supabase.
  const supabaseKey = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}').default || Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || ''
  // Creamos el cliente de supabase usando la clave pública y la URL del proyecto
  const supabaseClient = createClient(supabaseUrl, supabaseKey)


  // 4. Consultar la base de datos (RLS filtra solo las 'published')
  const { data, error } = await supabaseClient
    .from('fonts')
    .select(`
      id, name, description, category, price, preview_url,
      profiles (name),
      licenses (name)
    `)
    .eq('status', 'published')


    // 5. Manejar errores de la consulta
  if (error) {
    // Imprimimos el error completo en los logs de Supabase para diagnosticar
    console.error('Error de base de datos:', error)
    return new Response(
      JSON.stringify({ error: 'Error al consultar el catálogo', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }


  // 6. Devolver la respuesta exitosa con los encabezados CORS
  return new Response(
    JSON.stringify({ fonts: data }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
