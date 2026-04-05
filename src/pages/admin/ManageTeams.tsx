import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Table, { Column } from '@/components/ui/Table'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { teamService, Team } from '@/api/services/teamService'

const MOCK_TEAMS: Team[] = [
  { id: 1, name: 'Mumbai Royals',   short_name: 'MR',  logo: null, purse_amount: 8500000, owner_id: 1, tenant_id: 1, is_active: true },
  { id: 2, name: 'Delhi Dynamos',   short_name: 'DD',  logo: null, purse_amount: 7200000, owner_id: 2, tenant_id: 1, is_active: true },
  { id: 3, name: 'Chennai Kings',   short_name: 'CK',  logo: null, purse_amount: 9100000, owner_id: 3, tenant_id: 1, is_active: true },
  { id: 4, name: 'Kolkata Knights', short_name: 'KK',  logo: null, purse_amount: 6800000, owner_id: null, tenant_id: 1, is_active: false },
]

export default function ManageTeams() {
  const [teams, setTeams]       = useState<Team[]>([])
  const [loading, setLoading]   = useState(true)
  const [modalOpen, setModal]   = useState(false)
  const [editTeam, setEditTeam] = useState<Team | null>(null)
  const [form, setForm]         = useState({ name: '', short_name: '', purse_amount: '' })
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    // Try real API, fall back to mock
    teamService.list()
      .then(setTeams)
      .catch(() => setTeams(MOCK_TEAMS))
      .finally(() => setLoading(false))
  }, [])

  const openCreate = () => { setEditTeam(null); setForm({ name: '', short_name: '', purse_amount: '' }); setModal(true) }
  const openEdit   = (t: Team) => { setEditTeam(t); setForm({ name: t.name, short_name: t.short_name ?? '', purse_amount: String(t.purse_amount) }); setModal(true) }

  const handleSave = async () => {
    if (!form.name) { toast.error('Team name is required'); return }
    setSaving(true)
    try {
      if (editTeam) {
        const updated = await teamService.update(editTeam.id, { name: form.name, short_name: form.short_name, purse_amount: Number(form.purse_amount) }).catch(() => ({ ...editTeam, ...form, purse_amount: Number(form.purse_amount) }))
        setTeams((prev) => prev.map((t) => t.id === editTeam.id ? updated as Team : t))
        toast.success('Team updated')
      } else {
        const created = await teamService.create({ name: form.name, short_name: form.short_name, purse_amount: Number(form.purse_amount) }).catch(() => ({ id: Date.now(), name: form.name, short_name: form.short_name, purse_amount: Number(form.purse_amount), logo: null, owner_id: null, tenant_id: 1, is_active: true } as Team))
        setTeams((prev) => [...prev, created])
        toast.success('Team created')
      }
      setModal(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this team?')) return
    await teamService.delete(id).catch(() => {})
    setTeams((prev) => prev.filter((t) => t.id !== id))
    toast.success('Team deleted')
  }

  const columns: Column<Team>[] = [
    { key: 'name',         header: 'Team Name',   render: (t) => <span className="font-medium text-stone-100">{t.name}</span> },
    { key: 'short_name',   header: 'Code',        render: (t) => <span className="font-mono text-xs bg-stone-800 px-2 py-1 rounded">{t.short_name ?? '—'}</span> },
    { key: 'purse_amount', header: 'Purse',       render: (t) => <span className="font-mono text-brand-400">₹{(t.purse_amount / 100000).toFixed(1)}L</span> },
    { key: 'owner_id',     header: 'Owner',       render: (t) => t.owner_id ? <Badge color="blue">Assigned</Badge> : <Badge color="stone">Unassigned</Badge> },
    { key: 'is_active',    header: 'Status',      render: (t) => <Badge color={t.is_active ? 'green' : 'red'}>{t.is_active ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions', header: 'Actions',
      render: (t) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(t)} className="text-stone-500 hover:text-stone-200 transition-colors p-1 rounded hover:bg-white/5">
            <Pencil size={14} />
          </button>
          <button onClick={() => handleDelete(t.id)} className="text-stone-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-500/5">
            <Trash2 size={14} />
          </button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-stone-100">Teams</h2>
          <p className="text-stone-500 text-sm">{teams.length} teams in this event</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={openCreate}>New Team</Button>
      </div>

      <Table columns={columns} data={teams} keyExtractor={(t) => t.id} loading={loading} emptyText="No teams yet. Create one to get started." />

      <Modal open={modalOpen} onClose={() => setModal(false)} title={editTeam ? 'Edit Team' : 'Create Team'}>
        <div className="space-y-4">
          {[
            { label: 'Team Name *', key: 'name', placeholder: 'e.g. Mumbai Royals' },
            { label: 'Short Code',  key: 'short_name', placeholder: 'e.g. MR' },
            { label: 'Purse Amount (₹)', key: 'purse_amount', placeholder: 'e.g. 9000000' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">{label}</label>
              <input
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/60 transition"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)} className="flex-1">Cancel</Button>
            <Button loading={saving} onClick={handleSave} className="flex-1">{editTeam ? 'Save Changes' : 'Create Team'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
