import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import Badge from '@/components/ui/Badge'
import Table, { Column } from '@/components/ui/Table'
import { ownerPanelService, AuctionResultResponse } from '@/api/services/ownerPanelService'
import Loader from '@/components/ui/Loader'
import toast from 'react-hot-toast'
import { History, CheckCircle2, XCircle, TrendingUp, ArrowUpRight } from 'lucide-react'

const statusConfig: Record<string, { color: 'green' | 'red' | 'stone', label: string, icon: any }> = {
  'sold': { color: 'green', label: 'Acquired', icon: CheckCircle2 },
  'outbid': { color: 'red', label: 'Outbid', icon: XCircle },
}

export default function BiddingHistory() {
  const [bids, setBids] = useState<AuctionResultResponse[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    if (user?.id) {
      const controller = new AbortController()
      fetchData(user.id, controller.signal)
      return () => controller.abort()
    }
  }, [user?.id])

  const fetchData = async (userId: number, signal: AbortSignal) => {
    setLoading(true)
    try {
      const data = await ownerPanelService.getBids(userId, signal)
      setBids(data)
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return
      toast.error('Failed to load bidding history')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  const won = bids.filter((b) => b.status === 'sold')
  const outbidCount = bids.filter((b) => b.status === 'outbid').length
  const totalWon = won.reduce((s, b) => s + b.final_price, 0)
  const successRate = bids.length > 0 ? Math.round((won.length / bids.length) * 100) : 0

  const columns: Column<AuctionResultResponse>[] = [
    {
      key: 'player',
      header: 'Auction Item',
      render: (b) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center overflow-hidden">
            {b.player.user.profile_photo ? (
              <img src={b.player.user.profile_photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-stone-400 dark:text-stone-500">{b.player.user.full_name[0]}</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-tight">{b.player.user.full_name}</span>
            <span className="text-[10px] text-stone-500 font-medium uppercase tracking-wider">{b.player.playing_role}</span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Result',
      render: (b) => {
        const conf = statusConfig[b.status] || { color: 'stone', label: b.status, icon: History }
        return (
          <div className="flex items-center gap-2">
            <Badge color={conf.color} variant="solid" className="gap-1.5 px-2">
              <conf.icon size={10} strokeWidth={3} />
              {conf.label}
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'final_price',
      header: 'Hammer Price',
      render: (b) => (
        <div className="flex flex-col">
          <span className="font-mono text-sm font-bold text-stone-900 dark:text-stone-200">₹{(b.final_price / 100000).toFixed(1)}L</span>
          <span className="text-[9px] text-stone-500 dark:text-stone-600 font-bold uppercase">Base: ₹{((b.player.base_price || 0) / 100000).toFixed(1)}L</span>
        </div>
      )
    },
    {
      key: 'id',
      header: 'Efficiency',
      render: (b) => {
        const premium = b.final_price - (b.player.base_price || 0)
        const isBase = premium === 0
        return (
          <div className="flex items-center gap-1.5">
            {isBase ? (
              <span className="text-[10px] text-emerald-500/70 font-bold uppercase italic">Base Price Pick</span>
            ) : (
              <>
                <ArrowUpRight size={12} className="text-stone-600" />
                <span className="text-[10px] text-stone-400 font-bold uppercase">+₹{(premium / 100000).toFixed(1)}L</span>
              </>
            )}
          </div>
        )
      }
    },
    {
      key: 'created_at',
      header: 'Timing',
      render: (b) => (
        <div className="flex items-center gap-2 text-stone-500">
          <span className="text-[10px] font-bold uppercase tabular-nums">
            {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 uppercase tracking-tight flex items-center gap-3">
            <History className="text-brand-500" size={24} /> Bidding Inventory
          </h2>
          <p className="text-stone-500 text-sm mt-1">Transactional log of {bids.length} auction participations</p>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Success Rate', value: `${successRate}%`, color: 'text-blue-400', icon: TrendingUp, bg: 'bg-blue-500/10' },
          { label: 'Auctions Won', value: won.length, color: 'text-emerald-400', icon: CheckCircle2, bg: 'bg-emerald-500/10' },
          { label: 'Outbid At', value: outbidCount, color: 'text-red-400', icon: XCircle, bg: 'bg-red-500/10' },
          { label: 'Total Invested', value: `₹${(totalWon / 100000).toFixed(1)}L`, color: 'text-brand-400', icon: History, bg: 'bg-brand-500/10' },
        ].map((s) => (
          <div key={s.label} className="stat-card group hover:border-brand-500/20 transition-all cursor-default relative overflow-hidden bg-white dark:bg-stone-900/20 backdrop-blur-sm border border-stone-200 dark:border-stone-800/50">
            <div className={`absolute -right-4 -top-4 h-16 w-16 ${s.bg} rounded-full blur-2xl group-hover:blur-xl transition-all`} />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex flex-col">
                <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-stone-600 font-bold uppercase tracking-[0.2em] mt-1">{s.label}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${s.bg}`}><s.icon size={18} className={s.color} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-stone-900/20 border border-stone-200 dark:border-stone-800/50 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-700/50 to-transparent" />
        <Table columns={columns} data={bids} keyExtractor={(b) => b.id} emptyText="No bidding activity recorded yet." />
      </div>
    </div>
  )
}
