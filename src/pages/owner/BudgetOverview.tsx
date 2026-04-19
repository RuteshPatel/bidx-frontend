import { useState, useEffect } from 'react'
import { ownerPanelService, OwnerBudget } from '@/api/services/ownerPanelService'
import Loader from '@/components/ui/Loader'
import toast from 'react-hot-toast'
import { IndianRupee, PieChart, TrendingDown } from 'lucide-react'

export default function BudgetOverview() {
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
      const data = await ownerPanelService.getBudget(signal)
      setBudget(data)
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return
      toast.error('Failed to load budget data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  const totalPurse = budget?.total_purse || 0
  const spent = budget?.spent_amount || 0
  const remaining = budget?.remaining_amount || 0
  const pct = totalPurse > 0 ? (spent / totalPurse) * 100 : 0

  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-brand-500', 'bg-purple-500', 'bg-pink-500']

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-stone-100 uppercase tracking-tight">Budget Overview</h2>
          <p className="text-stone-500 text-sm mt-1">Real-time expenditure and wallet tracking</p>
        </div>
        <div className="px-4 py-2 bg-stone-900 shadow-xl border border-stone-800 rounded-xl flex items-center gap-3">
          <TrendingDown size={14} className="text-brand-500" />
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Live Updates</span>
        </div>
      </div>

      {/* Big purse card */}
      <div className="card shadow-2xl border-stone-800/50 relative overflow-hidden group">
        <div className="absolute -right-12 -top-12 h-40 w-40 bg-brand-500/5 rounded-full blur-3xl group-hover:bg-brand-500/10 transition-all duration-700" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 relative z-10">
          <div>
            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-[0.2em] mb-2">Total Purse Allotted</p>
            <p className="font-display text-5xl font-bold text-stone-100 tracking-tighter">₹{(totalPurse / 100000).toFixed(0)}L</p>
          </div>
          <div className="bg-stone-900/50 p-6 rounded-2xl border border-stone-800/50 flex flex-col items-end">
            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2">
              <IndianRupee size={10} className="text-emerald-500" /> Remaining Balance
            </p>
            <p className="font-display text-4xl font-bold text-emerald-400 tracking-tighter">₹{(remaining / 100000).toFixed(1)}L</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-3 relative z-10">
          <div className="h-4 bg-stone-900 rounded-full overflow-hidden border border-stone-800 shadow-inner p-0.5">
            <div
              className="h-full bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-stone-500">
            <span className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-brand-500" /> Spent: ₹{(spent / 100000).toFixed(1)}L ({pct.toFixed(0)}%)
            </span>
            <span>Unused: ₹{(remaining / 100000).toFixed(1)}L</span>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {budget?.breakdown && budget.breakdown.length > 0 ? (
          budget.breakdown.map((b, i) => (
            <div key={b.role} className="card border-stone-800/50 hover:border-stone-700 transition-all group cursor-default">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${colors[i % colors.length]}`} />
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{b.role}</span>
                </div>
                <div className="px-2 py-0.5 rounded bg-stone-900 text-[9px] font-bold text-stone-600 uppercase tracking-widest">
                  {b.filled_slots} / {b.total_slots}
                </div>
              </div>
              <p className="font-display text-2xl font-bold text-stone-100 tracking-tight">₹{(b.spent / 100000).toFixed(1)}L</p>
              <div className="mt-4 h-1 bg-stone-900 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${colors[i % colors.length]} group-hover:opacity-80 transition-all duration-700`}
                  style={{ width: `${(b.spent / Math.max(spent, 1)) * 100}%` }}
                />
              </div>
              <p className="text-[9px] text-stone-600 font-bold uppercase mt-2 tracking-widest">
                {((b.spent / Math.max(totalPurse, 1)) * 100).toFixed(1)}% of total purse
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 card border-dashed border-stone-800 bg-transparent flex flex-col items-center justify-center text-center">
            <PieChart className="text-stone-800 mb-4" size={40} />
            <p className="text-stone-600 text-sm italic">Category-wise analysis will appear as you acquire players.</p>
          </div>
        )}
      </div>
    </div>
  )
}
