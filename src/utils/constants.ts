export const PLAYING_ROLES = [
  'Batsman',
  'Bowler',
  'All-Rounder',
  'Wicket-Keeper',
  'WK-Batsman',
] as const

export const BATTING_STYLES = [
  'Right-hand',
  'Left-hand',
] as const

export const BOWLING_STYLES = [
  'Fast',
  'Medium Fast',
  'Medium',
  'Off-spin',
  'Leg-spin',
  'Left-arm Orthodox',
] as const

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN:       'admin',
  OWNER:       'owner',
  AUCTIONEER:  'auctioneer',
} as const
