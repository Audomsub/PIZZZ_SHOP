import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
  items: [],
  orderType: 'DINE_IN',
  tableNumber: '',
  instructionNotes: '',
  customerId: null,
  promoCode: '',
  discountAmount: 0,

  setOrderType: (type) => set({ orderType: type }),
  setTableNumber: (num) => set({ tableNumber: num }),
  setInstructionNotes: (notes) => set({ instructionNotes: notes }),
  setPromoCode: (code) => set({ promoCode: code }),
  setDiscount: (amount) => set({ discountAmount: amount }),

  addItem: (item) => set((state) => {
    const sameModifiers = (a, b) => {
      const keyOf = (m) => `${m.toppingId}-${m.modifierType}`
      const aKeys = (a || []).map(keyOf).sort()
      const bKeys = (b || []).map(keyOf).sort()
      return aKeys.length === bKeys.length && aKeys.every((k, i) => k === bKeys[i])
    }
    const existing = state.items.find(i =>
      i.productId === item.productId &&
      i.sizeId === item.sizeId &&
      i.crustId === item.crustId &&
      i.isHalfAndHalf === item.isHalfAndHalf &&
      i.productIdHalf === item.productIdHalf &&
      sameModifiers(i.modifiers, item.modifiers)
    )
    if (existing) {
      return {
        items: state.items.map(i =>
          i === existing ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice } : i
        )
      }
    }
    return { items: [...state.items, { ...item, id: Date.now() }] }
  }),

  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  })),

  updateQuantity: (id, quantity) => set((state) => ({
    items: quantity <= 0
      ? state.items.filter(i => i.id !== id)
      : state.items.map(i => i.id === id
          ? { ...i, quantity, subtotal: quantity * i.unitPrice }
          : i
        )
  })),

  clearCart: () => set({
    items: [],
    orderType: 'DINE_IN',
    tableNumber: '',
    instructionNotes: '',
    promoCode: '',
    discountAmount: 0,
  }),

  getSubtotal: () => {
    const { items } = get()
    return items.reduce((sum, item) => sum + (item.subtotal || 0), 0)
  },

  getTax: () => {
    const finalAmount = get().getFinalAmount()
    // VAT inclusive 7%, calculated on post-discount amount
    return finalAmount * 0.07 / 1.07
  },

  getFinalAmount: () => {
    const { getSubtotal, discountAmount } = get()
    return getSubtotal() - discountAmount
  },
}))
