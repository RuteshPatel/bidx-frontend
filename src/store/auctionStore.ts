import { create } from 'zustand'

export interface Team {
	id: number
	name: string
	color: string
	border: string
	bg: string
}

export interface Player {
	id: number
	name: string
	role: string
	basePrice: number
	photo: string
	batting: string
	bowling: string
}

export interface HistoryEntry {
	id: number
	player: Player
	finalPrice: number
	team: Team | null
	status: 'sold' | 'unsold'
	time: string
}

export type AuctionStatus = 'idle' | 'active' | 'sold' | 'unsold'

interface AuctionState {
	currentPlayer: Player
	currentBid: number
	leadingTeam: Team | null
	status: AuctionStatus
	history: HistoryEntry[]
	
	// Actions
	setBid: (amount: number) => void
	setLeadingTeam: (team: Team | null) => void
	setStatus: (status: AuctionStatus) => void
	addToHistory: (entry: HistoryEntry) => void
	removeFromHistory: (id: number) => void
	resetAuction: () => void
	setCurrentPlayer: (player: Player) => void
}

const MOCK_PLAYERS: Player[] = [
	{ 
		id: 1, 
		name: 'Virat Kohli', 
		role: 'Batsman', 
		basePrice: 20000000, 
		photo: '/placeholder_player.png',
		batting: 'Right Hand',
		bowling: 'Right-arm medium'
	},
	{ 
		id: 2, 
		name: 'Jasprit Bumrah', 
		role: 'Bowler', 
		basePrice: 15000000, 
		photo: '/placeholder_player.png',
		batting: 'Right Hand',
		bowling: 'Right-arm fast'
	},
]

export const useAuctionStore = create<AuctionState>((set) => ({
	currentPlayer: MOCK_PLAYERS[0],
	currentBid: 0,
	leadingTeam: null,
	status: 'idle',
	history: [],

	setBid: (amount) => set({ currentBid: amount, status: 'active' }),
	setLeadingTeam: (team) => set({ leadingTeam: team }),
	setStatus: (status) => set({ status }),
	addToHistory: (entry) => set((state) => ({ 
		history: [entry, ...state.history],
		status: entry.status
	})),
	removeFromHistory: (id) => set((state) => ({
		history: state.history.filter(e => e.id !== id)
	})),
	resetAuction: () => set({ status: 'idle', currentBid: 0, leadingTeam: null }),
	setCurrentPlayer: (player) => set({ currentPlayer: player })
}))
