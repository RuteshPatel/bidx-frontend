import { useState, useEffect, FormEvent } from 'react'
import { Building2, Edit2, Loader2, Trash2 } from 'lucide-react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import client from '@/api/client'
import Modal from '@/components/ui/Modal'
import Table, { Column } from '@/components/ui/Table'

const MySwal = withReactContent(Swal)

// Custom theme for SweetAlert to match our toggleable theme
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
  full_name: string | null
  email: string
  phone: string | null
  address: string | null
}

export default function ManageTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isFetching, setIsFetching] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    organization_name: '',
    full_name: '',
    email: '',
    phone: '',
    password: '',
    address: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchTenants()
  }, [])

  const fetchTenants = async () => {
    setIsFetching(true)
    try {
      const response = await client.get('/tenant/')
      setTenants(response.data)
    } catch (error: any) {
      console.error('Error fetching tenants:', error)
      MySwal.fire({
        ...getSwalConfig(),
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to load tenants.',
      })
    } finally {
      setIsFetching(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleOpenCreateModal = () => {
    setEditingId(null)
    setFormData({
      organization_name: '',
      full_name: '',
      email: '',
      phone: '',
      password: '',
      address: ''
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (tenant: Tenant) => {
    setEditingId(tenant.id)
    setFormData({
      organization_name: tenant.organization_name,
      full_name: tenant.full_name || '',
      email: tenant.email,
      phone: tenant.phone || '',
      password: '',
      address: tenant.address || ''
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleDeleteTenant = async (id: number) => {
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
      await client.delete(`/tenant/${id}`)
      MySwal.fire({
        ...getSwalConfig(),
        icon: 'success',
        title: 'Deleted!',
        text: 'Tenant deleted successfully.',
        timer: 2000,
        showConfirmButton: false
      })
      fetchTenants()
    } catch (error: any) {
      console.error('Error deleting tenant:', error)
      MySwal.fire({
        ...getSwalConfig(),
        icon: 'error',
        title: 'Failed',
        text: error.response?.data?.detail || 'Failed to delete tenant'
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.organization_name.trim()) newErrors.organization_name = 'Organization Name is required'
    if (!formData.full_name.trim()) newErrors.full_name = 'Contact Full Name is required'

    if (!formData.email.trim()) {
      newErrors.email = 'Contact Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address format'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Contact Phone is required'
    } else if (!/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(formData.phone.replace(/[\s\-]/g, ''))) {
      newErrors.phone = 'Invalid Indian mobile number'
    }

    if (!editingId && !formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)

    // Construct payload
    const payload = {
      organization_name: formData.organization_name,
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address || null,
      password: formData.password || undefined
    }

    // Filter out undefined password to avoid sending empty string if not changing
    if (!payload.password) delete payload.password

    try {
      if (editingId) {
        await client.put(`/tenant/${editingId}`, payload)
        MySwal.fire({
          ...getSwalConfig(),
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Tenant updated successfully!',
          showConfirmButton: false,
          timer: 3000
        })
      } else {
        await client.post('/tenant/', payload)
        MySwal.fire({
          ...getSwalConfig(),
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Tenant created successfully!',
          showConfirmButton: false,
          timer: 3000
        })
      }
      setIsModalOpen(false)
      fetchTenants()
    } catch (error: any) {
      console.error('Error saving tenant:', error)
      MySwal.fire({
        ...getSwalConfig(),
        icon: 'error',
        title: 'Operation Failed',
        text: error.response?.data?.detail || 'Failed to save tenant. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const columns: Column<Tenant>[] = [
    { key: 'organization_name', header: 'Organization' },
    { key: 'full_name', header: 'Contact Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (tenant) => (
        <div className="flex items-center justify-end gap-3 text-stone-400">
          <button
            onClick={() => handleOpenEditModal(tenant)}
            className="hover:text-primary-500 transition-colors p-1"
            title="Edit Tenant"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteTenant(tenant.id)}
            className="hover:text-red-500 transition-colors p-1"
            title="Delete Tenant"
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
        <h1 className="text-2xl font-bold text-stone-900 dark:text-gray-100">Manage Tenants</h1>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Building2 className="w-4 h-4" />
          Add New Tenant
        </button>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-xl shadow-sm dark:shadow-none">
        <Table
          columns={columns}
          data={tenants}
          keyExtractor={(t) => t.id}
          loading={isFetching}
          emptyText="No tenants found. Add your first tenant to get started!"
        />
      </div>

      {/* Create/Edit Tenant Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Tenant" : "Create New Tenant"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Organization Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="organization_name"
              value={formData.organization_name}
              onChange={handleInputChange}
              placeholder="e.g. Acme Corporation"
              className={`w-full bg-white dark:bg-stone-950 border ${errors.organization_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-stone-200 dark:border-stone-800 focus:border-brand-500 focus:ring-brand-500'} text-stone-900 dark:text-stone-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 transition-shadow`}
            />
            {errors.organization_name && <p className="text-red-500 text-xs mt-1">{errors.organization_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Contact Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="e.g. John Doe"
              className={`w-full bg-white dark:bg-stone-950 border ${errors.full_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-stone-200 dark:border-stone-800 focus:border-brand-500 focus:ring-brand-500'} text-stone-900 dark:text-stone-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 transition-shadow`}
            />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g. john@acme.com"
              className={`w-full bg-white dark:bg-stone-950 border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-stone-200 dark:border-stone-800 focus:border-brand-500 focus:ring-brand-500'} text-stone-900 dark:text-stone-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 transition-shadow`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Contact Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="e.g. +91 98765 43210"
              className={`w-full bg-white dark:bg-stone-950 border ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-stone-200 dark:border-stone-800 focus:border-brand-500 focus:ring-brand-500'} text-stone-900 dark:text-stone-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 transition-shadow`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Password {!editingId && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className={`w-full bg-white dark:bg-stone-950 border ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-stone-200 dark:border-stone-800 focus:border-brand-500 focus:ring-brand-500'} text-stone-900 dark:text-stone-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 transition-shadow`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            {editingId && <p className="text-[10px] text-stone-500 mt-1">Leave blank to keep current password</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="e.g. 123 Main St, Suite 400, New York, NY"
              rows={3}
              className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-lg px-4 py-2 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-shadow resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center min-w-[120px] bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-stone-50 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                editingId ? 'Save Changes' : 'Create Tenant'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
