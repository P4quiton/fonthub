
import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { pressableStyles } from '../ui/pressableStyles'

const navigation = [
  { label: 'Inicio', to: '/' },
  { label: 'Explorar fuentes', to: '/catalogo' },
  { label: 'Crear fuente', to: '/editor' },
  { label: 'Mis proyectos', to: '/proyectos' },
]

function Header({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
      isActive
        ? 'bg-yellow-300 text-black'
        : 'hover:bg-yellow-100'
    }`

  function closeMenu() {
    setMenuOpen(false)
  }

  function handleMobileLogout() {
    closeMenu()
    onLogout()
  }

  return (
    <header className="border-b-4 border-black bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link
          to="/"
          className="text-2xl font-black tracking-tight"
          onClick={closeMenu}
        >
          FontHub
        </Link>

        {/* Navegación de escritorio */}
        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-2 md:flex"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Acciones de escritorio */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                to="/perfil"
                className="rounded-lg px-3 py-2 text-sm font-bold hover:bg-yellow-100"
              >
                Mi perfil
              </Link>

              <button
                type="button"
                onClick={onLogout}
                className={`${pressableStyles} rounded-lg border-2 border-black bg-red-300 px-4 py-2 text-sm font-bold`}
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={`${pressableStyles} rounded-lg border-2 border-black bg-blue-500 px-4 py-2 text-sm font-bold text-white`}
            >
              Iniciar sesión
            </Link>
          )}
        </div>

        {/* Botón de menú móvil */}
        <button
          type="button"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
          className={`${pressableStyles} rounded-lg border-2 border-black bg-yellow-300 px-4 py-2 font-bold md:hidden`}
        >
          {menuOpen ? 'Cerrar' : 'Menú'}
        </button>
      </div>

      {/* Navegación móvil */}
      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Navegación móvil"
          className="space-y-3 border-t-2 border-black px-5 py-4 md:hidden"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block ${linkClass({ isActive })}`
              }
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}

          {user ? (
            <>
              <NavLink
                to="/perfil"
                className="block rounded-lg px-3 py-2 text-sm font-bold hover:bg-yellow-100"
                onClick={closeMenu}
              >
                Mi perfil
              </NavLink>

              <button
                type="button"
                onClick={handleMobileLogout}
                className={`${pressableStyles} w-full rounded-lg border-2 border-black bg-red-300 px-4 py-3 text-sm font-bold`}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className={`${pressableStyles} w-full rounded-lg border-2 border-black bg-blue-500 px-4 py-3 text-sm font-bold text-white`}
              onClick={closeMenu}
            >
              Iniciar sesión
            </NavLink>
          )}
        </nav>
      )}
    </header>
  )
}

export default Header
