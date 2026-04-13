import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'

export default function TeamProfile() {
  const qc = useQueryClient()
  const { data: team, isLoading } = useQuery({
    queryKey: ['my-team'],
    queryFn: () => api.get('/team/my-team').then(r => r.data),
  })

  const [form, setForm] = useState({
    coachName: '', coachPhone: '', managerName: '', managerPhone: '', schoolAddress: '', notes: '',
  })

  useEffect(() => {
    if (team) {
      setForm({
        coachName: team.coachName || '',
        coachPhone: team.coachPhone || '',
        managerName: team.managerName || '',
        managerPhone: team.managerPhone || '',
        schoolAddress: team.schoolAddress || '',
        notes: team.notes || '',
      })
    }
  }, [team])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const mut = useMutation({
    mutationFn: (data: any) => api.put('/team/my-team', data),
    onSuccess: () => { toast.success('Profil berhasil disimpan'); qc.invalidateQueries({ queryKey: ['my-team'] }) },
    onError: () => toast.error('Gagal menyimpan'),
  })

  if (isLoading) return <div className="flex items-center justify-center h-64 text-gray-400">Memuat...</div>

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Profil Tim</h1>
      <p className="text-gray-500 mb-8">Perbarui data pelatih, manajer, dan informasi sekolah</p>

      <div className="card mb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center">
            <span className="text-white font-extrabold text-xl">{team?.name?.[0]}</span>
          </div>
          <div>
            <p className="font-extrabold text-gray-900 text-lg">{team?.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${team?.status === 'approved' ? 'bg-green-100 text-green-700' : team?.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {team?.status === 'approved' ? 'Disetujui' : team?.status === 'rejected' ? 'Ditolak' : 'Menunggu Verifikasi'}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={e => { e.preventDefault(); mut.mutate(form) }} className="card space-y-4">
        <h2 className="font-semibold text-gray-700">Data Pelatih</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Nama Pelatih</label>
            <input type="text" className="input-field" value={form.coachName} onChange={set('coachName')} />
          </div>
          <div>
            <label className="label">No. HP Pelatih</label>
            <input type="text" className="input-field" value={form.coachPhone} onChange={set('coachPhone')} />
          </div>
        </div>

        <h2 className="font-semibold text-gray-700 pt-2">Data Manajer</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Nama Manajer</label>
            <input type="text" className="input-field" value={form.managerName} onChange={set('managerName')} />
          </div>
          <div>
            <label className="label">No. HP Manajer</label>
            <input type="text" className="input-field" value={form.managerPhone} onChange={set('managerPhone')} />
          </div>
        </div>

        <h2 className="font-semibold text-gray-700 pt-2">Informasi Sekolah</h2>
        <div>
          <label className="label">Alamat Sekolah</label>
          <input type="text" className="input-field" value={form.schoolAddress} onChange={set('schoolAddress')} />
        </div>
        <div>
          <label className="label">Catatan / Keterangan</label>
          <textarea className="input-field resize-none" rows={3} value={form.notes} onChange={set('notes')} />
        </div>

        <button type="submit" disabled={mut.isPending} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />{mut.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  )
}
