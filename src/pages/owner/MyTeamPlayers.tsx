import Badge from '@/components/ui/Badge'
import Table, { Column } from '@/components/ui/Table'

interface TeamPlayer {
  id: number
  name: string
  role: string
  batting_style: string
  bowling_style: string | null
  price: number
}

const PLAYERS: TeamPlayer[] = [
  { id: 1, name: 'Rohan Shah',    role: 'Batsman',      batting_style: 'Right-hand', bowling_style: null,          price: 1200000 },
  { id: 2, name: 'Aman Trivedi',  role: 'All-Rounder',  batting_style: 'Right-hand', bowling_style: 'Medium Fast', price: 950000  },
  { id: 3, name: 'Dev Mehta',     role: 'Batsman',      batting_style: 'Left-hand',  bowling_style: null,          price: 750000  },
  { id: 4, name: 'Sameer Joshi',  role: 'Bowler',       batting_style: 'Right-hand', bowling_style: 'Fast',        price: 680000  },
  { id: 5, name: 'Nisha Patel',   role: 'Wicket-Keeper',batting_style: 'Right-hand', bowling_style: null,          price: 520000  },
]

const roleColor: Record<string, 'blue' | 'orange' | 'green' | 'stone'> = {
  'Batsman': 'blue', 'Bowler': 'orange', 'All-Rounder': 'green', 'Wicket-Keeper': 'stone',
}

export default function MyTeamPlayers() {
  const total = PLAYERS.reduce((s, p) => s + p.price, 0)

  const columns: Column<TeamPlayer>[] = [
    {
      key: 'name', header: 'Player',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400">
            {p.name[0]}
          </div>
          <span className="font-medium text-stone-100">{p.name}</span>
        </div>
      )
    },
    { key: 'role',          header: 'Role',         render: (p) => <Badge color={roleColor[p.role] ?? 'stone'}>{p.role}</Badge> },
    { key: 'batting_style', header: 'Batting',      render: (p) => <span className="text-stone-400 text-xs">{p.batting_style}</span> },
    { key: 'bowling_style', header: 'Bowling',      render: (p) => <span className="text-stone-400 text-xs">{p.bowling_style ?? '—'}</span> },
    { key: 'price',         header: 'Bought At',    render: (p) => <span className="font-mono text-brand-400 font-semibold">₹{(p.price / 100000).toFixed(1)}L</span> },
  ]

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-stone-100">My Team Players</h2>
          <p className="text-stone-500 text-sm">{PLAYERS.length} players · Total spend: <span className="text-brand-400">₹{(total / 100000).toFixed(1)}L</span></p>
        </div>
        <div className="text-right">
          <p className="text-xs text-stone-500">Slots Remaining</p>
          <p className="font-display text-2xl font-bold text-stone-100">{11 - PLAYERS.length}</p>
        </div>
      </div>

      <Table columns={columns} data={PLAYERS} keyExtractor={(p) => p.id} emptyText="No players acquired yet." />
    </div>
  )
}
