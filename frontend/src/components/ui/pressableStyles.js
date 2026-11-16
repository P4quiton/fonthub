
/**
 * Estilos reutilizables para interacciones
 * neobrutalistas de FontHub.
 *
 * Se pueden aplicar a:
 * - Botones HTML
 * - Enlaces de React Router
 * - Componentes interactivos
 */

export const pressableStyles = [
  'inline-flex',
  'items-center',
  'justify-center',

  // Sombra inicial
  'shadow-[4px_4px_0_#000]',

  // Animación
  'transition-[transform,box-shadow]',
  'duration-150',

  // Al pasar el cursor
  'hover:translate-x-[1px]',
  'hover:translate-y-[1px]',
  'hover:shadow-[3px_3px_0_#000]',

  // Al presionar
  'active:translate-x-[4px]',
  'active:translate-y-[4px]',
  'active:shadow-none',

  // Accesibilidad con teclado
  'focus-visible:outline-4',
  'focus-visible:outline-offset-4',
  'focus-visible:outline-blue-600',

  // Preferencias de movimiento reducido
  'motion-reduce:transition-none',
].join(' ')
