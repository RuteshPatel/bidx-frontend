import { useState, useEffect } from 'react'
import { Users, Shield, Activity, Clock, UserCheck } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { dashboardService, DashboardStats } from '@/api/services/dashboardService'

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user)
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.tenant_id) {
      fetchDashboardData()
    }
  }, [user?.tenant_id])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const stats = await dashboardService.getStats(user!.tenant_id!)
      setData(stats)
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const stats = [
    { label: 'Total Players', value: data?.summary.total_players || 0, icon: Users,     color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
    { label: 'Active Teams',  value: data?.summary.total_teams || 0,   icon: Shield,    color: 'text-emerald-400',bg: 'bg-emerald-500/10'},
    { label: 'Total Owners',  value: data?.summary.total_owners || 0,  icon: UserCheck, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ]

  const typeColor: Record<string, string> = {
    sold:    'bg-emerald-500',
    team:    'bg-blue-500',
    auction: 'bg-brand-500',
    player:  'bg-purple-500',
    unsold:  'bg-red-500',
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome */}
      <div>
        <h2 className="font-display text-2xl font-bold text-stone-100">
          {getGreeting()}, {user?.email?.split('@')[0] || 'Admin'} 👋
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Here's what's happening across your auction platform today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-500 font-medium uppercase tracking-wider">{s.label}</span>
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon size={15} className={s.color} />
              </div>
            </div>
            {loading ? (
              <div className="h-9 w-12 bg-stone-800 animate-pulse rounded my-1" />
            ) : (
              <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
            )}
            <p className="text-[10px] text-stone-600 uppercase tracking-widest mt-1">Live from database</p>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent activity */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} className="text-brand-400" />
            <h3 className="font-display font-semibold text-stone-200 text-sm">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {data?.recent_activity?.length ? (
              data.recent_activity.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${typeColor[a.type] || 'bg-stone-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-300 leading-snug">{a.event}</p>
                  </div>
                  <span className="text-[11px] text-stone-600 flex-shrink-0 flex items-center gap-1">
                    <Clock size={11} /> {a.time || 'recent'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-600 py-4 text-center">No recent activity detected.</p>
            )}
          </div>
        </div>

        {/* Quick status */}
        <div className="card">
          <h3 className="font-display font-semibold text-stone-200 text-sm mb-4">Auction Status</h3>
          <div className="space-y-3">
            {[
              { 
                label: 'Players Sold',    
                val: data?.auction_status.players_sold || 0,   
                total: data?.summary.total_players || 1, 
                color: 'bg-emerald-500' 
              },
              { 
                label: 'Players Unsold',  
                val: data?.auction_status.players_unsold || 0, 
                total: data?.summary.total_players || 1, 
                color: 'bg-red-500'     
              },
              { 
                label: 'Budget Used',     
                val: data?.auction_status.purse_used || 0,            
                total: data?.auction_status.total_purse_amount || 100,                 
                color: 'bg-brand-500'   
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-stone-400">{item.label}</span>
                  <span className="text-stone-300 font-mono">{item.val}/{item.total}</span>
                </div>
                <div className="h-1.5 rounded-full bg-stone-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${Math.min((item.val / (item.total || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
