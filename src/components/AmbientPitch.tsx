import { useEffect, useRef } from 'react'

/**
 * Full-page World Cup poster background with soft overlays so
 * dashboard content stays readable. Subtle pointer-linked light.
 */
export function AmbientPitch() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    let raf = 0
    let targetX = 0.55
    let targetY = 0.35
    let curX = 0.55
    let curY = 0.35

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX / window.innerWidth
      targetY = e.clientY / window.innerHeight
    }

    const tick = () => {
      curX += (targetX - curX) * 0.05
      curY += (targetY - curY) * 0.05
      el.style.setProperty('--mx', curX.toFixed(4))
      el.style.setProperty('--my', curY.toFixed(4))
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="ambient" ref={rootRef} aria-hidden>
      <img
        className="ambient-photo"
        src="/images/wc-hero-poster.png"
        alt=""
        width={768}
        height={1024}
        decoding="async"
      />
      <div className="ambient-tint" />
      <div className="ambient-light" />
      <div className="ambient-vignette" />
    </div>
  )
}
