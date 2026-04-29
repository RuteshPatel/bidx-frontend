import client from '../client'
import { ENDPOINTS } from '../endpoints'

export interface Auction {
  id: number
  player_id: number
  player_name?: string
  status: 'pending' | 'active' | 'sold' | 'unsold'
  base_price: number
  current_bid: number | null
  current_bidder_id: number | null
  current_bidder_name?: string | null
  tenant_id: number
}

export interface Bid {
  id: number
  auction_id: number
  owner_id: number
  owner_name?: string
  amount: number
  created_at: string
}

export const auctionService = {
  list: async (): Promise<Auction[]> => {
    const { data } = await client.get<Auction[]>(ENDPOINTS.AUCTIONS.LIST)
    return data
  },

  create: async (player_id: number): Promise<Auction> => {
    const { data } = await client.post<Auction>(ENDPOINTS.AUCTIONS.CREATE, { player_id })
    return data
  },

  start: async (id: number): Promise<Auction> => {
    const { data } = await client.post<Auction>(ENDPOINTS.AUCTIONS.START(id))
    return data
  },

  stop: async (id: number): Promise<Auction> => {
    const { data } = await client.post<Auction>(ENDPOINTS.AUCTIONS.STOP(id))
    return data
  },

  getCurrentBid: async (id: number): Promise<Bid | null> => {
    const { data } = await client.get<Bid | null>(ENDPOINTS.AUCTIONS.CURRENT_BID(id))
    return data
  },

  getBidHistory: async (id: number): Promise<Bid[]> => {
    const { data } = await client.get<Bid[]>(ENDPOINTS.AUCTIONS.BID_HISTORY(id))
    return data
  },

  acceptBid: async (id: number): Promise<Auction> => {
    const { data } = await client.post<Auction>(ENDPOINTS.AUCTIONS.ACCEPT_BID(id))
    return data
  },
}
