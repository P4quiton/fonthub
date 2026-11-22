export async function getDownloadUrl(fontId) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  const url = new URL(`${supabaseUrl}/functions/v1/downloads-api`)
  url.searchParams.append('id', fontId)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${supabaseKey}`, 'apikey': supabaseKey },
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Error al descargar')
  
  return data.downloadUrl
}