
import assert from 'node:assert/strict'
import { moveContourNode } from '../src/features/editor/utils/moveContourNode.js'

const contours = [[
  { type: 'M', x: 100, y: 100 },
  { type: 'Q', x1: 200, y1: 600, x: 300, y: 600 },
  { type: 'Q', x1: 500, y1: 300, x: 500, y: 100 },
  { type: 'Q', x1: 300, y1: 50, x: 100, y: 100 },
  { type: 'Z' },
]]

// Mover el primer nodo.
const moved = moveContourNode(
  contours, 0, 0, 150, 150, 'anchor',
)

// El primer punto y el cierre deben coincidir.
assert.equal(moved[0][0].x, 150)
assert.equal(moved[0][0].y, 150)
assert.equal(moved[0][3].x, 150)
assert.equal(moved[0][3].y, 150)

// No deben agregarse comandos.
assert.equal(moved[0].length, 5)

// El contorno original no debe cambiar.
assert.equal(contours[0][0].x, 100)

// Mover el extremo de cierre también debe mover M.
const movedClosing = moveContourNode(
  contours, 0, 3, 180, 190, 'anchor',
)

assert.equal(movedClosing[0][0].x, 180)
assert.equal(movedClosing[0][0].y, 190)

// El punto de control debe permanecer independiente.
const movedControl = moveContourNode(
  contours, 0, 3, 350, 80, 'control',
)

assert.equal(movedControl[0][3].x1, 350)
assert.equal(movedControl[0][3].y1, 80)
assert.equal(movedControl[0][0].x, 100)

console.log('Sincronización de cierre correcta')
console.log('No se generan vértices adicionales')
