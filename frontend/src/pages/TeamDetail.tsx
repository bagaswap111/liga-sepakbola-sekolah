import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { Users, ArrowLeft, User } from 'lucide-react'

const positionColors: Record<string, string> = {
  GK: 'bg-yellow-100 text-yellow-800',
  DF: 'bg-blue-100 text-blue-800',
  MF: 'bg-green-100 text-green-800',
  FW: 'bg-red-100 text-red-800',
}

export default function TeamDetail() {
  const { id } = useParams()
  const { data: team, isLoading } = useQuery({
    queryKey: ['public-team', id],
    queryFn: () => api.get(`/public/teams/${id}`).then(r => r.data),
  })

  if (isLoading) return <div className="text-center py-20 text-gray-400">Memuat...</div>
  if (!team) return <div className="text-center py-20 text-gray-400">Tim tidak ditemukan</div>

  const grouped = { GK: [], DF: [], MF: [], FW: [] } as Record<string, any[]>
  team.players?.forEach((p: any) => {
    if (grouped[p.position]) grouped[p.position].push(p)
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to="/tim" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Tim
      </Link>

      {/* Team header */}
      <div className="card mb-8">
        <div className="flex items-center gap-6">
          {team.logoUrl ? (
            <img src={team.logoUrl} alt={team.name} className="w-24 h-24 object-contain rounded-full border border-gray-100" />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-extrabold text-4xl">{team.name[0]}</span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{team.name}</h1>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Pelatih:</span> {team.coachName} ({team.coachPhone})</p>
              <p><span className="font-medium">Manajer:</span> {team.managerName} ({team.managerPhone})</p>
              {team.schoolAddress && <p><span className="font-medium">Alamat:</span> {team.schoolAddress}</p>}
            </div>
            <div className="mt-3 flex items-center gap-1 text-sm text-blue-600 font-medium">
              <Users className="w-4 h-4" /> {team.players?.length ?? 0} Pemain Terdaftar
            </div>
          </div>
        </div>
      </div>

      {/* Players by position */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Daftar Pemain</h2>
      {Object.entries(grouped).map(([pos, players]) => (
        players.length > 0 && (
          <div key={pos} className="mb-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs ${positionColors[pos]}`}>{pos}</span>
              {pos === 'GK' ? 'Penjaga Gawang' : pos === 'DF' ? 'Bek' : pos === 'MF' ? 'Gelandang' : 'Penyerang'}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {players.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                  {p.photoUrl ? (
                    <img src={p.photoUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                    <p className="text-xs text-gray-400">{new Date(p.birthDate).getFullYear()} • #{p.jerseyNumber}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${positionColors[p.position]}`}>{p.position}</span>
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  )
}
