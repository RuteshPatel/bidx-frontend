import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { Maximize2, X } from 'lucide-react'
import clsx from 'clsx'

export default function AuctioneerLayout() {
  const [isFullScreen, setIsFullScreen] = useState(false)

  // Sync state with native fullscreen events (e.g. Esc key)
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      document.documentElement.requestFullscreen().catch(() => { })
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => { })
      }
    }
    setIsFullScreen(!isFullScreen)
  }

  return (
    <div className="flex h-screen flex-col bg-stone-50 dark:bg-surface-950 transition-all duration-500 overflow-hidden">
      {/* Header - Hidden in FS mode */}
      {!isFullScreen && (
        <Header
          actions={
            <button
              onClick={toggleFullScreen}
              className="p-2.5 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-all group"
              title="Enter Full Screen"
            >
              <Maximize2 size={18} className="group-hover:scale-110 transition-transform" />
            </button>
          }
        />
      )}

      {/* Exit Full Screen Trigger (Top Middle Hover) */}
      {isFullScreen && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-64 h-2 hover:h-16 group z-[60] flex flex-col items-center justify-start pointer-events-auto">
          <button
            onClick={toggleFullScreen}
            className="mt-2 flex items-center gap-2 px-6 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
          >
            <X size={14} /> Exit Full Screen
          </button>
        </div>
      )}

      <main className={clsx(
        "flex-1 overflow-y-auto animate-fade-in custom-scrollbar",
        isFullScreen ? "p-4" : "p-6"
      )}>
        <div className={clsx("h-full", !isFullScreen && "max-w-7xl mx-auto w-full")}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
