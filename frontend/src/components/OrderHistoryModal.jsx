import { useState, useEffect } from 'react'
import api from '../config/axios'
import ReceiptModal, { formatCurrency, ORDER_TYPE_LABELS, STATUS_LABELS, STATUS_COLORS, PAYMENT_LABELS } from './ReceiptModal'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function OrderHistoryModal({ branchId, onClose }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const today = todayStr()
        const res = await api.get('/orders/history', { params: { branchId: branchId || 1, startDate: today, endDate: today } })
        setOrders((res.data.data || []).slice().reverse())
      } catch (err) {
        console.error('Failed to load order history', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [branchId])

  const viewReceipt = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}`)
      setSelectedOrder(res.data.data)
    } catch (err) {
      console.error('Failed to load order', err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm no-print" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col no-print">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">🧾 ออร์เดอร์วันนี้</h2>
            <p className="text-xs text-slate-400 mt-0.5">ดูและพิมพ์ใบเสร็จออร์เดอร์ของวันนี้</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-10 text-center text-slate-400 text-sm">กำลังโหลด...</div>
          ) : orders.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">ยังไม่มีออร์เดอร์ในวันนี้</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">#</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">เวลา</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">ประเภท</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase">ยอดรวม</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">ชำระเงิน</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">สถานะ</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-slate-700">#{order.id}</td>
                    <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-semibold">{ORDER_TYPE_LABELS[order.orderType]}</span>
                      {order.tableNumber && <span className="text-xs text-slate-400 ml-1">โต๊ะ {order.tableNumber}</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-800">{formatCurrency(order.finalAmount)}</td>
                    <td className="px-4 py-2.5 text-slate-500 text-xs">{PAYMENT_LABELS[order.paymentMethod] || '-'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button onClick={() => viewReceipt(order.id)}
                        className="text-xs font-bold text-[#E11D48] hover:underline">🧾 ใบเสร็จ</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedOrder && <ReceiptModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  )
}
