import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, Suspense, lazy } from 'react'
import { useUserStore } from './store/userStore'

import LoginPage from './pages/auth/LoginPage'

const TerminalPage = lazy(() => import('./pages/pos/TerminalPage'))
const KitchenBoardPage = lazy(() => import('./pages/kds/KitchenBoardPage'))
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
const InventoryPage = lazy(() => import('./pages/admin/InventoryPage'))
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage'))
const OrderHistoryPage = lazy(() => import('./pages/admin/OrderHistoryPage'))
const PromotionsPage = lazy(() => import('./pages/admin/PromotionsPage'))
const CashShiftHistoryPage = lazy(() => import('./pages/admin/CashShiftHistoryPage'))

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useUserStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

function PageLoader() {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="text-3xl animate-pulse">🍕</div>
    </div>
  )
}

export default function App() {
  const { initFromStorage } = useUserStore()

  useEffect(() => {
    initFromStorage()
  }, [])

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/pos" replace />} />

          <Route path="/pos" element={
            <ProtectedRoute roles={['ADMIN', 'MANAGER', 'CASHIER']}>
              <TerminalPage />
            </ProtectedRoute>
          } />

          <Route path="/kds" element={
            <ProtectedRoute roles={['ADMIN', 'MANAGER', 'KITCHEN']}>
              <KitchenBoardPage />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
              <DashboardPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/inventory" element={
            <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
              <InventoryPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/reports" element={
            <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
              <ReportsPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/orders" element={
            <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
              <OrderHistoryPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/promotions" element={
            <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
              <PromotionsPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/cash-shifts" element={
            <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
              <CashShiftHistoryPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
