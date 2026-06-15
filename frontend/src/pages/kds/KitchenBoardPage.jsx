import { useState, useEffect } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

import api from '../../config/axios'
import { useUserStore } from '../../store/userStore'

const PIZZA_EMOJIS = { 'Hawaiian': '🍍', 'Pepperoni': '🍕', 'Margherita': '🧀', 'Seafood Delight': '🦐', 'Chicken Wings': '🍗', 'French Fries': '🍟', 'Coca-Cola': '🥤' }
const BAKE_TIME_SECONDS = 15 * 60 // 15 minutes

function getElapsedMin(date) {
  return Math.floor((Date.now() - new Date(date)) / 60000)
}

function BakingTimer({ startedAt }) {
  const [pct, setPct] = useState(0)
  const [remaining, setRemaining] = useState(BAKE_TIME_SECONDS)

  useEffect(() => {
    const update = () => {
      const elapsed = (Date.now() - new Date(startedAt)) / 1000
      const p = Math.min(100, (elapsed / BAKE_TIME_SECONDS) * 100)
      const r = Math.max(0, BAKE_TIME_SECONDS - elapsed)
      setPct(p)
      setRemaining(r)
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [startedAt])

  const mins = Math.floor(remaining / 60)
  const secs = Math.floor(remaining % 60)
  const isDone = pct >= 100

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs mb-1">
        <span className={isDone ? 'text-green-600 font-bold' : 'text-amber-600 font-medium'}>
          {isDone ? '✅ เสร็จแล้ว!' : '🔥 กำลังอบ'}
        </span>
        <span className="font-mono text-amber-700 font-bold">
          {isDone ? '00:00' : `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`}
        </span>
      </div>
      <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${isDone ? 'bg-green-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function OrderTicket({ order, onMove, onComplete }) {
  const elapsed = getElapsedMin(order.createdAt)
  const isUrgent = elapsed > 15

  return (
    <div className={`bg-white rounded-2xl border-2 shadow-sm hover:shadow-md transition-all ${isUrgent && order.status !== 'READY' ? 'border-red-300' : 'border-slate-200'}`}>
      {/* Ticket Header */}
      <div className={`px-4 py-3 rounded-t-xl flex items-center justify-between ${
        order.status === 'PREPARING' ? 'bg-blue-50' :
        order.status === 'BAKING' ? 'bg-amber-50' : 'bg-green-50'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-800 text-sm">#{order.id}</span>
            {order.tableNumber && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">โต๊ะ {order.tableNumber}</span>}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              order.orderType === 'DINE_IN' ? 'bg-blue-100 text-blue-700' :
              order.orderType === 'TAKEAWAY' ? 'bg-amber-100 text-amber-700' :
              'bg-purple-100 text-purple-700'
            }`}>{order.orderType === 'DINE_IN' ? '🪑' : order.orderType === 'TAKEAWAY' ? '🥡' : '🛵'}</span>
          </div>
          <div className={`text-xs mt-0.5 ${isUrgent ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
            {isUrgent && '⚠️ '}{elapsed} นาทีที่แล้ว
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="px-4 py-3 space-y-1.5">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="shrink-0 font-bold text-slate-400 w-5">{item.quantity}×</span>
            <div>
              <span className="font-semibold text-slate-800">{PIZZA_EMOJIS[item.productName] || '🍽'} {item.productName}</span>
              {item.sizeName && <span className="text-slate-400 text-xs ml-1">{item.sizeName} {item.crustName}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Special Notes */}
      {order.instructionNotes && (
        <div className="mx-4 mb-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          <span className="text-xs font-bold text-red-700">📋 {order.instructionNotes}</span>
        </div>
      )}

      {/* Baking Timer */}
      {order.status === 'BAKING' && order.bakingStartedAt && (
        <div className="px-4 pb-3">
          <BakingTimer startedAt={order.bakingStartedAt} />
        </div>
      )}

      {/* Action Button */}
      <div className="px-4 pb-4">
        {order.status === 'PREPARING' && (
          <button onClick={() => onMove(order.id, 'BAKING')}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-colors">
            🔥 เริ่มอบ
          </button>
        )}
        {order.status === 'BAKING' && (
          <button onClick={() => onMove(order.id, 'READY')}
            className="w-full py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors">
            ✅ พร้อมเสิร์ฟ
          </button>
        )}
        {order.status === 'READY' && (
          <button onClick={() => onComplete(order.id)}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm transition-colors">
            📤 ส่งแล้ว
          </button>
        )}
      </div>
    </div>
  )
}

export default function KitchenBoardPage() {
  const [orders, setOrders] = useState([])
  const [now, setNow] = useState(Date.now())
  const [connected, setConnected] = useState(false)
  const { user } = useUserStore()

  useEffect(() => {
    const branchId = user?.branchId || 1

    const fetchOrders = async () => {
      try {
        const res = await api.get(`/kds/orders?branchId=${branchId}`)
        setOrders(prev => (res.data.data || []).map(o => {
          const existing = prev.find(p => p.id === o.id)
          return existing ? { ...o, bakingStartedAt: existing.bakingStartedAt } : o
        }))
      } catch (err) {
        console.error('Failed to fetch KDS orders', err)
      }
    }

    fetchOrders() // initial fetch
    const fetchInterval = setInterval(fetchOrders, 30000) // fallback poll every 30s
    const timeInterval = setInterval(() => setNow(Date.now()), 30000) // UI time update

    // Real-time updates via WebSocket (STOMP over SockJS)
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true)
        client.subscribe(`/topic/kds/${branchId}`, (message) => {
          const order = JSON.parse(message.body)
          setOrders(prev => {
            if (order.status === 'COMPLETED' || order.status === 'VOIDED') {
              return prev.filter(o => o.id !== order.id)
            }
            const idx = prev.findIndex(o => o.id === order.id)
            if (idx === -1) {
              return [...prev, order]
            }
            return prev.map(o => o.id === order.id
              ? { ...order, bakingStartedAt: order.status === 'BAKING' && !o.bakingStartedAt ? new Date() : o.bakingStartedAt }
              : o)
          })
        })
      },
      onDisconnect: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
    })
    client.activate()

    return () => {
      clearInterval(fetchInterval)
      clearInterval(timeInterval)
      client.deactivate()
    }
  }, [user])

  const moveOrder = async (id, newStatus) => {
    try {
      await api.patch(`/kds/orders/${id}/status`, { status: newStatus })
      setOrders(prev => prev.map(o => o.id === id ? {
        ...o, status: newStatus,
        bakingStartedAt: newStatus === 'BAKING' ? new Date() : o.bakingStartedAt
      } : o))
    } catch (err) {
      console.error(err)
      alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ')
    }
  }

  const completeOrder = async (orderId) => {
    try {
      await api.patch(`/kds/orders/${orderId}/status`, { status: 'COMPLETED' })
      setOrders(prev => prev.filter(o => o.id !== orderId))
    } catch (err) {
      console.error('Failed to complete order:', err)
    }
  }

  const preparing = orders.filter(o => o.status === 'PREPARING').sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  const baking = orders.filter(o => o.status === 'BAKING').sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  const ready = orders.filter(o => o.status === 'READY').sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  const columns = [
    { key: 'preparing', label: 'กำลังเตรียม', emoji: '👨‍🍳', orders: preparing, color: 'blue', count: preparing.length },
    { key: 'baking', label: 'กำลังอบ', emoji: '🔥', orders: baking, color: 'amber', count: baking.length },
    { key: 'ready', label: 'พร้อมเสิร์ฟ', emoji: '✅', orders: ready, color: 'green', count: ready.length },
  ]

  return (
    <div className="h-screen flex flex-col bg-[#0F172A]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🍕</div>
          <div>
            <h1 className="text-white font-black text-xl">PIZZZ SHOP — Kitchen</h1>
            <p className="text-slate-400 text-sm">Kitchen Display System · สาขาสยาม</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-white font-bold text-2xl">{new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-slate-400 text-sm">{new Date().toLocaleDateString('th-TH')}</div>
          </div>
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}
            title={connected ? 'Connected' : 'Disconnected'} />
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-hidden flex gap-4 p-4">
        {columns.map(col => (
          <div key={col.key} className="flex-1 flex flex-col min-w-0">
            {/* Column Header */}
            <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl mb-3 ${
              col.color === 'blue' ? 'bg-blue-900/40 border border-blue-700/50' :
              col.color === 'amber' ? 'bg-amber-900/40 border border-amber-700/50' :
              'bg-green-900/40 border border-green-700/50'
            }`}>
              <span className="text-xl">{col.emoji}</span>
              <span className={`font-bold text-sm ${
                col.color === 'blue' ? 'text-blue-300' :
                col.color === 'amber' ? 'text-amber-300' : 'text-green-300'
              }`}>{col.label}</span>
              <span className={`ml-auto text-sm font-black w-7 h-7 rounded-full flex items-center justify-center ${
                col.color === 'blue' ? 'bg-blue-700 text-blue-100' :
                col.color === 'amber' ? 'bg-amber-700 text-amber-100' : 'bg-green-700 text-green-100'
              }`}>{col.count}</span>
            </div>

            {/* Tickets */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {col.orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-slate-600 text-sm">
                  <div className="text-3xl mb-2 opacity-40">{col.emoji}</div>
                  <p>ไม่มีออร์เดอร์</p>
                </div>
              ) : (
                col.orders.map(order => (
                  <OrderTicket
                    key={order.id}
                    order={order}
                    onMove={moveOrder}
                    onComplete={completeOrder}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
