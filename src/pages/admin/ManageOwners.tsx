import { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, Upload, User, Mail, Phone, Lock, Calendar, IndianRupee, Camera, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Table, { Column } from '@/components/ui/Table'
import Modal from '@/components/ui/Modal'
import { useAuthStore } from '@/store/authStore'
import { ownerService, Owner, OwnerCreatePayload } from '@/api/services/ownerService'
import BulkUploadModal from '@/components/shared/BulkUploadModal'

interface OwnerForm {
  full_name: string
  email: string
  password: string
  phone?: string
  gender?: string
  dob?: string
  wallet_balance: number
  profile_photo?: File | null
}

export default function ManageOwners() {
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModal] = useState(false)
  const [bulkOpen, setBulk] = useState(false)
  const [editOwner, setEditOwner] = useState<Owner | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const user = useAuthStore(s => s.user)

  const [form, setForm] = useState<OwnerForm>({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    dob: '',
    wallet_balance: 0,
    profile_photo: null
  })

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [search, setSearch] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => controller.abort()
  }, [])

  const fetchData = async (signal?: AbortSignal) => {
    setLoading(true)
    try {
      const data = await ownerService.list(signal)
      setOwners(data)
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return
      console.error('Failed to fetch owners:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = owners.filter(o => 
    o.user.full_name.toLowerCase().includes(search.toLowerCase()) ||
    o.user.email.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditOwner(null)
    setForm({
      full_name: '',
      email: '',
      password: '',
      phone: '',
      gender: '',
      dob: '',
      wallet_balance: 0,
      profile_photo: null
    })
    setPreviewUrl(null)
    setModal(true)
  }

  const openEdit = (o: Owner) => {
    setEditOwner(o)
    setForm({
      full_name: o.user.full_name,
      email: o.user.email,
      password: '', // Don't show password
      phone: o.user.phone || '',
      gender: o.user.gender || '',
      dob: o.user.dob || '',
      wallet_balance: o.wallet_balance,
      profile_photo: null
    })
    setPreviewUrl(o.user.profile_photo || null)
    setModal(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setForm(f => ({ ...f, profile_photo: file }))
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const validate = () => {
    if (!form.full_name) return 'Full name is required'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) return 'Valid email is required'
    if (!editOwner && (!form.password || form.password.length < 6)) return 'Password must be at least 6 characters'
    return null
  }

  const handleSave = async () => {
    const error = validate()
    if (error) { toast.error(error); return }

    setSaving(true)
    try {
      if (!user?.tenant_id) {
        toast.error('Session error: Tenant ID not found. Please re-login.')
        setSaving(false)
        return
      }

      const payload: OwnerCreatePayload = {
        ...form,
        tenant_id: user.tenant_id
      }

      if (editOwner) {
        const updated = await ownerService.update(editOwner.id, payload)
        setOwners(prev => prev.map(o => o.id === editOwner.id ? updated : o))
        toast.success('Owner updated successfully')
      } else {
        const created = await ownerService.create(payload)
        setOwners(prev => [created, ...prev])
        toast.success('Owner created successfully')
      }
      setModal(false)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save owner')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this owner? This will also remove the associated user account.')) return
    try {
      await ownerService.delete(id)
      setOwners(prev => prev.filter(o => o.id !== id))
      toast.success('Owner deleted')
    } catch (err) {
      toast.error('Failed to delete owner')
    }
  }

  const handleBulkUpload = async (file: File) => {
    await ownerService.bulkUpload(file, user?.tenant_id)
    fetchData()
  }

  const columns: Column<Owner>[] = [
    {
      key: 'user',
      header: 'Owner',
      render: (o) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center overflow-hidden flex-shrink-0">
            {o.user.profile_photo ? (
              <img src={o.user.profile_photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={18} className="text-stone-500" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-stone-100 truncate">{o.user.full_name}</span>
            <span className="text-xs text-stone-500 truncate">{o.user.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'wallet_balance',
      header: 'Wallet Balance',
      render: (o) => (
        <div className="flex flex-col">
          <span className="font-mono text-brand-400">₹{(o.wallet_balance / 100000).toFixed(1)}L</span>
          <span className="text-[10px] text-stone-500">Remaining</span>
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Added On',
      render: (o) => <span className="text-stone-400 text-xs">{o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (o) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(o)} className="text-stone-500 hover:text-stone-200 transition-colors p-1.5 rounded hover:bg-white/5">
            <Pencil size={14} />
          </button>
          <button onClick={() => handleDelete(o.id)} className="text-stone-500 hover:text-red-400 transition-colors p-1.5 rounded hover:bg-red-500/5">
            <Trash2 size={14} />
          </button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-stone-100">Owners</h2>
          <p className="text-stone-500 text-sm">Manage team owners and their bidding wallets</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={<Upload size={16} />} onClick={() => setBulk(true)}>Bulk Import</Button>
          <Button icon={<Plus size={16} />} onClick={openCreate}>Create Owner</Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500">
           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email..."
          className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-200 placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all shadow-inner"
        />
      </div>

      <Table
        columns={columns}
        data={filtered}
        keyExtractor={(o) => o.id}
        loading={loading}
        emptyText="No owners registered yet."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModal(false)}
        title={editOwner ? 'Edit Owner Profile' : 'Create New Owner'}
        size="xl"
      >
        <div className="space-y-8 py-2">
          {/* Section 1: Profile Photo */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-stone-900 border-2 border-stone-800 flex items-center justify-center overflow-hidden ring-4 ring-stone-900/50">
                {previewUrl ? (
                  <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-stone-700" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg hover:bg-brand-400 transition-colors ring-2 ring-stone-950"
              >
                <Camera size={14} />
              </button>
              {previewUrl && (
                <button
                  onClick={() => { setPreviewUrl(null); setForm(f => ({ ...f, profile_photo: null })) }}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-stone-800 text-stone-400 flex items-center justify-center hover:text-red-400 transition-colors border border-stone-700"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <p className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">Profile Picture</p>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest">Account Information</h3>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-400 flex items-center gap-2 uppercase">
                  <User size={12} className="text-brand-500/70" /> Full Name *
                </label>
                <input
                  value={form.full_name}
                  onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-400 flex items-center gap-2 uppercase">
                  <Mail size={12} className="text-brand-500/70" /> Email Address *
                </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="name@example.com"
                    disabled={!!editOwner}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
  
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone-400 flex items-center gap-2 uppercase">
                    <Lock size={12} className="text-brand-500/70" /> {editOwner ? 'Update Password' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder={editOwner ? "Leave blank to keep current" : "Minimum 6 characters"}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all shadow-inner"
                  />
                </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest">Additional Details</h3>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-400 flex items-center gap-2 uppercase">
                  <Phone size={12} className="text-brand-500/70" /> Phone Number
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 00000 00000"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone-400 flex items-center gap-2 uppercase">
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all shadow-inner"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone-400 flex items-center gap-2 uppercase">
                    <Calendar size={12} className="text-brand-500/70" /> Date of Birth
                  </label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm(f => ({ ...f, dob: e.target.value }))}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all shadow-inner [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-400 flex items-center gap-2 uppercase">
                  <IndianRupee size={12} className="text-brand-500/70" /> Wallet Balance (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.wallet_balance}
                    onChange={(e) => setForm(f => ({ ...f, wallet_balance: Number(e.target.value) }))}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-3 text-sm font-mono text-brand-400 placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all shadow-inner"
                  />
                  <IndianRupee size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-stone-800">
            <Button variant="secondary" onClick={() => setModal(false)} className="flex-1 rounded-xl py-3" disabled={saving}>
              Cancel
            </Button>
            <Button loading={saving} onClick={handleSave} className="flex-1 rounded-xl py-3 shadow-lg shadow-brand-500/20">
              {editOwner ? 'Save Changes' : 'Create Owner Account'}
            </Button>
          </div>
        </div>
      </Modal>

      <BulkUploadModal
        open={bulkOpen}
        onClose={() => setBulk(false)}
        onUpload={handleBulkUpload}
        title="Bulk Import Owners"
      />
    </div>
  )
}
