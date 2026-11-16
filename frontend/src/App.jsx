import { getMyProfile } from './services/profilesService'

import { useEffect, useState } from 'react'
import Button from './components/ui/Button'
import Card from './components/ui/Card'
import {
  signInWithGoogle,
  signOut,
  getCurrentUser,
} from './features/auth/authService'
import { supabase } from './services/supabaseClient'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  //Prueba
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  //Prueba

  useEffect(() => {
    let active = true

    async function loadUser() {
      try {
        const currentUser = await getCurrentUser()
        if (active) setUser(currentUser)
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadUser()

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        if (active) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleGoogleLogin() {
    try {
      setError('')
      await signInWithGoogle()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleLogout() {
    setProfile(null)
    try {
      setError('')
      await signOut()
      setUser(null)
    } catch (err) {
      setError(err.message)
    }
  }

  //Prueba
  async function handleGetProfile() {
  try {
    setError('')
    setProfile(null)
    setProfileLoading(true)

    const result = await getMyProfile()
    setProfile(result)
  } catch (err) {
    console.error('Error en profiles-api:', err)
    setError('No se pudo consultar el perfil mediante la API')
  } finally {
    setProfileLoading(false)
  }
}
  //Prueba

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-lg">
        <Card className="text-center">
          <h1 className="text-4xl font-black sm:text-5xl">
            FontHub
          </h1>

          <p className="mt-3 font-medium">
            Crea, comparte y descubre tipografías.
          </p>

          <div className="mt-8">
            {loading ? (
              <p>Comprobando sesión...</p>
            ) : user ? (
              <div className="space-y-5">
                <p className="font-bold">
                  ¡Sesión iniciada!
                </p>

                <p className="break-all text-sm">
                  {user.email}
                </p>

                <Button
                  variant="accent"
                  className="w-full"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </Button>

















































<div className="mt-5 space-y-4">
  <Button
    className="w-full"
    onClick={handleGetProfile}
    disabled={profileLoading}
  >
    {profileLoading ? 'Consultando...' : 'Consultar mi perfil (API)'}
  </Button>

  {profile && (
    <div className="rounded-lg border-2 border-black bg-yellow-100 p-4 text-left">
      <p>
        <strong>Nombre:</strong> {profile.name || 'Sin nombre'}
      </p>
      <p>
        <strong>Rol:</strong> {profile.role}
      </p>
    </div>
  )}
</div>








































              </div>
            ) : (
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleGoogleLogin}
              >
                Continuar con Google
              </Button>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="mt-5 text-sm font-bold text-red-700"
            >
              {error}
            </p>
          )}
        </Card>
      </div>
    </main>
  )
}

export default App
