import client from '../client'
import { ENDPOINTS } from '../endpoints'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user_id: number
  role: string
  tenant_id?: number
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await client.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, payload)
    return data
  },

  logout: async (): Promise<void> => {
    await client.post(ENDPOINTS.AUTH.LOGOUT)
  },
}
