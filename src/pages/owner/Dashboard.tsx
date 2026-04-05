import { Wallet, Users, Trophy, TrendingUp } from 'lucide-react'

const stats = [
  { label: 'Team Budget',      value: '₹85L',  sub: '₹32L spent',    icon: Wallet,    color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
  { label: 'Players Acquired', value: '7',     sub: '5 slots left',  icon: Users,     color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Bids Won',         value: '7',     sub: '3 outbid',      icon: Trophy,    color: 'text-brand-400',   bg: 'bg-brand-500/10'   },
  { label: 'Avg Bid Price',    value: '₹4.6L', sub: 'across all bids',icon: TrendingUp,color: 'text-purple-400', bg: 'bg-purple-500/10'  },
]

const myPlayers = [
  { name: 'Rohan Shah',   role: 'Batsman',      price: 1200000 },
  { name: 'Aman Trivedi', role: 'All-Rounder',  price: 950000  },
  { name: 'Dev Mehta',    role: 'Batsman',       price: 750000  },
]

export default function OwnerDashboard() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="font-display text-2xl font-bold text-stone-100">My Dashboard</h2>
        <p className="text-stone-500 text-sm mt-1">Mumbai Royals · Auction 2025</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-500 font-medium uppercase tracking-wider">{s.label}</span>
              <div className={`p-2 rounded-lg ${s.bg}`}><s.icon size={15} className={s.color} /></div>
            </div>
            <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-stone-600">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-display font-semibold text-stone-200 text-sm mb-4">Recent Acquisitions</h3>
          <div className="space-y-2">
            {myPlayers.map((p) => (
              <div key={p.name} className="flex items-center justify-between py-2 border-b border-stone-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400">
                    {p.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-200">{p.name}</p>
                    <p className="text-xs text-stone-500">{p.role}</p>
                  </div>
                </div>
                <span className="font-mono text-brand-400 text-sm font-semibold">₹{(p.price / 100000).toFixed(1)}L</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-display font-semibold text-stone-200 text-sm mb-4">Budget Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Batsmen',       spent: 1950000, total: 3000000 },
              { label: 'Bowlers',       spent: 0,       total: 2500000 },
              { label: 'All-Rounders',  spent: 950000,  total: 2000000 },
              { label: 'WK-Batsmen',    spent: 0,       total: 1500000 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-stone-400">{item.label}</span>
                  <span className="text-stone-300 font-mono">₹{(item.spent/100000).toFixed(1)}L / ₹{(item.total/100000).toFixed(1)}L</span>
                </div>
                <div className="h-1.5 rounded-full bg-stone-800">
                  <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${(item.spent/item.total)*100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
