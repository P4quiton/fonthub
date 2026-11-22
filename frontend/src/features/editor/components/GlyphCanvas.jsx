import { useId, useRef, useState } from 'react'
import { clientToFontCoordinates } from '../utils/canvasCoordinates'

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

function GlyphCanvas({
    glyph,
    metrics,
    onContourComplete,
}) {
    const gridId = useId().replace(/:/g, '-')

    const contours = glyph.contours ?? []

    const svgRef = useRef(null)
    const [draftPoints, setDraftPoints] = useState([])

    function handleCanvasPointerDown(event) {
        if (event.button !== 0) return

        const coordinates = clientToFontCoordinates(
            svgRef.current,
            event.clientX,
            event.clientY,
        )

        if (!coordinates) return

        // Si hay al menos tres puntos, permitimos cerrar
        // el contorno haciendo clic cerca del primero.
        if (draftPoints.length >= 3) {
            const firstPoint = draftPoints[0]

            const distance = Math.hypot(
                coordinates.x - firstPoint.x,
                coordinates.y - firstPoint.y,
            )

            if (distance <= 18) {
                const commands = draftPoints.map((point, index) => ({
                    type: index === 0 ? 'M' : 'L',
                    x: point.x,
                    y: point.y,
                }))

                commands.push({ type: 'Z' })

                onContourComplete(commands)
                setDraftPoints([])
                return
            }
        }

        // Si no estamos cerrando, agregamos otro punto.
        setDraftPoints((previous) => [
            ...previous,
            coordinates,
        ])
    }

    function handleUndoPoint() {
        setDraftPoints((previous) => previous.slice(0, -1))
    }

    function handleCancelDrawing() {
        setDraftPoints([])
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={handleUndoPoint}
                    disabled={draftPoints.length === 0}
                    className="rounded-lg border-2 border-black bg-white px-4 py-2 text-sm font-bold shadow-[3px_3px_0_#000] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Deshacer punto
                </button>

                <button
                    type="button"
                    onClick={handleCancelDrawing}
                    disabled={draftPoints.length === 0}
                    className="rounded-lg border-2 border-black bg-red-100 px-4 py-2 text-sm font-bold shadow-[3px_3px_0_#000] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Cancelar dibujo
                </button>

                <span className="text-sm font-semibold text-slate-600">
                    Puntos actuales: {draftPoints.length}
                </span>
            </div>

            <svg
                ref={svgRef}
                onPointerDown={handleCanvasPointerDown}
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

                {/* Segmentos temporales de la herramienta Pluma */}
                {draftPoints.length > 1 && (
                    <polyline
                        points={draftPoints
                            .map(({ x, y }) => `${x},${BASELINE - y}`)
                            .join(' ')}
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        pointerEvents="none"
                    />
                )}

                {/* Puntos colocados */}
                {draftPoints.map(({ x, y }, index) => (
                    <circle
                        key={index}
                        cx={x}
                        cy={BASELINE - y}
                        r="9"
                        fill="#ffffff"
                        stroke="#2563eb"
                        strokeWidth="4"
                        pointerEvents="none"
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
        </div>
    )
}

export default GlyphCanvas
