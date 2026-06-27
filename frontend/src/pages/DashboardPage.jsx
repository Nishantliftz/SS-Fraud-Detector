import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useScanStore from '../store/scanStore'
import { uploadScan, demoScan, getStats, getHistory } from '../api/scan'
import DropZone from '../components/DropZone'
import AuthenticityGauge from '../components/AuthenticityGauge'
import RiskBadge from '../components/RiskBadge'
import ForensicsPanel from '../components/ForensicsPanel'
import AnalyticsCharts from '../components/AnalyticsCharts'
import ScanHistoryTable from '../components/ScanHistoryTable'
import { Play, Activity, ShieldCheck, History, RefreshCw } from 'lucide-react'

const DashboardPage = () => {
  const navigate = useNavigate()
  const {
    currentScan,
    setScanning,
    setProgress,
    setScanResult,
    setScanError,
    clearScan,
    stats,
    setStats,
    history,
    setHistory,
    setLoadingHistory,
  } = useScanStore()

  const [loadingDemo, setLoadingDemo] = useState(false)
  const [localImageSrc, setLocalImageSrc] = useState(null)

  const fetchDashboardData = async () => {
    try {
      setLoadingHistory(true)
      const [statsRes, historyRes] = await Promise.all([getStats(), getHistory(1, 5)])
      setStats(statsRes.data)
      setHistory(historyRes.data.scans, historyRes.data.total, 1)
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleFileUpload = async (file) => {
    // Generate local preview URL
    const reader = new FileReader()
    reader.onload = (e) => setLocalImageSrc(e.target.result)
    reader.readAsDataURL(file)

    clearScan()
    setScanning(true)
    setProgress(0)

    try {
      const res = await uploadScan(file, (percent) => {
        setProgress(percent)
      })
      setScanResult(res)
      // Refresh stats & logs
      fetchDashboardData()
    } catch (err) {
      setScanError(err.message || 'Verification pipeline encountered a processing error.')
    }
  }

  const handleDemoUpload = async () => {
    setLoadingDemo(true)
    clearScan()
    setLocalImageSrc(null)
    try {
      const res = await demoScan()
      setScanResult(res.data)
      fetchDashboardData()
    } catch (err) {
      setScanError('Demo validation pipeline failed.')
    } finally {
      setLoadingDemo(false)
    }
  }

  const handleSelectScan = (scan) => {
    // Save current scan to store
    setScanResult(scan)
    navigate(`/scan/${scan.scan_id}`)
  }

  return (
    <div className="w-full min-h-[calc(100vh-73px)] p-6 bg-mesh flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Forensic Analysis Hub
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time screenshot tampering analysis, platform template validation, and OCR inconsistency verification.
          </p>
        </div>
        <button
          onClick={handleDemoUpload}
          disabled={loadingDemo}
          className="btn-ghost flex items-center gap-2 px-4 py-2 text-xs font-semibold"
        >
          {loadingDemo ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Run Verification Demo
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <span className="label-text">Total Scans Performed</span>
          <span className="value-text">{stats?.total_scans ?? 0}</span>
          <p className="text-[10px] text-slate-500 font-medium">Scans linked to your analyst session</p>
        </div>
        <div className="stat-card">
          <span className="label-text">Authentic Detections</span>
          <span className="value-text text-green-400">
            {stats?.risk_breakdown?.find((d) => d._id?.toLowerCase() === 'genuine')?.count ?? 0}
          </span>
          <p className="text-[10px] text-slate-500 font-medium">Identified as unmodified payment receipts</p>
        </div>
        <div className="stat-card">
          <span className="label-text">Fraudulent Flags</span>
          <span className="value-text text-red-400">
            {stats?.risk_breakdown?.find((d) => d._id?.toLowerCase() === 'fraudulent')?.count ?? 0}
          </span>
          <p className="text-[10px] text-slate-500 font-medium">Confirmed receipt forge attempts</p>
        </div>
      </div>

      {/* Core Analysis section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Upload Container */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-card p-5 flex flex-col gap-4">
            <h3 className="label-text">Upload Scan Target</h3>
            <DropZone onFileSelected={handleFileUpload} />
          </div>

          {currentScan?.score && (
            <AuthenticityGauge score={currentScan.score.authenticity_score} />
          )}
        </div>

        {/* Dashboard Results (displayed if scan complete) */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          {currentScan ? (
            <div className="flex flex-col gap-6 animate-slide-up">
              <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Analysis Completed</h3>
                  <p className="text-slate-400 text-xs">
                    Target: <span className="text-cyan-400 font-mono">{currentScan.filename}</span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <RiskBadge riskLevel={currentScan.score?.risk_level} />
                  <button
                    onClick={() => navigate(`/scan/${currentScan.scan_id}`, { state: { localImageSrc } })}
                    className="btn-primary text-xs py-2.5 px-4 font-bold"
                  >
                    Open Full Report
                  </button>
                </div>
              </div>

              <ForensicsPanel result={currentScan} />
            </div>
          ) : (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center text-slate-500 h-full min-h-[300px]">
              <Activity className="w-12 h-12 text-slate-700 animate-pulse mb-4" />
              <p className="text-sm font-semibold text-slate-400">Waiting for Upload Target</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Drag-and-drop any transaction screenshot to launch the forensic verification engine.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Visualization charts */}
      <div className="w-full">
        <AnalyticsCharts scanHistory={history} riskBreakdown={stats?.risk_breakdown} />
      </div>

      {/* Recent Activity Scan Table */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="section-title">
            <History className="w-5 h-5 text-slate-400" /> Recent Scans
          </h3>
          <button
            onClick={() => navigate('/history')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            View Full Log &gt;
          </button>
        </div>
        <ScanHistoryTable scans={history} onSelectScan={handleSelectScan} />
      </div>
    </div>
  )
}

export default DashboardPage
