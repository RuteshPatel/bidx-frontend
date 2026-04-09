import client from '../client'
import { ENDPOINTS } from '../endpoints'

export interface Player {
  id: number
  user_id: number
  tenant_id: number
  team_id: number | null
  playing_role: string | null
  batting_style: string | null
  bowling_style: string | null
  base_price: number | null
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

export interface PlayerPayload {
  // User fields
  full_name?: string
  email?: string
  password?: string
  phone?: string
  gender?: string
  dob?: string
  profile_photo?: File | null
  // Player fields
  tenant_id?: number
  team_id?: number | null
  playing_role?: string
  batting_style?: string
  bowling_style?: string
  base_price?: number
}

export const playerService = {
  list: async (tenant_id?: number, team_id?: number): Promise<Player[]> => {
    const { data } = await client.get<Player[]>(ENDPOINTS.PLAYERS.LIST, {
      params: { tenant_id, team_id }
    })
    return data
  },

  create: async (payload: PlayerPayload): Promise<Player> => {
    const formData = new FormData()
    
    // User fields
    if (payload.full_name) formData.append('full_name', payload.full_name)
    if (payload.email) formData.append('email', payload.email)
    if (payload.password) formData.append('password', payload.password)
    if (payload.phone) formData.append('phone', payload.phone)
    if (payload.gender) formData.append('gender', payload.gender)
    if (payload.dob) formData.append('dob', payload.dob)
    if (payload.profile_photo) formData.append('profile_photo', payload.profile_photo)

    // Player fields
    if (payload.tenant_id) formData.append('tenant_id', String(payload.tenant_id))
    if (payload.team_id !== undefined) {
      formData.append('team_id', payload.team_id ? String(payload.team_id) : '')
    }
    if (payload.playing_role) formData.append('playing_role', payload.playing_role)
    if (payload.batting_style) formData.append('batting_style', payload.batting_style)
    if (payload.bowling_style) formData.append('bowling_style', payload.bowling_style)
    if (payload.base_price !== undefined) {
      formData.append('base_price', String(payload.base_price))
    }

    const { data } = await client.post<Player>(ENDPOINTS.PLAYERS.CREATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },

  update: async (id: number, payload: Partial<PlayerPayload>): Promise<Player> => {
    const formData = new FormData()
    
    // User fields
    if (payload.full_name) formData.append('full_name', payload.full_name)
    if (payload.phone) formData.append('phone', payload.phone)
    if (payload.gender) formData.append('gender', payload.gender)
    if (payload.dob) formData.append('dob', payload.dob)
    if (payload.profile_photo) formData.append('profile_photo', payload.profile_photo)

    // Player fields
    if (payload.team_id !== undefined) {
      formData.append('team_id', payload.team_id ? String(payload.team_id) : '')
    }
    if (payload.playing_role) formData.append('playing_role', payload.playing_role)
    if (payload.batting_style) formData.append('batting_style', payload.batting_style)
    if (payload.bowling_style) formData.append('bowling_style', payload.bowling_style)
    if (payload.base_price !== undefined) {
      formData.append('base_price', String(payload.base_price))
    }

    const { data } = await client.put<Player>(ENDPOINTS.PLAYERS.UPDATE(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(ENDPOINTS.PLAYERS.DELETE(id))
  },

  bulkUpload: async (file: File, tenant_id?: number): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file)
    if (tenant_id) formData.append('tenant_id', String(tenant_id))
    const { data } = await client.post(ENDPOINTS.PLAYERS.BULK, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  }
}

