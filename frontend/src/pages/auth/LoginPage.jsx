import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/userStore'
import api from '../../config/axios'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useUserStore()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { username, password })
      const { token, ...userData } = res.data.data
      login(userData, token)
      if (userData.role === 'KITCHEN') navigate('/kds')
      else if (userData.role === 'ADMIN' || userData.role === 'MANAGER') navigate('/admin')
      else navigate('/pos')
    } catch (err) {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center relative overflow-hidden">
      {/* Background decorative circles */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#E11D48]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#D97706]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Pizza pattern background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#E11D48] to-[#9F1239] rounded-2xl shadow-2xl mb-4 text-4xl">
            🍕
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">PIZZZ SHOP</h1>
          <p className="text-slate-400 mt-1 text-sm font-medium">Point of Sale System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">เข้าสู่ระบบ</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">ชื่อผู้ใช้</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/50 focus:border-[#E11D48] transition-all"
                placeholder="กรอกชื่อผู้ใช้"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/50 focus:border-[#E11D48] transition-all"
                placeholder="กรอกรหัสผ่าน"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:from-[#BE123C] hover:to-[#9F1239] text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#E11D48]/30 hover:shadow-[#E11D48]/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : 'เข้าสู่ระบบ'}
            </button>
          </form>

          {/* Quick login hints */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Admin', user: 'admin', pass: 'admin1234' },
                { label: 'Manager', user: 'manager1', pass: 'manager1234' },
                { label: 'Cashier', user: 'cashier1', pass: 'cashier1234' },
                { label: 'Kitchen', user: 'kitchen1', pass: 'kitchen1234' },
              ].map(acc => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => { setUsername(acc.user); setPassword(acc.pass) }}
                  className="text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="text-xs font-semibold text-white">{acc.label}</div>
                  <div className="text-xs text-slate-500">{acc.user}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
