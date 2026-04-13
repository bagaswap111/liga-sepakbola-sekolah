import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { CheckCircle, XCircle, Eye, FileText, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected'
  }
  const labels: Record<string, string> = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' }
  return <span className={map[status]}>{labels[status]}</span>
}

export default function AdminTeams() {
  const qc = useQueryClient()
  const [expanded, setExpanded] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [filter, setFilter] = useState('all')

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['admin-teams'],
    queryFn: () => api.get('/admin/teams').then(r => r.data),
  })

  const verifyMut = useMutation({
    mutationFn: (data: any) => api.put('/admin/teams/verify', data),
    onSuccess: (_, vars) => {
      toast.success(vars.status === 'approved' ? 'Tim disetujui!' : 'Tim ditolak')
      qc.invalidateQueries({ queryKey: ['admin-teams'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: () => toast.error('Gagal memperbarui status'),
  })

  const paymentMut = useMutation({
    mutationFn: (data: any) => api.put('/admin/teams/confirm-payment', data),
    onSuccess: () => { toast.success('Pembayaran dikonfirmasi'); qc.invalidateQueries({ queryKey: ['admin-teams'] }) },
    onError: () => toast.error('Gagal konfirmasi'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/teams/${id}`),
    onSuccess: () => { toast.success('Tim dihapus'); qc.invalidateQueries({ queryKey: ['admin-teams'] }) },
    onError: () => toast.error('Gagal menghapus'),
  })

  const filtered = filter === 'all' ? teams : teams.filter((t: any) => t.status === filter)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Manajemen Tim</h1>
      <p className="text-gray-500 mb-6">Verifikasi pendaftaran & kelola data tim</p>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[{ k: 'all', l: 'Semua' }, { k: 'pending', l: 'Menunggu' }, { k: 'approved', l: 'Disetujui' }, { k: 'rejected', l: 'Ditolak' }].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)}
            className={clsx('px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              filter === f.k ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
            {f.l} {f.k !== 'all' && `(${teams.filter((t: any) => t.status === f.k).length})`}
          </button>
        ))}
      </div>

      {isLoading ? <div className="text-center py-20 text-gray-400">Memuat...</div> : (
        <div className="space-y-4">
          {filtered.map((team: any) => (
            <div key={team.id} className="card">
              {/* Header row */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">
                    {team.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{team.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {statusBadge(team.status)}
                      <span className="text-xs text-gray-400">{team.players?.length ?? 0} pemain</span>
                      {team.paymentCompleted && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">💳 Lunas</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {team.status === 'pending' && (
                    <>
                      <button onClick={() => verifyMut.mutate({ teamId: team.id, status: 'approved' })}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">
                        <CheckCircle className="w-4 h-4" /> Setujui
                      </button>
                      <button onClick={() => {
                        const reason = prompt('Alasan penolakan (opsional):')
                        verifyMut.mutate({ teamId: team.id, status: 'rejected', rejectionReason: reason || '' })
                      }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
                        <XCircle className="w-4 h-4" /> Tolak
                      </button>
                    </>
                  )}
                  {team.status === 'approved' && (
                    <button onClick={() => verifyMut.mutate({ teamId: team.id, status: 'pending' })}
                      className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition-colors">
                      Reset ke Pending
                    </button>
                  )}
                  <button onClick={() => setExpanded(expanded === team.id ? null : team.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                    <Eye className="w-4 h-4" />
                    {expanded === team.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  <button onClick={() => { if (confirm('Hapus tim ini?')) deleteMut.mutate(team.id) }}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {expanded === team.id && (
                <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Info */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3 text-sm">Informasi Tim</h4>
                    <div className="space-y-1.5 text-sm text-gray-600">
                      <p><span className="font-medium">Pelatih:</span> {team.coachName} ({team.coachPhone})</p>
                      <p><span className="font-medium">Manajer:</span> {team.managerName} ({team.managerPhone})</p>
                      {team.schoolAddress && <p><span className="font-medium">Alamat:</span> {team.schoolAddress}</p>}
                      {team.rejectionReason && (
                        <p className="text-red-500"><span className="font-medium">Alasan ditolak:</span> {team.rejectionReason}</p>
                      )}
                    </div>

                    {/* Payment section */}
                    <h4 className="font-semibold text-gray-700 mb-3 mt-5 text-sm">Pembayaran</h4>
                    <div className="space-y-3">
                      {/* Registration fee */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Biaya Pendaftaran</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${team.paymentCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {team.paymentCompleted ? '✓ Lunas' : 'Belum Lunas'}
                          </span>
                        </div>
                        {team.paymentProof && (
                          <div className="mt-2 flex items-center gap-2">
                            <a href={team.paymentProof} target="_blank" rel="noreferrer"
                              className="text-xs text-blue-600 underline flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Lihat Bukti Transfer
                            </a>
                            {!team.paymentCompleted && (
                              <button onClick={() => paymentMut.mutate({ teamId: team.id, type: 'registration' })}
                                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                                Konfirmasi
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Insurance */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Biaya Asuransi</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${team.insurancePaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {team.insurancePaid ? '✓ Lunas' : 'Belum Lunas'}
                          </span>
                        </div>
                        {team.insuranceProof && (
                          <div className="mt-2 flex items-center gap-2">
                            <a href={team.insuranceProof} target="_blank" rel="noreferrer"
                              className="text-xs text-blue-600 underline flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Lihat Bukti
                            </a>
                            {!team.insurancePaid && (
                              <button onClick={() => paymentMut.mutate({ teamId: team.id, type: 'insurance' })}
                                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                                Konfirmasi
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Players list */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3 text-sm">Pemain ({team.players?.length})</h4>
                    {team.players?.length === 0 ? (
                      <p className="text-sm text-gray-400">Belum ada pemain terdaftar</p>
                    ) : (
                      <div className="space-y-1.5 max-h-64 overflow-y-auto">
                        {team.players?.map((p: any) => (
                          <div key={p.id} className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg">
                            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {p.jerseyNumber}
                            </span>
                            <span className="font-medium text-gray-700 flex-1">{p.name}</span>
                            <span className="text-xs text-gray-400 bg-white px-1.5 py-0.5 rounded">{p.position}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
