import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { Upload, CheckCircle, Clock, AlertTriangle, CreditCard } from 'lucide-react'

function PaymentCard({
  title, desc, amount, paid, proof, proofKey, mutFn, isPending
}: {
  title: string; desc: string; amount: string; paid: boolean; proof: string | null;
  proofKey: string; mutFn: (f: File) => void; isPending: boolean
}) {
  const [file, setFile] = useState<File | null>(null)

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
        </div>
        {paid ? (
          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-semibold">
            <CheckCircle className="w-4 h-4" /> Lunas
          </span>
        ) : proof ? (
          <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm font-semibold">
            <Clock className="w-4 h-4" /> Menunggu
          </span>
        ) : (
          <span className="flex items-center gap-1 text-red-500 bg-red-50 px-3 py-1 rounded-full text-sm font-semibold">
            <AlertTriangle className="w-4 h-4" /> Belum Bayar
          </span>
        )}
      </div>

      <div className="p-4 bg-blue-50 rounded-xl mb-4">
        <p className="text-sm text-blue-700 font-medium">Jumlah: <span className="font-extrabold">{amount}</span></p>
        <p className="text-xs text-blue-500 mt-1">Transfer ke: BRI 1234-5678-9012-3456 a.n Panitia Liga Jateng SMA</p>
      </div>

      {paid ? (
        <div className="p-3 bg-green-50 rounded-xl text-center text-green-700 text-sm font-medium">
          ✅ Pembayaran telah dikonfirmasi oleh admin
        </div>
      ) : proof ? (
        <div className="space-y-3">
          <div className="p-3 bg-yellow-50 rounded-xl text-yellow-700 text-sm">
            Bukti pembayaran telah diupload. Menunggu konfirmasi admin.
          </div>
          <a href={proof} target="_blank" rel="noreferrer"
            className="block text-center text-sm text-blue-600 underline">Lihat bukti yang diupload</a>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block">
            <span className="label">Upload Bukti Transfer</span>
            <input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer" />
            {file && <p className="text-xs text-green-600 mt-1">✓ {file.name}</p>}
          </label>
          <button
            disabled={!file || isPending}
            onClick={() => { if (file) mutFn(file) }}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {isPending ? 'Mengunggah...' : 'Upload Bukti Pembayaran'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function TeamPayment() {
  const qc = useQueryClient()

  const { data: team, isLoading } = useQuery({
    queryKey: ['my-team'],
    queryFn: () => api.get('/team/my-team').then(r => r.data),
  })

  const payMut = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData(); fd.append('paymentProof', file)
      return api.post('/team/payment-proof', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: () => { toast.success('Bukti pembayaran diupload!'); qc.invalidateQueries({ queryKey: ['my-team'] }) },
    onError: () => toast.error('Gagal upload'),
  })

  const insMut = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData(); fd.append('insuranceProof', file)
      return api.post('/team/insurance-proof', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: () => { toast.success('Bukti asuransi diupload!'); qc.invalidateQueries({ queryKey: ['my-team'] }) },
    onError: () => toast.error('Gagal upload'),
  })

  if (isLoading) return <div className="flex items-center justify-center h-64 text-gray-400">Memuat...</div>

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1 flex items-center gap-2">
        <CreditCard className="w-7 h-7 text-blue-600" /> Pembayaran
      </h1>
      <p className="text-gray-500 mb-8">Upload bukti transfer untuk biaya pendaftaran dan asuransi</p>

      <div className="space-y-6">
        <PaymentCard
          title="Biaya Pendaftaran"
          desc="Biaya resmi pendaftaran tim dalam Liga Jateng SMA"
          amount="Rp 500.000"
          paid={team?.paymentCompleted}
          proof={team?.paymentProof}
          proofKey="paymentProof"
          mutFn={f => payMut.mutate(f)}
          isPending={payMut.isPending}
        />
        <PaymentCard
          title="Biaya Asuransi"
          desc="Jaminan asuransi keselamatan pemain selama kompetisi"
          amount="Rp 200.000"
          paid={team?.insurancePaid}
          proof={team?.insuranceProof}
          proofKey="insuranceProof"
          mutFn={f => insMut.mutate(f)}
          isPending={insMut.isPending}
        />
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-xl text-sm text-gray-600 border border-gray-100">
        <p className="font-semibold mb-2">Informasi Pembayaran</p>
        <ul className="space-y-1 text-gray-500">
          <li>• Transfer ke BRI: <strong>1234-5678-9012-3456</strong> a.n <strong>Panitia Liga Jateng SMA</strong></li>
          <li>• Upload screenshot atau foto bukti transfer yang jelas</li>
          <li>• Konfirmasi akan dilakukan admin dalam 1×24 jam hari kerja</li>
          <li>• Hubungi panitia jika ada pertanyaan: <strong>0812-3456-7890</strong></li>
        </ul>
      </div>
    </div>
  )
}
