import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { Calendar, Clock, MapPin, Trophy } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { useState } from 'react'
import clsx from 'clsx'

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  live: 'bg-red-100 text-red-700',
  finished: 'bg-gray-100 text-gray-600',
  postponed: 'bg-yellow-100 text-yellow-700',
}
const statusLabels: Record<string, string> = {
  scheduled: 'Akan Datang', live: 'LIVE', finished: 'Selesai', postponed: 'Ditunda'
}

export default function Fixtures() {
  const [filter, setFilter] = useState('all')
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['public-matches'],
    queryFn: () => api.get('/public/matches').then(r => r.data),
  })

  const filtered = filter === 'all' ? matches : matches.filter((m: any) => m.status === filter)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Jadwal & Hasil</h1>
      <p className="text-gray-500 mb-8">Seluruh pertandingan Liga Jateng SMA</p>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { key: 'all', label: 'Semua' },
          { key: 'scheduled', label: 'Akan Datang' },
          { key: 'live', label: 'LIVE' },
          { key: 'finished', label: 'Selesai' },
          { key: 'postponed', label: 'Ditunda' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={clsx(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              filter === f.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Memuat data...</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Tidak ada pertandingan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((m: any) => (
            <div key={m.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColors[m.status]}`}>
                    {statusLabels[m.status]}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{m.groupName}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Home team */}
                <div className="flex-1 text-right">
                  <p className="font-bold text-gray-800 text-lg">{m.homeTeam?.name}</p>
                </div>

                {/* Score / VS */}
                <div className="text-center min-w-[80px]">
                  {m.status === 'finished' || m.status === 'live' ? (
                    <div className="text-3xl font-extrabold text-gray-900">
                      {m.homeScore ?? 0} <span className="text-gray-400 text-xl">-</span> {m.awayScore ?? 0}
                    </div>
                  ) : (
                    <div className="text-xl font-bold text-gray-400">VS</div>
                  )}
                </div>

                {/* Away team */}
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-800 text-lg">{m.awayTeam?.name}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500 border-t pt-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {format(new Date(m.matchDate), 'EEEE, d MMMM yyyy - HH:mm', { locale: id })} WIB
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />{m.venue}
                </span>
                {m.notes && <span className="text-gray-400 italic">{m.notes}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
