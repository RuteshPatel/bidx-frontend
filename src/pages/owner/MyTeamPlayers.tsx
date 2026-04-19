import { useState, useEffect } from 'react'
import Badge from '@/components/ui/Badge'
import Table, { Column } from '@/components/ui/Table'
import { ownerPanelService, OwnerTeam } from '@/api/services/ownerPanelService'
import { Player } from '@/api/services/playerService'
import Loader from '@/components/ui/Loader'
import toast from 'react-hot-toast'

const roleColor: Record<string, 'blue' | 'orange' | 'green' | 'stone'> = {
  'Batsman': 'blue', 'Bowler': 'orange', 'All-Rounder': 'green', 'Wicket-Keeper': 'stone',
}

export default function MyTeamPlayers() {
  const [team, setTeam] = useState<OwnerTeam | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => controller.abort()
  }, [])

  const fetchData = async (signal: AbortSignal) => {
    setLoading(true)
    try {
      const data = await ownerPanelService.getMyTeam(signal)
      setTeam(data)
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return
      toast.error('Failed to load team players')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  const players = team?.players || []
  const totalSpend = players.reduce((s, p) => s + (p.base_price || 0), 0)

  const columns: Column<Player>[] = [
    {
      key: 'user', header: 'Player',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center overflow-hidden">
            {p.user.profile_photo ? (
              <img src={p.user.profile_photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-stone-500">{p.user.full_name[0]}</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-stone-100 uppercase tracking-tight">{p.user.full_name}</span>
            <span className="text-[10px] text-stone-500 font-medium uppercase">{p.user.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'playing_role',
      header: 'Role',
      render: (p) => <Badge color={roleColor[p.playing_role || ''] ?? 'stone'}>{p.playing_role || 'Not Set'}</Badge>
    },
    {
      key: 'batting_style',
      header: 'Batting',
      render: (p) => <span className="text-stone-400 text-xs uppercase font-medium">{p.batting_style || '—'}</span>
    },
    {
      key: 'bowling_style',
      header: 'Bowling',
      render: (p) => <span className="text-stone-400 text-xs uppercase font-medium">{p.bowling_style || '—'}</span>
    },
    {
      key: 'base_price',
      header: 'Bought At',
      render: (p) => <span className="font-mono text-brand-400 font-bold">₹{((p.base_price || 0) / 100000).toFixed(1)}L</span>
    },
  ]

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-stone-100">{team?.name} Players</h2>
          <p className="text-stone-500 text-sm mt-1">
            {players.length} players acquired · Total spend: <span className="text-brand-400 font-bold">₹{(totalSpend / 100000).toFixed(1)}L</span>
          </p>
        </div>
        <div className="px-5 py-3 bg-stone-900/50 border border-stone-800 rounded-2xl text-right">
          <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest leading-none mb-1">Squad Strength</p>
          <p className="font-display text-2xl font-bold text-stone-100">{players.length}<span className="text-stone-700 mx-1">/</span>15</p>
        </div>
      </div>

      <div className="bg-stone-900/20 border border-stone-800/50 rounded-2xl overflow-hidden shadow-2xl">
        <Table columns={columns} data={players} keyExtractor={(p) => p.id} emptyText="No players acquired yet." />
      </div>
    </div>
  )
}
