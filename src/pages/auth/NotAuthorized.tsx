import { useNavigate } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function NotAuthorized() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
          <ShieldOff size={28} className="text-red-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-stone-100 mb-2">Not Authorized</h1>
        <p className="text-sm text-stone-500 mb-6">
          You don't have permission to access this page. Contact your administrator.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
          <Button onClick={() => navigate('/')}>Home</Button>
        </div>
      </div>
    </div>
  )
}
