import React from 'react'
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'

const RiskBadge = ({ riskLevel }) => {
  const getBadgeStyle = () => {
    switch (riskLevel?.toLowerCase()) {
      case 'genuine':
        return {
          class: 'badge-genuine shadow-glow-green/10',
          icon: <ShieldCheck className="w-4 h-4 text-green-400 animate-pulse" />,
        }
      case 'suspicious':
        return {
          class: 'badge-suspicious shadow-glow-amber/10',
          icon: <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />,
        }
      case 'fraudulent':
      default:
        return {
          class: 'badge-fraudulent shadow-glow-red/10',
          icon: <ShieldX className="w-4 h-4 text-red-400 animate-pulse" />,
        }
    }
  }

  const badge = getBadgeStyle()

  return (
    <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border font-bold text-sm tracking-wide transition-all duration-300 ${badge.class}`}>
      {badge.icon}
      <span>{riskLevel || 'Unknown'}</span>
    </div>
  )
}

export default RiskBadge
