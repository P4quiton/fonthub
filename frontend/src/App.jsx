import { useState } from 'react'
import Button from './components/ui/Button'
import Card from './components/ui/Card'
import Input from './components/ui/Input'

function App() {
  const [search, setSearch] = useState('')

  return (
    <main className="min-h-screen px-5 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">

        <header className="mb-10 text-center">
          <h1 className="text-4xl font-black sm:text-5xl lg:text-6xl">
            FontHub
          </h1>

          <p className="mt-4 text-base font-medium sm:text-lg">
            Crea, comparte y descubre tipografías.
          </p>
        </header>

        <div className="mx-auto mb-10 max-w-xl">
          <Input
            id="font-search"
            label="Buscar tipografías"
            placeholder="Escribe el nombre de una fuente..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">

          <Card>
            <div className="mb-5 flex min-h-28 items-center justify-center rounded-lg bg-yellow-200">
              <span className="text-5xl font-black">Aa</span>
            </div>

            <h2 className="text-xl font-black">Crea tu fuente</h2>

            <p className="my-4 text-sm">
              Diseña tus propios caracteres utilizando
              nuestro editor tipográfico.
            </p>

            <Button className="w-full">
              Crear proyecto
            </Button>
          </Card>

          <Card>
            <div className="mb-5 flex min-h-28 items-center justify-center rounded-lg bg-blue-200">
              <span className="text-5xl font-black">Bb</span>
            </div>

            <h2 className="text-xl font-black">Explora fuentes</h2>

            <p className="my-4 text-sm">
              Descubre tipografías creadas por diseñadores
              y empresas.
            </p>

            <Button variant="secondary" className="w-full">
              Ver catálogo
            </Button>
          </Card>

          <Card>
            <div className="mb-5 flex min-h-28 items-center justify-center rounded-lg bg-red-200">
              <span className="text-5xl font-black">Cc</span>
            </div>

            <h2 className="text-xl font-black">Mis proyectos</h2>

            <p className="my-4 text-sm">
              Organiza tus diseños y continúa trabajando
              en tus tipografías.
            </p>

            <Button variant="accent" className="w-full">
              Mis proyectos
            </Button>
          </Card>

        </div>

      </div>
    </main>
  )
}

export default App