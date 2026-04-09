import client from '../client'
import { ENDPOINTS } from '../endpoints'

export interface Team {
  id: number
  name: string
  short_name: string | null
  logo: string | null
  purse_amount: number
  owner_id: number | null
  tenant_id: number
  created_at?: string
  modified_at?: string
}

export interface TeamPayload {
  name: string
  tenant_id: number
  owner_id?: number | null
  short_name?: string | null
  purse_amount?: number
  logo?: File | null
}

export const teamService = {
  list: async (tenant_id?: number): Promise<Team[]> => {
    const { data } = await client.get<Team[]>(ENDPOINTS.TEAMS.LIST, {
      params: { tenant_id }
    })
    return data
  },

  create: async (payload: TeamPayload): Promise<Team> => {
    const formData = new FormData()
    formData.append('name', payload.name)
    formData.append('tenant_id', String(payload.tenant_id))
    if (payload.owner_id !== undefined && payload.owner_id !== null) {
      formData.append('owner_id', String(payload.owner_id))
    }
    if (payload.short_name) formData.append('short_name', payload.short_name)
    if (payload.purse_amount !== undefined) {
      formData.append('purse_amount', String(payload.purse_amount))
    }
    if (payload.logo) formData.append('logo', payload.logo)

    const { data } = await client.post<Team>(ENDPOINTS.TEAMS.CREATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },

  update: async (id: number, payload: Partial<TeamPayload>): Promise<Team> => {
    const formData = new FormData()
    if (payload.name) formData.append('name', payload.name)
    if (payload.owner_id !== undefined) {
      formData.append('owner_id', payload.owner_id ? String(payload.owner_id) : '')
    }
    if (payload.short_name !== undefined) {
      formData.append('short_name', payload.short_name || '')
    }
    if (payload.purse_amount !== undefined) {
      formData.append('purse_amount', String(payload.purse_amount))
    }
    if (payload.logo) formData.append('logo', payload.logo)

    const { data } = await client.put<Team>(ENDPOINTS.TEAMS.UPDATE(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(ENDPOINTS.TEAMS.DELETE(id))
  },

  bulkUpload: async (file: File, tenant_id?: number): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file)
    if (tenant_id) formData.append('tenant_id', String(tenant_id))
    const { data } = await client.post(ENDPOINTS.TEAMS.BULK, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  }
}

