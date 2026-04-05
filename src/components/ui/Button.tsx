import { forwardRef } from 'react'
import clsx from 'clsx'
import Loader from './Loader'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20',
  secondary: 'bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700',
  ghost:     'hover:bg-white/5 text-stone-300 hover:text-stone-100',
  danger:    'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
}

const sizeStyles: Record<Size, string> = {
  sm:  'px-3 py-1.5 text-xs gap-1.5',
  md:  'px-4 py-2   text-sm gap-2',
  lg:  'px-5 py-2.5 text-sm gap-2',
}

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center font-medium rounded-lg',
          'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...rest}
      >
        {loading ? <Loader size="sm" /> : icon}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
