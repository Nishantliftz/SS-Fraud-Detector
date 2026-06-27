import React, { useEffect, useState } from 'react'

const AuthenticityGauge = ({ score }) => {
  const [offset, setOffset] = useState(440)
  const radius = 70
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    // Animate the gauge ring filling
    const progressOffset = circumference - (score / 100) * circumference
    const timer = setTimeout(() => {
      setOffset(progressOffset)
    }, 100)
    return () => clearTimeout(timer)
  }, [score, circumference])

  const getScoreColor = () => {
    if (score >= 70) return 'stroke-green-500 shadow-glow-green'
    if (score >= 40) return 'stroke-amber-500 shadow-glow-amber'
    return 'stroke-red-500 shadow-glow-red'
  }

  const getScoreTextClass = () => {
    if (score >= 70) return 'text-green-400'
    if (score >= 40) return 'text-amber-400'
    return 'text-red-400'
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 glass-card relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      <h3 className="label-text mb-4 text-center">Authenticity Score</h3>

      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background Ring */}
          <circle
            cx="88"
            cy="88"
            r={radius}
            className="stroke-navy-700"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Animated Foreground Ring */}
          <circle
            cx="88"
            cy="88"
            r={radius}
            className={`gauge-ring transition-all duration-[1500ms] ease-out ${getScoreColor()}`}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-extrabold tracking-tight ${getScoreTextClass()}`}>
            {score}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">
            of 100
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-4 text-xs font-semibold text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span>&gt;=70 Safe</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>40-69 Suspicious</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span>&lt;40 Fraud</span>
        </div>
      </div>
    </div>
  )
}

export default AuthenticityGauge
