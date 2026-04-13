import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Trophy, Menu, X } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const navLinks = [
  { to: '/', label: 'Beranda' },
  { to: '/jadwal', label: 'Jadwal & Hasil' },
  { to: '/klasemen', label: 'Klasemen' },
  { to: '/tim', label: 'Tim' },
  { to: '/berita', label: 'Berita' },
]

export default function PublicLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-bold text-lg">
              <Trophy className="w-7 h-7 text-yellow-400" />
              <span>Liga Jateng SMA</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={clsx(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    location.pathname === l.to
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-800'
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Auth buttons */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    to={user.role === 'admin' ? '/admin' : '/dashboard'}
                    className="px-3 py-1.5 bg-yellow-400 text-blue-900 rounded-lg text-sm font-bold hover:bg-yellow-300 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button onClick={logout} className="px-3 py-1.5 text-blue-200 hover:text-white text-sm transition-colors">
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-1.5 text-blue-100 hover:text-white text-sm transition-colors">Masuk</Link>
                  <Link to="/daftar" className="px-3 py-1.5 bg-yellow-400 text-blue-900 rounded-lg text-sm font-bold hover:bg-yellow-300 transition-colors">
                    Daftar Tim
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu btn */}
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-1 bg-blue-900 border-t border-blue-800">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={clsx(
                  'block px-3 py-2 rounded-md text-sm font-medium',
                  location.pathname === l.to ? 'bg-blue-700' : 'text-blue-100 hover:bg-blue-800'
                )}
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <div className="pt-2 border-t border-blue-800 flex gap-2">
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-yellow-400 text-blue-900 rounded-lg text-sm font-bold">
                  Dashboard
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false) }}
                  className="flex-1 py-2 text-blue-200 text-sm">Keluar</button>
              </div>
            ) : (
              <div className="pt-2 border-t border-blue-800 flex gap-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 text-blue-100 text-sm">Masuk</Link>
                <Link to="/daftar" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 bg-yellow-400 text-blue-900 rounded-lg text-sm font-bold">Daftar</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-blue-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-white">Liga Jateng SMA</span>
          </div>
          <p className="text-sm">Liga Sepakbola Antar SMA Se-Jawa Tengah</p>
          <p className="text-xs mt-2 text-blue-400">© {new Date().getFullYear()} Liga Jateng SMA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
