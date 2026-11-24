
/**
 * Convierte un segmento recto de un contorno
 * en una curva Bézier cuadrática.
 *
 * No modifica el contorno original.
 */

export function lineToQuadratic(contour, commandIndex) {
  const command = contour?.[commandIndex]
  const previous = contour?.[commandIndex - 1]

  if (!command || command.type !== 'L') {
    return contour
  }

  if (!previous || !['M', 'L', 'Q', 'C'].includes(previous.type)) {
    return contour
  }

  const startX = previous.x
  const startY = previous.y

  const endX = command.x
  const endY = command.y

  // Punto medio del segmento.
  const middleX = (startX + endX) / 2
  const middleY = (startY + endY) / 2

  // Vector perpendicular normalizado.
  const dx = endX - startX
  const dy = endY - startY
  const length = Math.hypot(dx, dy)

  if (length === 0) {
    return contour
  }

  // Desplazamiento inicial para que la curva sea visible.
  const bend = Math.min(80, length / 4)

  const controlX = Math.round(
    middleX - (dy / length) * bend,
  )

  const controlY = Math.round(
    middleY + (dx / length) * bend,
  )

  return contour.map((item, index) => {
    if (index !== commandIndex) {
      return item
    }

    return {
      type: 'Q',
      x1: controlX,
      y1: controlY,
      x: endX,
      y: endY,
    }
  })
}


/**
 * Convierte el segmento de cierre de un contorno
 * en una curva Bézier cuadrática.
 *
 * Conserva el comando Z para mantener la figura cerrada.
 */
export function closeToQuadratic(contour) {
  if (!Array.isArray(contour) || contour.length < 4) {
    return contour
  }

  const first = contour[0]
  const last = contour[contour.length - 1]
  const previous = contour[contour.length - 2]

  // Debe tratarse de un contorno cerrado.
  if (first?.type !== 'M' || last?.type !== 'Z') {
    return contour
  }

  if (
    !previous ||
    !['M', 'L', 'Q', 'C'].includes(previous.type)
  ) {
    return contour
  }

  // Si el último segmento ya termina en el primer
  // punto, no creamos otra curva de cierre.
  if (previous.x === first.x && previous.y === first.y) {
    return contour
  }

  // Reutilizamos la conversión que ya probamos.
  const temporary = [
    previous,
    {
      type: 'L',
      x: first.x,
      y: first.y,
    },
  ]

  const converted = lineToQuadratic(temporary, 1)

  if (converted === temporary) {
    return contour
  }

  const closingCurve = converted[1]

  return [
    ...contour.slice(0, -1),
    closingCurve,
    { type: 'Z' },
  ]
}