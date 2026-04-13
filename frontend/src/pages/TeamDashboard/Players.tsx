import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { Plus, Trash2, X, Save, User, FileText } from 'lucide-react'

const positions = ['GK', 'DF', 'MF', 'FW']
const positionColors: Record<string, string> = {
  GK: 'bg-yellow-100 text-yellow-800', DF: 'bg-blue-100 text-blue-800',
  MF: 'bg-green-100 text-green-800', FW: 'bg-red-100 text-red-800',
}
const positionLabels: Record<string, string> = {
  GK: 'Penjaga Gawang', DF: 'Bek', MF: 'Gelandang', FW: 'Penyerang'
}

const emptyForm = { name: '', jerseyNumber: '', position: 'GK', birthDate: '' }

export default function TeamPlayers() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [files, setFiles] = useState<Record<string, File | null>>({
    studentIdCard: null, parentalConsent: null, healthCertificate: null, photo: null
  })
  const [editId, setEditId] = useState<number | null>(null)

  const { data: team, isLoading } = useQuery({
    queryKey: ['my-team'],
    queryFn: () => api.get('/team/my-team').then(r => r.data),
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const setFile = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFiles(f => ({ ...f, [k]: e.target.files?.[0] || null }))

  const addMut = useMutation({
    mutationFn: (fd: FormData) => editId
      ? api.put(`/team/players/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/team/players', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      toast.success(editId ? 'Pemain diperbarui' : 'Pemain ditambahkan')
      qc.invalidateQueries({ queryKey: ['my-team'] })
      setShowForm(false); setEditId(null); setForm({ ...emptyForm })
      setFiles({ studentIdCard: null, parentalConsent: null, healthCertificate: null, photo: null })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal menyimpan'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/team/players/${id}`),
    onSuccess: () => { toast.success('Pemain dihapus'); qc.invalidateQueries({ queryKey: ['my-team'] }) },
    onError: () => toast.error('Gagal menghapus'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.jerseyNumber || !form.birthDate) { toast.error('Isi semua field wajib'); return }
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
    Object.entries(files).forEach(([k, f]) => { if (f) fd.append(k, f) })
    addMut.mutate(fd)
  }

  if (isLoading) return <div className="flex items-center justify-center h-64 text-gray-400">Memuat...</div>

  const players = team?.players || []

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Daftar Pemain</h1>
          <p className="text-gray-500 mt-1">{players.length} pemain terdaftar</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...emptyForm }) }}
          className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Pemain
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{editId ? 'Edit Pemain' : 'Tambah Pemain'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Nama Lengkap *</label>
                  <input type="text" className="input-field" value={form.name} onChange={set('name')} required />
                </div>
                <div>
                  <label className="label">Nomor Punggung *</label>
                  <input type="number" min="1" max="99" className="input-field" value={form.jerseyNumber} onChange={set('jerseyNumber')} required />
                </div>
                <div>
                  <label className="label">Posisi *</label>
                  <select className="input-field" value={form.position} onChange={set('position')}>
                    {positions.map(p => <option key={p} value={p}>{p} - {positionLabels[p]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Tanggal Lahir *</label>
                  <input type="date" className="input-field" value={form.birthDate} onChange={set('birthDate')} required />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-1"><FileText className="w-4 h-4" /> Upload Dokumen</h3>
                {[
                  { key: 'photo', label: 'Foto Pemain', accept: 'image/*' },
                  { key: 'studentIdCard', label: 'Kartu Pelajar *', accept: 'image/*,.pdf' },
                  { key: 'parentalConsent', label: 'Surat Izin Orang Tua *', accept: 'image/*,.pdf' },
                  { key: 'healthCertificate', label: 'Surat Keterangan Sehat *', accept: 'image/*,.pdf' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="label">{f.label}</label>
                    <input type="file" accept={f.accept} onChange={setFile(f.key)}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 file:text-sm hover:file:bg-blue-100 cursor-pointer" />
                    {files[f.key] && <p className="text-xs text-green-600 mt-1">✓ {files[f.key]?.name}</p>}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={addMut.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />{addMut.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Players grid */}
      {players.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Belum ada pemain</p>
          <p className="text-sm mt-1">Klik "Tambah Pemain" untuk mendaftarkan pemain pertama</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((p: any) => (
            <div key={p.id} className="card">
              <div className="flex items-start gap-3">
                {p.photoUrl ? (
                  <img src={p.photoUrl} alt={p.name} className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <User className="w-7 h-7 text-gray-300" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center">{p.jerseyNumber}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${positionColors[p.position]}`}>{p.position}</span>
                  </div>
                  <p className="font-bold text-gray-800 mt-1">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.birthDate}</p>
                </div>
                <button onClick={() => { if (confirm('Hapus pemain ini?')) deleteMut.mutate(p.id) }}
                  className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Docs */}
              <div className="mt-3 pt-3 border-t border-gray-50 flex gap-2">
                {[
                  { url: p.studentIdCardUrl, label: 'KP' },
                  { url: p.parentalConsentUrl, label: 'Izin' },
                  { url: p.healthCertificateUrl, label: 'Sehat' },
                ].map(doc => (
                  doc.url ? (
                    <a key={doc.label} href={doc.url} target="_blank" rel="noreferrer"
                      className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-1">
                      <FileText className="w-3 h-3" />{doc.label}
                    </a>
                  ) : (
                    <span key={doc.label} className="text-xs px-2 py-1 bg-gray-50 text-gray-400 rounded-lg flex items-center gap-1">
                      <FileText className="w-3 h-3" />{doc.label}
                    </span>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
