import { useState, useEffect } from 'react'
import { Wallet, Users, Trophy, TrendingUp } from 'lucide-react'
import { ownerPanelService, OwnerTeam, OwnerBudget } from '@/api/services/ownerPanelService'
import Loader from '@/components/ui/Loader'
import toast from 'react-hot-toast'

export default function OwnerDashboard() {
  const [team, setTeam] = useState<OwnerTeam | null>(null)
  const [budget, setBudget] = useState<OwnerBudget | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => controller.abort()
  }, [])

  const fetchData = async (signal: AbortSignal) => {
    setLoading(true)
    try {
      const [teamData, budgetData] = await Promise.all([
        ownerPanelService.getMyTeam(signal),
        ownerPanelService.getBudget(signal)
      ])
      setTeam(teamData)
      setBudget(budgetData)
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  const stats = [
    {
      label: 'Team Budget',
      value: `₹${((budget?.total_purse || 0) / 100000).toFixed(1)}L`,
      sub: `₹${((budget?.spent_amount || 0) / 100000).toFixed(1)}L spent`,
      icon: Wallet,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'Players Acquired',
      value: team?.players.length.toString() || '0',
      sub: `${15 - (team?.players.length || 0)} slots left`,
      icon: Users,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      label: 'Wallet Balance',
      value: `₹${((budget?.remaining_amount || 0) / 100000).toFixed(1)}L`,
      sub: 'remaining budget',
      icon: Trophy,
      color: 'text-brand-400',
      bg: 'bg-brand-500/10'
    },
    {
      label: 'Avg Player Price',
      value: team?.players.length
        ? `₹${((budget?.spent_amount || 0) / (team.players.length * 100000)).toFixed(1)}L`
        : '₹0',
      sub: 'per acquisition',
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    },
  ]

  const recentAcquisitions = team?.players.slice(-5).reverse() || []

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">My Dashboard</h2>
          <p className="text-stone-500 text-sm mt-1">
            <span className="text-brand-500 font-bold">{team?.name}</span> · Official Owner Panel
          </p>
        </div>
        <div className="px-4 py-2 bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Auction Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card group hover:border-brand-500/20 transition-all cursor-default">
            <div className="flex items-center justify-between pointer-events-none">
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-[0.2em]">{s.label}</span>
              <div className={`p-2 rounded-lg ${s.bg} group-hover:scale-110 transition-transform`}><s.icon size={15} className={s.color} /></div>
            </div>
            <p className={`font-display text-3xl font-bold mt-2 ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-stone-600 font-medium uppercase mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card border-stone-200 dark:border-stone-800/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-stone-900 dark:text-stone-200 text-xs uppercase tracking-widest flex items-center gap-2">
              <Users size={14} className="text-brand-500" /> Recent Acquisitions
            </h3>
            <span className="text-[10px] text-stone-500 dark:text-stone-600 font-bold uppercase">Latest 5</span>
          </div>
          <div className="space-y-3">
            {recentAcquisitions.length > 0 ? (
              recentAcquisitions.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-stone-50 dark:bg-stone-900/30 border border-transparent hover:border-stone-200 dark:hover:border-stone-800 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center overflow-hidden">
                      {p.user.profile_photo ? (
                        <img src={p.user.profile_photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-stone-400 dark:text-stone-500">{p.user.full_name[0]}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900 dark:text-stone-200 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors uppercase tracking-tight">{p.user.full_name}</p>
                      <p className="text-[10px] text-stone-500 font-medium uppercase tracking-wider">{p.playing_role}</p>
                    </div>
                  </div>
                  <span className="font-mono text-brand-600 dark:text-brand-400 text-sm font-bold">₹{((p.base_price || 0) / 100000).toFixed(1)}L</span>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <p className="text-stone-600 text-xs font-medium italic">No players acquired yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="card border-stone-200 dark:border-stone-800/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-stone-900 dark:text-stone-200 text-xs uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-500" /> Budget Breakdown
            </h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-500/50 font-bold uppercase tracking-widest">{(((budget?.spent_amount || 0) / (budget?.total_purse || 1)) * 100).toFixed(0)}% Used</span>
          </div>
          <div className="space-y-5">
            {budget?.breakdown && budget.breakdown.length > 0 ? (
              budget.breakdown.map((item) => (
                <div key={item.role} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em]">{item.role}</span>
                      <span className="text-[9px] text-stone-400 dark:text-stone-600 font-bold">{item.filled_slots} / {item.total_slots} Slots Filled</span>
                    </div>
                    <span className="text-stone-900 dark:text-stone-300 font-mono text-xs font-bold">₹{(item.spent / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                      style={{ width: `${(item.filled_slots / item.total_slots) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <p className="text-stone-600 text-xs font-medium italic">Budget analysis unavailable</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
