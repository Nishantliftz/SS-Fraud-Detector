import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { Shield, LogOut, LayoutDashboard, History } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="glass-card rounded-none border-t-0 border-x-0 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
        <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
          <Shield className="w-6 h-6 animate-pulse-glow" />
        </div>
        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
          ScreenShield <span className="text-cyan-400 font-extrabold">AI</span>
        </span>
      </Link>

      {user && (
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/') 
                  ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              to="/history"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/history') 
                  ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-4 h-4" />
              Scan History
            </Link>
          </div>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="text-[10px] text-cyan-400/70 font-mono uppercase tracking-wider">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
