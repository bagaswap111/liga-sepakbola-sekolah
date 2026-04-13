import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Trash2, FileText, User } from 'lucide-react'
import { useState } from 'react'

const positionColors: Record<string, string> = {
  GK: 'bg-yellow-100 text-yellow-800', DF: 'bg-blue-100 text-blue-800',
  MF: 'bg-green-100 text-green-800', FW: 'bg-red-100 text-red-800',
}

export default function AdminPlayers() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterTeam, setFilterTeam] = useState('')

  const { data: players = [], isLoading } = useQuery({
    queryKey: ['admin-players'],
    queryFn: () => api.get('/admin/players').then(r => r.data),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/players/${id}`),
    onSuccess: () => { toast.success('Pemain dihapus'); qc.invalidateQueries({ queryKey: ['admin-players'] }) },
    onError: () => toast.error('Gagal menghapus'),
  })

  const teams = [...new Set(players.map((p: any) => p.team?.name))].filter(Boolean)
  const filtered = players.filter((p: any) =>
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.team?.name.toLowerCase().includes(search.toLowerCase())) &&
    (!filterTeam || p.team?.name === filterTeam)
  )

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Daftar Pemain</h1>
      <p className="text-gray-500 mb-6">Seluruh pemain yang terdaftar</p>

      <div className="flex flex-wrap gap-3 mb-6">
        <input type="text" placeholder="Cari pemain atau tim..." value={search} onChange={e => setSearch(e.target.value)} className="input-field max-w-xs" />
        <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} className="input-field max-w-xs">
          <option value="">Semua Tim</option>
          {teams.map((t: any) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Pemain</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Tim</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">#</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Posisi</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Tgl Lahir</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Dokumen</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Memuat...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Tidak ada pemain</td></tr>
              ) : filtered.map((p: any) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.photoUrl ? (
                        <img src={p.photoUrl} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <span className="font-medium text-gray-800">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.team?.name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="w-7 h-7 bg-blue-600 text-white rounded-full text-xs font-bold inline-flex items-center justify-center">{p.jerseyNumber}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${positionColors[p.position] || 'bg-gray-100 text-gray-600'}`}>{p.position}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.birthDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {p.studentIdCardUrl && <a href={p.studentIdCardUrl} target="_blank" rel="noreferrer" title="Kartu Pelajar" className="text-blue-500 hover:text-blue-700"><FileText className="w-4 h-4" /></a>}
                      {p.parentalConsentUrl && <a href={p.parentalConsentUrl} target="_blank" rel="noreferrer" title="Surat Izin Orang Tua" className="text-green-500 hover:text-green-700"><FileText className="w-4 h-4" /></a>}
                      {p.healthCertificateUrl && <a href={p.healthCertificateUrl} target="_blank" rel="noreferrer" title="Surat Sehat" className="text-purple-500 hover:text-purple-700"><FileText className="w-4 h-4" /></a>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => { if (confirm('Hapus pemain ini?')) deleteMut.mutate(p.id) }}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-xs text-gray-400 border-t">
          {filtered.length} pemain ditampilkan
        </div>
      </div>
    </div>
  )
}
