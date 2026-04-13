import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const statusOpts = [
  { value: 'scheduled', label: 'Akan Datang' },
  { value: 'live', label: 'LIVE' },
  { value: 'finished', label: 'Selesai' },
  { value: 'postponed', label: 'Ditunda' },
]
const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  live: 'bg-red-100 text-red-700',
  finished: 'bg-gray-100 text-gray-600',
  postponed: 'bg-yellow-100 text-yellow-700',
}

const emptyForm = {
  homeTeamId: '', awayTeamId: '', matchDate: '', venue: '',
  groupName: 'Grup A', status: 'scheduled',
  homeScore: '', awayScore: '', notes: '',
}

export default function AdminMatches() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({ ...emptyForm })

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['admin-matches'],
    queryFn: () => api.get('/admin/matches').then(r => r.data),
  })
  const { data: teams = [] } = useQuery({
    queryKey: ['admin-teams'],
    queryFn: () => api.get('/admin/teams').then(r => r.data),
  })

  const approvedTeams = teams.filter((t: any) => t.status === 'approved')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const saveMut = useMutation({
    mutationFn: (data: any) => editId
      ? api.put(`/admin/matches/${editId}`, data)
      : api.post('/admin/matches', data),
    onSuccess: () => {
      toast.success(editId ? 'Pertandingan diperbarui' : 'Pertandingan ditambahkan')
      qc.invalidateQueries({ queryKey: ['admin-matches'] })
      setShowForm(false)
      setEditId(null)
      setForm({ ...emptyForm })
    },
    onError: () => toast.error('Gagal menyimpan'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/matches/${id}`),
    onSuccess: () => { toast.success('Pertandingan dihapus'); qc.invalidateQueries({ queryKey: ['admin-matches'] }) },
    onError: () => toast.error('Gagal menghapus'),
  })

  const openEdit = (m: any) => {
    setEditId(m.id)
    setForm({
      homeTeamId: m.homeTeamId, awayTeamId: m.awayTeamId,
      matchDate: m.matchDate ? m.matchDate.slice(0, 16) : '',
      venue: m.venue, groupName: m.groupName, status: m.status,
      homeScore: m.homeScore ?? '', awayScore: m.awayScore ?? '', notes: m.notes ?? '',
    })
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.homeTeamId || !form.awayTeamId || !form.matchDate || !form.venue) {
      toast.error('Isi semua field wajib')
      return
    }
    if (form.homeTeamId === form.awayTeamId) { toast.error('Tim tidak boleh sama'); return }
    const payload: any = { ...form, homeTeamId: parseInt(form.homeTeamId as any), awayTeamId: parseInt(form.awayTeamId as any) }
    if (form.homeScore !== '') payload.homeScore = parseInt(form.homeScore as any)
    if (form.awayScore !== '') payload.awayScore = parseInt(form.awayScore as any)
    saveMut.mutate(payload)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Pertandingan</h1>
          <p className="text-gray-500 mt-1">Jadwal & hasil pertandingan</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...emptyForm }) }}
          className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Pertandingan
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{editId ? 'Edit Pertandingan' : 'Tambah Pertandingan'}</h2>
              <button onClick={() => { setShowForm(false); setEditId(null) }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tim Tuan Rumah *</label>
                  <select className="input-field" value={form.homeTeamId} onChange={set('homeTeamId')} required>
                    <option value="">-- Pilih Tim --</option>
                    {approvedTeams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Tim Tamu *</label>
                  <select className="input-field" value={form.awayTeamId} onChange={set('awayTeamId')} required>
                    <option value="">-- Pilih Tim --</option>
                    {approvedTeams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tanggal & Jam *</label>
                  <input type="datetime-local" className="input-field" value={form.matchDate} onChange={set('matchDate')} required />
                </div>
                <div>
                  <label className="label">Grup</label>
                  <input type="text" className="input-field" value={form.groupName} onChange={set('groupName')} />
                </div>
              </div>
              <div>
                <label className="label">Venue / Lokasi *</label>
                <input type="text" className="input-field" placeholder="Stadion ..." value={form.venue} onChange={set('venue')} required />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input-field" value={form.status} onChange={set('status')}>
                  {statusOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              {(form.status === 'finished' || form.status === 'live') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Skor Tuan Rumah</label>
                    <input type="number" min="0" className="input-field" value={form.homeScore} onChange={set('homeScore')} />
                  </div>
                  <div>
                    <label className="label">Skor Tamu</label>
                    <input type="number" min="0" className="input-field" value={form.awayScore} onChange={set('awayScore')} />
                  </div>
                </div>
              )}
              <div>
                <label className="label">Catatan</label>
                <input type="text" className="input-field" placeholder="Catatan tambahan..." value={form.notes} onChange={set('notes')} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saveMut.isPending} className="btn-primary flex items-center gap-2 flex-1">
                  <Save className="w-4 h-4" /> {saveMut.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="btn-secondary flex-1">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? <div className="text-center py-20 text-gray-400">Memuat...</div> : (
        <div className="space-y-3">
          {matches.length === 0 && <div className="card text-center py-12 text-gray-400">Belum ada pertandingan</div>}
          {matches.map((m: any) => (
            <div key={m.id} className="card flex items-center gap-4 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColors[m.status]}`}>
                {statusOpts.find(o => o.value === m.status)?.label}
              </span>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{m.groupName}</span>
              <div className="flex items-center gap-3 flex-1">
                <span className="font-semibold text-gray-700 text-right flex-1">{m.homeTeam?.name}</span>
                <span className="font-extrabold text-gray-800 text-lg bg-gray-100 px-3 py-1 rounded-lg">
                  {m.status === 'finished' || m.status === 'live' ? `${m.homeScore ?? 0} - ${m.awayScore ?? 0}` : 'VS'}
                </span>
                <span className="font-semibold text-gray-700 flex-1">{m.awayTeam?.name}</span>
              </div>
              <span className="text-xs text-gray-400 hidden md:block">
                {format(new Date(m.matchDate), 'd MMM yyyy HH:mm', { locale: id })} • {m.venue}
              </span>
              <div className="flex gap-2">
                <button onClick={() => openEdit(m)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => { if (confirm('Hapus pertandingan?')) deleteMut.mutate(m.id) }}
                  className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
