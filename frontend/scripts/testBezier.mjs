
import assert from 'node:assert/strict'
import { lineToQuadratic } from '../src/features/editor/utils/bezierUtils.js'

const contour = [
  { type: 'M', x: 100, y: 100 },
  { type: 'L', x: 500, y: 100 },
  { type: 'L', x: 500, y: 500 },
  { type: 'Z' },
]

const converted = lineToQuadratic(contour, 1)

assert.equal(converted[1].type, 'Q')
assert.equal(converted[1].x, 500)
assert.equal(converted[1].y, 100)

assert.equal(converted[1].x1, 300)
assert.equal(converted[1].y1, 180)

// El contorno original debe permanecer intacto.
assert.equal(contour[1].type, 'L')

// Los demás comandos no deben cambiar.
assert.deepEqual(converted[2], contour[2])
assert.deepEqual(converted[3], contour[3])

console.log('Prueba Bézier correcta')
console.log('Contorno original:', contour)
console.log('Contorno convertido:', converted)
