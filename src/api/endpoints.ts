export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN:  '/auth/login',
    LOGOUT: '/auth/logout',
    ME:     '/auth/me',
  },

  // Admin
  ADMIN: {
    TENANTS:  '/admin/tenants',
    USERS:    '/admin/users',
  },

  // Teams
  TEAMS: {
    LIST:   '/teams',
    CREATE: '/teams',
    BY_ID:  (id: number) => `/teams/${id}`,
    UPDATE: (id: number) => `/teams/${id}`,
    DELETE: (id: number) => `/teams/${id}`,
  },

  // Players
  PLAYERS: {
    LIST:   '/players',
    CREATE: '/players',
    BY_ID:  (id: number) => `/players/${id}`,
    UPDATE: (id: number) => `/players/${id}`,
  },

  // Auctions
  AUCTIONS: {
    LIST:         '/auctions',
    CREATE:       '/auctions',
    BY_ID:        (id: number) => `/auctions/${id}`,
    START:        (id: number) => `/auctions/${id}/start`,
    STOP:         (id: number) => `/auctions/${id}/stop`,
    CURRENT_BID:  (id: number) => `/auctions/${id}/current-bid`,
    BID_HISTORY:  (id: number) => `/auctions/${id}/bids`,
    ACCEPT_BID:   (id: number) => `/auctions/${id}/accept`,
  },

  // Owner
  OWNER: {
    MY_TEAM:   '/owner/my-team',
    BUDGET:    '/owner/budget',
    BID_HISTORY: '/owner/bids',
  },
} as const
