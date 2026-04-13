import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { Users, Trophy, Newspaper, Calendar, Clock, CheckCircle } from 'lucide-react'

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data),
  })

  const cards = [
    { label: 'Total Tim', value: stats?.totalTeams ?? 0, icon: Users, color: 'bg-blue-500', sub: `${stats?.pendingTeams ?? 0} menunggu verifikasi` },
    { label: 'Tim Disetujui', value: stats?.approvedTeams ?? 0, icon: CheckCircle, color: 'bg-green-500', sub: 'Siap bertanding' },
    { label: 'Total Pemain', value: stats?.totalPlayers ?? 0, icon: Trophy, color: 'bg-yellow-500', sub: 'Dari semua tim' },
    { label: 'Pertandingan', value: stats?.totalMatches ?? 0, icon: Calendar, color: 'bg-purple-500', sub: 'Terjadwal' },
    { label: 'Berita', value: stats?.totalNews ?? 0, icon: Newspaper, color: 'bg-pink-500', sub: 'Dipublikasikan' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Dashboard Admin</h1>
      <p className="text-gray-500 mb-8">Selamat datang di panel admin Liga Jateng SMA</p>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
        {cards.map(c => (
          <div key={c.label} className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className={`${c.color} p-2 rounded-lg`}>
                <c.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{c.value}</div>
            <div className="text-sm font-medium text-gray-700 mt-1">{c.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Pending verification alert */}
      {(stats?.pendingTeams ?? 0) > 0 && (
        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
          <Clock className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-yellow-800">
              {stats?.pendingTeams} tim menunggu verifikasi
            </p>
            <p className="text-sm text-yellow-600 mt-0.5">
              Buka menu <strong>Manajemen Tim</strong> untuk menyetujui atau menolak pendaftaran.
            </p>
          </div>
        </div>
      )}

      {/* Quick guide */}
      <div className="card">
        <h2 className="font-bold text-gray-800 mb-4">Panduan Cepat Admin</h2>
        <div className="grid gap-3 sm:grid-cols-2 text-sm text-gray-600">
          {[
            { title: '1. Verifikasi Tim', desc: 'Menu Manajemen Tim → Review data → Setujui atau tolak' },
            { title: '2. Konfirmasi Pembayaran', desc: 'Detail tim → Cek bukti transfer → Konfirmasi' },
            { title: '3. Atur Jadwal', desc: 'Menu Pertandingan → Buat jadwal antar tim yang telah disetujui' },
            { title: '4. Update Hasil', desc: 'Menu Pertandingan → Edit skor setelah pertandingan selesai' },
            { title: '5. Kelola Berita', desc: 'Menu Berita → Tambah & edit informasi liga' },
            { title: '6. Kelola Pemain', desc: 'Menu Pemain → Edit atau hapus data pemain' },
          ].map(g => (
            <div key={g.title} className="p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-700">{g.title}</p>
              <p className="text-gray-500 mt-0.5">{g.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
