
import opentype from 'opentype.js'

function buildPath(contours = []) {
  const path = new opentype.Path()

  for (const contour of contours) {
    for (const command of contour) {
      switch (command.type) {
        case 'M':
          path.moveTo(command.x, command.y)
          break

        case 'L':
          path.lineTo(command.x, command.y)
          break

        case 'Q':
          path.quadTo(
            command.x1,
            command.y1,
            command.x,
            command.y
          )
          break

        case 'C':
          path.curveTo(
            command.x1,
            command.y1,
            command.x2,
            command.y2,
            command.x,
            command.y
          )
          break

        case 'Z':
          path.close()
          break

        default:
          throw new Error(
            `Comando vectorial desconocido: ${command.type}`
          )
      }
    }
  }

  return path
}

export function projectToOpenType(project) {
  if (!project?.metadata || !project?.metrics || !project?.glyphs) {
    throw new Error('El proyecto tipográfico no es válido')
  }

  const { metadata, metrics } = project

  if (!metadata.familyName?.trim()) {
    throw new Error('La fuente necesita un nombre')
  }

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

  const glyphs = [notdefGlyph]

  const orderedGlyphs = Object.values(project.glyphs)
    .sort((a, b) => a.unicode - b.unicode)

  for (const glyphData of orderedGlyphs) {
    if (
      !Number.isInteger(glyphData.unicode) ||
      !Number.isFinite(glyphData.advanceWidth) ||
      glyphData.advanceWidth <= 0
    ) {
      throw new Error(`Glifo inválido: ${glyphData.name}`)
    }

    const path = buildPath(glyphData.contours)

    glyphs.push(
      new opentype.Glyph({
        name: glyphData.name,
        unicode: glyphData.unicode,
        advanceWidth: glyphData.advanceWidth,
        path,
      })
    )
  }

  return new opentype.Font({
    familyName: metadata.familyName,
    styleName: metadata.styleName || 'Regular',
    unitsPerEm: metrics.unitsPerEm,
    ascender: metrics.ascender,
    descender: metrics.descender,
    glyphs,
  })
}
