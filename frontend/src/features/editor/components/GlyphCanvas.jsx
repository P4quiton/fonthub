
import { useId } from 'react'

const BASELINE = 800

// Convierte comandos tipográficos a un trazado SVG.
function contourToSvgPath(contour) {
  return contour.map((command) => {
    switch (command.type) {
      case 'M':
      case 'L':
        return `${command.type} ${command.x} ${BASELINE - command.y}`

      case 'Q':
        return `Q ${command.x1} ${BASELINE - command.y1} ${command.x} ${BASELINE - command.y}`

      case 'C':
        return `C ${command.x1} ${BASELINE - command.y1} ${command.x2} ${BASELINE - command.y2} ${command.x} ${BASELINE - command.y}`

      case 'Z':
        return 'Z'

      default:
        return ''
    }
  }).join(' ')
}

function GlyphCanvas({ glyph, metrics }) {
  const gridId = useId().replace(/:/g, '-')

  const contours = glyph.contours ?? []

  return (
    <svg
      viewBox="0 0 1000 1000"
      role="img"
      aria-label={`Lienzo vectorial del glifo ${glyph.name}`}
      className="aspect-square w-full touch-none rounded-lg border-2 border-black bg-white"
    >
      <defs>
        <pattern
          id={gridId}
          width="50"
          height="50"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 50 0 L 0 0 0 50"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      {/* Fondo */}
      <rect width="1000" height="1000" fill={`url(#${gridId})`} />

      {/* Guías tipográficas */}
      <line
        x1="0"
        y1={BASELINE - metrics.ascender}
        x2="1000"
        y2={BASELINE - metrics.ascender}
        stroke="#2563eb"
        strokeWidth="3"
      />

      <line
        x1="0"
        y1={BASELINE - metrics.capHeight}
        x2="1000"
        y2={BASELINE - metrics.capHeight}
        stroke="#16a34a"
        strokeWidth="3"
        strokeDasharray="12 8"
      />

      <line
        x1="0"
        y1={BASELINE - metrics.xHeight}
        x2="1000"
        y2={BASELINE - metrics.xHeight}
        stroke="#9333ea"
        strokeWidth="3"
        strokeDasharray="12 8"
      />

      <line
        x1="0"
        y1={BASELINE}
        x2="1000"
        y2={BASELINE}
        stroke="#dc2626"
        strokeWidth="4"
      />

      <line
        x1={glyph.advanceWidth}
        y1="0"
        x2={glyph.advanceWidth}
        y2="1000"
        stroke="#d97706"
        strokeWidth="3"
        strokeDasharray="12 8"
      />

      {/* Contornos del glifo */}
      {contours.map((contour, index) => (
        <path
          key={index}
          d={contourToSvgPath(contour)}
          fill="rgba(37, 99, 235, 0.18)"
          fillRule="nonzero"
          stroke="#111827"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      ))}

      {/* Mensaje para glifos vacíos */}
      {contours.length === 0 && (
        <g fill="#6b7280" textAnchor="middle">
          <text
            x="500"
            y="490"
            fontSize="35"
            fontWeight="bold"
          >
            Glifo sin contornos
          </text>
          <text x="500" y="535" fontSize="23">
            Próximamente: herramientas de dibujo
          </text>
        </g>
      )}
    </svg>
  )
}

export default GlyphCanvas
