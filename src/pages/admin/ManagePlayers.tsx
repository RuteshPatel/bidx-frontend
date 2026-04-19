import { useState, useEffect, useRef } from 'react'
import { Plus, Search, Pencil, Trash2, Upload, User as UserIcon, Camera, X, Mail, Phone, Lock, Calendar, IndianRupee, Briefcase, Award, Activity, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Table, { Column } from '@/components/ui/Table'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import { playerService, Player, PlayerPayload } from '@/api/services/playerService'
import { teamService, Team } from '@/api/services/teamService'
import BulkUploadModal from '@/components/shared/BulkUploadModal'

interface PlayerForm {
  full_name: string
  email: string
  password: string
  phone: string
  gender: string
  dob: string
  profile_photo: File | null
  team_id: string
  playing_role: string
  batting_style: string
  bowling_style: string
  base_price: number
}

const roleColor: Record<string, 'blue' | 'orange' | 'green' | 'stone'> = {
  'Batsman': 'blue',
  'Bowler': 'orange',
  'All-Rounder': 'green',
  'Wicket-Keeper': 'stone',
}

export default function ManagePlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [teamFilter, setTeamFilter] = useState('')
  const [modalOpen, setModal] = useState(false)
  const [bulkOpen, setBulk] = useState(false)
  const [editPlayer, setEditPlayer] = useState<Player | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const user = useAuthStore(s => s.user)

  const [form, setForm] = useState<PlayerForm>({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    dob: '',
    profile_photo: null,
    team_id: '',
    playing_role: '',
    batting_style: '',
    bowling_style: '',
    base_price: 0
  })

  useEffect(() => {
    if (user?.tenant_id) {
      const controller = new AbortController()
      fetchData(controller.signal)
      return () => controller.abort()
    }
  }, [user?.tenant_id])

  const fetchData = async (signal?: AbortSignal) => {
    setLoading(true)
    try {
      const [playersData, teamsData] = await Promise.all([
        playerService.list(user?.tenant_id, undefined, signal).catch(() => []),
        teamService.list(user?.tenant_id, signal).catch(() => [])
      ])
      setPlayers(playersData)
      setTeams(teamsData)
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return
      console.error('Failed to fetch players/teams:', err)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditPlayer(null)
    setForm({
      full_name: '',
      email: '',
      password: '',
      phone: '',
      gender: '',
      dob: '',
      profile_photo: null,
      team_id: '',
      playing_role: '',
      batting_style: '',
      bowling_style: '',
      base_price: 0
    })
    setPreviewUrl(null)
    setModal(true)
  }

  const openEdit = (p: Player) => {
    setEditPlayer(p)
    setForm({
      full_name: p.user.full_name,
      email: p.user.email,
      password: '',
      phone: p.user.phone || '',
      gender: p.user.gender || '',
      dob: p.user.dob || '',
      profile_photo: null,
      team_id: p.team_id ? String(p.team_id) : '',
      playing_role: p.playing_role || '',
      batting_style: p.batting_style || '',
      bowling_style: p.bowling_style || '',
      base_price: p.base_price || 0
    })
    setPreviewUrl(p.user.profile_photo || null)
    setModal(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setForm(f => ({ ...f, profile_photo: file }))
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    if (!form.full_name) { toast.error('Full name is required'); return }
    if (!editPlayer && !form.email) { toast.error('Email is required'); return }
    if (!editPlayer && !form.password) { toast.error('Password is required'); return }
    if (!editPlayer && form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }

    if (!user?.tenant_id) {
      toast.error('Session error: Tenant ID not found. Please re-login.')
      return
    }

    setSaving(true)
    try {
      const payload: PlayerPayload = {
        ...form,
        team_id: form.team_id ? Number(form.team_id) : null,
        base_price: Number(form.base_price),
        tenant_id: user.tenant_id
      }

      // Cleanup payload for update
      if (editPlayer) {
        delete payload.email; // Usually emails shouldn't be changed through profile update
        if (!payload.password) delete payload.password;
      }

      if (editPlayer) {
        const updated = await playerService.update(editPlayer.id, payload)
        setPlayers(prev => prev.map(p => p.id === editPlayer.id ? updated : p))
        toast.success('Player updated successfully')
      } else {
        const created = await playerService.create(payload)
        setPlayers(prev => [created, ...prev])
        toast.success('Player registered successfully')
      }
      setModal(false)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save player')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this player? This will remove their user account and profile.')) return
    try {
      await playerService.delete(id)
      setPlayers(prev => prev.filter(p => p.id !== id))
      toast.success('Player deleted')
    } catch (err) {
      toast.error('Failed to delete player')
    }
  }

  const handleBulkUpload = async (file: File) => {
    await playerService.bulkUpload(file, user?.tenant_id)
    fetchData()
  }

  const filtered = players.filter((p) => {
    const matchesSearch = p.user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.user.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.playing_role || '').toLowerCase().includes(search.toLowerCase())

    const matchesRole = !roleFilter || p.playing_role === roleFilter
    const matchesTeam = !teamFilter || (teamFilter === 'unsold' ? !p.team_id : String(p.team_id) === teamFilter)

    return matchesSearch && matchesRole && matchesTeam
  })

  const columns: Column<Player>[] = [
    {
      key: 'user',
      header: 'Player',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
            {p.user.profile_photo ? (
              <img src={p.user.profile_photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={18} className="text-stone-600" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-stone-100 truncate">{p.user.full_name}</span>
            <span className="text-[10px] text-stone-500 truncate">{p.user.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'playing_role',
      header: 'Role',
      render: (p) => p.playing_role ? (
        <Badge color={roleColor[p.playing_role] || 'stone'}>{p.playing_role}</Badge>
      ) : (
        <span className="text-stone-600">—</span>
      )
    },
    {
      key: 'styles',
      header: 'Technique',
      render: (p) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-stone-400 capitalize">{p.batting_style || 'Not Set'}</span>
          <span className="text-[10px] text-stone-500 capitalize">{p.bowling_style || 'Not Set'}</span>
        </div>
      )
    },
    {
      key: 'base_price',
      header: 'Base Price',
      render: (p) => (
        <div className="flex flex-col">
          <span className="font-mono text-brand-400 font-bold">₹{((p.base_price || 0) / 100000).toFixed(1)}L</span>
        </div>
      )
    },
    {
      key: 'team_id',
      header: 'Current Team',
      render: (p) => {
        const team = teams.find(t => t.id === p.team_id)
        return team ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded overflow-hidden bg-stone-800 border border-stone-700">
              {team.logo && <img src={team.logo} className="w-full h-full object-cover" />}
            </div>
            <span className="text-xs text-stone-300">{team.name}</span>
          </div>
        ) : (
          <Badge color="stone">Unsold</Badge>
        )
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (p) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(p)} className="text-stone-500 hover:text-stone-200 transition-colors p-1.5 rounded hover:bg-white/5">
            <Pencil size={15} />
          </button>
          <button onClick={() => handleDelete(p.id)} className="text-stone-500 hover:text-red-400 transition-colors p-1.5 rounded hover:bg-red-500/5">
            <Trash2 size={15} />
          </button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-stone-100">Players</h2>
          <p className="text-stone-500 text-sm">Manage cricketing profiles and player registrations</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={<Upload size={16} />} onClick={() => setBulk(true)}>Bulk Upload</Button>
          <Button icon={<Plus size={16} />} onClick={openCreate}>Register Player</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, or role..."
            className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-200 placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 appearance-none cursor-pointer min-w-[140px]"
          >
            <option value="">All Roles</option>
            <option value="Batsman">Batsman</option>
            <option value="Bowler">Bowler</option>
            <option value="All-Rounder">All-Rounder</option>
            <option value="Wicket-Keeper">Wicket-Keeper</option>
          </select>

          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 appearance-none cursor-pointer min-w-[140px]"
          >
            <option value="">All Teams</option>
            <option value="unsold">Unsold Only</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      <Table
        columns={columns}
        data={filtered}
        keyExtractor={(p) => p.id}
        loading={loading}
        emptyText="No players listed yet."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModal(false)}
        title={editPlayer ? 'Update Player Profile' : 'Create Teams'}
        size="xl"
      >
        <div className="space-y-8 py-2">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-stone-900 border-2 border-stone-800 flex items-center justify-center overflow-hidden ring-4 ring-stone-900/50 shadow-2xl transition-all group-hover:border-brand-500/30">
                {previewUrl ? (
                  <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={36} className="text-stone-800" />
                )}
                <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-lg bg-brand-500 text-white shadow-xl hover:scale-110 transition-transform"
                  >
                    <Camera size={16} />
                  </button>
                </div>
              </div>
              {previewUrl && (
                <button
                  onClick={() => { setPreviewUrl(null); setForm(f => ({ ...f, profile_photo: null })) }}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-stone-800 text-stone-400 flex items-center justify-center hover:text-red-400 transition-colors border border-stone-700 shadow-md"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Player Photo</p>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Identity column */}
            <div className="space-y-5">
              <h3 className="text-[10px] font-bold text-brand-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Shield size={10} /> Identity & Account
              </h3>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Full Name *</label>
                <div className="relative">
                  <UserIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" />
                  <input
                    value={form.full_name}
                    onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
                    placeholder="e.g. Virat Kohli"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-11 pr-4 py-3 text-sm text-stone-100 placeholder-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Email Address *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    disabled={!!editPlayer}
                    placeholder="name@example.com"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-11 pr-4 py-3 text-sm text-stone-100 placeholder-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {!editPlayer && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Password *</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" />
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-11 pr-4 py-3 text-sm text-stone-100 placeholder-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cricketing column */}
            <div className="space-y-5">
              <h3 className="text-[10px] font-bold text-brand-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Award size={10} /> Cricketing Profile
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Role</label>
                  <select
                    value={form.playing_role}
                    onChange={(e) => setForm(f => ({ ...f, playing_role: e.target.value }))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select</option>
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-Rounder">All-Rounder</option>
                    <option value="Wicket-Keeper">Wicket-Keeper</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Assign Team</label>
                  <select
                    value={form.team_id}
                    onChange={(e) => setForm(f => ({ ...f, team_id: e.target.value }))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Unsold</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Batting Style</label>
                <select
                  value={form.batting_style}
                  onChange={(e) => setForm(f => ({ ...f, batting_style: e.target.value }))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Style</option>
                  <option value="Right-hand Bat">Right-hand Bat</option>
                  <option value="Left-hand Bat">Left-hand Bat</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Bowling Style</label>
                <select
                  value={form.bowling_style}
                  onChange={(e) => setForm(f => ({ ...f, bowling_style: e.target.value }))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Style</option>
                  <option value="Right-arm Fast">Right-arm Fast</option>
                  <option value="Right-arm Medium">Right-arm Medium</option>
                  <option value="Right-arm Off-break">Right-arm Off-break</option>
                  <option value="Right-arm Leg-break">Right-arm Leg-break</option>
                  <option value="Left-arm Fast">Left-arm Fast</option>
                  <option value="Left-arm Medium">Left-arm Medium</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Base Price (₹)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.base_price}
                    onChange={(e) => setForm(f => ({ ...f, base_price: Number(e.target.value) }))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-3 text-sm font-mono text-brand-400 placeholder-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all"
                  />
                  <IndianRupee size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-stone-800/50">
            <Button variant="secondary" onClick={() => setModal(false)} className="flex-1 rounded-xl py-3" disabled={saving}>
              Cancel
            </Button>
            <Button loading={saving} onClick={handleSave} className="flex-1 rounded-xl py-3 shadow-lg shadow-brand-500/20">
              Submit
            </Button>
          </div>
        </div>
      </Modal>

      <BulkUploadModal
        open={bulkOpen}
        onClose={() => setBulk(false)}
        onUpload={handleBulkUpload}
        title="Bulk Registration"
      />
    </div>
  )
}
