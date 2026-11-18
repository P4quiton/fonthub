// frontend/src/pages/LoginPage.jsx
import { Navigate, useLocation } from 'react-router'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

function LoginPage({ user, loading, onGoogleLogin, error }) {
  const location = useLocation()
  const destination = location.state?.from || '/'

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <p className="font-bold">Comprobando sesión...</p>
      </main>
    )
  }

  if (user) {
    return <Navigate to={destination} replace />
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-5 py-12">
      <div className="w-full max-w-lg">
        <Card className="text-center">
          <h1 className="text-4xl font-black">Iniciar sesión</h1>

          <p className="mt-4 font-medium">
            Accede a FontHub para crear fuentes y administrar tus proyectos.
          </p>

          <div className="mt-8">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => onGoogleLogin(destination)}
            >
              Continuar con Google
            </Button>
          </div>

          {error && (
            <p role="alert" className="mt-5 font-bold text-red-700">
              {error}
            </p>
          )}
        </Card>
      </div>
    </main>
  )
}

export default LoginPage
