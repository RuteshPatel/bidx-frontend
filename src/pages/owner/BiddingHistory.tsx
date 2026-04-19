import { useState, useEffect } from 'react'
import Badge from '@/components/ui/Badge'
import Table, { Column } from '@/components/ui/Table'
import { ownerPanelService } from '@/api/services/ownerPanelService'
import { Bid } from '@/api/services/auctionService'
import Loader from '@/components/ui/Loader'
import toast from 'react-hot-toast'
import { History, CheckCircle2, XCircle, Clock } from 'lucide-react'

// Enhanced interface for bidding history
interface OwnerBidHistory extends Bid {
  player_name?: string
  player_role?: string
  status?: 'won' | 'outbid' | 'active'
}

export default function BiddingHistory() {
  const [bids, setBids] = useState<OwnerBidHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => controller.abort()
  }, [])

  const fetchData = async (signal: AbortSignal) => {
    setLoading(true)
    try {
      const data = await ownerPanelService.getBids(signal)
      setBids(data as OwnerBidHistory[])
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return
      toast.error('Failed to load bidding history')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  const won = bids.filter((b) => b.status === 'won')
  const outbid = bids.filter((b) => b.status === 'outbid')
  const totalWon = won.reduce((s, b) => s + b.amount, 0)

  const columns: Column<OwnerBidHistory>[] = [
    {
      key: 'player_name',
      header: 'Player',
      render: (b) => (
        <div className="flex flex-col">
          <span className="font-bold text-stone-100 uppercase tracking-tight">{b.player_name || 'Unknown Player'}</span>
          <span className="text-[10px] text-stone-600 font-bold uppercase tracking-widest">{b.player_role || 'No Role'}</span>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Bid Amount',
      render: (b) => <span className="font-mono text-sm font-bold text-stone-200">₹{(b.amount / 100000).toFixed(1)}L</span>
    },
    {
      key: 'status',
      header: 'Result',
      render: (b) => {
        if (b.status === 'won') return <Badge color="green" icon={<CheckCircle2 size={10} />}>Auction Won</Badge>
        if (b.status === 'outbid') return <Badge color="red" icon={<XCircle size={10} />}>Outbid</Badge>
        return <Badge color="blue" icon={<Clock size={10} />}>Active</Badge>
      }
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
