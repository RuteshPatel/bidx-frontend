import client from '../client'
import { ENDPOINTS } from '../endpoints'

export interface User {
  id: number
  email: string
  full_name: string
  role: string
  is_active: boolean
}

export const userService = {
  list: async (): Promise<User[]> => {
    const { data } = await client.get<User[]>(ENDPOINTS.ADMIN.USERS)
    return data
  },

  create: async (payload: Partial<User>): Promise<User> => {
    const { data } = await client.post<User>(ENDPOINTS.ADMIN.USERS, payload)
    return data
  }
}
