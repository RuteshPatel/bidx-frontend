import { useState, useEffect } from 'react'
import { Plus, Play, Square } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Table, { Column } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import { auctionService, Auction } from '@/api/services/auctionService'

const MOCK: Auction[] = [
  { id: 1, player_id: 1, player_name: 'Rohan Shah',    status: 'sold',    base_price: 500000,  current_bid: 1200000, current_bidder_id: 1, current_bidder_name: 'Mumbai Royals', tenant_id: 1 },
  { id: 2, player_id: 2, player_name: 'Priya Kapoor',  status: 'active',  base_price: 400000,  current_bid: 650000,  current_bidder_id: 2, current_bidder_name: 'Delhi Dynamos',  tenant_id: 1 },
  { id: 3, player_id: 3, player_name: 'Aman Trivedi',  status: 'pending', base_price: 750000,  current_bid: null,    current_bidder_id: null, current_bidder_name: null, tenant_id: 1 },
  { id: 4, player_id: 4, player_name: 'Kavya Reddy',   status: 'unsold',  base_price: 600000,  current_bid: null,    current_bidder_id: null, current_bidder_name: null, tenant_id: 1 },
]

const statusColor: Record<string, 'green' | 'orange' | 'stone' | 'red'> = {
  sold:    'green',
  active:  'orange',
  pending: 'stone',
  unsold:  'red',
}

export default function ManageAuctions() {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    auctionService.list().then(setAuctions).catch(() => setAuctions(MOCK)).finally(() => setLoading(false))
  }, [])

  const handleStart = async (id: number) => {
    await auctionService.start(id).catch(() => {})
    setAuctions((prev) => prev.map((a) => a.id === id ? { ...a, status: 'active' as const } : a))
    toast.success('Auction started')
  }

  const handleStop = async (id: number) => {
    await auctionService.stop(id).catch(() => {})
    setAuctions((prev) => prev.map((a) => a.id === id ? { ...a, status: 'unsold' as const } : a))
    toast.success('Auction stopped')
  }

  const columns: Column<Auction>[] = [
    { key: 'player_name',  header: 'Player',       render: (a) => <span className="font-medium text-stone-100">{a.player_name ?? `Player #${a.player_id}`}</span> },
    { key: 'status',       header: 'Status',       render: (a) => <Badge color={statusColor[a.status]}>{a.status.toUpperCase()}</Badge> },
    { key: 'base_price',   header: 'Base',         render: (a) => <span className="font-mono text-stone-400 text-xs">₹{(a.base_price / 100000).toFixed(1)}L</span> },
    { key: 'current_bid',  header: 'Current Bid',  render: (a) => a.current_bid ? <span className="font-mono text-brand-400 font-semibold">₹{(a.current_bid / 100000).toFixed(1)}L</span> : <span className="text-stone-600">—</span> },
    { key: 'current_bidder_name', header: 'Leading Team', render: (a) => a.current_bidder_name ? <span className="text-stone-300 text-xs">{a.current_bidder_name}</span> : <span className="text-stone-600">—</span> },
    {
      key: 'actions', header: 'Actions',
      render: (a) => (
        <div className="flex gap-2">
          {a.status === 'pending' && (
            <Button size="sm" variant="secondary" icon={<Play size={12} />} onClick={() => handleStart(a.id)}>Start</Button>
          )}
          {a.status === 'active' && (
            <Button size="sm" variant="danger" icon={<Square size={12} />} onClick={() => handleStop(a.id)}>Stop</Button>
          )}
        </div>
      )
    },
  ]

  const summary = {
    total:   auctions.length,
    active:  auctions.filter((a) => a.status === 'active').length,
    sold:    auctions.filter((a) => a.status === 'sold').length,
    pending: auctions.filter((a) => a.status === 'pending').length,
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-stone-100">Auctions</h2>
          <p className="text-stone-500 text-sm">{summary.active} live · {summary.sold} sold · {summary.pending} pending</p>
        </div>
        <Button icon={<Plus size={15} />}>New Auction</Button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total',   val: summary.total,   color: 'text-stone-300'   },
          { label: 'Active',  val: summary.active,  color: 'text-brand-400'   },
          { label: 'Sold',    val: summary.sold,    color: 'text-emerald-400' },
          { label: 'Pending', val: summary.pending, color: 'text-stone-500'   },
        ].map((s) => (
          <div key={s.label} className="card text-center py-3">
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-stone-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <Table columns={columns} data={auctions} keyExtractor={(a) => a.id} loading={loading} emptyText="No auctions yet." />
    </div>
  )
}
