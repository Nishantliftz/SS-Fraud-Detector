import React, { useState } from 'react'
import { FileText, Database, ShieldAlert, Cpu, AlertTriangle, CheckCircle2 } from 'lucide-react'

const ForensicsPanel = ({ result }) => {
  const [activeTab, setActiveTab] = useState('summary')

  if (!result) return null

  const tabs = [
    { id: 'summary', label: 'Summary', icon: <Cpu className="w-4 h-4" /> },
    { id: 'ocr', label: 'OCR Findings', icon: <FileText className="w-4 h-4" /> },
    { id: 'metadata', label: 'Metadata & EXIF', icon: <Database className="w-4 h-4" /> },
    { id: 'flags', label: 'Suspicious Flags', icon: <ShieldAlert className="w-4 h-4" /> },
  ]

  const ocrData = result.ocr || {}
  const metadataData = result.metadata_analysis || {}
  const scoreBreakdown = result.score?.breakdown || {}
  const issues = result.score?.issues || []
  const suspiciousFlags = result.score?.suspicious_flags || []

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-white/[0.02]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-4 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all duration-200 ${
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-400 bg-white/[0.03]'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto flex-1 max-h-[350px]">
        {activeTab === 'summary' && (
          <div className="flex flex-col gap-5">
            <div>
              <h4 className="label-text mb-2">Recommendation</h4>
              <p className="text-sm font-medium text-slate-200 leading-relaxed bg-white/5 border border-white/10 rounded-xl p-4">
                {result.score?.recommendation}
              </p>
            </div>

            <div>
              <h4 className="label-text mb-3">Score Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">OCR Score</p>
                  <p className="text-lg font-bold text-white mt-1">{scoreBreakdown.ocr_score ?? 'N/A'}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Metadata</p>
                  <p className="text-lg font-bold text-white mt-1">{scoreBreakdown.metadata_score ?? 'N/A'}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">ELA/Forensics</p>
                  <p className="text-lg font-bold text-white mt-1">{scoreBreakdown.forensics_score ?? 'N/A'}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Template Match</p>
                  <p className="text-lg font-bold text-white mt-1">{scoreBreakdown.template_score ?? 'N/A'}</p>
                </div>
              </div>
            </div>

            {issues.length > 0 && (
              <div>
                <h4 className="label-text mb-2">Detected Anomalies ({issues.length})</h4>
                <ul className="flex flex-col gap-2">
                  {issues.map((issue, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-red-400/90 flex items-start gap-2.5 bg-red-500/5 border border-red-500/10 p-2.5 rounded-lg"
                    >
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ocr' && (
          <div className="flex flex-col gap-5">
            <div>
              <h4 className="label-text mb-2">Detected Platform</h4>
              <p className="text-sm font-bold text-white bg-white/5 border border-white/10 px-4 py-2.5 rounded-lg inline-block font-mono uppercase">
                {result.score?.detected_platform || 'unknown'}
              </p>
            </div>

            <div>
              <h4 className="label-text mb-2">Raw OCR Text</h4>
              <pre className="text-xs font-mono text-slate-300 bg-navy-950 border border-white/5 rounded-xl p-4 overflow-x-auto leading-relaxed max-h-[160px] whitespace-pre-wrap">
                {ocrData.text || 'No text detected in screenshot.'}
              </pre>
            </div>

            <div>
              <h4 className="label-text mb-2">UI Alignment Deviations</h4>
              {result.score?.ui_deviations?.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {result.score.ui_deviations.map((dev, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-white/5 border border-white/10 p-2.5 rounded-lg">
                      <span className="font-semibold text-slate-200 capitalize">{dev.element}</span>
                      <span className={`font-mono font-bold px-2 py-0.5 rounded ${dev.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        Dev: {(dev.deviation * 100).toFixed(1)}% ({dev.severity})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Structural UI elements align with the authentic reference template.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'metadata' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                <span className="label-text block mb-1">Has EXIF Data</span>
                <span className={`text-sm font-bold ${metadataData.has_exif ? 'text-green-400' : 'text-red-400'}`}>
                  {metadataData.has_exif ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                <span className="label-text block mb-1">Editing Software</span>
                <span className="text-sm font-bold text-white font-mono">
                  {metadataData.software || 'None Detected'}
                </span>
              </div>
            </div>

            {metadataData.issues?.length > 0 && (
              <div>
                <h4 className="label-text mb-2">Metadata Warnings</h4>
                <ul className="flex flex-col gap-2">
                  {metadataData.issues.map((msg, idx) => (
                    <li key={idx} className="text-xs text-amber-400/90 flex items-center gap-2 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-lg">
                      <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0" />
                      <span>{msg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'flags' && (
          <div className="flex flex-col gap-4">
            {suspiciousFlags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {suspiciousFlags.map((flag, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold font-mono shadow-glow-red/5"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-green-400 flex flex-col items-center gap-3">
                <CheckCircle2 className="w-8 h-8 animate-pulse" />
                <span className="text-sm font-medium">No critical manipulation flags triggered.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ForensicsPanel
