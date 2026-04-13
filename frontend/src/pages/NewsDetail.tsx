import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { ArrowLeft, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function NewsDetail() {
  const { id: newsId } = useParams()
  const { data: news, isLoading } = useQuery({
    queryKey: ['public-news', newsId],
    queryFn: () => api.get(`/public/news/${newsId}`).then(r => r.data),
  })

  if (isLoading) return <div className="text-center py-20 text-gray-400">Memuat...</div>
  if (!news) return <div className="text-center py-20 text-gray-400">Berita tidak ditemukan</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/berita" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Berita
      </Link>

      {news.imageUrl && (
        <img src={news.imageUrl} alt={news.title} className="w-full h-72 object-cover rounded-2xl mb-8 shadow" />
      )}

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Calendar className="w-4 h-4" />
        {format(new Date(news.publishedAt), 'EEEE, d MMMM yyyy', { locale: id })}
      </div>

      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 leading-tight">{news.title}</h1>

      <div className="prose prose-gray max-w-none">
        {news.content.split('\n').map((paragraph: string, i: number) => (
          paragraph.trim() ? <p key={i} className="text-gray-700 mb-4 leading-relaxed">{paragraph}</p> : null
        ))}
      </div>
    </div>
  )
}
