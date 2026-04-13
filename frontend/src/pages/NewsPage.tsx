import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { Newspaper } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function NewsPage() {
  const { data: news = [], isLoading } = useQuery({
    queryKey: ['public-news'],
    queryFn: () => api.get('/public/news').then(r => r.data),
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2 flex items-center gap-2">
        <Newspaper className="w-8 h-8 text-blue-600" /> Berita
      </h1>
      <p className="text-gray-500 mb-8">Informasi & update terbaru dari Liga Jateng SMA</p>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Memuat berita...</div>
      ) : news.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Belum ada berita</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((n: any) => (
            <Link key={n.id} to={`/berita/${n.id}`} className="card hover:shadow-md transition-all hover:-translate-y-0.5 group p-0 overflow-hidden">
              {n.imageUrl && (
                <img src={n.imageUrl} alt={n.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
              )}
              <div className="p-5">
                <p className="text-xs text-gray-400 mb-2">{format(new Date(n.publishedAt), 'd MMMM yyyy', { locale: id })}</p>
                <h2 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-2 text-lg leading-tight">{n.title}</h2>
                <p className="text-sm text-gray-500 line-clamp-3">{n.content}</p>
                <span className="mt-3 inline-block text-sm text-blue-600 font-medium">Baca selengkapnya →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
