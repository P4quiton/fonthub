
/**
 * Modelo base de un proyecto tipográfico de FontHub.
 *
 * Un proyecto editable es independiente de una fuente
 * publicada en el catálogo.
 */

export function createFontProject({
  familyName = 'Mi nueva fuente',
  styleName = 'Regular',
  author = '',
} = {}) {
  const now = new Date().toISOString()

  return {
    id: crypto.randomUUID(),

    metadata: {
      familyName,
      styleName,
      author,
      version: '1.0',
    },

    metrics: {
      unitsPerEm: 1000,
      ascender: 800,
      descender: -200,
      capHeight: 700,
      xHeight: 500,
    },

    glyphs: {
      '32': {
        name: 'space',
        unicode: 32,
        advanceWidth: 300,
        contours: [],
      },

      '65': {
        name: 'A',
        unicode: 65,
        advanceWidth: 700,
        contours: [],
      },

      '66': {
        name: 'B',
        unicode: 66,
        advanceWidth: 700,
        contours: [],
      },
    },

    createdAt: now,
    updatedAt: now,
  }
}
