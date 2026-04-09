import client from '../client'
import { ENDPOINTS } from '../endpoints'

export interface Owner {
  id: number
  tenant_id: number
  wallet_balance: number
  created_at?: string
  modified_at?: string
  user: {
    id: number
    full_name: string
    email: string
    phone?: string
    gender?: string
    dob?: string
    profile_photo?: string
  }
}

export interface OwnerCreatePayload {
  full_name: string
  email: string
  password: string
  tenant_id: number
  phone?: string
  gender?: string
  dob?: string
  wallet_balance: number
  profile_photo?: File | null
}

export const ownerService = {
  list: async (tenant_id?: number): Promise<Owner[]> => {
    const { data } = await client.get<Owner[]>(ENDPOINTS.OWNERS.LIST, {
      params: { tenant_id }
    })
    return data
  },

  create: async (payload: OwnerCreatePayload): Promise<Owner> => {
    const formData = new FormData()
    formData.append('full_name', payload.full_name)
    formData.append('email', payload.email)
    formData.append('password', payload.password)
    formData.append('tenant_id', String(payload.tenant_id))
    formData.append('wallet_balance', String(payload.wallet_balance))

    // Optional fields
    if (payload.phone) formData.append('phone', payload.phone)
    if (payload.gender) formData.append('gender', payload.gender)
    if (payload.dob) formData.append('dob', payload.dob)
    if (payload.profile_photo) formData.append('profile_photo', payload.profile_photo)

    const { data } = await client.post<Owner>(ENDPOINTS.OWNERS.CREATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },

  update: async (id: number, payload: Partial<OwnerCreatePayload>): Promise<Owner> => {
    const formData = new FormData()
    if (payload.full_name) formData.append('full_name', payload.full_name)
    if (payload.wallet_balance !== undefined) formData.append('wallet_balance', String(payload.wallet_balance))
    if (payload.phone) formData.append('phone', payload.phone)
    if (payload.gender) formData.append('gender', payload.gender)
    if (payload.dob) formData.append('dob', payload.dob)
    if (payload.profile_photo) formData.append('profile_photo', payload.profile_photo)

    const { data } = await client.patch<Owner>(ENDPOINTS.OWNERS.UPDATE(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(ENDPOINTS.OWNERS.DELETE(id))
  },

  bulkUpload: async (file: File, tenant_id?: number): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file)
    if (tenant_id) formData.append('tenant_id', String(tenant_id))

    const { data } = await client.post(ENDPOINTS.OWNERS.BULK, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  }
}
