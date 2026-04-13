import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Public pages
import Home from './pages/Home'
import Fixtures from './pages/Fixtures'
import Standings from './pages/Standings'
import Teams from './pages/Teams'
import TeamDetail from './pages/TeamDetail'
import NewsPage from './pages/NewsPage'
import NewsDetail from './pages/NewsDetail'
import Login from './pages/Login'
import Register from './pages/Register'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import TeamLayout from './layouts/TeamLayout'

// Admin pages
import AdminDashboard from './pages/AdminDashboard/Dashboard'
import AdminTeams from './pages/AdminDashboard/Teams'
import AdminMatches from './pages/AdminDashboard/Matches'
import AdminNews from './pages/AdminDashboard/News'
import AdminPlayers from './pages/AdminDashboard/Players'

// Team pages
import TeamDashboard from './pages/TeamDashboard/Dashboard'
import TeamProfile from './pages/TeamDashboard/Profile'
import TeamPlayers from './pages/TeamDashboard/Players'
import TeamPayment from './pages/TeamDashboard/Payment'
import TeamSchedule from './pages/TeamDashboard/Schedule'

const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role?: string }) => {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/jadwal" element={<Fixtures />} />
        <Route path="/klasemen" element={<Standings />} />
        <Route path="/tim" element={<Teams />} />
        <Route path="/tim/:id" element={<TeamDetail />} />
        <Route path="/berita" element={<NewsPage />} />
        <Route path="/berita/:id" element={<NewsDetail />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/daftar" element={<Register />} />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute role="admin">
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="tim" element={<AdminTeams />} />
        <Route path="pertandingan" element={<AdminMatches />} />
        <Route path="berita" element={<AdminNews />} />
        <Route path="pemain" element={<AdminPlayers />} />
      </Route>

      {/* Team routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute role="team">
          <TeamLayout />
        </ProtectedRoute>
      }>
        <Route index element={<TeamDashboard />} />
        <Route path="profil" element={<TeamProfile />} />
        <Route path="pemain" element={<TeamPlayers />} />
        <Route path="pembayaran" element={<TeamPayment />} />
        <Route path="jadwal" element={<TeamSchedule />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
