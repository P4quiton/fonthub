import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import { getCatalog } from '../services/catalogService'
import Card from '../components/ui/Card'

function FontDetailPage() {
  const { id } = useParams() // Obtiene el ID de la URL
  const [font, setFont] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadFont() {
      try {
        // Reutilizamos el servicio, pero ahora le pasamos el ID
        const data = await getCatalog('', id)
        if (data.length > 0) {
          setFont(data[0])
        } else {
          setError('Fuente no encontrada.')
        }
      } catch {
        setError('Error al cargar la fuente.')
      } finally {
        setLoading(false)
      }
    }
    loadFont()
  }, [id])

  if (loading) return <p className="text-center mt-10 font-bold">Cargando fuente...</p>
  if (error) return <p className="text-center mt-10 text-red-600 font-bold">{error}</p>
  if (!font) return null

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-12">
      <Link to="/catalogo" className="font-bold text-blue-600 hover:underline mb-6 inline-block">
        ← Volver al catálogo
      </Link>

      <Card className="p-8">
        <h1 className="text-5xl font-black mb-2">{font.name}</h1>
        <p className="text-lg font-bold text-gray-600 mb-6">Diseñada por: {font.profiles?.name}</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Columna Izquierda: Info */}
          <div>
            <h2 className="text-2xl font-bold mb-2">Descripción</h2>
            <p className="mb-6">{font.description}</p>

            <h2 className="text-2xl font-bold mb-2">Categoría</h2>
            <p className="mb-6 inline-block bg-purple-200 border-2 border-black px-3 py-1 font-bold rounded">{font.category}</p>

            <h2 className="text-2xl font-bold mb-2">Licencia</h2>
            <p className="mb-2"><strong>{font.licenses?.name}</strong></p>
            <p className="text-sm">{font.licenses?.description}</p>
          </div>

          {/* Columna Derecha: Compra/Descarga */}
          <div className="bg-gray-100 border-4 border-black p-6 rounded-xl flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-4">Obtener esta fuente</h2>
              <p className="text-4xl font-black mb-4">{font.price > 0 ? `$${font.price}` : 'Gratis'}</p>
            </div>
            <button className="w-full bg-blue-500 text-white font-black py-3 rounded-lg border-4 border-black shadow-[4px_4px_0_#000] hover:translate-y-1 hover:shadow-none transition-all">
              {font.price > 0 ? 'Comprar fuente' : 'Descargar gratis'}
            </button>
          </div>
        </div>
      </Card>
    </main>
  )
}

export default FontDetailPage