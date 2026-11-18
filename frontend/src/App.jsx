
import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router'

import Header from './components/layout/Header'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import PlaceholderPage from './pages/PlaceholderPage'
import ProtectedRoute from './routes/ProtectedRoute'
import ProfilePage from './pages/ProfilePage'

import {
  getCurrentUser,
  signInWithGoogle,
  signOut,
} from './features/auth/authService'
import { supabase } from './services/supabaseClient'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadUser() {
      try {
        const currentUser = await getCurrentUser()

        if (active) {
          setUser(currentUser)
        }
      } catch (err) {
        if (active) {
          setError(err.message)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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

  async function handleGoogleLogin(destination = '/') {
    try {
      setError('')
      await signInWithGoogle(destination)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleLogout() {
    try {
      setError('')
      await signOut()
      setUser(null)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} onLogout={handleLogout} />

      {error && (
        <p
          role="alert"
          className="mx-auto mt-4 w-full max-w-5xl px-5 font-bold text-red-700"
        >
          {error}
        </p>
      )}

      <div className="flex-1">
        <Routes>
          {/* Páginas públicas */}
          <Route path="/" element={<HomePage />} />

          <Route
            path="/login"
            element={
              <LoginPage
                user={user}
                loading={loading}
                onGoogleLogin={handleGoogleLogin}
                error={error}
              />
            }
          />

          <Route
            path="/catalogo"
            element={
              <PlaceholderPage
                title="Explorar fuentes"
                description="Aquí encontrarás el catálogo de tipografías de FontHub."
              />
            }
          />

          {/* Páginas que requieren autenticación */}
          <Route
            element={
              <ProtectedRoute user={user} loading={loading} />
            }
          >
            <Route
              path="/editor"
              element={
                <PlaceholderPage
                  title="Editor de fuentes"
                  description="Aquí podrás diseñar tus propios glifos y crear tipografías."
                />
              }
            />

            <Route
              path="/proyectos"
              element={
                <PlaceholderPage
                  title="Mis proyectos"
                  description="Aquí administrarás las fuentes que estés diseñando."
                />
              }
            />

            <Route
              path="/perfil"
              element={
                <ProfilePage />
              }
            />

            <Route
              path="/compras"
              element={
                <PlaceholderPage
                  title="Mis compras"
                  description="Aquí encontrarás tus compras y licencias."
                />
              }
            />
          </Route>

          {/* Rutas que no existen */}
          <Route
            path="*"
            element={
              <PlaceholderPage
                title="Página no encontrada"
                description="La dirección que buscas no existe en FontHub."
              />
            }
          />
        </Routes>
      </div>

      <footer className="border-t-4 border-black bg-white px-5 py-5 text-center text-sm font-bold">
        FontHub — Plataforma de creación y distribución de fuentes
      </footer>
    </div>
  )
}

export default App
