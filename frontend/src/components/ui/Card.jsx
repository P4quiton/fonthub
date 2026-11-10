export default function Card({
  children,
  className = '',
  ...props
}) {
  return (
    <div
      className={`
        min-w-0
        rounded-[var(--fh-radius)]
        border-[3px] border-[var(--fh-black)]
        bg-white
        p-5
        shadow-[var(--fh-shadow)]
        sm:p-6
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}