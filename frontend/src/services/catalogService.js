export async function getCatalog(searchTerm = '', fontId = '') {
  // Obtenemos la URL y la clave de las variables de entorno de Vite
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  // Construimos la URL base de la Edge Function
  const url = new URL(`${supabaseUrl}/functions/v1/catalog-api`)

  // Añadimos los parámetros si existen
  if (searchTerm) url.searchParams.append('search', searchTerm)
  if (fontId) url.searchParams.append('id', fontId)

  // Hacemos la petición usando fetch (nativo del navegador)
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
    },
  })

  if (!response.ok) {
    throw new Error('Error en la petición al catálogo')
  }

  const data = await response.json()
  return data.fonts || []
}