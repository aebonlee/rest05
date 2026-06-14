import { useState } from 'react'
import { useThread } from './hooks/useThread'
import Chatbot from './components/Chatbot'
import { FILTERS, TALENTS, FIELDS, STEPS, STATS } from './data/talents'

const BRAND = '드림아이티비즈'

export default function App() {
  const { wrapRef, svgRef, pathRef, dotRef, spoolRef, registerTitle } = useThread()
  const [filter, setFilter] = useState('전체')

  const visible = filter === '전체' ? TALENTS : TALENTS.filter((t) => t.field === filter)

  return (
    <div ref={wrapRef} style={{ background: 'var(--cream)', position: 'relative', overflowX: 'hidden' }}>
      {/* ── 스크롤 연결 실선 ── */}
      <svg
        ref={svgRef}
        viewBox="0 0 1280 0"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="thGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FF8A6B" />
            <stop offset="0.5" stopColor="#E8623D" />
            <stop offset="1" stopColor="#EF7A57" />
          </linearGradient>
          <filter id="dotGlow" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <path
          ref={pathRef}
          d=""
          fill="none"
          stroke="url(#thGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeDasharray: 6000, strokeDashoffset: 6000, filter: 'drop-shadow(0 2px 6px rgba(232,98,61,0.30))' }}
        />
        <g ref={dotRef} style={{ opacity: 0 }}>
          <circle r="12" fill="#FF8A6B" opacity="0.35" filter="url(#dotGlow)" />
          <circle r="6.5" fill="#E8623D" style={{ animation: 'dotPulse 1.8s ease-in-out infinite', transformBox: 'fill-box', transformOrigin: 'center' }} />
          <circle r="2.6" fill="#fff" />
        </g>
      </svg>

      {/* ── NAV ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line)' }}>
        <nav style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px', height: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--navy)', whiteSpace: 'nowrap' }}>{BRAND}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--orange)', letterSpacing: '0.02em' }}>인재풀</span>
            </div>
            <div className="nav-links" style={{ display: 'flex', gap: 34, fontSize: 16, fontWeight: 600, color: 'var(--slate)', whiteSpace: 'nowrap' }}>
              <NavLink href="#talents">인재 둘러보기</NavLink>
              <NavLink href="#fields">직무 분야</NavLink>
              <NavLink href="#process">채용 제의 절차</NavLink>
            </div>
          </div>
          <a href="#talents" style={ctaPill('#0F2540')} onMouseEnter={hoverBg('#E8623D')} onMouseLeave={hoverBg('#0F2540')}>
            인재 둘러보기 <span>→</span>
          </a>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', zIndex: 2, color: 'var(--navy)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -240, right: -180, width: 680, height: 680, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,98,61,0.12), transparent 64%)', zIndex: 0 }} />
        <img
          ref={spoolRef}
          src="/assets/spool.png"
          alt="실타래"
          className="hero-spool"
          style={{ position: 'absolute', right: '9%', top: 96, width: 230, height: 'auto', zIndex: 2, animation: 'spoolBob 6s ease-in-out infinite', filter: 'drop-shadow(0 26px 44px rgba(15,37,64,0.20))' }}
        />
        <div style={{ position: 'relative', zIndex: 3, maxWidth: 1280, margin: '0 auto', padding: '132px 40px 142px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--coral-bg)', border: '1px solid var(--coral-border)', padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 700, color: 'var(--coral-text)', marginBottom: 30, animation: 'floatUp .6s ease both' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--orange)' }} />
            기업이 먼저 찾아오는 역(逆)채용 플랫폼
          </div>
          <h1 className="hero-h1" style={{ fontSize: 72, lineHeight: 1.08, fontWeight: 800, letterSpacing: '-0.04em', maxWidth: 820, animation: 'floatUp .7s ease .05s both' }}>
            당신의 실력을,<br /><span style={{ color: 'var(--orange)' }}>기업이 먼저</span> 알아봅니다
          </h1>
          <p style={{ fontSize: 21, lineHeight: 1.6, color: 'var(--muted)', maxWidth: 540, marginTop: 28, fontWeight: 400, animation: 'floatUp .7s ease .12s both' }}>
            드림아이티비즈가 키운 인재를 한곳에. 지원서를 쓰는 대신, 당신의 강점을 펼쳐두면 기업이 먼저 채용을 제안합니다.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 44, flexWrap: 'wrap', animation: 'floatUp .7s ease .2s both' }}>
            <a href="#talents" style={ctaPill('#E8623D', 17)} onMouseEnter={hoverY} onMouseLeave={hoverYReset}>인재 둘러보기 <span>→</span></a>
            <a href="#process" style={{ ...ctaPillGhost, fontSize: 17 }} onMouseEnter={hoverBg('#F6F7F9', true)} onMouseLeave={hoverBg('#fff', true)}>취업준비생이에요</a>
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 3, borderTop: '1px solid var(--line)', background: 'rgba(255,255,255,0.6)' }}>
          <div className="grid-4" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ padding: '34px 8px', borderRight: i < STATS.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--navy)' }}>{s.num}</div>
                <div style={{ fontSize: 15, color: 'var(--faint)', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 인재 쇼케이스 ── */}
      <section id="talents" style={{ position: 'relative', zIndex: 2, padding: '116px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 48 }}>
            <div ref={registerTitle} className="reveal" style={{ paddingLeft: 4 }}>
              <Eyebrow>TALENT POOL</Eyebrow>
              <H2>주목할 인재</H2>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {FILTERS.map((f) => {
                const active = filter === f
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      cursor: 'pointer', fontSize: 15, fontWeight: 700, padding: '10px 18px', borderRadius: 999,
                      border: `1px solid ${active ? '#0F2540' : '#DCE1E6'}`, background: active ? '#0F2540' : '#fff',
                      color: active ? '#fff' : '#5C6B7A', transition: 'all .15s',
                    }}
                  >
                    {f}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
            {visible.map((t, i) => (
              <TalentCard key={i} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 직무 분야 ── */}
      <section id="fields" style={{ position: 'relative', zIndex: 2, padding: '116px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>
          <div ref={registerTitle} className="reveal" style={{ marginBottom: 56 }}>
            <Eyebrow>JOB FIELDS</Eyebrow>
            <H2>이런 분야의 인재가 있습니다</H2>
            <p style={{ fontSize: 18, color: 'var(--muted)', marginTop: 16 }}>드림아이티비즈가 키운 다양한 직무의 인재를 만나보세요.</p>
          </div>
          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {FIELDS.map((f, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #EFE7E2', borderRadius: 18, padding: '34px 30px' }}>
                <div style={{ width: 54, height: 54, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: 'var(--orange)', marginBottom: 22, boxShadow: '0 4px 12px rgba(15,37,64,0.06)' }}>{f.icon}</div>
                <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em' }}>{f.name}</h3>
                <p style={{ fontSize: 15, color: 'var(--muted)', marginTop: 12, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 채용 제의 절차 ── */}
      <section id="process" style={{ position: 'relative', zIndex: 2, padding: '70px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ background: 'var(--navy)', color: '#fff', borderRadius: 28, padding: '72px 64px' }}>
            <div ref={registerTitle} className="reveal" style={{ marginBottom: 56 }}>
              <Eyebrow color="#FF8A6B">HOW IT WORKS</Eyebrow>
              <H2>기업이 인재를 만나는 법</H2>
            </div>
            <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
              {STEPS.map((s, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18, padding: '32px 28px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#FF8A6B' }}>STEP {s.no}</div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, marginTop: 12, letterSpacing: '-0.02em' }}>{s.title}</h3>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.66)', marginTop: 12, lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position: 'relative', zIndex: 2, padding: '116px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ background: 'var(--coral-bg)', borderRadius: 28, padding: '72px 64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 28 }}>
            <div ref={registerTitle} className="reveal">
              <h2 className="sec-h2" style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.15 }}>취업준비생이라면,<br />지금 AI 코치와 시작하세요</h2>
              <p style={{ fontSize: 18, color: 'var(--muted)', marginTop: 16 }}>이력서 첨삭부터 자기소개서·면접 준비까지. 우측 하단 챗봇이 도와드립니다.</p>
            </div>
            <a href="#talents" style={ctaPill('#E8623D', 18)} onMouseEnter={hoverY} onMouseLeave={hoverYReset}>인재풀 보기 <span>→</span></a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ position: 'relative', zIndex: 2, background: 'var(--navy)', color: 'rgba(255,255,255,0.7)', padding: '64px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 21, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>{BRAND} <span style={{ color: '#FF8A6B', fontSize: 13, fontWeight: 600 }}>인재풀</span></div>
            <p style={{ fontSize: 14, marginTop: 14, lineHeight: 1.7 }}>드림아이티비즈 인재홍보 플랫폼 · contact@dreamitbiz.com<br />취업준비생의 실력을 기업에 잇는 역채용 쇼케이스입니다.</p>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>© 2026 DreamIT Biz. All rights reserved.</div>
        </div>
      </footer>

      {/* ── 취업 코칭 챗봇 ── */}
      <Chatbot />
    </div>
  )
}

/* ── 작은 컴포넌트/스타일 헬퍼 ── */
function NavLink({ href, children }) {
  return (
    <a href={href} style={{ textDecoration: 'none', transition: 'color .15s' }}
      onMouseEnter={(e) => (e.currentTarget.style.color = '#0F2540')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}>
      {children}
    </a>
  )
}

function Eyebrow({ children, color = '#E8623D' }) {
  return <div style={{ fontSize: 15, fontWeight: 700, color, letterSpacing: '0.04em', marginBottom: 14 }}>{children}</div>
}

function H2({ children }) {
  return <h2 className="sec-h2" style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.1 }}>{children}</h2>
}

function TalentCard({ t }) {
  const offered = t.status === '채용제의 수신중'
  return (
    <div
      style={{ display: 'block', background: '#fff', border: '1px solid #EAEDF0', borderRadius: 18, padding: '30px 32px', transition: 'transform .18s, box-shadow .18s' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 18px 40px rgba(15,37,64,0.1)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 13, fontWeight: 700, color: '#E8623D', background: '#FDEBE4', padding: '6px 12px', borderRadius: 999 }}>{t.field}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: offered ? '#1F9D6B' : '#8A96A3' }}>● {t.status}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <h3 style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-0.02em' }}>{t.name}</h3>
        <span style={{ fontSize: 14, color: '#8A96A3', fontWeight: 600 }}>{t.field} 인재</span>
      </div>
      <p style={{ fontSize: 16, color: '#3C4A5A', marginTop: 8, fontWeight: 600, lineHeight: 1.4 }}>{t.headline}</p>
      <p style={{ fontSize: 15, color: 'var(--muted)', marginTop: 10, lineHeight: 1.6 }}>{t.blurb}</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 22, flexWrap: 'wrap' }}>
        {t.skills.map((s) => (
          <span key={s} style={{ fontSize: 13, fontWeight: 600, color: '#5C6B7A', background: '#F2F4F6', padding: '5px 12px', borderRadius: 8 }}>{s}</span>
        ))}
      </div>
    </div>
  )
}

function ctaPill(bg, fontSize = 15) {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 9, background: bg, color: '#fff',
    fontSize, fontWeight: 700, padding: fontSize >= 17 ? '16px 32px' : '11px 22px',
    borderRadius: 999, textDecoration: 'none', transition: 'transform .15s, background .15s', whiteSpace: 'nowrap',
  }
}
const ctaPillGhost = {
  display: 'inline-flex', alignItems: 'center', gap: 9, background: '#fff', border: '1px solid #DCE1E6',
  color: '#0F2540', fontWeight: 700, padding: '16px 32px', borderRadius: 999, textDecoration: 'none', transition: 'background .15s',
}
const hoverBg = (color, ghost) => (e) => { e.currentTarget.style.background = color }
const hoverY = (e) => { e.currentTarget.style.transform = 'translateY(-2px)' }
const hoverYReset = (e) => { e.currentTarget.style.transform = 'translateY(0)' }
