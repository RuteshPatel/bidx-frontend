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
  is_active: boolean
  full_name?: string
  profile_photo?: string | null
}

export interface PlayerCreate {
  user_id: number
  playing_role?: string
  batting_style?: string
  bowling_style?: string
  base_price?: number
}

export const playerService = {
  list: async (): Promise<Player[]> => {
    const { data } = await client.get<Player[]>(ENDPOINTS.PLAYERS.LIST)
    return data
  },

  create: async (payload: PlayerCreate): Promise<Player> => {
    const { data } = await client.post<Player>(ENDPOINTS.PLAYERS.CREATE, payload)
    return data
  },

  update: async (id: number, payload: Partial<PlayerCreate>): Promise<Player> => {
    const { data } = await client.put<Player>(ENDPOINTS.PLAYERS.UPDATE(id), payload)
    return data
  },
}
