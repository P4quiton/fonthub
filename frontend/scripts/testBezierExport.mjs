
import assert from 'node:assert/strict'
import opentype from 'opentype.js'

import { createFontProject } from '../src/features/editor/models/createFontProject.js'
import { projectToOpenType } from '../src/features/editor/utils/projectToOpenType.js'

// Crear un proyecto de prueba.
const project = createFontProject({
  familyName: 'FontHub Bezier Test',
  styleName: 'Regular',
})

// Crear un contorno con dos curvas cuadráticas.
const originalContour = [
  { type: 'M', x: 100, y: 100 },
  { type: 'Q', x1: 300, y1: 700, x: 500, y: 100 },
  { type: 'Q', x1: 300, y1: -100, x: 100, y: 100 },
  { type: 'Z' },
]

project.glyphs['65'].contours = [originalContour]

// Generar la fuente OTF.
const font = projectToOpenType(project)
const buffer = font.toArrayBuffer()

// Volver a leer el archivo generado.
const parsedFont = opentype.parse(buffer)
const glyph = parsedFont.charToGlyph('A')

// Confirmar que el carácter corresponde a A.
assert.equal(glyph.unicode, 65)

// Obtener los comandos recuperados del OTF.
const commands = glyph.path.commands

assert.equal(commands[0].type, 'M')
assert.equal(commands.at(-1).type, 'Z')

// En OTF/CFF, las curvas Q se convierten en C.
const curves = commands.filter(
  (command) => command.type === 'C',
)

assert.equal(curves.length, 2)

// Comparar coordenadas con tolerancia de redondeo.
function assertNear(actual, expected, tolerance = 1) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Se esperaba aproximadamente ${expected}, pero se obtuvo ${actual}`,
  )
}

/**
 * Convierte una curva cuadrática a sus puntos de
 * control cúbicos equivalentes.
 */
function quadraticToCubic(start, quadratic) {
  return {
    x1: start.x + (2 / 3) * (quadratic.x1 - start.x),
    y1: start.y + (2 / 3) * (quadratic.y1 - start.y),
    x2: quadratic.x + (2 / 3) * (quadratic.x1 - quadratic.x),
    y2: quadratic.y + (2 / 3) * (quadratic.y1 - quadratic.y),
    x: quadratic.x,
    y: quadratic.y,
  }
}

// Comprobar cada curva del contorno.
let previousPoint = originalContour[0]
let curveIndex = 0

for (const command of originalContour) {
  if (command.type !== 'Q') {
    if (command.type === 'M' || command.type === 'L') {
      previousPoint = command
    }

    continue
  }

  const expected = quadraticToCubic(
    previousPoint,
    command,
  )

  const actual = curves[curveIndex]

  for (const coordinate of [
    'x1',
    'y1',
    'x2',
    'y2',
    'x',
    'y',
  ]) {
    assertNear(
      actual[coordinate],
      expected[coordinate],
    )
  }

  previousPoint = command
  curveIndex++
}

// Verificar que el contorno sigue cerrado.
assert.equal(commands.at(-1).type, 'Z')

// Verificar que los extremos coinciden.
assertNear(curves.at(-1).x, commands[0].x)
assertNear(curves.at(-1).y, commands[0].y)

// Comprobar que se conservaron los glifos.
assert.equal(parsedFont.glyphs.length, 4)

console.log('Exportación Bézier correcta')
console.log('Glifo:', glyph.name)
console.log('Curvas cuadráticas originales: 2')
console.log('Curvas cúbicas recuperadas:', curves.length)
console.log('Geometría conservada: correcta')
console.log('Contorno cerrado: correcto')
console.log('Glifos:', parsedFont.glyphs.length)
