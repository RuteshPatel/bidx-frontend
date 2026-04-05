import { useState, useEffect, FormEvent } from 'react'
import { Plus, Edit2, Loader2, Trash2 } from 'lucide-react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import client from '@/api/client'
import Modal from '@/components/ui/Modal'
import Table, { Column } from '@/components/ui/Table'
import ImageCropUploader from '@/components/ui/ImageCropUploader'

const MySwal = withReactContent(Swal)

const getSwalConfig = () => {
  const isDark = document.documentElement.classList.contains('dark')
  return {
    background: isDark ? '#1c1917' : '#ffffff',
    color: isDark ? '#f5f5f4' : '#1c1917',
    confirmButtonColor: '#ea580c',
    cancelButtonColor: isDark ? '#44403c' : '#d6d3d1',
  }
}

interface Tenant {
  id: number
  organization_name: string
}

interface TenantSetting {
  id: number
  tenant_id: number
  event_name: string
  logo: string | null
  total_overs: number | null
  players_per_team: number | null
  base_price: number | null
  purse_limit: number | null
  auction_start_date: string | null
  auction_end_date: string | null
  tenant?: Tenant
}

export default function Settings() {
  const [settings, setSettings] = useState<TenantSetting[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])

  const [isFetching, setIsFetching] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState<{
    tenant_id: number | null
    event_name: string
    logo: string
    total_overs: string
    players_per_team: string
    base_price: string
    purse_limit: string
    auction_start_date: string
    auction_end_date: string
  }>({
    tenant_id: null,
    event_name: '',
    logo: '',
    total_overs: '',
    players_per_team: '',
    base_price: '',
    purse_limit: '',
    auction_start_date: '',
    auction_end_date: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchInitialData = async () => {
      setIsFetching(true)
      try {
        const tenantsRes = await client.get('/tenant/', { signal })
        if (signal.aborted) return
        const tenantsData = tenantsRes.data
        setTenants(tenantsData)

        const settingsPromises = tenantsData.map(async (t: Tenant) => {
          try {
            const res = await client.get(`/tenant/${t.id}/settings`, { signal })
            return { ...res.data, tenant: t }
          } catch (e) {
            return null
          }
        })
        const settingsRes = await Promise.all(settingsPromises)
        if (signal.aborted) return
        setSettings(settingsRes.filter(Boolean) as TenantSetting[])
      } catch (error: any) {
        if (signal.aborted) return
        console.error('Error fetching data:', error)
        MySwal.fire({
          ...getSwalConfig(),
          icon: 'error',
          title: 'Oops...',
          text: 'Failed to load configuration data.',
        })
      } finally {
        if (!signal.aborted) setIsFetching(false)
      }
    }

    fetchInitialData()
    return () => controller.abort()
  }, [])

  const fetchSettings = async () => {
    try {
      if (tenants.length === 0) return
      const settingsPromises = tenants.map(async (t) => {
        try {
          const res = await client.get(`/tenant/${t.id}/settings`)
          return { ...res.data, tenant: t }
        } catch (e) {
          return null
        }
      })
      const settingsRes = await Promise.all(settingsPromises)
      setSettings(settingsRes.filter(Boolean) as TenantSetting[])
    } catch (e) {
      console.error(e)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleOpenCreateModal = () => {
    setEditingId(null)
    setFormData({
      tenant_id: null,
      event_name: '',
      logo: '',
      total_overs: '',
      players_per_team: '',
      base_price: '',
      purse_limit: '',
      auction_start_date: '',
      auction_end_date: ''
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (s: TenantSetting) => {
    const baseUrl = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000'
    const fullLogoUrl = s.logo
      ? (s.logo.startsWith('http') || s.logo.startsWith('data:') ? s.logo : `${baseUrl}${s.logo}`)
      : ''

    setEditingId(s.id)
    setFormData({
      tenant_id: s.tenant_id,
      event_name: s.event_name,
      logo: fullLogoUrl,
      total_overs: s.total_overs ? String(s.total_overs) : '',
      players_per_team: s.players_per_team ? String(s.players_per_team) : '',
      base_price: s.base_price ? String(s.base_price) : '',
      purse_limit: s.purse_limit ? String(s.purse_limit) : '',
      auction_start_date: s.auction_start_date ? String(s.auction_start_date) : '',
      auction_end_date: s.auction_end_date ? String(s.auction_end_date) : ''
    })
    console.log('=========? ', formData)
    setErrors({})
    setIsModalOpen(true)
  }

  const handleDelete = async (tenant_id: number) => {
    const result = await MySwal.fire({
      ...getSwalConfig(),
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    })

    if (!result.isConfirmed) return

    try {
      await client.delete(`/tenant/${tenant_id}/settings`)
      MySwal.fire({
        ...getSwalConfig(),
        icon: 'success',
        title: 'Deleted!',
        text: 'Settings removed.',
        timer: 2000,
        showConfirmButton: false
      })
      fetchSettings()
    } catch (error: any) {
      console.error('Error deleting:', error)
      MySwal.fire({
        ...getSwalConfig(),
        icon: 'error',
        title: 'Failed',
        text: error.response?.data?.detail || 'Failed to delete settings'
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.tenant_id) newErrors.tenant_id = 'Tenant is required'
    if (!formData.event_name.trim()) newErrors.event_name = 'Event name is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)

    // Backend uses FastAPI Form() + File() — must send multipart/form-data, NOT JSON.
    const fd = new FormData()
    fd.append('tenant_id', String(formData.tenant_id!))
    fd.append('event_name', formData.event_name)
    if (formData.total_overs) fd.append('total_overs', formData.total_overs)
    if (formData.players_per_team) fd.append('players_per_team', formData.players_per_team)
    if (formData.base_price) fd.append('base_price', formData.base_price)
    if (formData.purse_limit) fd.append('purse_limit', formData.purse_limit)
    if (formData.auction_start_date) fd.append('auction_start_date', formData.auction_start_date)
    if (formData.auction_end_date) fd.append('auction_end_date', formData.auction_end_date)

    // Convert base64 data URL from image cropper → real PNG File blob
    if (formData.logo && formData.logo.startsWith('data:')) {
      const res = await fetch(formData.logo)
      const blob = await res.blob()
      fd.append('logo', new File([blob], 'logo.png', { type: 'image/png' }))
    }
    // If logo is empty, omit the field — FastAPI File(None) treats missing field cas None

    try {
      // Let axios set Content-Type: multipart/form-data + boundary automatically
      if (editingId) {
        await client.put(`/tenant/${formData.tenant_id}/settings`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        MySwal.fire({
          ...getSwalConfig(),
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Settings updated successfully!',
          showConfirmButton: false,
          timer: 3000
        })
      } else {
        await client.post('/tenant/settings', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        MySwal.fire({
          ...getSwalConfig(),
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Settings created successfully!',
          showConfirmButton: false,
          timer: 3000
        })
      }
      setIsModalOpen(false)
      fetchSettings()
    } catch (error: any) {
      console.error('Error saving settings:', error)
      MySwal.fire({
        ...getSwalConfig(),
        icon: 'error',
        title: 'Operation Failed',
        text: error.response?.data?.detail || 'Failed to save settings. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Pre-calculate mapping for fast rendering
  const tenantMap = tenants.reduce((acc, t) => {
    acc[t.id] = t.organization_name
    return acc
  }, {} as Record<number, string>)

  const columns: Column<TenantSetting>[] = [
    {
      key: 'tenant_id',
      header: 'Tenant Org.',
      render: (s) => s.tenant?.organization_name || tenantMap[s.tenant_id] || `ID: ${s.tenant_id}`
    },
    { key: 'event_name', header: 'Event Name' },
    {
      key: 'purse_limit',
      header: 'Purse Limit',
      render: (s) => s.purse_limit ? `$${s.purse_limit.toLocaleString()}` : '—'
    },
    {
      key: 'auction_start_date',
      header: 'Start Date',
      render: (s) => s.auction_start_date || '—'
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (s) => (
        <div className="flex items-center justify-end gap-3 text-stone-400">
          <button
            onClick={() => handleOpenEditModal(s)}
            className="hover:text-primary-500 transition-colors p-1"
            title="Edit Settings"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(s.tenant_id)}
            className="hover:text-red-500 transition-colors p-1"
            title="Delete Settings"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-gray-100">Tenant Configurations</h1>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Configure Settings
        </button>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-xl shadow-sm dark:shadow-none">
        <Table
          columns={columns}
          data={settings}
          keyExtractor={(s) => s.id}
          loading={isFetching}
          emptyText="No tenant settings found."
        />
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Configuration" : "New Configuration"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-0" style={{ maxHeight: 'calc(85vh - 80px)' }}>
          <div className="overflow-y-auto flex-1 px-2 py-1">

            {/* Section: Identity */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full bg-primary-500" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Identity</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Target Tenant */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                    Target Tenant <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tenant_id"
                    value={formData.tenant_id ?? ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, tenant_id: e.target.value ? Number(e.target.value) : null }))}
                    className={`w-full bg-white dark:bg-stone-950 border ${errors.tenant_id
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-stone-200 dark:border-stone-800 focus:border-primary-500 focus:ring-primary-500'
                      } text-stone-900 dark:text-stone-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-shadow`}
                  >
                    <option value="" disabled>-- Select a Tenant --</option>
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.organization_name}</option>
                    ))}
                  </select>
                  {errors.tenant_id && <p className="text-red-500 text-xs mt-1.5">{errors.tenant_id}</p>}
                </div>

                {/* Event Name */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                    Event Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="event_name"
                    value={formData.event_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Summer Premier League"
                    className={`w-full bg-white dark:bg-stone-950 border ${errors.event_name
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-stone-200 dark:border-stone-800 focus:border-primary-500 focus:ring-primary-500'
                      } text-stone-900 dark:text-stone-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-shadow`}
                  />
                  {errors.event_name && <p className="text-red-500 text-xs mt-1.5">{errors.event_name}</p>}
                </div>

                {/* Logo Upload — full width */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Logo</label>
                  <ImageCropUploader
                    value={formData.logo}
                    onChange={(val) => setFormData(prev => ({ ...prev, logo: val }))}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-stone-100 dark:border-stone-800 mb-8" />

            {/* Section: Game Rules */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full bg-primary-500" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Game Rules</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Total Overs</label>
                  <input
                    type="number"
                    min="1"
                    name="total_overs"
                    value={formData.total_overs}
                    onChange={handleInputChange}
                    placeholder="e.g. 20"
                    className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Players Per Team</label>
                  <input
                    type="number"
                    min="1"
                    name="players_per_team"
                    value={formData.players_per_team}
                    onChange={handleInputChange}
                    placeholder="e.g. 15"
                    className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Base Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="base_price"
                    value={formData.base_price}
                    onChange={handleInputChange}
                    placeholder="e.g. 1000.00"
                    className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-shadow"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-stone-100 dark:border-stone-800 mb-8" />

            {/* Section: Auction Schedule */}
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full bg-primary-500" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Auction Schedule</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Purse Limit</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="purse_limit"
                    value={formData.purse_limit}
                    onChange={handleInputChange}
                    placeholder="e.g. 50000.00"
                    className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Auction Start Date</label>
                  <input
                    type="date"
                    name="auction_start_date"
                    value={formData.auction_start_date}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Auction End Date</label>
                  <input
                    type="date"
                    name="auction_end_date"
                    value={formData.auction_end_date}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-shadow"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Sticky footer */}
          <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-stone-200 dark:border-stone-800 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 min-w-[160px] bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                editingId ? 'Save Changes' : 'Create Configuration'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
