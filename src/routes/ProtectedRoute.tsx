import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore, UserRole } from '@/store/authStore'

interface Props {
  children?: React.ReactNode
  allowedRoles?: UserRole[]
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/not-authorized" replace />
  }

  // If children passed (wrapping a layout), render children + outlet
  // If no children, render outlet directly
  return children ? <>{children}<Outlet /></> : <Outlet />
}
