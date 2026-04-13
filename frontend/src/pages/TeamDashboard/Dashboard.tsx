import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { CheckCircle, Clock, XCircle, CreditCard, Users, Calendar, AlertTriangle } from 'lucide-react'

export default function TeamDashboard() {
  const { data: team, isLoading } = useQuery({
    queryKey: ['my-team'],
    queryFn: () => api.get('/team/my-team').then(r => r.data),
  })

  if (isLoading) return <div className="flex items-center justify-center h-64 text-gray-400">Memuat...</div>

  const statusInfo = {
    pending: { icon: Clock, color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Menunggu Verifikasi', desc: 'Data tim Anda sedang ditinjau oleh admin. Proses ini 1-3 hari kerja.' },
    approved: { icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200', label: 'Tim Disetujui!', desc: 'Selamat! Tim Anda telah diverifikasi. Lengkapi pembayaran dan data pemain.' },
    rejected: { icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200', label: 'Pendaftaran Ditolak', desc: team?.rejectionReason || 'Hubungi panitia untuk informasi lebih lanjut.' },
  }
  const si = statusInfo[team?.status as keyof typeof statusInfo] || statusInfo.pending
  const StatusIcon = si.icon

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Beranda Tim</h1>
      <p className="text-gray-500 mb-8">Halo, selamat datang di dashboard <strong>{team?.name}</strong></p>

      {/* Status banner */}
      <div className={`flex items-start gap-4 p-5 rounded-xl border mb-8 ${si.color}`}>
        <StatusIcon className="w-6 h-6 mt-0.5 shrink-0" />
        <div>
          <p className="font-bold text-lg">{si.label}</p>
          <p className="mt-0.5 text-sm opacity-80">{si.desc}</p>
        </div>
      </div>

      {/* Checklist */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          {
            label: 'Profil Tim', done: !!(team?.coachName && team?.managerName),
            desc: 'Data pelatih & manajer', to: '/dashboard/profil', icon: Users
          },
          {
            label: 'Pemain Terdaftar', done: team?.players?.length > 0,
            desc: `${team?.players?.length ?? 0} pemain`, to: '/dashboard/pemain', icon: Users
          },
          {
            label: 'Biaya Pendaftaran', done: team?.paymentCompleted,
            desc: team?.paymentCompleted ? 'Lunas ✓' : team?.paymentProof ? 'Menunggu konfirmasi' : 'Belum upload bukti',
            to: '/dashboard/pembayaran', icon: CreditCard
          },
          {
            label: 'Biaya Asuransi', done: team?.insurancePaid,
            desc: team?.insurancePaid ? 'Lunas ✓' : team?.insuranceProof ? 'Menunggu konfirmasi' : 'Belum upload bukti',
            to: '/dashboard/pembayaran', icon: CreditCard
          },
        ].map(c => (
          <Link key={c.label} to={c.to} className="card hover:shadow-md transition-all group">
            <div className="flex items-center gap-2 mb-3">
              {c.done
                ? <CheckCircle className="w-5 h-5 text-green-500" />
                : <AlertTriangle className="w-5 h-5 text-yellow-500" />}
              <span className={`text-sm font-semibold ${c.done ? 'text-green-700' : 'text-yellow-700'}`}>
                {c.done ? 'Selesai' : 'Perlu tindakan'}
              </span>
            </div>
            <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{c.label}</p>
            <p className="text-sm text-gray-500 mt-1">{c.desc}</p>
          </Link>
        ))}
      </div>

      {/* Quick info */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card text-center">
          <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-3xl font-extrabold text-gray-900">{team?.players?.length ?? 0}</p>
          <p className="text-sm text-gray-500">Pemain Terdaftar</p>
        </div>
        <div className="card text-center">
          <CreditCard className={`w-8 h-8 mx-auto mb-2 ${team?.paymentCompleted ? 'text-green-500' : 'text-gray-300'}`} />
          <p className="text-lg font-bold text-gray-800">{team?.paymentCompleted ? 'Lunas' : 'Belum Lunas'}</p>
          <p className="text-sm text-gray-500">Biaya Pendaftaran</p>
        </div>
        <div className="card text-center">
          <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <Link to="/dashboard/jadwal" className="text-lg font-bold text-blue-600 hover:underline">Lihat Jadwal</Link>
          <p className="text-sm text-gray-500">Pertandingan Tim Anda</p>
        </div>
      </div>
    </div>
  )
}
