import { useEffect, useMemo, useState } from 'react'
import { useThread } from './hooks/useThread'
import Chatbot from './components/Chatbot'
import AuthButton from './components/AuthButton'
import ProfileForm from './components/ProfileForm'
import OfferModal from './components/OfferModal'
import { fetchPublicTalents } from './lib/talentsRepo'
import { FILTERS, TALENTS, FIELDS, STEPS, STATS, DIMENSIONS, totalScore } from './data/talents'

const BRAND = '드림아이티비즈'

// 메인 노출은 매 방문마다 랜덤(피셔-예이츠). 인원수가 적을 땐 전체, 많아지면 셔플 효과.
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function App() {
  const { wrapRef, svgRef, pathRef, dotRef, spoolRef, registerTitle } = useThread()
  const [filter, setFilter] = useState('전체')
  const [query, setQuery] = useState('')
  const [minScore, setMinScore] = useState(0)
  const [profileOpen, setProfileOpen] = useState(false)
  const [offerTarget, setOfferTarget] = useState(null)
  const [remote, setRemote] = useState(null) // rest05_profiles 로드 결과
  const [loaded, setLoaded] = useState(false)

  // 공개·인증 인재 실시간 로드 (없거나 실패 시 샘플로 폴백)
  useEffect(() => {
    let alive = true
    fetchPublicTalents()
      .then((rows) => { if (alive) setRemote(rows && rows.length ? rows : null) })
      .catch(() => {})
      .finally(() => { if (alive) setLoaded(true) })
    return () => { alive = false }
  }, [])

  const pool = remote || TALENTS
  const usingSample = !remote

  // 풀이 정해지면 랜덤 정렬
  const shuffled = useMemo(() => shuffle(pool), [pool])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return shuffled.filter((t) => {
      if (filter !== '전체' && t.field !== filter) return false
      if (totalScore(t.scores) < minScore) return false
      if (q) {
        const hay = `${t.name} ${t.field} ${t.headline} ${t.blurb} ${t.skills.join(' ')}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [shuffled, filter, query, minScore])

  // 기업 인재추천 챗봇에 넘길 공개 인재 요약
  const talentSummaries = useMemo(
    () => pool.map((t) => ({ name: t.name, field: t.field, skills: t.skills, score: totalScore(t.scores), headline: t.headline, status: t.status })),
    [pool]
  )

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setProfileOpen(true)} style={ctaPill('#E8623D')} onMouseEnter={hoverBg('#0F2540')} onMouseLeave={hoverBg('#E8623D')}>
              인재 등록
            </button>
            <AuthButton />
          </div>
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
            드림아이티비즈가 검증한 인증 인재 · 역(逆)채용 플랫폼
          </div>
          <h1 className="hero-h1" style={{ fontSize: 72, lineHeight: 1.08, fontWeight: 800, letterSpacing: '-0.04em', maxWidth: 820, animation: 'floatUp .7s ease .05s both' }}>
            검증된 실력을,<br /><span style={{ color: 'var(--orange)' }}>기업이 먼저</span> 알아봅니다
          </h1>
          <p style={{ fontSize: 21, lineHeight: 1.6, color: 'var(--muted)', maxWidth: 560, marginTop: 28, fontWeight: 400, animation: 'floatUp .7s ease .12s both' }}>
            학력·자격·경력·포트폴리오·역량평가까지 검증해 <b style={{ color: 'var(--ink)' }}>인증 점수</b>로 증명합니다. 지원서 대신 검증된 실력을 펼쳐두면, 기업이 먼저 채용을 제안합니다.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 44, flexWrap: 'wrap', animation: 'floatUp .7s ease .2s both' }}>
            <a href="#talents" style={ctaPill('#E8623D', 17)} onMouseEnter={hoverY} onMouseLeave={hoverYReset}>인재 둘러보기 <span>→</span></a>
            <button onClick={() => setProfileOpen(true)} style={{ ...ctaPillGhost, fontSize: 17, cursor: 'pointer', fontFamily: 'inherit' }} onMouseEnter={hoverBg('#F6F7F9')} onMouseLeave={hoverBg('#fff')}>취업준비생이에요 · 인재 등록</button>
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
              <Eyebrow>VERIFIED TALENT POOL</Eyebrow>
              <H2>드림아이티비즈 인증 인재</H2>
              <p style={{ fontSize: 16, color: 'var(--muted)', marginTop: 14, maxWidth: 560, lineHeight: 1.6 }}>
                학력·자격·경력·포트폴리오·역량평가 <b style={{ color: 'var(--ink)' }}>5개 축을 검증</b>해 인증 점수로 환산합니다. 기업은 검색·필터로 원하는 인재를 빠르게 찾고 바로 채용 제의할 수 있습니다.
              </p>
            </div>
          </div>

          {/* 기업용 검색/필터 바 */}
          <div style={{ background: '#fff', border: '1px solid #EAEDF0', borderRadius: 16, padding: '16px 18px', marginBottom: 28, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="🔍 직무·기술·키워드로 인재 검색 (예: React, 데이터)"
              style={{ flex: '1 1 280px', minWidth: 220, border: '1px solid #DCE1E6', borderRadius: 10, padding: '11px 14px', fontSize: 15, outline: 'none', fontFamily: 'inherit' }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#5C6B7A' }}>
              최소 점수 <b style={{ color: '#E8623D' }}>{minScore}</b>
              <input type="range" min="0" max="100" step="5" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} style={{ accentColor: '#E8623D' }} />
            </label>
          </div>

          {/* 직무 필터 칩 */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
            {FILTERS.map((f) => {
              const active = filter === f
              return (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ cursor: 'pointer', fontSize: 14.5, fontWeight: 700, padding: '9px 16px', borderRadius: 999, border: `1px solid ${active ? '#0F2540' : '#DCE1E6'}`, background: active ? '#0F2540' : '#fff', color: active ? '#fff' : '#5C6B7A', transition: 'all .15s', fontFamily: 'inherit' }}>
                  {f}
                </button>
              )
            })}
          </div>

          {visible.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#8A96A3', fontSize: 16 }}>조건에 맞는 인재가 없습니다. 검색어나 필터를 조정해 보세요.</div>
          ) : (
            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
              {visible.map((t, i) => (
                <TalentCard key={i} t={t} onOffer={() => setOfferTarget(t)} />
              ))}
            </div>
          )}
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

      {/* ── 챗봇(취준생 코치 + 기업 인재추천) ── */}
      <Chatbot talents={talentSummaries} />

      {/* ── 모달 ── */}
      <ProfileForm open={profileOpen} onClose={() => setProfileOpen(false)} />
      <OfferModal talent={offerTarget} onClose={() => setOfferTarget(null)} />
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

function TalentCard({ t, onOffer }) {
  const offered = t.status === '채용제의 수신중'
  const total = totalScore(t.scores)
  return (
    <div
      style={{ display: 'block', background: '#fff', border: '1px solid #EAEDF0', borderRadius: 18, padding: '30px 32px', transition: 'transform .18s, box-shadow .18s' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 18px 40px rgba(15,37,64,0.1)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 13, fontWeight: 700, color: '#E8623D', background: '#FDEBE4', padding: '6px 12px', borderRadius: 999 }}>{t.field}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: offered ? '#1F9D6B' : '#8A96A3' }}>● {t.status}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
            <h3 style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-0.02em' }}>{t.name}</h3>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: '#1F9D6B', background: '#E7F6EF', padding: '3px 9px', borderRadius: 999 }}>✓ 인증</span>
          </div>
          <p style={{ fontSize: 16, color: '#3C4A5A', marginTop: 8, fontWeight: 600, lineHeight: 1.4 }}>{t.headline}</p>
        </div>
        <ScoreBadge total={total} />
      </div>

      <p style={{ fontSize: 15, color: 'var(--muted)', marginTop: 12, lineHeight: 1.6 }}>{t.blurb}</p>

      {/* 5개 축 검증 점수 */}
      <div style={{ marginTop: 18, padding: '16px 16px 12px', background: '#FBFAF8', borderRadius: 14, border: '1px solid #F0EEEA' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#8A96A3', marginBottom: 12, letterSpacing: '0.02em' }}>실력 증빙 · 5개 축 검증</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {DIMENSIONS.map((d) => (
            <ScoreBar key={d.key} label={d.label} value={t.scores[d.key]} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
        {t.skills.map((s) => (
          <span key={s} style={{ fontSize: 13, fontWeight: 600, color: '#5C6B7A', background: '#F2F4F6', padding: '5px 12px', borderRadius: 8 }}>{s}</span>
        ))}
      </div>

      {/* 링크 + 채용 제의 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 14 }}>
          {t.website && <a href={t.website} target="_blank" rel="noreferrer" style={linkStyle}>🔗 자기소개 웹</a>}
          {t.portfolio && <a href={t.portfolio} target="_blank" rel="noreferrer" style={linkStyle}>📁 포트폴리오</a>}
        </div>
        <button onClick={onOffer} style={{ cursor: 'pointer', fontSize: 14, fontWeight: 700, padding: '9px 18px', borderRadius: 999, border: 'none', background: '#E8623D', color: '#fff', fontFamily: 'inherit' }}>채용 제의 →</button>
      </div>
    </div>
  )
}

const linkStyle = { fontSize: 13.5, fontWeight: 700, color: '#0F2540', textDecoration: 'none', borderBottom: '1.5px solid #FDEBE4' }

function ScoreBadge({ total }) {
  return (
    <div style={{ flexShrink: 0, textAlign: 'center', background: '#0F2540', color: '#fff', borderRadius: 14, padding: '10px 14px', minWidth: 78 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#FF8A6B', letterSpacing: '0.06em' }}>인증 점수</div>
      <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.1, marginTop: 2 }}>{total}</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>/ 100</div>
    </div>
  )
}

function ScoreBar({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ height: 46, width: 8, margin: '0 auto', background: '#ECEAE6', borderRadius: 999, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${value}%`, background: 'linear-gradient(180deg, #FF8A6B, #E8623D)', borderRadius: 999 }} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 800, color: '#0F2540', marginTop: 7 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: '#8A96A3', marginTop: 1, lineHeight: 1.2 }}>{label}</div>
    </div>
  )
}

function ctaPill(bg, fontSize = 15) {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 9, background: bg, color: '#fff',
    fontSize, fontWeight: 700, padding: fontSize >= 17 ? '16px 32px' : '11px 22px',
    borderRadius: 999, textDecoration: 'none', transition: 'transform .15s, background .15s', whiteSpace: 'nowrap',
    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
  }
}
const ctaPillGhost = {
  display: 'inline-flex', alignItems: 'center', gap: 9, background: '#fff', border: '1px solid #DCE1E6',
  color: '#0F2540', fontWeight: 700, padding: '16px 32px', borderRadius: 999, textDecoration: 'none', transition: 'background .15s',
}
const hoverBg = (color, ghost) => (e) => { e.currentTarget.style.background = color }
const hoverY = (e) => { e.currentTarget.style.transform = 'translateY(-2px)' }
const hoverYReset = (e) => { e.currentTarget.style.transform = 'translateY(0)' }
