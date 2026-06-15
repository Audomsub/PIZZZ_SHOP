export function formatCurrency(amount) {
  return `฿${Number(amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const ORDER_TYPE_LABELS = { DINE_IN: '🪑 Dine-in', TAKEAWAY: '🥡 Takeaway', DELIVERY: '🛵 Delivery' }
export const STATUS_LABELS = {
  PENDING: 'รอดำเนินการ', PREPARING: 'กำลังเตรียม', BAKING: 'กำลังอบ', READY: 'พร้อมเสิร์ฟ',
  DELIVERING: 'กำลังส่ง', COMPLETED: 'เสร็จสมบูรณ์', VOIDED: 'ยกเลิก',
}
export const STATUS_COLORS = {
  PENDING: 'bg-slate-100 text-slate-600', PREPARING: 'bg-blue-100 text-blue-700', BAKING: 'bg-amber-100 text-amber-700',
  READY: 'bg-green-100 text-green-700', DELIVERING: 'bg-purple-100 text-purple-700', COMPLETED: 'bg-emerald-100 text-emerald-700',
  VOIDED: 'bg-red-100 text-red-700',
}
export const PAYMENT_LABELS = { CASH: '💵 เงินสด', PROMPTPAY: '📱 พร้อมเพย์', CREDIT_CARD: '💳 บัตรเครดิต' }

export default function ReceiptModal({ order, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm no-print" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto receipt-print">
        <div className="p-6 font-mono">
          <div className="text-center mb-4">
            <div className="text-3xl mb-1">🍕</div>
            <div className="font-black text-lg">PIZZZ SHOP</div>
            <div className="text-xs text-slate-400">{order.branchName}</div>
            <div className="text-xs text-slate-400 mt-1">{new Date(order.createdAt).toLocaleString('th-TH')}</div>
          </div>

          <div className="text-xs space-y-1 mb-3 pb-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between"><span>ออร์เดอร์ #</span><span className="font-bold">{order.id}</span></div>
            <div className="flex justify-between"><span>ประเภท</span><span>{ORDER_TYPE_LABELS[order.orderType]}</span></div>
            {order.tableNumber && <div className="flex justify-between"><span>โต๊ะ</span><span>{order.tableNumber}</span></div>}
            <div className="flex justify-between"><span>แคชเชียร์</span><span>{order.cashierName || '-'}</span></div>
          </div>

          <div className="text-xs space-y-2 mb-3 pb-3 border-b border-dashed border-slate-300">
            {order.items.map(item => (
              <div key={item.id}>
                <div className="flex justify-between font-semibold">
                  <span>{item.quantity}× {item.productName}{item.isHalfAndHalf && item.productHalfName ? ` / ${item.productHalfName}` : ''}</span>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
                {(item.sizeName || item.crustName) && (
                  <div className="text-slate-400 ml-3">{[item.sizeName, item.crustName].filter(Boolean).join(' · ')}</div>
                )}
                {item.modifiers?.map((m, i) => (
                  <div key={i} className="text-slate-400 ml-3">{m.modifierType === 'ADD' ? '+' : '−'} {m.toppingName}</div>
                ))}
              </div>
            ))}
          </div>

          <div className="text-xs space-y-1 mb-3 pb-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between"><span>ยอดรวม</span><span>{formatCurrency(order.totalAmount)}</span></div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>ส่วนลด{order.promoCode ? ` (${order.promoCode})` : ''}</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between"><span>VAT 7% (รวมแล้ว)</span><span>{formatCurrency(order.taxAmount)}</span></div>
            <div className="flex justify-between font-black text-sm pt-1"><span>รวมทั้งหมด</span><span>{formatCurrency(order.finalAmount)}</span></div>
          </div>

          <div className="text-xs space-y-1 mb-4">
            <div className="flex justify-between"><span>ชำระโดย</span><span>{PAYMENT_LABELS[order.paymentMethod] || '-'}</span></div>
            <div className="flex justify-between items-center"><span>สถานะ</span><span className={`px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span></div>
          </div>

          <div className="text-center text-xs text-slate-400">ขอบคุณที่ใช้บริการ 🙏</div>
        </div>

        <div className="p-4 border-t border-slate-100 flex gap-2 no-print">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm">ปิด</button>
          <button onClick={() => window.print()}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white font-bold text-sm">
            🖨️ พิมพ์ใบเสร็จ
          </button>
        </div>
      </div>
    </div>
  )
}
