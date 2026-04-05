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
  is_active: boolean
}

export interface TeamCreate {
  name: string
  short_name?: string
  purse_amount?: number
}

export const teamService = {
  list: async (): Promise<Team[]> => {
    const { data } = await client.get<Team[]>(ENDPOINTS.TEAMS.LIST)
    return data
  },

  create: async (payload: TeamCreate): Promise<Team> => {
    const { data } = await client.post<Team>(ENDPOINTS.TEAMS.CREATE, payload)
    return data
  },

  update: async (id: number, payload: Partial<TeamCreate>): Promise<Team> => {
    const { data } = await client.put<Team>(ENDPOINTS.TEAMS.UPDATE(id), payload)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(ENDPOINTS.TEAMS.DELETE(id))
  },
}
