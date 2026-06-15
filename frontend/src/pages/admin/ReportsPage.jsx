import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
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

export default function ReportsPage() {
  const [range, setRange] = useState('today')
  const [sales, setSales] = useState({ totalRevenue: 0, orderCount: 0, avgOrderValue: 0 })
  const [topProducts, setTopProducts] = useState([])
  const { user } = useUserStore()

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const branchId = user?.branchId || 1
        const start = new Date()
        if (range === 'week') start.setDate(start.getDate() - 7)
        if (range === 'month') start.setMonth(start.getMonth() - 1)
        const startDateStr = start.toISOString().split('T')[0]
        const endDateStr = new Date().toISOString().split('T')[0]

        const [salesRes, topRes] = await Promise.all([
          api.get(`/admin/reports/sales?branchId=${branchId}&startDate=${startDateStr}&endDate=${endDateStr}`),
          api.get(`/admin/reports/top-products?branchId=${branchId}&startDate=${startDateStr}&endDate=${endDateStr}`)
        ])

        setSales(salesRes.data.data)
        setTopProducts(topRes.data.data.map(p => ({ name: p.productName, qty: p.totalQty })))
      } catch (err) {
        console.error('Failed to load reports', err)
      }
    }
    fetchReports()
  }, [range, user])

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Reports</h1>
            <p className="text-slate-500 text-sm mt-0.5">รายงานยอดขาย · {new Date().toLocaleDateString('th-TH', { dateStyle: 'full' })}</p>
          </div>
          <div className="flex gap-2">
            {['today', 'week', 'month'].map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${range === r ? 'bg-[#E11D48] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}>
                {r === 'today' ? 'วันนี้' : r === 'week' ? '7 วัน' : '30 วัน'}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <KpiCard emoji="💰" label="ยอดขายรวม" value={`฿${Number(sales.totalRevenue).toLocaleString()}`} sub="ตามช่วงเวลาที่เลือก" color="text-[#E11D48]" />
          <KpiCard emoji="📋" label="จำนวนออร์เดอร์" value={sales.orderCount} sub="ออร์เดอร์ที่สำเร็จ" />
          <KpiCard emoji="🧾" label="ยอดเฉลี่ยต่อบิล" value={`฿${Number(sales.avgOrderValue).toLocaleString()}`} sub="ต่อออร์เดอร์" color="text-[#D97706]" />
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="font-bold text-slate-800 mb-4">🏆 เมนูขายดี</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-slate-400">ไม่มีข้อมูลในช่วงเวลานี้</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(180, topProducts.length * 40)}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} width={120} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '12px', color: 'white', fontSize: '12px' }} formatter={(v) => [`${v} ถาด`, 'จำนวน']} />
                <Bar dataKey="qty" fill="#E11D48" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
