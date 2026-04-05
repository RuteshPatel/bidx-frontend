import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import Button from '@/components/ui/Button'
import Table, { Column } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import { playerService, Player } from '@/api/services/playerService'

const MOCK_PLAYERS: Player[] = [
  { id: 1, user_id: 10, tenant_id: 1, team_id: 1,    playing_role: 'Batsman',     batting_style: 'Right-hand',  bowling_style: null,             base_price: 500000,  is_active: true,  full_name: 'Rohan Shah'    },
  { id: 2, user_id: 11, tenant_id: 1, team_id: null, playing_role: 'Bowler',      batting_style: 'Left-hand',   bowling_style: 'Fast',           base_price: 400000,  is_active: true,  full_name: 'Priya Kapoor'  },
  { id: 3, user_id: 12, tenant_id: 1, team_id: 2,    playing_role: 'All-Rounder', batting_style: 'Right-hand',  bowling_style: 'Medium Fast',    base_price: 750000,  is_active: true,  full_name: 'Aman Trivedi'  },
  { id: 4, user_id: 13, tenant_id: 1, team_id: null, playing_role: 'Wicket-Keeper',batting_style: 'Right-hand', bowling_style: null,             base_price: 600000,  is_active: false, full_name: 'Kavya Reddy'   },
  { id: 5, user_id: 14, tenant_id: 1, team_id: 3,    playing_role: 'Batsman',     batting_style: 'Left-hand',   bowling_style: null,             base_price: 350000,  is_active: true,  full_name: 'Dev Mehta'     },
]

const roleColor: Record<string, 'blue' | 'orange' | 'green' | 'stone'> = {
  'Batsman':      'blue',
  'Bowler':       'orange',
  'All-Rounder':  'green',
  'Wicket-Keeper':'stone',
}

export default function ManagePlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    playerService.list()
      .then(setPlayers)
      .catch(() => setPlayers(MOCK_PLAYERS))
      .finally(() => setLoading(false))
  }, [])

  const filtered = players.filter((p) =>
    (p.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.playing_role ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const columns: Column<Player>[] = [
    { key: 'full_name',    header: 'Player',       render: (p) => <span className="font-medium text-stone-100">{p.full_name ?? `Player #${p.user_id}`}</span> },
    { key: 'playing_role', header: 'Role',         render: (p) => p.playing_role ? <Badge color={roleColor[p.playing_role] ?? 'stone'}>{p.playing_role}</Badge> : <span className="text-stone-600">—</span> },
    { key: 'batting_style',header: 'Batting',      render: (p) => <span className="text-stone-400 text-xs">{p.batting_style ?? '—'}</span> },
    { key: 'bowling_style',header: 'Bowling',      render: (p) => <span className="text-stone-400 text-xs">{p.bowling_style ?? '—'}</span> },
    { key: 'base_price',   header: 'Base Price',   render: (p) => <span className="font-mono text-brand-400 text-xs">₹{((p.base_price ?? 0) / 100000).toFixed(1)}L</span> },
    { key: 'team_id',      header: 'Team',         render: (p) => p.team_id ? <Badge color="green">Assigned</Badge> : <Badge color="stone">Available</Badge> },
    { key: 'is_active',    header: 'Status',       render: (p) => <Badge color={p.is_active ? 'green' : 'red'}>{p.is_active ? 'Active' : 'Inactive'}</Badge> },
  ]

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-stone-100">Players</h2>
          <p className="text-stone-500 text-sm">{players.length} players registered</p>
        </div>
        <Button icon={<Plus size={15} />}>Add Player</Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or role..."
          className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-9 pr-3 py-2 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/60 transition"
        />
      </div>

      <Table columns={columns} data={filtered} keyExtractor={(p) => p.id} loading={loading} emptyText="No players found." />
    </div>
  )
}
