export default function BudgetOverview() {
  const totalPurse = 8500000
  const spent      = 4100000
  const remaining  = totalPurse - spent
  const pct        = (spent / totalPurse) * 100

  const breakdown = [
    { category: 'Batsmen',       spend: 1950000, players: 2 },
    { category: 'All-Rounders',  spend: 950000,  players: 1 },
    { category: 'Bowlers',       spend: 680000,  players: 1 },
    { category: 'Wicket-Keeper', spend: 520000,  players: 1 },
  ]

  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-brand-500', 'bg-purple-500']

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="font-display text-xl font-bold text-stone-100">Budget Overview</h2>
        <p className="text-stone-500 text-sm">Mumbai Royals · Season 2025</p>
      </div>

      {/* Big purse card */}
      <div className="card">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Total Purse</p>
            <p className="font-display text-4xl font-bold text-stone-100">₹{(totalPurse / 100000).toFixed(0)}L</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-stone-500 mb-1">Remaining</p>
            <p className="font-display text-3xl font-bold text-emerald-400">₹{(remaining / 100000).toFixed(1)}L</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-stone-500">
          <span>Spent: ₹{(spent / 100000).toFixed(1)}L ({pct.toFixed(0)}%)</span>
          <span>Available: ₹{(remaining / 100000).toFixed(1)}L</span>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {breakdown.map((b, i) => (
          <div key={b.category} className="card">
            <div className="flex items-center gap-2 mb-3">
              <div className={`h-3 w-3 rounded-full ${colors[i]}`} />
              <span className="text-sm font-medium text-stone-300">{b.category}</span>
              <span className="ml-auto text-xs text-stone-600">{b.players} player{b.players !== 1 ? 's' : ''}</span>
            </div>
            <p className="font-display text-2xl font-bold text-stone-100">₹{(b.spend / 100000).toFixed(1)}L</p>
            <div className="mt-3 h-1.5 bg-stone-800 rounded-full">
              <div
                className={`h-full rounded-full ${colors[i]}`}
                style={{ width: `${(b.spend / totalPurse) * 100}%` }}
              />
            </div>
            <p className="text-xs text-stone-600 mt-1">{((b.spend / totalPurse) * 100).toFixed(1)}% of total purse</p>
          </div>
        ))}
      </div>
    </div>
  )
}
