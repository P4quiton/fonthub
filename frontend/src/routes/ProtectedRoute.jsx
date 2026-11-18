// frontend/src/routes/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router'

function ProtectedRoute({ user, loading }) {
  const location = useLocation()

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-5">
        <p className="font-bold">Comprobando sesión...</p>
      </main>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <Outlet />
}

export default ProtectedRoute
