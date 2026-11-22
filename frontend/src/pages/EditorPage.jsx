import { useState } from 'react'
import { createFontProject } from '../features/editor/models/createFontProject'
import GlyphCanvas from '../features/editor/components/GlyphCanvas'

function EditorPage() {
  const [project] = useState(() => createFontProject())
  const [selectedUnicode, setSelectedUnicode] = useState(65)

  const glyphs = Object.values(project.glyphs)
  const selectedGlyph = project.glyphs[String(selectedUnicode)]

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
                glyph={selectedGlyph}
                metrics={project.metrics}
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
                  className={`rounded-lg border-2 border-black p-3 font-black transition-colors ${
                    selectedUnicode === glyph.unicode
                      ? 'bg-yellow-300'
                      : 'bg-white hover:bg-yellow-100'
                  }`}
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
        </aside>
      </div>
    </main>
  )
}

export default EditorPage
