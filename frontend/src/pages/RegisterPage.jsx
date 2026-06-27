import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import useAuthStore from '../store/authStore'
import { Shield, KeyRound, Mail, User, AlertCircle, RefreshCw } from 'lucide-react'

const RegisterPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await register(email, password, name)
      setAuth(res.data.token, res.data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register new analyst account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-73px)] flex items-center justify-center p-6 bg-mesh">
      <div className="w-full max-w-md glass-card p-8 flex flex-col relative overflow-hidden group">
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/15 transition-all duration-500" />
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/25 rounded-2xl text-cyan-400 mb-4 shadow-glow-cyan/10">
            <Shield className="w-8 h-8 animate-pulse-glow" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Create Account</h2>
          <p className="text-slate-400 text-xs mt-1.5">Register a new forensic analyst account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium flex items-start gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="label-text">Full Name</label>
            <div className="relative">
              <User className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Agent Coulson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-glass pl-11"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label-text">Email Address</label>
            <div className="relative">
              <Mail className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="analyst@screenshield.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glass pl-11"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label-text">Secret Password</label>
            <div className="relative">
              <KeyRound className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-glass pl-11"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
            {loading ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : 'Register Analyst Profile'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          Already registered?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
            Sign In Instead
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
