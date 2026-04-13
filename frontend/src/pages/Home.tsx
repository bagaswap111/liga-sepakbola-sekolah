import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { Trophy, Calendar, Users, Newspaper, ChevronRight, Clock, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  live: 'bg-red-100 text-red-700 animate-pulse',
  finished: 'bg-gray-100 text-gray-600',
  postponed: 'bg-yellow-100 text-yellow-700',
}
const statusLabels: Record<string, string> = {
  scheduled: 'Akan Datang', live: 'LIVE', finished: 'Selesai', postponed: 'Ditunda'
}

export default function Home() {
  const { data: matches = [] } = useQuery({ queryKey: ['public-matches'], queryFn: () => api.get('/public/matches').then(r => r.data) })
  const { data: news = [] } = useQuery({ queryKey: ['public-news'], queryFn: () => api.get('/public/news').then(r => r.data) })
  const { data: teams = [] } = useQuery({ queryKey: ['public-teams'], queryFn: () => api.get('/public/teams').then(r => r.data) })

  const upcomingMatches = matches.filter((m: any) => m.status === 'scheduled').slice(0, 3)
  const recentMatches = matches.filter((m: any) => m.status === 'finished').slice(-3).reverse()
  const latestNews = news.slice(0, 3)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="w-16 h-16 text-yellow-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Liga Sepakbola SMA<br />Jawa Tengah</h1>
          <p className="text-lg text-blue-200 mb-8 max-w-2xl mx-auto">
            Kompetisi sepakbola antar SMA se-Jawa Tengah. Temukan jadwal pertandingan, hasil, klasemen, dan profil tim peserta.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/daftar" className="px-6 py-3 bg-yellow-400 text-blue-900 rounded-xl font-bold hover:bg-yellow-300 transition-colors">
              Daftarkan Tim
            </Link>
            <Link to="/jadwal" className="px-6 py-3 bg-white/10 rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20">
              Lihat Jadwal
            </Link>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-lg mx-auto">
            {[
              { label: 'Tim Terdaftar', value: teams.length },
              { label: 'Pertandingan', value: matches.length },
              { label: 'Berita', value: news.length },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-extrabold text-yellow-400">{s.value}</div>
                <div className="text-xs text-blue-300 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        {/* Upcoming matches */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Calendar className="w-6 h-6 text-blue-600" /> Pertandingan Mendatang</h2>
            <Link to="/jadwal" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium">
              Lihat semua <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {upcomingMatches.length === 0 ? (
            <div className="card text-center text-gray-500 py-10">Belum ada jadwal pertandingan</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {upcomingMatches.map((m: any) => (
                <div key={m.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[m.status]}`}>{statusLabels[m.status]}</span>
                    <span className="text-xs text-gray-400">{m.groupName}</span>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-base text-gray-800">{m.homeTeam?.name}</div>
                    <div className="text-2xl font-extrabold text-blue-900 my-2">VS</div>
                    <div className="font-bold text-base text-gray-800">{m.awayTeam?.name}</div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {format(new Date(m.matchDate), 'EEEE, d MMMM yyyy - HH:mm', { locale: id })} WIB
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />{m.venue}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent results */}
        {recentMatches.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <Trophy className="w-6 h-6 text-yellow-500" /> Hasil Terkini
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {recentMatches.map((m: any) => (
                <div key={m.id} className="card text-center">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Selesai</span>
                  <div className="mt-3 flex items-center justify-center gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-700">{m.homeTeam?.name}</p>
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900 bg-gray-100 px-4 py-2 rounded-xl">
                      {m.homeScore} - {m.awayScore}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-700">{m.awayTeam?.name}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {format(new Date(m.matchDate), 'd MMM yyyy', { locale: id })}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Latest news */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Newspaper className="w-6 h-6 text-blue-600" /> Berita Terbaru</h2>
            <Link to="/berita" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium">
              Lihat semua <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {latestNews.length === 0 ? (
            <div className="card text-center text-gray-500 py-10">Belum ada berita</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {latestNews.map((n: any) => (
                <Link key={n.id} to={`/berita/${n.id}`} className="card hover:shadow-md transition-shadow group p-0 overflow-hidden">
                  {n.imageUrl && (
                    <img src={n.imageUrl} alt={n.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                  )}
                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-1">{format(new Date(n.publishedAt), 'd MMMM yyyy', { locale: id })}</p>
                    <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">{n.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{n.content}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-10 text-center text-white">
          <Users className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
          <h2 className="text-2xl font-bold mb-2">Daftarkan Tim Anda Sekarang!</h2>
          <p className="text-blue-200 mb-6">Buat akun tim, lengkapi profil, upload dokumen, dan tunggu verifikasi admin.</p>
          <Link to="/daftar" className="inline-block px-8 py-3 bg-yellow-400 text-blue-900 rounded-xl font-bold hover:bg-yellow-300 transition-colors">
            Mulai Pendaftaran
          </Link>
        </section>
      </div>
    </div>
  )
}
