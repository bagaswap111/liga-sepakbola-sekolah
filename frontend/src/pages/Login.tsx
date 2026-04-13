import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Trophy, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  // Redirect if already logged in
  if (user) {
    navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Isi semua field'); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Berhasil masuk!')
      // Auth context will redirect via useEffect in AppRoutes
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Email atau password salah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white">
            <Trophy className="w-10 h-10 text-yellow-400" />
            <span className="text-2xl font-extrabold">Liga Jateng SMA</span>
          </Link>
          <p className="text-blue-200 mt-2">Masuk ke akun Anda</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Masuk</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="email@sekolah.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Belum punya akun?{' '}
            <Link to="/daftar" className="text-blue-600 font-semibold hover:text-blue-800">
              Daftarkan Tim
            </Link>
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-gray-500">
            <strong>Demo Admin:</strong> admin@ligajateng.com / Admin1234!
          </div>
        </div>

        <p className="text-center text-blue-200 text-sm mt-6">
          <Link to="/" className="hover:text-white">← Kembali ke Beranda</Link>
        </p>
      </div>
    </div>
  )
}
