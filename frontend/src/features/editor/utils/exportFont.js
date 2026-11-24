
import { projectToOpenType } from './projectToOpenType'

/**
 * Convierte el nombre de la fuente en un nombre
 * de archivo compatible con Windows y otros SO.
 */
export function createFontFilename(metadata) {
    const family = metadata?.familyName?.trim() || 'FontHub'
    const style = metadata?.styleName?.trim() || 'Regular'

    const name = `${family}-${style}`
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')

    return `${name || 'FontHub'}.otf`
}

/**
 * Genera y descarga una fuente OTF desde el navegador.
 */
export function downloadProjectFont(project) {
    const font = projectToOpenType(project)
    const arrayBuffer = font.toArrayBuffer()

    const blob = new Blob(
        [arrayBuffer],
        { type: 'font/otf' },
    )

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = createFontFilename(project.metadata)
    link.style.display = 'none'

    document.body.appendChild(link)

    try {
        link.click()
    } finally {
        link.remove()

        // Liberar la URL temporal después de activar la descarga.
        setTimeout(() => URL.revokeObjectURL(url), 1000)
    }

    return {
        filename: link.download,
        size: blob.size,
    }
}
