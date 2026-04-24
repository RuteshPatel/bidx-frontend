import client from '../client'
import { ENDPOINTS } from '../endpoints'
import { Team } from './teamService'
import { Player } from './playerService'
import { Bid } from './auctionService'

export interface OwnerTeam extends Team {
  players: Player[]
}

export interface BudgetBreakdown {
  role: string
  spent: number
  total_slots: number
  filled_slots: number
}

export interface OwnerBudget {
  total_purse: number
  spent_amount: number
  remaining_amount: number
  breakdown: BudgetBreakdown[]
}

export interface AuctionResultResponse {
  id: number
  player: Player
  final_price: number
  status: string // 'sold', 'outbid', etc.
  created_at: string
}

export const ownerPanelService = {
  getMyTeam: async (signal?: AbortSignal): Promise<OwnerTeam> => {
    const { data } = await client.get<OwnerTeam>(ENDPOINTS.OWNER_PANEL.MY_TEAM, { signal })
    return data
  },

  getBudget: async (signal?: AbortSignal): Promise<OwnerBudget> => {
    const { data } = await client.get<OwnerBudget>(ENDPOINTS.OWNER_PANEL.BUDGET, { signal })
    return data
  },

  getBids: async (owner_id: number | string, signal?: AbortSignal): Promise<AuctionResultResponse[]> => {
    const { data } = await client.get<AuctionResultResponse[]>(ENDPOINTS.AUCTIONS.OWNER_HISTORY(owner_id), { signal })
    return data
  }
}
