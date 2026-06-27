import React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'

const AnalyticsCharts = ({ scanHistory, riskBreakdown }) => {
  // 1. Prepare Risk Breakdown Data
  const COLORS = ['#22c55e', '#f59e0b', '#ef4444'] // Genuine, Suspicious, Fraudulent
  
  const defaultBreakdown = [
    { name: 'Genuine', value: 0 },
    { name: 'Suspicious', value: 0 },
    { name: 'Fraudulent', value: 0 },
  ]

  if (riskBreakdown && riskBreakdown.length > 0) {
    riskBreakdown.forEach((group) => {
      const name = group._id || 'Unknown'
      const item = defaultBreakdown.find((d) => d.name.toLowerCase() === name.toLowerCase())
      if (item) item.value = group.count
    })
  }

  // Filter out zero-values to keep pie clean
  const pieData = defaultBreakdown.filter((d) => d.value > 0)

  // 2. Prepare Trend Data (last 7 scans or dates)
  const trendData = (scanHistory || [])
    .slice(0, 10)
    .reverse()
    .map((scan, idx) => {
      const date = scan.timestamp ? new Date(scan.timestamp) : new Date()
      return {
        name: `Scan ${idx + 1}`,
        score: scan.score?.authenticity_score ?? 100,
        date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      }
    })

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-navy-800 border border-white/10 p-3 rounded-lg shadow-glass text-xs">
          <p className="font-semibold text-slate-400 mb-1">{payload[0].payload.date}</p>
          <p className="font-bold text-cyan-400">Score: {payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Area Chart: Score Trend */}
      <div className="glass-card p-5 flex flex-col gap-4 min-h-[300px]">
        <h3 className="label-text">Authenticity Score Trend</h3>
        {trendData.length > 0 ? (
          <div className="flex-1 w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#00d4ff"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
            No scan trend data available.
          </div>
        )}
      </div>

      {/* Pie Chart: Risk Distribution */}
      <div className="glass-card p-5 flex flex-col gap-4 min-h-[300px]">
        <h3 className="label-text">Risk Distribution</h3>
        {pieData.length > 0 ? (
          <div className="flex-1 w-full min-h-[220px] flex flex-col items-center justify-center">
            <div className="w-full h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => {
                      // Map colors by name
                      let color = '#22c55e'
                      if (entry.name === 'Suspicious') color = '#f59e0b'
                      if (entry.name === 'Fraudulent') color = '#ef4444'
                      return <Cell key={`cell-${index}`} fill={color} />
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f1629',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="flex gap-4 text-xs font-semibold text-slate-400 mt-2">
              {pieData.map((d, idx) => {
                let badgeColor = 'bg-green-500'
                if (d.name === 'Suspicious') badgeColor = 'bg-amber-500'
                if (d.name === 'Fraudulent') badgeColor = 'bg-red-500'
                return (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${badgeColor}`} />
                    <span>
                      {d.name}: {d.value}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
            No risk distribution data available.
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalyticsCharts
