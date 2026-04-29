import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { ownerPanelService, OwnerTeam, OwnerBudget } from '@/api/services/ownerPanelService'
import Loader from '@/components/ui/Loader'
import toast from 'react-hot-toast'
import {
	Users as UsersIcon,
	Shield as ShieldIcon,
	Target as TargetIcon,
	Zap as ZapIcon,
	Trophy as TrophyIcon,
	CreditCard as CardIcon,
	Star
} from 'lucide-react'

// Correct placeholder path from public folder
const PLACEHOLDER_IMAGE = '/placeholder_player.png'

const roleTheme: Record<string, { color: string, border: string, glow: string, icon: any, label: string }> = {
	'Batsman': {
		color: 'text-blue-400',
		border: 'border-blue-500/30',
		glow: 'from-blue-600/30 via-blue-900/10 to-transparent',
		icon: TargetIcon,
		label: 'BAT'
	},
	'Bowler': {
		color: 'text-orange-400',
		border: 'border-orange-500/30',
		glow: 'from-orange-600/30 via-orange-900/10 to-transparent',
		icon: ZapIcon,
		label: 'BWL'
	},
	'All-Rounder': {
		color: 'text-emerald-400',
		border: 'border-emerald-500/30',
		glow: 'from-emerald-600/30 via-emerald-900/10 to-transparent',
		icon: ShieldIcon,
		label: 'AR'
	},
	'Wicket-Keeper': {
		color: 'text-amber-400',
		border: 'border-amber-500/30',
		glow: 'from-amber-600/30 via-amber-900/10 to-transparent',
		icon: UsersIcon,
		label: 'WK'
	},
}

export default function MyTeamPlayers() {
	const [team, setTeam] = useState<OwnerTeam | null>(null)
	const [budget, setBudget] = useState<OwnerBudget | null>(null)
	const [boughtPrices, setBoughtPrices] = useState<Record<number, number>>({})
	const [loading, setLoading] = useState(true)
	const user = useAuthStore(s => s.user)

	const [scrolled, setScrolled] = useState(false)

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 40)
		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	useEffect(() => {
		if (user?.id) {
			const controller = new AbortController()
			fetchData(user.id, controller.signal)
			return () => controller.abort()
		}
	}, [user?.id])

	const fetchData = async (userId: number, signal: AbortSignal) => {
		setLoading(true)
		try {
			const [teamData, budgetData, historyData] = await Promise.all([
				ownerPanelService.getMyTeam(signal),
				ownerPanelService.getBudget(signal),
				ownerPanelService.getBids(userId, signal)
			])

			setTeam(teamData)
			setBudget(budgetData)

			const priceMap: Record<number, number> = {}
			historyData.forEach(res => {
				if (res.status === 'sold') {
					priceMap[res.player.id] = res.final_price
				}
			})
			setBoughtPrices(priceMap)

		} catch (err: any) {
			if (err.name === 'CanceledError' || err.name === 'AbortError') return
			toast.error('Failed to load roster data')
		} finally {
			setLoading(false)
		}
	}

	if (loading) return <Loader />

	const players = team?.players || []

	return (
		<div className="relative pb-16">
			<div className={`
				z-[100] transition-all duration-700 ease-in-out pointer-events-none xl:pointer-events-auto
				${scrolled 
					? 'fixed top-6 right-10 scale-90 opacity-100' 
					: 'absolute top-1 right-1 translate-x-0 scale-100 opacity-100'
				}
			`}>
				<div className={`
					bg-white/80 dark:bg-stone-950/80 backdrop-blur-2xl border border-stone-200 dark:border-white/10 shadow-2xl flex ring-1 ring-brand-500/10
					${scrolled 
						? 'flex-col gap-4 p-6 min-w-[150px] rounded-[2.5rem]' 
						: 'items-center px-6 h-14 min-w-[180px] rounded-2xl gap-6'
					}
				`}>
					<div className="flex flex-col">
						<span className={`font-black text-stone-600 uppercase tracking-widest leading-none ${scrolled ? 'text-[10px] mb-1' : 'text-[8px] mb-0.5'}`}>Slots</span>
						<span className={`font-display font-black text-stone-900 dark:text-white leading-none ${scrolled ? 'text-xl' : 'text-lg'}`}>
							{players.length}<span className="text-stone-300 dark:text-stone-800 mx-0.5">/</span>15
						</span>
					</div>
					<div className={scrolled ? 'h-px w-full bg-white/5' : 'w-px h-6 bg-white/5'} />
					<div className="flex flex-col">
						<span className={`font-black text-brand-500 uppercase tracking-widest leading-none italic ${scrolled ? 'text-[10px] mb-1' : 'text-[8px] mb-0.5'}`}>Spent</span>
						<span className={`font-display font-black text-brand-500 leading-none ${scrolled ? 'text-2xl' : 'text-xl'}`}>
							₹{((budget?.spent_amount || 0) / 100000).toFixed(1)}L
						</span>
					</div>
				</div>
			</div>

			<div className="animate-slide-up space-y-10">
				{/* Header Area - Contains the initial landing spot for the HUD */}
				<div className="px-1 flex items-start justify-between min-h-[100px] relative">
					<div className="space-y-1">
						<h1 className="text-3xl font-bold text-stone-900 dark:text-white tracking-tight leading-none pt-2">
							{team?.name}
						</h1>
						<p className="text-stone-500 text-sm font-medium">Official Squad Roster & Live Statistics</p>
						<div className="h-1 w-12 bg-brand-500 rounded-full mt-3" />
					</div>
					
					{/* Placeholder to keep the header height consistent */}
					{!scrolled && <div className="hidden xl:block w-[320px] h-24" />}
				</div>

				{/* Role Status Bar */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-1">
					{budget?.breakdown.map((item) => {
						const theme = roleTheme[item.role] || roleTheme['Batsman']
						return (
							<div key={item.role} className="relative bg-white dark:bg-stone-900/40 border border-stone-100 dark:border-white/5 p-4 rounded-2xl flex items-center justify-between hover:border-brand-500/30 transition-all group/role shadow-lg">
								<div className="flex items-center gap-3">
									<div className={`p-2 rounded-lg bg-stone-50 dark:bg-stone-950 ${theme.color}`}><theme.icon size={16} /></div>
									<span className="text-[11px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest">{item.role}</span>
								</div>
								<span className="text-lg font-display font-black text-stone-900 dark:text-white">{item.filled_slots}/{item.total_slots}</span>
							</div>
						)
					})}
				</div>

				{/* Cinematic Player Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-8 px-1 pt-2">
					{players.length > 0 ? (
						players.map((p) => {
							const theme = roleTheme[p.playing_role || ''] || roleTheme['Batsman']
							const boughtPrice = boughtPrices[p.id] || p.base_price || 0

							return (
								<div key={p.id} className="group relative w-full max-w-[280px] mx-auto">
									<div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] border border-white/10 transition-all duration-700 hover:scale-[1.05] hover:-translate-y-4">
										{/* PLAYER IMAGE / PLACEHOLDER */}
										<div className="absolute inset-0 z-0">
											<img
												src={p.user.profile_photo || PLACEHOLDER_IMAGE}
												alt={p.user.full_name}
												className={`h-full w-full object-cover transition-all duration-1000 group-hover:scale-110 ${!p.user.profile_photo ? 'opacity-60 grayscale contrast-125' : ''}`}
											/>
											<div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent z-10" />
											<div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-stone-950/60 via-transparent to-transparent z-10" />
											<div className={`absolute inset-0 bg-gradient-to-tr ${theme.glow} opacity-20 z-10`} />
										</div>

										{/* STATS BAR */}
										<div className="absolute inset-x-3 bottom-10 z-30 flex flex-col transition-all duration-500 transform group-hover:translate-y-[-5px]">
											{/* Name Header */}
											<div className="bg-brand-500 rounded-t-xl px-3 py-1 border-x border-t border-white/20 shadow-2xl">
												<div className="flex items-center justify-between">
													<h4 className="text-[13px] font-display font-black text-stone-950 uppercase tracking-tighter truncate leading-none">{p.user.full_name}</h4>
													<span className="text-[10px] font-black text-stone-950 uppercase">{p.playing_role}</span>
												</div>
											</div>

											{/* Details Table */}
											<div className="bg-stone-950/90 backdrop-blur-2xl border border-white/10 rounded-b-xl px-3 py-1.5 shadow-2xl">
												<div className="flex items-center justify-between gap-3">
													<div className="flex gap-3 border-r border-white/10 pr-3">
														<div className="flex flex-col">
															<span className="text-[6px] font-black text-stone-600 uppercase tracking-widest mb-0.5">Base</span>
															<span className="text-[10px] font-mono font-bold text-stone-300">₹{(p.base_price! / 100000).toFixed(1)}L</span>
														</div>
														<div className="flex flex-col">
															<span className="text-[6px] font-black text-brand-500 uppercase tracking-widest mb-0.5">Bought</span>
															<span className="text-[11px] font-mono font-black text-stone-900 dark:text-white italic leading-none">₹{(boughtPrice / 100000).toFixed(1)}L</span>
														</div>
													</div>

													<div className="flex-1 flex justify-around items-center">
														<div className="flex flex-col items-center">
															<span className="text-[6px] font-bold text-stone-500 uppercase tracking-widest mb-0.5 italic">Bat</span>
															<span className="text-[8px] font-black text-stone-700 dark:text-stone-200 uppercase leading-none">{p.batting_style?.split(' ')[0] || 'N/A'}</span>
														</div>
														<div className="flex flex-col items-center">
															<span className="text-[6px] font-bold text-stone-500 uppercase tracking-widest mb-0.5 italic">Bowl</span>
															<span className="text-[8px] font-black text-stone-700 dark:text-stone-200 uppercase leading-none">{p.bowling_style?.split(' ')[0] || 'N/A'}</span>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							)
						})
					) : (
						<div className="col-span-full py-60 flex flex-col items-center justify-center bg-stone-900/40 border-2 border-dashed border-stone-800 rounded-[5rem] opacity-30">
							<UsersIcon size={80} className="text-stone-800" />
							<p className="mt-6 text-stone-600 font-display text-2xl font-black uppercase tracking-[0.5em]">Squad Pending</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
