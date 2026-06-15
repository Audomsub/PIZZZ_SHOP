import { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import api from '../../config/axios'
import { useUserStore } from '../../store/userStore'

function getStockStatus(qty, threshold) {
  const ratio = qty / threshold
  if (ratio <= 1) return { label: 'วิกฤต', color: 'red' }
  if (ratio <= 2) return { label: 'ต่ำ', color: 'amber' }
  return { label: 'ปกติ', color: 'green' }
}

export default function InventoryPage() {
  const [tab, setTab] = useState('stock')
  const [stockItems, setStockItems] = useState([])
  const [wasteLogs, setWasteLogs] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [showWasteForm, setShowWasteForm] = useState(false)
  const [wasteForm, setWasteForm] = useState({ ingredientId: '', qty: '', reason: '' })
  const { user } = useUserStore()

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const branchId = user?.branchId || 1
        const [stockRes, wasteRes, supRes] = await Promise.all([
          api.get(`/admin/inventory?branchId=${branchId}`),
          api.get(`/admin/inventory/waste?branchId=${branchId}`),
          api.get(`/admin/inventory/suppliers`)
        ])
        
        setStockItems(stockRes.data.data.map(item => ({
          id: item.id,
          name: item.ingredient?.name || 'Unknown',
          unit: item.ingredient?.unit || '-',
          qty: item.quantity,
          threshold: item.lowStockThreshold,
          isAllergen: item.ingredient?.isAllergen || false,
          allergyNote: item.ingredient?.allergyNote || null
        })))
        
        setWasteLogs(wasteRes.data.data.map(w => ({
          id: w.id,
          ingredient: w.ingredient?.name || 'Unknown',
          qty: w.quantity,
          unit: w.ingredient?.unit || '-',
          reason: w.reason,
          loggedBy: w.loggedBy?.username || 'Unknown',
          date: new Date(w.createdAt || w.loggedAt).toLocaleString('th-TH')
        })))
        
        setSuppliers(supRes.data.data.map(s => ({
          id: s.id,
          name: s.name,
          contact: s.phone || s.contactPerson,
          email: s.email,
          supplying: 'วัตถุดิบ', // Simplified
          rating: s.rating,
          lastOrder: s.lastOrderDate ? new Date(s.lastOrderDate).toLocaleDateString('th-TH') : '-'
        })))
        
      } catch (err) {
        console.error('Failed to load inventory', err)
      }
    }
    fetchInventory()
  }, [user])

  const tabs = [
    { id: 'stock', label: '📦 สต็อก', count: stockItems.filter(s => s.qty <= s.threshold).length },
    { id: 'waste', label: '🗑️ ของเสีย', count: wasteLogs.length },
    { id: 'suppliers', label: '🏭 Suppliers', count: suppliers.length },
  ]

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Inventory Management</h1>
            <p className="text-slate-500 text-sm mt-0.5">จัดการวัตถุดิบและสต็อก · สาขาสยาม</p>
          </div>
          {tab === 'waste' && (
            <button onClick={() => setShowWasteForm(true)}
              className="bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm">
              + บันทึกของเสีย
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 pb-0">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-t-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                tab === t.id ? 'bg-white border border-b-white border-slate-200 text-[#E11D48] -mb-px' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {t.label}
              {t.count > 0 && <span className="bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Stock Tab */}
        {tab === 'stock' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {['วัตถุดิบ', 'สถานะ', 'คงเหลือ', 'เกณฑ์แจ้งเตือน', 'ข้อมูลแพ้', 'การดำเนินการ'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stockItems.map(item => {
                  const status = getStockStatus(item.qty, item.threshold)
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 text-sm">{item.name}</div>
                        <div className="text-xs text-slate-400">{item.unit}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          status.color === 'red' ? 'bg-red-100 text-red-700' :
                          status.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>{status.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${
                              status.color === 'red' ? 'bg-red-400' :
                              status.color === 'amber' ? 'bg-amber-400' : 'bg-green-400'
                            }`} style={{ width: `${Math.min(100, (item.qty / (item.threshold * 5)) * 100)}%` }} />
                          </div>
                          <span className="font-bold text-sm text-slate-800">{item.qty.toLocaleString()} {item.unit}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.threshold} {item.unit}</td>
                      <td className="px-4 py-3">
                        {item.isAllergen ? (
                          <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">⚠️ {item.allergyNote}</span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-medium transition-colors">
                          อัปเดต
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Waste Tab */}
        {tab === 'waste' && (
          <div className="space-y-4">
            {wasteLogs.map(w => (
              <div key={w.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-xl shrink-0">🗑️</div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">{w.ingredient}</div>
                  <div className="text-sm text-slate-500 mt-0.5">{w.reason} · บันทึกโดย {w.loggedBy}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-red-600">{w.qty} {w.unit}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{w.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Suppliers Tab */}
        {tab === 'suppliers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {suppliers.map(s => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl">🏭</div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{s.name}</div>
                    <div className="text-xs text-slate-400">{s.contact}</div>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">📞 {s.phone}</div>
                  <div className="flex items-center gap-2 text-slate-600">✉️ {s.email}</div>
                </div>
                <button className="mt-4 w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-medium transition-colors">
                  ติดต่อ
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Waste Form Modal */}
        {showWasteForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowWasteForm(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold mb-4">บันทึกของเสีย</h3>
              <div className="space-y-3">
                <select className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E11D48]"
                  value={wasteForm.ingredientId} onChange={e => setWasteForm({...wasteForm, ingredientId: e.target.value})}>
                  <option value="">เลือกวัตถุดิบ</option>
                  {stockItems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input type="number" placeholder="จำนวน (g/ml)" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E11D48]"
                  value={wasteForm.qty} onChange={e => setWasteForm({...wasteForm, qty: e.target.value})} />
                <input type="text" placeholder="เหตุผล" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E11D48]"
                  value={wasteForm.reason} onChange={e => setWasteForm({...wasteForm, reason: e.target.value})} />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowWasteForm(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-medium text-sm">ยกเลิก</button>
                <button onClick={() => setShowWasteForm(false)} className="flex-1 py-2.5 rounded-xl bg-[#E11D48] text-white font-bold text-sm">บันทึก</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
