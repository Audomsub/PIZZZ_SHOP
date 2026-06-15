import { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import api from '../../config/axios'

const PROMO_TYPE_LABELS = {
  PERCENTAGE: 'ลดเป็นเปอร์เซ็นต์ (%)',
  FIXED_AMOUNT: 'ลดเป็นจำนวนเงิน (บาท)',
  HAPPY_HOUR: 'Happy Hour (ลด % ตามช่วงเวลา)',
  BOGO: 'ซื้อ 1 แถม 1 (BOGO)',
}

const emptyForm = {
  name: '', code: '', promoType: 'PERCENTAGE', discountValue: '', minOrderAmount: '',
  startDate: '', endDate: '', happyHourStart: '', happyHourEnd: '', isActive: true,
}

function toDateTimeLocal(value) {
  return value ? value.slice(0, 16) : ''
}

function PromotionFormModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial ? {
    name: initial.name || '',
    code: initial.code || '',
    promoType: initial.promoType || 'PERCENTAGE',
    discountValue: initial.discountValue ?? '',
    minOrderAmount: initial.minOrderAmount ?? '',
    startDate: toDateTimeLocal(initial.startDate),
    endDate: toDateTimeLocal(initial.endDate),
    happyHourStart: initial.happyHourStart ?? '',
    happyHourEnd: initial.happyHourEnd ?? '',
    isActive: initial.isActive ?? true,
  } : emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      setError('กรุณากรอกชื่อและโค้ดโปรโมชั่น')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        promoType: form.promoType,
        discountValue: form.discountValue !== '' ? parseFloat(form.discountValue) : 0,
        minOrderAmount: form.minOrderAmount !== '' ? parseFloat(form.minOrderAmount) : 0,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        happyHourStart: form.promoType === 'HAPPY_HOUR' && form.happyHourStart !== '' ? parseInt(form.happyHourStart) : null,
        happyHourEnd: form.promoType === 'HAPPY_HOUR' && form.happyHourEnd !== '' ? parseInt(form.happyHourEnd) : null,
        isActive: form.isActive,
      }
      if (initial) {
        await api.put(`/admin/promotions/${initial.id}`, payload)
      } else {
        await api.post('/admin/promotions', payload)
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'บันทึกไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">{initial ? 'แก้ไขโปรโมชั่น' : 'เพิ่มโปรโมชั่น'}</h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">ชื่อโปรโมชั่น</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E11D48]" />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">โค้ด</label>
            <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[#E11D48]" />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">ประเภท</label>
            <select value={form.promoType} onChange={e => setForm({ ...form, promoType: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E11D48]">
              {Object.entries(PROMO_TYPE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>

          {form.promoType !== 'BOGO' && (
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                ค่าส่วนลด {form.promoType === 'FIXED_AMOUNT' ? '(บาท)' : '(%)'}
              </label>
              <input type="number" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E11D48]" />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">ยอดสั่งซื้อขั้นต่ำ (บาท)</label>
            <input type="number" value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E11D48]" />
          </div>

          {form.promoType === 'HAPPY_HOUR' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">เริ่ม (ชั่วโมง 0-23)</label>
                <input type="number" min="0" max="23" value={form.happyHourStart} onChange={e => setForm({ ...form, happyHourStart: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E11D48]" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">สิ้นสุด (ชั่วโมง 0-23)</label>
                <input type="number" min="0" max="23" value={form.happyHourEnd} onChange={e => setForm({ ...form, happyHourEnd: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E11D48]" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">วันที่เริ่ม (ไม่บังคับ)</label>
              <input type="datetime-local" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E11D48]" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">วันที่สิ้นสุด (ไม่บังคับ)</label>
              <input type="datetime-local" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E11D48]" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 accent-[#E11D48]" />
            เปิดใช้งานโปรโมชั่นนี้
          </label>
        </div>

        {error && <p className="text-red-500 text-xs mt-3">{error}</p>}

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-medium text-sm">ยกเลิก</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-sm disabled:opacity-50">
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const fetchPromotions = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/promotions')
      setPromotions(res.data.data || [])
    } catch (err) {
      console.error('Failed to load promotions', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPromotions() }, [])

  const handleSaved = () => {
    setShowForm(false)
    setEditing(null)
    fetchPromotions()
  }

  const toggleActive = async (promo) => {
    try {
      await api.put(`/admin/promotions/${promo.id}`, { ...promo, isActive: !promo.isActive })
      fetchPromotions()
    } catch (err) {
      console.error('Failed to toggle promotion', err)
    }
  }

  const handleDelete = async (promo) => {
    if (!confirm(`ลบโปรโมชั่น "${promo.name}" ใช่หรือไม่?`)) return
    try {
      await api.delete(`/admin/promotions/${promo.id}`)
      fetchPromotions()
    } catch (err) {
      console.error('Failed to delete promotion', err)
      alert('ลบไม่สำเร็จ')
    }
  }

  const formatDiscount = (promo) => {
    if (promo.promoType === 'BOGO') return 'ซื้อ 1 แถม 1'
    if (promo.promoType === 'FIXED_AMOUNT') return `฿${Number(promo.discountValue).toLocaleString()}`
    return `${Number(promo.discountValue)}%`
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">โปรโมชั่น / โค้ดส่วนลด</h1>
            <p className="text-slate-500 text-sm mt-0.5">จัดการโค้ดส่วนลดที่ใช้ได้ในหน้า POS</p>
          </div>
          <button onClick={() => { setEditing(null); setShowForm(true) }}
            className="bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm">
            + เพิ่มโปรโมชั่น
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['โค้ด', 'ชื่อโปรโมชั่น', 'ประเภท', 'ส่วนลด', 'ขั้นต่ำ', 'ช่วงเวลา', 'สถานะ', 'จัดการ'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">กำลังโหลด...</td></tr>
                ) : promotions.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">ยังไม่มีโปรโมชั่น</td></tr>
                ) : promotions.map(promo => (
                  <tr key={promo.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">{promo.code}</td>
                    <td className="px-4 py-3 text-slate-700">{promo.name}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{PROMO_TYPE_LABELS[promo.promoType]}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600">{formatDiscount(promo)}</td>
                    <td className="px-4 py-3 text-slate-500">{promo.minOrderAmount > 0 ? `฿${Number(promo.minOrderAmount).toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {promo.promoType === 'HAPPY_HOUR' && promo.happyHourStart != null
                        ? `${String(promo.happyHourStart).padStart(2, '0')}:00 - ${String(promo.happyHourEnd).padStart(2, '0')}:00`
                        : promo.endDate ? `ถึง ${new Date(promo.endDate).toLocaleDateString('th-TH')}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(promo)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${
                          promo.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}>
                        {promo.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditing(promo); setShowForm(true) }}
                          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-medium transition-colors">
                          แก้ไข
                        </button>
                        <button onClick={() => handleDelete(promo)}
                          className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-medium transition-colors">
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <PromotionFormModal
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={handleSaved}
        />
      )}
    </AdminLayout>
  )
}
