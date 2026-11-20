import { supabase } from './supabaseClient'

export async function getCatalog(searchTerm = '') {
  // Si hay término, lo agregamos a la URL
  const url = searchTerm ? `catalog-api?search=${encodeURIComponent(searchTerm)}` : 'catalog-api'

  const { data, error } = await supabase.functions.invoke(url, {
    method: 'GET',
  })

  if (error) throw error
  return data.fonts || []
}