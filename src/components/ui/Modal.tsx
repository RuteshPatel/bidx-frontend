import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
}

export default function Modal({ open, onClose, title, children, size = 'md' }: Props) {
  // Prevent scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
      />

      {/* Panel */}
      <div
        className={clsx(
          'relative z-10 w-full rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800',
          'shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300',
          sizeMap[size]
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
            <h2 className="font-display text-base font-semibold text-stone-900 dark:text-stone-100">{title}</h2>
            <button
              onClick={onClose}
              className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(100vh-120px)]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
