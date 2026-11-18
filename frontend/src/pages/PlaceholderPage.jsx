// frontend/src/pages/PlaceholderPage.jsx
import { Link } from 'react-router'
import { pressableStyles } from '../components/ui/pressableStyles'

function PlaceholderPage({ title, description }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12">
      <section className="rounded-2xl border-4 border-black bg-white p-8 text-center shadow-[6px_6px_0_#000] sm:p-12">
        <span className="inline-block rounded-lg border-2 border-black bg-yellow-300 px-4 py-2 text-sm font-black">
          EN DESARROLLO
        </span>

        <h1 className="mt-6 text-3xl font-black sm:text-5xl">
          {title}
        </h1>

        <p className="mx-auto mt-4 max-w-xl font-medium">
          {description}
        </p>

        <Link
          to="/"
          className={`${pressableStyles} mt-8 rounded-lg border-2 border-black bg-blue-500 px-6 py-3 font-bold text-white`}
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  )
}

export default PlaceholderPage
