import { useEffect, useRef } from 'react'

/**
 * 실타래(spool)에서 시작해 각 섹션 타이틀을 잇는 스크롤-드로잉 연결선.
 * 원본 DCLogic(Recruit.dc.html) 로직을 React 훅으로 포팅.
 *
 * 반환된 ref들을 다음에 연결한다:
 *   wrapRef  → 전체 래퍼 div
 *   svgRef   → 절대배치 SVG
 *   pathRef  → 실선 <path>
 *   dotRef   → 움직이는 점 <g>
 *   spoolRef → 실타래 <img>
 *   registerTitle(el) → 실선이 닿으면 .is-drawn 되는 타이틀 등록
 */
export function useThread() {
  const wrapRef = useRef(null)
  const svgRef = useRef(null)
  const pathRef = useRef(null)
  const dotRef = useRef(null)
  const spoolRef = useRef(null)
  const titleEls = useRef([])

  const registerTitle = (el) => {
    if (el && !titleEls.current.includes(el)) titleEls.current.push(el)
  }

  useEffect(() => {
    const wrap = wrapRef.current
    const svg = svgRef.current
    const path = pathRef.current
    const dot = dotRef.current
    if (!wrap || !svg || !path) return

    let total = 0
    let samples = []
    let anchorPts = []
    let anchorLens = []
    let lastD = ''
    let raf = null
    let poll = null
    let lastKey = null

    const buildPath = (pts) => {
      if (pts.length < 2) return ''
      let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i]
        const p1 = pts[i]
        const p2 = pts[i + 1]
        const p3 = pts[i + 2] || pts[i + 1]
        const c1x = p1[0] + (p2[0] - p0[0]) / 6
        const c1y = p1[1] + (p2[1] - p0[1]) / 6
        const c2x = p2[0] - (p3[0] - p1[0]) / 6
        const c2y = p2[1] - (p3[1] - p1[1]) / 6
        d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
      }
      return d
    }

    const measure = () => {
      const W = wrap.clientWidth
      const H = wrap.scrollHeight
      const wr = wrap.getBoundingClientRect()
      const titles = titleEls.current.filter((el) => el && el.isConnected)
      titles.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)

      const contentLeft = Math.max(40, (W - 1280) / 2 + 40)
      const leftX = contentLeft - 14
      const bowOut = contentLeft + Math.min(300, W * 0.2)
      const bowIn = contentLeft + 70

      const anchors = titles.map((el) => {
        const r = el.getBoundingClientRect()
        return [leftX, (r.top - wr.top) + 16]
      })

      let start = [W * 0.74, 300]
      if (spoolRef.current) {
        const sr = spoolRef.current.getBoundingClientRect()
        start = [sr.left - wr.left + sr.width * 0.5, sr.bottom - wr.top - 14]
      }

      const pts = [start]
      for (let i = 0; i < anchors.length; i++) {
        const prev = pts[pts.length - 1]
        const by = (prev[1] + anchors[i][1]) / 2
        pts.push([(i % 2 === 0) ? bowOut : bowIn, by])
        pts.push(anchors[i])
      }
      pts.push([W * 0.5, H - 64])

      anchorPts = anchors
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
      path.setAttribute('d', buildPath(pts))
    }

    const buildSamples = () => {
      try {
        const t = path.getTotalLength()
        if (!t) return false
        total = t
        path.style.strokeDasharray = String(total)
        const N = 520
        samples = []
        for (let i = 0; i <= N; i++) {
          const len = (total * i) / N
          const pt = path.getPointAtLength(len)
          samples.push({ len, x: pt.x, y: pt.y })
        }
        anchorLens = anchorPts.map(([, ay]) => {
          let best = 0, bd = 1e9
          for (const s of samples) {
            const dd = Math.abs(s.y - ay)
            if (dd < bd) { bd = dd; best = s.len }
          }
          return best
        })
        return true
      } catch (e) { return false }
    }

    const viewportTargetY = () => {
      const wrapTop = wrap.getBoundingClientRect().top
      const vh = window.innerHeight || document.documentElement.clientHeight
      return vh * 0.55 - wrapTop
    }

    const titleNodes = () => titleEls.current.filter((el) => el && el.isConnected)

    const updateOffset = () => {
      if (!total || !samples.length) return
      const targetY = viewportTargetY()
      let drawn = 60
      for (const s of samples) { if (s.y <= targetY) drawn = s.len; else break }
      drawn = Math.max(56, Math.min(total, drawn))
      path.style.strokeDashoffset = String(total - drawn)
      if (dot) {
        const p = path.getPointAtLength(drawn)
        dot.setAttribute('transform', `translate(${p.x.toFixed(1)},${p.y.toFixed(1)})`)
        dot.style.opacity = drawn > 64 ? '1' : '0'
      }
      const titles = titleNodes()
      titles.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
      titles.forEach((el, i) => {
        if (anchorLens[i] != null && drawn >= anchorLens[i] - 6) el.classList.add('is-drawn')
      })
    }

    const ensureSamples = (tries = 0) => {
      const d = path.getAttribute('d')
      if (d && d.length > 5 && d !== lastD) {
        if (buildSamples()) { lastD = d; updateOffset(); return }
      } else if (samples.length) { updateOffset(); return }
      if (tries < 60) setTimeout(() => ensureSamples(tries + 1), 60)
    }

    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => { raf = null; updateOffset() })
    }
    const onResize = () => { measure(); lastD = ''; ensureSamples() }

    // init
    measure()
    ensureSamples()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    window.addEventListener('load', onResize)
    poll = setInterval(() => {
      if (!samples.length) return
      const key = Math.round(viewportTargetY())
      if (key !== lastKey) { lastKey = key; updateOffset() }
    }, 80)
    let ro
    if (window.ResizeObserver) { ro = new ResizeObserver(onResize); ro.observe(wrap) }
    ;[350, 900, 1600].forEach((t) => setTimeout(onResize, t))

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('load', onResize)
      if (ro) ro.disconnect()
      if (poll) clearInterval(poll)
    }
  }, [])

  return { wrapRef, svgRef, pathRef, dotRef, spoolRef, registerTitle }
}
