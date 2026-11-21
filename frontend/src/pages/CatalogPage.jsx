import { useEffect, useState } from 'react'
import { getCatalog } from '../services/catalogService'
import Card from '../components/ui/Card'
import { Link } from 'react-router'

function CatalogPage() {
  const [fonts, setFonts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('') // El estado del buscador

  useEffect(() => {
    async function loadFonts() {
      setLoading(true)
      try {
        // Ahora le pasamos el término de búsqueda a la API
        const data = await getCatalog(searchTerm)
        setFonts(data)
      } catch (err) {
        setError('No se pudo cargar el catálogo.')
      } finally {
        setLoading(false)
      }
    }

    // El setTimeout evita buscar con cada tecla presionada (Debounce)
    const timeoutId = setTimeout(() => {
      loadFonts()
    }, 300)

    // Si el usuario vuelve a escribir antes de los 300ms, cancela la búsqueda anterior
    return () => clearTimeout(timeoutId)
  }, [searchTerm]) // Se ejecuta cuando searchTerm cambia

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12">
      
      {/* Encabezado y buscador */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-4xl font-black">Explorar Fuentes</h1>
        
        <input 
          type="text" 
          placeholder="Buscar por nombre..." 
          className="border-4 border-black p-3 rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-yellow-300 w-full md:w-80"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Contenido */}
      {loading ? (
        <p className="text-center font-bold">Cargando catálogo...</p>
      ) : error ? (
        <p className="text-center mt-10 text-red-600 font-bold">{error}</p>
      ) : fonts.length === 0 ? (
        <p className="font-medium text-lg">No se encontraron fuentes.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {fonts.map((font) => (
            <Link 
                to={`/catalogo/${font.id}`} 
                key={font.id} 
                className="block hover:-translate-y-1 hover:shadow-[6px_6px_0_#000] transition-all duration-200"
            >
                <Card>
                <h2 className="text-2xl font-black">{font.name}</h2>
                <p className="mt-2 text-sm font-bold text-gray-600">Por: {font.profiles?.name || 'Anónimo'}</p>
                <p className="mt-2">{font.description}</p>
                <div className="mt-4 flex justify-between items-center">
                    <span className="bg-yellow-300 px-3 py-1 font-bold border-2 border-black rounded">
                    {font.price > 0 ? `$${font.price}` : 'Gratis'}
                    </span>
                </div>
                </Card>
            </Link>
            ))}
        </div>
      )}
    </main>
  )
}

export default CatalogPage