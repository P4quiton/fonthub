
/**
 * Mueve un nodo de un contorno sin modificar
 * directamente los datos originales.
 *
 * Si la última curva Q termina en el primer
 * nodo M, ambos extremos se mueven juntos.
 */
export function moveContourNode(
  contours,
  contourIndex,
  commandIndex,
  x,
  y,
  pointType = 'anchor',
) {
  const contour = contours[contourIndex]
  const command = contour?.[commandIndex]

  if (!command) return contours

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return contours
  }

  const isControl = pointType === 'control'

  if (isControl && command.type !== 'Q') {
    return contours
  }

  if (
    !isControl &&
    !['M', 'L', 'Q', 'C'].includes(command.type)
  ) {
    return contours
  }

  const xKey = isControl ? 'x1' : 'x'
  const yKey = isControl ? 'y1' : 'y'

  if (command[xKey] === x && command[yKey] === y) {
    return contours
  }

  const first = contour[0]
  const closingIndex = contour.length - 2
  const closingCommand = contour[closingIndex]

  // Detectar una curva de cierre cuyo extremo
  // coincide con el punto inicial.
  const hasLinkedClosingCurve =
    first?.type === 'M' &&
    contour.at(-1)?.type === 'Z' &&
    closingCommand?.type === 'Q' &&
    closingCommand.x === first.x &&
    closingCommand.y === first.y

  // El nodo inicial y el extremo de cierre
  // representan un mismo vértice lógico.
  const moveLinkedEndpoints =
    !isControl &&
    hasLinkedClosingCurve &&
    (
      commandIndex === 0 ||
      commandIndex === closingIndex
    )

  return contours.map((currentContour, index) => {
    if (index !== contourIndex) return currentContour

    return currentContour.map((currentCommand, indexCommand) => {
      if (indexCommand === commandIndex) {
        return {
          ...currentCommand,
          [xKey]: x,
          [yKey]: y,
        }
      }

      if (
        moveLinkedEndpoints &&
        (
          indexCommand === 0 ||
          indexCommand === closingIndex
        )
      ) {
        return {
          ...currentCommand,
          x,
          y,
        }
      }

      return currentCommand
    })
  })
}
