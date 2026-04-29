import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'

export default function AdminLayout() {
  return (
    <div className="flex h-screen flex-col bg-stone-50 dark:bg-surface-950 transition-colors overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto p-6 animate-fade-in custom-scrollbar">
        <div className="max-w-7xl mx-auto w-full h-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
