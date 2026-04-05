import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Square, CheckCircle, XCircle, ChevronUp, Radio, Clock, Gavel } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Player {
  id: number
  name: string
  role: string
  batting_style: string
  bowling_style: string | null
  base_price: number
  photo_initial: string
}

interface Bid {
  id: number
  team: string
  amount: number
  time: string
}

type AuctionStatus = 'idle' | 'active' | 'sold' | 'unsold'

// ─── Mock Data ────────────────────────────────────────────────────────────────
const QUEUE: Player[] = [
  { id: 1, name: 'Rohan Shah',    role: 'Batsman',      batting_style: 'Right-hand', bowling_style: null,          base_price: 500000,  photo_initial: 'R' },
  { id: 2, name: 'Priya Kapoor',  role: 'Bowler',       batting_style: 'Left-hand',  bowling_style: 'Fast',        base_price: 400000,  photo_initial: 'P' },
  { id: 3, name: 'Aman Trivedi',  role: 'All-Rounder',  batting_style: 'Right-hand', bowling_style: 'Medium Fast', base_price: 750000,  photo_initial: 'A' },
  { id: 4, name: 'Dev Mehta',     role: 'Batsman',      batting_style: 'Left-hand',  bowling_style: null,          base_price: 350000,  photo_initial: 'D' },
  { id: 5, name: 'Kavya Reddy',   role: 'WK-Batsman',   batting_style: 'Right-hand', bowling_style: null,          base_price: 600000,  photo_initial: 'K' },
]

const TEAMS = ['Mumbai Royals', 'Delhi Dynamos', 'Chennai Kings', 'Kolkata Knights']

const MOCK_BIDS: Bid[] = [
  { id: 1, team: 'Mumbai Royals',   amount: 550000,  time: '10:42:01' },
  { id: 2, team: 'Delhi Dynamos',   amount: 600000,  time: '10:42:08' },
  { id: 3, team: 'Mumbai Royals',   amount: 650000,  time: '10:42:14' },
  { id: 4, team: 'Chennai Kings',   amount: 700000,  time: '10:42:20' },
  { id: 5, team: 'Mumbai Royals',   amount: 750000,  time: '10:42:27' },
]

const fmt = (n: number) => `₹${(n / 100000).toFixed(1)}L`

// ─── Timer hook ───────────────────────────────────────────────────────────────
function useCountdown(start: number, running: boolean) {
  const [secs, setSecs] = useState(start)
  useEffect(() => {
    setSecs(start)
  }, [start, running])
  useEffect(() => {
    if (!running) return
    if (secs <= 0) return
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [running, secs])
  return secs
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LiveAuctionPanel() {
  const [queueIdx, setQueueIdx]     = useState(0)
  const [status, setStatus]         = useState<AuctionStatus>('idle')
  const [bids, setBids]             = useState<Bid[]>([])
  const [currentBid, setCurrentBid] = useState<number | null>(null)
  const [leadingTeam, setLeading]   = useState<string | null>(null)
  const [auctioning, setAuctioning] = useState(false)
  const bidListRef                  = useRef<HTMLDivElement>(null)
  const pollRef                     = useRef<ReturnType<typeof setInterval> | null>(null)

  const player    = QUEUE[queueIdx]
  const isActive  = status === 'active'
  const countdown = useCountdown(30, isActive)

  // Mock polling — simulates real-time bids arriving
  const startPolling = useCallback(() => {
    let idx = 0
    pollRef.current = setInterval(() => {
      if (idx >= MOCK_BIDS.length) { clearInterval(pollRef.current!); return }
      const bid = MOCK_BIDS[idx]
      setBids((prev) => {
        const newBid = { ...bid, id: Date.now() + idx, time: new Date().toLocaleTimeString() }
        return [newBid, ...prev]
      })
      setCurrentBid(bid.amount)
      setLeading(bid.team)
      idx++
    }, 2500)
  }, [])

  const stopPolling = () => { if (pollRef.current) clearInterval(pollRef.current) }

  useEffect(() => () => stopPolling(), [])

  // Auto-scroll bid list
  useEffect(() => {
    if (bidListRef.current) bidListRef.current.scrollTop = 0
  }, [bids])

  const handleStart = async () => {
    setAuctioning(true)
    await new Promise((r) => setTimeout(r, 400))
    setStatus('active')
    setBids([])
    setCurrentBid(null)
    setLeading(null)
    startPolling()
    setAuctioning(false)
    toast.success(`Auction started for ${player.name}`)
  }

  const handleStop = () => {
    stopPolling()
    setStatus('unsold')
    toast('Auction stopped — player marked unsold', { icon: '⛔' })
  }

  const handleAccept = () => {
    if (!leadingTeam) { toast.error('No bids to accept'); return }
    stopPolling()
    setStatus('sold')
    toast.success(`${player.name} SOLD to ${leadingTeam} for ${fmt(currentBid!)}`)
  }

  const handleNext = () => {
    stopPolling()
    if (queueIdx < QUEUE.length - 1) {
      setQueueIdx((i) => i + 1)
      setStatus('idle')
      setBids([])
      setCurrentBid(null)
      setLeading(null)
    } else {
      toast('All players auctioned!', { icon: '🏆' })
    }
  }

  const roleColor: Record<string, string> = {
    'Batsman': 'text-blue-400', 'Bowler': 'text-brand-400',
    'All-Rounder': 'text-emerald-400', 'WK-Batsman': 'text-purple-400',
  }

  return (
    <div className="h-full flex gap-5 animate-slide-up">
      {/* ── Left: Player Card + Controls ── */}
      <div className="flex flex-col gap-4 w-[340px] flex-shrink-0">

        {/* Live badge */}
        <div className="flex items-center justify-between">
          <div className={clsx('inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border',
            isActive
              ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : 'bg-stone-800 border-stone-700 text-stone-500'
          )}>
            <Radio size={11} className={isActive ? 'animate-pulse' : ''} />
            {isActive ? 'LIVE' : 'STANDBY'}
          </div>
          <span className="text-xs text-stone-600 font-mono">
            {queueIdx + 1} / {QUEUE.length}
          </span>
        </div>

        {/* Player card */}
        <div className={clsx(
          'card flex-1 flex flex-col items-center justify-center text-center gap-4 transition-all duration-300',
          isActive && 'ring-1 ring-brand-500/30 shadow-lg shadow-brand-500/5'
        )}>
          {/* Avatar */}
          <div className={clsx(
            'h-24 w-24 rounded-2xl flex items-center justify-center font-display text-4xl font-bold transition-all',
            isActive
              ? 'bg-brand-500/20 border-2 border-brand-500/40 text-brand-400'
              : 'bg-stone-800 border-2 border-stone-700 text-stone-400'
          )}>
            {player.photo_initial}
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-stone-100">{player.name}</h2>
            <p className={clsx('text-sm font-medium mt-0.5', roleColor[player.role] ?? 'text-stone-400')}>{player.role}</p>
          </div>

          <div className="w-full grid grid-cols-2 gap-2 text-xs">
            {[
              ['Batting', player.batting_style],
              ['Bowling', player.bowling_style ?? 'N/A'],
            ].map(([k, v]) => (
              <div key={k} className="bg-stone-800/60 rounded-lg p-2.5">
                <p className="text-stone-600 mb-0.5">{k}</p>
                <p className="text-stone-300 font-medium">{v}</p>
              </div>
            ))}
          </div>

          <div className="w-full border-t border-stone-800 pt-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500">Base Price</p>
              <p className="font-display font-bold text-stone-200 mt-0.5">{fmt(player.base_price)}</p>
            </div>
            {status === 'sold' && (
              <Badge color="green">SOLD · {fmt(currentBid!)}</Badge>
            )}
            {status === 'unsold' && (
              <Badge color="red">UNSOLD</Badge>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-2">
          {status === 'idle' && (
            <Button onClick={handleStart} loading={auctioning} className="w-full" size="lg" icon={<Play size={15} />}>
              Start Auction
            </Button>
          )}
          {status === 'active' && (
            <>
              <Button onClick={handleAccept} className="w-full" size="lg" icon={<CheckCircle size={15} />} variant="primary">
                Accept Highest Bid
              </Button>
              <Button onClick={handleStop} className="w-full" size="lg" icon={<Square size={15} />} variant="danger">
                Mark Unsold
              </Button>
            </>
          )}
          {(status === 'sold' || status === 'unsold') && (
            <Button onClick={handleNext} className="w-full" size="lg" variant="secondary">
              Next Player →
            </Button>
          )}
        </div>
      </div>

      {/* ── Right: Bid Panel ── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

        {/* Current bid hero */}
        <div className={clsx(
          'card flex items-center justify-between transition-all duration-300',
          currentBid && isActive && 'animate-bid-flash'
        )}>
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Current Highest Bid</p>
            <p className={clsx('font-display font-bold transition-all', currentBid ? 'text-4xl text-brand-400' : 'text-2xl text-stone-700')}>
              {currentBid ? fmt(currentBid) : '—'}
            </p>
            {leadingTeam && (
              <p className="text-sm text-stone-400 mt-1 flex items-center gap-1">
                <ChevronUp size={14} className="text-emerald-400" />
                {leadingTeam}
              </p>
            )}
          </div>

          {isActive && (
            <div className="flex flex-col items-center gap-1">
              <div className={clsx(
                'font-mono text-4xl font-bold transition-colors',
                countdown <= 10 ? 'text-red-400' : countdown <= 20 ? 'text-brand-400' : 'text-stone-300'
              )}>
                {String(countdown).padStart(2, '0')}
              </div>
              <div className="flex items-center gap-1 text-xs text-stone-600">
                <Clock size={11} /> seconds
              </div>
            </div>
          )}
        </div>

        {/* Bid history */}
        <div className="card flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3 flex-shrink-0">
            <Gavel size={14} className="text-brand-400" />
            <h3 className="font-display font-semibold text-stone-200 text-sm">Bid History</h3>
            <span className="ml-auto text-xs text-stone-600">{bids.length} bids</span>
          </div>

          <div ref={bidListRef} className="flex-1 overflow-y-auto space-y-1.5 min-h-0 pr-1">
            {bids.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-stone-700">
                <Gavel size={28} />
                <p className="text-sm">No bids yet. Start the auction.</p>
              </div>
            ) : (
              bids.map((bid, i) => (
                <div
                  key={bid.id}
                  className={clsx(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all',
                    i === 0
                      ? 'bg-brand-500/10 border-brand-500/20'
                      : 'bg-stone-800/40 border-stone-800'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={clsx(
                      'h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                      i === 0 ? 'bg-brand-500/20 text-brand-400' : 'bg-stone-700 text-stone-400'
                    )}>
                      {bid.team[0]}
                    </div>
                    <span className={clsx('text-sm font-medium', i === 0 ? 'text-stone-100' : 'text-stone-400')}>
                      {bid.team}
                    </span>
                    {i === 0 && <Badge color="orange">Leading</Badge>}
                  </div>
                  <div className="text-right">
                    <p className={clsx('font-mono font-semibold', i === 0 ? 'text-brand-400' : 'text-stone-400')}>
                      {fmt(bid.amount)}
                    </p>
                    <p className="text-[10px] text-stone-700">{bid.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Player queue preview */}
        <div className="card">
          <p className="text-xs text-stone-500 uppercase tracking-wider mb-3">Up Next</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {QUEUE.slice(queueIdx + 1, queueIdx + 5).map((p) => (
              <div key={p.id} className="flex-shrink-0 flex flex-col items-center gap-1.5 w-16">
                <div className="h-10 w-10 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400 font-bold text-sm">
                  {p.photo_initial}
                </div>
                <p className="text-[10px] text-stone-500 text-center leading-tight truncate w-full">{p.name.split(' ')[0]}</p>
              </div>
            ))}
            {queueIdx >= QUEUE.length - 1 && (
              <p className="text-xs text-stone-600 self-center">No more players</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
