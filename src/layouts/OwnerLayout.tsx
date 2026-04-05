import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

const pageTitles: Record<string, string> = {
  '/owner/dashboard': 'Dashboard',
  '/owner/team':      'My Team',
  '/owner/budget':    'Budget Overview',
  '/owner/bids':      'Bid History',
}

export default function OwnerLayout() {
  const { pathname } = useLocation()
  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      <Sidebar accentColor="#3b82f6" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={pageTitles[pathname]} />
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
