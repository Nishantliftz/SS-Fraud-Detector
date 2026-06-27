import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHistory } from '../api/scan'
import useScanStore from '../store/scanStore'
import ScanHistoryTable from '../components/ScanHistoryTable'
import { ArrowLeft, RefreshCw, ChevronLeft, ChevronRight, Filter } from 'lucide-react'

const HistoryPage = () => {
  const navigate = useNavigate()
  const { history, historyTotal, historyPage, setHistory, isLoadingHistory, setLoadingHistory } = useScanStore()
  
  const [filterRisk, setFilterRisk] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const limit = 10

  const fetchHistory = async (pageToFetch) => {
    setLoadingHistory(true)
    try {
      const res = await getHistory(pageToFetch, limit)
      setHistory(res.data.scans, res.data.total, pageToFetch)
    } catch (err) {
      console.error('Failed to fetch scan log history:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    fetchHistory(historyPage || 1)
  }, [historyPage])

  const handleSelectScan = (scan) => {
    navigate(`/scan/${scan.scan_id}`)
  }

  // Filter history logs locally by risk level or filename search query
  const filteredScans = history.filter((scan) => {
    const matchesRisk = filterRisk === 'all' || scan.score?.risk_level?.toLowerCase() === filterRisk.toLowerCase()
    const matchesSearch = scan.filename?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          scan.score?.detected_platform?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRisk && matchesSearch
  })

  const totalPages = Math.max(1, Math.ceil(historyTotal / limit))

  return (
    <div className="w-full min-h-[calc(100vh-73px)] p-6 bg-mesh flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Verification History</h1>
          <p className="text-slate-400 text-xs mt-1">
            Browse and inspect all historical tamper scan logs generated under your analyst account.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search filename or platform..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-glass text-xs py-2 px-4"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto items-center">
          <Filter className="w-4.5 h-4.5 text-slate-400" />
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="bg-navy-800 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400/60"
          >
            <option value="all">All Threat Levels</option>
            <option value="genuine">Genuine Only</option>
            <option value="suspicious">Suspicious Only</option>
            <option value="fraudulent">Fraudulent Only</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      {isLoadingHistory ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Fetching history logs...</span>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6">
          <ScanHistoryTable scans={filteredScans} onSelectScan={handleSelectScan} />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center glass-card px-6 py-4">
              <span className="text-xs font-semibold text-slate-400">
                Showing page <span className="text-white">{historyPage}</span> of{' '}
                <span className="text-white">{totalPages}</span> ({historyTotal} logs total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchHistory(historyPage - 1)}
                  disabled={historyPage === 1}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fetchHistory(historyPage + 1)}
                  disabled={historyPage === totalPages}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default HistoryPage
