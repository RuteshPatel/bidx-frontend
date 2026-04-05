export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Super Admin Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-surface-900 rounded-xl border border-surface-800">
          <h2 className="text-gray-400 font-medium">Total Tenants</h2>
          <p className="text-3xl font-bold text-gray-100 mt-2">0</p>
        </div>
        <div className="p-6 bg-surface-900 rounded-xl border border-surface-800">
          <h2 className="text-gray-400 font-medium">Active Users</h2>
          <p className="text-3xl font-bold text-gray-100 mt-2">0</p>
        </div>
        <div className="p-6 bg-surface-900 rounded-xl border border-surface-800">
          <h2 className="text-gray-400 font-medium">Global Revenue</h2>
          <p className="text-3xl font-bold text-gray-100 mt-2">$0.00</p>
        </div>
      </div>
    </div>
  )
}
