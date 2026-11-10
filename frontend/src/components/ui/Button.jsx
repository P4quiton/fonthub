const variants = {
  primary: 'bg-[var(--fh-yellow)]',
  secondary: 'bg-[var(--fh-blue)] text-white',
  accent: 'bg-[var(--fh-coral)]',
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`
        cursor-pointer
        rounded-[var(--fh-radius)]
        border-[3px] border-[var(--fh-black)]
        px-6 py-3
        font-black
        shadow-[var(--fh-shadow)]
        transition-all duration-150
        hover:translate-x-[3px]
        hover:translate-y-[3px]
        hover:shadow-[var(--fh-shadow-hover)]
        active:translate-x-[5px]
        active:translate-y-[5px]
        active:shadow-none
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${variants[variant] ?? variants.primary}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}