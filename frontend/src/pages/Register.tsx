import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Trophy, Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    teamName: '', schoolAddress: '',
    coachName: '', coachPhone: '',
    managerName: '', managerPhone: '',
  })

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password || !form.teamName || !form.coachName || !form.managerName) {
      toast.error('Harap isi semua field yang wajib (*)')
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Password tidak cocok')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password minimal 8 karakter')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      toast.success('Pendaftaran berhasil! Silakan tunggu verifikasi admin.')
      navigate('/login')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Pendaftaran gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white">
            <Trophy className="w-10 h-10 text-yellow-400" />
            <span className="text-2xl font-extrabold">Liga Jateng SMA</span>
          </Link>
          <p className="text-blue-200 mt-2">Pendaftaran Tim Baru</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Daftar Tim</h2>
          <p className="text-sm text-gray-500 mb-6">Isi data tim Anda. Admin akan memverifikasi dalam 1-3 hari kerja.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account */}
            <div className="p-4 bg-blue-50 rounded-xl space-y-4">
              <h3 className="font-semibold text-blue-900 text-sm">Akun Login</h3>
              <div>
                <label className="label">Email *</label>
                <input type="email" className="input-field" placeholder="email@sekolah.sch.id" value={form.email} onChange={set('email')} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Password *</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} className="input-field pr-10" placeholder="min 8 karakter" value={form.password} onChange={set('password')} required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Konfirmasi Password *</label>
                  <input type="password" className="input-field" placeholder="ulangi password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
                </div>
              </div>
            </div>

            {/* Team info */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-4">
              <h3 className="font-semibold text-gray-700 text-sm">Data Tim / Sekolah</h3>
              <div>
                <label className="label">Nama Sekolah / Tim *</label>
                <input type="text" className="input-field" placeholder="SMA Negeri 1 ..." value={form.teamName} onChange={set('teamName')} required />
              </div>
              <div>
                <label className="label">Alamat Sekolah</label>
                <input type="text" className="input-field" placeholder="Jl. ..." value={form.schoolAddress} onChange={set('schoolAddress')} />
              </div>
            </div>

            {/* Coach & Manager */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-4">
              <h3 className="font-semibold text-gray-700 text-sm">Pelatih & Manajer</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nama Pelatih *</label>
                  <input type="text" className="input-field" placeholder="..." value={form.coachName} onChange={set('coachName')} required />
                </div>
                <div>
                  <label className="label">No. HP Pelatih</label>
                  <input type="text" className="input-field" placeholder="08..." value={form.coachPhone} onChange={set('coachPhone')} />
                </div>
                <div>
                  <label className="label">Nama Manajer *</label>
                  <input type="text" className="input-field" placeholder="..." value={form.managerName} onChange={set('managerName')} required />
                </div>
                <div>
                  <label className="label">No. HP Manajer</label>
                  <input type="text" className="input-field" placeholder="08..." value={form.managerPhone} onChange={set('managerPhone')} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Mendaftarkan...' : 'Daftarkan Tim'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-800">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
