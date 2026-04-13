import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Trophy, LayoutDashboard, Users, CreditCard, Calendar, User, LogOut, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const sidebarLinks = [
  { to: '/dashboard', label: 'Beranda', icon: LayoutDashboard, exact: true },
  { to: '/dashboard/profil', label: 'Profil Tim', icon: User },
  { to: '/dashboard/pemain', label: 'Daftar Pemain', icon: Users },
  { to: '/dashboard/pembayaran', label: 'Pembayaran', icon: CreditCard },
  { to: '/dashboard/jadwal', label: 'Jadwal Saya', icon: Calendar },
]

export default function TeamLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  if (!user || user.role !== 'team') return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-green-900 text-white flex flex-col min-h-screen shadow-xl">
        <div className="p-5 border-b border-green-800">
          <Link to="/" className="flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-400" />
            <div>
              <p className="font-bold text-sm">Liga Jateng SMA</p>
              <p className="text-xs text-green-300">Dashboard Tim</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const active = link.exact
              ? location.pathname === link.to
              : location.pathname.startsWith(link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active ? 'bg-green-700 text-white' : 'text-green-200 hover:bg-green-800 hover:text-white'
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-green-800">
          <p className="text-xs text-green-300 mb-2 px-3">{user.email}</p>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-green-200 hover:bg-green-800 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
