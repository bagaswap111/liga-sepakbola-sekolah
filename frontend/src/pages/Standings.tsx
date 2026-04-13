import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { Trophy, TrendingUp } from 'lucide-react'

export default function Standings() {
  const { data: standings = [], isLoading } = useQuery({
    queryKey: ['standings'],
    queryFn: () => api.get('/public/standings').then(r => r.data),
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2 flex items-center gap-2">
        <TrendingUp className="w-8 h-8 text-blue-600" /> Klasemen
      </h1>
      <p className="text-gray-500 mb-8">Peringkat tim berdasarkan poin, selisih gol, dan gol masuk</p>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Memuat klasemen...</div>
      ) : standings.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Klasemen belum tersedia. Pertandingan belum dimulai.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="px-4 py-3 text-left w-8">#</th>
                  <th className="px-4 py-3 text-left">Tim</th>
                  <th className="px-4 py-3 text-center">M</th>
                  <th className="px-4 py-3 text-center">W</th>
                  <th className="px-4 py-3 text-center">D</th>
                  <th className="px-4 py-3 text-center">L</th>
                  <th className="px-4 py-3 text-center">GF</th>
                  <th className="px-4 py-3 text-center">GA</th>
                  <th className="px-4 py-3 text-center">GD</th>
                  <th className="px-4 py-3 text-center font-bold">PTS</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row: any, idx: number) => (
                  <tr
                    key={row.team.id}
                    className={`border-b border-gray-100 transition-colors ${idx === 0 ? 'bg-yellow-50' : idx < 4 ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-3 font-bold text-gray-500">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{row.team.name}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row.played}</td>
                    <td className="px-4 py-3 text-center text-green-600 font-medium">{row.won}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{row.drawn}</td>
                    <td className="px-4 py-3 text-center text-red-500">{row.lost}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row.gf}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row.ga}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                    <td className="px-4 py-3 text-center font-extrabold text-blue-900 text-base">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 text-xs text-gray-400 flex flex-wrap gap-4">
            <span><strong>M</strong>=Main, <strong>W</strong>=Menang, <strong>D</strong>=Seri, <strong>L</strong>=Kalah</span>
            <span><strong>GF</strong>=Gol Masuk, <strong>GA</strong>=Gol Kebobolan, <strong>GD</strong>=Selisih, <strong>PTS</strong>=Poin</span>
          </div>
        </div>
      )}
    </div>
  )
}
