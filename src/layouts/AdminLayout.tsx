import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { MENU_CONFIG } from '@/routes/menuConfig'

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/teams':     'Manage Teams',
  '/admin/players':   'Manage Players',
  '/admin/auctions':  'Manage Auctions',
  '/super-admin/dashboard': 'Super Admin Dashboard',
  '/super-admin/tenants':   'Manage Tenants',
  '/super-admin/users':     'Manage Users',
  '/super-admin/settings':  'Platform Settings',
}

export default function AdminLayout() {
  const { pathname } = useLocation()
  return (
    <div className="flex h-screen overflow-hidden bg-stone-50 dark:bg-surface-950 transition-colors">
      <Sidebar accentColor="#f97316" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={pageTitles[pathname]} />
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in bg-stone-50 dark:bg-transparent transition-colors">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
