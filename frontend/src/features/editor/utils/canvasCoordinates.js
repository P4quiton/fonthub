
const BASELINE = 800

/**
 * Convierte una posición del puntero en coordenadas
 * tipográficas del proyecto.
 *
 * SVG:
 *   X aumenta hacia la derecha.
 *   Y aumenta hacia abajo.
 *
 * Tipografía:
 *   X aumenta hacia la derecha.
 *   Y aumenta hacia arriba desde la línea base.
 */
export function clientToFontCoordinates(
  svg,
  clientX,
  clientY,
) {
  if (!svg) {
    return null
  }

  const matrix = svg.getScreenCTM()

  if (!matrix) {
    return null
  }

  const point = new DOMPoint(clientX, clientY)
  const svgPoint = point.matrixTransform(matrix.inverse())

  // Evitar dibujar fuera del área del lienzo.
  if (
    svgPoint.x < 0 ||
    svgPoint.x > 1000 ||
    svgPoint.y < 0 ||
    svgPoint.y > 1000
  ) {
    return null
  }

  return {
    x: Math.round(svgPoint.x),
    y: Math.round(BASELINE - svgPoint.y),
  }
}

/**
 * Convierte coordenadas tipográficas a SVG.
 */
export function fontToSvgCoordinates(x, y) {
  return {
    x,
    y: BASELINE - y,
  }
}
