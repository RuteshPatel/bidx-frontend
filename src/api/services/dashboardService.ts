import client from '../client'
import { ENDPOINTS } from '../endpoints'

export interface DashboardStats {
  summary: {
    total_players: number
    total_teams: number
    total_owners: number
    total_auctions?: number
  }
  auction_status: {
    players_sold: number
    players_unsold: number
    total_purse_amount?: number
    purse_used?: number
    purse_remaining?: number
    teams_filled: number
  }
  recent_activity?: Array<{
    id: number
    event: string
    type: string
    timestamp: string
    time?: string // For flattened UI usage
  }>
}

export const dashboardService = {
  getStats: async (tenant_id: number): Promise<DashboardStats> => {
    const { data } = await client.get<DashboardStats>(ENDPOINTS.DASHBOARD.STATS, {
      params: { tenant_id }
    })
    return data
  }
}
