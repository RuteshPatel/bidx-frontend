import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/routes/ProtectedRoute'
import RoleRedirect from '@/routes/RoleRedirect'
import Loader from '@/components/ui/Loader'

// Layouts
import AdminLayout    from '@/layouts/AdminLayout'
import OwnerLayout    from '@/layouts/OwnerLayout'
import AuctioneerLayout from '@/layouts/AuctioneerLayout'

// Auth
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const NotAuthorized = lazy(() => import('@/pages/auth/NotAuthorized'))

// Admin pages
const AdminDashboard  = lazy(() => import('@/pages/admin/Dashboard'))
const ManageTeams     = lazy(() => import('@/pages/admin/ManageTeams'))
const ManagePlayers   = lazy(() => import('@/pages/admin/ManagePlayers'))
const ManageAuctions  = lazy(() => import('@/pages/admin/ManageAuctions'))

// Super Admin pages
const SuperAdminDashboard = lazy(() => import('@/pages/super-admin/Dashboard'))
const ManageTenants       = lazy(() => import('@/pages/super-admin/ManageTenants'))
const SuperAdminSettings  = lazy(() => import('@/pages/super-admin/Settings'))

// Owner pages
const OwnerDashboard  = lazy(() => import('@/pages/owner/Dashboard'))
const MyTeamPlayers   = lazy(() => import('@/pages/owner/MyTeamPlayers'))
const BudgetOverview  = lazy(() => import('@/pages/owner/BudgetOverview'))
const BiddingHistory  = lazy(() => import('@/pages/owner/BiddingHistory'))

// Auctioneer pages
const LiveAuctionPanel = lazy(() => import('@/pages/auctioneer/LiveAuctionPanel'))

const SuspenseWrap = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loader fullscreen />}>{children}</Suspense>
)

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"          element={<SuspenseWrap><LoginPage /></SuspenseWrap>} />
      <Route path="/not-authorized" element={<SuspenseWrap><NotAuthorized /></SuspenseWrap>} />

      {/* Role redirect after login */}
      <Route path="/" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

      {/* SUPER ADMIN routes */}
      <Route element={<ProtectedRoute allowedRoles={['super_admin']}><AdminLayout /></ProtectedRoute>}>
        <Route path="/super-admin/dashboard" element={<SuspenseWrap><SuperAdminDashboard /></SuspenseWrap>} />
        <Route path="/super-admin/tenants"   element={<SuspenseWrap><ManageTenants /></SuspenseWrap>} />
        <Route path="/super-admin/settings"  element={<SuspenseWrap><SuperAdminSettings /></SuspenseWrap>} />
      </Route>

      {/* ADMIN (Tenant) routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<SuspenseWrap><AdminDashboard /></SuspenseWrap>} />
        <Route path="/admin/teams"     element={<SuspenseWrap><ManageTeams /></SuspenseWrap>} />
        <Route path="/admin/players"   element={<SuspenseWrap><ManagePlayers /></SuspenseWrap>} />
        <Route path="/admin/auctions"  element={<SuspenseWrap><ManageAuctions /></SuspenseWrap>} />
      </Route>

      {/* OWNER routes */}
      <Route element={<ProtectedRoute allowedRoles={['owner']}><OwnerLayout /></ProtectedRoute>}>
        <Route path="/owner/dashboard"    element={<SuspenseWrap><OwnerDashboard /></SuspenseWrap>} />
        <Route path="/owner/team"         element={<SuspenseWrap><MyTeamPlayers /></SuspenseWrap>} />
        <Route path="/owner/budget"       element={<SuspenseWrap><BudgetOverview /></SuspenseWrap>} />
        <Route path="/owner/bids"         element={<SuspenseWrap><BiddingHistory /></SuspenseWrap>} />
      </Route>

      {/* AUCTIONEER routes */}
      <Route element={<ProtectedRoute allowedRoles={['auctioneer']}><AuctioneerLayout /></ProtectedRoute>}>
        <Route path="/auctioneer/panel" element={<SuspenseWrap><LiveAuctionPanel /></SuspenseWrap>} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
