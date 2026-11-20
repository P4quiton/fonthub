import { supabase } from './supabaseClient'

export async function getCatalog() {
  const { data, error } = await supabase.functions.invoke('catalog-api', {
    method: 'GET',
  })

  if (error) throw error
  return data.fonts || []
}