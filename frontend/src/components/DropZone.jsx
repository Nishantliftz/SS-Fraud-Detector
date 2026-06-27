import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, Image as ImageIcon, AlertCircle } from 'lucide-react'
import useScanStore from '../store/scanStore'

const DropZone = ({ onFileSelected }) => {
  const { isScanning, uploadProgress, scanError } = useScanStore()

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0 && !isScanning) {
        onFileSelected(acceptedFiles[0])
      }
    },
    [isScanning, onFileSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif'],
    },
    maxFiles: 1,
    disabled: isScanning,
  })

  return (
    <div className="w-full flex flex-col gap-4">
      <div
        {...getRootProps()}
        className={`w-full h-64 border-2 border-dashed border-white/15 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 bg-white/[0.02] hover:bg-white/[0.04] hover:border-cyan-500/40 hover:shadow-glow-cyan/5 ${
          isDragActive ? 'dropzone-active' : ''
        } ${isScanning ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="p-4 bg-cyan-500/5 border border-cyan-500/15 rounded-full text-cyan-400 mb-4 animate-float">
          <UploadCloud className="w-8 h-8" />
        </div>
        <p className="text-white font-medium mb-1 text-base">
          {isDragActive ? 'Drop your payment screenshot here...' : 'Drag & drop image here'}
        </p>
        <p className="text-slate-400 text-xs mb-3">
          Supports PNG, JPG, JPEG, WEBP, BMP, GIF (Max 16MB)
        </p>
        <button
          type="button"
          disabled={isScanning}
          className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold text-xs transition-all duration-200 hover:bg-cyan-500/20 hover:scale-[1.02]"
        >
          Browse Files
        </button>
      </div>

      {isScanning && (
        <div className="glass-card p-4 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-cyan-400 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Running Multi-Layer Forensics & OCR...
            </span>
            <span className="text-white font-mono font-semibold">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300 progress-glow rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {scanError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Scan Analysis Failed</p>
            <p className="text-xs text-red-400/80 mt-1">{scanError}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default DropZone
