import Badge from '@/components/ui/Badge'
import Table, { Column } from '@/components/ui/Table'

interface BidRecord {
  id: number
  player: string
  role: string
  amount: number
  result: 'won' | 'outbid'
  time: string
}

const BIDS: BidRecord[] = [
  { id: 1, player: 'Rohan Shah',    role: 'Batsman',     amount: 1200000, result: 'won',    time: '10:42 AM' },
  { id: 2, player: 'Priya Kapoor',  role: 'Bowler',      amount: 900000,  result: 'outbid', time: '10:51 AM' },
  { id: 3, player: 'Aman Trivedi',  role: 'All-Rounder', amount: 950000,  result: 'won',    time: '11:05 AM' },
  { id: 4, player: 'Kavya Reddy',   role: 'WK-Batsman',  amount: 700000,  result: 'outbid', time: '11:18 AM' },
  { id: 5, player: 'Dev Mehta',     role: 'Batsman',     amount: 750000,  result: 'won',    time: '11:33 AM' },
  { id: 6, player: 'Sameer Joshi',  role: 'Bowler',      amount: 680000,  result: 'won',    time: '11:48 AM' },
  { id: 7, player: 'Nisha Patel',   role: 'WK-Batsman',  amount: 520000,  result: 'won',    time: '12:02 PM' },
]

export default function BiddingHistory() {
  const won    = BIDS.filter((b) => b.result === 'won')
  const outbid = BIDS.filter((b) => b.result === 'outbid')
  const totalWon = won.reduce((s, b) => s + b.amount, 0)

  const columns: Column<BidRecord>[] = [
    { key: 'player', header: 'Player',   render: (b) => <span className="font-medium text-stone-100">{b.player}</span> },
    { key: 'role',   header: 'Role',     render: (b) => <span className="text-stone-400 text-xs">{b.role}</span> },
    { key: 'amount', header: 'Bid',      render: (b) => <span className="font-mono text-sm font-semibold text-stone-200">₹{(b.amount / 100000).toFixed(1)}L</span> },
    { key: 'result', header: 'Result',   render: (b) => <Badge color={b.result === 'won' ? 'green' : 'red'}>{b.result === 'won' ? 'Won' : 'Outbid'}</Badge> },
    { key: 'time',   header: 'Time',     render: (b) => <span className="text-stone-500 text-xs">{b.time}</span> },
  ]

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <h2 className="font-display text-xl font-bold text-stone-100">Bidding History</h2>
        <p className="text-stone-500 text-sm">{BIDS.length} total bids placed</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Bids Won',    value: won.length,    color: 'text-emerald-400' },
          { label: 'Outbid',      value: outbid.length, color: 'text-red-400'     },
          { label: 'Total Spend', value: `₹${(totalWon/100000).toFixed(1)}L`, color: 'text-brand-400' },
        ].map((s) => (
          <div key={s.label} className="card text-center py-3">
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-stone-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <Table columns={columns} data={BIDS} keyExtractor={(b) => b.id} emptyText="No bids placed yet." />
    </div>
  )
}
