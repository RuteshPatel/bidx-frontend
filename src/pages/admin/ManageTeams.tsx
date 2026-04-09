import { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, Upload, Camera, X, Image as ImageIcon, IndianRupee, Shield, Hash, User, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Table, { Column } from '@/components/ui/Table'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import { teamService, Team, TeamPayload } from '@/api/services/teamService'
import { ownerService, Owner } from '@/api/services/ownerService'
import BulkUploadModal from '@/components/shared/BulkUploadModal'

interface TeamForm {
  name: string
  short_name: string
  purse_amount: number
  owner_id: string
  logo: File | null
}

export default function ManageTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('')
  const [modalOpen, setModal] = useState(false)

  const filtered = teams.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          (t.short_name || '').toLowerCase().includes(search.toLowerCase())
    const matchesOwner = !ownerFilter || String(t.owner_id) === ownerFilter
    return matchesSearch && matchesOwner
  })
  const [bulkOpen, setBulk] = useState(false)
  const [editTeam, setEditTeam] = useState<Team | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const user = useAuthStore(s => s.user)

  const [form, setForm] = useState<TeamForm>({
    name: '',
    short_name: '',
    purse_amount: 0,
    owner_id: '',
    logo: null
  })

  useEffect(() => {
    if (user?.tenant_id) {
      fetchData()
    }
  }, [user?.tenant_id])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [teamsData, ownersData] = await Promise.all([
        teamService.list(user?.tenant_id).catch(() => []),
        ownerService.list(user?.tenant_id).catch(() => [])
      ])
      setTeams(teamsData)
      setOwners(ownersData)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditTeam(null)
    setForm({
      name: '',
      short_name: '',
      purse_amount: 0,
      owner_id: '',
      logo: null
    })
    setPreviewUrl(null)
    setModal(true)
  }

  const openEdit = (t: Team) => {
    setEditTeam(t)
    setForm({
      name: t.name,
      short_name: t.short_name ?? '',
      purse_amount: t.purse_amount,
      owner_id: t.owner_id ? String(t.owner_id) : '',
      logo: null
    })
    setPreviewUrl(t.logo || null)
    setModal(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setForm(f => ({ ...f, logo: file }))
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    if (!form.name) { toast.error('Team name is required'); return }
    if (!user?.tenant_id) {
      toast.error('Session error: Tenant ID not found. Please re-login.')
      return
    }

    setSaving(true)
    try {
      const payload: TeamPayload = {
        name: form.name,
        short_name: form.short_name || null,
        purse_amount: Number(form.purse_amount),
        owner_id: form.owner_id ? Number(form.owner_id) : null,
        tenant_id: user.tenant_id,
        logo: form.logo
      }

      if (editTeam) {
        const updated = await teamService.update(editTeam.id, payload)
        setTeams((prev) => prev.map((t) => t.id === editTeam.id ? updated : t))
        toast.success('Team updated')
      } else {
        const created = await teamService.create(payload)
        setTeams((prev) => [...prev, created])
        toast.success('Team created')
      }
      setModal(false)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save team')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) return
    try {
      await teamService.delete(id)
      setTeams((prev) => prev.filter((t) => t.id !== id))
      toast.success('Team deleted')
    } catch (err) {
      toast.error('Failed to delete team')
    }
  }

  const handleBulkUpload = async (file: File) => {
    await teamService.bulkUpload(file, user?.tenant_id)
    fetchData()
  }

  const columns: Column<Team>[] = [
    {
      key: 'name',
      header: 'Team',
      render: (t) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
            {t.logo ? (
              <img src={t.logo} alt="" className="w-full h-full object-cover" />
            ) : (
              <Shield size={18} className="text-stone-600" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-stone-100 truncate">{t.name}</span>
            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">{t.short_name || 'NO CODE'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'purse_amount',
      header: 'Purse Budget',
      render: (t) => (
        <div className="flex flex-col">
          <span className="font-mono text-brand-400 font-bold">₹{(t.purse_amount / 100000).toFixed(1)}L</span>
          <span className="text-[10px] text-stone-500 uppercase">Available</span>
        </div>
      )
    },
    {
      key: 'owner_id',
      header: 'Assigned Owner',
      render: (t) => {
        const owner = owners.find(o => o.id === t.owner_id)
        return (
          <div className="flex items-center gap-2">
            {owner ? (
              <>
                <div className="w-6 h-6 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center overflow-hidden">
                  {owner.user.profile_photo ? (
                    <img src={owner.user.profile_photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={12} className="text-stone-500" />
                  )}
                </div>
                <span className="text-sm text-stone-300">{owner.user.full_name}</span>
              </>
            ) : (
              <Badge color="stone">Unassigned</Badge>
            )}
          </div>
        )
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (t) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(t)} className="text-stone-500 hover:text-stone-200 transition-colors p-1.5 rounded hover:bg-white/5">
            <Pencil size={15} />
          </button>
          <button onClick={() => handleDelete(t.id)} className="text-stone-500 hover:text-red-400 transition-colors p-1.5 rounded hover:bg-red-500/5">
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
          <h2 className="font-display text-2xl font-bold text-stone-100">Teams</h2>
          <p className="text-stone-500 text-sm">Create and manage teams for the auction event</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={<Upload size={16} />} onClick={() => setBulk(true)}>Bulk Import</Button>
          <Button icon={<Plus size={16} />} onClick={openCreate}>Create Team</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team name or code..."
            className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-200 placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 appearance-none cursor-pointer min-w-[180px]"
          >
            <option value="">All Owners</option>
            {owners.map(o => (
               <option key={o.id} value={o.id}>{o.user.full_name}</option>
            ))}
          </select>
        </div>
      </div>

      <Table
        columns={columns}
        data={filtered}
        keyExtractor={(t) => t.id}
        loading={loading}
        emptyText="No teams have been created yet."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModal(false)}
        title={editTeam ? 'Edit Team Details' : 'Create Teams'}
        size="lg"
      >
        <div className="space-y-8 py-2">
          {/* Logo Upload Section */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl bg-stone-900 border-2 border-stone-800 flex items-center justify-center overflow-hidden ring-4 ring-stone-900/50 shadow-2xl transition-all group-hover:border-brand-500/30">
                {previewUrl ? (
                  <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Shield size={48} className="text-stone-800 group-hover:text-stone-700 transition-colors" />
                )}
                <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl bg-brand-500 text-white shadow-xl hover:scale-110 transition-transform"
                   >
                    <Camera size={18} />
                   </button>
                </div>
              </div>

              {previewUrl && (
                <button
                  onClick={() => { setPreviewUrl(null); setForm(f => ({ ...f, logo: null })) }}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-stone-800 text-stone-400 flex items-center justify-center hover:text-red-400 transition-colors border border-stone-700 shadow-lg"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="text-center">
              <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Team Crest / Logo</p>
              <p className="text-[9px] text-stone-600 mt-0.5 italic">Recommended: Square PNG/JPG</p>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-stone-400 flex items-center gap-2 uppercase tracking-wider">
                  <Shield size={12} className="text-brand-500/70" /> Team Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Mumbai Mavericks"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-stone-400 flex items-center gap-2 uppercase tracking-wider">
                  <Hash size={12} className="text-brand-500/70" /> Short Code
                </label>
                <input
                  value={form.short_name}
                  onChange={(e) => setForm(f => ({ ...f, short_name: e.target.value.toUpperCase() }))}
                  placeholder="e.g. MM"
                  maxLength={5}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-sm font-mono text-stone-100 placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all shadow-inner uppercase"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-stone-400 flex items-center gap-2 uppercase tracking-wider">
                  <IndianRupee size={12} className="text-brand-500/70" /> Purse Amount (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.purse_amount}
                    onChange={(e) => setForm(f => ({ ...f, purse_amount: Number(e.target.value) }))}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-3 text-sm font-mono text-brand-400 placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all shadow-inner"
                  />
                  <IndianRupee size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-stone-400 flex items-center gap-2 uppercase tracking-wider">
                  <User size={12} className="text-brand-500/70" /> Assign Team Owner
                </label>
                <div className="relative group/select">
                  <select
                    value={form.owner_id}
                    onChange={(e) => setForm(f => ({ ...f, owner_id: e.target.value }))}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all shadow-inner appearance-none cursor-pointer pr-10"
                  >
                    <option value="">No Owner Assigned</option>
                    {owners.map(o => (
                      <option key={o.id} value={o.id}>{o.user.full_name} (Wallet: ₹{(o.wallet_balance / 100000).toFixed(1)}L)</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500 group-hover/select:text-stone-300 transition-colors">
                    <Plus size={14} className="rotate-45" /> {/* Using Plus rotated as a subtle X or simplified arrow, or I'll just use ChevronDown if I had it imported */}
                  </div>
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
        title="Bulk Import Teams"
      />
    </div>
  )
}
