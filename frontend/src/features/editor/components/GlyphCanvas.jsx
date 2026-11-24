
import { useId, useRef, useState } from 'react'
import { pressableStyles } from '../../../components/ui/pressableStyles'
import { clientToFontCoordinates } from '../utils/canvasCoordinates'
import { moveContourNode } from '../utils/moveContourNode'

const BASELINE = 800

// Convierte comandos tipográficos a rutas SVG.
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

// Obtiene los nodos principales de los contornos.
function getContourNodes(contours) {
    return contours.flatMap((contour, contourIndex) =>
        contour.flatMap((command, commandIndex) => {
            if (!['M', 'L', 'Q', 'C'].includes(command.type)) {
                return []
            }

            return [{
                contourIndex,
                commandIndex,
                pointType: 'anchor',
                x: command.x,
                y: command.y,
                type: command.type,
            }]
        }),
    )
}

// Obtiene los puntos de control de curvas cuadráticas.
function getQuadraticControls(contours) {
    return contours.flatMap((contour, contourIndex) =>
        contour.flatMap((command, commandIndex) => {
            if (command.type !== 'Q') return []

            const previous = contour[commandIndex - 1]

            if (
                !previous ||
                !Number.isFinite(previous.x) ||
                !Number.isFinite(previous.y)
            ) {
                return []
            }

            return [{
                contourIndex,
                commandIndex,
                pointType: 'control',
                x: command.x1,
                y: command.y1,
                startX: previous.x,
                startY: previous.y,
                endX: command.x,
                endY: command.y,
            }]
        }),
    )
}

function GlyphCanvas({
    glyph,
    metrics,
    onContourComplete,
    onNodeMove,
}) {
    const gridId = useId().replace(/:/g, '-')
    const svgRef = useRef(null)

    const [tool, setTool] = useState('pen')
    const [draftPoints, setDraftPoints] = useState([])
    const [draggingNode, setDraggingNode] = useState(null)

    const contours = glyph.contours ?? []

    // Muestra los cambios mientras se arrastra un nodo.
    // El proyecto real se actualiza al soltar el puntero.

    const displayContours = draggingNode
        ? moveContourNode(
            contours,
            draggingNode.contourIndex,
            draggingNode.commandIndex,
            draggingNode.x,
            draggingNode.y,
            draggingNode.pointType,
        )
        : contours


    const displayNodes = getContourNodes(displayContours)
    const displayControls = getQuadraticControls(displayContours)

    function changeTool(nextTool) {
        if (draggingNode) return

        setDraftPoints([])
        setTool(nextTool)
    }

    // Herramienta Pluma: dibujar y cerrar contornos.
    function handleCanvasPointerDown(event) {
        if (tool !== 'pen') return
        if (event.button !== 0) return

        const coordinates = clientToFontCoordinates(
            svgRef.current,
            event.clientX,
            event.clientY,
        )

        if (!coordinates) return

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

    // Comienza el arrastre de un nodo o punto de control.
    function handleNodePointerDown(event, node) {
        if (tool !== 'select') return
        if (event.button !== 0) return
        if (draggingNode) return

        event.stopPropagation()
        event.preventDefault()

        const svg = svgRef.current
        if (!svg) return

        svg.setPointerCapture(event.pointerId)

        setDraggingNode({
            contourIndex: node.contourIndex,
            commandIndex: node.commandIndex,
            pointType: node.pointType,
            pointerId: event.pointerId,
            x: node.x,
            y: node.y,
        })
    }

    // Vista previa del movimiento.
    function handleCanvasPointerMove(event) {
        if (!draggingNode) return
        if (event.pointerId !== draggingNode.pointerId) return

        const coordinates = clientToFontCoordinates(
            svgRef.current,
            event.clientX,
            event.clientY,
        )

        if (!coordinates) return

        setDraggingNode((previous) => {
            if (!previous || previous.pointerId !== event.pointerId) {
                return previous
            }

            return {
                ...previous,
                x: coordinates.x,
                y: coordinates.y,
            }
        })
    }

    // Guarda el movimiento al soltar.
    function handleCanvasPointerUp(event) {
        if (!draggingNode) return
        if (event.pointerId !== draggingNode.pointerId) return

        const svg = svgRef.current

        const coordinates = clientToFontCoordinates(
            svg,
            event.clientX,
            event.clientY,
        )

        const finalPosition = coordinates ?? {
            x: draggingNode.x,
            y: draggingNode.y,
        }

        if (svg?.hasPointerCapture(event.pointerId)) {
            svg.releasePointerCapture(event.pointerId)
        }

        setDraggingNode(null)

        onNodeMove(
            draggingNode.contourIndex,
            draggingNode.commandIndex,
            finalPosition.x,
            finalPosition.y,
            draggingNode.pointType,
        )
    }

    // Si el gesto se cancela, no se guarda.
    function handleCanvasPointerCancel(event) {
        if (draggingNode?.pointerId !== event.pointerId) return

        setDraggingNode(null)
    }

    return (
        <div className="space-y-3">
            {/* Herramientas */}
            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={() => changeTool('pen')}
                    aria-pressed={tool === 'pen'}
                    className={`
            ${pressableStyles}
            cursor-pointer rounded-lg border-2 border-black
            px-4 py-2 text-sm font-bold
            ${tool === 'pen' ? 'bg-yellow-300' : 'bg-white'}
          `}
                >
                    Pluma
                </button>

                <button
                    type="button"
                    onClick={() => changeTool('select')}
                    aria-pressed={tool === 'select'}
                    className={`
            ${pressableStyles}
            cursor-pointer rounded-lg border-2 border-black
            px-4 py-2 text-sm font-bold
            ${tool === 'select' ? 'bg-yellow-300' : 'bg-white'}
          `}
                >
                    Selección
                </button>
            </div>

            {/* Acciones del dibujo temporal */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={handleUndoPoint}
                    disabled={tool !== 'pen' || draftPoints.length === 0}
                    className={`
            ${pressableStyles}
            enabled:cursor-pointer
            rounded-lg border-2 border-black bg-white
            px-4 py-2 text-sm font-bold
            disabled:cursor-not-allowed disabled:opacity-40
            disabled:hover:translate-x-0
            disabled:hover:translate-y-0
            disabled:hover:shadow-[4px_4px_0_#000]
          `}
                >
                    Deshacer punto
                </button>

                <button
                    type="button"
                    onClick={handleCancelDrawing}
                    disabled={tool !== 'pen' || draftPoints.length === 0}
                    className={`
            ${pressableStyles}
            enabled:cursor-pointer
            rounded-lg border-2 border-black bg-red-100
            px-4 py-2 text-sm font-bold
            disabled:cursor-not-allowed disabled:opacity-40
            disabled:hover:translate-x-0
            disabled:hover:translate-y-0
            disabled:hover:shadow-[4px_4px_0_#000]
          `}
                >
                    Cancelar dibujo
                </button>

                <span className="text-sm font-semibold text-slate-600">
                    Puntos actuales: {draftPoints.length}
                </span>
            </div>

            {/* Instrucciones */}
            {tool === 'select' && (
                <p className="text-sm font-medium text-slate-600">
                    Arrastra los nodos amarillos para mover vértices
                    y los naranjas para ajustar las curvas.
                </p>
            )}

            {/* Lienzo */}
            <svg
                ref={svgRef}
                onPointerDown={handleCanvasPointerDown}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                onPointerCancel={handleCanvasPointerCancel}
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
                <rect
                    width="1000"
                    height="1000"
                    fill={`url(#${gridId})`}
                />

                {/* Guía ascendente */}
                <line
                    x1="0"
                    y1={BASELINE - metrics.ascender}
                    x2="1000"
                    y2={BASELINE - metrics.ascender}
                    stroke="#2563eb"
                    strokeWidth="3"
                />

                {/* Altura de mayúsculas */}
                <line
                    x1="0"
                    y1={BASELINE - metrics.capHeight}
                    x2="1000"
                    y2={BASELINE - metrics.capHeight}
                    stroke="#16a34a"
                    strokeWidth="3"
                    strokeDasharray="12 8"
                />

                {/* Altura x */}
                <line
                    x1="0"
                    y1={BASELINE - metrics.xHeight}
                    x2="1000"
                    y2={BASELINE - metrics.xHeight}
                    stroke="#9333ea"
                    strokeWidth="3"
                    strokeDasharray="12 8"
                />

                {/* Línea base */}
                <line
                    x1="0"
                    y1={BASELINE}
                    x2="1000"
                    y2={BASELINE}
                    stroke="#dc2626"
                    strokeWidth="4"
                />

                {/* Ancho del glifo */}
                <line
                    x1={glyph.advanceWidth}
                    y1="0"
                    x2={glyph.advanceWidth}
                    y2="1000"
                    stroke="#d97706"
                    strokeWidth="3"
                    strokeDasharray="12 8"
                />

                {/* Contornos y vista previa del arrastre */}
                {displayContours.map((contour, index) => (
                    <path
                        key={index}
                        d={contourToSvgPath(contour)}
                        fill="rgba(37, 99, 235, 0.18)"
                        fillRule="nonzero"
                        stroke="#111827"
                        strokeWidth="4"
                        strokeLinejoin="round"
                        pointerEvents="none"
                    />
                ))}

                {/* Guías de los puntos de control Bézier */}
                {tool === 'select' && displayControls.map((control) => (
                    <g
                        key={`guides-${control.contourIndex}-${control.commandIndex}`}
                        pointerEvents="none"
                    >
                        <line
                            x1={control.startX}
                            y1={BASELINE - control.startY}
                            x2={control.x}
                            y2={BASELINE - control.y}
                            stroke="#ea580c"
                            strokeWidth="2"
                            strokeDasharray="8 6"
                        />

                        <line
                            x1={control.x}
                            y1={BASELINE - control.y}
                            x2={control.endX}
                            y2={BASELINE - control.endY}
                            stroke="#ea580c"
                            strokeWidth="2"
                            strokeDasharray="8 6"
                        />
                    </g>
                ))}

                {/* Nodos principales */}

                {tool === 'select' && displayNodes
                    .filter((node) => {
                        const contour = displayContours[node.contourIndex]
                        const first = contour?.[0]
                        const closingIndex = contour.length - 2
                        const closing = contour[closingIndex]

                        const isDuplicateClosingNode =
                            node.commandIndex === closingIndex &&
                            contour.at(-1)?.type === 'Z' &&
                            closing?.type === 'Q' &&
                            first?.type === 'M' &&
                            closing.x === first.x &&
                            closing.y === first.y

                        return !isDuplicateClosingNode
                    })
                    .map((node) => (

                        <rect
                            key={`anchor-${node.contourIndex}-${node.commandIndex}`}
                            x={node.x - 9}
                            y={BASELINE - node.y - 9}
                            width="18"
                            height="18"
                            rx="2"
                            fill="#fde047"
                            stroke="#111827"
                            strokeWidth="3"
                            className="cursor-grab active:cursor-grabbing"
                            onPointerDown={(event) =>
                                handleNodePointerDown(event, node)
                            }
                        />
                    ))}

                {/* Puntos de control de curvas cuadráticas */}
                {tool === 'select' && displayControls.map((control) => (
                    <circle
                        key={`control-${control.contourIndex}-${control.commandIndex}`}
                        cx={control.x}
                        cy={BASELINE - control.y}
                        r="11"
                        fill="#fb923c"
                        stroke="#111827"
                        strokeWidth="3"
                        className="cursor-grab active:cursor-grabbing"
                        onPointerDown={(event) =>
                            handleNodePointerDown(event, control)
                        }
                    />
                ))}

                {/* Segmentos temporales de Pluma */}
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

                {/* Puntos temporales */}
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

                {/* Mensaje inicial */}
                {contours.length === 0 && draftPoints.length === 0 && (
                    <g
                        fill="#6b7280"
                        textAnchor="middle"
                        pointerEvents="none"
                    >
                        <text
                            x="500"
                            y="490"
                            fontSize="35"
                            fontWeight="bold"
                        >
                            Glifo sin contornos
                        </text>

                        <text
                            x="500"
                            y="535"
                            fontSize="23"
                        >
                            Usa Pluma para comenzar a dibujar
                        </text>
                    </g>
                )}
            </svg>
        </div>
    )
}

export default GlyphCanvas
