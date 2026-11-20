import { useEffect, useState } from 'react'
import { getCatalog } from '../services/catalogService'
import Card from '../components/ui/Card'

function CatalogPage() {
  const [fonts, setFonts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadFonts() {
      try {
        const data = await getCatalog()
        setFonts(data)
      } catch (err) {
        setError('No se pudo cargar el catálogo.')
      } finally {
        setLoading(false)
      }
    }
    loadFonts()
  }, [])

  if (loading) return <p className="text-center mt-10 font-bold">Cargando catálogo...</p>
  if (error) return <p className="text-center mt-10 text-red-600 font-bold">{error}</p>

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12">
      <h1 className="text-4xl font-black mb-8">Explorar Fuentes</h1>
      
      {fonts.length === 0 ? (
        <p className="font-medium text-lg">Aún no hay fuentes publicadas.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {fonts.map((font) => (
            <Card key={font.id}>
              <h2 className="text-2xl font-black">{font.name}</h2>
              <p className="mt-2 text-sm font-bold text-gray-600">Por: {font.profiles?.name || 'Anónimo'}</p>
              <p className="mt-2">{font.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="bg-yellow-300 px-3 py-1 font-bold border-2 border-black rounded">
                  {font.price > 0 ? `$${font.price}` : 'Gratis'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}

export default CatalogPage