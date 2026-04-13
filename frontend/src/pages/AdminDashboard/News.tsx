import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Save, Image } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const emptyForm = { title: '', content: '', status: 'published' }

export default function AdminNews() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const { data: news = [], isLoading } = useQuery({
    queryKey: ['admin-news'],
    queryFn: () => api.get('/admin/news').then(r => r.data),
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const saveMut = useMutation({
    mutationFn: (fd: FormData) => editId
      ? api.put(`/admin/news/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/admin/news', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      toast.success(editId ? 'Berita diperbarui' : 'Berita ditambahkan')
      qc.invalidateQueries({ queryKey: ['admin-news'] })
      setShowForm(false); setEditId(null); setForm({ ...emptyForm }); setImageFile(null); setPreview(null)
    },
    onError: () => toast.error('Gagal menyimpan'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/news/${id}`),
    onSuccess: () => { toast.success('Berita dihapus'); qc.invalidateQueries({ queryKey: ['admin-news'] }) },
    onError: () => toast.error('Gagal menghapus'),
  })

  const openEdit = (n: any) => {
    setEditId(n.id)
    setForm({ title: n.title, content: n.content, status: n.status })
    setPreview(n.imageUrl || null)
    setImageFile(null)
    setShowForm(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) { setImageFile(f); setPreview(URL.createObjectURL(f)) }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.content) { toast.error('Judul & konten wajib diisi'); return }
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (imageFile) fd.append('image', imageFile)
    saveMut.mutate(fd)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Berita</h1>
          <p className="text-gray-500 mt-1">Kelola berita & informasi liga</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...emptyForm }); setImageFile(null); setPreview(null) }}
          className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Berita
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{editId ? 'Edit Berita' : 'Tambah Berita'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Judul Berita *</label>
                <input type="text" className="input-field" placeholder="Judul..." value={form.title} onChange={set('title')} required />
              </div>
              <div>
                <label className="label">Konten *</label>
                <textarea className="input-field min-h-[180px] resize-none" placeholder="Tulis isi berita di sini..."
                  value={form.content} onChange={set('content')} required />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input-field" value={form.status} onChange={set('status')}>
                  <option value="published">Dipublikasikan</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div>
                <label className="label flex items-center gap-1"><Image className="w-4 h-4" /> Gambar (opsional)</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
                {preview && <img src={preview} alt="preview" className="mt-2 rounded-lg h-32 object-cover border" />}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saveMut.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />{saveMut.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? <div className="text-center py-20 text-gray-400">Memuat...</div> : (
        <div className="grid gap-4 md:grid-cols-2">
          {news.length === 0 && <div className="card text-center py-12 text-gray-400 col-span-2">Belum ada berita</div>}
          {news.map((n: any) => (
            <div key={n.id} className="card flex gap-4">
              {n.imageUrl && <img src={n.imageUrl} alt={n.title} className="w-20 h-20 rounded-xl object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${n.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {n.status === 'published' ? 'Publik' : 'Draft'}
                  </span>
                  <span className="text-xs text-gray-400">{format(new Date(n.publishedAt), 'd MMM yyyy', { locale: id })}</span>
                </div>
                <h3 className="font-bold text-gray-800 truncate">{n.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{n.content}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => openEdit(n)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => { if (confirm('Hapus berita ini?')) deleteMut.mutate(n.id) }}
                  className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
