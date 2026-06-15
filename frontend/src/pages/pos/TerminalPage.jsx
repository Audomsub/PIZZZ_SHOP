import { useState, useEffect, useRef } from 'react'
import { useCartStore } from '../../store/cartStore'
import { useUserStore } from '../../store/userStore'
import { useShiftStore } from '../../store/shiftStore'
import api from '../../config/axios'
import OrderHistoryModal from '../../components/OrderHistoryModal'



const PIZZA_EMOJIS = { 'Hawaiian': '🍍', 'Pepperoni': '🍕', 'Margherita': '🧀', 'Seafood Delight': '🦐', 'Chicken Wings': '🍗', 'French Fries': '🍟', 'Coca-Cola': '🥤' }
const CAT_ICONS = { 'Pizza': '🍕', 'Appetizer': '🍗', 'Drink': '🥤', 'Dessert': '🍰' }

function formatCurrency(amount) {
  return `฿${Number(amount).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

// ---- Modifier Modal ----
function ModifierModal({ product, onClose, onAdd }) {
  const sizes = [...new Set(product.prices.map(p => p.sizeName))]
  const crusts = [...new Set(product.prices.map(p => p.crustName))]

  const [selectedSize, setSelectedSize] = useState(sizes[1] || sizes[0])
  const [selectedCrust, setSelectedCrust] = useState(crusts[0])
  const [isHalf, setIsHalf] = useState(false)
  const [halfProduct, setHalfProduct] = useState(null)
  const [modifiers, setModifiers] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [allergyWarning, setAllergyWarning] = useState([])

  const allPizzas = window.POS_PRODUCTS ? window.POS_PRODUCTS.filter(p => p.isPizza && p.id !== product.id) : []
  const getPrice = (sizeName, crustName) => {
    const p = product.prices.find(p => p.sizeName === sizeName && p.crustName === crustName)
    return p ? p.price : 0
  }

  const getSizeLetter = (name) => {
    if (name === 'S') return 'priceS'
    if (name === 'M') return 'priceM'
    return 'priceL'
  }

  const toggleModifier = (topping, type) => {
    const key = `${topping.toppingId}-${type}`
    if (modifiers.find(m => m.key === key)) {
      setModifiers(modifiers.filter(m => m.key !== key))
    } else {
      if (type === 'ADD' && topping.isAllergen) {
        setAllergyWarning(prev => [...prev.filter(a => a !== topping.allergyNote), topping.allergyNote])
      }
      setModifiers([...modifiers.filter(m => m.toppingId !== topping.toppingId), {
        key, toppingId: topping.toppingId, name: topping.name,
        modifierType: type, price: type === 'ADD' ? (topping[getSizeLetter(selectedSize)] || 0) : 0
      }])
    }
  }

  const basePrice = getPrice(selectedSize, selectedCrust)
  const halfBasePrice = isHalf && halfProduct
    ? (halfProduct.prices?.find(p => p.sizeName === selectedSize && p.crustName === selectedCrust)?.price || 0)
    : 0
  const effectiveBasePrice = isHalf && halfProduct ? Math.max(basePrice, halfBasePrice) : basePrice
  const modifierTotal = modifiers.filter(m => m.modifierType === 'ADD').reduce((s, m) => s + m.price, 0)
  const unitPrice = effectiveBasePrice + modifierTotal
  const totalPrice = unitPrice * quantity

  const sizeId = product.prices.find(p => p.sizeName === selectedSize)?.sizeId
  const crustId = product.prices.find(p => p.crustName === selectedCrust)?.crustId

  const handleAdd = () => {
    onAdd({
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      sizeId, sizeName: selectedSize,
      crustId, crustName: selectedCrust,
      isHalfAndHalf: isHalf,
      productIdHalf: halfProduct?.id || null,
      productHalfName: halfProduct?.name || null,
      quantity,
      unitPrice,
      subtotal: totalPrice,
      modifiers: modifiers.map(m => ({ toppingId: m.toppingId, modifierType: m.modifierType, price: m.price })),
      modifierLabels: modifiers,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b border-slate-100 z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl mb-1">{PIZZA_EMOJIS[product.name] || '🍕'}</div>
              <h2 className="text-xl font-bold text-slate-900">{product.name}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{product.description}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">✕</button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Size */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">ขนาด</label>
            <div className="flex gap-2">
              {sizes.map(s => (
                <button key={s} onClick={() => setSelectedSize(s)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${selectedSize === s ? 'bg-[#E11D48] text-white shadow-lg shadow-[#E11D48]/30' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Crust */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">ประเภทขอบ</label>
            <div className="space-y-2">
              {crusts.map(c => (
                <button key={c} onClick={() => setSelectedCrust(c)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${selectedCrust === c ? 'border-[#E11D48] bg-[#E11D48]/5 text-[#E11D48]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  <span>{c === 'Cheese Crust' ? '🧀' : c === 'Thin Crust' ? '✨' : '🍕'} {c}</span>
                  <span className="font-bold">{formatCurrency(getPrice(selectedSize, c))}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Half & Half Toggle */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-700">Half & Half 🍕🍕</div>
                <div className="text-xs text-slate-400 mt-0.5">เลือก 2 หน้าพิซซ่าในถาดเดียว</div>
              </div>
              <button onClick={() => setIsHalf(!isHalf)}
                className={`relative w-12 h-6 rounded-full transition-colors ${isHalf ? 'bg-[#E11D48]' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isHalf ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            {isHalf && (
              <div className="mt-3 space-y-2">
                <label className="text-xs font-medium text-slate-500">เลือกหน้าที่ 2</label>
                <div className="grid grid-cols-2 gap-2">
                  {allPizzas.map(p => (
                    <button key={p.id} onClick={() => setHalfProduct(halfProduct?.id === p.id ? null : p)}
                      className={`p-2 rounded-xl text-sm border-2 transition-all ${halfProduct?.id === p.id ? 'border-[#D97706] bg-amber-50 text-[#D97706]' : 'border-slate-200 text-slate-600'}`}>
                      {PIZZA_EMOJIS[p.name]} {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Toppings */}
          {product.toppings && product.toppings.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">ท็อปปิ้ง</label>
              {allergyWarning.length > 0 && (
                <div className="mb-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700">
                  ⚠️ <strong>แจ้งเตือนสารก่อภูมิแพ้:</strong> {allergyWarning.join(', ')}
                </div>
              )}
              <div className="space-y-2">
                {product.toppings.map(t => {
                  const added = modifiers.find(m => m.toppingId === t.toppingId && m.modifierType === 'ADD')
                  const removed = modifiers.find(m => m.toppingId === t.toppingId && m.modifierType === 'REMOVE')
                  return (
                    <div key={t.toppingId} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
                      <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                        {t.name}
                        {t.isAllergen && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">⚠️ แพ้</span>}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => toggleModifier(t, 'REMOVE')}
                          className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${removed ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>−</button>
                        <button onClick={() => toggleModifier(t, 'ADD')}
                          className={`px-3 h-8 rounded-lg text-xs font-bold transition-colors ${added ? 'bg-[#E11D48] text-white' : 'bg-[#E11D48]/10 text-[#E11D48] hover:bg-[#E11D48]/20'}`}>
                          +{formatCurrency(t[getSizeLetter(selectedSize)] || 0)}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
            <span className="text-sm font-semibold text-slate-700">จำนวน</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 flex items-center justify-center transition-colors">−</button>
              <span className="w-8 text-center font-bold text-slate-900 text-lg">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] font-bold text-white flex items-center justify-center transition-colors">+</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white rounded-b-3xl px-6 py-4 border-t border-slate-100">
          <button onClick={handleAdd}
            className="w-full bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:from-[#BE123C] hover:to-[#9F1239] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-[#E11D48]/30 hover:-translate-y-0.5 active:translate-y-0">
            เพิ่มลงตะกร้า · {formatCurrency(totalPrice)}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Payment Modal ----
function PaymentModal({ total, onClose, onPay }) {
  const [method, setMethod] = useState('CASH')
  const [cashGiven, setCashGiven] = useState('')
  const change = method === 'CASH' && cashGiven ? Math.max(0, parseFloat(cashGiven) - total) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-1">ชำระเงิน</h2>
        <p className="text-3xl font-black text-[#E11D48] mb-5">{formatCurrency(total)}</p>

        <div className="space-y-2 mb-5">
          {[
            { id: 'CASH', label: '💵 เงินสด', desc: 'Cash' },
            { id: 'PROMPTPAY', label: '📱 PromptPay', desc: 'QR Code' },
            { id: 'CREDIT_CARD', label: '💳 บัตรเครดิต/เดบิต', desc: 'Card' },
          ].map(m => (
            <button key={m.id} onClick={() => setMethod(m.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${method === m.id ? 'border-[#E11D48] bg-[#E11D48]/5' : 'border-slate-200 hover:border-slate-300'}`}>
              <span className="text-lg">{m.label.split(' ')[0]}</span>
              <div className="text-left">
                <div className="text-sm font-semibold text-slate-800">{m.label.slice(2)}</div>
                <div className="text-xs text-slate-400">{m.desc}</div>
              </div>
              {method === m.id && <div className="ml-auto w-5 h-5 rounded-full bg-[#E11D48] flex items-center justify-center text-white text-xs">✓</div>}
            </button>
          ))}
        </div>

        {method === 'CASH' && (
          <div className="mb-5">
            <label className="text-sm font-medium text-slate-600 mb-1.5 block">รับเงินมา</label>
            <input type="number" value={cashGiven} onChange={e => setCashGiven(e.target.value)}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-xl font-bold text-slate-900 focus:border-[#E11D48] focus:outline-none"
              placeholder="0" />
            {cashGiven && (
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-slate-500">เงินทอน</span>
                <span className="font-bold text-emerald-600">{formatCurrency(change)}</span>
              </div>
            )}
          </div>
        )}

        <button onClick={() => onPay(method)}
          className="w-full bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-[#E11D48]/30 hover:-translate-y-0.5">
          ยืนยันการชำระเงิน
        </button>
      </div>
    </div>
  )
}

// ---- Open Shift Modal ----
function OpenShiftModal({ onOpen }) {
  const [startAmount, setStartAmount] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">💰</div>
          <h2 className="text-xl font-bold text-slate-900">เปิดรอบเงินสด</h2>
          <p className="text-sm text-slate-500 mt-1">กรอกจำนวนเงินสดเริ่มต้นในลิ้นชักก่อนเริ่มขาย</p>
        </div>
        <label className="text-sm font-medium text-slate-600 mb-1.5 block">เงินสดเริ่มต้น</label>
        <input type="number" value={startAmount} onChange={e => setStartAmount(e.target.value)} autoFocus
          className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-xl font-bold text-slate-900 focus:border-[#E11D48] focus:outline-none mb-4"
          placeholder="0" />
        <button onClick={() => onOpen(parseFloat(startAmount) || 0)}
          className="w-full bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-[#E11D48]/30 hover:-translate-y-0.5 active:translate-y-0">
          เปิดรอบและเริ่มขาย
        </button>
      </div>
    </div>
  )
}

// ---- Close Shift Modal ----
function CloseShiftModal({ shift, onClose, onConfirm }) {
  const [actualAmount, setActualAmount] = useState('')
  const expected = shift.endAmount ?? ((shift.startAmount || 0) + (shift.cashSales || 0))
  const variance = actualAmount !== '' ? parseFloat(actualAmount) - expected : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-1">ปิดรอบเงินสด</h2>
        <p className="text-sm text-slate-500 mb-4">{shift.username && `แคชเชียร์ ${shift.username}`}</p>

        <div className="space-y-2 mb-4 text-sm bg-slate-50 rounded-xl p-3">
          <div className="flex justify-between"><span className="text-slate-500">เงินสดเริ่มต้น</span><span className="font-bold">{formatCurrency(shift.startAmount)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">ยอดขายเงินสด</span><span className="font-bold">{formatCurrency(shift.cashSales)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">ยอดขายรวมทั้งหมด</span><span className="font-bold">{formatCurrency(shift.totalSales)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">จำนวนออร์เดอร์</span><span className="font-bold">{shift.orderCount ?? 0}</span></div>
          <div className="flex justify-between pt-2 border-t border-slate-200">
            <span className="text-slate-700 font-semibold">เงินสดที่ควรมีในลิ้นชัก</span>
            <span className="font-black text-[#E11D48]">{formatCurrency(expected)}</span>
          </div>
        </div>

        <label className="text-sm font-medium text-slate-600 mb-1.5 block">นับเงินสดจริง</label>
        <input type="number" value={actualAmount} onChange={e => setActualAmount(e.target.value)} autoFocus
          className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-xl font-bold text-slate-900 focus:border-[#E11D48] focus:outline-none"
          placeholder="0" />
        {actualAmount !== '' && (
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-slate-500">ผลต่าง</span>
            <span className={`font-bold ${variance === 0 ? 'text-slate-700' : variance > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {variance > 0 ? '+' : ''}{formatCurrency(variance)}
            </span>
          </div>
        )}

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm">ยกเลิก</button>
          <button onClick={() => onConfirm(parseFloat(actualAmount) || 0)}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white font-bold text-sm">
            ยืนยันปิดรอบ
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Shift Closed Result Modal ----
function ShiftResultModal({ shift, onDismiss }) {
  const variance = (shift.actualAmount || 0) - (shift.endAmount || 0)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="text-4xl mb-2">✅</div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">ปิดรอบเงินสดสำเร็จ</h2>
        <div className="space-y-2 mb-4 text-sm bg-slate-50 rounded-xl p-3 text-left">
          <div className="flex justify-between"><span className="text-slate-500">เงินสดที่ควรมี</span><span className="font-bold">{formatCurrency(shift.endAmount)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">เงินสดที่นับได้</span><span className="font-bold">{formatCurrency(shift.actualAmount)}</span></div>
          <div className="flex justify-between pt-2 border-t border-slate-200">
            <span className="text-slate-700 font-semibold">ผลต่าง</span>
            <span className={`font-black ${variance === 0 ? 'text-slate-700' : variance > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {variance > 0 ? '+' : ''}{formatCurrency(variance)}
            </span>
          </div>
        </div>
        <button onClick={onDismiss}
          className="w-full bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-[#E11D48]/30">
          เปิดรอบใหม่
        </button>
      </div>
    </div>
  )
}

// ---- Main POS Terminal Page ----
export default function TerminalPage() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('Pizza')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const [heldOrders, setHeldOrders] = useState([])
  const [showHeld, setShowHeld] = useState(false)
  const [showOrderHistory, setShowOrderHistory] = useState(false)

  const { items, orderType, tableNumber, setOrderType, setTableNumber, addItem, removeItem, updateQuantity,
    clearCart, getSubtotal, getTax, getFinalAmount, promoCode, discountAmount, setPromoCode, setDiscount } = useCartStore()
  const { user } = useUserStore()

  const { currentShift, setCurrentShift } = useShiftStore()
  const [shiftChecked, setShiftChecked] = useState(false)
  const [showCloseShift, setShowCloseShift] = useState(false)
  const [shiftResult, setShiftResult] = useState(null)

  const [promoInput, setPromoInput] = useState('')
  const [promoMessage, setPromoMessage] = useState(null)
  const [applyingPromo, setApplyingPromo] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await api.get('/products/categories')
        const prodRes = await api.get('/products')
        setCategories(catRes.data.data || [])
        setProducts(prodRes.data.data || [])
        window.POS_PRODUCTS = prodRes.data.data || []
      } catch (err) {
        console.error('Failed to fetch POS data', err)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchShift = async () => {
      try {
        const branchId = user?.branchId || 1
        const res = await api.get(`/cash-shifts/current?branchId=${branchId}`)
        setCurrentShift(res.data.data || null)
      } catch (err) {
        console.error('Failed to fetch cash shift', err)
      } finally {
        setShiftChecked(true)
      }
    }
    fetchShift()
  }, [user])

  const handleOpenShift = async (startAmount) => {
    try {
      const branchId = user?.branchId || 1
      const res = await api.post('/cash-shifts/open', { branchId, startAmount })
      setCurrentShift(res.data.data)
    } catch (err) {
      console.error(err)
      alert('❌ เปิดรอบเงินสดไม่สำเร็จ: ' + (err.response?.data?.message || err.message))
    }
  }

  const openCloseShiftModal = async () => {
    try {
      const branchId = user?.branchId || 1
      const res = await api.get(`/cash-shifts/current?branchId=${branchId}`)
      setCurrentShift(res.data.data)
      setShowCloseShift(true)
    } catch (err) {
      console.error(err)
    }
  }

  const handleConfirmCloseShift = async (actualAmount) => {
    try {
      const res = await api.post(`/cash-shifts/${currentShift.id}/close`, { actualAmount })
      setShiftResult(res.data.data)
      setShowCloseShift(false)
    } catch (err) {
      console.error(err)
      alert('❌ ปิดรอบเงินสดไม่สำเร็จ: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDismissShiftResult = () => {
    setShiftResult(null)
    setCurrentShift(null)
  }

  const filteredProducts = products.filter(p => p.categoryName === selectedCategory)

  const handleApplyPromo = async () => {
    const code = promoInput.trim()
    if (!code) return
    setApplyingPromo(true)
    try {
      const res = await api.get('/promotions/validate', { params: { code, orderAmount: getSubtotal() } })
      const data = res.data.data
      if (data.valid) {
        setPromoCode(data.code)
        setDiscount(data.discountAmount || 0)
        setPromoMessage({ type: 'success', text: `${data.message} (-${formatCurrency(data.discountAmount)})` })
      } else {
        setPromoCode('')
        setDiscount(0)
        setPromoMessage({ type: 'error', text: data.message })
      }
    } catch (err) {
      setPromoCode('')
      setDiscount(0)
      setPromoMessage({ type: 'error', text: err.response?.data?.message || 'ไม่สามารถใช้โค้ดส่วนลดได้' })
    } finally {
      setApplyingPromo(false)
    }
  }

  const handleRemovePromo = () => {
    setPromoCode('')
    setDiscount(0)
    setPromoInput('')
    setPromoMessage(null)
  }

  const handlePay = async (method) => {
    if (items.length === 0) return
    try {
      const orderReq = {
        branchId: user.branchId || 1, // Default to 1 if not set
        orderType: orderType,
        tableNumber: orderType === 'DINE_IN' ? tableNumber : null,
        cashShiftId: currentShift?.id || null,
        promoCode: promoCode || null,
        items: items.map(i => ({
          productId: i.productId,
          sizeId: i.sizeId,
          crustId: i.crustId,
          isHalfAndHalf: i.isHalfAndHalf,
          productIdHalf: i.productIdHalf,
          quantity: i.quantity,
          modifiers: i.modifiers || []
        }))
      }

      const res = await api.post('/orders', orderReq)
      const orderId = res.data.data.id

      await api.post(`/orders/${orderId}/pay`, { paymentMethod: method })

      setShowPayment(false)
      clearCart()
      setTableNumber('')
      setPromoInput('')
      setPromoMessage(null)
      alert('✅ ชำระเงินและส่งออร์เดอร์สำเร็จ!')
    } catch (err) {
      console.error(err)
      alert('❌ เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message))
    }
  }

  const holdOrder = () => {
    if (items.length === 0) return
    setHeldOrders(prev => [...prev, { id: Date.now(), items: [...items], orderType, tableNumber, createdAt: new Date() }])
    clearCart()
    alert('✅ พักออร์เดอร์แล้ว')
  }

  const recallOrder = (order) => {
    clearCart()
    order.items.forEach(item => addItem(item))
    setOrderType(order.orderType)
    setTableNumber(order.tableNumber)
    setHeldOrders(prev => prev.filter(o => o.id !== order.id))
    setShowHeld(false)
  }

  return (
    <div className="h-screen flex bg-slate-100 overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-56 bg-[#0F172A] flex flex-col py-4 px-3 shrink-0">
        <div className="text-center mb-6">
          <div className="text-2xl mb-1">🍕</div>
          <div className="text-white font-black text-sm">PIZZZ SHOP</div>
          <div className="text-slate-400 text-xs mt-0.5">{user?.firstName} {user?.lastName}</div>
        </div>

        {/* Categories */}
        <div className="space-y-1 flex-1">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide px-2 mb-2">เมนู</div>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.name)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat.name ? 'bg-[#E11D48] text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}>
              <span>{CAT_ICONS[cat.name] || '📦'}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Hold/Recall */}
        <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
          <button onClick={holdOrder}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-400 hover:bg-amber-400/10 transition-all">
            ⏸ พักออร์เดอร์
          </button>
          <button onClick={() => setShowHeld(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-400 hover:bg-blue-400/10 transition-all relative">
            🔁 เรียกคืน
            {heldOrders.length > 0 && (
              <span className="ml-auto bg-[#E11D48] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{heldOrders.length}</span>
            )}
          </button>
          {currentShift && (
            <button onClick={openCloseShiftModal}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-emerald-400 hover:bg-emerald-400/10 transition-all">
              🔒 ปิดรอบเงินสด
            </button>
          )}
          <button onClick={() => setShowOrderHistory(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all">
            🧾 ใบเสร็จ/ประวัติ
          </button>
        </div>

        {/* Order type */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide px-2 mb-2">ประเภท</div>
          {[
            { id: 'DINE_IN', label: '🪑 Dine-in' },
            { id: 'TAKEAWAY', label: '🥡 Takeaway' },
            { id: 'DELIVERY', label: '🛵 Delivery' },
          ].map(t => (
            <button key={t.id} onClick={() => setOrderType(t.id)}
              className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-all mb-1 ${orderType === t.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Menu Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-xl font-bold text-slate-800">{selectedCategory}</h1>
          <span className="text-sm text-slate-400">{filteredProducts.length} รายการ</span>
          {orderType === 'DINE_IN' && (
            <input value={tableNumber} onChange={e => setTableNumber(e.target.value)}
              placeholder="โต๊ะที่..."
              className="ml-auto border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-[#E11D48] w-28" />
          )}
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
          {filteredProducts.map(product => {
            const minPrice = Math.min(...product.prices.map(p => p.price))
            return (
              <button key={product.id} onClick={() => setSelectedProduct(product)}
                className="bg-white rounded-2xl p-4 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-slate-100 hover:border-[#E11D48]/30 group">
                <div className="text-4xl mb-3 text-center">{PIZZA_EMOJIS[product.name] || '🍕'}</div>
                <div className="font-bold text-slate-800 text-sm leading-tight">{product.name}</div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-1">{product.description}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[#E11D48] font-black text-sm">
                    {product.prices.length > 1 ? `${formatCurrency(minPrice)}+` : formatCurrency(minPrice)}
                  </span>
                  {product.isPizza && <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">พิซซ่า</span>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right Cart Drawer */}
      <div className="w-80 bg-white border-l border-slate-100 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800">ออร์เดอร์</h2>
            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${orderType === 'DINE_IN' ? 'bg-blue-100 text-blue-700' : orderType === 'TAKEAWAY' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
              {orderType === 'DINE_IN' ? '🪑 Dine-in' : orderType === 'TAKEAWAY' ? '🥡 Takeaway' : '🛵 Delivery'}
              {tableNumber && ` · โต๊ะ ${tableNumber}`}
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 py-10">
              <div className="text-5xl mb-3">🛒</div>
              <p className="text-sm font-medium">ยังไม่มีรายการ</p>
              <p className="text-xs mt-1">เลือกเมนูเพื่อเพิ่ม</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 text-sm truncate">
                      {PIZZA_EMOJIS[item.productName] || '🍕'} {item.productName}
                    </div>
                    {item.isHalfAndHalf && item.productHalfName && (
                      <div className="text-xs text-amber-600">½ + {item.productHalfName}</div>
                    )}
                    <div className="text-xs text-slate-400 mt-0.5">{item.sizeName} · {item.crustName}</div>
                    {item.modifierLabels?.filter(m => m.modifierType === 'ADD').map(m => (
                      <div key={m.key} className="text-xs text-emerald-600">+{m.name}</div>
                    ))}
                    {item.modifierLabels?.filter(m => m.modifierType === 'REMOVE').map(m => (
                      <div key={m.key} className="text-xs text-red-500">−{m.name}</div>
                    ))}
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-400 transition-colors text-xs shrink-0">✕</button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs font-bold transition-colors">−</button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-lg bg-[#E11D48]/10 hover:bg-[#E11D48]/20 text-[#E11D48] flex items-center justify-center text-xs font-bold transition-colors">+</button>
                  </div>
                  <span className="text-sm font-black text-slate-800">{formatCurrency(item.subtotal)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 p-4 space-y-2">
            {/* Promo Code */}
            {promoCode ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-1">
                <div className="text-xs">
                  <div className="font-bold text-emerald-700">🏷️ {promoCode}</div>
                  <div className="text-emerald-600">ลด {formatCurrency(discountAmount)}</div>
                </div>
                <button onClick={handleRemovePromo} className="text-emerald-400 hover:text-red-500 text-xs font-bold">ลบ</button>
              </div>
            ) : (
              <div className="flex gap-2 mb-1">
                <input value={promoInput} onChange={e => setPromoInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                  placeholder="โค้ดส่วนลด"
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#E11D48]" />
                <button onClick={handleApplyPromo} disabled={applyingPromo || !promoInput.trim()}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition-colors">
                  {applyingPromo ? '...' : 'ใช้โค้ด'}
                </button>
              </div>
            )}
            {promoMessage && (
              <p className={`text-xs -mt-0.5 mb-1 ${promoMessage.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                {promoMessage.text}
              </p>
            )}

            <div className="flex justify-between text-sm text-slate-500">
              <span>ยอดรวม</span>
              <span>{formatCurrency(getSubtotal())}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>ส่วนลด</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-slate-500">
              <span>VAT 7% (รวมแล้ว)</span>
              <span>{formatCurrency(getTax())}</span>
            </div>
            <div className="flex justify-between font-black text-lg text-slate-900 pt-1 border-t border-slate-100">
              <span>รวมทั้งหมด</span>
              <span className="text-[#E11D48]">{formatCurrency(getFinalAmount())}</span>
            </div>
            <button onClick={() => setShowPayment(true)}
              className="w-full bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:from-[#BE123C] hover:to-[#9F1239] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-[#E11D48]/30 hover:-translate-y-0.5 active:translate-y-0 mt-2">
              💳 ชำระเงิน {formatCurrency(getFinalAmount())}
            </button>
          </div>
        )}
      </div>

      {/* Modifier Modal */}
      {selectedProduct && (
        <ModifierModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={(item) => { addItem(item); setSelectedProduct(null) }}
        />
      )}

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          total={getFinalAmount()}
          onClose={() => setShowPayment(false)}
          onPay={handlePay}
        />
      )}

      {/* Held Orders Modal */}
      {showHeld && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHeld(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">ออร์เดอร์ที่พักไว้</h2>
              <button onClick={() => setShowHeld(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            {heldOrders.length === 0 ? (
              <p className="text-slate-400 text-center py-6">ไม่มีออร์เดอร์ที่พักไว้</p>
            ) : (
              <div className="space-y-2">
                {heldOrders.map(order => (
                  <button key={order.id} onClick={() => recallOrder(order)}
                    className="w-full text-left bg-slate-50 hover:bg-blue-50 rounded-xl p-4 transition-colors border border-slate-200 hover:border-blue-300">
                    <div className="font-semibold text-slate-800 text-sm">{order.items.length} รายการ · {order.orderType}</div>
                    <div className="text-xs text-slate-400 mt-1">{new Date(order.createdAt).toLocaleTimeString('th-TH')}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Open Shift Modal */}
      {shiftChecked && !currentShift && !shiftResult && (
        <OpenShiftModal onOpen={handleOpenShift} />
      )}

      {/* Close Shift Modal */}
      {showCloseShift && currentShift && (
        <CloseShiftModal
          shift={currentShift}
          onClose={() => setShowCloseShift(false)}
          onConfirm={handleConfirmCloseShift}
        />
      )}

      {/* Shift Result Modal */}
      {shiftResult && (
        <ShiftResultModal shift={shiftResult} onDismiss={handleDismissShiftResult} />
      )}

      {/* Order History / Receipts Modal */}
      {showOrderHistory && (
        <OrderHistoryModal branchId={user?.branchId || 1} onClose={() => setShowOrderHistory(false)} />
      )}
    </div>
  )
}
