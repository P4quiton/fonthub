export default function Input({
  label,
  id,
  className = '',
  ...props
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      {label && (
        <label
          htmlFor={id}
          className="font-bold text-[var(--fh-black)]"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        className={`
          w-full min-w-0
          rounded-[var(--fh-radius)]
          border-[3px] border-[var(--fh-black)]
          bg-white px-4 py-3
          text-[var(--fh-black)]
          outline-none
          transition-shadow
          focus:shadow-[var(--fh-shadow)]
          disabled:cursor-not-allowed
          disabled:opacity-50
          ${className}
        `}
        {...props}
      />
    </div>
  )
}