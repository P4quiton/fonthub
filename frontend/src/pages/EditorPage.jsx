import { useState } from 'react'
import { createFontProject } from '../features/editor/models/createFontProject'
import GlyphCanvas from '../features/editor/components/GlyphCanvas'
import { pressableStyles } from '../components/ui/pressableStyles'
import { lineToQuadratic, closeToQuadratic } from '../features/editor/utils/bezierUtils'
import { moveContourNode } from '../features/editor/utils/moveContourNode'
import { downloadProjectFont } from '../features/editor/utils/exportFont'

function EditorPage() {
    const [project, setProject] = useState(() => createFontProject())
    const [past, setPast] = useState([])
    const [future, setFuture] = useState([])
    const [selectedUnicode, setSelectedUnicode] = useState(65)
    const [exportMessage, setExportMessage] = useState('')
    const [exportError, setExportError] = useState('')

    const glyphs = Object.values(project.glyphs)
    const selectedGlyph = project.glyphs[String(selectedUnicode)]

    function handleContourComplete(commands) {
        const glyphKey = String(selectedUnicode)
        const currentGlyph = project.glyphs[glyphKey]

        if (!currentGlyph) return

        const updatedProject = {
            ...project,
            updatedAt: new Date().toISOString(),
            glyphs: {
                ...project.glyphs,
                [glyphKey]: {
                    ...currentGlyph,
                    contours: [
                        ...currentGlyph.contours,
                        commands,
                    ],
                },
            },
        }

        setPast((previous) => [...previous.slice(-49), project])
        setFuture([])
        setProject(updatedProject)
    }


    function handleNodeMove(
        contourIndex,
        commandIndex,
        x,
        y,
        pointType = 'anchor',
    ) {
        const glyphKey = String(selectedUnicode)
        const currentGlyph = project.glyphs[glyphKey]

        if (!currentGlyph) return

        const updatedContours = moveContourNode(
            currentGlyph.contours,
            contourIndex,
            commandIndex,
            x,
            y,
            pointType,
        )

        // No registrar un cambio si nada se modificó.
        if (updatedContours === currentGlyph.contours) {
            return
        }

        const updatedProject = {
            ...project,
            updatedAt: new Date().toISOString(),
            glyphs: {
                ...project.glyphs,
                [glyphKey]: {
                    ...currentGlyph,
                    contours: updatedContours,
                },
            },
        }

        // Un movimiento terminado = una entrada al historial.
        setPast((previous) => [
            ...previous.slice(-49),
            project,
        ])

        setFuture([])
        setProject(updatedProject)
    }


    function handleConvertSegment(contourIndex, commandIndex) {
        const glyphKey = String(selectedUnicode)
        const currentGlyph = project.glyphs[glyphKey]

        if (!currentGlyph) return

        const currentContour = currentGlyph.contours[contourIndex]
        const currentCommand = currentContour?.[commandIndex]

        // Solo convertir segmentos rectos.
        if (currentCommand?.type !== 'L') return

        const convertedContour = lineToQuadratic(
            currentContour,
            commandIndex,
        )

        if (convertedContour === currentContour) return

        const updatedContours = currentGlyph.contours.map(
            (contour, index) =>
                index === contourIndex ? convertedContour : contour,
        )

        const updatedProject = {
            ...project,
            updatedAt: new Date().toISOString(),
            glyphs: {
                ...project.glyphs,
                [glyphKey]: {
                    ...currentGlyph,
                    contours: updatedContours,
                },
            },
        }

        // Registrar la conversión en el historial.
        setPast((previous) => [...previous.slice(-49), project])
        setFuture([])
        setProject(updatedProject)
    }


    function handleConvertClosingSegment(contourIndex) {
        const glyphKey = String(selectedUnicode)
        const currentGlyph = project.glyphs[glyphKey]

        if (!currentGlyph) return

        const currentContour = currentGlyph.contours[contourIndex]

        if (!currentContour) return

        const convertedContour = closeToQuadratic(currentContour)

        // No registrar cambios si no se realizó la conversión.
        if (convertedContour === currentContour) return

        const updatedContours = currentGlyph.contours.map(
            (contour, index) =>
                index === contourIndex ? convertedContour : contour,
        )

        const updatedProject = {
            ...project,
            updatedAt: new Date().toISOString(),
            glyphs: {
                ...project.glyphs,
                [glyphKey]: {
                    ...currentGlyph,
                    contours: updatedContours,
                },
            },
        }

        // Permitir deshacer y rehacer la conversión.
        setPast((previous) => [...previous.slice(-49), project])
        setFuture([])
        setProject(updatedProject)
    }


    function handleExportFont() {
        setExportMessage('')
        setExportError('')

        try {
            const { filename } = downloadProjectFont(project)

            setExportMessage(
                `Descarga iniciada: ${filename}`,
            )
        } catch (error) {
            console.error('Error al exportar la fuente:', error)

            setExportError(
                error instanceof Error
                    ? error.message
                    : 'No se pudo exportar la fuente.',
            )
        }
    }


    function handleUndo() {
        if (past.length === 0) return

        const previousProject = past[past.length - 1]

        setPast((previous) => previous.slice(0, -1))
        setFuture((previous) => [project, ...previous])
        setProject(previousProject)
    }

    function handleRedo() {
        if (future.length === 0) return

        const nextProject = future[0]

        setFuture((previous) => previous.slice(1))
        setPast((previous) => [...previous.slice(-49), project])
        setProject(nextProject)
    }

    return (
        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
            {/* Encabezado */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <span className="rounded-lg border-2 border-black bg-yellow-300 px-3 py-1 text-xs font-black">
                        FONTHUB STUDIO
                    </span>

                    <h1 className="mt-4 text-3xl font-black sm:text-4xl">
                        Editor de fuentes
                    </h1>

                    <p className="mt-2 font-medium">
                        {project.metadata.familyName} — {project.metadata.styleName}
                    </p>
                </div>

                <span className="rounded-lg border-2 border-black bg-white px-4 py-2 text-sm font-bold">
                    Proyecto local · Sin guardar
                </span>
            </div>

            <div className="mb-5 flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={handleUndo}
                    disabled={past.length === 0}
                    className={`
                        ${pressableStyles}
                        rounded-lg border-2 border-black bg-white
                        px-4 py-2 text-sm font-bold
                        enabled:cursor-pointer
                        disabled:cursor-not-allowed disabled:opacity-40
                        disabled:hover:translate-x-0
                        disabled:hover:translate-y-0
                        disabled:hover:shadow-[4px_4px_0_#000]
                    `}
                >
                    ↶ Deshacer contorno
                </button>

                <button
                    type="button"
                    onClick={handleRedo}
                    disabled={future.length === 0}
                    className={`
                        ${pressableStyles}
                        rounded-lg border-2 border-black bg-white
                        px-4 py-2 text-sm font-bold
                        enabled:cursor-pointer
                        disabled:cursor-not-allowed disabled:opacity-40
                        disabled:hover:translate-x-0
                        disabled:hover:translate-y-0
                        disabled:hover:shadow-[4px_4px_0_#000]
                    `}
                >
                    ↷ Rehacer contorno
                </button>


                <button
                    type="button"
                    onClick={handleExportFont}
                    className={`
                        ${pressableStyles}
                        cursor-pointer rounded-lg border-2 border-black
                        bg-green-300 px-4 py-2 text-sm font-black
                        hover:bg-green-400
                    `}
                >
                    ↓ Exportar OTF
                </button>


                <span className="text-sm font-semibold text-slate-600">
                    Historial: {past.length} cambios anteriores
                </span>
            </div>


            {exportMessage && (
                <p
                    role="status"
                    className="mb-5 rounded-lg border-2 border-black bg-green-100 p-3 text-sm font-bold"
                >
                    {exportMessage}
                </p>
            )}

            {exportError && (
                <p
                    role="alert"
                    className="mb-5 rounded-lg border-2 border-red-700 bg-red-100 p-3 text-sm font-bold text-red-800"
                >
                    {exportError}
                </p>
            )}


            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                {/* Área principal */}
                <section className="min-w-0">
                    <div className="rounded-xl border-4 border-black bg-white shadow-[6px_6px_0_#000]">
                        {/* Barra del lienzo */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-black bg-yellow-100 p-4">
                            <div>
                                <h2 className="text-xl font-black">
                                    Glifo: {selectedGlyph.name}
                                </h2>

                                <p className="text-xs font-medium">
                                    Unicode: U+{selectedGlyph.unicode.toString(16).toUpperCase().padStart(4, '0')}
                                </p>
                            </div>

                            <span className="rounded-lg border-2 border-black bg-white px-3 py-2 text-xs font-bold">
                                Vista de diseño
                            </span>
                        </div>

                        {/* Lienzo vectorial reutilizable*/}
                        <div className="p-4 sm:p-6">
                            <GlyphCanvas
                                key={selectedUnicode}
                                glyph={selectedGlyph}
                                metrics={project.metrics}
                                onContourComplete={handleContourComplete}
                                onNodeMove={handleNodeMove}
                            />
                        </div>
                    </div>

                    {/* Leyenda */}
                    <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold">
                        <span className="text-blue-700">● Ascendente</span>
                        <span className="text-green-700">● Mayúsculas</span>
                        <span className="text-purple-700">● Altura x</span>
                        <span className="text-red-700">● Línea base</span>
                        <span className="text-amber-700">● Ancho</span>
                    </div>
                </section>

                {/* Panel lateral */}
                <aside className="space-y-6">
                    <section className="rounded-xl border-4 border-black bg-white p-4 shadow-[5px_5px_0_#000]">
                        <h2 className="mb-4 text-xl font-black">
                            Caracteres
                        </h2>

                        <div className="grid grid-cols-3 gap-3">
                            {glyphs.map((glyph) => (
                                <button
                                    key={glyph.unicode}
                                    type="button"
                                    onClick={() => setSelectedUnicode(glyph.unicode)}
                                    aria-pressed={selectedUnicode === glyph.unicode}
                                    className={`
                                        ${pressableStyles}
                                        cursor-pointer rounded-lg border-2 border-black
                                        p-3 font-black
                                        ${selectedUnicode === glyph.unicode
                                            ? 'bg-yellow-300'
                                            : 'bg-white hover:bg-yellow-100'
                                        }
                                    `}
                                >
                                    {glyph.unicode === 32 ? '␣' : glyph.name}
                                </button>
                            ))}
                        </div>

                        <p className="mt-4 text-xs font-medium text-gray-600">
                            Selecciona el carácter que deseas editar.
                        </p>
                    </section>

                    <section className="rounded-xl border-4 border-black bg-blue-100 p-4 shadow-[5px_5px_0_#000]">
                        <h2 className="mb-4 text-xl font-black">
                            Propiedades
                        </h2>

                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between gap-3">
                                <dt className="font-bold">Ancho del glifo</dt>
                                <dd>{selectedGlyph.advanceWidth}</dd>
                            </div>

                            <div className="flex justify-between gap-3">
                                <dt className="font-bold">Unidades por em</dt>
                                <dd>{project.metrics.unitsPerEm}</dd>
                            </div>

                            <div className="flex justify-between gap-3">
                                <dt className="font-bold">Ascendente</dt>
                                <dd>{project.metrics.ascender}</dd>
                            </div>

                            <div className="flex justify-between gap-3">
                                <dt className="font-bold">Descendente</dt>
                                <dd>{project.metrics.descender}</dd>
                            </div>

                            <div className="flex justify-between gap-3">
                                <dt className="font-bold">Contornos</dt>
                                <dd>{selectedGlyph.contours.length}</dd>
                            </div>
                        </dl>
                    </section>

                    {/* Herramientas para convertir segmentos a curvas */}
                    <section className="rounded-xl border-4 border-black bg-white p-4 shadow-[5px_5px_0_#000]">
                        <h2 className="mb-3 text-xl font-black">
                            Curvas Bézier
                        </h2>

                        <p className="mb-4 text-sm font-medium text-gray-600">
                            Convierte un segmento recto en una curva cuadrática.
                        </p>

                        <div className="flex flex-col gap-3">
                            {selectedGlyph.contours.flatMap(
                                (contour, contourIndex) =>
                                    contour.map((command, commandIndex) => {
                                        if (command.type !== 'L') return null

                                        return (
                                            <button
                                                key={`${contourIndex}-${commandIndex}`}
                                                type="button"
                                                onClick={() =>
                                                    handleConvertSegment(
                                                        contourIndex,
                                                        commandIndex,
                                                    )
                                                }
                                                className={`
                                                    ${pressableStyles}
                                                    cursor-pointer rounded-lg border-2 border-black
                                                    bg-purple-100 px-3 py-2 text-sm font-bold
                                                `}
                                            >
                                                Curvar contorno {contourIndex + 1},
                                                segmento {commandIndex}
                                            </button>
                                        )
                                    }),
                            )}
                        </div>


                        {/* Conversión del segmento de cierre */}
                        <div className="mt-3 flex flex-col gap-3">
                            {selectedGlyph.contours.map((contour, contourIndex) => {
                                const first = contour[0]
                                const last = contour.at(-1)
                                const previous = contour.at(-2)

                                const canCurveClosing =
                                    first?.type === 'M' &&
                                    last?.type === 'Z' &&
                                    previous &&
                                    ['M', 'L', 'Q', 'C'].includes(previous.type) &&
                                    (
                                        previous.x !== first.x ||
                                        previous.y !== first.y
                                    )

                                if (!canCurveClosing) return null

                                return (
                                    <button
                                        key={`closing-${contourIndex}`}
                                        type="button"
                                        onClick={() =>
                                            handleConvertClosingSegment(contourIndex)
                                        }
                                        className={`
                                            ${pressableStyles}
                                            cursor-pointer rounded-lg border-2 border-black
                                            bg-orange-100 px-3 py-2 text-sm font-bold
                                        `}
                                    >
                                        Curvar lado de cierre del contorno {contourIndex + 1}
                                    </button>
                                )
                            })}
                        </div>


                        {selectedGlyph.contours.every((contour) => {
                            const first = contour[0]
                            const last = contour.at(-1)
                            const previous = contour.at(-2)

                            const hasStraightSegment = contour.some(
                                (command) => command.type === 'L',
                            )

                            const hasClosingSegment =
                                first?.type === 'M' &&
                                last?.type === 'Z' &&
                                previous &&
                                ['M', 'L', 'Q', 'C'].includes(previous.type) &&
                                (
                                    previous.x !== first.x ||
                                    previous.y !== first.y
                                )

                            return !hasStraightSegment && !hasClosingSegment
                        }) && (
                                <p className="text-sm font-medium text-gray-500">
                                    No hay segmentos rectos disponibles.
                                </p>
                            )}
                    </section>

                </aside>
            </div>
        </main>
    )
}

export default EditorPage
