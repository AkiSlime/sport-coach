import { clsx } from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-xl font-semibold',
        'transition-all duration-150',
        'active:scale-[0.97] active:brightness-90',
        'disabled:opacity-40 disabled:pointer-events-none disabled:saturate-0',
        {
          'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-900/30 hover:from-emerald-400 hover:to-emerald-500':
            variant === 'primary',
          'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700/50':
            variant === 'secondary',
          'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-md shadow-red-900/30 hover:from-red-400 hover:to-red-500':
            variant === 'danger',
          'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60':
            variant === 'ghost',
        },
        {
          'px-3 py-2 text-sm gap-1.5': size === 'sm',
          'px-5 py-2.5 text-base gap-2': size === 'md',
          'px-6 py-3.5 text-lg gap-2': size === 'lg',
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
