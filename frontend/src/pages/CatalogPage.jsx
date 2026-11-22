import { useEffect, useState } from 'react'
import { getCatalog } from '../services/catalogService'
import Card from '../components/ui/Card'
import { Link } from 'react-router'
import { supabase } from '../services/supabaseClient'

function CatalogPage() {
  const [fonts, setFonts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Estados de los filtros
  const [searchTerm, setSearchTerm] = useState('') //términos de búsqueda
  const [category, setCategory] = useState('') //categoria seleccionada
  const [tagSearch, setTagSearch] = useState('')  //etiquetas
  const [categories, setCategories] = useState([])  //categorias
  const [availableTags, setAvailableTags] = useState([]) // Guarda las etiquetas de la BD
  const [showTagDropdown, setShowTagDropdown] = useState(false) // Controla si se ve el menú

  // EFFECT 1. EFECTO PARA CARGAR LAS CATEGORÍAS DE LA BASE DE DATOS
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('id, name')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])


  // EFTECT 2. EFECTO PARA CARGAR LOS TAGS DISPONIBLES HASTA EL MOMENTO
  useEffect(() => {
    async function fetchAvailableTags() {
      // Traemos las etiquetas de todas las fuentes publicadas
      const { data } = await supabase.from('fonts').select('tags').eq('status', 'published')
      if (data) {
        // Aplanamos el arreglo de arreglos y eliminamos duplicados con Set
        const allTags = data.flatMap(font => font.tags || [])
        const uniqueTags = [...new Set(allTags)]
        setAvailableTags(uniqueTags)
      }
    }
    fetchAvailableTags()
  }, [])


  // EFFECT 3. EFECTO PARA CARGAR LAS FUENTES
  useEffect(() => {
    // Bandera para evitar mostrar resultados de búsquedas antiguas (Race Condition)
    let ignore = false; 

    async function loadFonts() {
      setLoading(true)
      setError('') // (Esto ya te lo trajo el merge de tu compañero)
      
      try {
        // Convertimos "moderno, elegante" en un arreglo ['moderno', 'elegante']
        const tagsArray = tagSearch.split(',').map(t => t.trim()).filter(t => t !== '')
        
        // Pasamos los 4 parámetros: búsqueda, id (vacío), categoría y etiquetas
        const data = await getCatalog(searchTerm, '', category, tagsArray)

        // Solo actualizamos si esta es la búsqueda más reciente
        if (!ignore) {
          setFonts(data)
        }
      } catch {
        if (!ignore) {
          setError('No se pudo cargar el catálogo.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }
    

  // Bloque de setTimeout evita buscar con cada tecla presionada (Debounce)
    const timeoutId = setTimeout(() => {
      loadFonts()
    }, 300)

    // Si el usuario vuelve a escribir antes de los 300ms, cancela la búsqueda anterior
    return () => {
      ignore = true; // Le dice a la petición anterior que ya fue reemplazada
      clearTimeout(timeoutId)
    }
  }, [searchTerm, category, tagSearch]) // Se ejecuta cuando searchTerm cambia


  // Bloque de la función para agregar etiquetas al hacer clic
    const handleAddTag = (tagToAdd) => {
    // 1. Separamos lo que el usuario ya había escrito
    const currentTags = tagSearch.split(',').map(t => t.trim()).filter(t => t !== '')
    
    // 2. Si la etiqueta no está ya en la lista, la agregamos
    if (!currentTags.includes(tagToAdd)) {
      const newTagsString = currentTags.length > 0 
        ? `${currentTags.join(', ')}, ${tagToAdd}` 
        : tagToAdd
      setTagSearch(newTagsString)
    }
    
    // 3. Cerramos el menú desplegable
    setShowTagDropdown(false)
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12">
      
      {/* Encabezado y buscador */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-4xl font-black">Explorar Fuentes</h1>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Selector de Categoría Dinámico */}
          <select 
            className="border-4 border-black p-3 rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-yellow-300 w-full md:w-64"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* NUEVO: Input de Etiquetas con botón de Elegir */}
          <div className="relative w-full md:w-80">
            <div className="flex">
              <input 
                type="text" 
                placeholder="Etiquetas (ej. moderno)..." 
                className="border-4 border-black p-3 rounded-l-xl font-bold focus:outline-none focus:ring-4 focus:ring-yellow-300 w-full border-r-0"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowTagDropdown(!showTagDropdown)}
                className="bg-gray-200 border-4 border-black px-4 font-bold rounded-r-xl hover:bg-gray-300 transition-colors"
              >
                Elegir
              </button>
            </div>

            {/* Menú desplegable de etiquetas */}
            {showTagDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-white border-4 border-black rounded-xl shadow-[4px_4px_0_#000] max-h-60 overflow-y-auto">
                {availableTags.length === 0 ? (
                  <p className="p-3 text-sm text-gray-500 font-bold">No hay etiquetas aún</p>
                ) : (
                  availableTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      className="block w-full text-left px-4 py-2 font-bold hover:bg-yellow-300 transition-colors border-b-2 border-gray-200 last:border-b-0"
                    >
                      {tag}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Input de búsqueda por nombre */}
          <input 
            type="text" 
            placeholder="Buscar por nombre..." 
            className="border-4 border-black p-3 rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-yellow-300 w-full md:flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
                  
                  {/* Mostramos las etiquetas si es que tiene */}
                  {font.tags && font.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {font.tags.map(tag => (
                        <span key={tag} className="text-xs font-bold bg-gray-200 border border-black px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

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