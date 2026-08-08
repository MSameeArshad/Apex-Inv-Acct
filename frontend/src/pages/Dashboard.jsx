import { useAuth } from '../context/AuthContext.jsx';

const TILES = [
  { label: 'Sale', color: 'bg-teal-500' },
  { label: 'Purchase', color: 'bg-purple-600' },
  { label: 'Sale Return', color: 'bg-blue-500' },
  { label: 'Purchase Return', color: 'bg-emerald-500' },
  { label: 'Gift Voucher', color: 'bg-amber-600' },
  { label: 'Godown', color: 'bg-rose-800' },
  { label: 'Account', color: 'bg-orange-500' },
  { label: 'Barcode Printer', color: 'bg-fuchsia-600' },
  { label: 'Trial Balance', color: 'bg-sky-500' },
  { label: 'Backup', color: 'bg-cyan-600' },
  { label: 'Purchase Report', color: 'bg-lime-600' },
  { label: 'Group', color: 'bg-slate-600' },
  { label: 'Maintenance', color: 'bg-teal-600' },
  { label: 'Account Ledger', color: 'bg-indigo-500' },
  { label: 'Report', color: 'bg-red-500' },
  { label: 'Voucher', color: 'bg-orange-400' },
  { label: 'Sale Report', color: 'bg-blue-600' },
  { label: 'Journal Voucher', color: 'bg-yellow-600' },
  { label: 'Item', color: 'bg-rose-500' },
  { label: 'Party', color: 'bg-orange-300' },
  { label: 'User', color: 'bg-sky-600' },
  { label: 'Account Group', color: 'bg-blue-400' },
  { label: 'Income Statement', color: 'bg-yellow-500' },
  { label: 'Fiscal Period', color: 'bg-violet-600' },
  { label: 'Aging Report', color: 'bg-pink-600' },
  { label: 'Sales Tax', color: 'bg-green-600' }
];

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h1 className="text-white text-2xl font-bold tracking-wide">Dashboard</h1>
        <div className="flex items-center gap-4 text-white">
          <span className="text-sm opacity-80">{user?.name} ({user?.role?.name})</span>
          <button onClick={logout} className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-sm">Logout</button>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {TILES.map((tile) => (
            <button
              key={tile.label}
              className={`${tile.color} rounded-lg shadow-lg p-4 h-28 flex flex-col justify-end text-white font-semibold text-sm hover:brightness-110 hover:-translate-y-0.5 transition transform`}
            >
              {tile.label}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
