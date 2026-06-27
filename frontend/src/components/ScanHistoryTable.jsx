import React from 'react'
import { Eye, ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react'

const ScanHistoryTable = ({ scans, onSelectScan }) => {
  const getRiskIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'genuine':
        return <ShieldCheck className="w-4.5 h-4.5 text-green-400" />
      case 'suspicious':
        return <AlertTriangle className="w-4.5 h-4.5 text-amber-400" />
      case 'fraudulent':
      default:
        return <ShieldAlert className="w-4.5 h-4.5 text-red-400" />
    }
  }

  const getScoreBadgeClass = (score) => {
    if (score >= 70) return 'text-green-400 bg-green-500/10 border border-green-500/20'
    if (score >= 40) return 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
    return 'text-red-400 bg-red-500/10 border border-red-500/20'
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/10 glass-card bg-navy-900 shadow-glass">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-4 px-6">Filename</th>
              <th className="py-4 px-6">Platform</th>
              <th className="py-4 px-6">Scan Date</th>
              <th className="py-4 px-6">Score</th>
              <th className="py-4 px-6">Threat Level</th>
              <th className="py-4 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {scans.length > 0 ? (
              scans.map((scan) => (
                <tr
                  key={scan.scan_id}
                  className="table-row-hover hover:bg-white/[0.02] group"
                >
                  <td className="py-3.5 px-6 font-medium text-slate-200 truncate max-w-[200px]" title={scan.filename}>
                    {scan.filename}
                  </td>
                  <td className="py-3.5 px-6 font-mono text-slate-400 uppercase text-xs">
                    {scan.score?.detected_platform || 'unknown'}
                  </td>
                  <td className="py-3.5 px-6 text-slate-400">
                    {scan.timestamp ? new Date(scan.timestamp).toLocaleString() : 'N/A'}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold font-mono ${getScoreBadgeClass(scan.score?.authenticity_score)}`}>
                      {scan.score?.authenticity_score ?? '0'}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="flex items-center gap-1.5 font-semibold text-xs text-slate-200">
                      {getRiskIcon(scan.score?.risk_level)}
                      {scan.score?.risk_level || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => onSelectScan(scan)}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/40 hover:bg-cyan-500/5 transition-all duration-200 inline-flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-12 text-center text-slate-500 text-xs">
                  No scan logs matching filters. Upload a screenshot to create a new scan log.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ScanHistoryTable
