import { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import api from '../../config/axios'
import { useUserStore } from '../../store/userStore'
import ReceiptModal, { formatCurrency, ORDER_TYPE_LABELS, STATUS_LABELS, STATUS_COLORS, PAYMENT_LABELS } from '../../components/ReceiptModal'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [startDate, setStartDate] = useState(todayStr())
  const [endDate, setEndDate] = useState(todayStr())
  const [loading, setLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const { user } = useUserStore()

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const branchId = user?.branchId || 1
        const res = await api.get('/orders/history', { params: { branchId, startDate, endDate } })
        setOrders(res.data.data || [])
      } catch (err) {
        console.error('Failed to load order history', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [startDate, endDate, user])

  const viewReceipt = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}`)
      setSelectedOrder(res.data.data)
    } catch (err) {
      console.error('Failed to load order', err)
    }
  }

  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + Number(o.finalAmount || 0), 0)

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">ประวัติออร์เดอร์</h1>
            <p className="text-slate-500 text-sm mt-0.5">ค้นหาออร์เดอร์และพิมพ์ใบเสร็จ</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48]" />
            <span className="text-slate-400">—</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-400 text-xs uppercase">
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">เวลา</th>
                  <th className="px-4 py-3 font-semibold">ประเภท</th>
                  <th className="px-4 py-3 font-semibold">รายการ</th>
                  <th className="px-4 py-3 font-semibold text-right">ยอดรวม</th>
                  <th className="px-4 py-3 font-semibold">ชำระเงิน</th>
                  <th className="px-4 py-3 font-semibold">สถานะ</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">กำลังโหลด...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">ไม่มีออร์เดอร์ในช่วงเวลานี้</td></tr>
                ) : orders.map(order => (
                  <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-700">#{order.id}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(order.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold">{ORDER_TYPE_LABELS[order.orderType]}</span>
                      {order.tableNumber && <span className="text-xs text-slate-400 ml-1">โต๊ะ {order.tableNumber}</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{order.items?.length || 0} รายการ</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">{formatCurrency(order.finalAmount)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{PAYMENT_LABELS[order.paymentMethod] || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => viewReceipt(order.id)}
                        className="text-xs font-bold text-[#E11D48] hover:underline">🧾 ใบเสร็จ</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {orders.length > 0 && (
          <div className="mt-4 text-right text-sm text-slate-500">
            ยอดขายรวม (ชำระแล้ว): <span className="font-black text-slate-900">{formatCurrency(totalRevenue)}</span> · {orders.length} ออร์เดอร์
          </div>
        )}
      </div>

      {selectedOrder && <ReceiptModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </AdminLayout>
  )
}
