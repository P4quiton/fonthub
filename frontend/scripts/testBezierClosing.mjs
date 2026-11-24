
import assert from 'node:assert/strict'

import {
  closeToQuadratic,
  lineToQuadratic,
} from '../src/features/editor/utils/bezierUtils.js'

const triangle = [
  { type: 'M', x: 100, y: 100 },
  { type: 'L', x: 300, y: 600 },
  { type: 'L', x: 500, y: 100 },
  { type: 'Z' },
]

// Convertir sus dos lados explícitos.
let result = lineToQuadratic(triangle, 1)
result = lineToQuadratic(result, 2)

// Convertir también el lado de cierre.
result = closeToQuadratic(result)

// Los tres lados deben ser curvas.
assert.equal(
  result.filter((command) => command.type === 'Q').length,
  3,
)

// La figura debe conservar su cierre.
assert.equal(result.at(-1).type, 'Z')

// La curva final termina en el punto inicial.
assert.equal(result.at(-2).x, result[0].x)
assert.equal(result.at(-2).y, result[0].y)

// El contorno original no debe modificarse.
assert.equal(triangle.length, 4)
assert.equal(triangle.at(-1).type, 'Z')

// No duplicar el cierre si ya existe.
assert.equal(closeToQuadratic(result), result)

// Verificar también un cuadrado.
const square = [
  { type: 'M', x: 100, y: 100 },
  { type: 'L', x: 100, y: 500 },
  { type: 'L', x: 500, y: 500 },
  { type: 'L', x: 500, y: 100 },
  { type: 'Z' },
]

let curvedSquare = square

for (let index = 1; index <= 3; index++) {
  curvedSquare = lineToQuadratic(curvedSquare, index)
}

curvedSquare = closeToQuadratic(curvedSquare)

assert.equal(
  curvedSquare.filter((command) => command.type === 'Q').length,
  4,
)

console.log('Prueba de cierre Bézier correcta')
console.log('Triángulo: 3 lados curvos')
console.log('Cuadrado: 4 lados curvos')
