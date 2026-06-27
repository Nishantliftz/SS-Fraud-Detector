import { create } from 'zustand'

const useScanStore = create((set, get) => ({
  // Current scan
  currentScan: null,
  uploadProgress: 0,
  isScanning: false,
  scanError: null,

  // History
  history: [],
  historyTotal: 0,
  historyPage: 1,
  isLoadingHistory: false,

  // Stats
  stats: null,

  setScanning: (v) => set({ isScanning: v }),
  setProgress: (p) => set({ uploadProgress: p }),
  setScanResult: (result) => set({ currentScan: result, isScanning: false, uploadProgress: 100, scanError: null }),
  setScanError: (err) => set({ scanError: err, isScanning: false }),
  clearScan: () => set({ currentScan: null, uploadProgress: 0, scanError: null }),

  setHistory: (scans, total, page) => set({ history: scans, historyTotal: total, historyPage: page, isLoadingHistory: false }),
  setLoadingHistory: (v) => set({ isLoadingHistory: v }),
  setStats: (s) => set({ stats: s }),
}))

export default useScanStore
