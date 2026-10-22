import { useMemo } from 'react'
import { encode } from 'uqr'

// One path for all dark modules keeps the SVG small and crisp at any size
export default function QR({ value, label }: { value: string; label: string }) {
  const { size, d } = useMemo(() => {
    const { data, size } = encode(value, { ecc: 'M', border: 2 })
    let d = ''
    data.forEach((row, y) => row.forEach((on, x) => { if (on) d += `M${x} ${y}h1v1h-1z` }))
    return { size, d }
  }, [value])

  return (
    <svg className="qr" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width={size} height={size} fill="#fff" />
      <path d={d} fill="#141414" />
    </svg>
  )
}
