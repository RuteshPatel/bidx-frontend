import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '@/api/services/authService'
import { useAuthStore, UserRole } from '@/store/authStore'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const ROLE_HOME: Record<string, string> = {
    super_admin: '/super-admin/dashboard',
    admin: '/admin/dashboard',
    owner: '/owner/dashboard',
    auctioner: '/auctioner/panel',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill in all fields'); return }

    setLoading(true)
    try {
      const res = await authService.login({ email, password })
      const normalizedRole = res.role.toLowerCase() as UserRole
      
      setAuth(
        { 
          id: res.user_id, 
          role: normalizedRole, 
          email,
          tenant_id: res.tenant_id 
        },
        res.access_token
      )
      toast.success('Welcome back!')
      navigate(ROLE_HOME[normalizedRole] ?? '/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(msg ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-surface-950">
      {/* Left — brand panel */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between p-12 bg-gradient-to-br from-stone-900 to-stone-950 border-r border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-brand-500 flex items-center justify-center font-display font-bold text-white">BX</div>
          <span className="font-display font-bold text-xl text-stone-100">BidX</span>
        </div>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-6">
            <Zap size={12} /> Live Auction Platform
          </div>
          <h2 className="font-display text-4xl font-bold text-stone-100 leading-tight mb-4">
            Where every bid<br />tells a story.
          </h2>
          <p className="text-stone-500 text-sm leading-relaxed max-w-xs">
            Manage multi-tenant cricket auctions with real-time bidding, team management, and live auctioneer controls.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[['Real-time', 'Live bid updates'], ['Multi-tenant', 'Isolated events'], ['Role-based', 'Secure access']].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-stone-800 bg-stone-900/60 p-3">
              <p className="font-display text-xs font-semibold text-stone-200 mb-1">{t}</p>
              <p className="text-[11px] text-stone-500">{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-stone-100 mb-1.5">Sign in</h1>
            <p className="text-sm text-stone-500">Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2.5 text-sm text-stone-100 placeholder-stone-600
                           focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/60 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2.5 pr-10 text-sm text-stone-100 placeholder-stone-600
                             focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/60 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-stone-600">
            BidX Auction System &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
