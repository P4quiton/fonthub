
import opentype from 'opentype.js'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

// Prueba del motor tipográfico de FontHub
const OUTPUT_DIRECTORY = join('dist', 'font-tests')
const OUTPUT_FILE = join(
  OUTPUT_DIRECTORY,
  'FontHub-Test.otf'
)

// Glifo obligatorio para caracteres no disponibles
const notdefPath = new opentype.Path()
notdefPath.moveTo(80, 0)
notdefPath.lineTo(520, 0)
notdefPath.lineTo(520, 700)
notdefPath.lineTo(80, 700)
notdefPath.close()

const notdefGlyph = new opentype.Glyph({
  name: '.notdef',
  advanceWidth: 600,
  path: notdefPath,
})

// Espacio: sin contornos, pero con ancho
const spaceGlyph = new opentype.Glyph({
  name: 'space',
  unicode: 32,
  advanceWidth: 300,
  path: new opentype.Path(),
})

// Letra A: contorno vectorial de prueba
const pathA = new opentype.Path()

pathA.moveTo(50, 0)
pathA.lineTo(260, 700)
pathA.lineTo(440, 700)
pathA.lineTo(650, 0)
pathA.lineTo(500, 0)
pathA.lineTo(440, 200)
pathA.lineTo(260, 200)
pathA.lineTo(200, 0)
pathA.close()

const glyphA = new opentype.Glyph({
  name: 'A',
  unicode: 65,
  advanceWidth: 700,
  path: pathA,
})

// Letra B: contorno vectorial de prueba
const pathB = new opentype.Path()

pathB.moveTo(100, 0)
pathB.lineTo(100, 700)
pathB.lineTo(430, 700)
pathB.lineTo(580, 550)
pathB.lineTo(580, 380)
pathB.lineTo(470, 340)
pathB.lineTo(600, 270)
pathB.lineTo(600, 120)
pathB.lineTo(470, 0)
pathB.close()

const glyphB = new opentype.Glyph({
  name: 'B',
  unicode: 66,
  advanceWidth: 700,
  path: pathB,
})

// Construcción de la fuente
const font = new opentype.Font({
  familyName: 'FontHub Test',
  styleName: 'Regular',
  unitsPerEm: 1000,
  ascender: 800,
  descender: -200,
  glyphs: [
    notdefGlyph,
    spaceGlyph,
    glyphA,
    glyphB,
  ],
})

// Generación del archivo
await mkdir(OUTPUT_DIRECTORY, { recursive: true })

const fontBuffer = font.toArrayBuffer()

await writeFile(
  OUTPUT_FILE,
  Buffer.from(fontBuffer)
)

// Leer nuevamente el archivo generado
const parsedFont = opentype.parse(fontBuffer)

console.log('Fuente generada correctamente')
console.log('Archivo:', OUTPUT_FILE)
console.log('Familia:', parsedFont.names.windows.fontFamily.en)
console.log('Glifos:', parsedFont.glyphs.length)
console.log('Unidades por em:', parsedFont.unitsPerEm)

for (const character of ['A', 'B', ' ']) {
  const glyph = parsedFont.charToGlyph(character)

  if (glyph.name === '.notdef') {
    throw new Error(
      `El carácter ${JSON.stringify(character)} no existe`
    )
  }

  console.log(
    `Carácter ${JSON.stringify(character)}:`,
    glyph.name,
    `| ancho: ${glyph.advanceWidth}`
  )
}

console.log('Prueba de lectura: correcta')
