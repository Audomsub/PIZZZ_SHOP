import { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import api from '../../config/axios'
import { useUserStore } from '../../store/userStore'

function formatCurrency(amount) {
  return `฿${Number(amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const STATUS_LABELS = { OPEN: 'เปิดอยู่', CLOSED: 'ปิดแล้ว' }
const STATUS_COLORS = { OPEN: 'bg-green-100 text-green-700', CLOSED: 'bg-slate-100 text-slate-500' }

export default function CashShiftHistoryPage() {
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useUserStore()

  useEffect(() => {
    const fetchShifts = async () => {
      setLoading(true)
      try {
        const branchId = user?.branchId || 1
        const res = await api.get('/admin/cash-shifts', { params: { branchId } })
        setShifts(res.data.data || [])
      } catch (err) {
        console.error('Failed to load cash shift history', err)
      } finally {
        setLoading(false)
      }
    }
    fetchShifts()
  }, [user])

  const varianceColor = (variance) => {
    if (variance == null) return 'text-slate-400'
    if (Number(variance) === 0) return 'text-emerald-600'
    return Number(variance) < 0 ? 'text-red-600' : 'text-amber-600'
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900">ประวัติรอบเงินสด</h1>
          <p className="text-slate-500 text-sm mt-0.5">ดูประวัติการเปิด-ปิดรอบเงินสดและยอดขายของแต่ละรอบ</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['รอบที่', 'แคชเชียร์', 'เปิดเมื่อ', 'ปิดเมื่อ', 'เงินเริ่มต้น', 'ยอดขายเงินสด', 'ยอดขายรวม', 'ออร์เดอร์', 'เงินที่ควรมี', 'เงินที่นับได้', 'ผลต่าง', 'สถานะ'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={12} className="px-4 py-10 text-center text-slate-400">กำลังโหลด...</td></tr>
                ) : shifts.length === 0 ? (
                  <tr><td colSpan={12} className="px-4 py-10 text-center text-slate-400">ยังไม่มีประวัติรอบเงินสด</td></tr>
                ) : shifts.map(shift => (
                  <tr key={shift.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800">#{shift.id}</td>
                    <td className="px-4 py-3 text-slate-700">{shift.username || '-'}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{shift.openedAt ? new Date(shift.openedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '-'}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{shift.closedAt ? new Date(shift.closedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(shift.startAmount)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(shift.cashSales)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(shift.totalSales)}</td>
                    <td className="px-4 py-3 text-slate-500">{shift.orderCount ?? 0}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{formatCurrency(shift.endAmount)}</td>
                    <td className="px-4 py-3 text-slate-600">{shift.actualAmount != null ? formatCurrency(shift.actualAmount) : '-'}</td>
                    <td className={`px-4 py-3 font-semibold ${varianceColor(shift.variance)}`}>{shift.variance != null ? formatCurrency(shift.variance) : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[shift.status]}`}>{STATUS_LABELS[shift.status]}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
