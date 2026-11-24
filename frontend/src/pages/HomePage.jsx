
import { Link } from 'react-router'
import { pressableStyles } from '../components/ui/pressableStyles'

const features = [
  {
    title: 'Diseña',
    description:
      'Crea tus propios glifos y desarrolla nuevas tipografías.',
    color: 'bg-pink-200',
  },
  {
    title: 'Organiza',
    description:
      'Guarda y administra tus proyectos de fuentes.',
    color: 'bg-purple-200',
  },
  {
    title: 'Comparte',
    description:
      'Publica tus creaciones y descubre fuentes de la comunidad.',
    color: 'bg-green-200',
  },
]

function HomePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12 sm:py-20">
      {/* Presentación principal */}
      <section className="rounded-2xl border-4 border-black bg-white p-6 shadow-[8px_8px_0_#000] sm:p-10">
        <span className="inline-block rounded-lg border-2 border-black bg-yellow-300 px-4 py-2 text-sm font-black">
          BIENVENIDO A FONTHUB
        </span>

        <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">
          Crea, comparte y descubre tipografías.
        </h1>

        <p className="mt-5 max-w-2xl text-lg font-medium">
          Diseña tus propias fuentes, administra tus proyectos
          tipográficos y explora las creaciones de otros usuarios.
        </p>

        {/* Acciones principales */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/editor"
            className={`${pressableStyles} rounded-xl border-2 border-black bg-blue-500 px-6 py-3 font-black text-white`}
          >
            Crear una fuente
          </Link>

          <Link
            to="/catalogo"
            className={`${pressableStyles} rounded-xl border-2 border-black bg-yellow-300 px-6 py-3 font-black text-black`}
          >
            Explorar fuentes
          </Link>

          {/* Botón "Publicar" */}
          <Link
            to="/publicar"
            className={`${pressableStyles} rounded-xl border-2 border-black bg-green-400 px-6 py-3 font-black text-black`}
          >
            Publicar mi fuente
          </Link>

        </div>
      </section>

      {/* Características de FontHub */}
      <section className="mt-12 grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className={`rounded-xl border-4 border-black p-6 shadow-[5px_5px_0_#000] ${feature.color}`}
          >
            <h2 className="text-2xl font-black">
              {feature.title}
            </h2>

            <p className="mt-3 font-medium">
              {feature.description}
            </p>
          </article>
        ))}
      </section>
    </main>
  )
}

export default HomePage
