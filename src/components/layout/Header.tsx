import { useEffect, useState } from 'react'
import { Sun, Moon, LogOut, Home } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/api/services/authService'
import { MENU_CONFIG } from '@/routes/menuConfig'

interface Props {
  title?: string
  actions?: React.ReactNode
}

export default function Header({ actions }: Props) {
  const { user, logout } = useAuthStore()
  const [isDark, setIsDark] = useState(true)

  const navItems = user ? (MENU_CONFIG[user.role] ?? []) : []

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

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // ignore
    }
    logout()
    toast.success('Logged out successfully')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 px-6 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
      {/* Left: Logo & Home */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 font-display font-black text-white shadow-lg shadow-brand-500/20 translate-y-[-1px]">
            BX
          </div>
          <span className="font-display text-xl font-black text-stone-900 dark:text-stone-100 tracking-tighter">BidX</span>
        </div>
      </div>

      {/* Center: Navigation */}
      <nav className="hidden md:flex items-center gap-1 bg-stone-50 dark:bg-stone-900/40 p-1.5 rounded-2xl border border-stone-100 dark:border-stone-800/50">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-300 ${
                isActive 
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm dark:shadow-none' 
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`
            }
          >
            {item.label === 'Dashboard' ? <Home size={14} /> : <item.icon size={14} />}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {actions}
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-stone-500 hover:text-red-500 dark:hover:text-red-400 transition-colors text-sm font-bold"
          title="Logout"
        >
          <LogOut size={16} />
          <span className="hidden lg:block text-xs uppercase tracking-widest">Logout</span>
        </button>

        <div className="h-8 w-px bg-stone-200 dark:bg-stone-800 hidden sm:block mx-1" />

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-black text-stone-900 dark:text-stone-100 leading-none">{user?.email?.split('@')[0]}</span>
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{user?.role?.replace('_', ' ')}</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-sm font-black text-brand-600 dark:text-brand-400 shadow-inner">
            {(user?.username ?? user?.email ?? 'U')[0].toUpperCase()}
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-all"
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  )
}
