import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../services/supabaseClient'
import Card from '../components/ui/Card'
import JSZip from 'jszip'

function PublishFontPage() {
  const navigate = useNavigate()
  const [licenses, setLicenses] = useState([])
  const [formData, setFormData] = useState({
    name: '', description: '', category_id: '', price: 0, license_id: '', tags: ''
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])


  // Cargar las licencias de la base de datos para el menú desplegable
  useEffect(() => {
    async function fetchLicenses() {

      //Licencias
      const { data } = await supabase.from('licenses').select('id, name')
      if (data && data.length > 0) {
        setLicenses(data)
        setFormData(prev => ({ ...prev, license_id: data[0].id }))
      }

      // Categorías
      const { data: catData } = await supabase.from('categories').select('id, name')
      if (catData && catData.length > 0) {
        setCategories(catData)
        setFormData(prev => ({ ...prev, category_id: catData[0].id }))
      }
    }
    fetchLicenses()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return setError('Por favor, sube un archivo tipográfico (TTF/OTF) o un ZIP.')

    setLoading(true)
    setError('')

    try {
       // --- VALIDACIÓN DE ARCHIVO ---
       const fileNameLower = file.name.toLowerCase()

        
      if (fileNameLower.endsWith('.zip')) {
        // Si es un ZIP, lo leemos en memoria para revisar su contenido
        const zip = await JSZip.loadAsync(file)
        const filesInZip = Object.keys(zip.files)
        
        // Verificamos si al menos uno termina en .ttf o .otf
        const hasFont = filesInZip.some(name => name.toLowerCase().endsWith('.ttf') || name.toLowerCase().endsWith('.otf'))
        
        if (!hasFont) {
          throw new Error('El archivo ZIP debe contener al menos un archivo de fuente (.ttf o .otf).')
        }
      } else if (!fileNameLower.endsWith('.ttf') && !fileNameLower.endsWith('.otf')) {
        // Si no es ZIP ni TTF/OTF, lo rechazamos
        throw new Error('Formato no válido. Sube un archivo .ttf, .otf o .zip.')
      }
      // --- FIN DE VALIDACIÓN DEL ARCHIVO


      // 1. Subir el archivo a Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('font-files')
        .upload(fileName, file)

      if (uploadError) throw new Error('Error al subir el archivo: ' + uploadError.message)

      // 2. Enviar los metadatos a la Edge Function
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fonts-api`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          file_url: fileName, // Guardamos solo el nombre del archivo
          tags: formData.tags.split(',').map(t => t.trim()) // Convertir a array
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al publicar')
      }

      // 3. Redirigir al catálogo si todo sale bien
      navigate('/catalogo')

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-12">
      <Card className="p-8">
        <h1 className="text-3xl font-black mb-6">Publicar Nueva Fuente</h1>

        {error && <p className="bg-red-200 text-red-800 font-bold p-3 rounded mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 font-bold">
          <div>
            <label className="block mb-1">Nombre de la fuente</label>
            <input required type="text" className="w-full border-2 border-black p-2 rounded"
              onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>

          <div>
            <label className="block mb-1">Descripción</label>
            <textarea className="w-full border-2 border-black p-2 rounded" rows="3"
              onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Categoría</label>
              <select className="w-full border-2 border-black p-2 rounded"
                onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Precio (0 para gratis)</label>
              <input type="number" min="0" step="0.01" required className="w-full border-2 border-black p-2 rounded"
                value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
            </div>
          </div>

          <div>
            <label className="block mb-1">Licencia</label>
            <select className="w-full border-2 border-black p-2 rounded" required
              onChange={e => setFormData({ ...formData, license_id: e.target.value })}>
              {licenses.map(lic => (
                <option key={lic.id} value={lic.id}>{lic.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Etiquetas (separadas por coma)</label>
            <input type="text" placeholder="e.g. elegante, moderna, titulos" className="w-full border-2 border-black p-2 rounded"
              onChange={e => setFormData({ ...formData, tags: e.target.value })} />
          </div>

          <div>
            <label className="block mb-1">Archivo de la fuente (.ttf, .otf o.zip que lo contenga)</label>
            <input 
              required 
              type="file" 
              accept=".ttf,.otf,.zip" // <-- Agregamos .zip
              className={`w-full border-2 border-black p-2 rounded file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-2 file:border-black file:bg-gray-200 file:text-black file:font-bold hover:file:bg-gray-300 cursor-pointer ${
                file ? 'text-black' : 'text-gray-500'
              }`}
              onChange={e => setFile(e.target.files[0])} 
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-green-500 text-white font-black py-3 rounded-lg border-4 border-black shadow-[4px_4px_0_#000] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 mt-4">
            {loading ? 'Publicando...' : 'Publicar Fuente'}
          </button>
        </form>
      </Card>
    </main>
  )
}

export default PublishFontPage