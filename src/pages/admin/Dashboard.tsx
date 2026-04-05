import { Users, Shield, Gavel, TrendingUp, Activity, Clock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const stats = [
  { label: 'Total Players',    value: '48',  sub: '+4 this week',   icon: Users,      color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
  { label: 'Active Teams',     value: '8',   sub: '2 pending',      icon: Shield,     color: 'text-emerald-400',bg: 'bg-emerald-500/10'},
  { label: 'Auctions Run',     value: '124', sub: '3 live now',     icon: Gavel,      color: 'text-brand-400',  bg: 'bg-brand-500/10'  },
  { label: 'Total Bids',       value: '1.2k',sub: 'across all events',icon: TrendingUp,color:'text-purple-400', bg: 'bg-purple-500/10' },
]

const recentActivity = [
  { event: 'Player "Rohan Shah" sold to Mumbai Royals',    time: '2 min ago',  type: 'sold'   },
  { event: 'Team "Delhi Dynamos" created',                 time: '14 min ago', type: 'team'   },
  { event: 'Auction for "Priya Kapoor" started',           time: '22 min ago', type: 'auction'},
  { event: 'New player "Aman Trivedi" registered',         time: '1 hr ago',   type: 'player' },
  { event: 'Player "Kavya Reddy" marked unsold',           time: '1 hr ago',   type: 'unsold' },
]

const typeColor: Record<string, string> = {
  sold:    'bg-emerald-500',
  team:    'bg-blue-500',
  auction: 'bg-brand-500',
  player:  'bg-purple-500',
  unsold:  'bg-red-500',
}

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome */}
      <div>
        <h2 className="font-display text-2xl font-bold text-stone-100">
          Good morning 👋
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Here's what's happening across your auction platform today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-500 font-medium uppercase tracking-wider">{s.label}</span>
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon size={15} className={s.color} />
              </div>
            </div>
            <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-stone-600">{s.sub}</p>
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
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${typeColor[a.type]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-300 leading-snug">{a.event}</p>
                </div>
                <span className="text-[11px] text-stone-600 flex-shrink-0 flex items-center gap-1">
                  <Clock size={11} />{a.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick status */}
        <div className="card">
          <h3 className="font-display font-semibold text-stone-200 text-sm mb-4">Auction Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Players Sold',    val: 32, total: 48, color: 'bg-emerald-500' },
              { label: 'Players Unsold',  val: 8,  total: 48, color: 'bg-red-500'     },
              { label: 'Budget Used',     val: 68, total: 100,color: 'bg-brand-500'   },
              { label: 'Teams Filled',    val: 5,  total: 8,  color: 'bg-blue-500'    },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-stone-400">{item.label}</span>
                  <span className="text-stone-300 font-mono">{item.val}/{item.total}</span>
                </div>
                <div className="h-1.5 rounded-full bg-stone-800">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all`}
                    style={{ width: `${(item.val / item.total) * 100}%` }}
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
