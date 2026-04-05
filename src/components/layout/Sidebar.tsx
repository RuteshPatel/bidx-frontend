import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import clsx from 'clsx'
import { useAuthStore } from '@/store/authStore'
import { MENU_CONFIG, NavItem } from '@/routes/menuConfig'
import { authService } from '@/api/services/authService'
import toast from 'react-hot-toast'

interface Props {
  accentColor?: string
}

export default function Sidebar({ accentColor }: Props) {
  const { user, logout } = useAuthStore()
  const navItems: NavItem[] = user ? (MENU_CONFIG[user.role] ?? []) : []

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // ignore — server may already be gone
    }
    logout()
    toast.success('Logged out')
  }

  const roleLabel: Record<string, string> = {
    super_admin: 'Super Admin',
    admin:       'Admin',
    owner:       'Team Owner',
    auctioneer:  'Auctioneer',
  }

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 transition-colors">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-stone-200 dark:border-stone-800">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg font-display font-bold text-sm text-white"
          style={{ background: accentColor ?? '#f97316' }}
        >
          BX
        </div>
        <span className="font-display font-bold text-stone-800 dark:text-stone-100 tracking-tight">BidX</span>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800">
        <p className="text-xs font-medium text-stone-800 dark:text-stone-100 truncate">{user?.username ?? user?.email ?? 'User'}</p>
        <p className="text-[11px] text-stone-500 mt-0.5">{roleLabel[user?.role ?? ''] ?? user?.role}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx('sidebar-link', isActive && 'active')
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-stone-200 dark:border-stone-800">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/10 dark:hover:bg-red-500/5 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  )
}
