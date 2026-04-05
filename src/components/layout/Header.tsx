import { useEffect, useState } from 'react'
import { Bell, Sun, Moon } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface Props {
  title?: string
}

export default function Header({ title }: Props) {
  const user = useAuthStore((s) => s.user)
  const [isDark, setIsDark] = useState(true)

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
    } else {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-950/80 px-6 backdrop-blur-sm sticky top-0 z-10 transition-colors">
      <h1 className="font-display text-sm font-semibold text-stone-700 dark:text-stone-300 tracking-wide uppercase">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="relative text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
          title="Toggle Theme"
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button className="relative text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
          <Bell size={17} />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-brand-500" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-stone-200 dark:border-stone-800">
          <div className="h-7 w-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-400">
            {(user?.username ?? user?.email ?? 'U')[0].toUpperCase()}
          </div>
          <span className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block">{user?.username ?? user?.email}</span>
        </div>
      </div>
    </header>
  )
}
