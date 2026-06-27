import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ScanDetailPage from './pages/ScanDetailPage'
import HistoryPage from './pages/HistoryPage'
import useAuthStore from './store/authStore'

function App() {
  const token = useAuthStore((state) => state.token)

  return (
    <Router>
      <div className="min-h-screen bg-navy-950 flex flex-col relative text-slate-200">
        {/* Background Mesh Overlay */}
        <div className="absolute inset-0 bg-mesh pointer-events-none z-0" />
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 w-full">
            <Routes>
              {/* Authenticated Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scan/:scanId"
                element={
                  <ProtectedRoute>
                    <ScanDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <HistoryPage />
                  </ProtectedRoute>
                }
              />

              {/* Guest Routes */}
              <Route
                path="/login"
                element={token ? <Navigate to="/" replace /> : <LoginPage />}
              />
              <Route
                path="/register"
                element={token ? <Navigate to="/" replace /> : <RegisterPage />}
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
