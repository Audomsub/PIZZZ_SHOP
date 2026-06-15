import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'

const nav = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/inventory', label: 'Inventory', icon: '📦' },
  { path: '/admin/reports', label: 'Reports', icon: '📈' },
  { path: '/admin/orders', label: 'Order History', icon: '🧾' },
  { path: '/admin/promotions', label: 'Promotions', icon: '🏷️' },
  { path: '/admin/cash-shifts', label: 'Cash Shifts', icon: '💰' },
  { path: '/pos', label: 'POS Terminal', icon: '🏪' },
  { path: '/kds', label: 'Kitchen', icon: '🍳' },
]

export default function AdminLayout({ children }) {
  const { pathname } = useLocation()
  const { user, logout } = useUserStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-60 bg-[#0F172A] flex flex-col py-6 shrink-0">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E11D48] to-[#9F1239] rounded-xl flex items-center justify-center text-xl">🍕</div>
            <div>
              <div className="text-white font-black text-sm">PIZZZ SHOP</div>
              <div className="text-slate-400 text-xs">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {nav.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname === item.path ? 'bg-[#E11D48] text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 mt-4 pt-4 border-t border-white/10">
          <div className="px-3 py-2 rounded-xl bg-white/5 mb-3">
            <div className="text-xs text-slate-400">เข้าสู่ระบบในฐานะ</div>
            <div className="text-white text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</div>
            <div className="text-[#E11D48] text-xs font-medium">{user?.role}</div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all text-sm font-medium">
            🚪 ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
