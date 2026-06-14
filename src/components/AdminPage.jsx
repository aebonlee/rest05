import { SpoolRow, BrandPalette } from './BrandPalette'

// 관리자/제작 가이드 페이지 — 제작 의도 + 브랜드 시그니처 + 컬러 팔레트.
// (메인에는 노출하지 않고, 푸터의 '제작 의도' 링크로 진입)

export default function AdminPage({ onBack }) {
  return (
    <div style={wrap}>
      <header style={topbar}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 28px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={backBtn}>← 홈으로</button>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#0F2540' }}>제작 의도 · 디자인 가이드</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#E8623D' }}>관리자</span>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 28px 80px' }}>
        {/* 제작 의도 */}
        <section style={card}>
          <span style={eyebrow}>제작 의도</span>
          <h2 style={h2}>왜 이렇게 만들었나</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
            <Intent title="역(逆)채용 — 기업이 먼저 찾아온다"
              body="취업준비생이 지원서를 쓰는 대신, 검증된 실력을 펼쳐두면 기업이 먼저 채용을 제안하는 구조. 학생 개인을 '홍보'하는 것이 핵심 목표." />
            <Intent title="공정·객관 인증 점수"
              body="학력·자격·경력·포트폴리오·역량평가 5개 축을 모두 동일한 배점으로 평가. AI 역량평가(다양한 질문·공정 채점)와 증빙서류로 객관성을 확보하고, 검토 후 인증을 확정." />
            <Intent title="실타래 = 연결의 상징"
              body="실 한 가닥이 사람과 기업을 잇는다는 의미. 스크롤을 내리면 실타래에서 실선이 풀려 각 섹션을 잇는 인터랙션이 브랜드 메타포의 핵심." />
            <Intent title="AI 챗봇 2종"
              body="취준생 코치(이력서·자소서·상담)와 기업 인재추천(직무 파악·매칭). OpenAI 키는 챗봇과 역량평가 양쪽에 사용되며 Edge Function 시크릿에만 보관." />
          </div>
        </section>

        {/* 브랜드 실타래 */}
        <section style={{ ...card, marginTop: 20 }}>
          <span style={eyebrow}>BRAND · 실타래</span>
          <h2 style={h2}>시그니처 실타래</h2>
          <p style={desc}>코드로 직접 그린 SVG라 PNG 없이도 선명하고 색상 변형이 자유롭다. (히어로는 딥 네이비 적용)</p>
          <div style={{ marginTop: 18 }}><SpoolRow size={104} /></div>
        </section>

        {/* 컬러 팔레트 */}
        <section style={{ ...card, marginTop: 20 }}>
          <span style={eyebrow}>BRAND COLORS</span>
          <h2 style={h2}>컬러 팔레트</h2>
          <p style={desc}>메인 · 보조(상태) · 배경/라인으로 구성된 확장 팔레트.</p>
          <div style={{ marginTop: 18 }}><BrandPalette /></div>
        </section>
      </div>
    </div>
  )
}

function Intent({ title, body }) {
  return (
    <div style={{ borderLeft: '3px solid #E8623D', paddingLeft: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: '#0F2540' }}>{title}</div>
      <p style={{ fontSize: 14.5, color: '#5C6B7A', marginTop: 6, lineHeight: 1.65 }}>{body}</p>
    </div>
  )
}

const wrap = { position: 'fixed', inset: 0, zIndex: 90, background: '#FBFAF8', overflowY: 'auto' }
const topbar = { position: 'sticky', top: 0, zIndex: 5, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #EAEDF0' }
const backBtn = { cursor: 'pointer', fontSize: 14.5, fontWeight: 700, color: '#0F2540', background: '#fff', border: '1px solid #DCE1E6', borderRadius: 999, padding: '8px 16px', fontFamily: 'inherit' }
const card = { background: '#fff', border: '1px solid #EAEDF0', borderRadius: 18, padding: '28px 30px' }
const eyebrow = { fontSize: 14, fontWeight: 700, color: '#E8623D', letterSpacing: '0.04em' }
const h2 = { fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em', marginTop: 8 }
const desc = { fontSize: 15, color: '#5C6B7A', lineHeight: 1.6, marginTop: 8 }
