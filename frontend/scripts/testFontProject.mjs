
import { createFontProject } from '../src/features/editor/models/createFontProject.js'

const project = createFontProject({
  familyName: 'FontHub Demo',
  styleName: 'Regular',
  author: 'FontHub',
})

console.log('Proyecto creado correctamente')
console.log('ID:', project.id)
console.log('Familia:', project.metadata.familyName)
console.log('Estilo:', project.metadata.styleName)
console.log('Unidades por em:', project.metrics.unitsPerEm)
console.log('Ascendente:', project.metrics.ascender)
console.log('Descendente:', project.metrics.descender)
console.log(
  'Caracteres iniciales:',
  Object.values(project.glyphs).map((glyph) => glyph.name)
)

// Comprobar que el proyecto puede serializarse como JSON
const serialized = JSON.stringify(project)
const restored = JSON.parse(serialized)

if (restored.id !== project.id) {
  throw new Error('El proyecto no se recuperó correctamente')
}

if (Object.keys(restored.glyphs).length !== 3) {
  throw new Error('El número de glifos no coincide')
}

console.log('Serialización JSON: correcta')
console.log('Prueba del modelo: satisfactoria')
