
import opentype from 'opentype.js'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { createFontProject } from '../src/features/editor/models/createFontProject.js'
import { projectToOpenType } from '../src/features/editor/utils/projectToOpenType.js'

// Crear un proyecto editable
const project = createFontProject({
  familyName: 'FontHub Project Demo',
  styleName: 'Regular',
  author: 'FontHub',
})

// Agregar contorno de la letra A
project.glyphs['65'].contours = [
  [
    { type: 'M', x: 50, y: 0 },
    { type: 'L', x: 280, y: 700 },
    { type: 'L', x: 420, y: 700 },
    { type: 'L', x: 650, y: 0 },
    { type: 'L', x: 500, y: 0 },
    { type: 'L', x: 350, y: 480 },
    { type: 'L', x: 200, y: 0 },
    { type: 'Z' },
  ],
]

// Agregar contorno de la letra B
project.glyphs['66'].contours = [
  [
    { type: 'M', x: 100, y: 0 },
    { type: 'L', x: 100, y: 700 },
    { type: 'L', x: 420, y: 700 },
    { type: 'Q', x1: 650, y1: 650, x: 500, y: 350 },
    { type: 'Q', x1: 680, y1: 100, x: 420, y: 0 },
    { type: 'Z' },
  ],
]

// Simular el guardado y recuperación en JSON
const savedProject = JSON.stringify(project)
const restoredProject = JSON.parse(savedProject)

// Convertir proyecto a fuente OpenType
const font = projectToOpenType(restoredProject)
const buffer = font.toArrayBuffer()

const directory = join('dist', 'font-tests')
const filename = join(directory, 'FontHub-Project-Demo.otf')

await mkdir(directory, { recursive: true })
await writeFile(filename, Buffer.from(buffer))

// Verificar el archivo generado
const parsed = opentype.parse(buffer)

if (parsed.glyphs.length !== 4) {
  throw new Error('La fuente no contiene los glifos esperados')
}

for (const character of ['A', 'B', ' ']) {
  if (parsed.charToGlyph(character).name === '.notdef') {
    throw new Error(`Falta el carácter ${JSON.stringify(character)}`)
  }
}

console.log('Proyecto:', restoredProject.metadata.familyName)
console.log('Glifos:', parsed.glyphs.length)
console.log('Archivo:', filename)
console.log('Exportación desde JSON: correcta')
