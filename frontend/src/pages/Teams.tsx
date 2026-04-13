import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { Users, Search } from 'lucide-react'
import { useState } from 'react'

export default function Teams() {
  const [search, setSearch] = useState('')
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['public-teams'],
    queryFn: () => api.get('/public/teams').then(r => r.data),
  })

  const filtered = teams.filter((t: any) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2 flex items-center gap-2">
        <Users className="w-8 h-8 text-blue-600" /> Tim Peserta
      </h1>
      <p className="text-gray-500 mb-8">{teams.length} tim telah terverifikasi</p>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama sekolah..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Memuat data tim...</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Tidak ada tim ditemukan</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((team: any) => (
            <Link
              key={team.id}
              to={`/tim/${team.id}`}
              className="card hover:shadow-md transition-all hover:-translate-y-0.5 group text-center p-5"
            >
              {team.logoUrl ? (
                <img src={team.logoUrl} alt={team.name} className="w-16 h-16 object-contain mx-auto mb-3 rounded-full border border-gray-100" />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-extrabold text-xl">{team.name[0]}</span>
                </div>
              )}
              <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors text-sm leading-tight mb-1">
                {team.name}
              </h3>
              <p className="text-xs text-gray-400">{team.players?.length ?? 0} pemain</p>
              <p className="text-xs text-gray-500 mt-1">Pelatih: {team.coachName}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
