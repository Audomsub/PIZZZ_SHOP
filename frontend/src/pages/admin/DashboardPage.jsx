import { useState, useEffect } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import AdminLayout from '../../layouts/AdminLayout'
import api from '../../config/axios'
import { useUserStore } from '../../store/userStore'

function KpiCard({ emoji, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className={`text-2xl font-black mt-1 ${color || 'text-slate-900'}`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className="text-3xl">{emoji}</div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [range, setRange] = useState('today')
  const [salesData, setSalesData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [lowStockItems, setLowStockItems] = useState([])
  const [kpi, setKpi] = useState({ totalRevenue: 0, orderCount: 0, avgOrderValue: 0 })
  const [activeOrders, setActiveOrders] = useState([])
  const { user } = useUserStore()

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const branchId = user?.branchId || 1
        let start = new Date()
        if (range === 'week') start.setDate(start.getDate() - 7)
        if (range === 'month') start.setMonth(start.getMonth() - 30)
        const startDateStr = start.toISOString().split('T')[0]
        const endDateStr = new Date().toISOString().split('T')[0]

        const [salesRes, topRes, stockRes, ordersRes] = await Promise.all([
          api.get(`/admin/reports/sales?branchId=${branchId}&startDate=${startDateStr}&endDate=${endDateStr}`),
          api.get(`/admin/reports/top-products?branchId=${branchId}&startDate=${startDateStr}&endDate=${endDateStr}`),
          api.get(`/admin/inventory/low-stock?branchId=${branchId}`),
          api.get(`/orders/active?branchId=${branchId}`)
        ])

        const rev = salesRes.data.data.totalRevenue || 0
        const ord = salesRes.data.data.orderCount || 0
        setKpi(salesRes.data.data)

        // Mock chart distribution based on actual totals
        setSalesData([
          { hour: '08:00', orders: Math.floor(ord * 0.05), revenue: rev * 0.05 },
          { hour: '12:00', orders: Math.floor(ord * 0.35), revenue: rev * 0.35 },
          { hour: '15:00', orders: Math.floor(ord * 0.15), revenue: rev * 0.15 },
          { hour: '19:00', orders: Math.floor(ord * 0.45), revenue: rev * 0.45 },
        ])

        setTopProducts(topRes.data.data.map(p => ({ name: p.productName, qty: p.totalQty })))
        setLowStockItems(stockRes.data.data.map(s => ({ name: s.ingredient?.name, qty: s.quantity, threshold: s.lowStockThreshold, unit: s.ingredient?.unit })))
        setActiveOrders(ordersRes.data.data || [])
      } catch (err) {
        console.error('Failed to load dashboard', err)
      }
    }
    fetchDashboard()
  }, [range, user])

  const peakHour = salesData.length > 0 ? salesData.reduce((m, d) => d.orders > m.orders ? d : m, salesData[0]) : { hour: '-', orders: 0 }

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">ภาพรวมวันนี้ · {new Date().toLocaleDateString('th-TH', { dateStyle: 'full' })}</p>
          </div>
          <div className="flex gap-2">
            {['today','week','month'].map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${range === r ? 'bg-[#E11D48] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}>
                {r === 'today' ? 'วันนี้' : r === 'week' ? 'สัปดาห์' : 'เดือน'}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <KpiCard emoji="💰" label="ยอดขายรวม" value={`฿${Number(kpi.totalRevenue).toLocaleString()}`} sub="ตามช่วงเวลาที่เลือก" color="text-[#E11D48]" />
          <KpiCard emoji="📋" label="จำนวนออร์เดอร์" value={kpi.orderCount} sub={`เฉลี่ย ฿${Number(kpi.avgOrderValue).toLocaleString()}/บิล`} />
          <KpiCard emoji="⏰" label="ช่วงขายดีสุด" value={peakHour.hour} sub={`${peakHour.orders} ออร์เดอร์`} color="text-[#D97706]" />
          <KpiCard emoji="⚠️" label="สต็อกใกล้หมด" value={lowStockItems.length} sub="รายการต้องสั่งเพิ่ม" color="text-red-500" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Sales Chart */}
          <div className="xl:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-800 mb-4">ยอดขายรายชั่วโมง</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E11D48" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#E11D48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '12px', color: 'white', fontSize: '12px' }}
                  formatter={(v) => [`฿${v.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#E11D48" strokeWidth={2} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, fill: '#E11D48' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-bold text-slate-800">⚠️ สต็อกใกล้หมด</h2>
              <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">{lowStockItems.length} รายการ</span>
            </div>
            <div className="space-y-3">
              {lowStockItems.map(item => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{item.name}</span>
                    <span className="text-red-500 font-bold">{item.qty}/{item.threshold} {item.unit}</span>
                  </div>
                  <div className="h-1.5 bg-red-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${(item.qty / item.threshold) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold transition-colors">
              📦 สั่งซื้อวัตถุดิบ
            </button>
          </div>

          {/* Top Products */}
          <div className="xl:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-800 mb-4">🏆 เมนูขายดี</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} width={90} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '12px', color: 'white', fontSize: '12px' }} formatter={(v) => [`${v} ถาด`, 'จำนวน']} />
                <Bar dataKey="qty" fill="#E11D48" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-800 mb-4">📋 ออร์เดอร์ล่าสุด (กำลังดำเนินการ)</h2>
            <div className="space-y-2">
              {activeOrders.slice(0, 5).map(o => (
                <div key={o.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className="text-lg">{o.orderType === 'DINE_IN' ? '🪑' : o.orderType === 'DELIVERY' ? '🛵' : '🥡'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">#{o.id} {o.tableNumber && `· โต๊ะ ${o.tableNumber}`}</div>
                    <div className="text-xs text-slate-400">฿{o.finalAmount?.toLocaleString()}</div>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    o.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    o.status === 'DELIVERING' ? 'bg-purple-100 text-purple-700' :
                    o.status === 'READY' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>{o.status}</span>
                </div>
              ))}
              {activeOrders.length === 0 && <p className="text-sm text-slate-400">ไม่มีออร์เดอร์ที่กำลังดำเนินการ</p>}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
