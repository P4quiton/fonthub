
import { supabase } from './supabaseClient'

export async function getMyProfile() {
  const { data, error } = await supabase.functions.invoke(
    'profiles-api',
    {
      method: 'GET',
    }
  )

  if (error) {
    throw error
  }

  if (!data?.profile) {
    throw new Error('La API no devolvió un perfil')
  }

  return data.profile
}
