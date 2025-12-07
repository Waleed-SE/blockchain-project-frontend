import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Wallet from './pages/Wallet'
import SendMoney from './pages/SendMoney'
import TransactionHistory from './pages/TransactionHistory'
import BlockExplorer from './pages/BlockExplorer'
import BlockDetails from './pages/BlockDetails'
import ChainValidation from './pages/ChainValidation'
import Reports from './pages/Reports'
import Logs from './pages/Logs'
import Profile from './pages/Profile'
import Beneficiaries from './pages/Beneficiaries'
import Mining from './pages/Mining'
import Layout from './components/Layout'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="send" element={<SendMoney />} />
        <Route path="history" element={<TransactionHistory />} />
        <Route path="blocks" element={<BlockExplorer />} />
        <Route path="block/:index" element={<BlockDetails />} />
        <Route path="validate" element={<ChainValidation />} />
        <Route path="mining" element={<Mining />} />
        <Route path="reports" element={<Reports />} />
        <Route path="logs" element={<Logs />} />
        <Route path="profile" element={<Profile />} />
        <Route path="beneficiaries" element={<Beneficiaries />} />
      </Route>
    </Routes>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

export default App
