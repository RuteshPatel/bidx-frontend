import clsx from 'clsx'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  fullscreen?: boolean
}

const sizes = { sm: 'h-4 w-4 border-2', md: 'h-7 w-7 border-2', lg: 'h-10 w-10 border-[3px]' }

export default function Loader({ size = 'md', fullscreen }: Props) {
  const spinner = (
    <div
      className={clsx(
        'rounded-full border-stone-700 border-t-brand-500 animate-spin',
        sizes[size]
      )}
    />
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-surface-950">
        {spinner}
      </div>
    )
  }

  return spinner
}
