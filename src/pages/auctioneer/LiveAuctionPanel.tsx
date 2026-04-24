import { useLocation } from 'react-router-dom'
import {
	TrendingUp,
	Clock,
	CheckCircle2,
	XCircle,
	RotateCcw,
	Video
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuctionStore, Team, HistoryEntry } from '@/store/auctionStore'

// --- Mock Teams (Expanded for 15-20 teams layout) ---
const TEAMS: Team[] = [
	{ id: 1, name: 'Mumbai Mav', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/10' },
	{ id: 2, name: 'Delhi Titans', color: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/10' },
	{ id: 3, name: 'Chennai Kings', color: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/10' },
	{ id: 4, name: 'Kolkata Knight', color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/10' },
	{ id: 5, name: 'Punjab PBKS', color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/10' },
	{ id: 6, name: 'Royal RCB', color: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/10' },
	{ id: 7, name: 'Gujarat GT', color: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/10' },
	{ id: 8, name: 'Lucknow LSG', color: 'text-blue-300', border: 'border-blue-300/20', bg: 'bg-blue-300/10' },
	{ id: 9, name: 'Rajasthan RR', color: 'text-pink-400', border: 'border-pink-500/20', bg: 'bg-pink-500/10' },
	{ id: 10, name: 'Hyderabad SRH', color: 'text-orange-500', border: 'border-orange-500/20', bg: 'bg-orange-500/10' },
	{ id: 11, name: 'Indore Lions', color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/10' },
	{ id: 12, name: 'Goa Waves', color: 'text-teal-400', border: 'border-teal-500/20', bg: 'bg-teal-500/10' },
	{ id: 13, name: 'Pune Warriors', color: 'text-indigo-400', border: 'border-indigo-500/20', bg: 'bg-indigo-500/10' },
	{ id: 14, name: 'Bihar Blasters', color: 'text-lime-400', border: 'border-lime-500/20', bg: 'bg-lime-500/10' },
	{ id: 15, name: 'Assam Axon', color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
	{ id: 16, name: 'Kochi Tuskers', color: 'text-violet-400', border: 'border-violet-500/20', bg: 'bg-violet-500/10' },
]

// --- Increment Controls (Centralized) ---
const INCREMENT_VALUES = [
	100000,   // 1L
	200000,   // 2L
	500000,   // 5L
	1000000,  // 10L
	2000000,  // 20L
	5000000,  // 50L
	10000000, // 1Cr
	20000000  // 2Cr
]

export default function LiveAuctionPanel() {
	const { pathname } = useLocation()
	const {
		currentPlayer,
		currentBid,
		leadingTeam,
		status,
		history,
		setBid,
		setLeadingTeam,
		setStatus,
		addToHistory,
		removeFromHistory,
		resetAuction,
		setCurrentPlayer
	} = useAuctionStore()

	// --- Tabs determined by URL ---
	const activeTab = pathname.split('/').pop() || 'bidding'

	// --- Actions ---
	const handleIncrement = (amount: number) => {
		const nextBid = (currentBid || currentPlayer.basePrice) + amount
		setBid(nextBid)
	}

	const handleTeamSelect = (team: Team) => {
		if (leadingTeam?.id === team.id) {
			setLeadingTeam(null)
			return
		}
		setLeadingTeam(team)
	}

	const finalizeAuction = (result: 'sold' | 'unsold') => {
		if (result === 'sold' && (!leadingTeam || currentBid === 0)) {
			toast.error('Cannot sell without a valid bid')
			return
		}

		const entry: HistoryEntry = {
			id: Date.now(),
			player: currentPlayer,
			finalPrice: result === 'sold' ? currentBid : 0,
			team: result === 'sold' ? leadingTeam : null,
			status: result,
			time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		}

		addToHistory(entry)
		setStatus(result)

		if (result === 'sold') {
			toast.success(`${currentPlayer.name} SOLD to ${leadingTeam?.name}!`)
		} else {
			toast.error(`${currentPlayer.name} remained UNSOLD`)
		}
	}

	const revertAuction = (id: number) => {
		const entry = history.find(e => e.id === id)
		if (!entry) return

		removeFromHistory(id)
		setCurrentPlayer(entry.player)
		setBid(entry.finalPrice)
		setLeadingTeam(entry.team)
		// Redirecting to handler would require useNavigate, but let's just keep it simple
		toast.success(`Reverted: ${entry.player.name} moved back to auction`)
	}

	// --- Render Helpers ---
	const fmt = (val: number) => {
		if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`
		return `₹${(val / 100000).toFixed(1)}L`
	}

	return (
		<div className="h-full animate-slide-up pt-2">
			{activeTab === 'bidding' && (
				<CinematicBidding
					player={currentPlayer}
					currentBid={currentBid}
					leadingTeam={leadingTeam}
					status={status}
					fmt={fmt}
				/>
			)}
			{activeTab === 'handler' && (
				<HandlerControl
					player={currentPlayer}
					currentBid={currentBid}
					leadingTeam={leadingTeam}
					status={status}
					handleIncrement={handleIncrement}
					handleTeamSelect={handleTeamSelect}
					finalizeAuction={finalizeAuction}
					resetAuction={resetAuction}
					fmt={fmt}
				/>
			)}
			{activeTab === 'broadcast' && (
				<BroadcastView
					player={currentPlayer}
					currentBid={currentBid}
					leadingTeam={leadingTeam}
					status={status}
					fmt={fmt}
				/>
			)}
			{activeTab === 'history' && (
				<AuctionHistory
					history={history}
					revertAuction={revertAuction}
					fmt={fmt}
				/>
			)}
		</div>
	)
}

function CinematicBidding({ player, currentBid, leadingTeam, status, fmt }: any) {
	return (
		<div className="h-full grid grid-cols-5 gap-6 relative">
			{/* Left: Player Spotlight */}
			<div className="col-span-3 bg-stone-100 dark:bg-stone-900/20 border border-stone-200 dark:border-white/5 rounded-[3rem] p-10 flex flex-col items-center justify-center relative overflow-hidden group">
				<div className="absolute inset-0 bg-gradient-to-tr from-brand-600/10 via-transparent to-transparent opacity-30" />

				{/* Party Popper / Confetti Effect */}
				{status === 'sold' && (
					<div className="absolute inset-0 z-50 pointer-events-none">
						<div className="absolute top-0 left-1/4 animate-confetti-1 text-2xl">🎉</div>
						<div className="absolute top-0 left-1/2 animate-confetti-2 text-2xl">🎊</div>
						<div className="absolute top-0 right-1/4 animate-confetti-3 text-2xl">✨</div>
						<div className="absolute top-1/4 left-1/2 animate-confetti-1 text-2xl text-emerald-400">♦</div>
						<div className="absolute top-1/3 right-1/3 animate-confetti-2 text-2xl text-yellow-500">★</div>
					</div>
				)}

				<div className="relative z-10 flex flex-col items-center">
					<div className="relative w-56 aspect-[4/5] rounded-[3rem] overflow-hidden border-2 border-white/10 shadow-2xl mb-8 group-hover:scale-105 transition-transform duration-700">
						<img src={player.photo} className={`w-full h-full object-cover transition-all duration-1000 ${status === 'sold' ? 'grayscale-0 brightness-100' : 'grayscale brightness-75 hover:grayscale-0 hover:brightness-100'}`} />

						{/* SOLD Stamp Overlay */}
						{status === 'sold' && (
							<div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-4">
								<div className="border-[12px] border-emerald-500 rounded-2xl px-6 py-2 rotate-[-25deg] animate-stamp flex flex-col items-center bg-stone-950/40 backdrop-blur-sm">
									<span className="text-6xl font-display font-black text-emerald-500 uppercase tracking-tighter leading-none italic shadow-2xl">SOLD</span>
									{leadingTeam && <span className="text-xs font-black text-white uppercase tracking-widest mt-1 italic">{leadingTeam.name}</span>}
								</div>
							</div>
						)}

						{/* UNSOLD Stamp Overlay */}
						{status === 'unsold' && (
							<div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-4">
								<div className="border-[12px] border-red-500 rounded-2xl px-8 py-3 rotate-[-15deg] animate-stamp flex flex-col items-center bg-stone-950/40 backdrop-blur-sm">
									<span className="text-6xl font-display font-black text-red-500 uppercase tracking-tighter leading-none italic shadow-2xl">UNSOLD</span>
								</div>
							</div>
						)}
					</div>
					<h2 className="text-4xl font-display font-black text-stone-900 dark:text-white italic tracking-tighter uppercase mb-2">{player.name}</h2>
					<div className="flex gap-4">
						<span className="px-6 py-2 rounded-full bg-stone-950 border border-white/5 text-brand-500 text-[10px] font-black uppercase tracking-[0.2em]">{player.role}</span>
						<span className="px-6 py-2 rounded-full bg-stone-950 border border-white/5 text-stone-400 text-[10px] font-black uppercase tracking-[0.2em]">{player.bowling}</span>
					</div>
				</div>
			</div>

			{/* Right: Real-time Stats */}
			<div className="col-span-2 flex flex-col gap-6">
				<div className="flex-1 bg-white dark:bg-stone-950 rounded-[3rem] border border-stone-200 dark:border-white/10 p-10 flex flex-col justify-center gap-10 overflow-hidden relative">
					{status === 'sold' && (
						<div className="absolute top-0 right-0 p-8 rotate-12 opacity-10">
							<div className="text-8xl font-black text-emerald-500 italic">SOLD</div>
						</div>
					)}

					<div>
						<span className="text-[10px] font-black text-stone-600 uppercase tracking-[0.4em] mb-4 block leading-none">Base Price</span>
						<div className="text-3xl font-display font-black text-stone-300 italic">{fmt(player.basePrice)}</div>
					</div>

					<div className="h-px bg-white/5" />

					<div>
						<div className="flex items-center justify-between mb-4">
							<span className={`text-[10px] font-black uppercase tracking-[0.4em] ${status === 'sold' ? 'text-emerald-500' : 'text-brand-500'}`}>
								{status === 'sold' ? 'Final Bid' : 'Current Bid'}
							</span>
							{status === 'active' && <div className="h-3 w-3 rounded-full bg-brand-500 animate-ping" />}
							{status === 'sold' && <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />}
						</div>
						<div className={`text-6xl font-display font-black italic tracking-tighter transition-colors ${status === 'sold' ? 'text-emerald-500 scale-110 origin-left duration-500' : 'text-stone-900 dark:text-white'}`}>
							{currentBid ? fmt(currentBid) : '---'}
						</div>
					</div>

					{leadingTeam && (
						<div className={`mt-4 p-6 rounded-3xl border transition-all duration-700 ${leadingTeam.border} ${leadingTeam.bg} flex items-center justify-between ${status === 'sold' ? 'scale-105 border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'animate-slide-up'}`}>
							<div className="flex flex-col">
								<span className="text-[9px] font-black text-stone-500 uppercase tracking-widest leading-none mb-1">
									{status === 'sold' ? 'Purchased By' : 'Leading Bid'}
								</span>
								<span className={`text-xl font-display font-black ${leadingTeam.color} uppercase italic`}>{leadingTeam.name}</span>
							</div>
							<TrendingUp className={status === 'sold' ? 'text-emerald-500' : leadingTeam.color} />
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

function HandlerControl({ player, currentBid, leadingTeam, status, handleIncrement, handleTeamSelect, finalizeAuction, resetAuction, fmt }: any) {
	return (
		<div className="h-full flex flex-col gap-6 pb-2">
			{/* Top Row: Increment & Sale Logic */}
			<div className="grid grid-cols-12 gap-6 flex-shrink-0">
				{/* Bid Increment Grid */}
				<div className="col-span-8 bg-white dark:bg-stone-950 rounded-[2.5rem] border border-stone-200 dark:border-white/10 p-8 shadow-sm">
					<div className="flex items-center justify-between mb-8">
						<h3 className="font-display font-black text-stone-900 dark:text-white uppercase italic tracking-widest text-sm">Increment Controls</h3>
						<span className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Current: {fmt(currentBid || player.basePrice)}</span>
					</div>
					<div className="grid grid-cols-4 gap-4">
						{INCREMENT_VALUES.map(amt => (
							<button
								key={amt}
								onClick={() => handleIncrement(amt)}
								className="h-16 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center hover:bg-brand-500 hover:text-stone-950 transition-all group"
							>
								<span className="text-xs font-black opacity-40 group-hover:opacity-100 leading-none mb-1">+</span>
								<span className="text-lg font-display font-black tracking-tighter">
									{amt >= 10000000 ? `${amt / 10000000}Cr` : `${amt / 100000}L`}
								</span>
							</button>
						))}
					</div>
				</div>

				{/* Finalization Panel */}
				<div className="col-span-4 bg-stone-100 dark:bg-stone-900/50 backdrop-blur-xl border border-stone-200 dark:border-white/5 rounded-[2.5rem] p-6 flex flex-col items-center text-center gap-4">
					<div className="flex items-center gap-4 w-full">
						<div className="w-16 h-16 rounded-2xl bg-stone-950 border border-white/5 overflow-hidden flex-shrink-0">
							<img src={player.photo} className="w-full h-full object-cover grayscale contrast-125" />
						</div>
						<div className="text-left flex-1 min-w-0">
							<h4 className="text-xl font-display font-black text-stone-900 dark:text-white uppercase italic tracking-tighter truncate">{player.name}</h4>
							<span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">{player.role}</span>
						</div>
					</div>

					<div className="w-full h-px bg-stone-200 dark:bg-white/5" />

					<div className="w-full flex gap-3">
						<button
							onClick={() => finalizeAuction('sold')}
							disabled={status === 'sold'}
							className="flex-1 h-16 bg-emerald-500 text-stone-950 font-display font-black uppercase italic tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale text-sm"
						>
							<CheckCircle2 size={16} /> SOLD
						</button>
						<button
							onClick={() => finalizeAuction('unsold')}
							disabled={status === 'unsold'}
							className="flex-1 h-16 bg-white dark:bg-stone-800 text-red-600 dark:text-red-500 border border-red-500/20 font-display font-black uppercase italic tracking-widest rounded-2xl hover:bg-stone-200 dark:hover:bg-stone-700 transition-all flex items-center justify-center gap-2 disabled:opacity-30 text-sm shadow-sm"
						>
							<XCircle size={16} /> UNSOLD
						</button>
					</div>
				</div>
			</div>

			{/* Bottom: Team Bidder Selection - FULL WIDTH */}
			<div className="flex-1 bg-white dark:bg-stone-950 rounded-[2.5rem] border border-stone-200 dark:border-white/10 p-8 flex flex-col min-h-0 shadow-sm">
				<h3 className="font-display font-black text-stone-900 dark:text-white uppercase italic tracking-widest mb-6 text-xs leading-none">Assign Leading Team</h3>
				<div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
					<div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
						{TEAMS.map(team => (
							<button
								key={team.id}
								onClick={() => handleTeamSelect(team)}
								className={`
									px-4 py-6 rounded-[1.5rem] border transition-all text-left flex flex-col justify-between h-24 group
									${leadingTeam?.id === team.id
										? `${team.bg} ${team.border} ring-2 ring-brand-500/30`
										: 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-white/5 hover:border-brand-500/50 shadow-sm'
									}
								`}
							>
								<div className="flex items-center justify-between pointer-events-none">
									<div className={`h-2 w-2 rounded-full ${leadingTeam?.id === team.id ? team.color.replace('text', 'bg') : 'bg-stone-300 dark:bg-stone-700'}`} />
									{leadingTeam?.id === team.id && <div className={`h-2.5 w-2.5 rounded-full ${team.color.replace('text', 'bg')} animate-ping opacity-75`} />}
								</div>
								<span className={`text-[13px] font-display font-black uppercase italic leading-none truncate w-full ${leadingTeam?.id === team.id ? team.color : 'text-stone-500 group-hover:text-stone-800 dark:group-hover:text-stone-300'}`}>
									{team.name}
								</span>
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

function BroadcastView({ player, currentBid, leadingTeam, status, fmt }: any) {
	return (
		<div className="h-full relative bg-stone-950 rounded-[3rem] overflow-hidden group">
			{/* Mock Streaming Feed */}
			<div className="absolute inset-0 bg-stone-900 flex items-center justify-center">
				<div className="flex flex-col items-center gap-4 text-stone-800">
					<Video size={80} strokeWidth={1} />
					<span className="font-display text-2xl font-black uppercase italic tracking-widest opacity-20">No Feed Detected</span>
				</div>
				{/* Simulated Camera Overlay Details */}
				<div className="absolute top-10 left-10 flex items-center gap-4">
					<div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full animate-pulse shadow-lg">
						<div className="h-2 w-2 bg-white rounded-full" />
						<span className="text-[10px] font-black text-white tracking-widest">LIVE</span>
					</div>
					<span className="text-xs font-mono text-stone-600 uppercase">Input: Cam-01</span>
				</div>
			</div>

			{/* BROADCAST OVERLAY: The floating player card */}
			<div className="absolute bottom-10 left-10 p-1 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl animate-slide-up">
				<div className="bg-stone-950/90 rounded-[2.8rem] p-8 flex items-center gap-8 min-w-[550px] border border-white/5">
					<div className="w-28 h-36 rounded-[2rem] bg-stone-900 border border-white/10 overflow-hidden shadow-2xl relative">
						<img src={player.photo} className="w-full h-full object-cover grayscale contrast-125 saturate-50" />
						<div className="absolute inset-x-0 bottom-0 bg-brand-500 h-1" />
					</div>

					<div className="flex-1 flex flex-col justify-between h-36 py-2">
						<div>
							<h3 className="text-3xl font-display font-black text-stone-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">{player.name}</h3>
							<div className="flex items-center gap-3">
								<span className="text-brand-500 text-[9px] font-black uppercase tracking-widest italic">{player.role}</span>
								<div className="h-1 w-1 rounded-full bg-stone-800" />
								<span className="text-stone-600 text-[9px] font-black uppercase tracking-widest italic line-through">Base: {fmt(player.basePrice)}</span>
							</div>
						</div>

						<div className="flex items-end justify-between">
							<div>
								<span className="text-[8px] font-black text-stone-600 uppercase tracking-[0.4em] mb-1.5 block leading-none italic">Live Bid</span>
								<div className="flex flex-col">
									<div className="text-5xl font-display font-black text-stone-900 dark:text-white italic tracking-tighter leading-none mb-1 transition-all">
										{currentBid ? fmt(currentBid) : fmt(player.basePrice)}
									</div>
									{leadingTeam && (
										<span className={`text-base font-display font-black ${leadingTeam.color} uppercase italic leading-none tracking-tight`}>
											{leadingTeam.name}
										</span>
									)}
								</div>
							</div>

							<div className="flex flex-col items-end opacity-40">
								<div className="text-stone-900 dark:text-white text-5xl font-black italic tracking-tighter leading-none uppercase">Bidx</div>
								<span className="text-brand-500 text-[7px] font-black tracking-[0.6em] uppercase -mt-2">Broadcast</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

function AuctionHistory({ history, revertAuction, fmt }: any) {
	return (
		<div className="h-full bg-stone-950 rounded-[3rem] border border-white/5 p-10 flex flex-col">
			<div className="flex items-center justify-between mb-10">
				<div>
					<h2 className="text-3xl font-display font-black text-stone-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">Session Log</h2>
					<p className="text-stone-500 text-sm font-medium tracking-tight">Review and correct auction finalizations</p>
				</div>
				<div className="flex items-center gap-3">
					<div className="bg-stone-900 px-6 py-3 rounded-2xl border border-white/5">
						<span className="text-[10px] font-black text-stone-600 uppercase block mb-0.5">Sold</span>
						<span className="text-xl font-display font-black text-emerald-400 leading-none">{history.filter((e: any) => e.status === 'sold').length}</span>
					</div>
					<div className="bg-stone-900 px-6 py-3 rounded-2xl border border-white/5">
						<span className="text-[10px] font-black text-stone-600 uppercase block mb-0.5">Unsold</span>
						<span className="text-xl font-display font-black text-red-500 leading-none">{history.filter((e: any) => e.status === 'unsold').length}</span>
					</div>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto pr-4 space-y-4">
				{history.length === 0 ? (
					<div className="h-full flex flex-col items-center justify-center opacity-20 grayscale border-2 border-dashed border-stone-900 rounded-[3rem]">
						<RotateCcw size={60} strokeWidth={1} />
						<p className="mt-4 font-display text-xl font-black uppercase tracking-[0.3em]">No history yet</p>
					</div>
				) : (
					history.map((entry: HistoryEntry) => (
						<div
							key={entry.id}
							className="group bg-stone-900/40 border border-white/5 rounded-3xl p-6 flex items-center justify-between hover:bg-stone-900 transition-all"
						>
							<div className="flex items-center gap-6">
								<div className="w-16 h-16 rounded-2xl bg-stone-950 border border-white/10 overflow-hidden grayscale brightness-75">
									<img src={entry.player.photo} className="w-full h-full object-cover" />
								</div>
								<div>
									<h4 className="text-xl font-display font-black text-stone-900 dark:text-white italic tracking-tighter uppercase leading-none mb-1">{entry.player.name}</h4>
									<div className="flex items-center gap-3">
										<span className="text-[10px] font-black text-stone-700 uppercase tracking-widest">{entry.player.role}</span>
										<div className="h-0.5 w-0.5 rounded-full bg-stone-800" />
										<span className="text-[10px] font-black text-stone-700 uppercase tracking-widest">Base: {fmt(entry.player.basePrice)}</span>
									</div>
								</div>
							</div>

							<div className="flex-1 px-10">
								{entry.status === 'sold' ? (
									<div className="flex flex-col items-center">
										<span className={`text-[10px] font-black ${entry.team?.color} uppercase tracking-widest mb-1 italic`}>{entry.team?.name}</span>
										<span className="text-2xl font-display font-black text-emerald-400 italic leading-none">{fmt(entry.finalPrice)}</span>
									</div>
								) : (
									<div className="flex flex-col items-center">
										<span className="text-xl font-display font-black text-red-500 uppercase italic leading-none tracking-widest">UNSOLD</span>
									</div>
								)}
							</div>

							<div className="flex items-center gap-10">
								<div className="text-right">
									<span className="text-[9px] font-black text-stone-800 uppercase tracking-[0.2em] block leading-none mb-1">Logged at</span>
									<span className="text-xs font-mono font-bold text-stone-600 tracking-tighter">{entry.time}</span>
								</div>

								<button
									onClick={() => revertAuction(entry.id)}
									className="p-4 bg-stone-950 border border-white/5 text-stone-600 hover:text-red-500 hover:border-red-500/30 rounded-2xl transition-all group/rev shadow-lg"
									title="Revert Auction"
								>
									<RotateCcw size={18} className="group-hover/rev:rotate-[-90deg] transition-transform" />
								</button>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	)
}
