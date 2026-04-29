import {
  LayoutDashboard,
  Users,
  Shield,
  Gavel,
  Wallet,
  History,
  Radio,
  UserCircle,
  Building2,
  Settings,
} from 'lucide-react'
import { UserRole } from '@/store/authStore'

export interface NavItem {
  label: string
  path: string
  icon: React.ElementType
}

export const MENU_CONFIG: Record<UserRole, NavItem[]> = {
  super_admin: [
    { label: 'Dashboard', path: '/super-admin/dashboard', icon: LayoutDashboard },
    { label: 'Manage Tenants', path: '/super-admin/tenants', icon: Building2 },
    { label: 'Settings', path: '/super-admin/settings', icon: Settings },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Manage Owners', path: '/admin/owners', icon: UserCircle },
    { label: 'Manage Teams', path: '/admin/teams', icon: Shield },
    { label: 'Manage Players', path: '/admin/players', icon: Users },
  ],
  owner: [
    { label: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
    { label: 'My Team', path: '/owner/team', icon: UserCircle },
    { label: 'Budget', path: '/owner/budget', icon: Wallet },
    { label: 'Bid History', path: '/owner/bids', icon: History },
  ],
  auctioner: [
    { label: 'Bidding View', path: '/auctioner/bidding', icon: Gavel },
    { label: 'Handler Control', path: '/auctioner/handler', icon: Settings },
    { label: 'Live Broadcast', path: '/auctioner/broadcast', icon: Radio },
    { label: 'Auction Log', path: '/auctioner/history', icon: History },
  ],
}
