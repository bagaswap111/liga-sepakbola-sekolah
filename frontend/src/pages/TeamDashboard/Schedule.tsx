import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { useAuth } from '../../contexts/AuthContext'

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  live: 'bg-red-100 text-red-700 font-bold',
  finished: 'bg-gray-100 text-gray-600',
  postponed: 'bg-yellow-100 text-yellow-700',
}
const statusLabels: Record<string, string> = {
  scheduled: 'Akan Datang', live: '🔴 LIVE', finished: 'Selesai', postponed: 'Ditunda'
}

export default function TeamSchedule() {
  const { user } = useAuth()
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['my-matches'],
    queryFn: () => api.get('/team/my-matches').then(r => r.data),
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1 flex items-center gap-2">
        <Calendar className="w-7 h-7 text-blue-600" /> Jadwal Tim Saya
      </h1>
      <p className="text-gray-500 mb-8">Pertandingan yang melibatkan tim Anda</p>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Memuat jadwal...</div>
      ) : matches.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Belum ada jadwal pertandingan</p>
          <p className="text-sm mt-1">Jadwal akan muncul setelah admin membuat jadwal pertandingan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((m: any) => {
            const isHome = m.homeTeamId === user?.teamId
            const myScore = isHome ? m.homeScore : m.awayScore
            const oppScore = isHome ? m.awayScore : m.homeScore
            const opponent = isHome ? m.awayTeam : m.homeTeam

            let resultStyle = 'bg-gray-50'
            if (m.status === 'finished') {
              if (myScore > oppScore) resultStyle = 'bg-green-50 border-green-200'
              else if (myScore < oppScore) resultStyle = 'bg-red-50 border-red-200'
              else resultStyle = 'bg-yellow-50 border-yellow-200'
            }

            return (
              <div key={m.id} className={`card border transition-all ${resultStyle}`}>
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${statusColors[m.status]}`}>
                      {statusLabels[m.status]}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{m.groupName}</span>
                    <span className="text-xs text-gray-500">{isHome ? '🏠 Tuan Rumah' : '✈️ Tamu'}</span>
                  </div>
                  {m.status === 'finished' && (
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${myScore > oppScore ? 'text-green-700 bg-green-100' : myScore < oppScore ? 'text-red-700 bg-red-100' : 'text-yellow-700 bg-yellow-100'}`}>
                      {myScore > oppScore ? '✓ Menang' : myScore < oppScore ? '✗ Kalah' : '= Seri'}
                    </span>
                  )}
                </div>

                {/* Match display */}
                <div className="flex items-center gap-4 justify-center">
                  <div className="flex-1 text-right">
                    <p className={`font-bold text-lg ${isHome ? 'text-blue-700' : 'text-gray-700'}`}>
                      {m.homeTeam?.name}
                    </p>
                    {!isHome && <p className="text-xs text-gray-400">Tuan Rumah</p>}
                  </div>

                  <div className="text-center min-w-[100px]">
                    {m.status === 'finished' || m.status === 'live' ? (
                      <div className="text-3xl font-extrabold text-gray-900">
                        {m.homeScore ?? 0} <span className="text-gray-400 text-2xl">-</span> {m.awayScore ?? 0}
                      </div>
                    ) : (
                      <div className="text-xl font-bold text-gray-400 py-2">VS</div>
                    )}
                  </div>

                  <div className="flex-1 text-left">
                    <p className={`font-bold text-lg ${!isHome ? 'text-blue-700' : 'text-gray-700'}`}>
                      {m.awayTeam?.name}
                    </p>
                    {isHome && <p className="text-xs text-gray-400">Tamu</p>}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500 border-t pt-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(m.matchDate), 'EEEE, d MMMM yyyy - HH:mm', { locale: id })} WIB
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />{m.venue}
                  </span>
                </div>
                {m.notes && <p className="text-sm text-gray-400 italic mt-1 ml-1">{m.notes}</p>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
