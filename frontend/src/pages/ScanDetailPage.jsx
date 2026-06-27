import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getScan } from '../api/scan'
import useScanStore from '../store/scanStore'
import RiskBadge from '../components/RiskBadge'
import AuthenticityGauge from '../components/AuthenticityGauge'
import ForensicsPanel from '../components/ForensicsPanel'
import HeatmapOverlay from '../components/HeatmapOverlay'
import { ArrowLeft, RefreshCw, FileImage, ShieldCheck, HelpCircle } from 'lucide-react'

const ScanDetailPage = () => {
  const { scanId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { currentScan, setScanResult } = useScanStore()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Use state image preview if we just uploaded it, otherwise empty
  const [imagePreview, setImagePreview] = useState(location.state?.localImageSrc || null)

  useEffect(() => {
    const fetchScanDetails = async () => {
      // If we already have the matching scan in store, no need to reload
      if (currentScan && currentScan.scan_id === scanId) {
        return
      }

      setLoading(true)
      setError(null)
      try {
        const res = await getScan(scanId)
        setScanResult(res.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to retrieve forensic report.')
      } finally {
        setLoading(false)
      }
    }

    fetchScanDetails()
  }, [scanId])

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-73px)] flex flex-col items-center justify-center gap-4 bg-mesh">
        <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
        <span className="text-sm font-semibold text-slate-400">Loading Forensic Report...</span>
      </div>
    )
  }

  if (error || !currentScan) {
    return (
      <div className="w-full min-h-[calc(100vh-73px)] p-6 flex flex-col items-center justify-center gap-4 bg-mesh max-w-md mx-auto text-center">
        <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-2">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Report Not Found</h2>
        <p className="text-sm text-slate-400">
          {error || 'The requested scan ID does not exist or you do not have permission to view it.'}
        </p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    )
  }

  const { score, ocr, metadata_analysis, filename, timestamp } = currentScan

  return (
    <div className="w-full min-h-[calc(100vh-73px)] p-6 bg-mesh flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Forensic Report: {score?.risk_level}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              File: <span className="font-mono text-cyan-400">{filename}</span> | Date:{' '}
              {timestamp ? new Date(timestamp).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
        <RiskBadge riskLevel={score?.risk_level} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Score & Visual overlays */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
            <div className="sm:col-span-5">
              <AuthenticityGauge score={score?.authenticity_score ?? 0} />
            </div>
            <div className="sm:col-span-7 glass-card p-6 flex flex-col justify-center gap-4">
              <div>
                <span className="label-text">Final Authenticity Verdict</span>
                <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                  {score?.risk_level === 'Genuine' ? (
                    <ShieldCheck className="w-6 h-6 text-green-400" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full animate-ping bg-red-500" />
                  )}
                  {score?.risk_level || 'Unknown'} Match
                </h2>
              </div>
              <div>
                <span className="label-text">Pipeline confidence</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-32 h-2.5 bg-white/5 border border-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 progress-glow rounded-full"
                      style={{ width: `${(score?.confidence ?? 0.5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {((score?.confidence ?? 0.5) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <HeatmapOverlay
            imageSrc={imagePreview || `https://placehold.co/600x400/0f1629/00d4ff?text=${filename}`}
            elaMapBase64={score?.ela_map}
            suspiciousRegions={score?.suspicious_regions}
          />
        </div>

        {/* Right Side: Tabbed Details */}
        <div className="lg:col-span-5 h-full">
          <ForensicsPanel result={currentScan} />
        </div>
      </div>
    </div>
  )
}

export default ScanDetailPage
