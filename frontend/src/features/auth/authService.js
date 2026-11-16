import { supabase } from '../../services/supabaseClient'

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  })

  if (error) throw error

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) throw error
}

export async function getCurrentUser() {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession()

  if (sessionError) throw sessionError

  if (!sessionData.session) {
    return null
  }

  const { data, error } = await supabase.auth.getUser()

  if (error) throw error

  return data.user
}