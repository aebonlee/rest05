import { useEffect, useState } from 'react'
import { getUser, signInWithGoogle, signInWithKakao } from '../lib/auth'
import { getMyProfile } from '../lib/profile'
import { fetchMyOffers } from '../lib/offers'
import { isSupabaseReady } from '../lib/supabase'
import { DIMENSIONS } from '../data/talents'

export default function MyPage({ onBack, onEdit, version }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    getUser().then(async (u) => {
      if (!alive) return
      setUser(u)
      if (!u) { setLoading(false); return }
      try {
        const [p, o] = await Promise.all([getMyProfile(u.id), fetchMyOffers(u.id)])
        if (alive) { setProfile(p); setOffers(o) }
      } finally { if (alive) setLoading(false) }
    })
    return () => { alive = false }
  }, [version])

  const name = profile?.name || user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '회원'
  const reviewed = profile?.review_status === '인증완료'

  return (
    <div style={wrap}>
      {/* 상단 바 */}
      <header style={topbar}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 28px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={backBtn}>← 홈으로</button>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#0F2540' }}>마이페이지</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#E8623D' }}>드림아이티비즈 인재풀</span>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 28px 80px' }}>
        {loading ? (
          <p style={{ color: '#8A96A3', padding: '40px 0' }}>불러오는 중…</p>
        ) : !user ? (
          <Center>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔒</div>
            <p style={{ fontSize: 15, color: '#3C4A5A', lineHeight: 1.6 }}>로그인 후 이용할 수 있어요.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 280, margin: '18px auto 0' }}>
              <button onClick={() => signInWithGoogle()} style={googleBtn} disabled={!isSupabaseReady}>Google로 계속하기</button>
              <button onClick={() => signInWithKakao()} style={kakaoBtn} disabled={!isSupabaseReady}>카카오로 계속하기</button>
            </div>
          </Center>
        ) : !profile ? (
          <Center>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📝</div>
            <h3 style={{ fontSize: 20, fontWeight: 800 }}>아직 등록된 프로필이 없어요</h3>
            <p style={{ fontSize: 14.5, color: '#5C6B7A', marginTop: 10, lineHeight: 1.6 }}>프로필을 등록하면 인증 평가 후 인재풀에 공개돼<br />기업이 먼저 채용을 제안합니다.</p>
            <button onClick={onEdit} style={{ ...primaryBtn, marginTop: 20 }}>인재 프로필 등록하기</button>
          </Center>
        ) : (
          <>
            {/* 프로필 헤더 카드 */}
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>{name}</h2>
                    {profile.field && <span style={fieldChip}>{profile.field}</span>}
                    <span style={{ ...statusChip, background: reviewed ? '#E7F6EF' : '#FDEBE4', color: reviewed ? '#1F9D6B' : '#C2451F' }}>● {profile.review_status || '검토대기'}</span>
                    {profile.is_public && <span style={{ ...statusChip, background: '#EAF1FB', color: '#2C6BD6' }}>공개중</span>}
                  </div>
                  {profile.headline && <p style={{ fontSize: 16, color: '#3C4A5A', fontWeight: 600, marginTop: 10 }}>{profile.headline}</p>}
                  {profile.blurb && <p style={{ fontSize: 14.5, color: '#5C6B7A', marginTop: 8, lineHeight: 1.6 }}>{profile.blurb}</p>}
                </div>
                <div style={scoreBox}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#FF8A6B' }}>종합 인증 점수</div>
                  <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1 }}>{profile.score_total ?? 0}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>/ 100</div>
                </div>
              </div>

              {/* 5축 점수 */}
              <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                {DIMENSIONS.map((d) => (
                  <div key={d.key} style={{ background: '#FBFAF8', border: '1px solid #F0EEEA', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#0F2540' }}>{profile[`score_${d.key === 'cert' ? 'cert' : d.key}`] ?? 0}</div>
                    <div style={{ fontSize: 11.5, color: '#8A96A3', marginTop: 2 }}>{d.label}</div>
                  </div>
                ))}
              </div>

              {/* 링크/태그 */}
              <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
                {(profile.skills || []).map((s) => <span key={s} style={skillTag}>{s}</span>)}
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
                {profile.website_url && <a href={profile.website_url} target="_blank" rel="noreferrer" style={link}>🔗 자기소개 웹</a>}
                {profile.portfolio_url && <a href={profile.portfolio_url} target="_blank" rel="noreferrer" style={link}>📁 포트폴리오</a>}
                {profile.documents?.length > 0 && <span style={{ fontSize: 13.5, color: '#8A96A3', fontWeight: 600 }}>📄 증빙서류 {profile.documents.length}건</span>}
                {profile.is_neet && <span style={{ fontSize: 13, fontWeight: 700, color: '#C2451F' }}>쉬었음 청년 지원대상</span>}
              </div>

              <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
                <button onClick={onEdit} style={primaryBtn}>프로필 수정</button>
              </div>

              {!reviewed && (
                <p style={notice}>제출이 완료되었습니다. 드림아이티비즈가 증빙을 검토해 인증 점수를 확정하면 인재풀에 공개됩니다.</p>
              )}
            </div>

            {/* 받은 채용 제의 */}
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '32px 0 14px', letterSpacing: '-0.02em' }}>받은 채용 제의 <span style={{ color: '#E8623D' }}>{offers.length}</span></h3>
            {offers.length === 0 ? (
              <div style={{ ...card, color: '#8A96A3', fontSize: 14.5 }}>아직 받은 채용 제의가 없습니다. 프로필을 공개하면 기업이 먼저 제안할 수 있어요.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {offers.map((o) => (
                  <div key={o.id} style={card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 17, fontWeight: 800 }}>{o.company}</div>
                      <div style={{ fontSize: 12.5, color: '#8A96A3' }}>{(o.created_at || '').slice(0, 10)}</div>
                    </div>
                    {o.message && <p style={{ fontSize: 14.5, color: '#5C6B7A', marginTop: 8, lineHeight: 1.6 }}>{o.message}</p>}
                    <div style={{ fontSize: 13.5, color: '#0F2540', fontWeight: 700, marginTop: 10 }}>연락처 · {o.contact}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Center({ children }) {
  return <div style={{ ...card, textAlign: 'center', padding: '48px 28px' }}>{children}</div>
}

const wrap = { position: 'fixed', inset: 0, zIndex: 90, background: '#FBFAF8', overflowY: 'auto' }
const topbar = { position: 'sticky', top: 0, zIndex: 5, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #EAEDF0' }
const backBtn = { cursor: 'pointer', fontSize: 14.5, fontWeight: 700, color: '#0F2540', background: '#fff', border: '1px solid #DCE1E6', borderRadius: 999, padding: '8px 16px', fontFamily: 'inherit' }
const card = { background: '#fff', border: '1px solid #EAEDF0', borderRadius: 18, padding: '26px 28px' }
const fieldChip = { fontSize: 13, fontWeight: 700, color: '#E8623D', background: '#FDEBE4', padding: '5px 12px', borderRadius: 999 }
const statusChip = { fontSize: 12.5, fontWeight: 700, padding: '5px 11px', borderRadius: 999 }
const scoreBox = { flexShrink: 0, textAlign: 'center', background: '#0F2540', color: '#fff', borderRadius: 16, padding: '14px 22px', minWidth: 110 }
const skillTag = { fontSize: 13, fontWeight: 600, color: '#5C6B7A', background: '#F2F4F6', padding: '5px 12px', borderRadius: 8 }
const link = { fontSize: 14, fontWeight: 700, color: '#0F2540', textDecoration: 'none', borderBottom: '1.5px solid #FDEBE4' }
const notice = { marginTop: 18, fontSize: 13.5, color: '#5C6B7A', background: '#FBFAF8', border: '1px solid #F0EEEA', borderRadius: 12, padding: '12px 14px', lineHeight: 1.6 }
const primaryBtn = { cursor: 'pointer', fontSize: 15, fontWeight: 700, padding: '12px 24px', borderRadius: 12, border: 'none', background: '#E8623D', color: '#fff', fontFamily: 'inherit' }
const googleBtn = { cursor: 'pointer', fontSize: 15, fontWeight: 700, padding: '13px', borderRadius: 12, border: '1px solid #DCE1E6', background: '#fff', color: '#0F2540', fontFamily: 'inherit' }
const kakaoBtn = { cursor: 'pointer', fontSize: 15, fontWeight: 700, padding: '13px', borderRadius: 12, border: 'none', background: '#FEE500', color: '#191600', fontFamily: 'inherit' }
