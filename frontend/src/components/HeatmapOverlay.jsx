import React, { useRef, useEffect, useState } from 'react'

const HeatmapOverlay = ({ imageSrc, elaMapBase64, suspiciousRegions }) => {
  const containerRef = useRef(null)
  const imageRef = useRef(null)
  const canvasRef = useRef(null)
  const [scale, setScale] = useState({ x: 1, y: 1 })
  const [showHeatmap, setShowHeatmap] = useState(true)

  const handleResize = () => {
    if (imageRef.current && canvasRef.current) {
      const img = imageRef.current
      const canvas = canvasRef.current
      canvas.width = img.clientWidth
      canvas.height = img.clientHeight

      // Calculate scale difference between original image dimensions and rendered client dimensions
      const originalWidth = img.naturalWidth || img.clientWidth
      const originalHeight = img.naturalHeight || img.clientHeight

      setScale({
        x: img.clientWidth / originalWidth,
        y: img.clientHeight / originalHeight,
      })
    }
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      handleResize()
    }
  }, [imageSrc])

  useEffect(() => {
    if (canvasRef.current && scale.x && scale.y) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw suspicious region boundaries on the overlay canvas
      if (suspiciousRegions && suspiciousRegions.length > 0) {
        suspiciousRegions.forEach((reg) => {
          const rx = reg.x * scale.x
          const ry = reg.y * scale.y
          const rw = reg.w * scale.x
          const rh = reg.h * scale.y

          // Animated pulsing bounding box
          ctx.strokeStyle = '#ef4444'
          ctx.lineWidth = 2.5
          ctx.setLineDash([6, 4])
          ctx.strokeRect(rx, ry, rw, rh)

          // Background overlay
          ctx.fillStyle = 'rgba(239, 68, 68, 0.12)'
          ctx.fillRect(rx, ry, rw, rh)

          // Tag label
          ctx.fillStyle = '#ef4444'
          ctx.font = 'bold 9px monospace'
          ctx.fillText(`CONF: ${(reg.confidence * 100).toFixed(0)}%`, rx + 3, ry + 12)
        })
      }
    }
  }, [suspiciousRegions, scale, showHeatmap])

  return (
    <div className="glass-card p-5 flex flex-col gap-4 relative overflow-hidden">
      <div className="flex justify-between items-center">
        <h3 className="label-text">Visual Heatmap & Anomalies</h3>
        <div className="flex gap-2">
          {elaMapBase64 && (
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                showHeatmap 
                  ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' 
                  : 'bg-white/5 border border-white/10 text-slate-400'
              }`}
            >
              Heatmap: {showHeatmap ? 'ON' : 'OFF'}
            </button>
          )}
        </div>
      </div>

      <div ref={containerRef} className="relative w-full max-h-[350px] overflow-hidden rounded-xl bg-navy-950 flex items-center justify-center border border-white/10">
        {/* Rendered Upload Image */}
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Analysis target"
          onLoad={handleResize}
          className="max-w-full max-h-[350px] object-contain transition-opacity duration-300"
        />

        {/* Base64 ELA Heatmap Overlay */}
        {elaMapBase64 && showHeatmap && (
          <img
            src={`data:image/png;base64,${elaMapBase64}`}
            alt="ELA Map"
            className="absolute top-0 left-0 w-full h-full object-contain mix-blend-screen opacity-70 pointer-events-none"
            style={{
              width: imageRef.current?.clientWidth,
              height: imageRef.current?.clientHeight,
            }}
          />
        )}

        {/* SVG/Canvas Overlay for keypoints and annotations */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: imageRef.current?.clientWidth,
            height: imageRef.current?.clientHeight,
          }}
        />
      </div>
    </div>
  )
}

export default HeatmapOverlay
