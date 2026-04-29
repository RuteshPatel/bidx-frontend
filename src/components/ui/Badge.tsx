import clsx from 'clsx'

type Color = 'green' | 'red' | 'orange' | 'blue' | 'stone'

const colors: Record<Color, string> = {
  green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  red: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
  orange: 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  stone: 'bg-stone-50 dark:bg-stone-700/50 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700',
}

interface Props {
  children: React.ReactNode
  color?: Color
  icon?: React.ReactNode
  className?: string
}

export default function Badge({ children, color = 'stone', icon, className }: Props) {
  return (
    <span className={clsx(
      'badge inline-flex items-center gap-1.5',
      colors[color],
      className
    )}>
      {icon && <span className="opacity-70">{icon}</span>}
      {children}
    </span>
  )
}
