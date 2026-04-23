import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import Badge from '@/components/ui/Badge'
import Table, { Column } from '@/components/ui/Table'
import { ownerPanelService, AuctionResultResponse } from '@/api/services/ownerPanelService'
import Loader from '@/components/ui/Loader'
import toast from 'react-hot-toast'
import { History, CheckCircle2, XCircle, Clock } from 'lucide-react'

const roleColor: Record<string, 'blue' | 'orange' | 'green' | 'stone'> = {
  'Batsman': 'blue', 'Bowler': 'orange', 'All-Rounder': 'green', 'Wicket-Keeper': 'stone',
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
  const outbid = bids.filter((b) => b.status === 'outbid')
  const totalWon = won.reduce((s, b) => s + b.final_price, 0)

  const columns: Column<AuctionResultResponse>[] = [
    {
      key: 'player',
      header: 'Player',
      render: (b) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center overflow-hidden">
            {b.player.user.profile_photo ? (
              <img src={b.player.user.profile_photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-stone-500">{b.player.user.full_name[0]}</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-stone-100 uppercase tracking-tight">{b.player.user.full_name}</span>
          </div>
        </div>
      )
    },
    {
      key: 'final_price',
      header: 'Winning Bid',
      render: (b) => <span className="font-mono text-sm font-bold text-stone-200">₹{(b.final_price / 100000).toFixed(1)}L</span>
    },
    {
      key: 'player',
      header: 'Role',
      render: (b) => <Badge color={roleColor[b.player.playing_role || ''] ?? 'stone'} variant="outline">{b.player.playing_role || 'No Role'}</Badge>
    },
    {
      key: 'created_at',
      header: 'Timestamp',
      render: (b) => (
        <span className="text-stone-500 text-[10px] font-bold uppercase tabular-nums">
          {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      )
    },
  ]

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-stone-100 uppercase tracking-tight flex items-center gap-3">
            <History className="text-brand-500" size={24} /> Bidding History
          </h2>
          <p className="text-stone-500 text-sm mt-1">{bids.length} total bids placed by your team</p>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Auctions Won', value: won.length, color: 'text-emerald-400', icon: CheckCircle2, bg: 'bg-emerald-500/10' },
          { label: 'Outbid Count', value: outbid.length, color: 'text-red-400', icon: XCircle, bg: 'bg-red-500/10' },
          { label: 'Total Expenditure', value: `₹${(totalWon / 100000).toFixed(1)}L`, color: 'text-brand-400', icon: History, bg: 'bg-brand-500/10' },
        ].map((s) => (
          <div key={s.label} className="card group hover:border-stone-800 transition-all cursor-default relative overflow-hidden">
            <div className={`absolute -right-4 -top-4 h-16 w-16 ${s.bg} rounded-full blur-2xl group-hover:blur-xl transition-all`} />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex flex-col">
                <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-stone-600 font-bold uppercase tracking-[0.2em] mt-1">{s.label}</p>
              </div>
              <div className={`p-3 rounded-xl ${s.bg}`}><s.icon size={20} className={s.color} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-stone-900/20 border border-stone-800/50 rounded-2xl overflow-hidden shadow-2xl">
        <Table columns={columns} data={bids} keyExtractor={(b) => b.id} emptyText="No bidding activity recorded yet." />
      </div>
    </div>
  )
}
