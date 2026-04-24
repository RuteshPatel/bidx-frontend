import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const ROLE_HOME: Record<string, string> = {
  super_admin: '/super-admin/dashboard',
  admin:       '/admin/dashboard',
  owner:       '/owner/dashboard',
  auctioner:   '/auctioner/panel',
}

export default function RoleRedirect() {
  const role = useAuthStore((s) => s.user?.role)
  const normalizedRole = role?.toLowerCase()
  const dest = normalizedRole ? (ROLE_HOME[normalizedRole] ?? '/login') : '/login'
  return <Navigate to={dest} replace />
}
