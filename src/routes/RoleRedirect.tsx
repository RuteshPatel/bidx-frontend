import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const ROLE_HOME: Record<string, string> = {
  super_admin: '/super-admin/dashboard',
  admin:       '/admin/dashboard',
  owner:       '/owner/dashboard',
  auctioneer:  '/auctioneer/panel',
}

export default function RoleRedirect() {
  const role = useAuthStore((s) => s.user?.role)
  const dest = role ? (ROLE_HOME[role] ?? '/login') : '/login'
  return <Navigate to={dest} replace />
}
